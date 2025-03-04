const { ApplicationCommandType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ApplicationCommandOptionType } = require("discord.js");


module.exports = {
    name:"interactionCreate",
    run:async(interaction, client) => {

        if (interaction.isCommand()) {

            const command = client.slashCommands.get(interaction.commandName);

            if (!command) return;

            try {
            await command.run(client, interaction);
            } catch(err) {
                console.log(err);
            }
        }
    }
}