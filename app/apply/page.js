'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ApplyPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState({}); // { classId: sessionId }
  const [classes, setClasses] = useState([]); // グループ化した授業データ
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // 1. 初期データロード
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (!storedUser) {
      router.push('/auth/login');
      return;
    }
    setUser(JSON.parse(storedUser));

    const fetchData = async () => {
      try {
        const res = await fetch('/api/classes');
        const rawData = await res.json();

        // 【重要】APIからのフラットなデータを、授業ごとにまとめる
        const grouped = {};
        rawData.forEach(item => {
          if (!grouped[item.class_id]) {
            grouped[item.class_id] = {
              id: item.class_id,
              name: item.class_name,
              teacher: item.teacher_name,
              capacity: item.max_capacity,
              times: []
            };
          }
          if (item.session_id) {
            grouped[item.class_id].times.push({
              sessionId: item.session_id,
              date: item.class_date,
              start: item.start_time,
              end: item.end_time
            });
          }
        });
        setClasses(Object.values(grouped));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  // 2. 選択処理
  const handleSelect = (classId, sessionId) => {
    // 同じ授業で別の時間を選んだら上書き、同じ時間なら解除
    setSelected(prev => ({
      ...prev,
      [classId]: prev[classId] === sessionId ? undefined : sessionId
    }));
  };

  // 3. 送信処理（ループして複数件POST）
  const handleSubmit = async () => {
    try {
      // 選択された {classId: sessionId} を配列に変換して送信
      const promises = Object.entries(selected)
        .filter(([_, sessionId]) => sessionId) // 未選択を除外
        .map(async ([classId, sessionId]) => {
          const payload = {
            application_id: 'APP' + Math.floor(Math.random()*1000000), // 仮ID
            applicant_id: user.applicant_id,
            class_id: classId,
            session_id: sessionId
          };
          
          const res = await fetch('/api/applications/submit', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload)
          });
          
          if(!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'エラー');
          }
        });

      await Promise.all(promises);
      setStep(3); // 完了画面へ

    } catch (err) {
      alert(`申し込みに失敗しました: ${err.message}`);
    }
  };

  if (loading) return <div className="p-8 text-black text-center">読み込み中...</div>;

  // --- STEP 1: 選択画面 ---
  if (step === 1) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 pb-24">
        <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
          <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">模擬授業申し込み</h1>
          
          <div className="space-y-8">
            {classes.map((cls) => (
              <div key={cls.id} className="border p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-xl font-bold text-blue-800">{cls.name}</h2>
                </div>
                <p className="text-sm text-gray-600 mb-2">担当: {cls.teacher} | 定員: {cls.capacity}名</p>
                <p className="font-bold text-sm mb-2 text-gray-700">時間を選択してください</p>
                
                <div className="flex flex-wrap gap-2">
                  {cls.times.map((time) => {
                    const label = `${new Date(time.date).toLocaleDateString()} ${time.start.substring(0,5)}～`;
                    const isSelected = selected[cls.id] === time.sessionId;
                    return (
                      <button
                        key={time.sessionId}
                        onClick={() => handleSelect(cls.id, time.sessionId)}
                        className={`px-4 py-2 rounded border transition ${
                          isSelected 
                            ? 'bg-blue-600 text-white border-blue-600' 
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center sticky bottom-4 bg-white/90 p-4 border-t">
            <button 
              onClick={() => setStep(2)}
              className="bg-green-600 text-white font-bold py-3 px-12 rounded shadow hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={Object.values(selected).filter(v => v).length === 0}
            >
              決定（確認画面へ）
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- STEP 2: 確認画面 ---
  if (step === 2) {
    // 選択された授業の情報を表示用に検索
    const selectedList = Object.entries(selected)
      .filter(([_, sid]) => sid)
      .map(([cid, sid]) => {
        const cls = classes.find(c => c.id === cid);
        const time = cls.times.find(t => t.sessionId === sid);
        return { 
          name: cls.name, 
          time: `${new Date(time.date).toLocaleDateString()} ${time.start.substring(0,5)}～` 
        };
      });

    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto bg-white p-8 rounded shadow text-center">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">この情報で申し込みますか？</h2>
          
          <div className="text-left bg-gray-50 p-6 rounded mb-6">
            <h3 className="font-bold border-b pb-2 mb-4 text-gray-700">申し込み内容</h3>
            <ul className="space-y-2 text-gray-800">
              {selectedList.map((item, idx) => (
                <li key={idx} className="flex justify-between">
                  <span>{item.name}</span>
                  <span className="font-mono">{item.time}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-center gap-4">
            <button onClick={() => setStep(1)} className="bg-gray-500 text-white py-2 px-6 rounded">
              戻る
            </button>
            <button onClick={handleSubmit} className="bg-blue-600 text-white font-bold py-2 px-8 rounded hover:bg-blue-700">
              確定する
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- STEP 3: 完了画面 ---
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white p-10 rounded shadow text-center max-w-lg w-full">
        <h2 className="text-2xl font-bold text-green-600 mb-4">申し込みが完了しました</h2>
        <p className="text-gray-600 mb-8">抽選結果をお待ちください。</p>
        <Link href="/dashboard" className="block w-full bg-blue-600 text-white py-3 rounded font-bold hover:bg-blue-700">
          マイページへ戻る
        </Link>
      </div>
    </div>
  );
}