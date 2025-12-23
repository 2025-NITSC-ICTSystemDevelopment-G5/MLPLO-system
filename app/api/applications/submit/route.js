import { NextResponse } from 'next/server';
import db from '../../../db'; 

export async function POST(request) {
    // 1. まずプールから1つのコネクションを取得する
    const connection = await db.getConnection();

    try {
        const body = await request.json();
        
        // 【②の修正ポイント：ハイフンを除去して32文字に整形】
        // 全てのID（CHAR(32)のカラム）に対して実施します
        const application_id = String(body.application_id).replace(/-/g, '');
        const applicant_id = String(body.applicant_id).replace(/-/g, '');
        const class_id = String(body.class_id).replace(/-/g, '');
        const session_id = String(body.session_id).replace(/-/g, '');

        // 2. トランザクションを開始する
        await connection.beginTransaction();

        // --- バリデーション処理 ---

        // 1. 【期間バリデーション】
        const periodQuery = `SELECT start_datetime, end_datetime FROM application_period LIMIT 1`; 
        const [periods] = await connection.execute(periodQuery);

        if (periods.length === 0) {
            throw new Error("PERIOD_NOT_SET");
        }

        const now = new Date();
        const start = new Date(periods[0].start_datetime);
        const end = new Date(periods[0].end_datetime);

        if (now < start || now > end) {
            throw new Error("OUT_OF_PERIOD");
        }

        // 2. 【一人3件までの制限チェック】
        const userAppCountQuery = `
            SELECT COUNT(*) AS app_count FROM application WHERE applicant_id = ?
        `;
        const [countResult] = await connection.execute(userAppCountQuery, [applicant_id]);
        
        if (countResult[0].app_count >= 3) {
            throw new Error("LIMIT_EXCEEDED");
        }

        // 3. 【二重申し込みチェック】
        const duplicateCheckQuery = `
            SELECT 1 FROM application WHERE applicant_id = ? AND session_id = ?
        `;
        const [duplicateResult] = await connection.execute(duplicateCheckQuery, [applicant_id, session_id]);
        
        if (duplicateResult.length > 0) {
            throw new Error("ALREADY_APPLIED");
        }

        // --- 登録処理 ---

        // 4. 【申し込み登録】
        const insertQuery = `
            INSERT INTO application (
                application_id, applicant_id, class_id, session_id, apply_datetime, lottery_status
            ) VALUES (?, ?, ?, ?, NOW(), 'PENDING')
        `;
        // 整形済みのIDを使用
        await connection.execute(insertQuery, [application_id, applicant_id, class_id, session_id]);

        // 5. 【カウントアップ】
        const updateCountQuery = `
            UPDATE mock_session 
            SET current_registrants = current_registrants + 1 
            WHERE session_id = ?
        `;
        await connection.execute(updateCountQuery, [session_id]);

        // 3. すべて成功したらコミット（確定）
        await connection.commit();

        return NextResponse.json({ 
            message: "申し込みを受け付けました。定員を超えた場合は抽選となります。" 
        }, { status: 201 });

    } catch (err) {
        // 4. エラーが発生した場合はロールバック（取り消し）
        await connection.rollback();
        console.error("申し込みエラー:", err);

        // バリデーションエラーに応じたレスポンス
        if (err.message === "PERIOD_NOT_SET") {
            return NextResponse.json({ error: "申込期間が設定されていません" }, { status: 400 });
        }
        if (err.message === "OUT_OF_PERIOD") {
            return NextResponse.json({ error: "現在は申し込み期間外です" }, { status: 403 });
        }
        if (err.message === "LIMIT_EXCEEDED") {
            return NextResponse.json({ error: "申し込みは一人3件までです" }, { status: 400 });
        }
        if (err.message === "ALREADY_APPLIED") {
            return NextResponse.json({ error: "この授業は既に申し込み済みです" }, { status: 400 });
        }

        return NextResponse.json({ error: "申し込み処理中にエラーが発生しました" }, { status: 500 });

    } finally {
        // 5. 必ずコネクションをプールに返す
        connection.release();
    }
}