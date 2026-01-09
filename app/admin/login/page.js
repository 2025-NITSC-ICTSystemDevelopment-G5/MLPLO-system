'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLogin() {
  const router = useRouter();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/admins/login_admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login_id: loginId, password }),
      });

      if (!res.ok) {
        // 401などのエラーハンドリング
        if (res.status === 401) {
          setError('IDまたはパスワードが正しくありません');
        } else {
          setError('サーバーエラーが発生しました');
        }
        return;
      }

      // 成功時
      router.push('/admin/dashboard');

    } catch (err) {
      setError('通信エラーが発生しました');
    }
  };

  return (
    <div className="min-h-screen bg-gray-800 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md border-t-4 border-gray-600">
        <h1 className="text-xl font-bold text-center mb-6 text-gray-800">管理者ログイン</h1>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">管理者ID</label>
              <input 
                type="text" 
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                className="w-full border p-2 rounded outline-none focus:border-gray-500 text-black"
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">パスワード</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border p-2 rounded outline-none focus:border-gray-500 text-black" 
                required
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm font-bold text-center">{error}</p>}

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