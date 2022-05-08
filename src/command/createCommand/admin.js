module.exports = (client, guild) => {
  let commands = guild ? guild.commands : client.application?.commands;

  // 추가
  commands?.create({
    name: '답변추가',
    description: '질문에 대한 답변을 추가합니다.',
    options: [
      {
        name: 'question',
        description: '질문을 입력하세요.',
        required: true,
        type: 3
      },
      {
        name: 'answer',
        description: '질문에 대한 답변을 입력하세요.',
        required: true,
        type: 3
      },
    ]
  })

  commands?.create({
    name: '답변수정',
    description: '질문에 대한 답변을 수정합니다.',
    options: [
      {
        name: 'question',
        description: '수정할 질문을 입력하세요.',
        required: true,
        type: 3
      },
      {
        name: 'answer',
        description: '기존 답변을 입력하세요.',
        required: true,
        type: 3
      },
      {
        name: 'modify',
        description: '변경할 답변을 입력하세요.',
        required: true,
        type: 3
      },
    ]
  })

  commands?.create({
    name: '답변삭제',
    description: '질문에 대한 답변을 삭제합니다.',
    options: [
      {
        name: 'question',
        description: '삭제할 질문을 입력하세요.',
        required: true,
        type: 3
      },
    ]
  })
}