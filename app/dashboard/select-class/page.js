'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SelectClassPage() {
  const router = useRouter();
  
  const [applicantId, setApplicantId] = useState(null); 
  const [classes, setClasses] = useState([]); 
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 画面が開いたときにログインチェック & データ取得
  useEffect(() => {
    // ログイン情報をブラウザから取り出す
    const storedUser = localStorage.getItem('currentUser');
    
    if (!storedUser) {
      alert("ログインしてください");
      router.push('/auth/login');
      return;
    }

    // ログイン情報があればIDをセットする
    const user = JSON.parse(storedUser);
    setApplicantId(user.applicant_id);

    // 授業データも取得
    const fetchClasses = async () => {
      try {
        const res = await fetch('/api/classes');
        if (!res.ok) throw new Error('データ取得エラー');
        
        const data = await res.json();
        setClasses(data);
        
        if (data.length > 0) {
          setSelectedClass(data[0]);
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

  const handleClassChange = (e) => {
    const classId = e.target.value; 
    const newClass = classes.find((c) => c.id == classId);
    setSelectedClass(newClass);
    setSelectedSessionId('');
  };

  const handleComplete = async () => {
    if (!applicantId) {
      alert("ログイン情報が見つかりません。再度ログインしてください。");
      router.push('/auth/login');
      return;
    }

    if (!selectedSessionId) {
      alert("希望の時間を選択してください");
      return;
    }

    if (!selectedClass || !selectedClass.id) {
      alert("授業情報が正しく選択されていません");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicant_id: applicantId,
          class_id: selectedClass.id,
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
          <h2 className="text-2xl font-bold mb-2 text-center">受講授業の選択</h2>

          <div className="space-y-6">
            
            {/* 1. 授業選択 */}
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">イベント（授業内容）</label>
              <select 
                className="w-full bg-gray-800 border border-gray-500 text-white rounded p-3 focus:outline-none focus:border-blue-500 transition-colors"
                value={selectedClass ? selectedClass.id : ''} 
                onChange={handleClassChange}
              >
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>{cls.name}</option>
                ))}
              </select>
              <p className="text-sm text-gray-400 mt-2 leading-relaxed bg-gray-800 p-3 rounded border border-gray-600/50">
                {selectedClass ? selectedClass.description : ''}
              </p>
            </div>

            {/* 2. 時間選択 */}
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">希望の時間</label>
              <select 
                className="w-full bg-gray-800 border border-gray-500 text-white rounded p-3 focus:outline-none focus:border-blue-500 transition-colors"
                value={selectedSessionId} 
                onChange={(e) => setSelectedSessionId(e.target.value)}
              >
                <option value="">-- 時間を選択してください --</option>
                {selectedClass && selectedClass.sessions && selectedClass.sessions.map((sess) => (
                  <option key={sess.id} value={sess.id}>{sess.label}</option>
                ))}
              </select>
            </div>

            {/* 3. PDFリンク */}
            {selectedClass && (
              <div className="text-right pt-2">
                {selectedClass.pdfLink && selectedClass.pdfLink !== '#' ? (
                  <a 
                    href={selectedClass.pdfLink} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-400 hover:text-blue-300 text-sm font-bold underline transition-colors"
                  >
                    📄 授業情報PDFをダウンロード
                  </a>
                ) : (
                  <span className="text-gray-500 text-xs">※ PDF資料はありません</span>
                )}
              </div>
            )}

            {/* 送信ボタン */}
            <div className="pt-4">
              <button 
                onClick={handleComplete} 
                disabled={isSubmitting}
                className={`w-full bg-blue-600 text-white font-bold py-4 rounded-lg shadow-md transition-all
                  ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-500 hover:shadow-lg'}`}
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