import { NextResponse } from 'next/server';
import db from '../../../db'; 

export async function POST(request) {
    const connection = await db.getConnection();

    try {
        const body = await request.json();
        const application_id = String(body.application_id).replace(/-/g, '');
        const applicant_id = String(body.applicant_id).replace(/-/g, '');
        const class_id = String(body.class_id).replace(/-/g, '');
        const session_id = String(body.session_id).replace(/-/g, '');

        await connection.beginTransaction();

        // 1. 期間バリデーション
        const periodQuery = `SELECT start_datetime, end_datetime FROM application_period LIMIT 1`; 
        const [periods] = await connection.execute(periodQuery);

        if (periods.length === 0) throw new Error("PERIOD_NOT_SET");
        const now = new Date();
        if (now < new Date(periods[0].start_datetime) || now > new Date(periods[0].end_datetime)) {
            throw new Error("OUT_OF_PERIOD");
        }

        // 2. 一人3件制限
        const userAppCountQuery = `SELECT COUNT(*) AS app_count FROM application WHERE applicant_id = ?`;
        const [countResult] = await connection.execute(userAppCountQuery, [applicant_id]);
        if (countResult[0].app_count >= 3) throw new Error("LIMIT_EXCEEDED");

        // 3. 二重申込チェック
        const duplicateCheckQuery = `SELECT 1 FROM application WHERE applicant_id = ? AND session_id = ?`;
        const [duplicateResult] = await connection.execute(duplicateCheckQuery, [applicant_id, session_id]);
        if (duplicateResult.length > 0) throw new Error("ALREADY_APPLIED");

        // 4. 登録
        const insertQuery = `
            INSERT INTO application (
                application_id, applicant_id, class_id, session_id, apply_datetime, lottery_status
            ) VALUES (?, ?, ?, ?, NOW(), 'PENDING')
        `;
        await connection.execute(insertQuery, [application_id, applicant_id, class_id, session_id]);

        // 5. カウントアップ
        const updateCountQuery = `UPDATE mock_session SET current_registrants = current_registrants + 1 WHERE session_id = ?`;
        await connection.execute(updateCountQuery, [session_id]);

        await connection.commit();
        return NextResponse.json({ 
            message: "申し込みを受け付けました。定員を超えた場合は抽選となります。" 
        }, { status: 201 });

    } catch (err) {
        await connection.rollback();
        console.error("申し込みエラー:", err);

        if (err.message === "PERIOD_NOT_SET") return NextResponse.json({ error: "申込期間が設定されていません" }, { status: 400 });
        if (err.message === "OUT_OF_PERIOD") return NextResponse.json({ error: "現在は申し込み期間外です" }, { status: 403 });
        if (err.message === "LIMIT_EXCEEDED") return NextResponse.json({ error: "申し込みは一人3件までです" }, { status: 400 });
        if (err.message === "ALREADY_APPLIED") return NextResponse.json({ error: "この授業は既に申し込み済みです" }, { status: 400 });

        return NextResponse.json({ error: "申し込み処理中にエラーが発生しました" }, { status: 500 });
    } finally {
        connection.release();
    }
}