import { NextResponse } from 'next/server';
import db from '@/module'

export async function POST() {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
        await connection.execute('TRUNCATE TABLE application');
        await connection.execute('TRUNCATE TABLE mock_session');
        await connection.execute('TRUNCATE TABLE mock_class');
        await connection.execute('TRUNCATE TABLE applicants');
        await connection.execute('TRUNCATE TABLE application_period');
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