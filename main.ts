import {
    Connection,
    Keypair,
    LAMPORTS_PER_SOL,
    NonceAccount,
    NONCE_ACCOUNT_LENGTH,
    SystemProgram,
    Transaction,
} from "@solana/web3.js";
import { encode, decode } from 'bs58';
import { sendVersionedTx } from './utils'
import fs from 'fs';

const RPC_URL = 'http://127.0.0.1:8899';
const TRANSFER_AMOUNT = LAMPORTS_PER_SOL * 0.01;

async function performSolanaTransfer(useNonce = false, waitTime = 120000) {
    const nonceAuthKeypair = Keypair.generate();
    const nonceKeypair = Keypair.generate();
    const payer = Keypair.generate();
    const connection = new Connection(RPC_URL);

    // Helper Functions
    const fetchNonceInfo = async () => {
        const accountInfo = await connection.getAccountInfo(nonceKeypair.publicKey);
        if (!accountInfo) throw new Error("No account info found");
        return NonceAccount.fromAccountData(accountInfo.data);
    };

    const encodeAndWriteTransaction = async (tx: Transaction, filename: string, requireAllSignatures = true) => {
        const serialisedTx = encode(tx.serialize({ requireAllSignatures }));
        fs.writeFileSync(filename, serialisedTx);
        return serialisedTx;
    };

    const readAndDecodeTransaction = async (filename: string) => {
        const transactionData = fs.readFileSync(filename, 'utf-8');
        const decodedData = decode(transactionData);
        return Transaction.from(decodedData);
    };

    // Core logic
    try {
        // Step 1: Fund Accounts
        const accountsToFund = [nonceAuthKeypair, payer];
        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
        await Promise.all(
            accountsToFund.map(account => connection.requestAirdrop(account.publicKey, LAMPORTS_PER_SOL))
        );
        await Promise.all(
            accountsToFund.map(account => connection.confirmTransaction({ signature: account.publicKey.toBase58(), blockhash, lastValidBlockHeight }, 'finalized'))
        );

        // Step 2: Create the Nonce Account
        const rent = await connection.getMinimumBalanceForRentExemption(NONCE_ACCOUNT_LENGTH);
        const createNonceTx = [
                SystemProgram.createAccount({
                    fromPubkey: nonceAuthKeypair.publicKey,
                    newAccountPubkey: nonceKeypair.publicKey,
                    lamports: rent,
                    space: NONCE_ACCOUNT_LENGTH,
                    programId: SystemProgram.programId,
                }),
                SystemProgram.nonceInitialize({
                    noncePubkey: nonceKeypair.publicKey,
                    authorizedPubkey: nonceAuthKeypair.publicKey,
                })
        ]
        const tx =  await sendVersionedTx(connection, createNonceTx, payer.publicKey, [nonceAuthKeypair, nonceKeypair]);

        // Step 3: Create a Transaction
        const destination = Keypair.generate();
        const transaction = [
            SystemProgram.transfer({
                fromPubkey: payer.publicKey,
                toPubkey: destination.publicKey,
                lamports: TRANSFER_AMOUNT,
            })
        ]
        if (useNonce) {
            transaction.recentBlockhash = (await fetchNonceInfo()).nonce;
        } else {
            transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
        }
        transaction.feePayer = payer.publicKey;
        encodeAndWriteTransaction(transaction, './unsigned.json', false);

        // Step 4: Sign the Transaction Offline
        await new Promise(resolve => setTimeout(resolve, waitTime));
        const unsignedTx = await readAndDecodeTransaction('./unsigned.json');
        if (useNonce) {
            unsignedTx.sign(nonceAuthKeypair, payer);
        } else {
            unsignedTx.sign(payer);
        }        encodeAndWriteTransaction(unsignedTx, './signed.json');

        // Step 5: Execute the Transaction
        const signedTx = await readAndDecodeTransaction('./signed.json');
        const txId = await sendVersionedTx(connection, unsignedTx, payer.publicKey, []);
        console.log("Transaction ID:", txId);

    } catch (error) {
        console.error(error);
    }
}
