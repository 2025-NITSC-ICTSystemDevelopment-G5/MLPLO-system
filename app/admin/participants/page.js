'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminParticipants() {
  // データ管理用ステート
  const [selectedClassId, setSelectedClassId] = useState("ALL"); 
  const [participants, setParticipants] = useState([]); // 当選者データのみ
  const [classes, setClasses] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);

  // 画面表示時にデータを取得
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. 授業リストを取得
        const classRes = await fetch('/api/classes');
        const classData = classRes.ok ? await classRes.json() : [];
        setClasses(classData);

        // 2. 全申込者リストを取得
        const res = await fetch('/api/admins/applicants');
        if (res.ok) {
          const allData = await res.json();
          // lottery_status が 'WIN' の人のみ抽出
          const winners = allData.filter(app => app.lottery_status === 'WIN');
          setParticipants(winners);
        }
      } catch (error) {
        console.error("データ取得エラー:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // 選択された授業でフィルタリング
  // ※ API側のプロパティ名 class_id を使用
  const filteredParticipants = selectedClassId === "ALL" 
    ? participants 
    : participants.filter(app => String(app.class_id) === String(selectedClassId));

  // 選択中の授業名を取得
  const currentClassName = selectedClassId === "ALL" 
    ? "全科目" 
    : classes.find(c => String(c.class_id) === String(selectedClassId))?.class_name || "不明な授業";

  // CSVダウンロード処理
  const handleDownloadCsv = () => {
    window.location.href = '/api/management/export/csv?mode=winners';
  };

  if (isLoading) return <div className="min-h-screen bg-gray-100 p-10 text-center">読み込み中...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">参加者一覧 (当選者のみ)</h1>
          <Link href="/admin/dashboard" className="text-sm text-gray-500 hover:text-gray-800 hover:underline">
            管理者メニューへ戻る
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
          
          {/* 左サイドバー: 科目選択 */}
          <div className="md:col-span-1 bg-white rounded shadow overflow-hidden sticky top-6">
            <div className="bg-blue-800 text-white p-3 font-bold text-center">
              参加科目選択
            </div>
            <div className="p-2 space-y-1">
              <button
                onClick={() => setSelectedClassId("ALL")}
                className={`w-full text-left px-4 py-3 rounded transition ${
                  selectedClassId === "ALL" 
                    ? 'bg-blue-100 text-blue-900 font-bold border-l-4 border-blue-600' 
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                全科目表示
              </button>

              {classes.map((cls) => (
                <button
                  key={cls.class_id}
                  onClick={() => setSelectedClassId(cls.class_id)}
                  className={`w-full text-left px-4 py-3 rounded transition ${
                    selectedClassId === cls.class_id 
                      ? 'bg-blue-100 text-blue-900 font-bold border-l-4 border-blue-600' 
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  {cls.class_name}
                </button>
              ))}
            </div>
          </div>

          {/* 右メインエリア: 一覧テーブル */}
          <div className="md:col-span-3 bg-white p-6 rounded shadow relative min-h-[500px] flex flex-col">
            <div className="flex justify-between items-end mb-4 border-b pb-2">
              <h2 className="text-xl font-bold text-gray-800">{currentClassName} の参加者</h2>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm font-bold">
                参加予定 {filteredParticipants.length} 名
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
                    {selectedClassId === "ALL" && <th className="p-3 text-left font-bold text-gray-600">参加授業</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredParticipants.length === 0 ? (
                    <tr>
                      <td colSpan={selectedClassId === "ALL" ? 5 : 4} className="p-6 text-center text-gray-400">
                        現在、該当する参加者（当選者）はいません<br/>
                      </td>
                    </tr>
                  ) : (
                    filteredParticipants.map((p, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition">
                        <td className="p-3 font-bold text-gray-900">{p.student_name}</td>
                        <td className="p-3 text-gray-600">{p.parent_name}</td>
                        <td className="p-3 text-gray-600">{p.school_name}</td>
                        <td className="p-3 text-center text-gray-600">{p.grade}</td>
                        {selectedClassId === "ALL" && <td className="p-3 text-gray-600 text-xs">{p.class_name}</td>}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-8 flex justify-end">
              <button 
                onClick={handleDownloadCsv}
                className="bg-blue-800 text-white font-bold py-3 px-6 rounded hover:bg-blue-700 shadow-md flex items-center transition"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                </svg>
                参加者リストCSVダウンロード
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}