import { NextResponse } from 'next/server';
import db from '@/module'

// POST: 生徒登録
export async function POST(request) {
    try {
        const body = await request.json();
        const { 
            applicant_id, login_id, password, student_name, 
            parent_name, school_name, grade, email 
        } = body;

        const query = `
            INSERT INTO applicants (
                applicant_id, login_id, password, student_name, 
                parent_name, school_name, grade, email
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const values = [
            applicant_id, login_id, password, student_name, 
            parent_name, school_name, grade, email
        ];

        await db.execute(query, values);

        return NextResponse.json({ 
            message: "申込者アカウントの登録が完了しました", 
            data: { applicant_id, student_name, email, school_name }
        }, { status: 201 });

    } catch (err) {
        console.error("登録エラー:", err);
        if (err.code === 'ER_DUP_ENTRY') {
            return NextResponse.json({ error: "このIDまたはログインIDは既に登録されています" }, { status: 400 });
        }
        return NextResponse.json({ error: "登録に失敗しました" }, { status: 500 });
    }
}

// GET: 一覧取得
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