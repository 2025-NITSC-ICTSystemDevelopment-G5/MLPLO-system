import { NextResponse } from 'next/server';
import db from '../../../db';

// GET: 申込期間設定を取得
export async function GET() {
    try {
        const query = `
            SELECT period_id, start_datetime, end_datetime 
            FROM application_period 
            ORDER BY start_datetime ASC
        `;
        
        // シンプルな取得は db.execute で問題ありません
        const [rows] = await db.execute(query);
        
        return NextResponse.json(rows);
    } catch (err) {
        console.error("GET Period Error:", err);
        return NextResponse.json({ error: "期間情報の取得に失敗しました" }, { status: 500 });
    }
}

// POST: 新しい申込期間を設定
export async function POST(request) {
    // プールからコネクションを取得（より確実にクローズするため）
    const connection = await db.getConnection();

    try {
        const body = await request.json();
        const { period_id, start_datetime, end_datetime } = body;

        // --- バリデーション ---
        if (!period_id || !start_datetime || !end_datetime) {
            return NextResponse.json({ error: "全ての項目を入力してください" }, { status: 400 });
        }

        // 開始日時と終了日時の論理チェック
        const start = new Date(start_datetime);
        const end = new Date(end_datetime);

        if (start >= end) {
            return NextResponse.json({ error: "終了日時は開始日時より後の時間を設定してください" }, { status: 400 });
        }

        // --- 登録実行 ---
        const query = `
            INSERT INTO application_period (period_id, start_datetime, end_datetime)
            VALUES (?, ?, ?)
        `;
        
        await connection.execute(query, [period_id, start_datetime, end_datetime]);
        
        return NextResponse.json({ 
            message: "期間を設定しました", 
            data: {
                period_id,
                start_datetime,
                end_datetime
            }
        }, { status: 201 });

    } catch (err) {
        console.error("POST Period Error:", err);
        
        // IDが重複した場合のエラーハンドリング
        if (err.code === 'ER_DUP_ENTRY') {
            return NextResponse.json({ error: "この期間IDは既に登録されています" }, { status: 400 });
        }

        return NextResponse.json({ error: "期間設定の保存に失敗しました" }, { status: 500 });
    } finally {
        // 必ずコネクションをプールに返す
        connection.release();
    }
}