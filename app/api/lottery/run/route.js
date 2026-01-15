import { NextResponse } from 'next/server';
import db from '@/module';

export async function POST() {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // 1. 全申し込みをリセットし、すべての申し込みをランダムな順番で取得
    await connection.query("UPDATE application SET lottery_status = 'LOSE'");

    // 全ての申し込みデータ + セッション詳細をシャッフルして取得
    const [allApplications] = await connection.query(`
      SELECT 
        a.application_id, a.applicant_id, a.session_id,
        s.class_id, s.class_date, s.start_time, s.end_time, s.max_capacity
      FROM application a
      JOIN mock_session s ON a.session_id = s.session_id
      ORDER BY RAND()
    `);

    // メモリ上の管理用データ
    const userWins = {}; // userWins[applicant_id][date] = [sessions]
    const sessionWinnerCount = {}; // sessionWinnerCount[session_id] = count
    const userWonClassIds = {}; // userWonClassIds[applicant_id] = Set(class_id) - 同一授業の重複防止用

    // 制約チェック関数
    const checkConstraints = (app) => {
      const { applicant_id, session_id, class_id, class_date, start_time, end_time, max_capacity } = app;
      
      const dateKey = new Date(class_date).toDateString();
      if (!userWins[applicant_id]) userWins[applicant_id] = {};
      if (!userWins[applicant_id][dateKey]) userWins[applicant_id][dateKey] = [];
      if (!userWonClassIds[applicant_id]) userWonClassIds[applicant_id] = new Set();
      
      const dailyWins = userWins[applicant_id][dateKey];

      // 条件1: 授業の定員チェック
      const currentWinners = sessionWinnerCount[session_id] || 0;
      if (currentWinners >= max_capacity) return false;

      // 条件2: 同じ授業（別の時間帯含む）に既に当選していないか
      if (userWonClassIds[applicant_id].has(class_id)) return false;

      // 条件3: 1日最大2件まで
      if (dailyWins.length >= 2) return false;

      // 条件4: 時間帯の重複なし
      const hasTimeConflict = dailyWins.some(won => {
        return (start_time < won.end_time && end_time > won.start_time);
      });
      if (hasTimeConflict) return false;

      return true;
    };

    // 2. メインロジック：シャッフルされた申し込みを一列に並べて1つずつ判定
    for (const app of allApplications) {
      if (checkConstraints(app)) {
        // 当選処理
        const dateKey = new Date(app.class_date).toDateString();
        
        // 状態更新
        userWins[app.applicant_id][dateKey].push(app);
        userWonClassIds[app.applicant_id].add(app.class_id);
        sessionWinnerCount[app.session_id] = (sessionWinnerCount[app.session_id] || 0) + 1;

        // DB更新
        await connection.query(
          "UPDATE application SET lottery_status = 'WIN' WHERE application_id = ?",
          [app.application_id]
        );
      }
    }

    await connection.commit();
    return NextResponse.json({ message: "抽選が完了しました" });

  } catch (error) {
    await connection.rollback();
    console.error(error);
    return NextResponse.json({ message: "抽選エラーが発生しました" }, { status: 500 });
  } finally {
    connection.release();
  }
}