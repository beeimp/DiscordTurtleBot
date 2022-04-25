module.exports = (client, guild) => {
  let commands = guild ? guild.commands : client.application?.commands;
  
  // test
  commands?.create({
    name: 'ping',
    description: 'Poing!',
  })


  // 전체삭제
  commands?.create({
    name: '전체삭제',
    description: '해당 채널이 삭제 후 다시 생성됩니다.'
  })

  // 삭제
  commands?.create({
    name: '삭제',
    description: 'n개의 내용을 삭제합니다.',
    options: [
      {
        name: 'number',
        description: '삭제할 개수(최대 100개)',
        required: true,
        type: 4
      }
    ]
  })
}