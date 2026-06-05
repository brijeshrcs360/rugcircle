import mysql from "mysql2/promise";
import fs from "fs";
const env = Object.fromEntries(fs.readFileSync(".env","utf8").split(/\r?\n/).filter(Boolean).filter(l=>!l.startsWith("#")).map(l=>{const i=l.indexOf("="); return [l.slice(0,i), l.slice(i+1)];}));
const conn = await mysql.createConnection({host:env.DB_HOST, port:Number(env.DB_PORT), user:env.DB_USER, password:env.DB_PASS, database:env.DB_NAME});
const [admins] = await conn.query("SELECT id,email,role,status FROM admin_users ORDER BY id");
const [sessionCount] = await conn.query("SELECT COUNT(*) AS c FROM admin_sessions");
console.log(JSON.stringify({admins, sessionCount: sessionCount[0].c}, null, 2));
await conn.end();
