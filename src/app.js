const Discord = require("discord.js");
const db = require("../config/db_config");
const ytdl = require("ytdl-core");
require("dotenv").config();
const client = new Discord.Client();
// const naverRankingInfo = require("./services/NaverRankingCrawling");
const lolSummonerInfo = require("./services/LOLSummonerCrawling");
const { printCorona } = require("./services/Corona");
const {
  badLanguage,
  callMe,
  location,
  locations,
} = require("../config/config");
const {
  getWeather,
  getShortTermLiveWeather,
  getShortTermForecastWeather,
} = require("./services/Weather");
const schedule = require("node-schedule");
const Storage = require("../lib/storage");

let qeuestWeather = false;
const storage = new Storage();

client.on("ready", async () => {
  // 테스트
  try {
    // 날씨 정보 저장
    const weather = ["currentWeather", "forecastWeather"];
    weather.map((weatherType, num) => {
      locations.map((location) => {
        getWeather((num = num), (nx = location.nx), (ny = location.ny)).then(
          (items) => {
            storage.set(`${weatherType}_${location.name}`, items);
          }
        );
      });
    });

    // 30분 마다 작업 실행
    schedule.scheduleJob("0,30 * * * *", () => {
      // 날씨
      weather.map((weatherType, num) => {
        locations.map((location) => {
          getWeather((num = num), (nx = location.nx), (ny = location.ny)).then(
            (items) => {
              storage.set(`${weatherType}_${location.name}`, items);
            }
          );
        });
      });
    });

    console.log(`Logged in as ${client.user.tag}!`);
  } catch (err) {
    console.error(err);
  }
});

client.on("message", async (msg) => {
  const date = new Date();

  // db에 메시지 저장
  if (msg.author.id !== "779613987004219402") {
    // 봇에 대한 채팅은 필터링
    db.InsertChatting(msg);

    if (msg.embeds[0] && msg.embeds[0].type === "link") {
      db.InsertLink(msg);
    }
    if (msg.attachments && msg.attachments.toJSON()[0]) {
      db.InsertFiles(msg);
    }
  }

  badLanguage.forEach(async (v) => {
    try {
      if (msg.content === v || msg.content.startsWith(v)) {
        await msg.channel.delete();
      }
    } catch (error) {
      const errorMessage = [
        "적당히 좀 써라...지우기 힘들어 ㅡㅡ",
        "넌 정말 대단하구나?",
        "그만 좀 해줄래?",
      ];
      const randInt = Math.floor(Math.random() * errorMessage.length);
      msg.reply(errorMessage[randInt]);
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
            msg.channel.bulkDelete(messages=num);
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
    } else if (msg.content.endsWith("날씨")) {
      const message = msg.content.split(" ");
      const locationNames = Object.keys(location);
      if (!qeuestWeather) {
        if (message.length == 1) {
          qeuestWeather = true;
          locationNames.map(async (name) => {
            msg.channel.send(
              await getShortTermLiveWeather(
                name,
                storage.get(`currentWeather_${name}`)
              )
            );
            msg.channel.send(
              await getShortTermForecastWeather(
                name,
                storage.get(`forecastWeather_${name}`)
              )
            );
          });
          setTimeout(() => {
            qeuestWeather = false;
          }, 1000 * 3);
        } else if (message.length == 2 && locationNames.includes(message[0])) {
          if (!qeuestWeather) {
            qeuestWeather = true;
            msg.channel.send(
              await getShortTermLiveWeather(
                message[0],
                storage.get(`currentWeather_${message[0]}`)
              )
            );
            msg.channel.send(
              await getShortTermForecastWeather(
                message[0],
                storage.get(`forecastWeather_${message[0]}`)
              )
            );
            setTimeout(() => {
              qeuestWeather = false;
            }, 1000 * 1);
          } else {
            msg.reply("천천히 물어봐..");
          }
        } else {
          msg.reply(
            "이렇게 입력해봐 >" + Object.keys(location).join(" 또는 ") + " 날씨"
          );
        }
      } else {
        msg.reply("천천히 물어봐..");
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
                dispatcher.on("end", (end) => {});
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
                dispatcher.on("end", (end) => {});
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
      // 네이버 실검 삭제
      // } else if (
      //   msg.content === "!네이버실검" ||
      //   msg.content === "!실시간" ||
      //   msg.content === "!실검" ||
      //   msg.content === "!실시간검색어"
      // ) {
      //   naverRankingInfo().then((values) => {
      //     let messages = ["-----네이버 실시간 Top20-----"];
      //     values.forEach((v) => {
      //       messages.push(`${v.rank}위 : ${v.title}`);
      //     });
      //     msg.channel.send(messages.join("\n"));
      //   });
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

            // await lolSummonerInfo.dynamicCrawling(summoner.summonerName)
            // .then(ingame => {
            //     message.push("===== 인게임 정보 =====")
            //     if(ingame.isInGame){
            //         message.push(`블루팀 정보`);
            //         message.push(`레드팀 정보`);
            //     }else{
            //         message.push("현재 게임을 하고 있지 않습니다.")
            //     }
            //     return ingame;
            // }).then(value=> console.log(value));

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

client.login(process.env.DISCORD_TOKEN);
