'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function TopPage() {
  const [periods, setPeriods] = useState({ start: '', end: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPeriod = async () => {
      try {
        // 期間設定を取得するAPIを叩く
        const res = await fetch('/api/admins/period');
        if (res.ok) {
          const data = await res.json();
          // system_settingsのキー名に合わせてセット
          setPeriods({
            start: data.application_start || '未設定',
            end: data.application_end || '未設定'
          });
        }
      } catch (err) {
        console.error("期間取得エラー:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPeriod();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <div className="absolute top-4 right-6">
        <Link href="/admin/login" className="text-xs text-gray-400 hover:text-gray-600 transition">
          管理者ログイン
        </Link>
      </div>

      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-white p-10 rounded-xl shadow-lg max-w-lg w-full text-center space-y-8 border-t-4 border-blue-600">
          <div>
            <h1 className="text-3xl font-bold text-blue-600 mb-2">S高専オープンキャンパス</h1>
            <h2 className="text-xl text-gray-700">模擬授業申し込み</h2>
          </div>

          <div className="bg-blue-50 py-4 px-3 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">申し込み期間</p>
            {loading ? (
              <p className="text-gray-400 animate-pulse">読み込み中...</p>
            ) : (
              <p className="font-mono text-lg font-bold text-blue-800">
                {/* 2025/08/01 形式に整形したい場合は .replace(/-/g, '/') などを使う */}
                {periods.start} ～ {periods.end}
              </p>
            )}
          </div>

          <div className="space-y-4">
            <p className="text-sm text-gray-600">参加希望の方はこちらから</p>
            
            <Link href="/auth/login" className="block w-full py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-bold shadow-md text-lg text-center">
              ログイン
            </Link>
            
            <Link href="/auth/register" className="block w-full py-4 bg-white border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition font-bold text-lg text-center">
              アカウント作成
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}