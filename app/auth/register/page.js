'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    applicant_id: '',
    login_id: '',
    password: '',
    student_name: '',
    parent_name: '',
    school_name: '',
    grade: '',
    email: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload = {
      ...formData,
      applicant_id: formData.applicant_id || 'STU' + Math.floor(Math.random() * 100000)
    };

    try {
      const res = await fetch('/api/applicants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || '登録に失敗しました');
      }

      alert('アカウントを作成しました。ログイン画面へ移動します。');
      router.push('/auth/login');

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">アカウント作成</h2>
        
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">希望ログインID</label>
            <input name="login_id" required onChange={handleChange} type="text" className="mt-1 w-full border rounded p-2 text-black" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">パスワード</label>
            <input name="password" required onChange={handleChange} type="password" className="mt-1 w-full border rounded p-2 text-black" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">本人氏名</label>
            <input name="student_name" required onChange={handleChange} type="text" className="mt-1 w-full border rounded p-2 text-black" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">保護者氏名</label>
            <input name="parent_name" onChange={handleChange} type="text" className="mt-1 w-full border rounded p-2 text-black" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">学校名</label>
            <input name="school_name" onChange={handleChange} type="text" className="mt-1 w-full border rounded p-2 text-black" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">学年</label>
            <select name="grade" onChange={handleChange} className="mt-1 w-full border rounded p-2 bg-white text-black">
              <option value="">選択してください</option>
              
              <optgroup label="小学生">
                <option value="小学1年生">小学1年生</option>
                <option value="小学2年生">小学2年生</option>
                <option value="小学3年生">小学3年生</option>
                <option value="小学4年生">小学4年生</option>
                <option value="小学5年生">小学5年生</option>
                <option value="小学6年生">小学6年生</option>
              </optgroup>

              <optgroup label="中学生">
                <option value="中学1年生">中学1年生</option>
                <option value="中学2年生">中学2年生</option>
                <option value="中学3年生">中学3年生</option>
              </optgroup>

              <optgroup label="その他">
                <option value="その他">その他</option>
              </optgroup>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">メールアドレス</label>
            <input name="email" required onChange={handleChange} type="email" className="mt-1 w-full border rounded p-2 text-black" />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700 mt-6 disabled:bg-gray-400"
          >
            {loading ? '登録中...' : '登録'}
          </button>
        </form>
        
        <div className="mt-4 text-center">
          <Link href="/" className="text-sm text-gray-500 hover:underline">トップページへ戻る</Link>
        </div>
      </div>
    </div>
  );
}