const { ApplicationCommandType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ApplicationCommandOptionType, WebhookClient, AttachmentBuilder } = require("discord.js");
const { staff, logs, channelId } = require("../../../config.json"); // Adicione o channelId aqui
const { JsonDatabase } = require("wio.db");
const db = new JsonDatabase({ databasePath: "./src/database/instagram.json" });
const axios = require("axios");
const fs = require("fs").promises;


async function messageEdit(interaction) {
    const msg = await db.get(`${interaction.message.id}`);

    const webhookClient = new WebhookClient({ url: msg.url });

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
        .setCustomId("like")
        .setStyle(2)
        .setLabel(`${msg.likes.length}`)
        .setEmoji("<:h_scribbleheart:1254515210769666160>"),
        new ButtonBuilder()
        .setCustomId("comentarios")
        .setLabel(`${msg.comentarios.length}`)
        .setEmoji("<:comentario:1254516195646902294>")
        .setStyle(2),
        new ButtonBuilder()
        .setCustomId("compartilhar")
        .setStyle(2)
        .setEmoji("<:share:1254516930354610269>"),
        new ButtonBuilder()
        .setCustomId("adicionar_comentario")
        .setStyle(2)
        .setEmoji("<:autoral_balao:1219414097460723813>"),
        new ButtonBuilder()
        .setCustomId("excluir")
        .setStyle(4)
        .setEmoji("<:lixo:1208399400410550332>")
    );
    

    await webhookClient.editMessage(interaction.message.id, {
        components: [row]
    });
}


module.exports = {
    messageEdit
}