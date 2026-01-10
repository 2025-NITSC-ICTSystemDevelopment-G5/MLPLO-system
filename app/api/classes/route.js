import { NextResponse } from 'next/server';
import db from '@/module';

// GET: 授業一覧を取得
export async function GET() {
  try {
    const query = `
      SELECT 
        c.class_id, 
        c.class_name, 
        c.teacher_name, 
        c.room_name, 
        c.max_capacity,
        c.description,
        s.class_date, 
        s.start_time, 
        s.end_time
      FROM mock_class c
      LEFT JOIN mock_session s ON c.class_id = s.class_id
      ORDER BY c.created_at DESC
    `;
    const [rows] = await db.execute(query);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('取得エラー:', error);
    return NextResponse.json({ message: '取得エラー' }, { status: 500 });
  }
}

// POST: 新規授業を登録
export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      class_id, 
      class_name, 
      teacher_name, 
      room_name, 
      max_capacity, 
      description,
      sessions 
    } = body;

    // 1. mock_class に保存
    // ★修正: 値が undefined の場合は null を入れるように "?? null" を追加しました
    await db.execute(
      `INSERT INTO mock_class 
       (class_id, class_name, teacher_name, room_name, max_capacity, description, created_by_admin_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        class_id, 
        class_name, 
        teacher_name ?? null, 
        room_name ?? null, 
        max_capacity ?? null, 
        description ?? null, 
        'admin'
      ]
    );

    // 2. mock_session に保存
    if (sessions && sessions.length > 0) {
      const s = sessions[0]; 
      // ★修正: こちらも同様に安全対策を追加
      await db.execute(
        `INSERT INTO mock_session 
         (session_id, class_id, class_date, start_time, end_time, max_capacity, current_registrants) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          s.session_id, 
          class_id, 
          s.class_date ?? null, 
          s.start_time ?? null, 
          s.end_time ?? null, 
          s.max_capacity ?? null, 
          0
        ]
      );
    }

    return NextResponse.json({ message: '登録完了' }, { status: 201 });

  } catch (error) {
    console.error('登録エラー:', error);
    return NextResponse.json({ message: '登録エラー' }, { status: 500 });
  }
}