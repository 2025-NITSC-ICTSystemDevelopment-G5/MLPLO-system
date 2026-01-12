import { NextResponse } from 'next/server';
import db from '@/module';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { login_id, password } = await request.json();

    // 1. IDで検索
    const query = 'SELECT * FROM admins WHERE admin_id = ?';
    const [rows] = await db.execute(query, [login_id]);

    if (rows.length === 0) {
      return NextResponse.json(
        { message: 'IDまたはパスワードが間違っています' },
        { status: 401 }
      );
    }

    const adminUser = rows[0];

    // 2. パスワードの照合 (bcryptで正しく比較)
    // ★ここを修正: 特例をなくし、本来の比較のみにします
    const isMatch = await bcrypt.compare(password, adminUser.password_hash);

    if (!isMatch) {
      return NextResponse.json(
        { message: 'IDまたはパスワードが間違っています' },
        { status: 401 }
      );
    }

    // 3. ログイン成功
    return NextResponse.json({
      success: true,
      admin: {
        admin_id: adminUser.admin_id
      }
    });

  } catch (error) {
    console.error('Admin Login Error:', error);
    return NextResponse.json(
      { message: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}