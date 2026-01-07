import { NextResponse } from 'next/server';
import { pool } from '@/lib/db'; // さっき作った接続設定を読み込む

// GETリクエスト（データ取得）に対応する関数
export async function GET() {
  try {
    // データベースから授業データを取得するSQL
    const [rows] = await pool.query('SELECT * FROM classes');
    
    // 取得したデータをJSON形式で返す
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'データの取得に失敗しました' }, { status: 500 });
  }
}

// POSTリクエスト（データ登録）に対応する関数
export async function POST(request) {
  try {
    const body = await request.json();
    // 画面から送られてきたデータを取り出す
    const { title, teacher, location, capacity } = body;

    // データベースに保存するSQL
    // ※今回はシンプルにするため、実施回などは一旦省略しています
    const sql = `INSERT INTO classes (title, teacher, capacity) VALUES (?, ?, ?)`;
    
    await pool.query(sql, [title, teacher, capacity]);

    return NextResponse.json({ message: '登録成功' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: '登録エラー' }, { status: 500 });
  }
}
