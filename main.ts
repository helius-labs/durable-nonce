
import * as web3 from "@solana/web3.js";
import { Helius } from "helius-sdk";

import { encodeAndWriteTransaction, loadWallet, readAndDecodeTransaction } from "./utils";

// The URL of the default Solana cluster (devnet)
const { connection } = new Helius("https://devnet.helius-rpc.com/?api-key=<api-key>");
// The number of SOL we will transfer in our sample transaction
const TRANSFER_AMNT = web3.LAMPORTS_PER_SOL * 0.01;
// The amount of time before we send the Durable Nonce transaction
const DELAY = 120_000;

// The keypair for the nonce account
const NONCE_KEYPAIR = web3.Keypair.generate();
// The keypair for the nonce authority account
const NONCE_AUTH_KEYPAIR = loadWallet("./wallets/nonceAuth.json");
// The keypair for the sender account
const SENDER_KEYPAIR = loadWallet("./wallets/sender.json");

async function sendTransaction() {
  console.log("Starting Nonce Transaction")

  try {
    const nonceCreationTxSig = await createNonce();
    const confirmationStatus = await connection.confirmTransaction(nonceCreationTxSig);

    if (!confirmationStatus.value.err) {
      console.log("Nonce account creation confirmed.");

      const nonceAccount = await fetchNonceInfo();
      await createTransaction(nonceAccount?.nonce);
      await signOffline(DELAY);
      await executeTransaction();
    } else {
      console.error("Nonce account creation transaction failed:", confirmationStatus.value.err);
    }
  } catch (error) {
    console.error(error);
  }
};

const createNonce = async () => {
  // Calculate the rent for rent exemption
  const rent = await connection.getMinimumBalanceForRentExemption(web3.NONCE_ACCOUNT_LENGTH);

  // Fetch the latest blockhash
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();

  // Initialize the transaction
  const tx = new web3.Transaction();
  tx.feePayer = NONCE_AUTH_KEYPAIR.publicKey;
  tx.recentBlockhash = blockhash;
  tx.lastValidBlockHeight = lastValidBlockHeight;

  // Add instructions to the transaction
  tx.add(
    // Create the nonce account
    web3.SystemProgram.createAccount({
      fromPubkey: NONCE_AUTH_KEYPAIR.publicKey,
      newAccountPubkey: NONCE_KEYPAIR.publicKey,
      lamports: rent,
      space: web3.NONCE_ACCOUNT_LENGTH,
      programId: web3.SystemProgram.programId
    }),
    // Initialize the nonce account state
    web3.SystemProgram.nonceInitialize({
      noncePubkey: NONCE_KEYPAIR.publicKey,
      authorizedPubkey: NONCE_AUTH_KEYPAIR.publicKey
    })
  );

  // Sign the transaction
  tx.sign(NONCE_KEYPAIR, NONCE_AUTH_KEYPAIR);

  // Send the transaction
  try {
    const signature = await connection.sendRawTransaction(tx.serialize());
    await connection.confirmTransaction({
      signature,
      blockhash,
      lastValidBlockHeight
    });
  } catch (error) {
    throw error;
  }
};

const createTransaction = async (nonce) => {
  const destination = web3.Keypair.generate();

  const advanceNonceIx = web3.SystemProgram.nonceAdvance({
    noncePubkey: NONCE_KEYPAIR.publicKey,
    authorizedPubkey: NONCE_AUTH_KEYPAIR.publicKey
  });

  const transferIx = web3.SystemProgram.transfer({
    fromPubkey: SENDER_KEYPAIR.publicKey,
    toPubkey: destination.publicKey,
    lamports: TRANSFER_AMNT,
  });

  const sampleTx = new web3.Transaction();
  sampleTx.add(advanceNonceIx, transferIx);
  sampleTx.recentBlockhash = nonce; // Use the nonce fetched earlier
  sampleTx.feePayer = SENDER_KEYPAIR.publicKey;

  const serialisedTx = encodeAndWriteTransaction(sampleTx, "./unsignedTxn.json", false);
  return serialisedTx;
};
const signOffline = async (waitTime = DELAY) => {
  await new Promise((resolve) => setTimeout(resolve, waitTime));
  const unsignedTx = readAndDecodeTransaction("./unsigned.json");
  unsignedTx.sign(SENDER_KEYPAIR, NONCE_AUTH_KEYPAIR); // Sign with both keys
  const serialisedTx = encodeAndWriteTransaction(unsignedTx, "./signed.json");
  return serialisedTx;
}

const executeTransaction = async () => {
  const signedTx = await readAndDecodeTransaction("./signedTxn.json");
  const sig = await connection.sendRawTransaction(signedTx.serialize());
  console.log("Tx sent: ", sig);
}

const fetchNonceInfo = async (retries = 3) => {
  while (retries > 0) {
    // Query the nonce account's info
    const { publicKey } = NONCE_KEYPAIR;
    const accountInfo = await connection.getAccountInfo(publicKey);

    retries -= 1;

    if (retries > 0) {
      console.log(`Retry fetching nonce in 3 seconds. ${retries} retries left.`);
      await new Promise(res => setTimeout(res, 3000)); // wait for 3 seconds
    }

    // Check that the nonce account exists and return the data
    if (!accountInfo) throw new Error("Nonce account does not exist");
    return web3.NonceAccount.fromAccountData(accountInfo.data);
  }
};

sendTransaction();
