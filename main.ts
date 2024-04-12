import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  NonceAccount,
  NONCE_ACCOUNT_LENGTH,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import {
  encodeAndWriteTransaction,
  loadWallet,
  readAndDecodeTransaction,
} from "./utils";

const TRANSFER_AMOUNT = LAMPORTS_PER_SOL * 0.01;
const NONCE_AUTH_KEYPAIR = loadWallet("./wallets/nonceAuth.json");
const NONCE_KEYPAIR = Keypair.generate();
const SENDER_KEYPAIR = loadWallet("./wallets/wallet.json");
const CONNECTION = new Connection(
  "https://devnet.helius-rpc.com/?api-key=<api-key>"
);
const WAIT_TIME = 120000;

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

