'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLottery() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([]);
  const [lotteryStatus, setLotteryStatus] = useState('PENDING'); // PENDING | DONE | MAILED
  const [processing, setProcessing] = useState(false);
  const [lotteryTime, setLotteryTime] = useState(null); // 抽選設定時刻

  // データと設定時刻の取得
  const fetchData = async () => {
    try {
      // 1. 統計データの取得
      const statsRes = await fetch('/api/lottery/stats', { cache: 'no-store' });
      const statsData = await statsRes.json();
      setStats(statsData);

      // 2. 抽選設定日時の取得 (system_settingsより)
      const settingsRes = await fetch('/api/admins/period', { cache: 'no-store' });
      const settingsData = await settingsRes.json();
      
      // lottery_announcement: "2026-01-13 12:00" のような形式を想定
      if (settingsData.lottery_announcement) {
        setLotteryTime(new Date(settingsData.lottery_announcement));
      }

      // 状態判定: すでに当選者がいればDONEにする
      const hasWinners = statsData.some(item => item.winners > 0);
      if (hasWinners) {
        setLotteryStatus('DONE');
      }

      return { statsData, hasWinners, lotteryTime: new Date(settingsData.lottery_announcement) };
    } catch (err) {
      console.error(err);
      alert('データの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      const data = await fetchData();
      
      // ★自動抽選ロジック
      // 「未実施」かつ「現在時刻が抽選設定時刻を過ぎている」場合
      if (!data.hasWinners && data.lotteryTime && new Date() >= data.lotteryTime) {
        console.log("抽選時刻を過ぎたため、自動抽選を開始します...");
        autoRunLottery();
      }
    };
    init();
  }, []);

  // 自動抽選用の関数 (ポップアップを出さずに実行)
  const autoRunLottery = async () => {
    setProcessing(true);
    try {
      const res = await fetch('/api/lottery/run', { method: 'POST' });
      if (res.ok) {
        setLotteryStatus('DONE');
        await fetchData(); // 最新状態に更新
      }
    } catch (err) {
      console.error("自動抽選エラー:", err);
    } finally {
      setProcessing(false);
    }
  };

  // 手動抽選（予備：時刻前だがどうしても実行したい場合など）
  const handleRunLottery = async () => {
    if (!confirm("抽選予定日前に抽選を行いますか？")) return;
    setProcessing(true);
    try {
      const res = await fetch('/api/lottery/run', { method: 'POST' });
      if (res.ok) {
        alert('抽選が完了しました');
        setLotteryStatus('DONE');
        await fetchData();
      }
    } catch (err) {
      alert('通信エラー');
    } finally {
      setProcessing(false);
    }
  };

  // メール送信（これは管理者が手動で押す条件のまま）
  const handleSendMail = async () => {
    if (!confirm("申込者へメールを一斉送信しますか？")) return;
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
        
        <div className="flex justify-between items-center mb-8 border-b pb-4">
          <h1 className="text-2xl font-bold text-gray-800">抽選および結果通知</h1>
          <Link href="/admin/dashboard" className="text-sm text-gray-500 hover:text-blue-600 underline">
            管理者メニューへ戻る
          </Link>
        </div>

        {/* ステータス表示 */}
        <div className="flex flex-col items-center mb-8 gap-2">
            <div className={`px-6 py-2 rounded-full font-bold text-white ${
                lotteryStatus === 'PENDING' ? 'bg-gray-400' :
                lotteryStatus === 'DONE' ? 'bg-orange-500' : 'bg-green-600'
            }`}>
                状態: {
                    lotteryStatus === 'PENDING' ? '抽選未実施' :
                    lotteryStatus === 'DONE' ? '抽選完了（メール未送信）' : '全処理完了'
                }
            </div>
            {lotteryTime && lotteryStatus === 'PENDING' && (
              <p className="text-sm text-gray-500">自動抽選予定時刻: {lotteryTime.toLocaleString()}</p>
            )}
        </div>

        {/* 登録状況テーブル */}
        <div className="overflow-x-auto mb-8 border rounded">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-sm">
              <tr>
                <th className="p-3 font-bold">授業名 / 日時</th>
                <th className="p-3 text-right">定員</th>
                <th className="p-3 text-right">申込数</th>
                <th className="p-3 text-right">当選数</th>
                <th className="p-3 text-center">判定</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stats.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50 text-sm text-gray-800">
                  <td className="p-3">
                    <div className="font-bold">{item.name}</div>
                    <div className="text-xs text-gray-500">{item.dateInfo}</div>
                  </td>
                  <td className="p-3 text-right">{item.capacity}</td>
                  <td className={`p-3 text-right font-bold ${item.count > item.capacity ? 'text-red-600' : ''}`}>{item.count}</td>
                  <td className="p-3 text-right font-bold text-blue-600">
                    {lotteryStatus === 'PENDING' ? '-' : `${item.winners}名`}
                  </td>
                  <td className="p-3 text-center">
                    {item.count > item.capacity ? 
                        <span className="text-red-600 bg-red-50 px-2 py-0.5 rounded text-xs">抽選対象</span> : 
                        <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded text-xs">全員当選</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* アクションエリア */}
        <div className="border-t pt-8 text-center">
          {processing ? (
            <p className="text-blue-600 font-bold animate-pulse">処理中...</p>
          ) : (
            <>
              {/* 時刻前だが手動でやりたい時のみ表示 */}
              {lotteryStatus === 'PENDING' && (
                <button onClick={handleRunLottery} className="bg-orange-600 text-white font-bold py-3 px-12 rounded-full shadow hover:bg-orange-500">
                  今すぐ抽選を実行する
                </button>
              )}

              {/* 抽選後：メール送信ボタン */}
              {lotteryStatus === 'DONE' && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">抽選が完了しました。結果メールを送信してください。</p>
                  <button onClick={handleSendMail} className="bg-blue-600 text-white font-bold py-3 px-12 rounded-full shadow hover:bg-blue-500">
                    結果メールを一斉送信
                  </button>
                </div>
              )}

              {lotteryStatus === 'MAILED' && (
                <p className="text-green-600 font-bold">メール送信済みです。</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}