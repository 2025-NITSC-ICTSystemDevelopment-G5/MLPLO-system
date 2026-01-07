'use client';

import Link from 'next/link';

export default function UserDashboard() {
  // 画面表示用のダミーデータ
  const user = {
    id: "student123",
    name: "高専 太郎",
    email: "taro@example.com"
  };

  const results = [
    // まだ申し込みがない場合の表示テスト用（空配列にすると「申し込みなし」表示になります）
    // { name: "国語", time: "09:00～", status: "当選" } 
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">マイページ</h1>
          <Link href="/" className="text-sm text-red-500 hover:underline">ログアウト</Link>
        </div>

        {/* 登録者情報 */}
        <section className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
          <h2 className="text-lg font-bold mb-4 text-gray-700">ようこそ、{user.name} さん</h2>
          <div className="text-sm text-gray-600">
            <p>登録ID: {user.id}</p>
            <p>メール: {user.email}</p>
          </div>
        </section>

        {/* 申し込み状況 */}
        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-bold mb-4 border-b pb-2">現在の申し込み状況</h2>
          
          {results.length > 0 ? (
             <div className="space-y-4">
               {results.map((res, index) => (
                 <div key={index} className="p-4 bg-gray-50 rounded border">
                   {res.name} - {res.status}
                 </div>
               ))}
             </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500 mb-6">現在、申し込んでいる授業はありません。</p>
              <Link href="/apply" className="inline-block bg-orange-500 text-white font-bold py-3 px-10 rounded-full hover:bg-orange-600 shadow-lg transition transform hover:scale-105">
                授業に申し込む
              </Link>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}