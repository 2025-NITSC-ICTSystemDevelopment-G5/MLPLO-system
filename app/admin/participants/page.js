'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function AdminParticipants() {
  const [selectedClass, setSelectedClass] = useState("国語");

  // モックデータ（当選者のみ）
  const participants = [
    { id: 1, name: "田中 太郎", guardian: "田中 正雄", school: "○○中学校", grade: "3" },
    { id: 2, name: "佐藤 花子", guardian: "佐藤 花実", school: "××中学校", grade: "3" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-blue-800">参加者一覧 (当選者のみ)</h1>
          <Link href="/admin/dashboard" className="text-sm text-gray-500 hover:text-gray-800 hover:underline">
            管理者メニューへ戻る
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
          
          <div className="md:col-span-1 bg-white rounded shadow overflow-hidden sticky top-6">
            <div className="bg-blue-700 text-white p-3 font-bold text-center">
              科目選択
            </div>
            <div className="p-2 space-y-1">
              {["国語", "数学", "電気回路"].map((cls) => (
                <button
                  key={cls}
                  onClick={() => setSelectedClass(cls)}
                  className={`w-full text-left px-4 py-3 rounded transition ${
                    selectedClass === cls 
                      ? 'bg-blue-100 text-blue-700 font-bold border-l-4 border-blue-600' 
                      : 'hover:bg-blue-50 text-gray-700'
                  }`}
                >
                  {cls}
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-3 bg-white p-6 rounded shadow relative min-h-[500px] flex flex-col">
            <div className="flex justify-between items-end mb-4 border-b pb-2">
              <h2 className="text-xl font-bold text-gray-800">{selectedClass} の参加予定者</h2>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm font-bold">
                当選者 {participants.length} 名
              </span>
            </div>

            <div className="overflow-x-auto flex-grow">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-blue-50 border-b border-blue-100">
                    <th className="p-3 text-left font-bold text-gray-600">氏名</th>
                    <th className="p-3 text-left font-bold text-gray-600">保護者氏名</th>
                    <th className="p-3 text-left font-bold text-gray-600">学校名</th>
                    <th className="p-3 text-center font-bold text-gray-600">学年</th>
                  </tr>
                </thead>
                <tbody>
                  {participants.map((p) => (
                    <tr key={p.id} className="border-b border-gray-100 hover:bg-blue-50 transition">
                      <td className="p-3 font-medium">{p.name}</td>
                      <td className="p-3 text-gray-600">{p.guardian}</td>
                      <td className="p-3 text-gray-600">{p.school}</td>
                      <td className="p-3 text-center text-gray-600">{p.grade}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-8 flex justify-end">
              <button className="bg-green-600 text-white font-bold py-3 px-6 rounded hover:bg-green-700 shadow-md flex items-center transition">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                参加者リストCSVダウンロード
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}