import { NextResponse } from 'next/server';
import db from '@/lib/db'; 

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
            GROUP BY 
                s.session_id, c.class_id, c.class_name, c.max_capacity, 
                s.class_date, s.start_time, s.end_time
            ORDER BY s.class_date ASC, s.start_time ASC
        `;

        const [rows] = await db.query(sql);

        // --- 安全に時間を整形するヘルパー関数 ---
        const safeFormatTime = (val) => {
            if (!val) return "--:--";
            // 文字列に強制変換してから ":" があれば切り出す
            const s = String(val);
            return s.includes(':') ? s.substring(0, 5) : s;
        };

        const statusData = rows.map(row => {
            // カウント結果を確実に数値型にする
            const currentCount = Number(row.current_applicants || 0);
            const capacity = Number(row.max_capacity || 0);

            return {
                classId: row.class_id,
                className: row.class_name,
                sessionId: row.session_id,
                // 日付を日本形式の文字列に変換
                date: row.class_date ? new Date(row.class_date).toLocaleDateString('ja-JP') : "",
                time: `${safeFormatTime(row.start_time)}～${safeFormatTime(row.end_time)}`,
                capacity: capacity,
                currentCount: currentCount,
                // 充足率（%）
                fillRate: capacity > 0 
                    ? Math.round((currentCount / capacity) * 100) 
                    : 0,
                // 残り枠数
                remaining: capacity - currentCount
            };
        });

        return NextResponse.json(statusData);

    } catch (error) {
        console.error('申込状況取得エラー:', error);
        return NextResponse.json({ error: "申込状況の取得に失敗しました" }, { status: 500 });
    }
}