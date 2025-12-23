import { NextResponse } from 'next/server';
// db.js が mysql2/promise を使って export されている前提です
import db from '../../../db'; 

// POST: 管理者ログインを実行
export async function POST(request) {
    try {
        const { login_id, password } = await request.json();

        // 1. MySQLの形式（?）でクエリを作成
        const query = `
            SELECT admin_id, login_id 
            FROM admins 
            WHERE login_id = ? AND password = ?
        `;
        
        // 2. MySQLでは [rows] の形で結果を受け取ります
        const [rows] = await db.execute(query, [login_id, password]);

        // 3. 一致するものがあればログイン成功
        if (rows.length > 0) {
            return NextResponse.json({
                success: true,
                message: "ログインに成功しました",
                admin: rows[0] // 最初の1件を返す
            });
        } else {
            // 4. 一致しなければエラーを返す
            return NextResponse.json({ 
                success: false, 
                error: "ログインIDまたはパスワードが正しくありません" 
            }, { status: 401 });
        }
    } catch (err) {
        console.error("Database Error:", err);
        return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
    }
}