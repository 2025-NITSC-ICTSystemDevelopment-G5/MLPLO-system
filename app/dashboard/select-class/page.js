'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SelectClassPage() {
  const router = useRouter();
  
  const [applicantId, setApplicantId] = useState(null); 
  const [classes, setClasses] = useState([]); // グループ化した授業データ
  
  // 選択状態
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSessionId, setSelectedSessionId] = useState('');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 画面が開いたときにログインチェック & データ取得
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    
    if (!storedUser) {
      // 未ログインならログイン画面へ
      router.push('/auth/login');
      return;
    }

    const user = JSON.parse(storedUser);
    setApplicantId(user.applicant_id);

    const fetchClasses = async () => {
      try {
        // キャッシュ無効化で最新データを取得
        const res = await fetch('/api/classes', { cache: 'no-store' });
        if (!res.ok) throw new Error('データ取得エラー');
        
        const rawData = await res.json();
        
        // ★重要: APIからのフラットなデータを「授業ごと」にグループ化する
        const grouped = {};
        rawData.forEach(item => {
          // まだその授業がリストになければ作成
          if (!grouped[item.class_id]) {
            grouped[item.class_id] = {
              id: item.class_id,
              name: item.class_name,
              description: item.description,
              sessions: []
            };
          }
          // セッション（日時）情報があれば追加
          if (item.session_id) {
            // 表示用の日時文字列を作成
            const dateStr = item.class_date_str || item.class_date; // APIによってキー名が違う場合に対応
            const timeStr = (item.start_time_str || item.start_time || '').substring(0, 5);
            
            grouped[item.class_id].sessions.push({
              id: item.session_id,
              label: `${dateStr} ${timeStr}～`,
              // ソート用に生の日付も持っておく
              sortKey: `${dateStr} ${timeStr}`
            });
          }
        });

        // オブジェクトを配列に変換
        const classList = Object.values(grouped);
        setClasses(classList);
        
        // 最初の一つを選択状態にする（任意）
        if (classList.length > 0) {
          setSelectedClassId(classList[0].id);
        }

      } catch (error) {
        console.error(error);
        alert('授業データの読み込みに失敗しました');
      } finally {
        setIsLoading(false);
      }
    };

    fetchClasses();
  }, [router]);

  // 授業が変更されたら、時間の選択をリセットする
  const handleClassChange = (e) => {
    setSelectedClassId(e.target.value);
    setSelectedSessionId('');
  };

  // 現在選択されている授業オブジェクトを取得（表示用）
  const currentClass = classes.find(c => c.id === selectedClassId);

  const handleComplete = async () => {
    if (!applicantId) {
      alert("ログイン情報が見つかりません。再度ログインしてください。");
      return;
    }

    if (!selectedClassId) {
      alert("授業を選択してください");
      return;
    }

    if (!selectedSessionId) {
      alert("希望の時間を選択してください");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicant_id: applicantId,
          class_id: selectedClassId,
          session_id: selectedSessionId
        }),
      });

      if (res.ok) {
        alert("申し込みが完了しました！");
        router.push('/dashboard'); 
      } else {
        const errorData = await res.json();
        alert(errorData.message || "申し込みに失敗しました");
      }
    } catch (error) {
      console.error(error);
      alert("通信エラーが発生しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-gray-800 text-white p-6 flex items-center justify-center">読み込み中...</div>;
  }
  
  if (classes.length === 0) {
    return (
      <div className="min-h-screen bg-gray-800 text-white p-6 flex flex-col items-center justify-center">
        <p className="mb-4 text-gray-300">現在申し込み可能な授業はありません。</p>
        <button onClick={() => router.back()} className="text-blue-400 hover:text-blue-300 underline">戻る</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-800 text-white p-6">
      <div className="max-w-lg mx-auto">
        
        {/* 戻るボタン */}
        <button 
          onClick={() => router.back()} 
          className="mb-6 text-gray-400 hover:text-white transition flex items-center text-sm"
        >
          ← 戻る
        </button>

        {/* フォームカード */}
        <div className="bg-gray-700 p-8 rounded-lg shadow-lg border border-gray-600">
          <h2 className="text-2xl font-bold mb-6 text-center">受講授業の選択</h2>

          <div className="space-y-6">
            
            {/* 1. 授業選択 */}
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">イベント（授業内容）</label>
              <select 
                className="w-full bg-gray-800 border border-gray-500 text-white rounded p-3 focus:outline-none focus:border-blue-500 transition-colors"
                value={selectedClassId} 
                onChange={handleClassChange}
              >
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>{cls.name}</option>
                ))}
              </select>
              
              {/* 説明文表示 */}
              {currentClass && (
                <div className="text-sm text-gray-400 mt-2 leading-relaxed bg-gray-800 p-3 rounded border border-gray-600/50 min-h-[60px]">
                  {currentClass.description || "説明はありません"}
                </div>
              )}
            </div>

            {/* 2. 時間選択 */}
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">希望の時間</label>
              <select 
                className="w-full bg-gray-800 border border-gray-500 text-white rounded p-3 focus:outline-none focus:border-blue-500 transition-colors"
                value={selectedSessionId} 
                onChange={(e) => setSelectedSessionId(e.target.value)}
                disabled={!currentClass || currentClass.sessions.length === 0}
              >
                <option value="">
                  {currentClass && currentClass.sessions.length === 0 
                    ? "※開催予定がありません" 
                    : "-- 時間を選択してください --"}
                </option>
                
                {currentClass && currentClass.sessions.map((sess) => (
                  <option key={sess.id} value={sess.id}>{sess.label}</option>
                ))}
              </select>
            </div>

            {/* 送信ボタン */}
            <div className="pt-4">
              <button 
                onClick={handleComplete} 
                disabled={isSubmitting || !selectedSessionId}
                className={`w-full font-bold py-4 rounded-lg shadow-md transition-all
                  ${(isSubmitting || !selectedSessionId)
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 text-white hover:bg-blue-500 hover:shadow-lg'}`}
              >
                {isSubmitting ? '送信中...' : '申し込む'}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}