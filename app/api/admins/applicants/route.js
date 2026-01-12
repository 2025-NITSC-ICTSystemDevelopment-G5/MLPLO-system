import { NextResponse } from 'next/server';
import db from '@/module';

// 管理画面のテーブル用データ取得API
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 申込情報、生徒情報、授業情報を結合して取得
    // CSV出力と同じようなデータを取得しますが、JSONで返します
    const query = `
      SELECT 
        u.applicant_id,
        u.student_name, 
        u.parent_name, 
        u.school_name, 
        u.grade, 
        c.class_id,
        c.class_name, 
        a.lottery_status
      FROM application a
      JOIN applicants u ON a.applicant_id = u.applicant_id
      JOIN mock_class c ON a.class_id = c.class_id
      ORDER BY c.class_name ASC, u.student_name ASC
    `;

    const [rows] = await db.execute(query);

    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'データ取得エラー' }, { status: 500 });
  }
}