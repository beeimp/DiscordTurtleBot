const connection = require('../../config/db_config');

module.exports = {
  search: (msg) => {
    return new Promise((resolve, reject) => {
      connection.query(
        "SELECT answer FROM answers WHERE word = ?",
        msg.content,
        (err, result, fields) => {
          if (err) {
            reject(err);
          };
          if (result.length > 0 && result[0].answer) {
            const randInt = Math.floor(Math.random() * result.length);
            const answer = result[randInt].answer;
            resolve(answer);
          } else {
            reject('answer 검색결과가 없습니다.');
          }
        }
      );
    })
  },
  insert: (member, question, answer) => {
      return new Promise((resolve, reject) => {
        connection.query(
          "INSERT INTO answers (author_id, author, guild, channel, word, answer, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
          [
            member.user.id,
            member.user.username,
            member.guild.name,
            null,
            question,
            answer,
            new Date(),
          ],
          (err, results, fields) => {
            if (err) {
              reject(err);
            } else {
              resolve(`하나 배웠습니다!. ( 질문 : ${question} / 답변 : ${answer} )`);
            }
          }
        );
      });
  },
  update: (member, question, answer, modifyAnswer) => {
      return new Promise((resolve, reject) => {
        connection.query(
          "SELECT * from answers WHERE word = ? AND answer = ?",
          [question, answer],
          (err, result, fields) => {
            if (err) {
              reject(err);
              return;
            };
            if (result && result.length) {
              connection.query(
                "UPDATE answers SET author = ?, word = ?, answer = ?, created_at = ? WHERE word = ? AND answer = ?",
                [
                  member.user.id,
                  question,
                  modifyAnswer,
                  new Date(),
                  question,
                  answer,
                ],
                (err, results, fields) => {
                  if (err) {
                    reject(err);
                  } else {
                    resolve(
                      `수정했습니다. ( 질문 : ${question} / 답변 : ${answer} / 수정답변 ${modifyAnswer} )`
                    );
                  }
                }
              );
            } else {
              resolve(`해당 질문과 답변을 찾을 수 없습니다.\n( 질문 : ${question} / 답변 : ${answer} )`)
            }
          }
        );
      });
  },
  delete: (question) => {
    return new Promise((resolve, reject)=> {
      connection.query(
        "DELETE FROM answers WHERE word = ?",
        [question],
        (err, result, fields) => {
          if (err) {
            reject(err)
          } else {
            resolve(`"${question}"에 대한 답변을 모두 삭제했습니다.`);
          }
        }
      );
    })
  }
}