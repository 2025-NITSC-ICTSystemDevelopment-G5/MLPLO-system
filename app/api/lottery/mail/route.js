import { NextResponse } from 'next/server';
import db from '@/module';
import nodemailer from 'nodemailer';

export async function POST() {
    try {
        // ★修正: Gmail (Google Workspace) 用の設定に変更
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",  // 変更: Googleのサーバー
            port: 465,               // 変更: SSL用ポート
            secure: true,            // 変更: SSLを有効化
            auth: {
                user: "s2201107@sendai-nct.jp", 
                pass: "vwhm vgpl ynhq hmtp",    // そのまま使用
            },
        });

        // 送信対象（WIN または LOSE）を取得
        const sql = `
            SELECT 
                u.email, u.student_name, c.class_name, s.class_date, s.start_time, a.lottery_status
            FROM application a
            JOIN applicants u ON a.applicant_id = u.applicant_id
            JOIN mock_class c ON a.class_id = c.class_id
            JOIN mock_session s ON a.session_id = s.session_id
            WHERE a.lottery_status IN ('WIN', 'LOSE')
        `;
        const [rows] = await db.execute(sql);

        if (rows.length === 0) {
            return NextResponse.json({ message: "送信対象のデータがありません（抽選未実施の可能性があります）。" }, { status: 400 });
        }

        console.log(`${rows.length}件のメール送信を開始します...`);

        // メール送信処理（Promise.allで並列実行）
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
            
            // エラー時に止まらないよう個別にcatchする
            return transporter.sendMail({
                from: '"S高専 学務課" <s2201107@sendai-nct.jp>', // 送信元アドレスとauth.userを一致させるのが確実
                to: row.email,
                subject: subject,
                text: text,
            }).catch(err => {
                console.error(`メール送信失敗 (${row.email}):`, err);
                return null; // 失敗しても処理を続行
            });
        });

        await Promise.all(sendPromises);
        
        return NextResponse.json({ success: true, message: `${rows.length}件のメール送信処理が完了しました。` });

    } catch (error) {
        console.error('メール送信エラー:', error);
        return NextResponse.json({ error: "メール送信処理に失敗しました: " + error.message }, { status: 500 });
    }
}