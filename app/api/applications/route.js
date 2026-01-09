import { NextResponse } from 'next/server';
import db from '@/db';

// 申し込みを受け付ける (POST)
export async function POST(req) {
  try {
    const body = await req.json();
    const { applicant_id, exam_name } = body;

    // データベースに保存
    const query = `INSERT INTO applications (applicant_id, exam_name) VALUES (?, ?)`;
    await db.execute(query, [applicant_id, exam_name]);

    return NextResponse.json({ message: "申し込み完了" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}import { NextResponse } from 'next/server';
import db from '@/db';
import { v4 as uuidv4 } from 'uuid'; // ★UUIDを作るライブラリを使いたい

// もし uuid がインストールされていなければ、npm install uuid してください
// 面倒なら crypto.randomUUID() でもOKです（以下は標準機能を使う版）

export async function POST(req) {
  try {
    const body = await req.json();
    const { applicant_id, session_id } = body; // ★受け取るデータが変わりました

    // application_id を自動生成 (ランダムな文字列)
    const application_id = crypto.randomUUID().replace(/-/g, ''); // ハイフンを消して32文字にする

    const query = `
      INSERT INTO application 
      (application_id, applicant_id, session_id, lottery_status) 
      VALUES (?, ?, ?, 'PENDING')
    `;
    
    // class_id は一旦 NULL で進めます（ログでも NULL OK になっていたため）
    await db.execute(query, [application_id, applicant_id, session_id]);

    return NextResponse.json({ message: "申し込み完了" });
  } catch (error) {
    // 同じ授業に2回申し込んだ場合のエラー処理
    if (error.code === 'ER_DUP_ENTRY') {
       return NextResponse.json({ error: "すでにこの授業には申し込んでいます" }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}