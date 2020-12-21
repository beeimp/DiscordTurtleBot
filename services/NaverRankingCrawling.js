const  axios = require( 'axios');
const cheerio = require('cheerio');

const getHTML = async() => {
    try{
        return await axios.get('https://datalab.naver.com/keyword/realtimeList.naver');
    }catch(error){
        console.error(errror);
    }
}

const webCrawling = (count = 20) => {
    return getHTML()
    .then( html => {
        let titleList = [];
        const $ = cheerio.load(html.data);
        let bodyList = $("#content > div > div.selection_area > div.selection_content > div.field_list > div > div > ul >  li.ranking_item > div> span.item_title_wrap > span.item_title");
        bodyList = count < 20 ? bodyList.slice(count) : bodyList;
        bodyList.each( (i, element) => {
            titleList.push({
                rank: i+1,
                title: $(element).text()
            })
        })

        return titleList;
    });
}

module.exports = webCrawling;