import { NextResponse } from 'next/server';
import db from '../../../db'; 

export async function GET() {
    try {
        const sql = `
            SELECT 
                c.class_id, c.class_name, c.max_capacity,
                s.session_id, s.class_date, s.start_time, s.end_time,
                COUNT(a.application_id) AS current_applicants
            FROM mock_class c
            JOIN mock_session s ON c.class_id = s.class_id
            LEFT JOIN application a ON s.session_id = a.session_id
            GROUP BY s.session_id, c.class_id, c.class_name, c.max_capacity, s.class_date, s.start_time, s.end_time
            ORDER BY s.class_date ASC, s.start_time ASC
        `;
        const [rows] = await db.query(sql);

        const statusData = rows.map(row => ({
            classId: row.class_id,
            className: row.class_name,
            sessionId: row.session_id,
            date: row.class_date,
            time: `${row.start_time.substring(0, 5)}～${row.end_time.substring(0, 5)}`,
            capacity: row.max_capacity,
            currentCount: row.current_applicants,
            fillRate: row.max_capacity > 0 ? Math.round((row.current_applicants / row.max_capacity) * 100) : 0,
            remaining: row.max_capacity - row.current_applicants
        }));

        return NextResponse.json(statusData);
    } catch (error) {
        console.error('申込状況取得エラー:', error);
        return NextResponse.json({ error: "申込状況の取得に失敗しました" }, { status: 500 });
    }
}