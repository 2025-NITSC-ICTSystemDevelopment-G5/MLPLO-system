import { NextResponse } from 'next/server';
import db from '@/module' 

export async function POST() {
    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        // 1. 対象データ取得
        const [applications] = await connection.execute(`
            SELECT 
                a.application_id, a.applicant_id, a.class_id, a.session_id,
                s.class_date, s.start_time, s.end_time, c.max_capacity
            FROM application a
            JOIN mock_session s ON a.session_id = s.session_id
            JOIN mock_class c ON a.class_id = c.class_id
            WHERE a.lottery_status = 'PENDING'
            ORDER BY RAND()
        `);

        if (applications.length === 0) {
            await connection.rollback();
            return NextResponse.json({ message: "抽選対象の申し込み（PENDING）がありません。" });
        }

        const sessionCountMap = new Map();
        const userStats = {};
        const winners = [];
        const losers = [];

        // 2. 抽選ロジック
        for (const app of applications) {
            const { application_id, applicant_id, class_id, session_id, class_date, start_time, end_time, max_capacity } = app;
            const dateKey = new Date(class_date).toISOString().split('T')[0];

            if (!userStats[applicant_id]) {
                userStats[applicant_id] = { wonClasses: new Set(), dailyCounts: {}, timeSlots: [] };
            }
            const stats = userStats[applicant_id];
            
            if (!sessionCountMap.has(session_id)) sessionCountMap.set(session_id, 0);
            const currentSessionCount = sessionCountMap.get(session_id);

            let failReason = null;
            if (currentSessionCount >= max_capacity) failReason = "定員オーバー";
            else if (stats.wonClasses.has(class_id)) failReason = "同一授業重複";
            else if ((stats.dailyCounts[dateKey] || 0) >= 2) failReason = "1日2件制限";
            else if (stats.timeSlots.some(slot => (start_time < slot.end && end_time > slot.start))) failReason = "時間重複";

            if (!failReason) {
                sessionCountMap.set(session_id, currentSessionCount + 1);
                stats.wonClasses.add(class_id);
                stats.dailyCounts[dateKey] = (stats.dailyCounts[dateKey] || 0) + 1;
                stats.timeSlots.push({ start: start_time, end: end_time });
                winners.push(application_id);
            } else {
                losers.push({ id: application_id, reason: failReason });
            }
        }

        // 3. DB更新
        if (winners.length > 0) {
            await connection.query('UPDATE application SET lottery_status = "WIN" WHERE application_id IN (?)', [winners]);
        }
        if (losers.length > 0) {
            const loserIds = losers.map(l => l.id);
            await connection.query('UPDATE application SET lottery_status = "LOSE" WHERE application_id IN (?)', [loserIds]);
        }

        await connection.commit();
        
        console.log(`抽選完了: 当選 ${winners.length}件 / 落選 ${losers.length}件`);
        return NextResponse.json({
            success: true,
            summary: { total: applications.length, winners: winners.length, losers: losers.length }
        });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error("抽選エラー:", error);
        return NextResponse.json({ error: "抽選処理中にエラーが発生しました。" }, { status: 500 });
    } finally {
        if (connection) connection.release();
    }
}