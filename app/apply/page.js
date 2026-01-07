'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ApplyPage() {
  const [step, setStep] = useState(1); // 1:選択, 2:確認, 3:完了
  const [selected, setSelected] = useState({});

  // モックデータ
  const classes = [
    { id: 1, name: "国語", teacher: "山田 太郎", capacity: 30, current: 12, times: ["1日目 09:00～09:50", "2日目 11:00～11:50"] },
    { id: 2, name: "数学", teacher: "鈴木 一郎", capacity: 30, current: 28, times: ["1日目 11:00～11:50", "2日目 13:00～13:50"] },
    { id: 3, name: "電気回路", teacher: "佐藤 花子", capacity: 20, current: 5, times: ["1日目 13:00～13:50"] },
  ];

  const handleSelect = (className, time) => {
    setSelected(prev => ({ ...prev, [className]: time }));
  };

  // STEP 1: 授業選択画面
  if (step === 1) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 pb-24">
        <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
          <h1 className="text-2xl font-bold mb-6 text-center">模擬授業申し込み</h1>
          
          <div className="space-y-8">
            {classes.map((cls) => (
              <div key={cls.id} className="border p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-xl font-bold text-blue-800">{cls.name}</h2>
                  <button className="text-xs bg-gray-200 px-2 py-1 rounded hover:bg-gray-300">
                    授業情報pdf
                  </button>
                </div>
                <p className="text-sm text-gray-600 mb-2">担当: {cls.teacher} | 定員: {cls.capacity}名 (申込済: {cls.current}名)</p>
                <p className="font-bold text-sm mb-2">時間を選択してください</p>
                
                <div className="flex flex-wrap gap-2">
                  {cls.times.map((time) => (
                    <button
                      key={time}
                      onClick={() => handleSelect(cls.name, time)}
                      className={`px-4 py-2 rounded border ${
                        selected[cls.name] === time 
                          ? 'bg-blue-600 text-white border-blue-600' 
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center sticky bottom-4 bg-white/90 p-4 border-t">
            <button 
              onClick={() => setStep(2)}
              className="bg-green-600 text-white font-bold py-3 px-12 rounded shadow hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={Object.keys(selected).length === 0}
            >
              決定（確認画面へ）
            </button>
          </div>
        </div>
      </div>
    );
  }

  // STEP 2: 確認画面
  if (step === 2) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto bg-white p-8 rounded shadow text-center">
          <h2 className="text-2xl font-bold mb-4">この情報でよろしいですか？</h2>
          
          <div className="text-left bg-gray-50 p-6 rounded mb-6">
            <h3 className="font-bold border-b pb-2 mb-4">登録者情報</h3>
            <p>氏名: 高専 太郎</p>
            <p>メール: taro@example.com</p>

            <h3 className="font-bold border-b pb-2 mb-4 mt-6">申し込みする授業</h3>
            <ul className="space-y-2">
              {Object.entries(selected).map(([name, time]) => (
                <li key={name} className="flex justify-between">
                  <span>{name}</span>
                  <span className="font-mono">{time}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-center gap-4">
            <button onClick={() => setStep(1)} className="bg-gray-500 text-white py-2 px-6 rounded">
              戻る
            </button>
            <button onClick={() => setStep(3)} className="bg-blue-600 text-white font-bold py-2 px-8 rounded hover:bg-blue-700">
              確定
            </button>
          </div>
        </div>
      </div>
    );
  }

  // STEP 3: 完了画面
  if (step === 3) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white p-10 rounded shadow text-center max-w-lg w-full">
          <h2 className="text-2xl font-bold text-green-600 mb-4">申し込みが確定しました。</h2>
          <p className="text-gray-600 mb-8">抽選結果はメールでお伝えします</p>
          <Link href="/dashboard" className="block w-full bg-blue-600 text-white py-3 rounded font-bold hover:bg-blue-700">
            トップページ（マイページ）へ
          </Link>
        </div>
      </div>
    );
  }
}