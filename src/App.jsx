import { useState, useEffect, useCallback } from 'react';
import IntroScreen from './components/IntroScreen';
import ExamScreen from './components/ExamScreen';
import ResultScreen from './components/ResultScreen';
import AdminPanel from './components/AdminPanel';
import AdminLogin from './components/AdminLogin';
import { loadSession, clearSession, saveResult } from './utils/sessionManager';
import { submitResult } from './utils/api';

function App() {
  const [screen, setScreen] = useState('intro');
  const [studentData, setStudentData] = useState(null);
  const [examResult, setExamResult] = useState(null);
  const [resumeData, setResumeData] = useState(null);
  const [adminToken, setAdminToken] = useState(null);

  useEffect(() => {
    const saved = loadSession();
    if (saved && saved.studentData && saved.answers) {
      setResumeData(saved);
      setStudentData(saved.studentData);
      setScreen('resume');
    }
  }, []);

  const handleStartExam = useCallback((data) => {
    setStudentData(data);
    setResumeData(null);
    setScreen('exam');
  }, []);

  const handleResumeExam = useCallback(() => {
    setScreen('exam');
  }, []);

  const handleDiscardSession = useCallback(() => {
    clearSession();
    setResumeData(null);
    setStudentData(null);
    setScreen('intro');
  }, []);

  const handleExamFinish = useCallback((result) => {
    setExamResult(result);
    saveResult(result);
    submitResult({
      studentData: result.studentData,
      total: result.total,
      correct: result.correct,
      wrong: result.wrong,
      skipped: result.skipped,
      violations: result.violations,
      timeTaken: result.timeTaken,
      submittedAt: new Date().toISOString(),
    });
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    setScreen('result');
  }, []);

  const handleAdminLoginSuccess = useCallback((token) => {
    setAdminToken(token);
    setScreen('admin');
  }, []);

  return (
    <>
      <div className="bg-mesh" />

      {screen === 'intro' && (
        <IntroScreen
          onStart={handleStartExam}
          onAdminClick={() => setScreen('adminLogin')}
        />
      )}

      {screen === 'resume' && resumeData && (
        <ResumePrompt
          studentData={resumeData.studentData}
          onResume={handleResumeExam}
          onDiscard={handleDiscardSession}
        />
      )}

      {screen === 'exam' && studentData && (
        <ExamScreen
          studentData={studentData}
          onFinish={handleExamFinish}
          resumeData={resumeData}
        />
      )}

      {screen === 'result' && examResult && (
        <ResultScreen result={examResult} studentName={studentData?.name || ''} />
      )}

      {screen === 'adminLogin' && (
        <AdminLogin
          onSuccess={handleAdminLoginSuccess}
          onClose={() => setScreen('intro')}
        />
      )}

      {screen === 'admin' && adminToken && (
        <AdminPanel
          token={adminToken}
          onBack={() => {
            sessionStorage.removeItem('admin_token');
            setAdminToken(null);
            setScreen('intro');
          }}
        />
      )}
    </>
  );
}

function ResumePrompt({ studentData, onResume, onDiscard }) {
  return (
    <div className="intro-screen">
      <div className="glass-card intro-card resume-card">
        <div className="resume-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent-warning)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
          </svg>
        </div>
        <h2>Resume Previous Session?</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.7', marginBottom: '8px' }}>
          A previous exam session was found for:
        </p>
        <div className="resume-student-info">
          <strong>{studentData.name}</strong>
          <span>{studentData.email}</span>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '28px' }}>
          Would you like to continue from where you left off?
        </p>
        <div className="resume-buttons">
          <button className="btn-primary" onClick={onResume}>
            Resume Exam
          </button>
          <button className="btn-discard" onClick={onDiscard}>
            Start Fresh
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
