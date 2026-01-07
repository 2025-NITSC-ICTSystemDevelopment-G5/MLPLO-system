import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: '10.0.2.138',   
  user: 'app_user',       
  password: 'Mlplo-system123',  
  database: 'mlplo_db', 
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;