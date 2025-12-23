import { NextResponse } from 'next/server';
// db.js が mysql2/promise の pool を export している前提です
import db from '../../../db'; 

// --- 1. 新規登録 (POST) ---
export async function POST(request) {
    // トランザクションのためにコネクションを取得
    const connection = await db.getConnection();
    try {
        const body = await request.json();
        const { 
            class_id, 
            class_name, 
            teacher_id, 
            teacher_name, 
            max_capacity, 
            room_name, 
            start_date, 
            end_date, 
            created_by_admin_id,
            sessions,
            summary_pdf_path,
        } = body;

        // トランザクション開始
        await connection.beginTransaction();

        // 1. mock_class への登録 (MySQL形式: ? を使用)
        const classQuery = `
            INSERT INTO mock_class (
                class_id, class_name, teacher_id, teacher_name, 
                max_capacity, room_name, start_date, end_date, 
                created_by_admin_id, created_at, summary_pdf_path
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)
        `;
        const classValues = [
            class_id, class_name, teacher_id, teacher_name, 
            max_capacity, room_name, start_date, end_date, 
            created_by_admin_id, summary_pdf_path
        ];
        await connection.execute(classQuery, classValues);

        // 2. mock_session への登録 
        if (sessions && sessions.length > 0) {
            for (const session of sessions) {
                const sessionQuery = `
                    INSERT INTO mock_session (
                        session_id, class_id, class_date, 
                        start_time, end_time, max_capacity, current_registrants
                    ) VALUES (?, ?, ?, ?, ?, ?, 0)
                `;
                const sessionValues = [
                    session.session_id, class_id, session.class_date, 
                    session.start_time, session.end_time, session.max_capacity
                ];
                await connection.execute(sessionQuery, sessionValues);
            }
        }

        // コミット（確定）
        await connection.commit();
        return NextResponse.json({ message: "登録完了" }, { status: 201 });

    } catch (err) {
        // エラー時はロールバック（取り消し）
        await connection.rollback();
        console.error("MySQL Error:", err);
        return NextResponse.json({ error: "登録失敗", details: err.message }, { status: 500 });
    } finally {
        // コネクションを解放（必須）
        connection.release();
    }
}

// --- 2. 一覧取得 (GET) ---
export async function GET() {
    try {
        const query = `
            SELECT c.*, s.session_id, s.class_date, s.start_time, s.end_time
            FROM mock_class c
            LEFT JOIN mock_session s ON c.class_id = s.class_id
            ORDER BY c.created_at DESC;
        `;
        // MySQLでは [rows] という形で結果を受け取ります
        const [rows] = await db.query(query);
        return NextResponse.json(rows);
    } catch (err) {
        console.error("MySQL Error:", err);
        return NextResponse.json({ error: "取得失敗" }, { status: 500 });
    }
}

// --- 3. 全データ削除・リセット (DELETE) ---
export async function DELETE() {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 外部キー制約がある場合、消す順番が重要です（申し込み -> セッション -> クラス）
        await connection.execute('DELETE FROM application');
        await connection.execute('DELETE FROM mock_session');
        await connection.execute('DELETE FROM mock_class');
        
        await connection.commit();
        return NextResponse.json({ message: "すべてのデータを削除しました" });
    } catch (err) {
        await connection.rollback();
        console.error("MySQL Error:", err);
        return NextResponse.json({ error: "リセットに失敗しました" }, { status: 500 });
    } finally {
        connection.release();
    }
}