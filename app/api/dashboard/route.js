import { NextResponse } from 'next/server';
import db from '@/db'; // ここならdbをインポートしてOK！

export async function GET() {
  try {
    // 例: ユーザー情報を取得するSQL (適宜書き換えてください)
    const [rows] = await db.execute('SELECT * FROM applicants LIMIT 1');
    
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}