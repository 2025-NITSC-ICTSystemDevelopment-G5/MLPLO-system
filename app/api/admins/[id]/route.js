import { NextResponse } from 'next/server';
import db from '../../../../db'; // 階層が深いため ../ を一つ追加

// GET: 取得
export async function GET(request, { params }) {
    const { id } = await params;
    const targetId = String(id).replace(/-/g, '');

    try {
        const [rows] = await db.execute(
            'SELECT admin_id, login_id, registed_date FROM admins WHERE admin_id = ?',
            [targetId]
        );

        if (rows.length === 0) {
            return NextResponse.json({ error: "管理者が存在しません" }, { status: 404 });
        }
        return NextResponse.json(rows[0]);
    } catch (error) {
        return NextResponse.json({ error: "DBエラー", details: error.message }, { status: 500 });
    }
}

// PUT: 更新
export async function PUT(request, { params }) {
    const { id } = await params;
    const targetId = String(id).replace(/-/g, '');
    const { login_id, password } = await request.json();

    try {
        const [rows] = await db.execute(
            'SELECT login_id, password FROM admins WHERE admin_id = ?',
            [targetId]
        );

        if (rows.length === 0) {
            return NextResponse.json({ error: "更新対象が見つかりません" }, { status: 404 });
        }

        const current = rows[0];
        const newLoginId = login_id || current.login_id;
        const newPassword = password || current.password;

        await db.execute(
            'UPDATE admins SET login_id = ?, password = ? WHERE admin_id = ?',
            [newLoginId, newPassword, targetId]
        );

        return NextResponse.json({ message: "更新成功" });
    } catch (error) {
        return NextResponse.json({ error: "DBエラー", details: error.message }, { status: 500 });
    }
}