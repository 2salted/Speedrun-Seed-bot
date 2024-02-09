import { REST } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { Routes } from "discord-api-types/v9";
import { config } from "dotenv";

config();

async function registerCommands() {
  const commands = [
    new SlashCommandBuilder()
      .setName("submit")
      .setDescription("Submit your amazing speedrunning seed")
      .addStringOption((option) =>
        option
          .setName("seed")
          .setDescription("Enter the seed here")
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName("description")
          .setDescription("Enter a description;")
          .addChoices(
            { name: "Ruined Portal", value: "Ruined Portal" },
            { name: "Shipwreck", value: "Shipwreck" },
            { name: "Village", value: "Village" },
            { name: "Buried Treasure", value: "Buried Treasure" },
            { name: "Desert Temple", value: "Desert Temple" }
          )
          .setRequired(true)
      )
      .toJSON(),
    new SlashCommandBuilder()
      .setName("request")
      .setDescription("Request a random seed")
      .toJSON(),
    new SlashCommandBuilder() // Adding the help command
      .setName("help")
      .setDescription("Display information about available commands.")
      .toJSON(),
    new SlashCommandBuilder()
      .setName("strongholdfinder")
      .setDescription("Calculate the intersection point of two lines")
      .addStringOption((option) =>
        option
          .setName("firsteye")
          .setDescription("Enter the first command string")
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName("secondeye")
          .setDescription("Enter the second command string")
          .setRequired(true)
      )
      .toJSON(),
    new SlashCommandBuilder()
    .setName("helpstrongholdfinder")
    .setDescription("everything you need to know about the /strongholdfinder command")
    .toJSON(),
  ];

  const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

  try {
    console.log("Started refreshing global (/) commands.");

    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
      body: commands,
    });

    console.log("Successfully reloaded global (/) commands.");
  } catch (error) {
    console.error(error);
  }
}

export { registerCommands };
