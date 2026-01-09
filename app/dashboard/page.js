'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function UserDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // APIからデータを取得
    fetch('/api/dashboard')
      .then((res) => res.json())
      .then((data) => {
        // データは配列 [ { ... } ] で来るので、0番目を取り出します
        if (data && data.length > 0) {
          setUser(data[0]);
        }
      })
      .catch((err) => console.error("データ取得エラー:", err));
  }, []);

  // データ読み込み中は「読み込み中」と表示
  if (!user) {
    return <div style={{ padding: '20px' }}>読み込み中...</div>;
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>ダッシュボード</h1>
      <p style={styles.welcome}>ようこそ、{user.student_name} さん</p>

      {/* --- セクション1: 登録情報（縦並び） --- */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>登録情報</h2>
        <div style={styles.infoList}>
          <InfoItem label="受験番号" value={user.applicant_id} />
          <InfoItem label="ログインID" value={user.login_id} />
          <InfoItem label="生徒氏名" value={user.student_name} />
          <InfoItem label="保護者氏名" value={user.parent_name} />
          <InfoItem label="学校名" value={user.school_name} />
          <InfoItem label="学年" value={user.grade} />
          <InfoItem label="メールアドレス" value={user.email} />
          {/* パスワードは表示しません */}
        </div>
      </div>

      {/* --- セクション2: 申込情報(左) と ボタン(右) --- */}
      <div style={styles.bottomArea}>
        
        {/* 左側: 現在の申し込み情報 */}
        <div style={styles.statusBox}>
          <h3 style={styles.subTitle}>現在の申し込み状況</h3>
          <p>現在、申し込み済みの試験はありません。</p>
          {/* ↑ 後でここもデータベースから取れるようにしましょう */}
        </div>

        {/* 右側: 申し込みボタン */}
        <div style={styles.actionBox}>
          <button 
            style={styles.applyButton}
            onClick={() => router.push(`/application/new?id=${user.applicant_id}`)}
          >
            新規申し込みへ進む
          </button>
        </div>

      </div>

      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <button onClick={() => router.push('/')} style={styles.backButton}>ログアウトして戻る</button>
      </div>
    </div>
  );
}

// --- 部品コンポーネント（リストの1行分） ---
function InfoItem({ label, value }) {
  return (
    <div style={styles.row}>
      <span style={styles.label}>{label}:</span>
      <span style={styles.value}>{value}</span>
    </div>
  );
}

// --- スタイル定義 ---
const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '40px 20px',
    fontFamily: 'sans-serif',
    color: '#333',
  },
  title: {
    fontSize: '24px',
    borderBottom: '2px solid #0070f3',
    paddingBottom: '10px',
    marginBottom: '20px',
  },
  welcome: {
    fontSize: '16px',
    marginBottom: '30px',
  },
  section: {
    backgroundColor: '#f9f9f9',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '40px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  sectionTitle: {
    fontSize: '18px',
    marginTop: 0,
    marginBottom: '15px',
    color: '#555',
  },
  infoList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  row: {
    display: 'flex',
    borderBottom: '1px solid #eee',
    paddingBottom: '5px',
  },
  label: {
    fontWeight: 'bold',
    width: '150px', // ラベルの幅を固定
    color: '#666',
  },
  value: {
    flex: 1,
  },
  // 下部のレイアウト（左右配置）
  bottomArea: {
    display: 'flex',
    justifyContent: 'space-between', // 左右に離す
    alignItems: 'flex-start',
    gap: '20px',
  },
  statusBox: {
    flex: 1, // 幅を自動調整
    border: '1px solid #ddd',
    padding: '20px',
    borderRadius: '8px',
    minHeight: '100px',
  },
  subTitle: {
    fontSize: '16px',
    marginTop: 0,
    marginBottom: '10px',
    fontWeight: 'bold',
  },
  actionBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100px',
  },
  applyButton: {
    backgroundColor: '#0070f3',
    color: 'white',
    border: 'none',
    padding: '15px 30px',
    fontSize: '16px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  backButton: {
    background: 'none',
    border: 'none',
    color: '#666',
    textDecoration: 'underline',
    cursor: 'pointer',
  }
};