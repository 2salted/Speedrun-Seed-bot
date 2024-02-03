import { config } from "dotenv";
import { Client, IntentsBitField } from "discord.js";
import mongoose from "mongoose";
import { registerCommands } from "./register-commands.js";

config();
registerCommands();

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

client.on("ready", (c) => {
  console.log(`${c.user.tag} is online.`);
});

client.on("messageCreate", (message) => {
  if (message.author.bot) {
    return;
  }

  if (message.content === "hello") {
    message.reply("hello");
  }
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "submit") {
    const seed = interaction.options.getString('seed')
    await interaction.reply(`your seed was: ${seed}`);
  }
});

  try {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to DB");
} catch (error) {
  console.log(`Error: ${error}`);
}

client.login(process.env.TOKEN);
