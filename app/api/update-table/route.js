import { NextResponse } from 'next/server';
import db from '@/db';

export async function GET() {
  try {
    // 既存の applications テーブルにカラムを追加
    await db.query(`
      ALTER TABLE applications
      ADD COLUMN class_name VARCHAR(100),
      ADD COLUMN class_time VARCHAR(50);
    `);
    return NextResponse.json({ message: "テーブル拡張完了！" });
  } catch (error) {
    // すでにある場合はエラーになりますが無視してOK
    return NextResponse.json({ message: "すでにカラムがあるか、エラーです", error: error.message });
  }
}