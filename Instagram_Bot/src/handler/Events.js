const fs = require('fs');
const path = require('path');

module.exports = {
  run: (client) => {
    const eventsFolder = path.join(__dirname, '../events');

    try {
      
      if (fs.existsSync(eventsFolder)) {

        const folders = fs.readdirSync(eventsFolder);

        folders.forEach((folder) => {
          const folderPath = path.join(eventsFolder, folder);


          const files = fs.readdirSync(folderPath);

          files.forEach((file) => {
            if (!file.endsWith('.js')) return;

            const filePath = path.join(folderPath, file);
            const event = require(filePath);

            if (!event?.name) return;

            if (event.once) {
              client.once(event.name, (...args) => event.run(...args, client));
            } else {
              client.on(event.name, (...args) => event.run(...args, client));
            }
          });
        });
      } else {
        console.error(`O diretório de eventos '${eventsFolder}' não foi encontrado.`);
      }
    } catch (error) {
      console.error('Erro ao ler o diretório de eventos:', error);
    }
  },
};
