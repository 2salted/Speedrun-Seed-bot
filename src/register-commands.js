import { REST, Routes, SlashCommandBuilder } from "discord.js";
import { config } from "dotenv";

config();

async function registerCommands() {
  const commands = new SlashCommandBuilder()
    .setName("submit")
    .setDescription("replies with submit your amazing speedrunning seed")
    .addStringOption((option) =>
      option.setName("seed").setDescription("seed sumbission")
    );

  const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

  try {
    console.log("Started refreshing application (/) commands.");

    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
      body: commands,
    });

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
}

export { registerCommands };
