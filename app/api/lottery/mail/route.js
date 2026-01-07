import { NextResponse } from 'next/server';
import db from '../../../db';
import nodemailer from 'nodemailer';

export async function POST() {
    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.example.com", 
            port: 587,
            secure: false,
            auth: {
                user: "s2201107@sendai-nct.jp", 
                pass: "vwhm vgpl ynhq hmtp",    
            },
        });

        const sql = `
            SELECT 
                u.email, u.student_name, c.class_name, s.class_date, s.start_time, a.lottery_status
            FROM application a
            JOIN applicants u ON a.applicant_id = u.applicant_id
            JOIN mock_class c ON a.class_id = c.class_id
            JOIN mock_session s ON a.session_id = s.session_id
            WHERE a.lottery_status IN ('WIN', 'LOSE')
        `;
        const [rows] = await db.query(sql);

        if (rows.length === 0) return NextResponse.json({ message: "送信対象のデータがありません。" });

        const sendPromises = rows.map((row) => {
            const isWin = row.lottery_status === 'WIN';
            const subject = `【抽選結果】S高専オープンキャンパス（${row.class_name}）`;
            const text = `
${row.student_name} 様

S高専オープンキャンパス事務局です。
抽選結果をお知らせいたします。

【授業名】 ${row.class_name}
【日　時】 ${new Date(row.class_date).toLocaleDateString('ja-JP')} ${row.start_time.substring(0, 5)}～
【結　果】 ${isWin ? '当選' : '残念ながら 落選'}

${isWin ? '当日は受付にて本メールを提示してください。' : 'ご希望に沿えない結果となりました。何卒ご了承ください。'}
            `;
            return transporter.sendMail({
                from: '"S高専 学務課" <info@example.jp>',
                to: row.email,
                subject: subject,
                text: text,
            });
        });

        await Promise.all(sendPromises);
        return NextResponse.json({ success: true, message: `${rows.length}件のメール送信を完了しました。` });

    } catch (error) {
        console.error('メール送信エラー:', error);
        return NextResponse.json({ error: "メール送信処理に失敗しました" }, { status: 500 });
    }
}