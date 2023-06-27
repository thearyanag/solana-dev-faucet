const { SlashCommandBuilder } = require("discord.js");
const getUser = require("../../function/getUser");
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
    await interaction.reply({
      content: "Dropping devnet SOL to the provided address",
      ephemeral: true,
    });
    let recipientWalletAddress = interaction.options.getString("address");
    let amount = interaction.options.getInteger("amount");
    let user = await getUser(interaction.user.id);
    if(user.status == 503) {
      await interaction.editReply("You can only claim upto 50 SOL per day");
      return;
    } 
    if(user.amount + amount > 50) {
      await interaction.editReply("You can only claim upto 50 SOL per day");
      return;
    }
    let drop = await dropDevnetSol(recipientWalletAddress, amount);
    if (drop.status == 503) {
      await interaction.editReply(drop.message);
    } else {
      let user = await getUser(interaction.user.id, {
        amount,
        recipientWalletAddress,
        "date-time": new Date().toISOString(),
      });
      await interaction.editReply(
        `Dropped ${amount} SOL to ${recipientWalletAddress}. \n https://solscan.io/tx/${drop.signature}?cluster=devnet`
      );
    }
  },
};
