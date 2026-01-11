'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // ★追加: 戻る機能用
import Link from 'next/link';

export default function AdminLottery() {
  const router = useRouter(); // ★追加
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([]);
  const [lotteryStatus, setLotteryStatus] = useState('PENDING'); // PENDING | DONE | MAILED
  const [processing, setProcessing] = useState(false);

  // データ取得関数
  const fetchStats = async () => {
    try {
      const res = await fetch('/api/lottery/stats', { cache: 'no-store' });
      if (!res.ok) throw new Error('取得失敗');
      const data = await res.json();
      setStats(data);
      
      // 既に当選者が一人でもいれば「抽選済み(DONE)」とみなす
      const hasWinners = data.some(item => item.winners > 0);
      if (hasWinners && lotteryStatus === 'PENDING') {
        setLotteryStatus('DONE');
      }

    } catch (err) {
      console.error(err);
      alert('データの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // 1. 抽選ロジックの実行
  const handleRunLottery = async () => {
    if (!confirm("抽選条件に基づき、当選者を自動決定しますか？\n（定員割れ全員当選、1日2件制限など）")) return;
    
    setProcessing(true);
    try {
      const res = await fetch('/api/lottery/run', { method: 'POST' });
      if (res.ok) {
        alert('抽選処理が完了しました。');
        setLotteryStatus('DONE');
        await fetchStats();
      } else {
        alert('エラーが発生しました');
      }
    } catch (err) {
      alert('通信エラー');
    } finally {
      setProcessing(false);
    }
  };

  // 2. メール送信の実行
  const handleSendMail = async () => {
    if (!confirm("確定した結果に基づき、全員へメールを一斉送信しますか？\nこの操作は取り消せません。")) return;

    setProcessing(true);
    try {
      const res = await fetch('/api/lottery/mail', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        setLotteryStatus('MAILED');
      } else {
        alert(data.message || '送信に失敗しました');
      }
    } catch (err) {
      alert('通信エラー');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-100 p-10 text-center">読み込み中...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto bg-white p-8 rounded shadow-lg">
        
        {/* ★変更: ヘッダーエリア（タイトル ＋ 管理者メニューへ戻る） */}
        <div className="flex justify-between items-center mb-8 border-b pb-4">
          <h1 className="text-2xl font-bold text-gray-800">抽選および結果通知</h1>
          <Link href="/admin/dashboard" className="text-sm text-gray-500 hover:text-blue-600 hover:underline transition">
            管理者メニューへ戻る
          </Link>
        </div>

        {/* ステータス表示 */}
        <div className="flex justify-center mb-8">
            <div className={`px-6 py-2 rounded-full font-bold text-white transition-colors ${
                lotteryStatus === 'PENDING' ? 'bg-gray-400' :
                lotteryStatus === 'DONE' ? 'bg-orange-500' : 'bg-green-600'
            }`}>
                現在の状態: {
                    lotteryStatus === 'PENDING' ? '抽選未実施' :
                    lotteryStatus === 'DONE' ? '抽選完了（メール未送信）' : '全処理完了'
                }
            </div>
        </div>

        {/* 登録状況テーブル */}
        <h2 className="text-lg font-bold mb-4 text-gray-800">申し込み・当選状況</h2>
        
        {stats.length === 0 ? (
          <div className="p-6 bg-gray-50 text-center text-gray-500 border rounded mb-8">
            授業データがありません。まずは授業を登録してください。
          </div>
        ) : (
          <div className="overflow-x-auto mb-8 border rounded">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b text-sm">
                  <th className="p-3 font-bold text-gray-600">授業名 / 日時</th>
                  <th className="p-3 font-bold text-gray-600 text-right">定員</th>
                  <th className="p-3 font-bold text-gray-600 text-right">申込数</th>
                  <th className="p-3 font-bold text-gray-600 text-right">当選数</th>
                  <th className="p-3 font-bold text-gray-600 text-center">判定</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stats.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="p-3">
                      <div className="font-bold text-gray-800">{item.name}</div>
                      <div className="text-xs text-gray-500">{item.dateInfo}</div>
                    </td>
                    <td className="p-3 text-right">{item.capacity}</td>
                    <td className={`p-3 text-right font-bold ${item.count > item.capacity ? 'text-red-600' : 'text-gray-800'}`}>
                      {item.count}
                    </td>
                    <td className="p-3 text-right font-bold text-blue-600">
                      {lotteryStatus === 'PENDING' ? '-' : `${item.winners}名`}
                    </td>
                    <td className="p-3 text-center text-xs">
                      {item.count > item.capacity ? 
                          <span className="text-red-600 bg-red-100 px-2 py-1 rounded font-bold">抽選対象</span> : 
                          <span className="text-green-700 bg-green-100 px-2 py-1 rounded font-bold">全員当選</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* アクションエリア */}
        <div className="border-t pt-8 text-center space-y-4">
          
          {/* STEP 1: 抽選実行 */}
          {lotteryStatus === 'PENDING' && stats.length > 0 && (
            <div className="bg-yellow-50 p-6 rounded border border-yellow-200">
                <h3 className="font-bold text-lg mb-2 text-yellow-800">ステップ1: 当選者の確定</h3>
                <p className="text-sm text-gray-600 mb-4">
                    定員オーバーのクラスに対して抽選を行い、重複などの条件チェックを含めて当選者を確定させます。<br/>
                    （定員割れクラスは自動的に全員当選となります）
                </p>
                <button 
                    onClick={handleRunLottery}
                    disabled={processing}
                    className="bg-orange-600 text-white font-bold py-3 px-12 rounded-full shadow hover:bg-orange-500 disabled:bg-gray-400 transition"
                >
                    {processing ? '処理中...' : '抽選ロジックを実行'}
                </button>
            </div>
          )}

          {/* STEP 2: メール送信 */}
          {lotteryStatus === 'DONE' && (
            <div className="bg-blue-50 p-6 rounded border border-blue-200 animate-fade-in">
                <h3 className="font-bold text-lg mb-2 text-blue-800">ステップ2: 結果メールの送信</h3>
                <p className="text-sm text-gray-600 mb-4">
                    抽選処理が完了しました。上の表で当選数を確認してください。<br/>
                    問題なければ、全申込者に対して結果メールを送信してください。
                </p>
                <button 
                    onClick={handleSendMail}
                    disabled={processing}
                    className="bg-blue-600 text-white font-bold py-3 px-12 rounded-full shadow hover:bg-blue-500 disabled:bg-gray-400 transition"
                >
                    {processing ? '送信中...' : '結果メールを一斉送信'}
                </button>
            </div>
          )}

          {/* 完了後 */}
          {lotteryStatus === 'MAILED' && (
             <div className="bg-green-50 p-6 rounded-lg border border-green-200 text-center">
                <h3 className="text-xl font-bold text-green-700 mb-2">全工程が完了しました</h3>
                <p className="text-gray-600 mb-6">メール送信済みです。</p>
                <Link href="/admin/dashboard" className="text-blue-600 hover:underline font-bold">
                  管理者メニューへ戻る
                </Link>
             </div>
          )}
        </div>

        {/* ★追加: ひとつ前のページに戻るボタン */}
        <div className="mt-12 text-center">
           <button 
             onClick={() => router.back()} 
             className="text-gray-500 hover:text-gray-800 hover:underline transition px-4 py-2 text-sm"
           >
             ← ひとつ前のページに戻る
           </button>
        </div>

      </div>
    </div>
  );
}