const {  Connection , PublicKey } = require("@solana/web3.js");

const connection = new Connection("https://devnet.helius-rpc.com/?api-key=9dd22d4f-02c8-4c19-9f61-1399587b0626");

const getBalance = async (publicKey) => {
  const balance = await connection.getBalance(publicKey);
  return balance / 1000000000;
};

module.exports = getBalance;
