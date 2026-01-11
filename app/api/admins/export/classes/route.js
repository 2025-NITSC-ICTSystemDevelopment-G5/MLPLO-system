import { NextResponse } from 'next/server';
import db from '@/module';

export async function GET() {
  try {
    const sql = `
      SELECT 
        c.class_name, 
        c.teacher_name, 
        c.room_name, 
        c.description,
        s.class_date, 
        s.start_time, 
        s.end_time, 
        s.max_capacity,
        s.current_registrants
      FROM mock_session s
      JOIN mock_class c ON s.class_id = c.class_id
      ORDER BY s.class_date, s.start_time
    `;
    const [rows] = await db.execute(sql);

    // CSVヘッダー
    const header = ['授業名', '教員名', '教室', '日付', '開始時間', '終了時間', '定員', '現在の申込数', '説明'];
    
    // データ行の作成
    const csvRows = rows.map(row => {
      const dateStr = new Date(row.class_date).toLocaleDateString('ja-JP');
      // カンマを含む可能性のある文字データはダブルクォートで囲む
      return [
        `"${row.class_name}"`,
        `"${row.teacher_name || ''}"`,
        `"${row.room_name || ''}"`,
        `"${dateStr}"`,
        `"${row.start_time.substring(0, 5)}"`,
        `"${row.end_time.substring(0, 5)}"`,
        row.max_capacity,
        row.current_registrants,
        `"${(row.description || '').replace(/"/g, '""')}"` // 説明文中の"をエスケープ
      ].join(',');
    });

    // BOM (Byte Order Mark) を付けてExcelでの文字化けを防ぐ
    const csvString = '\uFEFF' + [header.join(','), ...csvRows].join('\n');

    return new NextResponse(csvString, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="classes_list.csv"',
      },
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'CSV作成エラー' }, { status: 500 });
  }
}