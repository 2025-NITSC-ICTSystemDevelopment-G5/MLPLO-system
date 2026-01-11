'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [period, setPeriod] = useState({
    start: '読み込み中...',
    end: '読み込み中...'
  });

  useEffect(() => {
    const fetchPeriod = async () => {
      try {
        const res = await fetch('/api/admins/period');
        if (res.ok) {
          const data = await res.json();
          setPeriod({
            start: data.application_start ? data.application_start.replace(/-/g, '/') : '未設定',
            end: data.application_end ? data.application_end.replace(/-/g, '/') : '未設定'
          });
        }
      } catch (error) {
        console.error("期間取得エラー:", error);
        setPeriod({ start: '取得エラー', end: '取得エラー' });
      }
    };

    fetchPeriod();
  }, []);

  // 全データ削除処理
  const handleReset = async () => {
    if (!confirm("【警告】\n登録された「全ての授業」と「全ての申し込みデータ」を削除します。\n\nこの操作は取り消せません。\n本当によろしいですか？")) {
      return;
    }

    try {
      const res = await fetch('/api/admins/reset', { method: 'POST' });
      if (res.ok) {
        alert("データを全て消去しました。\nシステムは初期状態に戻りました。");
        window.location.reload();
      } else {
        alert("削除に失敗しました。");
      }
    } catch (err) {
      console.error(err);
      alert("通信エラーが発生しました。");
    }
  };

  // ★追加: CSVダウンロード処理
  const downloadCsv = async (url, filename) => {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('ダウンロード失敗');
      
      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('CSVのダウンロードに失敗しました');
    }
  };

  return (
    <div className="min-h-screen bg-gray-800 text-white p-6 relative">
      <div className="max-w-4xl mx-auto pb-16">
        <div className="flex justify-between items-center mb-10 border-b border-gray-600 pb-4">
          <h1 className="text-2xl font-bold">管理者メニュー</h1>
          <Link href="/" className="bg-gray-600 px-4 py-2 rounded text-sm hover:bg-gray-500 transition">ログアウト</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* 申し込み受付期間 */}
          <div className="bg-gray-700 p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-bold mb-4 border-b border-gray-600 pb-2">現在の受付期間</h2>
            <div className="space-y-4 mb-6">
              <div>
                <span className="block text-xs text-gray-400 mb-1">開始日時</span>
                <p className="text-xl font-mono font-bold">{period.start}</p>
              </div>
              <div>
                <span className="block text-xs text-gray-400 mb-1">終了日時</span>
                <p className="text-xl font-mono font-bold">{period.end}</p>
              </div>
            </div>
            <Link href="/admin/period" className="block w-full bg-blue-600 py-2 rounded hover:bg-blue-500 font-bold transition text-center text-sm">
              期間を変更する
            </Link>
          </div>

          {/* 授業管理 */}
          <div className="bg-gray-700 p-6 rounded-lg shadow-lg flex flex-col justify-center">
            <h2 className="text-lg font-bold mb-4">模擬授業管理</h2>
            <Link href="/admin/classes" className="block text-center bg-green-600 py-4 rounded-lg hover:bg-green-500 font-bold transition shadow-md">
              授業の登録・一覧へ
            </Link>
          </div>

          {/* 抽選管理 */}
          <div className="bg-gray-700 p-6 rounded-lg shadow-lg flex flex-col justify-center">
            <h2 className="text-lg font-bold mb-4">抽選管理</h2>
            <Link href="/admin/lottery" className="block text-center bg-orange-600 py-4 rounded-lg hover:bg-orange-500 font-bold transition shadow-md">
              抽選管理画面へ
            </Link>
          </div>

          {/* 一覧出力 (CSV機能を追加) */}
          <div className="bg-gray-700 p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-bold mb-4">リスト出力・確認</h2>
            <div className="space-y-3">
              <Link href="/admin/applicants" className="block text-center bg-gray-600 py-2 rounded hover:bg-gray-500 transition border border-gray-500 text-sm">
                申込者一覧を表示 (画面)
              </Link>
              <Link href="/admin/participants" className="block text-center bg-blue-800 py-2 rounded hover:bg-blue-700 transition border border-blue-600 font-bold text-sm">
                参加者一覧を表示 (画面)
              </Link>
              
              <hr className="border-gray-600 my-2" />
              
              {/* ★追加: CSVダウンロードボタン */}
              <button 
                onClick={() => downloadCsv('/api/admins/export/classes', '授業一覧.csv')}
                className="w-full bg-gray-200 text-gray-800 py-2 rounded hover:bg-white font-bold transition text-sm flex justify-center items-center gap-2"
              >
                授業一覧CSVをDL
              </button>
              <button 
                onClick={() => downloadCsv('/api/admins/export/participants', '参加者一覧.csv')}
                className="w-full bg-gray-200 text-gray-800 py-2 rounded hover:bg-white font-bold transition text-sm flex justify-center items-center gap-2"
              >
                参加者一覧CSVをDL
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* 全データ消去ボタン */}
      <div className="fixed bottom-6 right-6">
        <button 
          className="text-xs text-gray-500 hover:text-red-500 hover:bg-gray-900 px-3 py-2 rounded underline transition"
          onClick={handleReset}
        >
          全データ消去
        </button>
      </div>
    </div>
  );
}