const {
  Client,
  GatewayIntentBits,
  Events,
  SlashCommandBuilder,
  Collection,
} = require("discord.js");
const client = new Client({
  intents: [
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
  ],
});
const dropDevnetSol = require("./function/dropDevnetSol");
const dotenv = require("dotenv");
dotenv.config();

client.commands = new Collection();

client.commands.set("ping", {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with Pong!"),
  async execute(interaction) {
    await interaction.reply({
      content: "Pong!",
      ephemeral: true,
    });
  },
});

client.commands.set("drop", {
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
        .setDescription("Amount of SOL to drop")
        .setRequired(true)
    ),
  async execute(interaction) {
    await interaction.reply({
      content: "Dropping devnet SOL to the provided address",
      ephemeral: true,
    });
    let recipientWalletAddress = interaction.options.getString("address");
    let amount = interaction.options.getInteger("amount");
    if (amount > 50) {
      await interaction.editReply("Amount too high, please use carefully");
      return;
    }
    let drop = await dropDevnetSol(recipientWalletAddress, amount);
    if (drop.status == 503) {
      await interaction.editReply(drop.message);
    } else {
      await interaction.editReply(
        `Dropped ${amount} SOL to ${recipientWalletAddress}. \n https://solscan.io/tx/${drop.signature}?cluster=devnet`      );
    }
  },
});

client.on(Events.InteractionCreate, async (interaction) => {
  console.log(interaction);

  if (!interaction.isChatInputCommand()) return;
  console.log("is command");

  let command = interaction.client.commands.get(interaction.commandName);
  await command.execute(interaction);
});

client.on(Events.ClientReady, () => {
  console.log("I am ready!");
});

client.login(process.env.BOT_TOKEN);
