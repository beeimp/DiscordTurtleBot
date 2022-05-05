const mysql = require("mysql");
require("dotenv").config();

const axios = require("axios").default;
const fs = require("fs");

const connection = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PW,
  database: process.env.MYSQL_DATABASE,
});

connection.connect((err) => {
  if (err) {
    console.error("error connecting" + err.stack);
    return;
  }

  console.log("connected as id " + connection.threadId);
});

// db 끊김 방지
setInterval(function () {
  connection.query("SELECT 1");
}, 5000);

module.exports = connection;