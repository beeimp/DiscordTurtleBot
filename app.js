const Discord = require('discord.js');
const db = require('./db_config');
require('dotenv').config();
const client = new Discord.Client();

const naverRankingInfo = require('./services/NaverRankingCrawling');

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
    const BadLanguage = ["섹", "섹스", "쉑"];
    BadLanguage.forEach(v => {
        if (msg.content === v) {
            msg.channel.bulkDelete(1);
        }
    })

    if (msg.author.id !== '779613987004219402') {
        if (msg.content === '!전체삭제' && (msg.author.id === '373793790034706439' || msg.author.id === '425972339679690752') ) {
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
        } else if (msg.content.startsWith("!재생 방송켜줘")) {
            if (msg.member.voice.channel) {
                msg.member.voice.channel.join()
                    .then(connection => {
                        let dispatcher = connection.play(`./static/musics/방송켜줘.mp3`, { seek: 0, volume: 0.5 });
                        dispatcher.on("end", end => { });
                    })
                    .catch(console.error);
            } else {
                msg.reply('음성 채널에 들어가고 불러줘~');
            }
        } else if (msg.content === '!나가') {
            msg.member.voice.channel.leave();
        } else if (msg.content === '!네이버실검' || msg.content === '!실시간' || msg.content === '!실검' || msg.content === '!실시간검색어') {
            naverRankingInfo().then( values => {
                let messages = ['-----네이버 실시간 Top20-----'];
                values.forEach((v)=>{
                    messages.push(`${v.rank}위 : ${v.title}`)
                } )
                msg.channel.send(messages.join('\n'));
            });

        } else if (msg.content.startsWith('거북아') && msg.content.split(" ").length > 1){
            const answers = ['아니', '싫어. 몰라', '몰라', '귀찮아', 'ㅅㄲㄹㅇ', 'ㅁㄹ', '시끄러워', '귀찮게 하지마...', '나 예민하니까 건들지마' ];
            randInt = Math.floor(Math.random() * answers.length);
            msg.reply(answers[randInt]);
        } else {
            db.SearchAnswer(msg);
        }
    }
});


client.login(process.env.DISCORD_TOKEN);
