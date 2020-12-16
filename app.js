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

        if (msg.embeds[0] && msg.embeds[0].type === 'link') {
            db.InsertLink(msg);
        }
        if (msg.attachments && msg.attachments.toJSON()[0]) {
            db.InsertFiles(msg);
        }
    }
    const BadLanguage = ["섹", "섹스", "쉑", "시발", "ㅅㅂ"];
    BadLanguage.forEach(v => {
        if (msg.content === v) {
            msg.channel.bulkDelete(1);
        }
    })

    if (msg.author.id !== '779613987004219402') {
        if (msg.content === '!전체삭제' && msg.author.id === '373793790034706439') {
            const channelName = msg.channel.name;
            msg.channel.delete()

            msg.guild.channels.create(channelName, {
                type: 'text',
                permissionOverwrites: [
                    {
                        id: msg.guild.id,
                        allow: ['VIEW_CHANNEL'],
                    }
                ]
            })
        } else if (msg.content === "!명령어") {
            const content = `!명령어\n!전체삭제\n!삭제 <갯수 - 최대 100>\n!추가 "질문" "답변"\n!수정 "질문" "답변"`;
            msg.channel.send(content);
        } else if (msg.content.startsWith("!삭제")) {
            if (msg.content && msg.content.split(" ")[1]) {
                let num = parseInt(msg.content.split(" ")[1]);
                if (num > 100) {
                    msg.reply('그만큼은 힘들어.. 안지울래..');
                } else {
                    msg.channel.bulkDelete(num);
                }
            }
        } else if (msg.content.startsWith('!추가')) {
            db.InsertAnswer(msg);
        } else if (msg.content.startsWith('!수정')) {
            db.UpdateAnswer(msg);
        } else if (msg.content === '!재생') {
            // if (msg.member.voice.channel) {
            //     msg.member.voice.channel.join()
            //         .then(connection => {
            //             msg.reply("재생할게!");
            //             let dispatcher = connection.play(`./static/music/IZONE-Panorama_teaser.mp3`, { seek: 1, volume: 0.1 });
            //             dispatcher.on("end", end => { });
            //         })
            //         .catch(console.error);
            // } else {
            //     msg.reply('음성 채널에 들어가고 불러줘~');
            // }
        } else {
            db.SearchAnswer(msg);
        }
    }
});


client.login(process.env.DISCORD_TOKEN);
