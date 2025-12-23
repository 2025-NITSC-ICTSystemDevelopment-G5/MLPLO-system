import { NextResponse } from 'next/server';
import db from '@/lib/db'; // db.jsのパスは環境に合わせて調整してください

export async function POST() {
    let connection;

    try {
        connection = await db.getConnection();
        await connection.beginTransaction(); // データ整合性を守るためトランザクション開始

        // --- 1. 抽選対象データの取得 ---
        // まだ抽選されていない(PENDING)申し込みを、ランダムな順序で取得
        const [applications] = await connection.execute(`
            SELECT 
                a.application_id, 
                a.applicant_id, 
                a.class_id, 
                a.session_id,
                s.class_date, 
                s.start_time, 
                s.end_time,
                c.max_capacity
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

        // --- 2. 判定用の管理オブジェクト ---
        const sessionCountMap = new Map(); // セッションごとの現在の当選者数
        const userStats = {};             // ユーザーごとの当選状況
        const winners = [];               // 当選したapplication_idのリスト
        const losers = [];                // 落選したapplication_idと理由のリスト

        // --- 3. 抽選ロジックの実行 ---
        for (const app of applications) {
            const { application_id, applicant_id, class_id, session_id, class_date, start_time, end_time, max_capacity } = app;
            
            // 日付を文字列キーに変換 (YYYY-MM-DD)
            const dateKey = new Date(class_date).toISOString().split('T')[0];

            // ユーザーごとの統計初期化
            if (!userStats[applicant_id]) {
                userStats[applicant_id] = { wonClasses: new Set(), dailyCounts: {}, timeSlots: [] };
            }
            const stats = userStats[applicant_id];

            // セッションごとのカウント初期化
            if (!sessionCountMap.has(session_id)) {
                sessionCountMap.set(session_id, 0);
            }
            const currentSessionCount = sessionCountMap.get(session_id);

            // 条件判定 (要求事項に準拠)
            let failReason = null;

            if (currentSessionCount >= max_capacity) {
                failReason = "定員オーバー";
            } else if (stats.wonClasses.has(class_id)) {
                failReason = "同一授業重複";
            } else if ((stats.dailyCounts[dateKey] || 0) >= 2) {
                failReason = "1日2件制限";
            } else if (stats.timeSlots.some(slot => (start_time < slot.end && end_time > slot.start))) {
                failReason = "時間重複";
            }

            if (!failReason) {
                // 当選処理
                sessionCountMap.set(session_id, currentSessionCount + 1);
                stats.wonClasses.add(class_id);
                stats.dailyCounts[dateKey] = (stats.dailyCounts[dateKey] || 0) + 1;
                stats.timeSlots.push({ start: start_time, end: end_time });
                
                winners.push(application_id);
            } else {
                // 落選処理
                losers.push({ id: application_id, reason: failReason });
            }
        }

        // --- 4. データベースの更新 (MySQL) ---
        // 当選を反映
        if (winners.length > 0) {
            await connection.query(
                'UPDATE application SET lottery_status = "WIN" WHERE application_id IN (?)',
                [winners]
            );
        }

        // 落選を反映
        if (losers.length > 0) {
            const loserIds = losers.map(l => l.id);
            await connection.query(
                'UPDATE application SET lottery_status = "LOSE" WHERE application_id IN (?)',
                [loserIds]
            );
        }

        await connection.commit(); // すべての変更を確定

        // ターミナルへ結果表示
        console.log("\n" + "=".repeat(60));
        console.log(`抽選完了 (DB更新済み): 当選 ${winners.length}件 / 落選 ${losers.length}件`);
        console.table(losers.slice(0, 10)); // 落選理由のサンプルを表示
        console.log("=".repeat(60));

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