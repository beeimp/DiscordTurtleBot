const Discord = require('discord.js');
const db = require('./db_config');
require('dotenv').config();
const client = new Discord.Client();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
})



client.on('message', msg => {
    // db에 메시지 저장
    // console.log(msg);
    if (msg.author.id !== '779613987004219402') { // 봇에 대한 채팅은 필터링
        db.InsertChatting(msg);

        if(msg.embeds[0] && msg.embeds[0].type === 'link'){
            db.InsertLink(msg);
        }
        if(msg.attachments && msg.attachments.toJSON()[0]){
            db.InsertFiles(msg);
        }
    }
    Math.random
    if (msg.content === '!전체삭제') {
        for (let i = 0; i < 10; i++) {
            msg.channel.bulkDelete(100);
        }
    } else if (msg.content.startsWith('!추가')) {
        db.InsertAnswer(msg);
    } else if (msg.content.startsWith('!수정')) {
        db.UpdateAnswer(msg);
    } else if (msg.content === '!재생') {
        if (msg.member.voice.channel){
            msg.member.voice.channel.join()
            .then(connection => {
                msg.reply("재생할게!");
                let dispatcher = connection.play(`./static/music/IZONE-Panorama_teaser.mp3`, {seek:1, volume: 0.1});
                dispatcher.on("end", end=>{});
            })
            .catch(console.error);
        } else {
            msg.reply('음성 채널에 들어가고 불러줘~');
        }
    } else {
        db.SearchAnswer(msg);
    }
});


client.login(process.env.DISCORD_TOKEN);
