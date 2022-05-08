const { Answer } = require('../../controllers');
module.exports = async (interaction) => {
  const { commandName, options, member } = interaction;
  let question, answer, modifyAnswer, message;
  try {
    switch (commandName) {
      case '답변추가':
        question = options.getString('question');
        answer = options.getString('answer');
        message = await Answer.insert(member, question, answer);
        await interaction.reply({
          content: message,
          ephemral: true
        })
        break;
      case '답변수정':
        question = options.getString('question');
        answer = options.getString('answer');
        modifyAnswer = options.getString('modify');
        message = await Answer.update(member, question, answer, modifyAnswer);
        await interaction.reply({
          content: message,
          ephemral: true
        })
        break;
      case '답변삭제':
        question = options.getString('question');
        message = await Answer.delete(message);
        await interaction.reply({
          content: message,
          ephemral: true
        })
        break;
      default:
        break;
    }
  } catch (err) {
    console.error(err);
  }
}