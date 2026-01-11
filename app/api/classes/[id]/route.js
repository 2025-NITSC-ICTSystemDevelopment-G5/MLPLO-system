import { NextResponse } from 'next/server';
import db from '@/module';

export async function DELETE(request, { params }) {
  try {
    // ★重要: 最新のNext.jsに対応するため、paramsをawaitしてからIDを取り出します
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ message: 'IDが不正です' }, { status: 400 });
    }

    // データの削除は「子供（申し込み）」→「兄弟（セッション）」→「親（授業）」の順に行う必要があります。

    // 1. この授業に関連する「申し込みデータ」を全て削除
    await db.execute('DELETE FROM application WHERE class_id = ?', [id]);

    // 2. この授業の「セッション（開催日時）」を全て削除
    await db.execute('DELETE FROM mock_session WHERE class_id = ?', [id]);

    // 3. 最後に「授業本体」を削除
    const [result] = await db.execute('DELETE FROM mock_class WHERE class_id = ?', [id]);

    if (result.affectedRows === 0) {
       return NextResponse.json({ message: '削除対象が見つかりませんでした' }, { status: 404 });
    }

    return NextResponse.json({ message: '削除完了' });
  } catch (error) {
    console.error('Delete Error:', error);
    return NextResponse.json({ message: '削除エラーが発生しました' }, { status: 500 });
  }
}