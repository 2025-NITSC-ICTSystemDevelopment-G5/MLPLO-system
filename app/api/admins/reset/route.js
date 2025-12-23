// api/admin/reset/route.js (修正版)
import { NextResponse } from 'next/server';
import db from '../../../db';

export async function POST() {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 外部キー制約を一時的に無効化（一気に消すため）
        await connection.execute('SET FOREIGN_KEY_CHECKS = 0');

        // テーブル名を applicants に統一して削除
        await connection.execute('TRUNCATE TABLE application');
        await connection.execute('TRUNCATE TABLE mock_session');
        await connection.execute('TRUNCATE TABLE mock_class');
        await connection.execute('TRUNCATE TABLE applicants'); // ←ここを修正
        await connection.execute('TRUNCATE TABLE application_period');

        // 制約を元に戻す
        await connection.execute('SET FOREIGN_KEY_CHECKS = 1');

        await connection.commit();
        return NextResponse.json({ message: "全てのデータを初期化しました" });
    } catch (err) {
        await connection.rollback();
        return NextResponse.json({ error: "リセットに失敗しました" }, { status: 500 });
    } finally {
        connection.release();
    }
}