'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// 授業データのダミー（実際はDBから取ることもできますが、今は固定で書きます）
const CLASSES = [
  {
    id: 1,
    name: 'AIプログラミング体験',
    description: 'Pythonを使って簡単な人工知能を作り、画像認識の仕組みを学びます。初心者でも安心の内容です。',
    pdfLink: '/files/ai_syllabus.pdf', // 実際のファイルがなければダミー
    times: ['10:00 - 11:30', '13:00 - 14:30', '15:00 - 16:30']
  },
  {
    id: 2,
    name: 'IoTロボット制御',
    description: 'M5Stackを使ってセンサーの値を読み取り、モーターを動かす制御プログラミングを体験します。',
    pdfLink: '/files/robot_syllabus.pdf',
    times: ['10:00 - 11:30', '14:00 - 15:30']
  },
  {
    id: 3,
    name: '3D CADデザイン入門',
    description: 'Fusion360を使ってオリジナルのキーホルダーを設計します。3Dプリンタの実演もあります。',
    pdfLink: '/files/cad_syllabus.pdf',
    times: ['13:00 - 14:30']
  }
];

export default function SelectClassPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const applicantId = searchParams.get('id'); // URLからIDを取得

  const [selectedClass, setSelectedClass] = useState(CLASSES[0]); // 初期選択は最初の授業
  const [selectedTime, setSelectedTime] = useState(''); 
  const [loading, setLoading] = useState(false);

  // 最終申し込み処理
  const handleComplete = async () => {
    if (!selectedTime) {
      alert("希望の時間を選択してください");
      return;
    }
    setLoading(true);

    // ★ここでさきほど作ったアプリケーション情報に追加データを送ります
    // （簡易的に新規作成APIを使い回すか、更新用APIを作る必要がありますが、
    //  ここでは「前の画面のデータ＋今回のデータ」をまとめて送る想定にします）
    
    const res = await fetch('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        applicant_id: applicantId,
        exam_name: "オープンキャンパス", // 固定
        // 以下を追加で保存するようにAPI側も少し修正が必要ですが、まずはUIを確認
        class_name: selectedClass.name,
        class_time: selectedTime
      }),
    });

    if (res.ok) {
      alert('授業の予約が完了しました！');
      router.push('/dashboard');
    } else {
      alert('エラーが発生しました');
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>受講したい授業を選択してください</h1>
      <p>ID: {applicantId}</p>

      <div style={styles.layout}>
        
        {/* --- 左側：授業ボタン一覧 --- */}
        <div style={styles.leftPanel}>
          <h3 style={styles.subTitle}>授業リスト</h3>
          <div style={styles.buttonList}>
            {CLASSES.map((cls) => (
              <button
                key={cls.id}
                onClick={() => {
                  setSelectedClass(cls);
                  setSelectedTime(''); // 授業を変えたら時間はリセット
                }}
                style={{
                  ...styles.classButton,
                  backgroundColor: selectedClass.id === cls.id ? '#0070f3' : '#fff',
                  color: selectedClass.id === cls.id ? '#fff' : '#333',
                }}
              >
                {cls.name}
              </button>
            ))}
          </div>
        </div>

        {/* --- 右側：詳細と時間選択 --- */}
        <div style={styles.rightPanel}>
          <h2 style={styles.detailTitle}>{selectedClass.name}</h2>
          
          <div style={styles.descriptionBox}>
            <p>{selectedClass.description}</p>
            <div style={styles.pdfArea}>
              <span>📄 授業詳細PDF: </span>
              <a href={selectedClass.pdfLink} target="_blank" style={styles.link}>
                ダウンロードする
              </a>
            </div>
          </div>

          <h3 style={styles.subTitle}>希望時間を選択</h3>
          <div style={styles.timeList}>
            {selectedClass.times.map((time) => (
              <label key={time} style={styles.radioLabel}>
                <input
                  type="radio"
                  name="timeSlot"
                  value={time}
                  checked={selectedTime === time}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  style={{ marginRight: '8px' }}
                />
                {time}
              </label>
            ))}
          </div>

          <div style={styles.actionArea}>
            <button 
              onClick={handleComplete} 
              style={styles.completeButton}
              disabled={loading}
            >
              {loading ? '処理中...' : 'この内容で予約する'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1000px',
    margin: '40px auto',
    padding: '20px',
    fontFamily: 'sans-serif',
  },
  title: {
    textAlign: 'center',
    marginBottom: '30px',
  },
  layout: {
    display: 'flex',
    gap: '40px',
    minHeight: '400px',
  },
  // 左パネル
  leftPanel: {
    flex: 1,
    borderRight: '1px solid #ddd',
    paddingRight: '20px',
  },
  buttonList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  classButton: {
    padding: '15px',
    textAlign: 'left',
    border: '1px solid #ccc',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    transition: '0.2s',
  },
  // 右パネル
  rightPanel: {
    flex: 2,
  },
  detailTitle: {
    marginTop: 0,
    fontSize: '24px',
    borderBottom: '2px solid #0070f3',
    paddingBottom: '10px',
    marginBottom: '20px',
  },
  subTitle: {
    marginTop: '20px',
    color: '#555',
  },
  descriptionBox: {
    backgroundColor: '#f9f9f9',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '20px',
  },
  pdfArea: {
    marginTop: '15px',
    fontWeight: 'bold',
  },
  link: {
    color: '#0070f3',
    textDecoration: 'underline',
  },
  timeList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '30px',
  },
  radioLabel: {
    padding: '10px',
    border: '1px solid #eee',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '18px',
  },
  actionArea: {
    textAlign: 'right',
  },
  completeButton: {
    backgroundColor: '#ff4d4f', // 決定ボタンを目立たせる色
    color: 'white',
    padding: '15px 40px',
    fontSize: '18px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold',
  }
};