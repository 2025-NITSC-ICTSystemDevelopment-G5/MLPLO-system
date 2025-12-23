//import { NextResponse } from 'next/server';
// 相対パスで environment 直下の db.js を指定
//import db from '../../../db'; 

// 管理者一覧取得

//全体操作：app/api/admins/route.js
//理者を追加する： POST /api/admins
//管理者のリストを見る： GET /api/admins
//ダミーデータで動作検証済み


import { NextResponse } from 'next/server';
// environment 直下の db.js をインポート
import db from '../../../db'; 

// 管理者一覧取得 (MySQL版)
export async function GET() {
    try {
        // MySQLのクエリを実行
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

// 管理者新規登録 (MySQL版)
export async function POST(request) {
    try {
        const { admin_id, login_id, password } = await request.json();

        // MySQLでは $1, $2 ではなく ? を使います
        // また、MySQLに RETURNING 句はないため、INSERTのみ実行します
        const query = `
            INSERT INTO admins (admin_id, login_id, password, registed_date)
            VALUES (?, ?, ?, NOW())
        `;
        
        await db.execute(query, [admin_id, login_id, password]);

        // 登録した内容をレスポンスとして返す
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
