import { REST } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { Routes } from "discord-api-types/v9";
import { config } from "dotenv";

config();

async function registerCommands() {
  const commands = [
    new SlashCommandBuilder()
      .setName("request")
      .setDescription("Request a random speedrunning seed")
      .toJSON(),
    new SlashCommandBuilder()
      .setName("help")
      .setDescription("Display information about available commands.")
      .toJSON(),
    new SlashCommandBuilder()
      .setName("strongholdfinder")
      .setDescription("Calculate the distance of the stronghold")
      .addStringOption((option) =>
        option
          .setName("firsteye")
          .setDescription("Paste the first eye's F3 + C debug")
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName("secondeye")
          .setDescription("Paste the second eye's F3 + C debug")
          .setRequired(true)
      )
      .toJSON(),
      new SlashCommandBuilder()
      .setName("vote")
      .setDescription("upvote or downvote a seed")
      .addStringOption((option) =>
        option
          .setName("seed")
          .setDescription("paste the desired seed that you want to upvote or downvote")
          .setRequired(true)
      )
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
