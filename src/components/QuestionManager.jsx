import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Upload, FileText, CheckCircle, XCircle, Edit3, Trash2,
  Download, Eye, ChevronDown, ChevronUp, AlertTriangle,
  Clock, Hash, Shuffle, Save, X, RefreshCw, FileQuestion
} from 'lucide-react';
import {
  uploadQuestionFile, publishQuestions,
  fetchQuestionHistory, deleteQuestionSet
} from '../utils/api';

// ─── Template content for download ───
const TEMPLATE_CONTENT = `EXAM TITLE: Sample Aptitude Test
CATEGORY: General

1. What is the capital of France?
A) London
B) Berlin
C) Paris
D) Madrid
Answer: C

2. The earth revolves around the sun.
A) True
B) False
Answer: A

3. A train running at 60 km/hr crosses a pole in 9 seconds. What is the length of the train?
A) 120 meters
B) 150 meters
C) 180 meters
D) 200 meters
Answer: B

4. Explain the process of photosynthesis in detail.

5. Choose the antonym of 'Benevolent'.
A) Kind
B) Malevolent
C) Generous
D) Charitable
Answer: B
`;

export default function QuestionManager({ token }) {
  // ─── State ───
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [parsedData, setParsedData] = useState(null);  // { examTitle, questions, errors, sourceFileName }
  const [editingIndex, setEditingIndex] = useState(null);
  const [examTitle, setExamTitle] = useState('');
  const [randomizeQuestions, setRandomizeQuestions] = useState(false);
  const [randomizeOptions, setRandomizeOptions] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishMessage, setPublishMessage] = useState('');
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [expandedQuestion, setExpandedQuestion] = useState(null);

  const fileInputRef = useRef(null);

  // ─── Load history on mount ───
  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const data = await fetchQuestionHistory(token);
      setHistory(data);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setHistoryLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // ─── File upload handler ───
  const handleFile = useCallback(async (file) => {
    if (!file) return;

    const allowed = ['.txt'];
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowed.includes(ext)) {
      setUploadError('Only TXT files are supported.');
      return;
    }

    setUploading(true);
    setUploadError('');
    setParsedData(null);
    setPublishMessage('');

    try {
      const data = await uploadQuestionFile(file, token);
      setParsedData(data);
      setExamTitle(data.examTitle || file.name.replace(/\.[^.]+$/, ''));
      setEditingIndex(null);
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
    }
  }, [token]);

  // ─── Drag and drop handlers ───
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  }, [handleFile]);

  const handleFileInput = useCallback((e) => {
    const file = e.target.files?.[0];
    handleFile(file);
    e.target.value = '';
  }, [handleFile]);

  // ─── Publish handler ───
  const handlePublish = useCallback(async () => {
    if (!parsedData || parsedData.questions.length === 0) return;

    setPublishing(true);
    setPublishMessage('');

    try {
      const result = await publishQuestions({
        examTitle,
        questions: parsedData.questions,
        sourceFileName: parsedData.sourceFileName,
        randomizeQuestions,
        randomizeOptions,
      }, token);

      setPublishMessage(result.message);
      loadHistory();
    } catch (err) {
      setPublishMessage(`Error: ${err.message}`);
    } finally {
      setPublishing(false);
    }
  }, [parsedData, examTitle, randomizeQuestions, randomizeOptions, token, loadHistory]);

  // ─── Edit question inline ───
  const updateQuestion = (index, field, value) => {
    if (!parsedData) return;
    const updated = { ...parsedData };
    updated.questions = [...updated.questions];
    updated.questions[index] = { ...updated.questions[index], [field]: value };
    setParsedData(updated);
  };

  const updateOption = (qIndex, optIndex, value) => {
    if (!parsedData) return;
    const updated = { ...parsedData };
    updated.questions = [...updated.questions];
    const q = { ...updated.questions[qIndex] };
    q.options = [...q.options];
    q.options[optIndex] = value;
    updated.questions[qIndex] = q;
    setParsedData(updated);
  };

  const removeQuestion = (index) => {
    if (!parsedData) return;
    const updated = { ...parsedData };
    updated.questions = updated.questions.filter((_, i) => i !== index);
    // Re-number the IDs
    updated.questions = updated.questions.map((q, i) => ({ ...q, id: i + 1 }));
    updated.questionCount = updated.questions.length;
    setParsedData(updated);
    setEditingIndex(null);
  };

  // ─── Delete from history ───
  const handleDeleteSet = async (id) => {
    try {
      await deleteQuestionSet(id, token);
      loadHistory();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  // ─── Download template ───
  const handleDownloadTemplate = () => {
    const blob = new Blob([TEMPLATE_CONTENT], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'question_template.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  // ─── Type badge color ───
  const typeBadgeClass = (type) => {
    switch (type) {
      case 'mcq': return 'badge-mcq';
      case 'true_false': return 'badge-tf';
      case 'subjective': return 'badge-subj';
      default: return '';
    }
  };

  const typeLabel = (type) => {
    switch (type) {
      case 'mcq': return 'MCQ';
      case 'true_false': return 'True/False';
      case 'subjective': return 'Subjective';
      default: return type;
    }
  };

  return (
    <div className="question-manager">
      {/* ─── Upload Zone ─── */}
      <div className="qm-top-bar">
        <div className="qm-top-left">
          <h3 className="qm-section-title">
            <FileQuestion size={20} /> Question Manager
          </h3>
        </div>
        <div className="qm-top-right">
          <button className="btn-qm template" onClick={handleDownloadTemplate}>
            <Download size={14} /> Template
          </button>
          <button
            className={`btn-qm history ${showHistory ? 'active' : ''}`}
            onClick={() => setShowHistory(!showHistory)}
          >
            <Clock size={14} /> History
          </button>
        </div>
      </div>

      {/* ─── History Panel ─── */}
      {showHistory && (
        <div className="qm-history-panel glass-card">
          <div className="qm-history-header">
            <h4>Upload History</h4>
            <button className="btn-qm-icon" onClick={loadHistory}>
              <RefreshCw size={14} className={historyLoading ? 'spin' : ''} />
            </button>
          </div>
          {history.length === 0 ? (
            <p className="qm-history-empty">No uploads yet</p>
          ) : (
            <div className="qm-history-list">
              {history.map((h) => (
                <div key={h._id} className={`qm-history-item ${h.isPublished ? 'published' : ''}`}>
                  <div className="qm-history-info">
                    <span className="qm-history-title">{h.examTitle}</span>
                    <span className="qm-history-meta">
                      v{h.version} · {h.questionCount || '?'} Q · {new Date(h.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="qm-history-actions">
                    {h.isPublished && (
                      <span className="qm-badge-live">LIVE</span>
                    )}
                    <button
                      className="btn-qm-icon danger"
                      onClick={() => handleDeleteSet(h._id)}
                      title="Delete"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── Drop Zone ─── */}
      <div
        className={`qm-upload-zone ${dragActive ? 'drag-active' : ''} ${uploading ? 'uploading' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt"
          onChange={handleFileInput}
          style={{ display: 'none' }}
        />
        {uploading ? (
          <div className="qm-upload-loading">
            <RefreshCw size={32} className="spin" />
            <p>Parsing document...</p>
          </div>
        ) : (
          <>
            <Upload size={36} />
            <p className="qm-upload-text">
              Drag & drop your question file here, or <span className="qm-upload-link">browse</span>
            </p>
            <p className="qm-upload-hint">Supports TXT · Max 10MB</p>
          </>
        )}
      </div>

      {/* ─── Upload Error ─── */}
      {uploadError && (
        <div className="qm-error-banner">
          <AlertTriangle size={16} /> {uploadError}
        </div>
      )}

      {/* ─── Parsed Preview ─── */}
      {parsedData && (
        <div className="qm-preview-section">
          {/* Header */}
          <div className="qm-preview-header">
            <div className="qm-preview-header-left">
              <div className="qm-title-edit">
                <label>Exam Title</label>
                <input
                  type="text"
                  value={examTitle}
                  onChange={(e) => setExamTitle(e.target.value)}
                  className="qm-title-input"
                  placeholder="Enter exam title..."
                />
              </div>
              <div className="qm-preview-stats">
                <span className="qm-stat">
                  <Hash size={14} /> {parsedData.questions.length} Questions
                </span>
                <span className="qm-stat">
                  <FileText size={14} /> {parsedData.sourceFileName}
                </span>
              </div>
            </div>
          </div>

          {/* Parsing Errors */}
          {parsedData.errors?.length > 0 && (
            <div className="qm-warnings">
              <h4><AlertTriangle size={14} /> Parsing Notes</h4>
              {parsedData.errors.map((err, i) => (
                <p key={i}>{err}</p>
              ))}
            </div>
          )}

          {/* Question Cards */}
          <div className="qm-questions-list">
            {parsedData.questions.map((q, idx) => (
              <div
                key={idx}
                className={`qm-question-card glass-card ${editingIndex === idx ? 'editing' : ''}`}
              >
                {/* Card Header */}
                <div
                  className="qm-q-header"
                  onClick={() => setExpandedQuestion(expandedQuestion === idx ? null : idx)}
                >
                  <div className="qm-q-header-left">
                    <span className="qm-q-number">Q{q.id}</span>
                    <span className={`qm-q-type-badge ${typeBadgeClass(q.type)}`}>
                      {typeLabel(q.type)}
                    </span>
                    <span className="qm-q-category">{q.category}</span>
                  </div>
                  <div className="qm-q-header-right">
                    {q.correctAnswer >= 0 ? (
                      <CheckCircle size={16} className="qm-icon-ok" />
                    ) : (
                      <XCircle size={16} className="qm-icon-warn" />
                    )}
                    <button
                      className="btn-qm-icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingIndex(editingIndex === idx ? null : idx);
                        setExpandedQuestion(idx);
                      }}
                      title="Edit"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      className="btn-qm-icon danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeQuestion(idx);
                      }}
                      title="Remove"
                    >
                      <Trash2 size={13} />
                    </button>
                    {expandedQuestion === idx ?
                      <ChevronUp size={16} /> :
                      <ChevronDown size={16} />
                    }
                  </div>
                </div>

                {/* Card Body */}
                {(expandedQuestion === idx || editingIndex === idx) && (
                  <div className="qm-q-body">
                    {/* Question Text */}
                    {editingIndex === idx ? (
                      <textarea
                        className="qm-edit-textarea"
                        value={q.question}
                        onChange={(e) => updateQuestion(idx, 'question', e.target.value)}
                        rows={2}
                      />
                    ) : (
                      <p className="qm-q-text">{q.question}</p>
                    )}

                    {/* Options */}
                    {q.options && q.options.length > 0 && (
                      <div className="qm-options-list">
                        {q.options.map((opt, oi) => (
                          <div
                            key={oi}
                            className={`qm-option ${q.correctAnswer === oi ? 'correct' : ''}`}
                          >
                            <span className="qm-option-letter">{'ABCD'[oi]}</span>
                            {editingIndex === idx ? (
                              <input
                                type="text"
                                value={opt}
                                onChange={(e) => updateOption(idx, oi, e.target.value)}
                                className="qm-edit-option-input"
                              />
                            ) : (
                              <span className="qm-option-text">{opt}</span>
                            )}
                            {editingIndex === idx && (
                              <button
                                className={`btn-qm-mark ${q.correctAnswer === oi ? 'active' : ''}`}
                                onClick={() => updateQuestion(idx, 'correctAnswer', oi)}
                                title="Mark as correct"
                              >
                                <CheckCircle size={14} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Edit controls */}
                    {editingIndex === idx && (
                      <div className="qm-edit-controls">
                        <div className="qm-edit-row">
                          <label>Category:</label>
                          <input
                            type="text"
                            value={q.category}
                            onChange={(e) => updateQuestion(idx, 'category', e.target.value)}
                            className="qm-edit-category-input"
                          />
                        </div>
                        <div className="qm-edit-row">
                          <label>Type:</label>
                          <select
                            value={q.type}
                            onChange={(e) => updateQuestion(idx, 'type', e.target.value)}
                            className="qm-edit-select"
                          >
                            <option value="mcq">MCQ</option>
                            <option value="true_false">True/False</option>
                            <option value="subjective">Subjective</option>
                          </select>
                        </div>
                        <button
                          className="btn-qm save"
                          onClick={() => setEditingIndex(null)}
                        >
                          <Save size={14} /> Done
                        </button>
                      </div>
                    )}

                    {/* No answer warning */}
                    {q.correctAnswer < 0 && q.type !== 'subjective' && (
                      <div className="qm-no-answer-warning">
                        <AlertTriangle size={13} />
                        No correct answer detected — click <Edit3 size={12} /> to set one
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* ─── Publish Bar ─── */}
          <div className="qm-publish-bar glass-card">
            <div className="qm-publish-options">
              <label className="qm-toggle-label">
                <input
                  type="checkbox"
                  checked={randomizeQuestions}
                  onChange={(e) => setRandomizeQuestions(e.target.checked)}
                />
                <Shuffle size={14} /> Shuffle Questions
              </label>
              <label className="qm-toggle-label">
                <input
                  type="checkbox"
                  checked={randomizeOptions}
                  onChange={(e) => setRandomizeOptions(e.target.checked)}
                />
                <Shuffle size={14} /> Shuffle Options
              </label>
            </div>
            <div className="qm-publish-actions">
              {publishMessage && (
                <span className={`qm-publish-msg ${publishMessage.startsWith('Error') ? 'error' : 'success'}`}>
                  {publishMessage}
                </span>
              )}
              <button
                className="btn-qm discard"
                onClick={() => {
                  setParsedData(null);
                  setUploadError('');
                  setPublishMessage('');
                  setExamTitle('');
                }}
              >
                <X size={14} /> Discard
              </button>
              <button
                className="btn-qm publish"
                onClick={handlePublish}
                disabled={publishing || parsedData.questions.length === 0 || !examTitle.trim()}
              >
                {publishing ? (
                  <><RefreshCw size={14} className="spin" /> Publishing...</>
                ) : (
                  <><CheckCircle size={14} /> Publish Exam</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
