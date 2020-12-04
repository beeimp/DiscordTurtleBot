const Discord = require('discord.js');
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
        {word: "안녕", answer: "안녕!ㅎㅎ"}
    ];

    const result = helloArray.find(item => item.word === msg.content);

    if (result && result.answer){
        msg.reply(result.answer);
    }
});

client.login(process.env.DISCORD_TOKEN);