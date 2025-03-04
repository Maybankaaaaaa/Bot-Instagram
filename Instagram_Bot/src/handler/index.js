const fs = require("fs");
const path = require("path");

module.exports = async (client) => {
  const SlashsArray = [];

  const commandsFolder = path.join(__dirname, "../commands");

  fs.readdir(commandsFolder, (error, folders) => {
    folders.forEach((subfolder) => {
      const subfolderPath = path.join(commandsFolder, subfolder);

      fs.readdir(subfolderPath, (error, files) => {
        files.forEach((file) => {
          if (!file?.endsWith(".js")) return;

          const filePath = path.join(subfolderPath, file);
          const command = require(filePath);

          if (!command?.name) return;

          client.slashCommands.set(command?.name, command);
          SlashsArray.push(command);
        });
      });
    });
  });

  client.on("ready", async () => {
    client.guilds.cache.forEach((guild) => guild.commands.set(SlashsArray));
  });
  client.on("guildCreate", async (guild) => {
    guild.commands.set(SlashsArray);
  });
};
