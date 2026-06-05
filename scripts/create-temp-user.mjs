import bcrypt from 'bcryptjs'
import { pool } from '../server/src/lib/db.js'

const email = 'temp.user@rugcircle.com'
const mobile = '9999999999'
const password = 'Temp@1234'
const passwordHash = await bcrypt.hash(password, 10)

await pool.query(`INSERT INTO app_users (email, mobile, password_hash, full_name, status)
VALUES (:email,:mobile,:passwordHash,'Temp User','active')
ON DUPLICATE KEY UPDATE password_hash=:passwordHash, full_name='Temp User', status='active'`, { email, mobile, passwordHash })

console.log(`temp_user_ready email=${email} mobile=${mobile} password=${password}`)
await pool.end()
