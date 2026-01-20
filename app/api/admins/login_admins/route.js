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

    // 2. パスワードの照合
    const isMatch = await bcrypt.compare(password, adminUser.password_hash);

    if (!isMatch) {
      return NextResponse.json(
        { message: 'IDまたはパスワードが間違っています' },
        { status: 401 }
      );
    }

    // 3. ログイン成功
    // レスポンスオブジェクトを一旦作成
    const response = NextResponse.json({
      success: true,
      admin: {
        admin_id: adminUser.admin_id
      }
    });

    // 名前は 'adminToken' とし、値として admin_id を入れます
    response.cookies.set('adminToken', adminUser.admin_id, {
      httpOnly: true,    // JavaScriptから読み取れないようにする（セキュリティ）
      secure: process.env.NODE_ENV === 'production', // 本番環境ではHTTPSのみ
      maxAge: 60 * 60 * 24, // 1日（秒単位）
      path: '/',         // サイト全体で有効
    });

    return response;

  } catch (error) {
    console.error('Admin Login Error:', error);
    return NextResponse.json(
      { message: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}