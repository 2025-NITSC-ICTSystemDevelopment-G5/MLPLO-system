import { NextResponse } from 'next/server';
import db from '@/module'

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const applicant_id = searchParams.get('user');

        if (!applicant_id) {
            return NextResponse.json({ error: "ユーザーIDを指定してください" }, { status: 400 });
        }

        const query = `
            SELECT 
                a.application_id, a.apply_datetime, a.lottery_status, 
                c.class_name, c.room_name, c.teacher_name,
                s.class_date, s.start_time, s.end_time
            FROM application a
            JOIN mock_class c ON a.class_id = c.class_id
            JOIN mock_session s ON a.session_id = s.session_id
            WHERE a.applicant_id = ?
            ORDER BY a.apply_datetime DESC
        `;
        const [rows] = await db.execute(query, [applicant_id]);
        return NextResponse.json(rows);
    } catch (err) {
        console.error("GET Status Error:", err);
        return NextResponse.json({ error: "申し込み状況の取得に失敗しました" }, { status: 500 });
    }
}