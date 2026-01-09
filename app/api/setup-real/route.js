import { NextResponse } from 'next/server';
import db from '@/db';

export async function GET() {
  try {
    // 1. まず mock_session テーブルがないとエラーになるので、なければ作る（簡易版）
    await db.query(`
      CREATE TABLE IF NOT EXISTS mock_session (
        session_id CHAR(32) PRIMARY KEY,
        class_name VARCHAR(100),
        start_time DATETIME
      )
    `);

    // 2. ログにあった application テーブル（修正版）を作成
    // application_id は CHAR(32) なので、プログラム側でUUIDを作って入れます
    await db.query(`
      CREATE TABLE IF NOT EXISTS application (
        application_id CHAR(32) PRIMARY KEY,
        applicant_id VARCHAR(50) NOT NULL,
        class_id CHAR(32) NULL,
        session_id CHAR(32) NOT NULL,
        apply_datetime DATETIME DEFAULT CURRENT_TIMESTAMP,
        lottery_status ENUM('PENDING', 'WIN', 'LOSE') DEFAULT 'PENDING',
        
        -- ユニーク制約 (同じ人が同じ授業を2回申し込めないようにする)
        UNIQUE KEY unique_application (applicant_id, session_id)
      )
    `);

    // 3. テスト用に授業データ(mock_session)を入れておく
    // (これがないと申し込みでエラーになるため)
    await db.query(`
      INSERT IGNORE INTO mock_session (session_id, class_name, start_time) VALUES 
      ('sess_001', 'AIプログラミング体験', '2026-08-20 10:00:00'),
      ('sess_002', 'IoTロボット制御', '2026-08-20 13:00:00'),
      ('sess_003', '3D CADデザイン入門', '2026-08-20 15:00:00');
    `);

    return NextResponse.json({ message: "本格的なテーブル構造を作成しました！" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}