const mysql = require('mysql2/promise')

function getPool() {
  if (global.__nexpos_mysql_pool) return global.__nexpos_mysql_pool

  const pool = mysql.createPool({
    host: process.env.MYSQL_HOST || 'localhost',
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || '',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  })

  global.__nexpos_mysql_pool = pool
  return pool
}

module.exports = {
  getPool,
}

