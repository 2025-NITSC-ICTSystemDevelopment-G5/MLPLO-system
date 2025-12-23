/*
項目,書き換える内容
host,利用するメールサーバー（Gmailなら smtp.gmail.com など）
user,送信元として使うメールアドレス
pass,メールのパスワード（Gmailの場合は「アプリパスワード」）

① auth.user と from の完全一致
Gmailの場合、smtpConfig.user と transporter.sendMail の from に記載するメールアドレスが異なると、認証エラーになるか、強制的に user のアドレスに書き換えられることがあります。

今のコードは from: "..." <${smtpConfig.user}> となっているので合格ですが、テスト送信で送信元が意図通りか確認してください。
*/

import { NextResponse } from 'next/server';
import db from '@/lib/db';
import nodemailer from 'nodemailer';

export async function POST() {
    // 1. 環境設定
    const smtpConfig = {
        host: "smtp.gmail.com",
        port: 587,
        user: "your-email@gmail.com",
        pass: "xxxx xxxx xxxx xxxx", // 16桁のアプリパスワード
    };

    try {
        const transporter = nodemailer.createTransport({
            host: smtpConfig.host,
            port: smtpConfig.port,
            secure: false,
            auth: {
                user: smtpConfig.user,
                pass: smtpConfig.pass,
            },
        });

        // 2. 送信対象の取得（tmp_mailに記録がないものだけ）
        const selectSql = `
            SELECT  
                a.application_id, u.email, u.student_name,
                c.class_name, s.class_date, s.start_time, a.lottery_status
            FROM application a
            JOIN applicants u ON a.applicant_id = u.applicant_id
            JOIN mock_class c ON a.class_id = c.class_id
            JOIN mock_session s ON a.session_id = s.session_id
            LEFT JOIN tmp_mail t ON a.application_id = t.application_id
            WHERE a.lottery_status IN ('WIN', 'LOSE')
            AND t.application_id IS NULL
            LIMIT 20
        `;

        const [rows] = await db.query(selectSql);

        if (!rows || rows.length === 0) {
            return NextResponse.json({ message: "未送信の対象者はいません。", remaining: 0 });
        }

        let successCount = 0;

        for (const row of rows) {
            try {
                // --- 【修正：時間の安全なフォーマット処理】 ---
                let timeStr = "--:--";
                if (row.start_time) {
                    if (typeof row.start_time === 'string') {
                        // 文字列 "10:00:00" で来た場合
                        timeStr = row.start_time.substring(0, 5);
                    } else if (row.start_time instanceof Date) {
                        // Dateオブジェクトで来た場合
                        timeStr = row.start_time.toTimeString().substring(0, 5);
                    } else {
                        // それ以外の型（オブジェクト等）の場合、文字列化して ':' が含まれるか確認
                        const raw = String(row.start_time);
                        timeStr = raw.includes(':') ? raw.substring(0, 5) : "--:--";
                    }
                }
                // --- 【ここまで】 ---

                const isWin = row.lottery_status === 'WIN';
                const dateStr = new Date(row.class_date).toLocaleDateString('ja-JP');

                await transporter.sendMail({
                    from: `"S高専 学務課" <${smtpConfig.user}>`,
                    to: row.email,
                    subject: `【抽選結果】S高専オープンキャンパス（${row.class_name}）`,
                    text: `
${row.student_name} 様

S高専オープンキャンパス事務局です。
抽選結果をお知らせいたします。

【授業名】 ${row.class_name}
【日　時】 ${dateStr} ${timeStr}～
【結　果】 ${isWin ? '★ 当選 ★' : '残念ながら 落選'}

${isWin ? '当日は本メールを提示してください。' : 'またのご機会をお待ちしております。'}
                    `.trim(),
                });

                // tmp_mail テーブルに送信済みIDを記録
                await db.query('INSERT INTO tmp_mail (application_id) VALUES (?)', [row.application_id]);
                successCount++;

            } catch (mailError) {
                console.error(`個別送信エラー (${row.email}):`, mailError);
            }
        }

        // 3. 残り件数のカウント
        const [remainingRows] = await db.query(`
            SELECT COUNT(*) as count 
            FROM application a
            LEFT JOIN tmp_mail t ON a.application_id = t.application_id
            WHERE a.lottery_status IN ('WIN', 'LOSE') 
            AND t.application_id IS NULL
        `);
        const remainingCount = remainingRows[0].count;

        return NextResponse.json({
            success: true,
            processed: successCount,
            remaining: remainingCount,
            message: `${successCount}件の送信を完了しました。残り ${remainingCount}件です。`
        });

    } catch (error) {
        console.error('重大なシステムエラー:', error);
        return NextResponse.json({ error: "サーバー内部でエラーが発生しました" }, { status: 500 });
    }
}