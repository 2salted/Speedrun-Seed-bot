import { config } from "dotenv";
import { Client, IntentsBitField } from "discord.js";
import { registerCommands } from "./register-commands.js";
import fs from "fs";
const seedDataFilePath = 'seeds.json';
const userDataFilePath = 'user_seeds.json';

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

// Event handler for bot being ready
client.on("ready", () => {
  client.user.setActivity("/Help");
  console.log(`${client.user.tag} is online.`);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  if (commandName === "help") {
    const helpMessage = 
      "Here are the available commands:\n" +
      "/submit - Submit your amazing speedrunning seed. Usage: `/submit seed=<your seed> description=<your description>`\n" +
      "/request - Request a random seed.\n" +
      "/help - Display information about available commands.";

    try {
      await interaction.reply(helpMessage);
    } catch (error) {
      console.error('Error sending help message:', error);
    }
  }

  // Your existing code for seed submission
  if (interaction.commandName === "submit") {
    const seed = interaction.options.getString("seed");
    const description = interaction.options.getString("description");

    await interaction.reply(`${seed} with description "${description}" was successfully added`);

    // Read the existing seeds from the JSON file
    let seeds = [];
    try {
      seeds = JSON.parse(fs.readFileSync(seedDataFilePath, "utf8"));
    } catch (error) {
      console.error("Error reading seeds.json:", error);
    }

    // Add the submitted seed to the array
    seeds.push({ seed, description });

    // Write the updated seeds array back to the JSON file
    try {
      fs.writeFileSync(seedDataFilePath, JSON.stringify(seeds));
      console.log("Seed saved successfully.");
    } catch (error) {
      console.error("Error writing seeds.json:", error);
    }
  } else if (interaction.commandName === "request") {
    // Read the available seeds from the JSON file
    let seeds = [];
    try {
      seeds = JSON.parse(fs.readFileSync(seedDataFilePath, "utf8"));
    } catch (error) {
      console.error("Error reading seeds.json:", error);
    }

    // Read user data to determine which seeds the user has already received
    let userData = {};
    try {
      userData = JSON.parse(fs.readFileSync(userDataFilePath, "utf8"));
    } catch (error) {
      console.error("Error reading user_seeds.json:", error);
    }

    // Initialize user's seeds if not exist
    if (!userData[interaction.user.id]) {
      userData[interaction.user.id] = [];
    }

    // Filter seeds that the user hasn't received yet
    const availableSeeds = seeds.filter(seed => !userData[interaction.user.id].includes(seed.seed));

    // If there are available seeds
    if (availableSeeds.length > 0) {
      // Select a random seed
      const randomIndex = Math.floor(Math.random() * availableSeeds.length);
      const selectedSeed = availableSeeds[randomIndex];

      // Send the selected seed to the user
      await interaction.user.send(`Your random seed is: ${selectedSeed.seed} with description "${selectedSeed.description}"`);

      // Update user data to mark that the user has received this seed
      userData[interaction.user.id].push(selectedSeed.seed);
      try {
        fs.writeFileSync(userDataFilePath, JSON.stringify(userData));
        console.log("User seed data updated.");
      } catch (error) {
        console.error("Error writing user_seeds.json:", error);
      }

      // Inform the channel that the seed has been personally delivered
      await interaction.reply("A random seed has been personally delivered to you.");
    } else {
      // If no seeds are available
      await interaction.reply(`<@${interaction.user.id}> Sorry, all seeds have been used. Please submit more seeds.`);
    }
  }
});

client.login(process.env.TOKEN);
