// utils.ts
import { decode, encode } from 'bs58';
import fs from 'fs';
import { Transaction } from "@solana/web3.js";
import { Keypair } from '@solana/web3.js';

export function encodeAndWriteTransaction(tx: Transaction, filename: string, requireAllSignatures = true): string {
    const serialisedTx = encode(tx.serialize({ requireAllSignatures }));
    fs.writeFileSync(filename, serialisedTx);
    console.log(`      Tx written to ${filename}`);
    return serialisedTx;
}

export function readAndDecodeTransaction(filename: string): Transaction {
    const transactionData = fs.readFileSync(filename, 'utf-8');
    const decodedData = decode(transactionData);
    const transaction = Transaction.from(decodedData);
    return transaction;
}
export function loadWallet(kFile: string): Keypair {
    const fs = require("fs");
    return Keypair.fromSecretKey(
      new Uint8Array(JSON.parse(fs.readFileSync(kFile).toString()))
    );
  }

