const {  Connection , PublicKey } = require("@solana/web3.js");

const connection = new Connection("https://api.devnet.solana.com");

const getBalance = async (publicKey) => {
  const balance = await connection.getBalance(publicKey);
  return balance / 1000000000;
};

module.exports = getBalance;
