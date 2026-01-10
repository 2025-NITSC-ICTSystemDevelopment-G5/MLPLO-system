import { NextResponse } from 'next/server';
import db from '@/module';
import bcrypt from 'bcryptjs'; // ★追加: ハッシュ化ライブラリ

export async function POST(request) {
  try {
    const body = await request.json();
    
    // フロントエンドから送られてくるデータ
    const { 
      login_id, 
      password, // 入力された平文のパスワード
      student_name, 
      parent_name, 
      school_name, 
      grade, 
      email 
    } = body;

    // バリデーション（簡易）
    if (!login_id || !password || !student_name) {
      return NextResponse.json({ message: '必須項目が不足しています' }, { status: 400 });
    }

    // 1. パスワードをハッシュ化する
    const hashedPassword = await bcrypt.hash(password, 10);

    // 2. 新しいIDを生成 (UUID)
    // ※ cryptoはNode.js標準モジュールなのでimport不要で使えます
    const applicant_id = crypto.randomUUID();

    // 3. データベースに登録
    // ★重要: カラム名を 'password' ではなく 'password_hash' に変更
    const query = `
      INSERT INTO applicants (
        applicant_id, 
        login_id, 
        password_hash, 
        student_name, 
        parent_name, 
        school_name, 
        grade, 
        email
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    // ★重要: values配列にも、password ではなく hashedPassword を入れます
    await db.execute(query, [
      applicant_id,
      login_id,
      hashedPassword, // ハッシュ化したパスワード
      student_name,
      parent_name,
      school_name,
      grade,
      email
    ]);

    return NextResponse.json({ 
      message: "申込者アカウントの登録が完了しました",
      id: applicant_id
    }, { status: 201 });

  } catch (error) {
    console.error('Registration Error:', error);
    
    // ID重複エラーなどの場合
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ message: 'そのログインIDは既に使用されています' }, { status: 409 });
    }

    return NextResponse.json({ 
      message: "登録処理に失敗しました", 
      error: error.message 
    }, { status: 500 });
  }
}