import { NextResponse } from 'next/server';
import db from '@/module'

// PUT: 更新
export async function PUT(request, { params }) {
    const { id } = await params; 
    const connection = await db.getConnection();

    try {
        const body = await request.json();
        const { start_datetime, end_datetime } = body;

        if (new Date(start_datetime) >= new Date(end_datetime)) {
            return NextResponse.json(
                { error: "終了日時は開始日時より後の時間を設定してください" }, 
                { status: 400 }
            );
        }

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
        return NextResponse.json({ error: "更新に失敗しました" }, { status: 500 });
    } finally {
        connection.release();
    }
}

// DELETE: 削除
export async function DELETE(request, { params }) {
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
        return NextResponse.json({ error: "削除に失敗しました" }, { status: 500 });
    } finally {
        connection.release();
    }
}