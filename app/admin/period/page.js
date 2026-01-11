'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminPeriod() {
  const router = useRouter();
  
  // 入力値を管理する変数
  const [startStr, setStartStr] = useState('');
  const [endStr, setEndStr] = useState('');
  const [lotteryStr, setLotteryStr] = useState(''); // 抽選発表日用
  
  const [isLoading, setIsLoading] = useState(true);

  // 1. 画面表示時に、現在の設定をDBから取ってくる
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/admins/period');
        
        if (res.ok) {
          const data = await res.json();
          if (data.application_start) setStartStr(data.application_start.replace(' ', 'T'));
          if (data.application_end) setEndStr(data.application_end.replace(' ', 'T'));
          if (data.lottery_announcement) setLotteryStr(data.lottery_announcement.replace(' ', 'T'));
        }
      } catch (err) {
        console.error("設定取得エラー:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  // 2. 保存ボタンを押したときの処理
  const handleSave = async () => {
    if (!confirm("これらの設定を保存しますか？\n（学生画面の受付状態や結果表示が変更されます）")) return;

    try {
      const res = await fetch('/api/admins/period', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          start: startStr.replace('T', ' '),
          end: endStr.replace('T', ' '),
          lottery: lotteryStr.replace('T', ' ')
        }),
      });

      if (res.ok) {
        alert("期間・日程設定を更新しました！");
        router.push('/admin/dashboard');
      } else {
        alert("保存に失敗しました");
      }
    } catch (err) {
      alert("通信エラーが発生しました");
    }
  };

  if (isLoading) return <div className="p-6">読み込み中...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded shadow-lg">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">期間・日程設定</h1>

        <div className="space-y-8">
          
          {/* --- 受付期間エリア --- */}
          <div>
            <h2 className="text-lg font-bold text-gray-700 mb-4 border-l-4 border-blue-500 pl-2">
              申し込み受付期間
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">開始日時</label>
                <input 
                  type="datetime-local" 
                  /* ここに text-black を追加しました */
                  className="w-full border border-gray-300 p-3 rounded focus:ring-2 focus:ring-blue-500 outline-none text-black" 
                  value={startStr}
                  onChange={(e) => setStartStr(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">終了日時</label>
                <input 
                  type="datetime-local" 
                  /* ここに text-black を追加しました */
                  className="w-full border border-gray-300 p-3 rounded focus:ring-2 focus:ring-blue-500 outline-none text-black" 
                  value={endStr}
                  onChange={(e) => setEndStr(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* --- 抽選発表エリア --- */}
          <div>
            <h2 className="text-lg font-bold text-gray-700 mb-4 border-l-4 border-orange-500 pl-2">
              抽選発表日時
            </h2>

            <div>
              <input 
                type="datetime-local" 
                /* ここに text-black を追加しました */
                className="w-full border border-gray-300 p-3 rounded focus:ring-2 focus:ring-orange-500 outline-none text-black" 
                value={lotteryStr}
                onChange={(e) => setLotteryStr(e.target.value)}
              />
            </div>
          </div>

          {/* --- ボタン --- */}
          <div className="pt-8 flex gap-4 border-t mt-4">
            <Link 
              href="/admin/dashboard"
              className="w-1/3 bg-gray-500 text-white font-bold py-3 rounded text-center hover:bg-gray-600 transition"
            >
              キャンセル
            </Link>
            <button 
              onClick={handleSave}
              className="w-2/3 bg-blue-600 text-white font-bold py-3 rounded hover:bg-blue-700 transition shadow-md"
            >
              設定を保存する
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}