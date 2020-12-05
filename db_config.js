const mysql = require('mysql');
require('dotenv').config();

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

function createTableChatting() {
    connection.query('CREATE TABLE `chatting`(`c_id` int AUTO_INCREMENT PRIMARY KEY, `author` CHAR(20), `message` TEXT, `created_at` DATETIME)')
}

function createTableAnswer() {
    connection.query('CREATE TABLE `answers`(`answers_id` int AUTO_INCREMENT PRIMARY KEY, `author` CHAR(20), `word` CHAR(200), `answer` CHAR(200), `created_at` DATETIME)')
}

function insertChatting(values) {
    connection.query('INSERT INTO chatting (author, message, created_at) VALUES (?, ?, ?)', values, (err, results, fields) => {
        if (err) throw err;
    })
}

function searchAnswer(msg) {
    connection.query('SELECT answer FROM answers WHERE word = ?', msg.content, (err, result, fields) => {
        if (err) throw err;
        if (result.length > 0 && result[0].answer) {
            const answer = result[0].answer;
            msg.reply(answer);
        }
    })
}

function insertAnswer(msg) {
    const content = msg.content.split(' ');
    if (content.length === 3) {
        connection.query('SELECT * from answers WHERE word = ?', [content[1]], (err, result, fields) => {
            if (err) throw err;
            if (result && result.length) {
                msg.reply('이미 등록된 질문입니다!');
            } else {
                connection.query(
                    'INSERT INTO answers (author, word, answer, created_at) VALUES (?, ?, ?, ?)',
                    [msg.author.username, content[1], content[2], new Date(msg.createdTimestamp)],
                    (err, results, fields) => {
                        if (err) {
                            throw err;
                        } else {
                            msg.reply(`하나 배웠습니다!. ( 질문 : ${content[1]} / 답변 : ${content[2]} )`)
                        }
                    })
            }
        })
    } else {
        msg.reply('양식이 틀렸어요! (!추가 <질문> <답변>)');
    }
}
function updateAnswer(msg) {
    const content = msg.content.split(' ');
    if (content.length === 3) {
        connection.query('SELECT * from answers WHERE word = ?', [content[1]], (err, result, fields) => {
            if (err) throw err;
            if (result && result.length) {
                connection.query(
                    'UPDATE answers SET author = ?, word = ?, answer = ?, created_at = ? WHERE word = ?',
                    [msg.author.username, content[1], content[2], new Date(msg.createdTimestamp), content[1]],
                    (err, results, fields) => {
                        if (err) throw err;
                        else{
                            msg.reply(`수정했습니다. ( 질문 : ${content[1]} / 답변 : ${content[2]} )`)
                        }
                    })
            } else {
            }
        })
    } else {
        msg.reply('양식이 틀렸어요! (!수정 <질문> <답변>)');
    }
}

module.exports.CreateTableChatting = createTableChatting;
module.exports.CreateTableAnswer = createTableAnswer;
module.exports.SearchAnswer = searchAnswer;
module.exports.InsertChatting = insertChatting;
module.exports.InsertAnswer = insertAnswer;
module.exports.UpdateAnswer = updateAnswer;
