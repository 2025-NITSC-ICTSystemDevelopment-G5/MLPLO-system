import { NextResponse } from 'next/server';
import db from '@/module'

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const mode = searchParams.get('mode'); 

        let sql = "";
        let header = [];
        let fileName = "";

        if (mode === 'classes') {
            fileName = "class_info_list.csv";
            header = ["授業ID", "模擬授業名", "担当教員", "実施場所", "最大定員", "実施日", "開始時間", "終了時間"];
            sql = `
                SELECT c.class_id, c.class_name, c.teacher_name, c.room_name, c.max_capacity,
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
                SELECT u.login_id, u.student_name, u.parent_name, u.school_name, u.grade, u.email,
                       c.class_name, s.class_date, s.start_time, s.end_time, a.apply_datetime, a.lottery_status
                FROM application a
                JOIN applicants u ON a.applicant_id = u.applicant_id
                JOIN mock_class c ON a.class_id = c.class_id
                JOIN mock_session s ON a.session_id = s.session_id
            `;
            if (isWinnerMode) sql += " WHERE a.lottery_status = 'WIN' ";
            sql += " ORDER BY c.class_name ASC, s.class_date ASC, s.start_time ASC ";
        }

        const [rows] = await db.query(sql);

        const csvRows = rows.map((row) => {
            if (mode === 'classes') {
                return [
                    `"${row.class_id}"`, `"${row.class_name}"`, `"${row.teacher_name || ''}"`,
                    `"${row.room_name || ''}"`, `"${row.max_capacity}"`,
                    `"${row.class_date ? new Date(row.class_date).toLocaleDateString('ja-JP') : ''}"`,
                    `"${row.start_time}"`, `"${row.end_time}"`
                ].join(',');
            } else {
                const statusJp = row.lottery_status === 'WIN' ? '当選' : row.lottery_status === 'LOSE' ? '落選' : '待機中';
                const classDate = row.class_date ? new Date(row.class_date).toLocaleDateString('ja-JP') : '';
                const applyTime = row.apply_datetime ? new Date(row.apply_datetime).toLocaleString('ja-JP') : '';
                return [
                    `"${row.login_id}"`, `"${row.student_name}"`, `"${row.parent_name || ''}"`,
                    `"${row.school_name || ''}"`, `"${row.grade || ''}"`, `"${row.email}"`,
                    `"${row.class_name}"`, `"${classDate}"`, `"${row.start_time}"`,
                    `"${row.end_time}"`, `"${applyTime}"`, `"${statusJp}"`
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
                'Content-Disposition': `attachment; filename="${fileName}"`,
            },
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "CSV出力に失敗しました" }, { status: 500 });
    }
}