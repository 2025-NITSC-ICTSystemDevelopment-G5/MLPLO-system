'use client';

import Link from 'next/link';

export default function AdminPeriod() {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded shadow-lg">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">受付期間変更</h1>

        <div className="space-y-6">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <p className="text-sm text-yellow-700">
              ※ここで設定した期間中のみ、学生からの申し込みが可能になります。
            </p>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">開始日時</label>
            <input 
              type="datetime-local" 
              className="w-full border p-3 rounded focus:ring-2 focus:ring-blue-500 outline-none text-lg" 
              defaultValue="2025-08-01T10:00"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">終了日時</label>
            <input 
              type="datetime-local" 
              className="w-full border p-3 rounded focus:ring-2 focus:ring-blue-500 outline-none text-lg" 
              defaultValue="2025-08-15T17:00"
            />
          </div>

          <div className="pt-6 flex gap-4">
            <Link 
              href="/admin/dashboard"
              className="w-1/3 bg-gray-500 text-white font-bold py-3 rounded text-center hover:bg-gray-600 transition"
            >
              キャンセル
            </Link>
            <button className="w-2/3 bg-blue-600 text-white font-bold py-3 rounded hover:bg-blue-700 transition shadow-md">
              設定を保存する
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}