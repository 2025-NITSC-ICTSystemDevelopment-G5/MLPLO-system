import { NextResponse } from 'next/server';
import db from '@/module'

export async function GET() {
  try {
    // applications テーブルを作成
    // 内容: ID, 受験者ID, 試験名, 申し込み日, ステータス
    await db.query(`
      CREATE TABLE IF NOT EXISTS applications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        applicant_id VARCHAR(50) NOT NULL,
        exam_name VARCHAR(100) NOT NULL,
        applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(20) DEFAULT '受付済'
      )
    `);

    return NextResponse.json({ message: "テーブル作成成功！" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}