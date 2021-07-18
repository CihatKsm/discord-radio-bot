const { Webhook, MessageBuilder } = require('discord-webhook-node');
const { webhookurl } = require("../config.json");
const btn = require("discord-buttons");
const ytdl = require('ytdl-core');

module.exports = async button => {
    let hook = new Webhook(webhookurl);
    let hookembed = new MessageBuilder()
    if (button.id === "closed") {
        let clicker = button.clicker.member;
        if (!clicker.voice.channelID) return button.channel.send(":thinking: Bulunduğum sesli kanalda değilsin!")
        if (clicker.guild.me.voice.channel && clicker.voice.channelID !== clicker.guild.me.voice.channelID) return button.channel.send(":thinking: Bulunduğum sesli kanalda değilsin!")
        button.reply.defer(true);
        if (clicker.guild.me.voice.channel) { button.clicker.member.voice.channel.leave() }
        if (button.message.deletable) { button.message.delete() }
        return;
    } else {
        button.reply.defer(true);
        let info = await ytdl.getInfo(button.id);
        let clicker = button.clicker.member;
        if (!clicker.voice.channelID) return button.channel.send(`:thinking: ${clicker}, Herhangi bir sesli kanalda değilsin!`);
        if (clicker.guild.me.voice.channel && clicker.voice.channelID !== clicker.guild.me.voice.channelID) return button.channel.send(`:thinking: ${clicker}, ulunduğum sesli kanalda değilsin!`)
        let permissionsFor = clicker.voice.channel.permissionsFor(clicker.guild.me)
        if (!permissionsFor.has("CONNECT") || !permissionsFor.has("SPEAK")) return button.channel.send(`:thinking: ${clicker}, Kanal izinleri radyo açmaya uygun değil!`)

        button.clicker.member.voice.channel.join()
            .then((connection) => {
                let close = new btn.MessageButton().setStyle('blurple').setLabel('Kapat').setID(`closed`)
                connection.play(ytdl(button.id, { quality: "highestaudio", highWaterMark: 1 << 25, type: "opus" }));
                if (button.message.deletable) { button.message.delete(); }
                button.channel.send(`${clicker}, \` ${info.videoDetails.title.substring(0, 45)}... \` radyosu oynatılıyor...`, close)
                    .catch((error) => console.log(error));
            })
            .catch((error) => {
                button.reply.defer(true);
                if (button.message.deletable) { button.message.delete(); }
                button.channel.send(`:man_facepalming: ${clicker}, Ufak bir hata oluştu.\n\`\`\`${error}\`\`\``).catch((error) => console.log(error));
                hook.send(hookembed.setDescription(`:man_facepalming: Ufak bir hata oluştu. \n\`\`\`${error}\`\`\``));
                return;
            });
    }
};