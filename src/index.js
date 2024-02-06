import { config } from "dotenv";
import { Client, IntentsBitField, ActivityType } from "discord.js";
import { registerCommands } from "./register-commands.js";
import fs from "fs";
const seedDataFilePath = "seeds.json";
const userDataFilePath = "user_seeds.json";

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

client.once("ready", () => {
  console.log(`${client.user.tag} is online.`);

  // Update the status initially
  updateStatus();

  // Update the status every 10 minutes (in milliseconds)
  setInterval(updateStatus, 10 * 1000);
});

async function updateStatus() {
  // Read the seeds data from the JSON file
  let seeds = [];
  try {
    seeds = JSON.parse(fs.readFileSync(seedDataFilePath, "utf8"));
  } catch (error) {
    console.error("Error reading seeds.json:", error);
  }

  // Set the bot's activity to "Watching <number of seeds> seeds"
  client.user.setActivity({
    name: `${seeds.length} seeds`,
    type: ActivityType.Watching,
  });
}

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
};

client.login(process.env.TOKEN);
