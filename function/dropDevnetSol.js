const {
  Connection,
  PublicKey,
  Keypair,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
} = require("@solana/web3.js");
const base58 = require("bs58");
const dotenv = require("dotenv");
dotenv.config();

let connection = new Connection("https://api.devnet.solana.com", "confirmed");
let privateKeyString = process.env.SOLANA_PRIVATE_KEY;

let secret = new Uint8Array(base58.decode(privateKeyString));
let senderWallet = Keypair.fromSecretKey(secret);

/**
 * To transfer a token from one wallet to another
 * @returns {Promise<{signature: string}>}
 */
async function dropDevnetSol(recipientWalletAddress, amount) {
  let to;
  try {
    to = new PublicKey(recipientWalletAddress);
  } catch (error) {
    return {
      status: 503,
      message: "Invalid address",
    };
  }

  try {
    let transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: senderWallet.publicKey,
        toPubkey: to,
        lamports: LAMPORTS_PER_SOL * amount,
      })
    );

    let signature = await sendAndConfirmTransaction(connection, transaction, [
      senderWallet,
    ]);

    let transfer_trx = signature;
    console.log(transfer_trx);
    return {
      signature: transfer_trx,
    };
  } catch (error) {
    return {
      status: 503,
      message: "Insufficient balance, please ping 0xaryan to refil the faucet",
    };
  }
}

module.exports = dropDevnetSol;
