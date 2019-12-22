const { DATABASE } = require('../config')
const knex = require('knex')({
  client: DATABASE.DB_CLIENT,
  connection: {
    host: DATABASE.DB_HOST,
    user: DATABASE.DB_USERNAME,
    password: DATABASE.DB_PASSWORD,
    database: DATABASE.DB_NAME
  }
})

knex.raw('SELECT 1+1 AS RESULT').then(() => console.log('Database connection success')).catch(error => console.log(error))

module.exports = knex