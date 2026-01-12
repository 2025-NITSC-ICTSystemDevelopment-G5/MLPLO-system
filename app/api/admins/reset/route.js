import { NextResponse } from 'next/server';
import db from '@/module';

export async function POST() {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // 1. 申し込みデータを削除
    await connection.query("DELETE FROM application");

    // 2. 授業の日時（セッション）を削除
    await connection.query("DELETE FROM mock_session");

    // 3. 授業データを削除
    await connection.query("DELETE FROM mock_class");

    await connection.commit();
    return NextResponse.json({ message: "全データの削除が完了しました。" });

  } catch (error) {
    await connection.rollback();
    console.error('Reset Error:', error);
    return NextResponse.json({ message: "削除中にエラーが発生しました。" }, { status: 500 });
  } finally {
    connection.release();
  }
}