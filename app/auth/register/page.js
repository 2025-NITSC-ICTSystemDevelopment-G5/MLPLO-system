import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">アカウント作成</h2>
        <p className="text-sm text-gray-500 mb-4 text-center">情報を入力してください</p>
        
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">登録ID</label>
            <input type="text" className="mt-1 w-full border rounded p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">パスワード</label>
            <input type="password" className="mt-1 w-full border rounded p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">本人氏名</label>
            <input type="text" className="mt-1 w-full border rounded p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">保護者氏名</label>
            <input type="text" className="mt-1 w-full border rounded p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">中学校名</label>
            <input type="text" className="mt-1 w-full border rounded p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">学年</label>
            <select className="mt-1 w-full border rounded p-2 bg-white">
              <option>選択してください</option>
              <option>中学1年生</option>
              <option>中学2年生</option>
              <option>中学3年生</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">メールアドレス</label>
            <input type="email" className="mt-1 w-full border rounded p-2" />
          </div>

          <button type="button" className="w-full bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700 mt-6">
            登録
          </button>
        </form>
        
        <div className="mt-4 text-center">
          <Link href="/" className="text-sm text-gray-500 hover:underline">トップページへ戻る</Link>
        </div>
      </div>
    </div>
  );
}