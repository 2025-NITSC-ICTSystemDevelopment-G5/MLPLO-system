import { NextResponse } from 'next/server';
import db from '@/module';

export async function POST() {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // 1. まず全申し込みをリセット (PENDINGに戻す)
    // ※すでに確定している場合はスキップするなどの制御が必要ならここを調整
    await connection.query("UPDATE application SET lottery_status = 'PENDING'");

    // 2. セッション情報と申し込み状況を取得
    const [sessions] = await connection.query(`
      SELECT s.*, COUNT(a.application_id) as app_count
      FROM mock_session s
      LEFT JOIN application a ON s.session_id = a.session_id
      GROUP BY s.session_id
    `);

    // ユーザーごとの当選状況をメモリ上で管理（DB負荷軽減のため）
    // userWins[applicant_id][date_string] = [won_session_objects]
    const userWins = {};

    const registerWin = (userId, session) => {
        const dateKey = new Date(session.class_date).toDateString();
        if (!userWins[userId]) userWins[userId] = {};
        if (!userWins[userId][dateKey]) userWins[userId][dateKey] = [];
        userWins[userId][dateKey].push(session);
    };

    const checkConstraints = (userId, session) => {
        const dateKey = new Date(session.class_date).toDateString();
        const dailyWins = userWins[userId]?.[dateKey] || [];

        // 条件: 1日最大2件まで
        if (dailyWins.length >= 2) return false;

        // 条件: 時間帯の重複なし
        // 既存の当選授業と時間がかぶっていないかチェック
        const hasConflict = dailyWins.some(won => {
            return (session.start_time < won.end_time && session.end_time > won.start_time);
        });
        if (hasConflict) return false;

        return true;
    };

    // --- A. 定員割れのクラスを処理 (全員当選) ---
    const underCapacitySessions = sessions.filter(s => s.app_count <= s.max_capacity);
    
    for (const session of underCapacitySessions) {
        const [applicants] = await connection.query(
            "SELECT applicant_id FROM application WHERE session_id = ?", 
            [session.session_id]
        );
        
        for (const app of applicants) {
            // 定員割れでも、個人の条件（1日2件、重複）はチェックする
            if (checkConstraints(app.applicant_id, session)) {
                registerWin(app.applicant_id, session);
                await connection.query(
                    "UPDATE application SET lottery_status = 'WIN' WHERE applicant_id = ? AND session_id = ?",
                    [app.applicant_id, session.session_id]
                );
            } else {
                // 条件を満たさない場合は定員割れでも落選（またはエラー）扱い
                await connection.query(
                    "UPDATE application SET lottery_status = 'LOSE' WHERE applicant_id = ? AND session_id = ?",
                    [app.applicant_id, session.session_id]
                );
            }
        }
    }

    // --- B. 定員オーバーのクラスを処理 (抽選) ---
    const overCapacitySessions = sessions.filter(s => s.app_count > s.max_capacity);

    for (const session of overCapacitySessions) {
        // ランダムに並び替えて取得
        const [applicants] = await connection.query(
            "SELECT applicant_id FROM application WHERE session_id = ? ORDER BY RAND()", 
            [session.session_id]
        );

        let currentWinners = 0;

        for (const app of applicants) {
            // 定員内 かつ 制約クリアなら当選
            if (currentWinners < session.max_capacity && checkConstraints(app.applicant_id, session)) {
                registerWin(app.applicant_id, session);
                await connection.query(
                    "UPDATE application SET lottery_status = 'WIN' WHERE applicant_id = ? AND session_id = ?",
                    [app.applicant_id, session.session_id]
                );
                currentWinners++;
            } else {
                await connection.query(
                    "UPDATE application SET lottery_status = 'LOSE' WHERE applicant_id = ? AND session_id = ?",
                    [app.applicant_id, session.session_id]
                );
            }
        }
    }

    await connection.commit();
    return NextResponse.json({ message: "抽選処理が完了しました" });

  } catch (error) {
    await connection.rollback();
    console.error(error);
    return NextResponse.json({ message: "エラーが発生しました" }, { status: 500 });
  } finally {
    connection.release();
  }
}