const Discord = require('discord.js');
const db = require('./db_config');
require('dotenv').config();
const client = new Discord.Client();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
})
client.on('message', msg => {
    // db에 메시지 저장
    db.InsertChatting([msg.author.username, msg.content, new Date(msg.createdTimestamp)]);

    if (msg.content === '!전체삭제') {
        for(let i = 0 ; i < 10; i++){
            msg.channel.bulkDelete(100);
        }
    } else if (msg.content.startsWith('!추가')){
        db.InsertAnswer(msg);
    } else if (msg.content.startsWith('!수정')){
        db.UpdateAnswer(msg);
    } else{
        db.SearchAnswer(msg);
    }
});


client.login(process.env.DISCORD_TOKEN);
