import { NextResponse } from 'next/server';
import db from '@/module'; 

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const query = `
      SELECT 
        c.class_id,
        c.class_name,
        c.description,       
        c.summary_pdf_path,  
        c.teacher_name,      -- 先生の名前も取得
        c.room_name,         -- 教室名も取得
        s.session_id,
        s.class_date,
        s.start_time,
        s.end_time
      FROM mock_class c
      JOIN mock_session s ON c.class_id = s.class_id
      ORDER BY c.class_id, s.class_date, s.start_time
    `;
    
    const [rows] = await db.execute(query);

    const classesMap = new Map();

    rows.forEach(row => {
      if (!classesMap.has(row.class_id)) {
        classesMap.set(row.class_id, {
          id: row.class_id,
          name: row.class_name,
          // DBにdescriptionがない場合のエラー回避
          description: row.description || `担当: ${row.teacher_name} (場所: ${row.room_name})`, 
          pdfLink: row.summary_pdf_path || '#',
          sessions: []
        });
      }

      // 時間のフォーマット処理
      const formatTime = (timeStr) => {
        if (!timeStr) return '';
        // "10:00:00" → "10:00"
        return timeStr.toString().substring(0, 5); 
      };

      // 日付の処理
      const dateObj = new Date(row.class_date);
      const dateStr = dateObj.toLocaleDateString('ja-JP'); 

      classesMap.get(row.class_id).sessions.push({
        id: row.session_id,
        label: `${dateStr} ${formatTime(row.start_time)} - ${formatTime(row.end_time)}`
      });
    });

    const classesList = Array.from(classesMap.values());
    return NextResponse.json(classesList);

  } catch (error) {
    console.error('Fetch Classes Error:', error);
    return NextResponse.json({ message: '取得失敗', error: error.message }, { status: 500 });
  }
}