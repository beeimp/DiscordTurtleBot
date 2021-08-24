const axios = require('axios');
const cheerio = require('cheerio');

const puppeteer = require("puppeteer");

const dynamicCrawling = async(summonerName) => {
    let result = {
        "isInGame": false,
        "inGameBlueTeam": [],
        "inGameRedTeam": [],
    };

    const summonerInfo = async(page, selector) => {
        return {
            name: await page.$eval(selector+"> td.SummonerName.Cell > a", element => element.textContent),
            championName: await page.$eval(selector+"> td.ChampionImage.Cell > a", element => element.title),
            championHistoryRatio: await page.$eval(selector+"> td.ChampionInfo.Cell > div.WinRatio > span.Ratio", element => element.textContent),
            championHistoryCount: await page.$eval(selector+"> td.ChampionInfo.Cell > div.WinRatio > span.TotalCount", element => element.textContent),
            rankTier: await page.$eval(selector + "> td.CurrentSeasonTierRank.Cell > div.TierRank", element => element.textContent.trim()),
            rankHistory: await page.$eval(selector + "> td.RankedWinRatio.Cell", element => element.textContent.trim()),
            previousRankTier: await page.$eval(selector + "> td.PreviousSeasonTier.Cell > img", element => element.title)
        }
    }

    try{
        const browser = await puppeteer.launch(
            // {headless: false}
            );
        const page = await browser.newPage();
        await page.goto(`https://www.op.gg/summoner/userName=${encodeURI(summonerName)}`);
        await page.$eval('body > div.l-wrap.l-wrap--summoner > div.l-container > div > div > div.Menu > dl > dd.Item.tabHeader.inGame > a', element => element.click());
        setTimeout(()=>{}, 1000);
        let isInGameMessage = await page.$eval("div.tabItem.Content.SummonerLayoutContent.summonerLayout-spectator > div > h2", element => element.textContent).catch((reason => {return ""}));

        // 인게임 정보 가져오기
        if (isInGameMessage === ""){
            // 블루팀
            for(let i = 1; i <= 5; i++){
                let selector = `table.Table.Team-100 > tbody > tr:nth-child(${i})`
                result.inGameBlueTeam.push(
                    await summonerInfo(page, selector)
                )
            }
            // 레드팀
            for(let i = 1; i <= 5; i++){
                let selector = `table.Table.Team-200 > tbody > tr:nth-child(${i})`
                result.inGameRedTeam.push(
                    await summonerInfo(page, selector)
                )
            }
        }
        await browser.close();
        return result;
    }catch(error){
        console.error(error);
    }
}

const opggGetHTML = async(summonerName) => {
    try{
        return await axios.get(`https://www.op.gg/summoner/userName=${encodeURI(summonerName)}`,     {
            /* PC 화면 요청을 위한 header */
            headers: {
                'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.106 Whale/2.8.107.16 Safari/537.36',
                'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
                'Accept-Charset': 'application/x-www-form-urlencoded; charset=UTF-8',
            },
        });
    }catch(error){
        console.error(error);
    }
}

const poroGetHTML = async(summonerName) => {
    try{
        return await axios.get(`https://poro.gg/summoner/kr/${encodeURI(summonerName)}/ingame`,     {
            /* PC 화면 요청을 위한 header */
            headers: {
                'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.106 Whale/2.8.107.16 Safari/537.36',
                'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
                'Accept-Charset': 'application/x-www-form-urlencoded; charset=UTF-8',
            },
        });
    }catch(error){
        console.error(error);
    }
}

