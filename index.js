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
const db = require("./db/client");
const getUser = require("./function/getUser");
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

    if (amount > 25) {
      await interaction.editReply(
        "Amount too high (<25), please use carefully"
      );
      return;
    }

    let user = await getUser(interaction.user.id);
    if (user.status == 503) {
      await interaction.editReply("You can only claim upto 25 SOL per day");
      return;
    }

    if (user.amount + amount > 50) {
      await interaction.editReply("You can only claim upto 25 SOL per day");
      return;
    }

    let drop = await dropDevnetSol(recipientWalletAddress, amount);

    if (drop.status == 503) {
      await interaction.editReply(drop.message);
    } else {
      await getUser(interaction.user.id, {
        amount,
        recipientWalletAddress,
        "date-time": new Date().toISOString(),
      });

      await interaction.editReply(
        `Dropped ${amount} SOL to ${recipientWalletAddress}. \n https://solscan.io/tx/${drop.signature}?cluster=devnet`
      );
    }
  },
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  let command = interaction.client.commands.get(interaction.commandName);
  await command.execute(interaction);
});

client.on(Events.ClientReady, () => {
  console.log("I am ready!");
});

client.login(process.env.BOT_TOKEN);
