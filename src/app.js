const { Client, Intents } = require('discord.js');
const db = require("../config/db_config");
const ytdl = require("ytdl-core");
require("dotenv").config();
const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_INTEGRATIONS,
    Intents.FLAGS.DIRECT_MESSAGES
  ]
});
// const naverRankingInfo = require("./services/NaverRankingCrawling");
// const lolSummonerInfo = require("./services/LOLSummonerCrawling");
// const { printCorona } = require("./services/Corona");
const {
  badLanguage,
  callMe,
  location,
  locations,
} = require("../config/config");
const schedule = require("node-schedule");
const Storage = require("../lib/storage");

// createCommand
const createCommand = require('./command/createCommand');
const interactionsCommand = require('./command/interactionsCommand');

let qeuestWeather = false;
const storage = new Storage();

client.on("ready", async () => {
  console.log(`Logged in as ${client.user.tag}!`);

  const guildId = '784331418494959616';
  // const guildId = '963432279613522000';

  const guild = client.guilds.cache.get(guildId);

  createCommand(client, guild);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;
  interactionsCommand(client, interaction);
});

client.on("messageCreate", async (msg) => {
  const date = new Date();
  // db에 메시지 저장
  if (msg.author.id !== "779613987004219402") {
    // 봇에 대한 채팅은 필터링
    db.InsertChatting(msg);

    if (msg.embeds[0] && msg.embeds[0].type === "link") {
      db.InsertLink(msg);
    }
    // 파일 저장 중단
    // if (msg.attachments && msg.attachments.toJSON()[0]) {
    //   db.InsertFiles(msg);
    // }
  }
  badLanguage.forEach(async (v) => {
    try {
      if (msg.content === v || msg.content.startsWith(v)) {
        await msg.channel.bulkDelete(1);
      }
    } catch (error) {
      const errorMessage = [
        "적당히 좀 써라...지우기 힘들어 ㅡㅡ",
        "넌 정말 대단하구나?",
        "그만 좀 해줄래?",
      ];
      const randInt = Math.floor(Math.random() * errorMessage.length);
      msg.reply(errorMessage[randInt]);
      console.log(`에러 메세지: ${error}`);
    }
  });

  if (msg.author.id !== "779613987004219402") {
    if (
      msg.content === "!전체삭제" &&
      (msg.author.id === "373793790034706439" ||
        msg.author.id === "425972339679690752")
    ) {
      const channelName = msg.channel.name;
      msg.channel.delete();

      msg.guild.channels.create(channelName, {
        type: "text",
        permissionOverwrites: [
          {
            id: msg.guild.id,
            allow: ["VIEW_CHANNEL"],
          },
        ],
      });
    } else if (msg.content.startsWith(callMe)) {
      // msg.reply("걔는 바쁘니까 건들지 마..");
    } else if (msg.content === "!명령어") {
      const content = `!명령어\n!전체삭제\n!삭제 <갯수 - 최대 100>\n!추가 "질문" "답변"\n!수정 "질문" "답변"`;
      msg.channel.send(content);
    } else if (msg.content.startsWith("!삭제")) {
      if (msg.content && msg.content.split(" ")[1]) {
        const command = msg.content.slice(4);
        const regex = /(\d)$/;
        if (regex.test(command)) {
          let num = parseInt(msg.content.split(" ")[1]);
          if (num > 100) {
            msg.reply("그만큼은 힘들어.. 안지울래..");
          } else {
            msg.channel.bulkDelete(messages = num);
          }
        } else {
          db.DeleteAnswer(msg);
        }
      } else {
        msg.reply("!삭제 <지울 개수>");
      }
    } else if (msg.content.startsWith("!추가")) {
      if (msg.author.id === "373793790034706439") {
        db.InsertAnswer(msg);
      } else {
        const answers = [
          "추가 안해줄건데~~ㅋㅋ",
          "니 말 안들을거야",
          "뭐래 ㅋㅋ",
        ];
        randInt = Math.floor(Math.random() * answers.length);
        msg.reply(answers[randInt]);
      }
    } else if (msg.content.startsWith("!수정")) {
      if (msg.author.id === "373793790034706439") {
        db.UpdateAnswer(msg);
      } else {
        const answers = [
          "수정 안해줄건데~~ㅋㅋ",
          "니 말 안들을거야",
          "뭐래 ㅋㅋ",
        ];
        randInt = Math.floor(Math.random() * answers.length);
        msg.reply(answers[randInt]);
      }
    } else if (
      [
        "!코로나",
        "코로나",
        "!코로나 확진자",
        "코로나 확진자",
        "!확진자",
        "확진자",
      ].includes(msg.content)
    ) {
      try {
        msg.reply(await printCorona(date));
      } catch (err) {
        console.log("코로나 확진자 에러 :" + err);
      }
    } else if (msg.content.startsWith("!재생")) {
      const msgContent = msg.content.split(" ");

      if (msgContent.length == 2) {
        if (msgContent[1] == "방송켜줘") {
          if (msg.member.voice.channel) {
            msg.member.voice.channel
              .join()
              .then((connection) => {
                let dispatcher = connection.play(
                  `./static/musics/방송켜줘.mp3`,
                  { seek: 0, volume: 0.8 }
                );
                dispatcher.on("end", (end) => { });
              })
              .catch(console.error);
          } else {
            msg.reply("음성 채널에 들어가고 불러줘~");
          }
        } else {
          if (msg.member.voice.channel) {
            msg.member.voice.channel
              .join()
              .then((connection) => {
                let dispatcher = connection.play(ytdl(msgContent[1]), {
                  quality: "highestaudio",
                  seek: 0,
                  volume: 0.2,
                });
                dispatcher.on("end", (end) => { });
              })
              .catch(console.error);
          } else {
            msg.reply("음성 채널에 들어가고 불러줘~");
          }
        }
      } else {
        msg.reply("!재생 유튜브주소 <-- 이렇게 입력해!");
      }
    } else if (msg.content === "!나가") {
      if (msg.member.voice.channel) {
        msg.member.voice.channel.leave();
      }
    } else if (msg.content === "!링크" || msg.content === "!최근링크") {
      db.SearchLink(msg);
    } else if (msg.content.startsWith("!롤전적")) {
      const content = msg.content.split(" ");
      if (content.length > 1 && content[0] === "!롤전적") {
        const summonerName = content.slice(1).join(" ");
        lolSummonerInfo.opggWebCrawling(summonerName).then(async (summoner) => {
          if (summoner.isSummoner === true) {
            let message = ["```css"];
            message.push(`소환사명 : ${summoner.summonerName}`);
            summoner.ranking === ""
              ? {}
              : message.push(`래더랭킹 : ${summoner.ranking}`);

            message.push(`최근전적 : ${summoner.recentKDA}`);

            message.push("===== 솔로랭크 정보 =====");
            if (summoner.soloTier !== "Unranked") {
              message.push(`${summoner.soloTier} - ${summoner.soloPoint}`);
              message.push(`전  적 : ${summoner.soloPercent}`);
            } else {
              message.push("Unranked");
            }
            message.push("===== 자유랭크 정보 =====");
            if (summoner.freeTier !== "Unranked") {
              message.push(`${summoner.freeTier} - ${summoner.freePoint}`);
              message.push(`전  적 : ${summoner.freePercent}`);
            } else {
              message.push("Unranked");
            }
            message.push("```");
            msg.channel.send(message.join("\n"));
          } else {
            msg.reply(`${summoner.summonerName} 을 찾을 수 없어.`);
          }
        });
      } else {
        msg.reply("!롤전적 <소환사이름> <-- 이렇게 입력해줘!");
      }
    } else if (
      msg.content.startsWith("거북아") &&
      msg.content.split(" ").length > 1
    ) {
      const answers = [
        "아니",
        "싫어. 몰라",
        "몰라",
        "귀찮아",
        "ㅅㄲㄹㅇ",
        "ㅁㄹ",
        "시끄러워",
        "귀찮게 하지마...",
        "나 예민하니까 건들지마",
        "말걸지마",
      ];
      randInt = Math.floor(Math.random() * answers.length);
      msg.reply(answers[randInt]);
    } else {
      db.SearchAnswer(msg);
    }
  }
});

client.login(process.env.TEST_DISCORD_TOKEN);
