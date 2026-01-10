'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SelectClassPage() {
  const router = useRouter();
  
  // ★変更点1: 初期値はnullにしておく
  const [applicantId, setApplicantId] = useState(null); 

  const [classes, setClasses] = useState([]); 
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ★変更点2: 画面が開いたときにログインチェックをする
  useEffect(() => {
    // ログイン情報をブラウザから取り出す
    const storedUser = localStorage.getItem('currentUser');
    
    if (!storedUser) {
      // ログインしていなければログイン画面へ飛ばす
      alert("ログインしてください");
      router.push('/auth/login');
      return;
    }

    // ログイン情報があればIDをセットする
    const user = JSON.parse(storedUser);
    setApplicantId(user.applicant_id);

    // ついでに授業データも取得
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

  // ... (handleClassChange はそのまま) ...
  const handleClassChange = (e) => {
    const classId = e.target.value; 
    const newClass = classes.find((c) => c.id == classId);
    setSelectedClass(newClass);
    setSelectedSessionId('');
  };

  const handleComplete = async () => {
    // ★変更点3: applicantId がない場合のエラーチェックを追加
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
          applicant_id: applicantId, // ★ここで本物のIDが送信されます
          class_id: selectedClass.id,
          session_id: selectedSessionId
        }),
      });

      if (res.ok) {
        alert("申し込みが完了しました！");
        router.push('/dashboard'); 
      } else {
        const errorData = await res.json();
        // ★重要: すでに申し込み済みのエラーメッセージなどを表示
        alert(errorData.message || "申し込みに失敗しました");
      }
    } catch (error) {
      console.error(error);
      alert("通信エラーが発生しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ... (以下、returnの中身やstylesは変更なしでOK) ...
  // ここから下は以前のコードのままで大丈夫ですが、
  // 全体が必要であればおっしゃってください。
  if (isLoading) return <div style={{padding: 20}}>読み込み中...</div>;
  if (classes.length === 0) return <div style={{padding: 20}}>現在申し込み可能な授業はありません。</div>;

  return (
    <div style={styles.container}>
      <button onClick={() => router.back()} style={styles.backButton}>← 戻る</button>
      <h2 style={styles.title}>受講したい授業を選択</h2>
      
      {/* ログイン中のユーザーIDを表示してあげる（デバッグ用にも便利） */}
      <p style={{textAlign:'center', fontSize:'12px', color:'#999', marginBottom:'10px'}}>
        ログインID: {applicantId}
      </p>

      {/* ... (以下のJSXは以前と同じ) ... */}
      
      <div style={styles.formGroup}>
        <label style={styles.label}>イベント（授業内容）</label>
        <select style={styles.select} value={selectedClass ? selectedClass.id : ''} onChange={handleClassChange}>
          {classes.map((cls) => (
            <option key={cls.id} value={cls.id}>{cls.name}</option>
          ))}
        </select>
        <p style={styles.description}>{selectedClass ? selectedClass.description : ''}</p>
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>希望の時間</label>
        <select style={styles.select} value={selectedSessionId} onChange={(e) => setSelectedSessionId(e.target.value)}>
          <option value="">-- 時間を選択してください --</option>
          {selectedClass && selectedClass.sessions && selectedClass.sessions.map((sess) => (
            <option key={sess.id} value={sess.id}>{sess.label}</option>
          ))}
        </select>
      </div>

      {selectedClass && (
        <div style={styles.linkContainer}>
           {selectedClass.pdfLink && selectedClass.pdfLink !== '#' ? (
            <a href={selectedClass.pdfLink} target="_blank" rel="noopener noreferrer" style={styles.pdfLink}>
                📄 授業情報PDFをダウンロード
            </a>
           ) : (
            <span style={{color: '#999', fontSize: '14px'}}>※ PDF資料はありません</span>
           )}
        </div>
      )}

      <div style={styles.buttonContainer}>
        <button style={styles.button} onClick={handleComplete} disabled={isSubmitting}>
          {isSubmitting ? '送信中...' : '申し込む'}
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: '500px', margin: '40px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', fontFamily: 'sans-serif', backgroundColor: '#fff' },
  backButton: { background: 'transparent', border: 'none', color: '#666', fontSize: '14px', cursor: 'pointer', marginBottom: '10px', padding: '0', display: 'flex', alignItems: 'center' },
  title: { textAlign: 'center', marginBottom: '20px', marginTop: '0' },
  formGroup: { marginBottom: '20px' },
  label: { display: 'block', fontWeight: 'bold', marginBottom: '8px' },
  select: { width: '100%', padding: '10px', fontSize: '16px', borderRadius: '4px', border: '1px solid #ccc' },
  description: { marginTop: '8px', fontSize: '14px', color: '#666', lineHeight: '1.5' },
  linkContainer: { marginBottom: '30px', textAlign: 'right' },
  pdfLink: { color: '#0070f3', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold', borderBottom: '1px solid #0070f3' },
  buttonContainer: { textAlign: 'center' },
  button: { padding: '12px 40px', fontSize: '16px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', opacity: 1 }
};