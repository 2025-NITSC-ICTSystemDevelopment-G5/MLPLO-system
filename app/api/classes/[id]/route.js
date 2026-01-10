import { NextResponse } from 'next/server';
import db from '@/module';

// DELETE: 指定したIDの授業を削除
export async function DELETE(request, { params }) {
  try {
    const { id } = params; 

    // mock_classを削除
    // 外部キー制約が正しく設定されていれば、mock_sessionも自動で消えます
    await db.execute('DELETE FROM mock_class WHERE class_id = ?', [id]);

    return NextResponse.json({ message: '削除完了' });
  } catch (error) {
    console.error('削除エラー:', error);
    return NextResponse.json({ message: '削除エラー' }, { status: 500 });
  }
}