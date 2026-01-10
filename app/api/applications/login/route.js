import { NextResponse } from 'next/server';
import db from '@/module';

export async function POST(request) {
  try {
    const { login_id, password } = await request.json();

    // データベースからユーザーを検索
    // ※パスワードの平文保存は練習用です。本番ではハッシュ化が推奨されます。
    const query = `
      SELECT * FROM applicants 
      WHERE login_id = ? AND password = ?
    `;

    const [rows] = await db.execute(query, [login_id, password]);

    if (rows.length > 0) {
      const user = rows[0];
      
      // ログイン成功！
      // 画面側にユーザー情報を返します（パスワードは返さないのがマナーです）
      return NextResponse.json({
        success: true,
        user: {
          applicant_id: user.applicant_id,
          login_id: user.login_id,
          // もし名前カラムがあれば user.name なども追加可能
        }
      });
    } else {
      // ユーザーが見つからない、またはパスワード間違い
      return NextResponse.json({ success: false, message: 'IDまたはパスワードが違います' }, { status: 401 });
    }

  } catch (error) {
    console.error('Login API Error:', error);
    return NextResponse.json({ message: 'サーバーエラー' }, { status: 500 });
  }
}