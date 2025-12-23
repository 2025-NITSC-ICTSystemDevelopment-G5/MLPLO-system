import { NextResponse } from 'next/server';
import db from '@/lib/db';
import PDFDocument from 'pdfkit';
import path from 'path';
import fs from 'fs';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const mode = searchParams.get('mode'); // 'participants' (当選者のみ) or 'applicants' (全員)
        const classId = searchParams.get('classId'); // 特定の授業で絞り込む場合のID

        let sql = "";
        let params = [];
        let title = "";
        let fileName = "";

        // 1. モード判定とSQL構築 (仕様書「(3)抽選結果確認、(4)一覧表示・PDF出力」に対応)
        if (mode === 'participants' || mode === 'applicants') {
            const isWinnerOnly = mode === 'participants';
            title = isWinnerOnly ? "模擬授業 参加者名簿 (当選者のみ)" : "模擬授業 申込者一覧 (全登録者)";
            fileName = isWinnerOnly ? "participants_list.pdf" : "applicants_full_list.pdf";
            
            sql = `
                SELECT 
                    u.applicant_id, u.student_name, u.parent_name, u.school_name, u.grade, u.email,
                    c.class_name, c.room_name,
                    s.session_id, s.class_date, s.start_time, s.end_time,
                    a.lottery_status, a.apply_datetime
                FROM application a
                JOIN applicants u ON a.applicant_id = u.applicant_id
                JOIN mock_class c ON a.class_id = c.class_id
                JOIN mock_session s ON a.session_id = s.session_id
                WHERE 1=1
                ${isWinnerOnly ? "AND a.lottery_status = 'WIN'" : ""}
                ${classId ? "AND c.class_id = ?" : ""}
                ORDER BY c.class_name ASC, s.start_time ASC, u.student_name ASC
            `;
            if (classId) params.push(classId);

        } else {
            // 2. 模擬授業情報一覧 (仕様書「(1)模擬授業開講情報」に対応)
            title = "模擬授業・セッション実施一覧";
            fileName = "class_session_info.pdf";
            sql = `
                SELECT 
                    c.class_name, c.teacher_name, c.room_name, 
                    s.session_id, s.class_date, s.start_time, s.end_time, s.max_capacity
                FROM mock_class c
                JOIN mock_session s ON c.class_id = s.class_id
                ORDER BY s.class_date ASC, s.start_time ASC
            `;
        }

        const [rows] = await db.query(sql, params);

        // 3. PDFドキュメント生成準備
        const doc = new PDFDocument({ margin: 40, size: 'A4' });
        const chunks = [];
        doc.on('data', (chunk) => chunks.push(chunk));

        // 4. 日本語フォント設定 (エラーハンドリング強化)
        const fontPath = path.join(process.cwd(), 'public/fonts/ipaexg.ttf');
        if (!fs.existsSync(fontPath)) {
            return NextResponse.json({ 
                error: "フォントファイル(ipaexg.ttf)が見つかりません。public/fonts/ フォルダを確認してください。" 
            }, { status: 500 });
        }
        doc.font(fontPath);

        // ヘルパー: 時刻表示の安全な変換 (MySQLのTIME型対応)
        const formatTime = (timeVal) => {
            if (!timeVal) return "--:--";
            if (typeof timeVal === 'string') return timeVal.substring(0, 5); // "10:00:00" -> "10:00"
            if (timeVal instanceof Date) {
                return timeVal.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
            }
            return "--:--";
        };

        // 5. PDF描画ロジック
        doc.fontSize(18).text(title, { align: 'center' });
        if (classId && rows.length > 0) {
            doc.fontSize(12).text(`対象授業: ${rows[0].class_name}`, { align: 'center' });
        }
        doc.moveDown(1.2);

        rows.forEach((row, index) => {
            if (doc.y > 720) doc.addPage(); // 自動改ページ

            const dateStr = row.class_date ? new Date(row.class_date).toLocaleDateString('ja-JP') : "";
            const timeStr = `${formatTime(row.start_time)} ～ ${formatTime(row.end_time)}`;

            if (mode === 'participants' || mode === 'applicants') {
                const status = row.lottery_status === 'WIN' ? '当選' : row.lottery_status === 'LOSE' ? '落選' : '待機中';
                
                // UIラフに基づき「登録者情報」を網羅
                doc.fontSize(11).fillColor("black").text(`${index + 1}. ${row.student_name} 様 (${row.school_name} ${row.grade}年)`);
                doc.fontSize(9).fillColor("#444444").text(
                    `   【登録ID】 ${row.applicant_id} / 【保護者氏名】 ${row.parent_name || '未記入'}\n` +
                    `   【メール】 ${row.email}\n` +
                    `   【希望授業】 ${row.class_name} (場所: ${row.room_name})\n` +
                    `   【実施回】 ${dateStr} ${timeStr} / 【抽選状態】 ${status}`,
                    { indent: 14, lineGap: 2 }
                );
            } else {
                // 授業一覧用レイアウト
                doc.fontSize(11).fillColor("black").text(`${index + 1}. ${row.class_name}`);
                doc.fontSize(9).fillColor("#444444").text(
                    `   担当: ${row.teacher_name || '未定'} / 場所: ${row.room_name}\n` +
                    `   日時: ${dateStr} ${timeStr} / 定員: ${row.max_capacity}名`,
                    { indent: 14, lineGap: 2 }
                );
            }
            // 区切り線
            doc.moveDown(0.5).moveTo(40, doc.y).lineTo(555, doc.y).strokeColor("#eeeeee").lineWidth(0.5).stroke().moveDown(0.8);
        });

        doc.end();

        // 6. レスポンス返却
        const pdfBuffer = await new Promise((resolve) => {
            doc.on('end', () => resolve(Buffer.concat(chunks)));
        });

        return new NextResponse(pdfBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`,
            },
        });

    } catch (error) {
        console.error("PDFデバッグログ:", error);
        return NextResponse.json({ error: "PDF生成中にエラーが発生しました。DB接続またはフォントパスを確認してください。" }, { status: 500 });
    }
}