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

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName, options } = interaction; // Define the options variable here

  if (commandName === "submit") {
    // Extract seed and description from options
    const seedOption = options.getString("seed");
    const descriptionOption = options.getString("description");

    // Check if both seed and description are provided
    if (!seedOption || !descriptionOption) {
      await interaction.reply("Please provide both seed and description.");
      return;
    }

    // Read the seeds data from the JSON file
    let seeds = [];
    try {
      seeds = JSON.parse(fs.readFileSync(seedDataFilePath, "utf8"));
    } catch (error) {
      console.error("Error reading seeds.json:", error);
    }

    // Add the submitted seed to the seeds array
    seeds.push({ seed: seedOption, description: descriptionOption });

    // Write the updated seeds array back to the JSON file
    fs.writeFileSync(seedDataFilePath, JSON.stringify(seeds, null, 2));

    await interaction.reply("Seed submitted successfully!");
  }
});

client.login(process.env.TOKEN);
