const connection = require('../../config/db_config');

module.exports = {
  insert: (msg) => {
    const values = [
      msg.author.id,
      msg.author.username,
      msg.guild.name,
      msg.channel.name,
      msg.content,
      new Date(msg.createdTimestamp),
    ];
    connection.query(
      "INSERT INTO chatting (author_id, author, guild, channel, message, created_at) VALUES (?, ?, ?, ?, ?, ?)",
      values,
      (err, results, fields) => {
        if (err) throw err;
      }
    );
  }
}