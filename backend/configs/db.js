import "dotenv/config";
import mysql from "mysql2";
import { logger } from "./logger.js";

const db = mysql.createPool({
   host: process.env.DB_HOST || "127.0.0.1",
   port: Number(process.env.DB_PORT) || 3306,
   user: process.env.DB_USER,
   password: process.env.DB_PASSWORD,
   database: process.env.DB_NAME,
   connectionLimit: Number(process.env.DB_CONN_LIMIT) || 10,
});

db.getConnection((err, connection) => {
   if (err) {
      logger.error({ err }, "MySQL connection failed");

      return;
   }
   connection.release();
   logger.info("MySQL pool connected");
});

db.on("error", (err) => {
   logger.error({ err }, "MySQL pool error");
});

export default db;
