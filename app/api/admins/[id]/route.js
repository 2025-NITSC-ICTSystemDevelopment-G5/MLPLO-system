import { NextResponse } from 'next/server';
import db from '../../../db'; // 既存のプール(mysql2/promise版)を使う方が効率的です

// 取得 (GET)
export async function GET(request, { params }) {
    const { id } = await params;
    const targetId = String(id).replace(/-/g, ''); // 32文字に整形

    try {
        // セキュリティ修正: passwordを除外
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

// 更新 (PUT)
export async function PUT(request, { params }) {
    const { id } = await params;
    const targetId = String(id).replace(/-/g, '');
    const { login_id, password } = await request.json();

    try {
        // 1. 現在のデータを取得（パスワード更新有無の判定のためpasswordも一時的に取る）
        const [rows] = await db.execute(
            'SELECT login_id, password FROM admins WHERE admin_id = ?',
            [targetId]
        );

        if (rows.length === 0) {
            return NextResponse.json({ error: "更新対象が見つかりません" }, { status: 404 });
        }

        const current = rows[0];
        const newLoginId = login_id || current.login_id;
        // パスワードが送られてこない場合は、現在の値を維持する
        const newPassword = password || current.password;

        // 2. データを更新
        await db.execute(
            'UPDATE admins SET login_id = ?, password = ? WHERE admin_id = ?',
            [newLoginId, newPassword, targetId]
        );

        return NextResponse.json({ message: "更新成功" });
    } catch (error) {
        return NextResponse.json({ error: "DBエラー", details: error.message }, { status: 500 });
    }
}

// DELETEはご提示のもので概ねOKですが、UUIDのハイフン除去を入れるとより安全です