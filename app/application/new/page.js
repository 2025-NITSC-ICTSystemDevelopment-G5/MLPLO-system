'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function NewApplicationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // URLからIDを取得
  const applicantId = searchParams.get('id');

  const [examName, setExamName] = useState('8/20 オープンキャンパス'); // 初期値
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        applicant_id: applicantId,
        exam_name: examName
      }),
    });

    if (res.ok) {
      alert('申し込みが完了しました！');
      router.push('/dashboard');
    } else {
      alert('エラーが発生しました');
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px' }}>
      <h1>イベント申し込み</h1>
      
      {/* ★ここを「ID」のみに変更しました */}
      <p style={{ fontWeight: 'bold', fontSize: '1.2em' }}>ID: {applicantId}</p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <label>
          参加するイベントを選択してください:
          <select 
            style={{ display: 'block', width: '100%', padding: '10px', marginTop: '5px', fontSize: '16px' }}
            value={examName}
            onChange={(e) => setExamName(e.target.value)}
          >
            {/* オープンキャンパスらしい選択肢に変更例 */}
            <option value="8/20 オープンキャンパス">8/20 オープンキャンパス</option>
            <option value="9/15 体験入学">9/15 体験入学</option>
            <option value="10/10 個別相談会">10/10 個別相談会</option>
          </select>
        </label>

        <button 
          type="submit" 
          disabled={loading}
          style={{ padding: '15px', background: '#0070f3', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          {loading ? '送信中...' : '申し込む'}
        </button>
      </form>
      
      <button onClick={() => router.back()} style={{ marginTop: '20px', background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer' }}>
        キャンセルして戻る
      </button>
    </div>
  );
}