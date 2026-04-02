import { useState, useEffect, useCallback, useRef } from 'react';
import { Zap, Clock, User, ChevronLeft, ChevronRight, Send, Tag } from 'lucide-react';
import questions from '../data/questions';
import AntiCheatBlocker from './AntiCheatBlocker';
import QuestionNavigator from './QuestionNavigator';
import Watermark from './Watermark';
import { saveSession, clearSession } from '../utils/sessionManager';
const EXAM_DURATION = 30 * 60; 
export default function ExamScreen({ studentData, onFinish, resumeData }) {
  const [currentIndex, setCurrentIndex] = useState(resumeData?.currentIndex ?? 0);
  const [answers, setAnswers] = useState(resumeData?.answers ?? {});
  const [timeLeft, setTimeLeft] = useState(resumeData?.timeLeft ?? EXAM_DURATION);
  const [violations, setViolations] = useState(resumeData?.violations ?? 0);
  const [showWarning, setShowWarning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const timerRef = useRef(null);
  const violationsRef = useRef(violations);
  useEffect(() => {
    violationsRef.current = violations;
  }, [violations]);
  useEffect(() => {
    saveSession({
      studentData,
      answers,
      currentIndex,
      timeLeft,
      violations,
    });
  }, [studentData, answers, currentIndex, timeLeft, violations]);
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);
  const enterFullscreen = useCallback(() => {
    const el = document.documentElement;
    const rfs = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen;
    if (rfs) {
      rfs.call(el).then(() => setIsFullscreen(true)).catch(() => {});
    }
  }, []);
  useEffect(() => {
    enterFullscreen();
  }, [enterFullscreen]);
  useEffect(() => {
    const handler = () => {
      const isFull = !!document.fullscreenElement;
      setIsFullscreen(isFull);
      if (!isFull) {
        handleViolation();
      }
    };
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);
  const handleViolation = useCallback(() => {
    setViolations((prev) => {
      const next = prev + 1;
      setShowWarning(true);
      return next;
    });
  }, []);
  const acknowledgeWarning = () => {
    setShowWarning(false);
    if (!document.fullscreenElement) {
      enterFullscreen();
    }
  };
  const selectAnswer = (optionIndex) => {
    setAnswers((prev) => ({ ...prev, [questions[currentIndex].id]: optionIndex }));
  };
  const goTo = (index) => setCurrentIndex(index);
  const goPrev = () => setCurrentIndex((p) => Math.max(0, p - 1));
  const goNext = () => setCurrentIndex((p) => Math.min(questions.length - 1, p + 1));
  const handleSubmit = () => {
    clearInterval(timerRef.current);
    clearSession();
    let correct = 0;
    let wrong = 0;
    let skipped = 0;
    questions.forEach((q) => {
      const selected = answers[q.id];
      if (selected === undefined) {
        skipped++;
      } else if (selected === q.correctAnswer) {
        correct++;
      } else {
        wrong++;
      }
    });
    onFinish({
      studentData,
      total: questions.length,
      correct,
      wrong,
      skipped,
      violations: violationsRef.current,
      timeTaken: EXAM_DURATION - timeLeft,
    });
  };
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };
  const timerClass = timeLeft <= 60 ? 'danger' : timeLeft <= 300 ? 'warning' : '';
  const currentQ = questions[currentIndex];
  const selectedAnswer = answers[currentQ.id];
  const answeredCount = Object.keys(answers).length;
  const progress = ((currentIndex + 1) / questions.length) * 100;
  return (
    <AntiCheatBlocker onViolation={handleViolation}>
      <Watermark studentName={studentData.name} />
      {}
      {!isFullscreen && !showWarning && (
        <div className="fullscreen-prompt">
          <div className="glass-card prompt-card">
            <MonitorIcon />
            <h2>Fullscreen Required</h2>
            <p>This assessment must run in fullscreen mode. Please click below to re-enter fullscreen and continue.</p>
            <button className="btn-primary" onClick={enterFullscreen}>
              Enter Fullscreen
            </button>
          </div>
        </div>
      )}
      {}
      {showWarning && (
        <CheatWarningModal
          violations={violations}
          onAcknowledge={acknowledgeWarning}
        />
      )}
      <div className="exam-layout">
        {}
        <div className="exam-header">
          <div className="header-left">
            <div className="header-logo" style={{ background: 'transparent' }}>
              <img src="/logo2.jpg" alt="NITS" className="brand-image-small" />
            </div>
            <span className="header-title">NITS Assessment</span>
          </div>
          <div className="header-center">
            <div className="user-badge">
              <User size={14} />
              {studentData.name}
            </div>
          </div>
          <div className={`timer-display ${timerClass}`}>
            <Clock size={18} />
            <span className="time-text">{formatTime(timeLeft)}</span>
          </div>
        </div>
        {}
        <div className="progress-bar-container">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
        </div>
        {}
        <div className="question-area">
          <span className="question-category"><Tag size={12} /> {currentQ.category}</span>
          <span className="question-number">Question {currentIndex + 1} of {questions.length}</span>
          <h2 className="question-text">{currentQ.question}</h2>
          <div className="options-grid">
            {currentQ.options.map((opt, i) => (
              <div
                key={i}
                className={`option-card ${selectedAnswer === i ? 'selected' : ''}`}
                onClick={() => selectAnswer(i)}
              >
                <span className="option-letter">{'ABCD'[i]}</span>
                <span className="option-text">{opt}</span>
              </div>
            ))}
          </div>
          <div className="question-nav-buttons">
            <button className="btn-nav" onClick={goPrev} disabled={currentIndex === 0}>
              <ChevronLeft size={16} /> Previous
            </button>
            {currentIndex === questions.length - 1 ? (
              <button className="btn-nav submit" onClick={handleSubmit}>
                <Send size={16} /> Submit Test
              </button>
            ) : (
              <button className="btn-nav" onClick={goNext}>
                Next <ChevronRight size={16} />
              </button>
            )}
          </div>
        </div>
        {}
        <QuestionNavigator
          questions={questions}
          answers={answers}
          currentIndex={currentIndex}
          onNavigate={goTo}
          answeredCount={answeredCount}
        />
      </div>
    </AntiCheatBlocker>
  );
}
function MonitorIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent-warning)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}
function CheatWarningModal({ violations, onAcknowledge }) {
  return (
    <div className="cheat-modal-overlay">
      <div className="glass-card cheat-modal">
        <div className="warning-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>
        <h2>⚠️ Violation Detected!</h2>
        <p>An attempt to leave the exam environment was detected. This has been logged and reported.</p>
        <div className="violation-count">{violations}</div>
        <p className="max-warning">
          Total violation{violations > 1 ? 's' : ''} recorded. All violations are reported to the administrator.
        </p>
        <button className="btn-acknowledge" onClick={onAcknowledge}>
          I Understand — Continue
        </button>
      </div>
    </div>
  );
}
