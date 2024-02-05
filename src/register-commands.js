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
      .addStringOption(
        (option) =>
          option
            .setName("seed")
            .setDescription("Enter the seed here")
            .setRequired(true) // You might want to make seed required
      )
      .addStringOption(
        (option) =>
          option
            .setName("description")
            .setDescription("Enter a description;")
            .setRequired(true) // You might want to make description required
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
  ];

  const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

  try {
    console.log("Started refreshing application (/) commands.");

    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID
      ),
      {
        body: commands,
      }
    );

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
}

export { registerCommands };
