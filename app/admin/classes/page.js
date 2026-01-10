'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminClasses() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  // 新規登録用フォーム状態
  const [newClass, setNewClass] = useState({
    class_name: '',
    teacher_name: '',
    room_name: '',
    description: '', // 追加: DBにあるので入力できるようにする
    max_capacity: 30,
    session_date: '',
    start_time: '',
    end_time: ''
  });

  // 1. データ取得
  const fetchClasses = async () => {
    try {
      const res = await fetch('/api/classes');
      if (res.ok) {
        const data = await res.json();
        setClasses(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  // 2. 登録処理
  const handleRegister = async (e) => {
    e.preventDefault();
    
    // ★重要: DBが char(32) なので、UUIDのハイフンを取り除いて32文字にする
    const classId = crypto.randomUUID().replace(/-/g, '');
    const sessionId = crypto.randomUUID().replace(/-/g, '');

    const payload = {
      class_id: classId,
      class_name: newClass.class_name,
      teacher_name: newClass.teacher_name,
      room_name: newClass.room_name,
      description: newClass.description,
      max_capacity: Number(newClass.max_capacity),
      // セッション情報を配列で送る
      sessions: [
        {
          session_id: sessionId,
          class_date: newClass.session_date,
          start_time: newClass.start_time,
          end_time: newClass.end_time,
          max_capacity: Number(newClass.max_capacity)
        }
      ]
    };

    try {
      const res = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert('登録しました');
        fetchClasses(); // 一覧を更新
        // フォームリセット
        setNewClass({
          class_name: '',
          teacher_name: '',
          room_name: '',
          description: '',
          max_capacity: 30,
          session_date: '',
          start_time: '',
          end_time: ''
        });
      } else {
        alert('登録に失敗しました');
      }
    } catch (err) {
      console.error(err);
      alert('エラーが発生しました');
    }
  };

  const handleDelete = async (classId) => {
    if(!confirm('本当に削除しますか？')) return;
    
    try {
      const res = await fetch(`/api/classes/${classId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchClasses();
      } else {
        alert('削除に失敗しました');
      }
    } catch (err) {
      alert('通信エラーが発生しました');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">模擬授業管理</h1>
          <Link href="/admin/dashboard" className="text-sm text-gray-500 hover:underline">管理者メニューへ戻る</Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* 左側: 新規登録フォーム */}
          <div className="lg:col-span-1 bg-white p-6 rounded shadow sticky top-6">
            <h2 className="text-lg font-bold mb-6 text-blue-600 border-b pb-2">授業を追加</h2>
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">授業名</label>
                <input 
                  type="text" required
                  value={newClass.class_name}
                  onChange={e => setNewClass({...newClass, class_name: e.target.value})}
                  className="w-full border p-2 rounded text-black" 
                  placeholder="例: プログラミング入門"
                />
              </div>
              
              {/* 説明文 (description) 追加 */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">授業説明</label>
                <textarea 
                  value={newClass.description}
                  onChange={e => setNewClass({...newClass, description: e.target.value})}
                  className="w-full border p-2 rounded text-black h-20 text-sm" 
                  placeholder="授業の概要を入力..."
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">担当教職員</label>
                  <input 
                    type="text" 
                    value={newClass.teacher_name}
                    onChange={e => setNewClass({...newClass, teacher_name: e.target.value})}
                    className="w-full border p-2 rounded text-black" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">実施場所</label>
                  <input 
                    type="text" 
                    value={newClass.room_name}
                    onChange={e => setNewClass({...newClass, room_name: e.target.value})}
                    className="w-full border p-2 rounded text-black" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">定員</label>
                <input 
                  type="number" 
                  value={newClass.max_capacity}
                  onChange={e => setNewClass({...newClass, max_capacity: e.target.value})}
                  className="w-full border p-2 rounded text-black" 
                />
              </div>
              
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-xs font-bold mb-2 text-gray-600">実施日時</p>
                <input 
                  type="date" required
                  value={newClass.session_date}
                  onChange={e => setNewClass({...newClass, session_date: e.target.value})}
                  className="w-full border p-1 mb-2 text-sm text-black" 
                />
                <div className="flex gap-2">
                  <input type="time" required 
                    value={newClass.start_time}
                    onChange={e => setNewClass({...newClass, start_time: e.target.value})}
                    className="border p-1 w-1/2 text-sm text-black" />
                  <input type="time" required 
                    value={newClass.end_time}
                    onChange={e => setNewClass({...newClass, end_time: e.target.value})}
                    className="border p-1 w-1/2 text-sm text-black" />
                </div>
              </div>

              <button className="w-full bg-blue-600 text-white py-3 rounded font-bold hover:bg-blue-700 shadow transition">
                登録
              </button>
            </form>
          </div>

          {/* 右側: 一覧表示 */}
          <div className="lg:col-span-2 bg-white rounded shadow overflow-hidden">
            <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
              <h2 className="font-bold text-gray-700">登録済み授業一覧</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-600">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-4 py-3">授業名</th>
                    <th className="px-4 py-3">詳細</th>
                    <th className="px-4 py-3">日時・場所</th>
                    <th className="px-4 py-3 text-center">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {classes.map((cls, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-bold text-gray-800">
                        {cls.class_name}
                        <div className="text-xs text-gray-400 font-normal truncate max-w-[150px]">{cls.description}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div><span className="text-xs bg-gray-200 px-1 rounded">教員</span> {cls.teacher_name}</div>
                        <div className="mt-1"><span className="text-xs bg-gray-200 px-1 rounded">定員</span> {cls.max_capacity}名</div>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <div className="font-bold mb-1">{cls.room_name}</div>
                        {cls.class_date ? (
                           <>
                             {new Date(cls.class_date).toLocaleDateString()} <br/>
                             {cls.start_time?.substring(0,5)}～{cls.end_time?.substring(0,5)}
                           </>
                        ) : '日時未定'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button 
                          onClick={() => handleDelete(cls.class_id)}
                          className="bg-red-100 text-red-600 px-3 py-1 rounded hover:bg-red-200 text-xs font-bold"
                        >
                          削除
                        </button>
                      </td>
                    </tr>
                  ))}
                  {classes.length === 0 && !loading && (
                    <tr><td colSpan="4" className="p-8 text-center text-gray-400">登録されている授業はありません</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}