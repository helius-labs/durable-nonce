import { Connection, TransactionInstruction, PublicKey, Signer, TransactionMessage, VersionedTransaction } from "@solana/web3.js";

export async function sendVersionedTx(
    connection: Connection,
    instructions: TransactionInstruction[],
    payer: PublicKey,
    signers: Signer[]
  ) {
    let latestBlockhash = await connection.getLatestBlockhash();
    const message = new TransactionMessage({
      payerKey: payer,
      recentBlockhash: latestBlockhash.blockhash,
      instructions,
    }).compileToLegacyMessage();
    const transaction = new VersionedTransaction(message);
    transaction.sign(signers);
    const signature = await connection.sendTransaction(transaction);
    return signature;
  }