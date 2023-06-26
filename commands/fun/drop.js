const { SlashCommandBuilder } = require("discord.js");
const dropDevnetSol = require("../../function/dropDevnetSol");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("drop")
    .setDescription("Drops devnet SOL to the provided address")
    .addStringOption((option) =>
      option
        .setName("address")
        .setDescription("Wallet address")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("Amount of SOL to drop [please use carefully]")
        .setRequired(true)
    ),
  async execute(interaction) {
    await interaction.reply("Dropping devnet SOL to the provided address");
    let recipientWalletAddress = interaction.options.getString("address");
    let amount = interaction.options.getInteger("amount");
    if(amount > 50 ) {
      await interaction.editReply("Amount too high, please use carefully");
      return;
    }
    let drop = await dropDevnetSol(recipientWalletAddress, amount);
    if (drop.status == 503) {
      await interaction.editReply(drop.message);
    } else {
      await interaction.editReply(
        `Dropped ${amount} SOL to ${recipientWalletAddress}. \n https://solscan.io/tx/${drop.signature}?cluster=devnet`
      );
    }
  },
};
