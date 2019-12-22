const db = require('../database')

const diaryModel = {
  insertFitur : async data => await db('fitur_bot_line').insert(data).then(result => data).catch(error => error),

  getFitur : async () => await db('fitur_bot_line')
}

module.exports = diaryModel