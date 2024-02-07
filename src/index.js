import { config } from "dotenv";
import {
  Client,
  IntentsBitField,
  ActivityType,
  EmbedBuilder,
} from "discord.js";
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

  const { commandName } = interaction;

  if (commandName === "strongholdcalc") {
    const x = interaction.options.getNumber("x");
    const y = interaction.options.getNumber("y");
    const f = interaction.options.getNumber("f");
    const x2 = interaction.options.getNumber("x2");
    const y2 = interaction.options.getNumber("y2");
    const f2 = interaction.options.getNumber("f2");

    // Calculate the intersection point
    const mathY = -y;
    const mathY2 = -y2;
    const mathf = -(f + 90);
    const mathf2 = -(f2 + 90);
    const m1 = Math.tan(mathf * (Math.PI / 180));
    const m2 = Math.tan(mathf2 * (Math.PI / 180));
    const b1 = mathY - m1 * x;
    const b2 = mathY2 - m2 * x2;
    const intersectionX = (b2 - b1) / (m1 - m2);
    const intersectionY = m1 * intersectionX + b1;

    // Send the calculated result back to the user
    await interaction.reply(`Intersection Point: (${intersectionX.toFixed(2)}, ${-intersectionY.toFixed(2)})`);
  }

  if (commandName === "help") {
    const embed = new EmbedBuilder()
      .setTitle("SpeedrunSeeds Bot Help Alpha 1.5.0")
      .setDescription(
        "Here's a list with all the info about SpeedrunSeeds bot! for any questions or inquiries add salted.js on discord"
      )
      .setColor(0x0f5132)
      .setThumbnail(client.user.displayAvatarURL())
      .addFields(
        {
          name: "/submit command",
          value:
            "/submit allows users to submit the best speedrunning seeds that they have come across, which is then stored in our seed database!" +
            " SpeedrunSeeds bot also makes sure that you won't get your own seeds when using the /request command",
        },
        {
          name: "/request command",
          value:
            "/request allows users to receive a random seed from the seed database and makes sure to never give that user the same seed twice",
        }
      );

    // Send the embed with a local file attachment (replace 'thumbnail.png' with your file name)
    interaction.reply({ embeds: [embed] });
  }

  // Your existing code for seed submission
  if (interaction.commandName === "submit") {
    const seed = interaction.options.getString("seed");
    const description = interaction.options.getString("description");
    const submitterId = interaction.user.id;

    // Read the existing seeds from the JSON file
    let seeds = [];
    try {
      seeds = JSON.parse(fs.readFileSync(seedDataFilePath, "utf8"));
    } catch (error) {
      console.error("Error reading seeds.json:", error);
    }

    // Check if the submitted seed already exists in the seeds.json file
    const seedExists = seeds.some((s) => s.seed === seed);

    if (seedExists) {
      await interaction.reply("This seed is already in the database.");
      return;
    }

    // Proceed with adding the seed if it doesn't exist
    await interaction.reply(`Seed was successfully added!`);

    // Add the submitted seed to the array
    seeds.push({ seed, description });

    // Write the updated seeds array back to the JSON file
    try {
      fs.writeFileSync(seedDataFilePath, JSON.stringify(seeds));
      console.log("Seed saved successfully.");
    } catch (error) {
      console.error("Error writing seeds.json:", error);
    }

    let userData = {};
    try {
      userData = JSON.parse(fs.readFileSync(userDataFilePath, "utf8"));
    } catch (error) {
      console.error("Error reading user_seeds.json:", error);
    }

    // Initialize user's seeds if not exist
    if (!userData[submitterId]) {
      userData[submitterId] = [];
    }

    // Add the submitted seed to the user's submitted seeds array
    userData[submitterId].push(seed);

    // Write the updated user data back to the JSON file
    try {
      fs.writeFileSync(userDataFilePath, JSON.stringify(userData));
      console.log("User seed data updated.");
    } catch (error) {
      console.error("Error writing user_seeds.json:", error);
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
    const availableSeeds = seeds.filter(
      (seed) => !userData[interaction.user.id].includes(seed.seed)
    );

    // If there are available seeds
    if (availableSeeds.length > 0) {
      // Select a random seed
      const randomIndex = Math.floor(Math.random() * availableSeeds.length);
      const selectedSeed = availableSeeds[randomIndex];

      // Send the selected seed to the user
      await interaction.user.send(
        `Your random seed is: ${selectedSeed.seed} with description "${selectedSeed.description}"`
      );

      // Update user data to mark that the user has received this seed
      userData[interaction.user.id].push(selectedSeed.seed);
      try {
        fs.writeFileSync(userDataFilePath, JSON.stringify(userData));
        console.log("User seed data updated.");
      } catch (error) {
        console.error("Error writing user_seeds.json:", error);
      }

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
