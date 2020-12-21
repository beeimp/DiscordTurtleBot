const mysql = require('mysql');
require('dotenv').config();

const axios = require('axios').default;
const fs = require('fs')

const connection = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PW,
    database: process.env.MYSQL_DATABASE
});

connection.connect((err) => {
    if (err) {
        console.error('error connecting' + err.stack);
        return;
    }

    console.log('connected as id ' + connection.threadId);
});

// db 끊김 방지
setInterval(function () {
    connection.query('SELECT 1');
}, 5000);

// chatting table에 내용추가
function insertChatting(msg) {
    const values = [msg.author.id, msg.author.username, msg.guild.name, msg.channel.name, msg.content, new Date(msg.createdTimestamp)];
    connection.query('INSERT INTO chatting (author_id, author, guild, channel, message, created_at) VALUES (?, ?, ?, ?, ?, ?)', values, (err, results, fields) => {
        if (err) throw err;
    })
}

// 채팅에서 link 추가
function insertLink(msg) {
    const linkImformation = msg.embeds[0]
    // const values = [msg.author.id, linkImformation.title, linkImformation.description, linkImformation.url, new Date(msg.createdTimestamp)];
    // connection.query(
    //     'INSERT INTO links (author, title, description, url, create_at) VALUES (?, ?, ?, ?, ?)',
    //     values,
    //     (err, results, fields) => {
    //         if (err) throw err;
    //     });
}
// local에 파일 추가 및 files table에 데이터 추가
async function insertFiles(msg) {
    const fileImformation = msg.attachments.toJSON()[0];
    let type_ = "";
    switch (`.${fileImformation.name.split(".")[1]}`) {
        case ".jpg":
        case ".png":
        case ".jpeg":
        case ".svg":
        case ".gif":
            type_ = "images";
            break;
        case ".mp3":
            type_ = "musics";
            break;
        default:
            type_ = "others";
    }

    await axios.get(fileImformation.url, {
        responseType: "stream"
    }).then((response) => {
        response.data.pipe(fs.createWriteStream(`./static/${type_}/${msg.createdTimestamp}_${fileImformation.name}`))


    })
    const values = [msg.author.id, msg.author.username, msg.guild.name, msg.channel.name, fileImformation.name, type_, new Date(msg.createdTimestamp)];
    connection.query(
        'INSERT INTO files (author_id, author, guild, channel, name,  extension, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        values,
        (err, results, fields) => {
            if (err) throw err;
        });
}

// bot의 답변을 db에서 검색
function searchAnswer(msg) {
    connection.query('SELECT answer FROM answers WHERE word = ?', msg.content, (err, result, fields) => {
        if (err) throw err;
        if (result.length > 0 && result[0].answer) {
            const randInt = Math.floor(Math.random() * result.length);
            const answer = result[randInt].answer;
            msg.reply(answer);
        }
    })
}

// bot 물음 추가
function insertAnswer(msg) {
    const msgContent = msg.content;
    let content = [msgContent.substr(0, 4)];
    const symbol = msgContent.indexOf("'") > 0 ? "'" : msgContent.indexOf('"') > 0 ? '"' : msgContent.indexOf('`') > 0 ? '`' : '-1';
    if (symbol != '-1') {
        let flag = false;
        let temp = '';
        for (let i = 4; i < msgContent.length; i++) {
            let msgContentChar = msgContent.charAt(i);
            if (msgContentChar == symbol) {
                if (flag) {
                    flag = false;
                    content.push(temp)
                    temp = '';
                } else {
                    flag = true;
                }
                continue;
            }
            if (flag) {
                temp = temp.concat(msgContentChar);
            }
        }
    } else {
        content = msgContent.split(' ');
    }

    if (content.length === 3) {
        connection.query(
            'INSERT INTO answers (author_id, author, guild, channel, word, answer, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [msg.author.id, msg.author.username, msg.guild.name, msg.channel.name, content[1], content[2], new Date(msg.createdTimestamp)],
            (err, results, fields) => {
                if (err) {
                    throw err;
                } else {
                    msg.reply(`하나 배웠습니다!. ( 질문 : ${content[1]} / 답변 : ${content[2]} )`)
                }
            })
    } else {
        msg.reply('양식이 틀렸어요! (!추가 <질문> <답변>)');
    }
}

// bot 물음 수정
function updateAnswer(msg) {
    const msgContent = msg.content;
    let content = [msgContent.substr(0, 4)];
    const symbol = msgContent.indexOf("'") > 0 ? "'" : msgContent.indexOf('"') > 0 ? '"' : msgContent.indexOf('`') > 0 ? '`' : '-1';
    if (symbol != '-1') {
        let flag = false;
        let temp = '';
        for (let i = 4; i < msgContent.length; i++) {
            let msgContentChar = msgContent.charAt(i);
            if (msgContentChar == symbol) {
                if (flag) {
                    flag = false;
                    content.push(temp)
                    temp = '';
                } else {
                    flag = true;
                }
                continue;
            }
            if (flag) {
                temp = temp.concat(msgContentChar);
            }
        }
    } else {
        content = msgContent.split(' ');
    }
    if (content.length === 4) {
        if (content[1][0] === '!') {
            msg.reply('명령어는 수정할 수 없습니다!');
        }
        else {
            connection.query('SELECT * from answers WHERE word = ? AND answer = ?', [content[1], content[2]], (err, result, fields) => {
                if (err) throw err;
                if (result && result.length) {
                    connection.query(
                        'UPDATE answers SET author = ?, word = ?, answer = ?, created_at = ? WHERE word = ? AND answer = ?',
                        [msg.author.id, content[1], content[3], new Date(msg.createdTimestamp), content[1], content[2]],
                        (err, results, fields) => {
                            if (err) throw err;
                            else {
                                msg.reply(`수정했습니다. ( 질문 : ${content[1]} / 답변 : ${content[2]} / 수정답변 ${content[3]} )`)
                            }
                        })
                } else {
                }
            })
        }
    } else {
        msg.reply('양식이 틀렸어요! (!수정 "질문" "답변" "수정할답변")');
    }
}

module.exports.SearchAnswer = searchAnswer;
module.exports.InsertChatting = insertChatting;
module.exports.InsertLink = insertLink;
module.exports.InsertFiles = insertFiles;
module.exports.InsertAnswer = insertAnswer;
module.exports.UpdateAnswer = updateAnswer;
