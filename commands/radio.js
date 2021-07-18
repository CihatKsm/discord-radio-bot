const { MessageEmbed } = require('discord.js');
const { webhookurl } = require('../config.json');
const { Webhook, MessageBuilder } = require('discord-webhook-node');
const yts = require("yt-search");
const btn = require("discord-buttons");
const ytdl = require('ytdl-core');

exports.run = async (client, message, args) => {
    let hook = new Webhook(webhookurl);
    let hookembed = new MessageBuilder();
    let type = args[0] ? args[0].replace(/<(.+)>/g, "$1") : message.content.split(" ").slice(0).join(" ");
    let youtubeurl = type.match(/^(https?:\/\/)?(www\.)?(m\.)?(youtube\.com|youtu\.?be)\/.+$/gi)
    let otherurl = type.match(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/)

    try {
        if (!type) return message.reply(`:x: Herhangi bir radyo adı yazmadınız.`).catch((error) => console.log(error));
        if (!message.member.voice.channel) return message.reply(":rolling_eyes: Üzgünüm ama radyo açmak için bir ses kanalında olmanız gerekiyor!").catch((error) => console.log(error));
        if (message.guild.me.voice.channel && message.member.voice.channel.id !== message.guild.me.voice.channel.id) return message.reply(":rolling_eyes: Benim bulunduğum sesli kanalda değilsin.").catch((error) => console.log(error));
        let permissionsFor = message.member.voice.channel.permissionsFor(message.client.user)
        if (!permissionsFor.has("CONNECT") || !permissionsFor.has("SPEAK")) return message.reply(`:rolling_eyes: Sesli kanala bağlanma veya sesli kanalda konuşma izini kapalı!`).catch((error) => console.log(error));

        let search;
        if (!youtubeurl && otherurl) {
            message.reply(`:rolling_eyes: Youtube dışı radyo servisleri sisteme dahil değildir!`).catch((error) => console.log(error));
            if (message.deletable) { message.delete(); }
            return;
        }

        message.reply(":mag_right: Radyo istasyonu aranıyor...").then(m => m.delete({ timeout: 1000 })).catch((error) => console.log(error));

        if (youtubeurl) {
            let searched = await ytdl.getInfo(type)
            if (!searched) return message.reply(`:rolling_eyes: Bu linkteki içeriğe ulaşamadım.`).catch((error) => console.log(error));
            if (searched.videoDetails.isLive !== true) {
                message.reply(`:rolling_eyes: Bu bir canlı yayın veya radyo linki değildir.`).catch((error) => console.log(error));
                if (message.deletable) { message.delete(); }
                return;
            }
            search = {
                title: searched.videoDetails.title,
                url: searched.videoDetails.video_url,
                img: searched.player_response.videoDetails.thumbnail.thumbnails[0].url,
            }
        } else {
            let searched = await yts(type);
            let live1 = searched.live.filter(a => a.status === 'LIVE' && a.type === 'live')
            let live2 = searched.all.filter(a => a.status === 'LIVE' && a.type === 'live')
            if (!live1[0]) return message.reply(`:x: Bu radyo istasyonunu YouTube'da bulamadım.`).catch((error) => console.log(error));
            if (!live2[0]) return message.reply(`:x: Bu radyo istasyonunu YouTube'da bulamadım.`).catch((error) => console.log(error));
            search = {
                title: live1[0].title ? live1[0].title : live2[0].title,
                url: live1[0].url ? live1[0].url : live2[0].url,
                img: live1[0].image ? live1[0].image : live2[0].image,
            }
        }

        let button = new btn.MessageButton().setStyle('blurple').setLabel('Bağlan!').setID(`${search.url}`)
        let embed = new MessageEmbed()
            .setColor('#f0ff00')
            .setTitle(search.title)
            .setImage(search.img)
            .setDescription(`Bağlantı isteği: ${message.author} tarafından gerçekleştirilmiştir. \n Not: Butona bastıktan en fazla 5-10 saniye sonra işleme geçilir.`)
        if (message.deletable) { message.delete(); }
        message.channel.send(embed, button).then(m => { setTimeout(function () { if (m.deletable) { m.delete() } }, 30000); });
    } catch (error) {
        message.channel.send(`:man_facepalming: Ufak bir hata oluştu. \n\`\`\`${error}\`\`\``).catch((error) => console.log(error));
        hook.send(hookembed.setColor('#f0ff00').setDescription(`:man_facepalming: Ufak bir hata oluştu. \n\`\`\`${error}\`\`\``));
        console.log(error);
        return;
    }
}

exports.conf = {
    enable: true,
    guildOnly: false,
    aliases: ["r", "radio"],
    permLevel: 0
}

exports.help = {
    name: "radyo",
    description: "",
    usage: ".radyo"
}