const Discord = require('discord.js');
const db = require('./db_config');
require('dotenv').config();
const client = new Discord.Client();

client.on('ready', ()=>{
    console.log(`Logged in as ${client.user.tag}!`);
})

client.on('message', msg=>{
    const helloArray = [
        {word: 'hi', answer: "Hi~"},
        {word: 'Hi', answer: "Hi~"},
        {word: 'Hello', answer: "Hello~"},
        {word: 'hello', answer: "Hello~"},
        {word: '야', answer: "왜"},
        {word: '거북아', answer: "왜"},
        {word: "안녕", answer: "안녕!ㅎㅎ"},
        {word: "ㅎㅇ", answer: "ㅎㅇ"}
    ];
    const result = helloArray.find(item => item.word === msg.content);

    // db에 메시지 저장
    db.InsertChatting([msg.author.username, msg.content, new Date(msg.createdTimestamp)]);

    if (result && result.answer){
        msg.reply(result.answer);
    }

});


client.login(process.env.DISCORD_TOKEN);
