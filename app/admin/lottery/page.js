'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function AdminLottery() {
  const [lotteryDone, setLotteryDone] = useState(false);

  const stats = [
    { name: "国語", count: 32, capacity: 30 },
    { name: "数学", count: 45, capacity: 30 },
    { name: "電気回路", count: 18, capacity: 20 },
  ];

  const handleLottery = () => {
    if (confirm("抽選を実行しますか？この操作は取り消せません。")) {
      setLotteryDone(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded shadow-lg">
        <h1 className="text-2xl font-bold text-gray-800 mb-8 border-b pb-4">抽選管理画面</h1>

        {/* 期間情報 */}
        <div className="bg-gray-50 p-6 rounded-lg mb-8 border border-gray-200">
          <div className="grid gap-4 text-gray-700">
            <div className="flex justify-between border-b border-gray-200 pb-2">
              <span className="font-bold">登録開始日</span>
              <span>2025年08月01日 10時00分</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold">登録終了日</span>
              <span>2025年08月15日 17時00分</span>
            </div>
          </div>
        </div>

        {/* 登録人数一覧 */}
        <h2 className="text-lg font-bold mb-4 text-gray-800">現在の登録人数</h2>
        <div className="space-y-4 mb-10">
          {stats.map((item) => (
            <div key={item.name} className="flex justify-between items-center bg-white border p-4 rounded shadow-sm">
              <span className="font-bold text-lg">{item.name}</span>
              <div className="text-right">
                <span className={`text-2xl font-bold ${item.count > item.capacity ? 'text-red-600' : 'text-gray-800'}`}>
                  {item.count}
                </span>
                <span className="text-sm text-gray-500 ml-1">/ {item.capacity}人</span>
              </div>
            </div>
          ))}
        </div>

        {/* アクションエリア */}
        <div className="border-t pt-8">
          {!lotteryDone ? (
            <div className="flex flex-col items-center space-y-4">
              <button 
                onClick={handleLottery}
                className="bg-orange-600 text-white font-bold py-4 px-20 rounded-full shadow-lg hover:bg-orange-500 transform hover:scale-105 transition text-xl"
              >
                抽選を開始
              </button>
              <p className="text-sm text-gray-500">※定員を超えている授業のみ抽選処理が実行されます</p>
            </div>
          ) : (
            <div className="bg-green-50 p-6 rounded-lg border border-green-200 text-center animate-fade-in">
              <h3 className="text-xl font-bold text-green-700 mb-2">参加者が確定しました</h3>
              <p className="text-gray-600 mb-6">結果通知メールの送信予約が完了しました。</p>
              
              <div className="flex justify-center">
                <Link href="/admin/participants" className="inline-block bg-blue-600 text-white font-bold py-3 px-8 rounded hover:bg-blue-700 transition shadow">
                  参加者一覧画面へ
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="mt-12 text-center">
          <Link href="/admin/dashboard" className="text-gray-500 hover:text-gray-800 hover:underline transition">
            管理者メニューへ戻る
          </Link>
        </div>
      </div>
    </div>
  );
}