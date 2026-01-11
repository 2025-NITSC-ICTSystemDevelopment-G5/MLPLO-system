import { NextResponse } from 'next/server';
import db from '@/module';

// ★修正: 学生は合計3回まで
const MAX_TOTAL_PER_STUDENT = 3; 

export async function POST(request) {
  try {
    const { applicant_id, class_id, session_id } = await request.json();

    if (!applicant_id || !class_id || !session_id) {
      return NextResponse.json({ message: '情報が不足しています' }, { status: 400 });
    }

    // --- チェック1: 合計申し込み数のチェック ---
    const [totalRows] = await db.execute(
      'SELECT COUNT(*) as count FROM application WHERE applicant_id = ?', 
      [applicant_id]
    );
    const currentTotal = totalRows[0].count;

    if (currentTotal >= MAX_TOTAL_PER_STUDENT) {
       return NextResponse.json({ 
         message: `申し込みは1人合計${MAX_TOTAL_PER_STUDENT}回までです。（現在${currentTotal}件申し込み済み）` 
       }, { status: 400 });
    }

    // --- チェック2: すでに同じ授業に申し込んでいるか ---
    const [duplicateRows] = await db.execute(
      'SELECT COUNT(*) as count FROM application WHERE applicant_id = ? AND session_id = ?',
      [applicant_id, session_id]
    );
    if (duplicateRows[0].count > 0) {
      return NextResponse.json({ message: 'すでにこの授業には申し込んでいます' }, { status: 400 });
    }

    // --- チェック3: 同一日・同時間の重複 ---
    // 時間被りだけはチェックする（体は一つなので）
    // 今回申し込む授業の日時を取得
    const [targetRows] = await db.execute(
      `SELECT DATE_FORMAT(class_date, '%Y-%m-%d') as date_str, start_time, max_capacity, current_registrants 
       FROM mock_session WHERE session_id = ?`,
      [session_id]
    );

    if (targetRows.length === 0) {
      return NextResponse.json({ message: '授業データが見つかりません' }, { status: 404 });
    }
    const targetSession = targetRows[0];
    const targetDateStr = targetSession.date_str;

    const [timeRows] = await db.execute(`
      SELECT COUNT(*) as count 
      FROM application a
      JOIN mock_session s ON a.session_id = s.session_id
      WHERE a.applicant_id = ? 
      AND DATE_FORMAT(s.class_date, '%Y-%m-%d') = ? 
      AND s.start_time = ?`,
      [applicant_id, targetDateStr, targetSession.start_time]
    );
    
    if (timeRows[0].count > 0) {
        return NextResponse.json({ message: '同じ日時に別の授業を申し込み済みです' }, { status: 400 });
    }

    // --- チェック4: 定員チェック ---
    if (targetSession.current_registrants >= targetSession.max_capacity) {
      return NextResponse.json({ message: '定員に達しているため申し込めません' }, { status: 400 });
    }

    // --- 登録実行 ---
    const applicationId = crypto.randomUUID();
    await db.execute(
      'INSERT INTO application (application_id, applicant_id, class_id, session_id, lottery_status) VALUES (?, ?, ?, ?, ?)',
      [applicationId, applicant_id, class_id, session_id, 'PENDING']
    );

    await db.execute(
      'UPDATE mock_session SET current_registrants = current_registrants + 1 WHERE session_id = ?',
      [session_id]
    );

    return NextResponse.json({ message: '申し込みが完了しました' }, { status: 201 });

  } catch (error) {
    console.error('Application Error:', error);
    return NextResponse.json({ message: 'サーバーエラーが発生しました' }, { status: 500 });
  }
}