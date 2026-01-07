import { NextResponse } from 'next/server';
import db from '../../../../db'; 

export async function POST(request) {
    try {
        const { login_id, password } = await request.json();
        const query = `
            SELECT applicant_id, student_name, school_name, grade, email, parent_name
            FROM applicants 
            WHERE login_id = ? AND password = ?
        `;
        const [rows] = await db.execute(query, [login_id, password]);

        if (rows.length > 0) {
            return NextResponse.json({
                success: true,
                message: "ログインに成功しました",
                user: rows[0]
            });
        } else {
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