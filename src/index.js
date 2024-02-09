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

  if (commandName === "strongholdfinder") {
    const command1 = interaction.options.getString("firsteye");
    const command2 = interaction.options.getString("secondeye");

    // Extracting numbers from command1
    const numbers1 = command1.match(/-?\d+(\.\d+)?/g).map(Number);
    const x1 = numbers1[0];
    const y1 = numbers1[2];
    const f1 = numbers1[3];

    // Extracting numbers from command2
    const numbers2 = command2.match(/-?\d+(\.\d+)?/g).map(Number);
    const x2 = numbers2[0];
    const y2 = numbers2[2];
    const f2 = numbers2[3];

    // Calculate the intersection point
    const mathY1 = -y1;
    const mathY2 = -y2;
    const mathf1 = -(f1 + 90);
    const mathf2 = -(f2 + 90);
    const m1 = Math.tan(mathf1 * (Math.PI / 180));
    const m2 = Math.tan(mathf2 * (Math.PI / 180));
    const b1 = mathY1 - m1 * x1;
    const b2 = mathY2 - m2 * x2;
    const intersectionX = (b2 - b1) / (m1 - m2);
    const intersectionY = m1 * intersectionX + b1;

    const netherCoordsX = intersectionX / 8;
    const netherCoordsY = intersectionY / 8;

    // Calculate the distance between the intersection point and the starting point of the second Eye of Ender trajectory
    const blockDistance = Math.sqrt(
      Math.pow(intersectionX - x2, 2) + Math.pow(-intersectionY - y2, 2)
    );

    const netherBlockDistance = blockDistance / 8;

    const eyeOfEnderEmbed = new EmbedBuilder()
      .setTitle("Stronghold Triangulation Calculator")
      .setColor(0x0f5132)
      .setThumbnail(client.user.displayAvatarURL())
      .addFields({
        name:
          `Overworld Coords: (x = ${intersectionX.toFixed(
            0
          )}   z = ${-intersectionY.toFixed(0)}) \n` +
          `Nether Coords: (x = ${netherCoordsX.toFixed(
            0
          )}   z = ${-netherCoordsY.toFixed(0)})`,
        value:
          `Overworld: (${blockDistance.toFixed(0)} Blocks) \n` +
          `Nether: (${netherBlockDistance.toFixed(0)} Blocks) \n`,
      });

    // Send the calculated result back to the user
    interaction.reply({ embeds: [eyeOfEnderEmbed] });
  }

  if (interaction.commandName === "help") {
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
            "/submit command allows user the enter amazing speedrunning seeds with a small description of that seed",
        },
        {
          name: "/request command",
          value:
            "/request command will randomly pick a seed from the database and DM it to you, " +
            "ensuring no one else can use it without using the bot first",
        },
        {
          name: "/help command",
          value:
            "this command will give you more information on how the bot works and how to use the commands properly!",
        }
      );

    // Send the embed with a local file attachment (replace 'thumbnail.png' with your file name)
    interaction.reply({ embeds: [embed] });
  }

  if (interaction.commandName === "helpstrongholdfinder") {
    const strongholdEmbed = new EmbedBuilder()
      .setTitle("How does the stronghold finder work?")
      .addFields({
        name:
          "To properly use the /strongholdfinder command you have to first" +
          "line up your ender eye with your cursor. When your ready press (f3 + C) inside of Minecraft.\n" +
          "Open discord and call the /strongholdfinder command, then paste  "
      });

    interaction.reply({ embeds: [strongholdEmbed] });
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
        `<@${interaction.user.id}> Sorry, all seeds have been used. Please submit more seeds.`
      );
    }
  }
});

client.login(process.env.TOKEN);
