import { NextResponse } from 'next/server';
import db from '@/module';
import bcrypt from 'bcryptjs'; // ★追加

export async function POST(request) {
  try {
    const { login_id, password } = await request.json();

    // 1. ログインIDでユーザーを検索
    // (password_hash を取得するように変更)
    const query = `
      SELECT * FROM applicants 
      WHERE login_id = ?
    `;

    const [rows] = await db.execute(query, [login_id]);

    // ユーザーが見つからない場合
    if (rows.length === 0) {
      return NextResponse.json({ message: 'IDまたはパスワードが違います' }, { status: 401 });
    }

    const user = rows[0];
    
    // 2. パスワードのハッシュ比較
    // 入力された password と DBの password_hash を比較
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return NextResponse.json({ message: 'IDまたはパスワードが違います' }, { status: 401 });
    }

    // 3. ログイン成功
    return NextResponse.json({
      success: true,
      user: {
        applicant_id: user.applicant_id,
        login_id: user.login_id,
        student_name: user.student_name,
        email: user.email,
        grade: user.grade,
        school_name: user.school_name,
        parent_name: user.parent_name
      }
    });

  } catch (error) {
    console.error('Login API Error:', error);
    return NextResponse.json({ message: 'サーバーエラー' }, { status: 500 });
  }
}