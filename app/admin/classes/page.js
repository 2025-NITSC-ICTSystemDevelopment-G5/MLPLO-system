'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminClasses() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [teachers, setTeachers] = useState(['']);

  // 新規登録用フォーム状態
  const [newClass, setNewClass] = useState({
    class_name: '',
    room_name: '',
    description: '',
    max_capacity: 30,
    session_date: '',
    start_time: '',
    end_time: ''
  });

  // データ取得
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

  // 教員入力操作
  const handleTeacherChange = (index, value) => {
    const updated = [...teachers];
    updated[index] = value;
    setTeachers(updated);
  };
  const addTeacher = () => setTeachers([...teachers, '']);
  const removeTeacher = (index) => {
    const updated = [...teachers];
    updated.splice(index, 1);
    setTeachers(updated);
  };

  // 登録処理
  const handleRegister = async (e) => {
    e.preventDefault();
    const classId = crypto.randomUUID().replace(/-/g, '');
    const sessionId = crypto.randomUUID().replace(/-/g, '');
    const teacherNameStr = teachers.filter(t => t.trim() !== '').join('、');

    const payload = {
      class_id: classId,
      class_name: newClass.class_name,
      teacher_name: teacherNameStr,
      room_name: newClass.room_name,
      description: newClass.description,
      max_capacity: Number(newClass.max_capacity),
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
        fetchClasses(); 
        setNewClass({
          class_name: '',
          room_name: '',
          description: '',
          max_capacity: 30,
          session_date: '',
          start_time: '',
          end_time: ''
        });
        setTeachers(['']);
      } else {
        // ★ここを修正しました
        // サーバーからのエラーメッセージ（JSON）を受け取って表示します
        const errorData = await res.json();
        alert(errorData.message || '登録に失敗しました');
      }
    } catch (err) {
      alert('通信エラーが発生しました');
    }
  };

  const handleDelete = async (classId) => {
    if(!confirm('本当に削除しますか？')) return;
    try {
      const res = await fetch(`/api/classes/${classId}`, { method: 'DELETE' });
      
      if (res.ok) {
        fetchClasses();
      } else {
        // 削除失敗時もサーバーのメッセージを表示するように修正
        const errorData = await res.json();
        alert(errorData.message || '削除に失敗しました');
      }
    } catch (err) {
      alert('通信エラーが発生しました');
    }
  };

  return (
    <div className="h-screen bg-gray-100 flex flex-col overflow-hidden">
      
      {/* ヘッダーエリア */}
      <div className="bg-white shadow-sm z-10 shrink-0">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">模擬授業管理</h1>
          <Link href="/admin/dashboard" className="text-sm text-gray-500 hover:underline">
            管理者メニューへ戻る
          </Link>
        </div>
      </div>

      {/* メインコンテンツエリア */}
      <div className="flex-1 p-6 overflow-hidden">
        <div className="max-w-7xl mx-auto h-full grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* 左側: 入力フォーム */}
          <div className="lg:col-span-1 bg-white rounded shadow flex flex-col overflow-hidden h-full">
            <div className="p-4 bg-blue-50 border-b border-blue-100 shrink-0">
              <h2 className="text-lg font-bold text-blue-800">授業を追加</h2>
            </div>
            
            <div className="p-6 overflow-y-auto">
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
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">授業説明</label>
                  <textarea 
                    value={newClass.description}
                    onChange={e => setNewClass({...newClass, description: e.target.value})}
                    className="w-full border p-2 rounded text-black h-24 text-sm" 
                    placeholder="授業の概要を入力..."
                  />
                </div>

                {/* 教員入力 */}
                <div className="bg-gray-50 p-3 rounded border border-gray-200">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    担当教職員 <span className="text-xs text-red-500 font-normal">(複数可)</span>
                  </label>
                  {teachers.map((teacher, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input 
                        type="text" 
                        value={teacher}
                        onChange={(e) => handleTeacherChange(index, e.target.value)}
                        className="w-full border p-2 rounded text-black text-sm" 
                        placeholder={index === 0 ? "例: 山田太郎" : "追加の教員名"}
                      />
                      {teachers.length > 1 && (
                        <button 
                          type="button"
                          onClick={() => removeTeacher(index)}
                          className="bg-red-500 text-white px-3 rounded hover:bg-red-600 font-bold"
                        >
                          -
                        </button>
                      )}
                    </div>
                  ))}
                  <button 
                    type="button"
                    onClick={addTeacher}
                    className="w-full bg-green-600 text-white py-2 rounded text-sm font-bold hover:bg-green-500 shadow-sm mt-1"
                  >
                    ＋ 教員を追加
                  </button>
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

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    定員 <span className="text-xs text-red-500 font-normal">(1~40名)</span>
                  </label>
                  <input 
                    type="number" 
                    min="1"
                    max="40"
                    value={newClass.max_capacity}
                    onChange={e => {
                      let val = parseInt(e.target.value);
                      if (val > 40) val = 40;
                      if (val < 1) val = 1;
                      setNewClass({...newClass, max_capacity: val});
                    }}
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

                <div className="pt-2">
                  <button className="w-full bg-blue-600 text-white py-3 rounded font-bold hover:bg-blue-700 shadow transition">
                    登録する
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* 右側: 一覧リスト */}
          <div className="lg:col-span-2 bg-white rounded shadow flex flex-col overflow-hidden h-full">
            <div className="p-4 bg-gray-50 border-b flex justify-between items-center shrink-0">
              <h2 className="font-bold text-gray-700">登録済み授業一覧</h2>
              <span className="text-xs text-gray-500 font-bold bg-white px-2 py-1 rounded border">
                合計 {classes.length} 件
              </span>
            </div>
            
            <div className="overflow-y-auto flex-grow">
              <table className="w-full text-sm text-left text-gray-600 relative">
                <thead className="bg-gray-100 border-b sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="px-4 py-3 w-1/3">授業名・説明</th>
                    <th className="px-4 py-3 w-1/4">担当・定員</th>
                    <th className="px-4 py-3 w-1/4">日時・場所</th>
                    <th className="px-4 py-3 text-center">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {classes.map((cls, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-4 align-top">
                        <div className="font-bold text-gray-800 text-base mb-1">{cls.class_name}</div>
                        <div className="text-xs text-gray-500 whitespace-pre-wrap leading-relaxed">{cls.description}</div>
                      </td>
                      <td className="px-4 py-4 align-top">
                        <div className="mb-2">
                          <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded mr-1">教員</span>
                          <span className="text-gray-800 font-medium">{cls.teacher_name}</span>
                        </div>
                        <div>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded mr-1">定員</span>
                          <span className="font-bold">{cls.max_capacity}名</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 align-top text-xs">
                        <div className="font-bold text-sm text-gray-700 mb-1">場所： {cls.room_name}</div>
                        {cls.class_date ? (
                           <div className="text-gray-600 bg-gray-50 p-1 rounded inline-block border">
                             日時： {new Date(cls.class_date).toLocaleDateString()} <br/>
                              {cls.start_time?.substring(0,5)} ～ {cls.end_time?.substring(0,5)}
                           </div>
                        ) : '日時未定'}
                      </td>
                      <td className="px-4 py-4 align-middle text-center">
                        <button 
                          onClick={() => handleDelete(cls.class_id)}
                          className="bg-white border border-red-300 text-red-600 px-3 py-1.5 rounded hover:bg-red-50 text-xs font-bold transition shadow-sm"
                        >
                          削除
                        </button>
                      </td>
                    </tr>
                  ))}
                  {classes.length === 0 && !loading && (
                    <tr><td colSpan="4" className="p-10 text-center text-gray-400">登録されている授業はありません</td></tr>
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