const opggWebCrawling = (summonerName) => {
    let result = {
        "isSummoner": false,
        "summonerName": "",
        "ranking": "",
        "soloTier": "Unranked",
        "soloPoint": "",
        "soloPercent": "",
        "freeTier": "Unranked",
        "freePoint": "",
        "freePercent": "",
        "recentKDA": "",
        "mostChampList" : [],
        "isInGame": false,
        "inGameBlueTeam": [],
        "inGameRedTeam": [],
    };

    return opggGetHTML(summonerName=summonerName)
    .then(html => {
        const $ = cheerio.load(html.data);
        const isSummoner = $("body > div.l-wrap.l-wrap--summoner > div.l-container > div > div.Header > h2").text();
        if(isSummoner !== ""){
        }else{
            result.isSummoner = true;
            result.summonerName = summonerName;
            // 랭킹
            result.ranking = $("body > div.l-wrap.l-wrap--summoner > div.l-container > div > div > div.Header > div.Profile > div.Information > div > div").text().replace("래더 랭킹", "").trim();
            // 솔로랭크 정보
            const soloTier = $("#SummonerLayoutContent > div.tabItem.Content.SummonerLayoutContent.summonerLayout-summary > div.SideContent > div.TierBox.Box > div > div.TierRankInfo > div.TierRank").text().trim();
            if(soloTier !== "Unranked"){
                result.soloTier = soloTier;
                result.soloPoint = $("#SummonerLayoutContent > div.tabItem.Content.SummonerLayoutContent.summonerLayout-summary > div.SideContent > div.TierBox.Box > div > div.TierRankInfo > div.TierInfo > span.LeaguePoints").text().trim();
                
                let soloWin = $("#SummonerLayoutContent > div.tabItem.Content.SummonerLayoutContent.summonerLayout-summary > div.SideContent > div.TierBox.Box > div > div.TierRankInfo > div.TierInfo > span.WinLose > span.wins").text().trim();
                let soloLoss = $("#SummonerLayoutContent > div.tabItem.Content.SummonerLayoutContent.summonerLayout-summary > div.SideContent > div.TierBox.Box > div > div.TierRankInfo > div.TierInfo > span.WinLose > span.losses").text().trim();
                let soloPercent = $("#SummonerLayoutContent > div.tabItem.Content.SummonerLayoutContent.summonerLayout-summary > div.SideContent > div.sub-tier > div > div.sub-tier__gray-text").text().replace("승률", "").trim();
                
                result.soloPercent = `${soloWin} ${soloLoss}(${soloPercent})`;
            }
            // 자유랭크 정보
            const freeTier = $("#SummonerLayoutContent > div.tabItem.Content.SummonerLayoutContent.summonerLayout-summary > div.SideContent > div.sub-tier > div > div.sub-tier__rank-tier").text().trim();
            if (freeTier !== "Unranked"){
                let freePointAndWinLoss = $("#SummonerLayoutContent > div.tabItem.Content.SummonerLayoutContent.summonerLayout-summary > div.SideContent > div.sub-tier > div > div.sub-tier__league-point").text().trim();
                let [freePoint, winAndLoss] = freePointAndWinLoss.split("/");
                let [freeWin, freeLoss] = winAndLoss.trim().split(" ");
                let freePercent = $("#SummonerLayoutContent > div.tabItem.Content.SummonerLayoutContent.summonerLayout-summary > div.SideContent > div.sub-tier > div > div.sub-tier__gray-text").text().replace("승률", "").trim();
            
                result.freeTier = freeTier;
                result.freePoint = freePoint.replace("LP", " LP");
                result.freePercent = `${freeWin} ${freeLoss}(${freePercent})`;
            }
            // 최근 KDA
            const recentKDAList = $("#GameAverageStatsBox-summary > div.Box > table > tbody > tr:nth-child(2) > td.KDA").text().replace(/\t/gi, "").replace(/ /gi, "").trim().split("\n");
            const recentKDA = recentKDAList.slice(0,3).join("");
            const recentKDAPercent = recentKDAList.slice(3).join(" ").trim();

            result.recentKDA = `${recentKDA} - ${recentKDAPercent}`

            // // Most Champ
            // let mostChampList = []
            // const champList = $("#SummonerLayoutContent > div.tabItem.Content.SummonerLayoutContent.summonerLayout-summary > div.SideContent > div.Box.tabWrap.stats-box._recognized > div.Content.tabItems > div.MostChampionContent > div > div");
            
            // champList.each((index, element)=>{
            //     console.log(index);
            //     mostChampList.push(
            //         {
            //             name: $(element).find("div.ChampionName").attr("title"),
            //             kdaMeanScore: $(element).find("div.ChampionInfo > div.PersonalKDA > div:nth-type(1) > span.KDA").text().trim(),
            //             kda: $(element).find("div.ChampionInfo > div.PersonalKDA > div.KDAEach").text().trim(),
            //             cs: $(element).find("div.ChampionInfo > div.ChampionMinionKill tip tpd-delegation-uid-1").text().trim(),
            //             percent: $(element).find("div.ChampionInfo > div.Plyed > div:nth-type(1)").text().trim(),
            //             gameCount: $(element).find("div.ChampionInfo > div.Plyed > div:nth-type(2)").text().trim(),
            //         }
            //     )
            // })
            
            // // 인게임 정보
            // const ingameMatch = $("div.SpectateSummoner > div > div.Content > table > tbody").children("tr");
            // ingameMatch.each( (index, element) => {
            //     console.log(`ingame ${index}`)
            // })
        }

        return result
    })

}

const poroWebCrawiling = (summonerName) => {
    let result = {
        "isInGame": false,
        "inGameBlueTeam": [],
        "inGameRedTeam": [],
    };

    return poroGetHTML(summonerName=summonerName)
    .then((html) => {
        const $ = cheerio.load(html.data)
        const isInGame = $("#wrapper > div > div > div > div.container.mt-3.mt-md-4.p-0 > div.container.mt-3.p-0.summoner-ingame-container > div > div > b").text();
        if(isInGame === ""){
            result.isInGame = true;

            const inGameBlueTeamInfo = $("table.live-match-team  > tbody > tr")
            console.log(inGameBlueTeamInfo.text())
            inGameBlueTeamInfo.each((index, element) => {
                console.log(index);
                result.inGameBlueTeam.push(
                    {
                        champion: $(element).children("td.summoner").children("div.cell.champion").children("div.champion.tooltipstered").children("img").attr("alt"),
                        summonerName: $(element).children("td.summoner > div.cell.summoner > div.summoner-name > a > span").text().trim(),

                    }
                )
            })

            const inGameRedTeamInfo = $("#wrapper > div > div > div > div.container.mt-3.mt-md-4.p-0 > div.container.mt-3.p-0.summoner-ingame-container > div:nth-child(2) > div > div > div > div.live-match__content > table.live-match-team.live-match-team--red.mt-2 > tbody > tr")
        }

        return result;
    })
}

module.exports.opggWebCrawling = opggWebCrawling;
module.exports.poroWebCrawiling = poroWebCrawiling;
module.exports.dynamicCrawling = dynamicCrawling;