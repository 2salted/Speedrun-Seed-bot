import { config } from "dotenv";
import {
  Client,
  IntentsBitField,
  ActivityType,
  EmbedBuilder,
  ChannelType,
} from "discord.js";
import { registerCommands } from "./register-commands.js";
import fs from "fs";
const seedDataFilePath = "seeds.json";
const userDataFilePath = "user_seeds.json";
if (!fs.existsSync(seedDataFilePath)) {
  fs.writeFileSync(seedDataFilePath, "{}");
}
if (!fs.existsSync(userDataFilePath)) {
  fs.writeFileSync(userDataFilePath, "{}");
}

config();
registerCommands();

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
    IntentsBitField.Flags.GuildMessageReactions
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
    name: `${Object.keys(seeds).length} seeds`,
    type: ActivityType.Watching,
  });
}

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  if (commandName === "strongholdfinder") {
    const command1 = interaction.options.getString("firsteye");
    const command2 = interaction.options.getString("secondeye");

    const numbers1 = command1.match(/-?\d+(\.\d+)?/g).map(Number);
    const x1 = numbers1[0];
    const y1 = numbers1[2];
    const f1 = numbers1[3];

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

    // Send the calculated result back to the user using an embed
    interaction.reply({ embeds: [eyeOfEnderEmbed] });
  }

  if (interaction.commandName === "help") {
    const embed = new EmbedBuilder()
      .setTitle("SpeedrunSeeds Bot Help Alpha 1.5.3")
      .setDescription(
        "Here's a list with all the info about SpeedrunSeeds bot! for any questions or inquiries add salted.js on discord"
      )
      .setColor(0x0f5132)
      .setThumbnail(client.user.displayAvatarURL())
      .addFields(
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
        },
        {
          name: "/strongholdfinder",
          value:
            "1. Line up your cursor to your ender eye and press (F3 + C)\n" +
            "2. In discord do /strongholdfinder and in the 'first eye' input press (CTRL + V)\n" +
            "3. Turn 90 degrees right or left and for best accuracy throw your second eye atleast 6 chunks away from the first\n" +
            "4. Throw your second eye, aim your cursor at the eye and press (F3 + C) again\n" +
            "5. While still having the /strongholdfinder command open press (CTRL + V) in the 'second eye' input\n" +
            "\nImportant Info:\n" +
            "When you are pasting the F3 + C, into the 'first eye' or 'second eye' it should look like this: \n `/execute in minecraft:overworld run tp @s Xposition, Yposition, Zposition, Xfacing, Yfacing`",
        }
      );

    interaction.reply({ embeds: [embed] });
  }

  if (interaction.commandName === "request") {
    let seeds = {};
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

    const availableSeeds = Object.keys(seeds).filter(
      (seed) => !userData[interaction.user.id].includes(seed)
    );

    if (availableSeeds.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableSeeds.length);
      const selectedSeed = availableSeeds[randomIndex];

      await interaction.user.send(`Your random seed is: ${selectedSeed}`);

      userData[interaction.user.id].push(selectedSeed);
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
        `<@${interaction.user.id}> Sorry, all seeds have been used. Please wait until more seeds get submitted`
      );
    }
  }

  if (interaction.commandName === "vote") {
    const seedCommand = interaction.options.getString("seed");
    const userId = interaction.user.id;

    let userData = {};
    try {
      userData = JSON.parse(fs.readFileSync(userDataFilePath, "utf8"));
    } catch (error) {
      console.error("Error reading user_seeds.json:", error);
    }

    // Check if the user has played the seed
    if (userData[userId] && userData[userId].includes(seedCommand)) {
      const votingEmbed = new EmbedBuilder()
        .setTitle("Upvote or Downvote this seed: " + seedCommand)
        .setDescription(
          "Your feedback is one of the only ways for us to make sure our seeds are kept in check"
        );
    
      interaction.user
        .send({ embeds: [votingEmbed] })
        .then((message) => {
          message.react("👍"); 
          message.react("👎"); 
    
          const filter = (reaction, user) => {
            return ["👍", "👎"].includes(reaction.emoji.name) && user.id === interaction.user.id;
          };
    
          const collector = message.createReactionCollector({ filter, time: 60000 });
    
          collector.on("collect", (reaction, user) => {
            if (reaction.emoji.name === "👍") {
              user.send("Thumbs up"); // send message to the user who reacted
            } else if (reaction.emoji.name === "👎") {
              user.send("Thumbs down"); // send message to the user who reacted
            }
          });
    
          collector.on("end", (collected, reason) => {
            console.log(`Collector ended because of: ${reason}`);
          });
        })
        .catch(console.error);
    

      interaction.reply(`<@${userId}> Check DMs`);
    } else {
      if (interaction.reply(`<@${userId}> Check DMs`)) {
        interaction.user.send(
          `Sorry <@${userId}>, you can't vote for: ` +
            seedCommand +
            ` because you have never played this seed`
        );
      }
    }
  }
});

client.login(process.env.TOKEN);
