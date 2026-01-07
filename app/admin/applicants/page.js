'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function AdminApplicants() {
  const [selectedClass, setSelectedClass] = useState("国語");

  // モックデータ（全員分）
  const applicants = [
    { id: 1, name: "田中 太郎", guardian: "田中 正雄", school: "○○中学校", grade: "3", status: "未定" },
    { id: 2, name: "佐藤 花子", guardian: "佐藤 花実", school: "××中学校", grade: "3", status: "未定" },
    { id: 3, name: "鈴木 一郎", guardian: "鈴木 次郎", school: "△△中学校", grade: "2", status: "未定" },
    { id: 4, name: "高橋 次郎", guardian: "高橋 三郎", school: "□□中学校", grade: "1", status: "未定" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">申込者一覧 (全応募者)</h1>
          <Link href="/admin/dashboard" className="text-sm text-gray-500 hover:text-gray-800 hover:underline">
            管理者メニューへ戻る
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
          
          <div className="md:col-span-1 bg-white rounded shadow overflow-hidden sticky top-6">
            <div className="bg-gray-600 text-white p-3 font-bold text-center">
              科目選択
            </div>
            <div className="p-2 space-y-1">
              {["国語", "数学", "電気回路"].map((cls) => (
                <button
                  key={cls}
                  onClick={() => setSelectedClass(cls)}
                  className={`w-full text-left px-4 py-3 rounded transition ${
                    selectedClass === cls 
                      ? 'bg-gray-200 text-gray-900 font-bold border-l-4 border-gray-600' 
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  {cls}
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-3 bg-white p-6 rounded shadow relative min-h-[500px] flex flex-col">
            <div className="flex justify-between items-end mb-4 border-b pb-2">
              <h2 className="text-xl font-bold text-gray-800">{selectedClass} の申込者</h2>
              <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded text-sm font-bold">
                応募総数 {applicants.length} 名
              </span>
            </div>

            <div className="overflow-x-auto flex-grow">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="p-3 text-left font-bold text-gray-600">氏名</th>
                    <th className="p-3 text-left font-bold text-gray-600">保護者氏名</th>
                    <th className="p-3 text-left font-bold text-gray-600">学校名</th>
                    <th className="p-3 text-center font-bold text-gray-600">学年</th>
                  </tr>
                </thead>
                <tbody>
                  {applicants.map((p) => (
                    <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
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
              <button className="bg-gray-600 text-white font-bold py-3 px-6 rounded hover:bg-gray-700 shadow-md flex items-center transition">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                申込者リストCSVダウンロード
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}