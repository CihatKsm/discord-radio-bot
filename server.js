const { Client, Collection } = require("discord.js");
const { token, webhookurl } = require("./config.json");
const { Webhook, MessageBuilder } = require('discord-webhook-node');
const fs = require("fs");
const client = new Client();
client.commands = new Collection();
client.aliases = new Collection();
require('./util/eventLoader')(client);
require('discord-buttons')(client);

let hook = new Webhook(webhookurl);
let hookembed = new MessageBuilder()

fs.readdir('./commands/', (err, files) => {
  if (err) console.error(err);
  files.forEach(f => {
    let props = require(`./commands/${f}`);
    client.commands.set(props.help.name, props);
    props.conf.aliases.forEach(alias => {
      client.aliases.set(alias, props.help.name);
    });
  });
});


client.elevation = message => {
  if (!message.guild) return;
  let permlvl = 0;
  return permlvl;
};

var regToken = /[\w\d]{24}\.[\w\d]{6}\.[\w\d-_]{27}/g;

client.on("warn", e => hook.send(hookembed.setDescription(`ℹ **Uyarı:** \n\`\`\`${e}\`\`\`\n\`\`\`${regToken}\`\`\``)));
client.on("error", e => hook.send(hookembed.setDescription(`ℹ **Hata:** \n\`\`\`${e}\`\`\`\n\`\`\`${regToken}\`\`\``)));

client.login(token)
  .then(() => console.log(`> [server.js] - Sistem "${client.user.username}" adlı bota bağlandı! ✅`))
  .catch(() => console.log(`> [server.js] - Bot tokeninde hata oluştu: ❌`))