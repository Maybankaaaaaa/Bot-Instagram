const { ApplicationCommandType } = require("discord.js"); // Chamando a Dependencia discord.js


module.exports = {
    name:"ping", 
    description:"[🤖] Veja o PING do bot!", 
    type: ApplicationCommandType.ChatInput,
    run: async(client, interaction) => { 
        interaction.reply({ 
            content:`Olá ${interaction.user}, Aguarde um momento estou calculando meu ping`, 
        });

        setTimeout(() => { 
            interaction.editReply({
                content:`${interaction.user}, Meu Ping está em: ${client.ws.ping}`
            });
        }, 1500); 

    }
}