import { NextResponse } from 'next/server';
import db from '../../../db'; 

// GET: 管理者一覧取得
export async function GET() {
    try {
        const query = 'SELECT admin_id, login_id, registed_date FROM admins ORDER BY registed_date DESC';
        const [rows] = await db.execute(query); 
        return NextResponse.json(rows);
    } catch (err) {
        console.error("GET Error:", err);
        return NextResponse.json(
            { error: "管理者一覧の取得に失敗しました", details: err.message }, 
            { status: 500 }
        );
    }
}

// POST: 管理者新規登録
export async function POST(request) {
    try {
        const { admin_id, login_id, password } = await request.json();
        const query = `
            INSERT INTO admins (admin_id, login_id, password, registed_date)
            VALUES (?, ?, ?, NOW())
        `;
        await db.execute(query, [admin_id, login_id, password]);

        return NextResponse.json({ 
            admin_id, 
            login_id, 
            message: "登録が完了しました" 
        }, { status: 201 });
    } catch (err) {
        console.error("POST Error:", err);
        return NextResponse.json(
            { error: "登録に失敗しました", details: err.message }, 
            { status: 500 }
        );
    }
}