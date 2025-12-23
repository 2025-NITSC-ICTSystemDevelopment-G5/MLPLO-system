import { NextResponse } from 'next/server';
import db from '../../../../db'; 

// ID整形用の共通処理
const sanitizeId = (id) => String(id).replace(/-/g, '');

// --- 1. 特定の授業を取得 (GET) ---
export async function GET(request, { params }) {
    const { id } = await params; 
    const targetId = sanitizeId(id); // 32文字に整形

    try {
        const query = 'SELECT * FROM mock_class WHERE class_id = ?';
        const [rows] = await db.execute(query, [targetId]);

        if (rows.length === 0) {
            return NextResponse.json({ error: "見つかりません" }, { status: 404 });
        }
        return NextResponse.json(rows[0]);
    } catch (err) {
        console.error("GET Error:", err);
        return NextResponse.json({ error: "取得失敗" }, { status: 500 });
    }
}

// --- 2. 授業データ編集 (PUT) ---
export async function PUT(request, { params }) {
    const { id } = await params;
    const targetId = sanitizeId(id);

    try {
        const body = await request.json();

        // 【解決策：マージ処理】今のデータを一度取得する
        const [currentRows] = await db.execute(
            'SELECT * FROM mock_class WHERE class_id = ?', [targetId]
        );
        if (currentRows.length === 0) {
            return NextResponse.json({ error: "更新対象が見つかりません" }, { status: 404 });
        }
        const current = currentRows[0];

        // 送られてきた値があれば採用、なければ現在の値をキープ
        const class_name       = body.class_name       ?? current.class_name;
        const teacher_id       = body.teacher_id       ?? current.teacher_id;
        const teacher_name     = body.teacher_name     ?? current.teacher_name;
        const max_capacity     = body.max_capacity     ?? current.max_capacity;
        const room_name        = body.room_name        ?? current.room_name;
        const start_date       = body.start_date       ?? current.start_date;
        const end_date         = body.end_date         ?? current.end_date;
        const summary_pdf_path = body.summary_pdf_path ?? current.summary_pdf_path;

        const query = `
            UPDATE mock_class 
            SET 
                class_name = ?, 
                teacher_id = ?, 
                teacher_name = ?, 
                max_capacity = ?, 
                room_name = ?,
                start_date = ?,
                end_date = ?,
                summary_pdf_path = ?
            WHERE class_id = ?
        `;
        
        const values = [
            class_name, teacher_id, teacher_name, max_capacity, 
            room_name, start_date, end_date, summary_pdf_path, 
            targetId
        ];

        await db.execute(query, values);
        
        return NextResponse.json({ 
            message: "更新成功", 
            data: { class_id: targetId, class_name } 
        });
    } catch (err) {
        console.error("PUT Error:", err);
        return NextResponse.json({ error: "更新失敗", details: err.message }, { status: 500 });
    }
}

// --- 3. 授業個別削除 (DELETE) ---
export async function DELETE(request, { params }) {
    const { id } = await params;
    const targetId = sanitizeId(id);

    try {
        const query = 'DELETE FROM mock_class WHERE class_id = ?';
        const [result] = await db.execute(query, [targetId]);

        if (result.affectedRows === 0) {
            return NextResponse.json({ error: "削除対象が見つかりません" }, { status: 404 });
        }
        return NextResponse.json({ message: "削除しました" });
    } catch (err) {
        return NextResponse.json({ 
            error: "削除失敗", 
            details: "この授業に関連する実施回や申し込みがあるため削除できません。" 
        }, { status: 500 });
    }
}