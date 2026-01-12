'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminApplicants() {
  // データ管理用ステート
  const [selectedClassId, setSelectedClassId] = useState("ALL"); // "ALL" または class_id
  const [applicants, setApplicants] = useState([]); // 全ての申込者データ
  const [classes, setClasses] = useState([]);       // 授業リスト(サイドバー用)
  const [isLoading, setIsLoading] = useState(true);

  // 画面表示時にデータを取得
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. 授業リストを取得 (サイドバー用)
        const classRes = await fetch('/api/classes');
        const classData = classRes.ok ? await classRes.json() : [];
        setClasses(classData);

        // 2. 申込者リストを取得 (テーブル用)
        // ※前回のステップで作ったAPIを使用
        const applicantRes = await fetch('/api/admins/applicants');
        const applicantData = applicantRes.ok ? await applicantRes.json() : [];
        setApplicants(applicantData);
        
        // 初期選択：最初は「全科目」を表示するか、最初の授業にするか
        // ここでは明示的に「ALL」としておきます

      } catch (error) {
        console.error("データ取得エラー:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // 選択された授業でフィルタリング
  const filteredApplicants = selectedClassId === "ALL" 
    ? applicants 
    : applicants.filter(app => app.class_id === selectedClassId);

  // 選択中の授業名を取得（表示用）
  const currentClassName = selectedClassId === "ALL" 
    ? "全科目" 
    : classes.find(c => c.id === selectedClassId)?.name || "不明な授業";

  // CSVダウンロード処理
  const handleDownloadCsv = () => {
    // チームメンバー作成のAPIを呼び出す（全応募者モード）
    window.location.href = '/api/management/export/csv?mode=applicants';
  };

  if (isLoading) return <div className="min-h-screen bg-gray-100 p-10 text-center">読み込み中...</div>;

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
          
          {/* 左サイドバー: 科目選択 */}
          <div className="md:col-span-1 bg-white rounded shadow overflow-hidden sticky top-6">
            <div className="bg-gray-600 text-white p-3 font-bold text-center">
              科目選択
            </div>
            <div className="p-2 space-y-1">
              {/* 全科目ボタン（追加） */}
              <button
                onClick={() => setSelectedClassId("ALL")}
                className={`w-full text-left px-4 py-3 rounded transition ${
                  selectedClassId === "ALL" 
                    ? 'bg-gray-200 text-gray-900 font-bold border-l-4 border-gray-600' 
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                全科目表示
              </button>

              {/* DBから取得した授業リスト */}
              {classes.map((cls) => (
                <button
                  key={cls.id}
                  onClick={() => setSelectedClassId(cls.id)}
                  className={`w-full text-left px-4 py-3 rounded transition ${
                    selectedClassId === cls.id 
                      ? 'bg-gray-200 text-gray-900 font-bold border-l-4 border-gray-600' 
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  {cls.name}
                </button>
              ))}
            </div>
          </div>

          {/* 右メインエリア: 一覧テーブル */}
          <div className="md:col-span-3 bg-white p-6 rounded shadow relative min-h-[500px] flex flex-col">
            <div className="flex justify-between items-end mb-4 border-b pb-2">
              <h2 className="text-xl font-bold text-gray-800">{currentClassName} の申込者</h2>
              <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded text-sm font-bold">
                応募総数 {filteredApplicants.length} 名
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
                    {selectedClassId === "ALL" && <th className="p-3 text-left font-bold text-gray-600">授業名</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredApplicants.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-6 text-center text-gray-400">
                        該当する申込者はまだいません
                      </td>
                    </tr>
                  ) : (
                    filteredApplicants.map((p, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition">
                        <td className="p-3 font-medium">{p.student_name}</td>
                        <td className="p-3 text-gray-600">{p.parent_name}</td>
                        <td className="p-3 text-gray-600">{p.school_name}</td>
                        <td className="p-3 text-center text-gray-600">{p.grade}</td>
                        {/* 全表示のときだけ授業名も出す */}
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
                className="bg-gray-600 text-white font-bold py-3 px-6 rounded hover:bg-gray-700 shadow-md flex items-center transition"
              >
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