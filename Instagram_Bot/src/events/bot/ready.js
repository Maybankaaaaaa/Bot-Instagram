const {} = require("discord.js");


module.exports = {
    name:"ready",
    run:async(client) => {console.clear();
        
        console.log('\x1b[37m%s\x1b[0m', `Estou online em ${client.user.username}`);
        console.log('\x1b[37m%s\x1b[0m', `- Estou em ${client.guilds.cache.size}, Servidores XD`);
        console.log('\x1b[37m%s\x1b[0m', `- Tenho ${client.users.cache.size} Amiguinhus :D`);
        

    }
}