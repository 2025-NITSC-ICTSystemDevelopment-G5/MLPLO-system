'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function UserLogin() {
  const router = useRouter();

  const handleLogin = (e) => {
    e.preventDefault();
    // ログイン成功としてマイページへ移動
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md border-t-4 border-blue-600">
        <h1 className="text-2xl font-bold text-center mb-6 text-blue-600">ログイン</h1>
        <p className="text-sm text-gray-500 mb-6 text-center">
          IDとパスワードを入力してください
        </p>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <input 
              type="text" 
              className="w-full border p-3 rounded bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="登録ID"
            />
            <input 
              type="password" 
              className="w-full border p-3 rounded bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="パスワード"
            />
          </div>

          <button className="w-full bg-blue-600 text-white font-bold py-3 rounded hover:bg-blue-700 transition shadow-md">
            ログイン
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link href="/" className="text-sm text-gray-400 hover:text-gray-600">
            トップページへ戻る
          </Link>
        </div>
      </div>
    </div>
  );
}