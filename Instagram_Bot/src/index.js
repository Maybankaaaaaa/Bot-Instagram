const {Client , GatewayIntentBits,Collection, Partials } = require("discord.js");
console.clear()

const client = new Client({
  intents: Object.keys(GatewayIntentBits),
  partials: Object.keys(Partials)
});

module.exports = client;
client.slashCommands = new Collection();
const {token} = require("../config.json");
client.login(token);


const evento = require("./handler/Events");
evento.run(client);
require("./handler/index")(client);



// process.on('unhandRejection', (reason, promise) => {
//   console.log(`🚫 Erro Detectado:\n\n` + reason, promise);
// });

// process.on('uncaughtException', (error, origin) => {
//   console.log(`🚫 Erro Detectado:\n\n` + error, origin);
// });


// client.on("interactionCreate", i => {
//   i.member.displayName
// })