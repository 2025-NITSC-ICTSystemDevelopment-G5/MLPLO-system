import { NextResponse } from 'next/server';
import db from '@/module';

// GET: 現在の設定（3つ）を取得
export async function GET() {
  try {
    const query = "SELECT * FROM system_settings WHERE setting_key IN ('application_start', 'application_end', 'lottery_announcement')";
    const [rows] = await db.execute(query);

    const settings = {};
    rows.forEach(row => {
      settings[row.setting_key] = row.setting_value;
    });

    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ message: '取得エラー' }, { status: 500 });
  }
}

// POST: 設定（3つ）を更新
export async function POST(request) {
  try {
    const { start, end, lottery } = await request.json();

    // 開始日時
    await db.execute(
      "UPDATE system_settings SET setting_value = ? WHERE setting_key = 'application_start'",
      [start]
    );

    // 終了日時
    await db.execute(
      "UPDATE system_settings SET setting_value = ? WHERE setting_key = 'application_end'",
      [end]
    );

    // ★追加: 抽選発表日時
    await db.execute(
      "UPDATE system_settings SET setting_value = ? WHERE setting_key = 'lottery_announcement'",
      [lottery]
    );

    return NextResponse.json({ message: '設定を保存しました' });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: '保存エラー' }, { status: 500 });
  }
}