'use client';

import Link from 'next/link';

export default function AdminClasses() {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダーエリア：タイトルと戻るボタン */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">模擬授業情報一覧 / 登録</h1>
          <Link href="/admin/dashboard" className="text-sm text-gray-500 hover:text-gray-800 hover:underline">
            管理者メニューへ戻る
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* 左側: 新規登録フォーム */}
          <div className="lg:col-span-1 bg-white p-6 rounded shadow sticky top-6">
            <h2 className="text-lg font-bold mb-6 text-blue-600 border-b pb-2">授業を追加</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">授業名</label>
                <input type="text" className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">担当教職員</label>
                <input type="text" className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">実施場所</label>
                <input type="text" className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">受入可能人数</label>
                <input type="number" className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" defaultValue={30} />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">実施回</label>
                <div className="space-y-2 bg-gray-50 p-3 rounded">
                   <div className="flex gap-2 items-center">
                     <select className="border rounded p-1 text-sm bg-white"><option>1日目</option><option>2日目</option></select>
                     <input type="time" className="border rounded p-1 text-sm" />
                     <span>～</span>
                     <input type="time" className="border rounded p-1 text-sm" />
                   </div>
                   <button type="button" className="text-xs text-blue-500 hover:text-blue-700 font-bold">+ 回を追加</button>
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-sm font-bold text-gray-700 mb-1">資料PDF</label>
                <input type="file" className="w-full text-sm text-gray-500" />
              </div>

              <div className="pt-4">
                <button className="w-full bg-blue-600 text-white py-3 rounded font-bold hover:bg-blue-700 shadow transition">
                  登録
                </button>
              </div>
            </form>
          </div>

          {/* 右側: 一覧表示（テーブル形式に変更） */}
          <div className="lg:col-span-2 bg-white rounded shadow overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h2 className="font-bold text-gray-700">登録済み授業一覧</h2>
              <span className="text-xs text-gray-500">全3件</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-600">
                <thead className="text-xs text-gray-700 uppercase bg-gray-100 border-b">
                  <tr>
                    <th className="px-4 py-3 w-1/4">授業名</th>
                    <th className="px-4 py-3">担当・場所</th>
                    <th className="px-4 py-3 text-center">定員</th>
                    <th className="px-4 py-3">実施日時</th>
                    <th className="px-4 py-3 text-center">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {/* データ行1 */}
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-bold text-gray-800">国語</td>
                    <td className="px-4 py-3">
                      <div>〇〇 ××先生</div>
                      <div className="text-xs text-gray-500">△△教室</div>
                    </td>
                    <td className="px-4 py-3 text-center">30</td>
                    <td className="px-4 py-3 text-xs">
                      <div>1日目 09:00～09:50</div>
                      <div>2日目 11:00～11:50</div>
                    </td>
                    <td className="px-4 py-3 text-center space-y-1">
                      <div className="flex justify-center space-x-2">
                        <button className="text-blue-600 hover:underline">変更</button>
                        <button className="text-red-600 hover:underline">削除</button>
                      </div>
                      <button className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 border hover:bg-gray-200">
                        CSV
                      </button>
                    </td>
                  </tr>
                  
                  {/* データ行2 */}
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-bold text-gray-800">数学</td>
                    <td className="px-4 py-3">
                      <div>鈴木 一郎</div>
                      <div className="text-xs text-gray-500">B201</div>
                    </td>
                    <td className="px-4 py-3 text-center">30</td>
                    <td className="px-4 py-3 text-xs">
                      <div>1日目 11:00～11:50</div>
                    </td>
                    <td className="px-4 py-3 text-center space-y-1">
                      <div className="flex justify-center space-x-2">
                        <button className="text-blue-600 hover:underline">変更</button>
                        <button className="text-red-600 hover:underline">削除</button>
                      </div>
                      <button className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 border hover:bg-gray-200">
                        CSV
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}