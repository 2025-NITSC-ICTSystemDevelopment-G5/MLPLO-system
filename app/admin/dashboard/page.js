'use client';

import Link from 'next/link';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-800 text-white p-6 relative">
      <div className="max-w-4xl mx-auto pb-16">
        <div className="flex justify-between items-center mb-10 border-b border-gray-600 pb-4">
          <h1 className="text-2xl font-bold">管理者メニュー</h1>
          <Link href="/" className="bg-gray-600 px-4 py-2 rounded text-sm hover:bg-gray-500 transition">ログアウト</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* 申し込み受付期間 (表示のみ) */}
          <div className="bg-gray-700 p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-bold mb-4 border-b border-gray-600 pb-2">現在の受付期間</h2>
            <div className="space-y-4 mb-6">
              <div>
                <span className="block text-xs text-gray-400 mb-1">開始日時</span>
                <p className="text-xl font-mono font-bold">2025/08/01 10:00</p>
              </div>
              <div>
                <span className="block text-xs text-gray-400 mb-1">終了日時</span>
                <p className="text-xl font-mono font-bold">2025/08/15 17:00</p>
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

          {/* 一覧出力 */}
          <div className="bg-gray-700 p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-bold mb-4">リスト出力・確認</h2>
            <div className="space-y-4">
              <Link href="/admin/applicants" className="block text-center bg-gray-600 py-3 rounded hover:bg-gray-500 transition border border-gray-500">
                申込者一覧を表示
              </Link>
              <Link href="/admin/participants" className="block text-center bg-blue-800 py-3 rounded hover:bg-blue-700 transition border border-blue-600 font-bold">
                参加者一覧を表示 (当選者)
              </Link>
            </div>
          </div>

        </div>
      </div>

      {/* 全データ消去 */}
      <div className="fixed bottom-6 right-6">
        <button 
          className="text-xs text-gray-500 hover:text-red-500 underline transition"
          onClick={() => confirm("本当に全てのデータを消去しますか？") && alert("消去しました")}
        >
          全データ消去
        </button>
      </div>
    </div>
  );
}