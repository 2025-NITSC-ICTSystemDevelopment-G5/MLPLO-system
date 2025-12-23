import { NextResponse } from 'next/server';
import db from '../../../../db'; 

// ID整形用の共通処理
const sanitizeId = (id) => String(id).replace(/-/g, '');

// 1. 特定の実施回(セッション)を取得
export async function GET(request, { params }) {
    const { id } = await params;
    const targetId = sanitizeId(id);

    try {
        // カラムを明示的に指定（セキュリティと効率のため）
        const query = `
            SELECT session_id, class_id, class_date, start_time, end_time, max_capacity, current_registrants 
            FROM mock_session 
            WHERE session_id = ?
        `;
        const [rows] = await db.execute(query, [targetId]);

        if (rows.length === 0) {
            return NextResponse.json({ error: "実施回が見つかりません" }, { status: 404 });
        }
        return NextResponse.json(rows[0]);
    } catch (err) {
        console.error("GET Session Error:", err);
        return NextResponse.json({ error: "取得失敗" }, { status: 500 });
    }
}

// 2. 実施回データの編集 (PUT)
export async function PUT(request, { params }) {
    const { id } = await params;
    const targetId = sanitizeId(id);

    try {
        const body = await request.json();

        // --- 修正：現在のデータを取得してマージする ---
        const [currentRows] = await db.execute(
            'SELECT * FROM mock_session WHERE session_id = ?', [targetId]
        );
        if (currentRows.length === 0) {
            return NextResponse.json({ error: "更新対象が見つかりません" }, { status: 404 });
        }
        const current = currentRows[0];

        // 送られてきた値があれば採用、なければ現在の値を維持
        const class_date = body.class_date ?? current.class_date;
        const start_time = body.start_time ?? current.start_time;
        const end_time = body.end_time ?? current.end_time;
        const max_capacity = body.max_capacity ?? current.max_capacity;

        const query = `
            UPDATE mock_session 
            SET class_date = ?, start_time = ?, end_time = ?, max_capacity = ?
            WHERE session_id = ?
        `;
        
        const values = [class_date, start_time, end_time, max_capacity, targetId];
        await db.execute(query, values);

        return NextResponse.json({ 
            message: "更新成功", 
            data: { session_id: targetId, class_date, start_time, end_time, max_capacity } 
        });
    } catch (err) {
        console.error("PUT Session Error:", err);
        return NextResponse.json({ error: "更新失敗" }, { status: 500 });
    }
}

// 3. 削除 (DELETE)
export async function DELETE(request, { params }) {
    const { id } = await params;
    const targetId = sanitizeId(id);

    try {
        const query = 'DELETE FROM mock_session WHERE session_id = ?';
        const [result] = await db.execute(query, [targetId]);

        if (result.affectedRows === 0) {
            return NextResponse.json({ error: "削除対象が見つかりません" }, { status: 404 });
        }
        return NextResponse.json({ message: "実施回を削除しました" });
    } catch (err) {
        return NextResponse.json({ 
            error: "削除失敗", 
            details: "このセッションには既に申し込みがあるため削除できません。先に申し込みデータを削除してください。" 
        }, { status: 500 });
    }
}