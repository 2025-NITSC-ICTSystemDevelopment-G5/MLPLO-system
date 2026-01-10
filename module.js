import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  // ローカル環境なら 'localhost' または '127.0.0.1' 
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'app_user',
  password: process.env.DB_PASSWORD || 'Mlplo-system123',
  database: process.env.DB_NAME || 'mlplo_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;


//import mysql from 'mysql2/promise';
//
//const pool = mysql.createPool({
//  host: '10.0.2.138',   
//  user: 'app_user',       
//  password: 'Mlplo-system123',  
//  database: 'mlplo_db', 
//  waitForConnections: true,
//  connectionLimit: 10,
//  queueLimit: 0
//});
//
//export default pool;