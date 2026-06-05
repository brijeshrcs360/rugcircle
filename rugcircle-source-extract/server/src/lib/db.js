import mysql from 'mysql2/promise'
import { config } from '../config/env.js'

export const pool = mysql.createPool({
  ...config.db,
  connectionLimit: 10,
  waitForConnections: true,
  queueLimit: 0,
  namedPlaceholders: true,
  decimalNumbers: true,
})

