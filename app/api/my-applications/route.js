import { NextResponse } from 'next/server';
import db from '@/module';

// キャッシュせずに毎回最新を取得
export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    // URLからユーザーIDを取得します (例: /api/my-applications?uid=STU123)
    const { searchParams } = new URL(request.url);
    const applicantId = searchParams.get('uid');

    if (!applicantId) {
      return NextResponse.json({ message: 'ユーザーIDが必要です' }, { status: 400 });
    }

    // 3つのテーブル（申込、授業、時間）を結合して情報を集めます
    const query = `
      SELECT 
        a.application_id,
        a.lottery_status,
        c.class_name,
        c.teacher_name,
        c.room_name,
        s.class_date,
        s.start_time,
        s.end_time
      FROM application a
      JOIN mock_class c ON a.class_id = c.class_id
      JOIN mock_session s ON a.session_id = s.session_id
      WHERE a.applicant_id = ?
      ORDER BY s.class_date ASC, s.start_time ASC
    `;

    const [rows] = await db.execute(query, [applicantId]);

    // 日付や時間の見栄えを整える
    const formattedRows = rows.map(row => {
      const dateObj = new Date(row.class_date);
      
      // 時間の "10:00:00" → "10:00"
      const formatTime = (t) => t ? t.toString().substring(0, 5) : '';

      return {
        id: row.application_id,
        className: row.class_name,
        teacher: row.teacher_name,
        room: row.room_name,
        date: dateObj.toLocaleDateString('ja-JP'),
        time: `${formatTime(row.start_time)} - ${formatTime(row.end_time)}`,
        status: row.lottery_status // PENDING, WIN, LOSE
      };
    });

    return NextResponse.json(formattedRows);

  } catch (error) {
    console.error('My Applications Error:', error);
    return NextResponse.json({ message: 'データ取得エラー' }, { status: 500 });
  }
}