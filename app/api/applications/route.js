import { NextResponse } from 'next/server';
import db from '@/module'; 
import { v4 as uuidv4 } from 'uuid'; 

export async function POST(request) {
  try {
    const body = await request.json();
    // フロントエンドから class_id も受け取る必要があります
    const { applicant_id, session_id, class_id } = body;

    // バリデーション: class_id も必須チェックに追加
    if (!applicant_id || !session_id || !class_id) {
      return NextResponse.json(
        { message: '必要な情報（ID）が不足しています' },
        { status: 400 }
      );
    }

    // ID生成: char(32) に合わせるため、UUIDのハイフンを除去します
    const application_id = uuidv4().replace(/-/g, '');

    // データベースに保存
    // apply_datetime と lottery_status はデフォルト値があるので指定しません
    const query = `
      INSERT INTO application (application_id, applicant_id, class_id, session_id)
      VALUES (?, ?, ?, ?)
    `;
    
    await db.execute(query, [application_id, applicant_id, class_id, session_id]);

    return NextResponse.json({ message: '申し込みが完了しました' }, { status: 201 });

  } catch (error) {
    console.error('Application Error:', error);
    
    // 重複エラー (ERROR 1062)
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { message: 'すでに申し込み済みです' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: 'サーバーエラーが発生しました', error: error.message },
      { status: 500 }
    );
  }
}