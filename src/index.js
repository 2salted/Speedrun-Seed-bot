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

// Event handler for bot being ready
client.on("ready", () => {
  client.user.setActivity("Speedrun seeds");
  console.log(`${client.user.tag} is online.`);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  // Your existing code for seed submission
  if (interaction.commandName === "submit") {
    const seed = interaction.options.getString("seed");
    await interaction.reply(`${seed} was successfully added`);

    // Read the existing seeds from the JSON file
    let seeds = [];
    try {
      seeds = JSON.parse(fs.readFileSync("seeds.json", "utf8"));
    } catch (error) {
      console.error("Error reading seeds.json:", error);
    }

    // Add the submitted seed to the array
    seeds.push(seed);

    // Write the updated seeds array back to the JSON file
    try {
      fs.writeFileSync("seeds.json", JSON.stringify(seeds));
      console.log("Seed saved successfully.");
    } catch (error) {
      console.error("Error writing seeds.json:", error);
    }
  } else if (interaction.commandName === "request") {
    // Read the available seeds from the JSON file
    let seeds = [];
    try {
      seeds = JSON.parse(fs.readFileSync("seeds.json", "utf8"));
    } catch (error) {
      console.error("Error reading seeds.json:", error);
    }

    // If there are available seeds
    if (seeds.length > 0) {
      // Select a random seed
      const randomIndex = Math.floor(Math.random() * seeds.length);
      const selectedSeed = seeds[randomIndex];

      // Send the selected seed to the user
      await interaction.user.send(`Your random seed is: ${selectedSeed}`);

      // Inform the channel that the seed has been personally delivered
      await interaction.reply(
        "A random seed has been personally delivered to you."
      );
    } else {
      // If no seeds are available
      await interaction.reply(
        `<@${interaction.user.id}> Sorry, all seeds have been used. Please submit more seeds.`
      );
    }
  }
});

client.login(process.env.TOKEN);
