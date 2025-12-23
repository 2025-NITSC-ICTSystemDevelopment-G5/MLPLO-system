import { NextResponse } from 'next/server';
import db from '@/lib/db'; 

export async function GET(request) {
    try {
        // --- 【重要】管理者認証ロジックをここに追加 ---
        // if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

        const { searchParams } = new URL(request.url);
        const mode = searchParams.get('mode'); 

        // CSVエスケープ用ヘルパー
        const escapeCsv = (val) => {
            if (val === null || val === undefined) return '""';
            const s = String(val).replace(/"/g, '""');
            return `"${s}"`;
        };

        // ①・② 修正対応用：日付と時刻の整形関数
        const formatDate = (dateVal) => {
            if (!dateVal) return '';
            const d = new Date(dateVal);
            return d.toLocaleDateString('ja-JP'); // YYYY/MM/DD 形式
        };

        const formatTime = (timeVal) => {
            if (!timeVal) return '';
            const d = new Date(timeVal);
            // HH:mm 形式に整形 
            return d.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
        };

        let sql = "";
        let header = [];
        let fileName = "";

        if (mode === 'classes') {
            fileName = "class_info_list.csv";
            header = ["授業ID", "模擬授業名", "担当教員", "実施場所", "回別定員", "実施日", "開始時間", "終了時間"];
            
            // ② 修正：s.max_capacity (各実施回の定員) を取得するように変更 
            sql = `
                SELECT 
                    c.class_id, c.class_name, c.teacher_name, c.room_name, 
                    s.max_capacity AS session_capacity,
                    s.class_date, s.start_time, s.end_time
                FROM mock_class c
                JOIN mock_session s ON c.class_id = s.class_id
                ORDER BY c.class_name ASC, s.class_date ASC, s.start_time ASC
            `;
        } else {
            const isWinnerMode = mode === 'winners';
            fileName = isWinnerMode ? 'participants_list.csv' : 'applicants_list.csv';
            header = ["登録ID", "生徒氏名", "保護者氏名", "中学校名", "学年", "メールアドレス", "模擬授業名", "実施日", "開始時間", "終了時間", "申込日時", "抽選結果"];
            
            sql = `
                SELECT 
                    u.login_id, u.student_name, u.parent_name, u.school_name, u.grade, u.email,
                    c.class_name, s.class_date, s.start_time, s.end_time,
                    a.apply_datetime, a.lottery_status
                FROM application a
                JOIN applicants u ON a.applicant_id = u.applicant_id
                JOIN mock_class c ON a.class_id = c.class_id
                JOIN mock_session s ON a.session_id = s.session_id
            `;
            if (isWinnerMode) {
                sql += " WHERE a.lottery_status = 'WIN' ";
            }
            sql += " ORDER BY c.class_name ASC, s.class_date ASC, s.start_time ASC ";
        }

        const [rows] = await db.query(sql);

        const csvRows = rows.map((row) => {
            if (mode === 'classes') {
                return [
                    escapeCsv(row.class_id),
                    escapeCsv(row.class_name),
                    escapeCsv(row.teacher_name),
                    escapeCsv(row.room_name),
                    escapeCsv(row.session_capacity), // ② 修正点：各回ごとの定員を出力 [cite: 77, 93]
                    escapeCsv(formatDate(row.class_date)),
                    escapeCsv(formatTime(row.start_time)), // ① 修正点：HH:mm 形式に整形
                    escapeCsv(formatTime(row.end_time))    // ① 修正点：HH:mm 形式に整形
                ].join(',');
            } else {
                const statusJp = row.lottery_status === 'WIN' ? '当選' : row.lottery_status === 'LOSE' ? '落選' : '待機中';
                return [
                    escapeCsv(row.login_id),
                    escapeCsv(row.student_name),
                    escapeCsv(row.parent_name),
                    escapeCsv(row.school_name),
                    escapeCsv(row.grade),
                    escapeCsv(row.email),
                    escapeCsv(row.class_name),
                    escapeCsv(formatDate(row.class_date)),
                    escapeCsv(formatTime(row.start_time)), // ① 修正点
                    escapeCsv(formatTime(row.end_time)),   // ① 修正点
                    escapeCsv(row.apply_datetime ? new Date(row.apply_datetime).toLocaleString('ja-JP') : ''),
                    escapeCsv(statusJp)
                ].join(',');
            }
        });

        const bom = Buffer.from([0xef, 0xbb, 0xbf]);
        const content = [header.join(','), ...csvRows].join('\n');
        const buffer = Buffer.concat([bom, Buffer.from(content)]);

        return new NextResponse(buffer, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`,
            },
        });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "CSV出力に失敗しました" }, { status: 500 });
    }
}