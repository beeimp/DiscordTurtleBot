
module.exports = async(interaction) => {
  const {commandName, options} = interaction;
  switch(commandName){
    case 'ping':
      await interaction.reply({
        content: 'Pong!',
        ephemeral: true
      });
      break;
    case '전체삭제':
      if (
        interaction.user.id === "373793790034706439" ||
        interaction.user.id === "425972339679690752"
      ) {
        const channelName = interaction.channel.name;
        await interaction.channel.delete();
        await interaction.guild.channels.create(channelName, {
          type: "text",
          permissionOverwrites: [
            {
              id: interaction.guild.id,
              allow: ["VIEW_CHANNEL"],
            },
          ],
        });
      } else {
        await interaction.reply({
          content: '권한이 없네..?',
          ephemeral: true
        })
      }
      break;
    case '삭제':
      const num = options.getInteger('number');
      interaction.channel.bulkDelete(num > 100 ? 100 : num);
      await interaction.reply({
        content: `${num > 100 ? 100 : num}개의 메세지를 지웠어!`,
        ephemeral: true
      })
      break;
    default:
      break;
  }
}