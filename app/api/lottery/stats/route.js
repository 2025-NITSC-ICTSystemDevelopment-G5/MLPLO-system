import { NextResponse } from 'next/server';
import db from '@/module';

export async function GET() {
  try {
    // 授業ごとの「定員」「申込数」「当選数」を一発で集計するSQL
    // LEFT JOIN application することで、申込が0件の授業も表示されます
    const sql = `
      SELECT 
        c.class_name,
        s.class_date,
        s.start_time,
        s.max_capacity,
        COUNT(a.application_id) as count,
        SUM(CASE WHEN a.lottery_status = 'WIN' THEN 1 ELSE 0 END) as winners
      FROM mock_session s
      JOIN mock_class c ON s.class_id = c.class_id
      LEFT JOIN application a ON s.session_id = a.session_id
      GROUP BY s.session_id, c.class_name, s.class_date, s.start_time, s.max_capacity
      ORDER BY s.class_date, s.start_time
    `;

    const [rows] = await db.execute(sql);

    // データを整形して返す
    const stats = rows.map(row => ({
      name: row.class_name,
      // 日付と時間を読みやすく整形
      dateInfo: `${new Date(row.class_date).toLocaleDateString()} ${row.start_time.substring(0, 5)}`,
      capacity: row.max_capacity,
      count: Number(row.count),   // COUNTの結果はBigIntになることがあるので数値変換
      winners: Number(row.winners || 0)
    }));

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Stats API Error:', error);
    return NextResponse.json({ message: 'データ取得エラー' }, { status: 500 });
  }
}