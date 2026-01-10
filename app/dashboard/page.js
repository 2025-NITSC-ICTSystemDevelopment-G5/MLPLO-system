'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function UserDashboard() {
  const router = useRouter();
  const [applications, setApplications] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. ローカルストレージからユーザー情報を取得
    const storedUser = localStorage.getItem('currentUser');
    if (!storedUser) {
      router.push('/auth/login');
      return;
    }
    const currentUser = JSON.parse(storedUser);
    setUser(currentUser);

    // 2. 申し込み状況を取得
    const fetchApplications = async () => {
      try {
        const res = await fetch(`/api/my-applications?uid=${currentUser.applicant_id}`);
        if (res.ok) {
          const data = await res.json();
          setApplications(data);
        }
      } catch (err) {
        console.error("データ取得エラー:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, [router]);

  // ログアウト処理
  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    router.push('/');
  };

  // ステータス表示用ヘルパー（ダークモード用に色調整）
  const getStatusBadge = (status) => {
    switch(status) {
      case 'WIN': 
        return <span className="bg-green-900 text-green-200 text-xs font-bold px-2 py-1 rounded">当選</span>;
      case 'LOSE': 
        return <span className="bg-red-900 text-red-200 text-xs font-bold px-2 py-1 rounded">落選</span>;
      default: 
        return <span className="bg-gray-600 text-gray-200 text-xs font-bold px-2 py-1 rounded">抽選待ち</span>;
    }
  };

  // データ読み込み中
  if (isLoading) {
    return <div className="min-h-screen bg-gray-800 text-white p-6 flex items-center justify-center">読み込み中...</div>;
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-800 text-white p-6">
      <div className="max-w-4xl mx-auto pb-16">
        
        {/* ヘッダー部分 */}
        <div className="flex justify-between items-center mb-10 border-b border-gray-600 pb-4">
          <div>
            <h1 className="text-2xl font-bold">マイページ</h1>
            <p className="text-sm text-gray-400 mt-1">ようこそ、{user.student_name} さん</p>
          </div>
          <button 
            onClick={handleLogout} 
            className="bg-gray-600 px-4 py-2 rounded text-sm hover:bg-gray-500 transition"
          >
            ログアウト
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6">
          
          {/* --- セクション1: 登録情報 (横長カード) --- */}
          <div className="bg-gray-700 p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-bold mb-4 border-b border-gray-600 pb-2">登録情報</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
              <InfoItem label="ID" value={user.applicant_id} />
              <InfoItem label="生徒氏名" value={user.student_name} />
              <InfoItem label="保護者氏名" value={user.parent_name} />
              <InfoItem label="学校名" value={user.school_name} />
              <InfoItem label="学年" value={user.grade} />
              <InfoItem label="メールアドレス" value={user.email} />
            </div>
          </div>

          {/* --- セクション2: 下部エリア (2カラム) --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* 左側: 現在の申し込み状況 */}
            <div className="bg-gray-700 p-6 rounded-lg shadow-lg">
              <h2 className="text-lg font-bold mb-4 border-b border-gray-600 pb-2">現在の申し込み状況</h2>
              
              {applications.length === 0 ? (
                <div className="bg-gray-800 p-4 rounded text-center text-gray-400 text-sm">
                  現在、申し込み済みの授業はありません。
                </div>
              ) : (
                <div className="space-y-4">
                  {applications.map((app) => (
                    <div key={app.id} className="bg-gray-800 p-4 rounded border border-gray-600 relative">
                      <div className="absolute top-4 right-4">
                        {getStatusBadge(app.status)}
                      </div>
                      <h3 className="text-blue-400 font-bold text-lg mb-2 pr-16">{app.className}</h3>
                      <div className="text-sm text-gray-300 space-y-1">
                        <p>日付：{app.date}</p>
                        <p>時間：{app.time}</p>
                        <p>教室：{app.room || '未定'}</p>
                        <p>担当教員：{app.teacher || '-'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 右側: 新規申し込みボタンエリア */}
            <div className="bg-gray-700 p-6 rounded-lg shadow-lg flex flex-col justify-center">
              <h2 className="text-lg font-bold mb-4 text-center">授業への参加申し込み</h2>
              <button 
                onClick={() => router.push('/dashboard/select-class')}
                className="block w-full bg-blue-600 py-4 rounded-lg hover:bg-blue-500 font-bold transition shadow-md text-center"
              >
                新規申し込みへ進む
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

// --- 部品コンポーネント（情報表示用） ---
function InfoItem({ label, value }) {
  return (
    <div className="border-b border-gray-600 pb-1">
      <span className="block text-xs text-gray-400 mb-1">{label}</span>
      <p className="text-base font-medium">{value}</p>
    </div>
  );
}