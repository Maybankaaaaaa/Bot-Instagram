const { ApplicationCommandType, ApplicationCommandOptionType, ActionRowBuilder, ButtonBuilder } = require("discord.js");
const { JsonDatabase } = require("wio.db");
const db = new JsonDatabase({ databasePath: "./src/database/instagram.json" });
const { logs, staff } = require("../../../config.json");


module.exports = {
    name: "enviar",
    description: "[⭐] Envie o seu video!",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "descrição",
            type: ApplicationCommandOptionType.String,
            description: "Coloque a descrição da postagem",
            required: true
        },
        {
            name: "file",
            description: "Coloque a Foto ou Video que você deseja",
            type: ApplicationCommandOptionType.Attachment,
            required: true
        }
    ],
    run: async (client, interaction) => {
        const desc = interaction.options.getString("descrição");
        const file = interaction.options.getAttachment("file");

        
        if (!file.contentType.startsWith("image/") && !file.contentType.startsWith("video/"))  return interaction.reply({
            content: "Por favor, envie apenas imagens ou vídeos!",
            ephemeral: true
        });
        
        const channel = interaction.client.channels.cache.get(logs);
        await interaction.reply({
            content:`🔁 **| Aguarde um momento..**`,
            ephemeral: true
        })
        if(channel) await channel.send({
            content:`👤 **| Usuário:** ${interaction.user} (\`${interaction.user.id}\`)\n⏰ **| Hórario:** <t:${Math.floor(new Date() / 1000)}:R>\n✍ **| Descrição:** ${desc}`,
            components: [
                new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId("aceitar")
                    .setLabel("Aceitar")
                    .setStyle(3),
                    new ButtonBuilder()
                    .setCustomId("recusar")
                    .setLabel("Recusar")
                    .setStyle(4),
                )
            ],
            files: [file]
        }).then(async(msg) => {
            await db.set(`${msg.id}`, {
                fileURL: file.url,
                desc,
                userid: interaction.user.id,
                fileName: file.name
            });
        });
        if(channel) await channel.send({
            content:`<@&${staff}>`
        }).then((msg) => msg.delete()).catch(() => {});

        interaction.editReply({
            content:`✅ **| Enviado com sucesso, Aguarde até que um moderador aceite.**`,
            ephemeral: true
        });

    }
};
