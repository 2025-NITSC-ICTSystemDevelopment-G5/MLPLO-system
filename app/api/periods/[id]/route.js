import { NextResponse } from 'next/server';
import db from '../../../../db';

// PUT: 期間設定の修正 (Update)
export async function PUT(request, { params }) {
    // 【重要】Next.js 15では params は await する必要があります
    const { id } = await params; 
    const connection = await db.getConnection();

    try {
        const body = await request.json();
        const { start_datetime, end_datetime } = body;

        // --- バリデーション ---
        const start = new Date(start_datetime);
        const end = new Date(end_datetime);

        if (start >= end) {
            return NextResponse.json(
                { error: "終了日時は開始日時より後の時間を設定してください" }, 
                { status: 400 }
            );
        }

        // MySQL形式で更新実行
        const query = `
            UPDATE application_period 
            SET start_datetime = ?, end_datetime = ?
            WHERE period_id = ?
        `;
        
        const [result] = await connection.execute(query, [start_datetime, end_datetime, id]);

        if (result.affectedRows === 0) {
            return NextResponse.json({ error: "指定された期間IDが見つかりません" }, { status: 404 });
        }

        return NextResponse.json({ 
            message: "期間を更新しました", 
            data: { period_id: id, start_datetime, end_datetime } 
        });

    } catch (err) {
        console.error("PUT Period Error:", err);
        return NextResponse.json({ error: "更新に失敗しました" }, { status: 500 });
    } finally {
        connection.release(); // 必ずコネクションを解放
    }
}

// DELETE: 期間設定の削除 (Delete)
export async function DELETE(request, { params }) {
    // 【重要】Next.js 15では params は await する必要があります
    const { id } = await params; 
    const connection = await db.getConnection();

    try {
        const query = 'DELETE FROM application_period WHERE period_id = ?';
        const [result] = await connection.execute(query, [id]);

        if (result.affectedRows === 0) {
            return NextResponse.json({ error: "削除対象が見つかりません" }, { status: 404 });
        }

        return NextResponse.json({ message: "期間設定を削除しました" });
    } catch (err) {
        console.error("DELETE Period Error:", err);
        // 外部キー制約などで削除できない場合のハンドリング
        return NextResponse.json({ 
            error: "削除に失敗しました",
            details: "この期間に紐づくデータがあるため削除できない可能性があります"
        }, { status: 500 });
    } finally {
        connection.release(); // 必ずコネクションを解放
    }
}