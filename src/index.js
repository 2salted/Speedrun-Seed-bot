import { config } from "dotenv";
import { Client, IntentsBitField } from "discord.js";
import { registerCommands } from "./register-commands.js";
import fs from "fs";

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
    const seed = interaction.options.getString('seed');
    await interaction.reply(`${seed} was successfully added`);

    // Read the existing seeds from the JSON file
    let seeds = [];
    try {
      seeds = JSON.parse(fs.readFileSync('seeds.json', 'utf8'));
    } catch (error) {
      console.error('Error reading seeds.json:', error);
    }

    // Add the submitted seed to the array
    seeds.push(seed);

    // Write the updated seeds array back to the JSON file
    try {
      fs.writeFileSync('seeds.json', JSON.stringify(seeds));
      console.log('Seed saved successfully.');
    } catch (error) {
      console.error('Error writing seeds.json:', error);
    }
  }
});

client.login(process.env.TOKEN);