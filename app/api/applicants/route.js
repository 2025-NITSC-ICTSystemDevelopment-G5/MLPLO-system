import { NextResponse } from 'next/server';
// db.js のパスは環境に合わせて調整してください
import db from '../../../db'; 

// --- 1. POST: 新しい申込者（生徒）を登録する ---
export async function POST(request) {
    try {
        const body = await request.json();
        const { 
            applicant_id, 
            login_id, 
            password, 
            student_name, 
            parent_name, 
            school_name, 
            grade,
            email 
        } = body;

        // MySQL形式: プレースホルダを ? に変更
        // RETURNING 句は削除
        const query = `
            INSERT INTO applicants (
                applicant_id, 
                login_id, 
                password, 
                student_name, 
                parent_name, 
                school_name, 
                grade,
                email
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const values = [
            applicant_id, 
            login_id, 
            password, 
            student_name, 
            parent_name, 
            school_name, 
            grade,
            email
        ];

        // MySQLの execute を実行
        const [result] = await db.execute(query, values);

        // 登録に成功したら、確認用に送信データを（パスワード以外）返す
        return NextResponse.json({ 
            message: "申込者アカウントの登録が完了しました", 
            data: {
                applicant_id,
                student_name,
                email,
                school_name
            }
        }, { status: 201 });

    } catch (err) {
        console.error("登録エラー:", err);
        // 重複エラー（すでにIDが使われている等）のハンドリング
        if (err.code === 'ER_DUP_ENTRY') {
            return NextResponse.json({ error: "このIDまたはログインIDは既に登録されています" }, { status: 400 });
        }
        return NextResponse.json({ error: "登録に失敗しました" }, { status: 500 });
    }
}

// --- 2. GET: 申込者一覧の取得 ---
export async function GET() {
    try {
        const query = 'SELECT applicant_id, student_name, school_name, grade, email FROM applicants ORDER BY applicant_id ASC';
        const [rows] = await db.execute(query);
        
        return NextResponse.json(rows);
    } catch (err) {
        console.error("取得エラー:", err);
        return NextResponse.json({ error: "取得失敗" }, { status: 500 });
    }
}