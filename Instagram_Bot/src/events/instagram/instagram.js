const { ApplicationCommandType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ApplicationCommandOptionType, WebhookClient, AttachmentBuilder, ModalBuilder, TextInputBuilder } = require("discord.js");
const { staff, logs, channelId } = require("../../../config.json"); // Adicione o channelId aqui
const { JsonDatabase } = require("wio.db");
const db = new JsonDatabase({ databasePath: "./src/database/instagram.json" });
const axios = require("axios");
const fs = require("fs").promises;
const { messageEdit } = require("../../function/instagram/instagram");

module.exports = {
    name: "interactionCreate",
    run: async (interaction, client) => {
        const { customId, message, user } = interaction;
        if (!customId) return;

        if (customId === "aceitar") {
            if (!interaction.member.roles.cache.has(staff)) return interaction.deferUpdate();

            await interaction.update({
                components: []
            });

            interaction.followUp({
                content: `✅ **| Aprovado com sucesso!**`,
            });

            const msg = await db.get(`${message.id}`);
            await db.delete(`${message.id}`);

            const response = await axios.get(`${msg.fileURL}`, { responseType: "arraybuffer" });
            const buffer = Buffer.from(response.data, "binary");

            const tempFile = `./${msg.fileName}`;
            await fs.writeFile(tempFile, buffer);

            const attachment = new AttachmentBuilder(tempFile);

            const user = interaction.guild.members.cache.get(msg.userid);

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId("like")
                        .setStyle(2)
                        .setLabel("0")
                        .setEmoji("<:h_scribbleheart:1254515210769666160>"),
                    new ButtonBuilder()
                        .setCustomId("comentarios")
                        .setLabel("0")
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

            try {
                
                const channel = await client.channels.fetch(channelId);
                let webhook;
                
                const usernam = user.nickname ?? user.displayName ?? user.user.username;
                const webhooks = await channel.fetchWebhooks();
                webhook = webhooks.find(wh => wh.name === usernam);

                
                if (!webhook) {
                    webhook = await channel.createWebhook({
                        name: usernam,
                        avatar: user.displayAvatarURL(),
                    });
                }
                const wb = await webhook.send({
                    content: `> ${user}\n\n- ${msg.desc}`,
                    files: [attachment],
                    components: [row]
                });

                await db.set(`${wb.id}`, {
                    likes: [],
                    comentarios: [],
                    owner: msg.userid,
                    url: webhook.url
                });

                await fs.unlink(tempFile);
            } catch (error) {
                console.error("Erro ao enviar a mensagem com a webhook: ", error);
            }
        }
        if (customId === "comentarios") {
            await interaction.reply({ content: `🔁 **| Aguarde um momento...**`, ephemeral: true });

            const msg = await db.get(`${message.id}`);
            const comentarios = msg.comentarios;
            if(comentarios.length <= 0) return interaction.editReply({content:`⚠ **| Esta postagem não tem comentarios.**`});
            
            const commentsPerPage = 8; 
            let currentPage = 1; 
            
            const maxPages = Math.ceil(comentarios.length / commentsPerPage);

            
            const createEmbed = (page) => {
                const embed = new EmbedBuilder()
                    .setColor("#00FFFF")
                    .setTitle(`Comentários da Postagem`);

                const start = (page - 1) * commentsPerPage;
                const end = start + commentsPerPage;

                for (let i = start; i < end && i < comentarios.length; i++) {
                    const comment = comentarios[i];
                    embed.addFields({name: `Comentário ${i + 1}`,value: `**Usuário:** <@${comment.usuario}>\n**Comentario:** ${comment.comentario}\n**Horário:** ${comment.horario}`});
                }
                
                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('previousPage')
                            .setLabel('Voltar')
                            .setDisabled(page === 1)
                            .setEmoji("⬅")
                            .setStyle(2),
                        new ButtonBuilder()
                            .setCustomId('pageAtual')
                            .setLabel(`Página ${page}/${maxPages}`)
                            .setDisabled(true)
                            .setStyle(2),
                        new ButtonBuilder()
                            .setCustomId('nextPage')
                            .setDisabled(page >= maxPages)
                            .setLabel('Proximo')
                            .setEmoji("➡")
                            .setStyle(2)
                    );

                return { embed, row };
            };

            const newEmbed = createEmbed(currentPage);
            
            await interaction.editReply({ content:"",embeds: [newEmbed.embed], components: [newEmbed.row] });

            
            const m = await interaction.fetchReply();

            const filter = (i) => i.message.id === m.id; 


            const collector = m.createMessageComponentCollector({ filter, time: 60000 });

            
            collector.on('collect', async (interaction) => {
                if (interaction.customId === 'previousPage') {
                    currentPage = currentPage > 1 ? currentPage - 1 : maxPages;
                } else if (interaction.customId === 'nextPage') {
                    currentPage = currentPage < maxPages ? currentPage + 1 : 1;
                }
                const newEmbed = createEmbed(currentPage);
                await interaction.update({ embeds: [newEmbed.embed], components: [newEmbed.row] });
            });

            collector.on('end', () => {
                interaction.editReply({ components: [] }).catch(console.error);
            });
        }
        if(customId === "excluir") {
            if(await db.get(`${message.id}.owner`) !== user.id && !interaction.member.roles.cache.has(staff)) return interaction.deferUpdate();
            await message.delete();
            await db.delete(`${message.id}`);
        }
        if(customId === "compartilhar") {
            const modal = new ModalBuilder()
            .setCustomId("compartilhar_modal")
            .setTitle("Compartilhar Postagem");

            const texto = new TextInputBuilder()
            .setCustomId("texto")
            .setLabel("texto que será enviado:")
            .setStyle(2)
            .setMaxLength(1500)
            .setPlaceholder("Mano se liga nessa postagem kkkk");

            const usuario = new TextInputBuilder()
            .setCustomId("usuario")
            .setLabel("Coloque o id do usuário:")
            .setRequired(true)
            .setStyle(1);

            modal.addComponents(new ActionRowBuilder().addComponents(texto));
            modal.addComponents(new ActionRowBuilder().addComponents(usuario));

            return interaction.showModal(modal);
        }
        if(customId === "compartilhar_modal") {
            const texto = interaction.fields.getTextInputValue("texto");
            const usuario = interaction.client.users.cache.get(interaction.fields.getTextInputValue("usuario"));
            if(!usuario) return interaction.reply({content:`❌ **| Usuário não encontrado.**`, ephemeral: true});
            await interaction.reply({content:`🔁 **| Enviando para o Usuário ${usuario}, Aguarde um momento...**`, ephemeral: true});
            let c = true;
            await usuario.send({
                content:`${texto}`,
                components: [
                    new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                        .setURL(interaction.message.url)
                        .setLabel("Ir para postagem")
                        .setStyle(5)
                        .setEmoji("<:imp_link:1254537277988933694>")
                    )
                ]
            }).catch(() => c = false);
            if(c) {
                await usuario.send({
                    content:`Video Compartilhado pelo: ${user}`
                });
            }
            if(!c) return interaction.editReply({
                content:`❌ **| Usuário está com o privado bloqueado.**`
            });
            interaction.editReply({content:`✅ **| Postagem compartilhada com sucesso!**`, ephemeral: true });
        }
        if(customId === "adicionar_comentario") {
            const modal = new ModalBuilder()
            .setCustomId("adicionar_comentario_modal")
            .setTitle("Adicionar Comentario na Postagem");

            const text = new TextInputBuilder()
            .setCustomId("text")
            .setLabel("comentario:")
            .setStyle(2)
            .setRequired(true)
            .setPlaceholder("Escreva seu comentario aqui");

            modal.addComponents(new ActionRowBuilder().addComponents(text));

            return interaction.showModal(modal);
        }
        if(customId === "adicionar_comentario_modal") {
            await interaction.deferUpdate();
            const text = interaction.fields.getTextInputValue("text");
            await db.push(`${message.id}.comentarios`, {
                usuario: user.id,
                horario:`<t:${Math.floor(new Date() / 1000)}:R>`,
                comentario: text
            });
            messageEdit(interaction);
        }
        if(customId === "like") {
            const postagem = await db.get(`${message.id}`);
            await interaction.deferUpdate();

            if(postagem.likes.includes(user.id)) await db.pull(`${message.id}.likes`, (element) => element === user.id, true);
            if(!postagem.likes.includes(user.id)) await db.push(`${message.id}.likes`, user.id);
            messageEdit(interaction);
        }
        if(customId === "recusar") {
            await interaction.update({ components: []});
            interaction.followUp({content:`❌ **| Postagem Recusada.**`, ephemeral: true });
            await db.delete(`${message.id}`);
        }
    }
}
