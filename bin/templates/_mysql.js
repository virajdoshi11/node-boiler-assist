require('dotenv').config();
import mysql from "mysql2/promise"

export const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
});

// close the connection
export async function closeMySQLPool() {
  try {
    await pool.end();
    console.log('MySQL connection pool closed.');
  } catch (error) {
    console.error('Error closing MySQL connection pool:', error);
    throw error;
  }
}
// <!-- process.on('exit', () => {
//   pool.end();
// }); -->