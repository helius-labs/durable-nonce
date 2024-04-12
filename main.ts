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
  // Code goes here for the function
}

async function createNonce() {
  // Code goes here for the function
}

async function createTransaction(nonce) {
  // Code goes here for the function
}

async function signOffline(waitTime = WAIT_TIME) {
  // Code goes here for the function
}

async function executeTransaction() {
  // Code goes here for the function
}

async function fetchNonceInfo(retries = 3) {
  // Code goes here for the function
}

sendTransaction();

