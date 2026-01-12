import { NextResponse } from 'next/server';
import db from '@/module';

export async function GET() {
  try {
    // 授業ごとの当選者一覧を取得
    const sql = `
      SELECT 
        c.class_name,
        s.class_date,
        s.start_time,
        u.applicant_id,
        u.student_name,
        u.email,
        a.lottery_status
      FROM application a
      JOIN mock_session s ON a.session_id = s.session_id
      JOIN mock_class c ON s.class_id = c.class_id
      JOIN applicants u ON a.applicant_id = u.applicant_id
      WHERE a.lottery_status = 'WIN'  /* ★当選者のみ出力 (全員出すならこの行を削除) */
      ORDER BY s.class_date, s.start_time, c.class_name, u.applicant_id
    `;
    const [rows] = await db.execute(sql);

    // CSVヘッダー
    const header = ['日付', '開始時間', '授業名', '学生氏名', '学生ID', 'メールアドレス', '状態'];

    // データ行の作成
    const csvRows = rows.map(row => {
      const dateStr = new Date(row.class_date).toLocaleDateString('ja-JP');
      return [
        `"${dateStr}"`,
        `"${row.start_time.substring(0, 5)}"`,
        `"${row.class_name}"`,
        `"${row.student_name}"`,
        `"${row.applicant_id}"`,
        `"${row.email}"`,
        `"${row.lottery_status === 'WIN' ? '当選' : '落選'}"`
      ].join(',');
    });

    const csvString = '\uFEFF' + [header.join(','), ...csvRows].join('\n');

    return new NextResponse(csvString, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="participants_list.csv"',
      },
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'CSV作成エラー' }, { status: 500 });
  }
}