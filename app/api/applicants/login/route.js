import { NextResponse } from 'next/server';
import db from '../../../db'; 

// 申込者（生徒）ログイン
export async function POST(request) {
    try {
        const { login_id, password } = await request.json();

        // MySQL形式: ? を使用。パスワードは平文比較（現状の仕様に合わせます）
        const query = `
            SELECT applicant_id, student_name, school_name, grade, email, parent_name
            FROM applicants 
            WHERE login_id = ? AND password = ?
        `;
        
        // MySQLの execute は [rows, fields] を返すので [rows] で受け取る
        const [rows] = await db.execute(query, [login_id, password]);

        if (rows.length > 0) {
            // 一致するユーザーがいた場合
            return NextResponse.json({
                success: true,
                message: "ログインに成功しました",
                user: rows[0] // 取得した情報をそのまま返す
            });
        } else {
            // 見つからない、またはパスワード間違い
            return NextResponse.json(
                { success: false, error: "IDまたはパスワードが違います" }, 
                { status: 401 }
            );
        }
    } catch (err) {
        console.error("Login Error:", err);
        return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
    }
}