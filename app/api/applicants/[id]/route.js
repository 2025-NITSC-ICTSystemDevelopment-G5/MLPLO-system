import { NextResponse } from 'next/server';
import db from '@/module'

const sanitizeId = (id) => String(id).replace(/-/g, '');

// GET: 詳細取得
export async function GET(request, { params }) {
    const { id } = await params; 
    const targetId = sanitizeId(id);
    const connection = await db.getConnection();

    try {
        const query = `
            SELECT applicant_id, login_id, student_name, parent_name, school_name, grade, email 
            FROM applicants 
            WHERE applicant_id = ?
        `;
        const [rows] = await connection.execute(query, [targetId]);

        if (rows.length === 0) {
            return NextResponse.json({ error: "該当する申込者が見つかりません" }, { status: 404 });
        }
        return NextResponse.json(rows[0]);
    } catch (err) {
        return NextResponse.json({ error: "取得に失敗しました", details: err.message }, { status: 500 });
    } finally {
        connection.release();
    }
}

// PUT: 更新
export async function PUT(request, { params }) {
    const { id } = await params;
    const targetId = sanitizeId(id);
    const connection = await db.getConnection();

    try {
        const body = await request.json();
        const [currentRows] = await connection.execute(
            'SELECT * FROM applicants WHERE applicant_id = ?', [targetId]
        );
        if (currentRows.length === 0) {
            return NextResponse.json({ error: "更新対象が見つかりません" }, { status: 404 });
        }
        const current = currentRows[0];

        const student_name = body.student_name ?? current.student_name;
        const parent_name = body.parent_name ?? current.parent_name;
        const school_name = body.school_name ?? current.school_name;
        const grade = body.grade ?? current.grade;
        const email = body.email ?? current.email;

        const query = `
            UPDATE applicants 
            SET student_name = ?, parent_name = ?, school_name = ?, grade = ?, email = ?
            WHERE applicant_id = ?
        `;
        await connection.execute(query, [student_name, parent_name, school_name, grade, email, targetId]);

        return NextResponse.json({ 
            message: "更新に成功しました", 
            data: { applicant_id: targetId, student_name, email } 
        });
    } catch (err) {
        return NextResponse.json({ error: "更新に失敗しました", details: err.message }, { status: 500 });
    } finally {
        connection.release();
    }
}

// DELETE: 削除
export async function DELETE(request, { params }) {
    const { id } = await params;
    const targetId = sanitizeId(id);
    const connection = await db.getConnection();

    try {
        const query = 'DELETE FROM applicants WHERE applicant_id = ?';
        const [result] = await connection.execute(query, [targetId]);

        if (result.affectedRows === 0) {
            return NextResponse.json({ error: "削除対象が見つかりません" }, { status: 404 });
        }
        return NextResponse.json({ message: "削除が完了しました" });
    } catch (err) {
        return NextResponse.json({ 
            error: "削除に失敗しました",
            details: "申し込みデータが存在するため削除できません"
        }, { status: 500 });
    } finally {
        connection.release();
    }
}