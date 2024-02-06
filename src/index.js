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

  
  updateStatus();

  
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

  const { commandName } = interaction;

  if (commandName === "help") {
    const helpMessage =
      `<@${interaction.user.id}> \n` +
      "Here are the available commands:\n" +
      "/submit - Submit your amazing speedrunning seed. Usage: `/submit seed=<your seed> description=<your description>`\n" +
      "/request - Request a random seed.\n" +
      "/help - Display information about available commands.";

    try {
      await interaction.reply(helpMessage);
    } catch (error) {
      console.error("Error sending help message:", error);
    }
  }

 
  if (interaction.commandName === "submit") {
    const seed = interaction.options.getString("seed");
    const description = interaction.options.getString("description");

    // Check if the seed has already been submitted
    let seeds = [];
    try {
      seeds = JSON.parse(fs.readFileSync(seedDataFilePath, "utf8"));
    } catch (error) {
      console.error("Error reading seeds.json:", error);
    }

    if (seeds.some((existingSeed) => existingSeed.seed === seed)) {
      await interaction.reply("This seed has already been submitted.");
      return;
    }

  
    seeds.push({ seed, description });

   
    try {
      fs.writeFileSync(seedDataFilePath, JSON.stringify(seeds));
      console.log("Seed saved successfully.");
      await interaction.reply("Your seed has been successfully added!");
    } catch (error) {
      console.error("Error writing seeds.json:", error);
      await interaction.reply("There was an error adding your seed.");
    }
  } else if (interaction.commandName === "request") {
    let seeds = [];
    try {
      seeds = JSON.parse(fs.readFileSync(seedDataFilePath, "utf8"));
    } catch (error) {
      console.error("Error reading seeds.json:", error);
    }

    
    let userData = {};
    try {
      userData = JSON.parse(fs.readFileSync(userDataFilePath, "utf8"));
    } catch (error) {
      console.error("Error reading user_seeds.json:", error);
    }

   
    if (!userData[interaction.user.id]) {
      userData[interaction.user.id] = [];
    }

    
    const availableSeeds = seeds.filter(
      (seed) => !userData[interaction.user.id].includes(seed.seed)
    );

    
    if (availableSeeds.length > 0) {
      
      const randomIndex = Math.floor(Math.random() * availableSeeds.length);
      const selectedSeed = availableSeeds[randomIndex];

      
      await interaction.user.send(
        `Your random seed is: ${selectedSeed.seed} with description "${selectedSeed.description}"`
      );

     
      userData[interaction.user.id].push(selectedSeed.seed);
      try {
        fs.writeFileSync(userDataFilePath, JSON.stringify(userData));
        console.log("User seed data updated.");
      } catch (error) {
        console.error("Error writing user_seeds.json:", error);
      }

      
      await interaction.reply(
        "A random seed has been personally delivered to you."
      );
    } else {
     
      await interaction.reply(
        `<@${interaction.user.id}> Sorry, you have either used up all the seeds or there are no available seeds! for more info use /help`
      );
    }
  }
});

client.login(process.env.TOKEN);
