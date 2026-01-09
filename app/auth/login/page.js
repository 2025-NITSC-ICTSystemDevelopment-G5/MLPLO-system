'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function UserLogin() {
  const router = useRouter();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      // 以前作成した生徒用ログインAPIを呼び出す
      const res = await fetch('/api/applicants/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login_id: loginId, password: password }),
      });

      // 401エラー（パスワード違い）の場合
      if (res.status === 401) {
        setErrorMessage('IDまたはパスワードが間違っています。');
        setIsLoading(false);
        return;
      }

      // それ以外のエラー
      if (!res.ok) {
        setErrorMessage('システムエラーが発生しました。時間を置いて再度お試しください。');
        setIsLoading(false);
        return;
      }

      const data = await res.json();

      if (data.success) {
        // 成功時：ユーザー情報を保存してダッシュボードへ
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        router.push('/dashboard');
      }

    } catch (error) {
      console.error('Login Error:', error);
      setErrorMessage('通信エラーが発生しました。');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border-t-4 border-blue-600">
        <h1 className="text-2xl font-bold text-center mb-2 text-gray-800">受講生ログイン</h1>
        <p className="text-sm text-gray-500 mb-8 text-center">
          登録したIDとパスワードを入力してください
        </p>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ログインID</label>
              <input 
                type="text" 
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded-lg bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-500 text-black transition-colors"
                placeholder="例: student001"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">パスワード</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded-lg bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-500 text-black transition-colors"
                placeholder="パスワード"
                required
              />
            </div>
          </div>

          {/* エラーメッセージ表示エリア */}
          {errorMessage && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700 font-bold">{errorMessage}</p>
                </div>
              </div>
            </div>
          )}

          <button 
            type="submit" 
            disabled={isLoading}
            className={`w-full bg-blue-600 text-white font-bold py-3 rounded-lg shadow-md transition duration-200 ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700 hover:shadow-lg'}`}
          >
            {isLoading ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>

        <div className="mt-8 text-center border-t pt-6">
          <p className="text-sm text-gray-500 mb-2">アカウントをお持ちでない方</p>
          <Link href="/auth/register" className="text-blue-600 hover:text-blue-800 font-semibold hover:underline">
            新規アカウント作成はこちら
          </Link>
        </div>
        
        <div className="mt-4 text-center">
          <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 transition">
            トップページへ戻る
          </Link>
        </div>
      </div>
    </div>
  );
}