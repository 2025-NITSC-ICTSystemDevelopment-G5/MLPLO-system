'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLogin() {
  const router = useRouter();

  const handleLogin = (e) => {
    e.preventDefault();
    // 管理者メニューへ移動
    router.push('/admin/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-800 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md border-t-4 border-gray-600">
        <h1 className="text-xl font-bold text-center mb-6 text-gray-800">管理者ログイン</h1>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">管理者ID</label>
              <input type="text" className="w-full border p-2 rounded outline-none focus:border-gray-500" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">パスワード</label>
              <input type="password" className="w-full border p-2 rounded outline-none focus:border-gray-500" />
            </div>
          </div>

          <button className="w-full bg-gray-800 text-white font-bold py-3 rounded hover:bg-gray-700 transition">
            ログイン
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-blue-600 hover:underline">
            トップページへ戻る
          </Link>
        </div>
      </div>
    </div>
  );
}