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
function insertChatting(values) {
    connection.query('INSERT INTO chatting (author, message, created_at) VALUES (?, ?, ?)', values, (err, results, fields) => {
        if (err) throw err;
    })
}

module.exports.CreateTableChatting = createTableChatting;

module.exports.InsertChatting = insertChatting;