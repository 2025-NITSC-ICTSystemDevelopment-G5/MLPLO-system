import mysql from 'mysql2/promise';

// DB接続プール（接続を使い回して高速化する仕組み）を作成
export const pool = mysql.createPool({
  host: '10.0.2.138',   // ★重要: DBサーバーの「プライベートIP」に書き換えてください！
  user: 'app_user',       // DBサーバーで作ったユーザー名
  password: 'Mlplo-system123',   // DBサーバーで作ったパスワード
  database: 'mlplo_db',  // データベース名
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});