import { useState, useEffect, useRef, useCallback } from 'react';
import { Download, Trash2, ArrowLeft, Users, FileSpreadsheet, BarChart3, LogOut, RefreshCw, FileQuestion } from 'lucide-react';
import QuestionManager from './QuestionManager';
import { fetchResults, deleteAllResults } from '../utils/api';
import * as XLSX from 'xlsx';
export default function AdminPanel({ token, onBack }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState('analytics'); 
  const loadResults = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchResults(token);
      setResults(data);
    } catch (err) {
      setError(err.message || 'Failed to load results');
    } finally {
      setLoading(false);
    }
  }, [token]);
  useEffect(() => {
    loadResults();
  }, [loadResults]);
  const handleDownloadExcel = () => {
    if (results.length === 0) return;
    const rows = results.map((r, i) => ({
      'S.No': i + 1,
      'Student Name': r.studentData?.name || '—',
      'Email': r.studentData?.email || '—',
      'Contact': r.studentData?.contact || '—',
      'Total Questions': r.total,
      'Correct': r.correct,
      'Wrong': r.wrong,
      'Skipped': r.skipped,
      'Score %': r.total ? Math.round((r.correct / r.total) * 100) : 0,
      'Violations': r.violations,
      'Time Taken': formatTimeTaken(r.timeTaken),
      'Submitted At': r.submittedAt ? new Date(r.submittedAt).toLocaleString() : '—',
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [
      { wch: 5 }, { wch: 22 }, { wch: 28 }, { wch: 15 },
      { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 },
      { wch: 9 }, { wch: 10 }, { wch: 12 }, { wch: 22 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Exam Results');
    XLSX.writeFile(wb, `NITS_Results_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };
  const handleClearAll = async () => {
    try {
      await deleteAllResults(token);
      setResults([]);
      setShowConfirm(false);
    } catch (err) {
      setError(err.message);
    }
  };
  const analytics = computeAnalytics(results);
  return (
    <div className="admin-panel">
      <div className="admin-header">
        <div className="admin-header-left">
          <button className="btn-back" onClick={onBack} title="Logout">
            <LogOut size={18} />
          </button>
          <div className="header-logo" style={{ background: 'transparent', cursor: 'pointer' }} onClick={() => setActiveTab('analytics')} title="Go to Dashboard">
            <img src="/logo2.jpg" alt="NITS" className="brand-image-small" />
          </div>
          <span className="header-title" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('analytics')}>Admin Dashboard</span>
        </div>
        <div className="admin-header-right">
          <div className="admin-stat" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('table')} title="View Results Table">
            <Users size={16} />
            <span>{results.length} Student{results.length !== 1 ? 's' : ''}</span>
          </div>
          <button className="btn-admin" onClick={loadResults} title="Refresh">
            <RefreshCw size={16} /> Refresh
          </button>
          <button
            className="btn-admin download"
            onClick={handleDownloadExcel}
            disabled={results.length === 0}
          >
            <Download size={16} /> Excel
          </button>
          <button
            className="btn-admin danger"
            onClick={() => setShowConfirm(true)}
            disabled={results.length === 0}
          >
            <Trash2 size={16} /> Clear
          </button>
        </div>
      </div>
      {}
      <div className="admin-tabs">
        <button
          className={`admin-tab ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <BarChart3 size={16} /> Analytics
        </button>
        <button
          className={`admin-tab ${activeTab === 'table' ? 'active' : ''}`}
          onClick={() => setActiveTab('table')}
        >
          <FileSpreadsheet size={16} /> Results Table
        </button>
        <button
          className={`admin-tab ${activeTab === 'questions' ? 'active' : ''}`}
          onClick={() => setActiveTab('questions')}
        >
          <FileQuestion size={16} /> Questions
        </button>
      </div>
      {}
      {showConfirm && (
        <div className="clear-confirm-overlay">
          <div className="glass-card clear-confirm-card">
            <Trash2 size={32} color="var(--accent-danger)" />
            <h3>Clear All Results?</h3>
            <p>This will permanently delete all stored exam results from the database. This action cannot be undone.</p>
            <div className="confirm-buttons">
              <button className="btn-admin" onClick={() => setShowConfirm(false)}>Cancel</button>
              <button className="btn-admin danger" onClick={handleClearAll}>Yes, Clear All</button>
            </div>
          </div>
        </div>
      )}
      {}
      <div className="admin-content">
        {activeTab === 'questions' ? (
          <QuestionManager token={token} />
        ) : loading ? (
          <div className="admin-empty">
            <RefreshCw size={48} color="var(--text-muted)" className="spin" />
            <h3>Loading Results...</h3>
          </div>
        ) : error ? (
          <div className="admin-empty">
            <h3 style={{ color: 'var(--accent-danger)' }}>Error</h3>
            <p>{error}</p>
            <button className="btn-admin" onClick={loadResults}>Retry</button>
          </div>
        ) : results.length === 0 ? (
          <div className="admin-empty">
            <FileSpreadsheet size={48} color="var(--text-muted)" />
            <h3>No Results Yet</h3>
            <p>Student exam results will appear here once exams are submitted.</p>
          </div>
        ) : activeTab === 'analytics' ? (
          <AnalyticsDashboard analytics={analytics} results={results} />
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Student Name</th>
                  <th>Email</th>
                  <th>Contact</th>
                  <th>Correct</th>
                  <th>Wrong</th>
                  <th>Skipped</th>
                  <th>Score %</th>
                  <th>Violations</th>
                  <th>Time</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => {
                  const pct = r.total ? Math.round((r.correct / r.total) * 100) : 0;
                  return (
                    <tr key={r._id || i}>
                      <td>{i + 1}</td>
                      <td className="cell-name">{r.studentData?.name || '—'}</td>
                      <td>{r.studentData?.email || '—'}</td>
                      <td>{r.studentData?.contact || '—'}</td>
                      <td className="cell-correct">{r.correct}</td>
                      <td className="cell-wrong">{r.wrong}</td>
                      <td className="cell-skipped">{r.skipped}</td>
                      <td className={`cell-score ${pct >= 50 ? 'pass' : 'fail'}`}>{pct}%</td>
                      <td className={`cell-violations ${r.violations > 0 ? 'has-violations' : ''}`}>
                        {r.violations}
                      </td>
                      <td>{formatTimeTaken(r.timeTaken)}</td>
                      <td className="cell-date">
                        {r.submittedAt ? new Date(r.submittedAt).toLocaleString() : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
function AnalyticsDashboard({ analytics, results }) {
  return (
    <div className="analytics-dashboard">
      {}
      <div className="summary-cards">
        <SummaryCard label="Total Students" value={analytics.totalStudents} color="var(--accent-primary)" />
        <SummaryCard label="Average Score" value={`${analytics.avgScore}%`} color={analytics.avgScore >= 50 ? 'var(--accent-success)' : 'var(--accent-danger)'} />
        <SummaryCard label="Pass Rate" value={`${analytics.passRate}%`} color="var(--accent-success)" />
        <SummaryCard label="Avg Time" value={formatTimeTaken(analytics.avgTime)} color="var(--accent-warning)" />
        <SummaryCard label="Total Violations" value={analytics.totalViolations} color="var(--accent-danger)" />
      </div>
      {}
      <div className="charts-grid">
        <ChartCard title="Score Distribution">
          <BarChartCanvas data={analytics.scoreDistribution} colors={['#ff6b6b', '#ff9f43', '#fdcb6e', '#00cec9', '#00b894']} labels={['0-20%', '21-40%', '41-60%', '61-80%', '81-100%']} />
        </ChartCard>
        <ChartCard title="Pass vs Fail">
          <DonutChartCanvas data={[analytics.passCount, analytics.failCount]} labels={['Pass (≥50%)', 'Fail (<50%)']} colors={['#00cec9', '#ff6b6b']} />
        </ChartCard>
        <ChartCard title="Violations Overview">
          <BarChartCanvas data={analytics.violationDistribution} colors={['#00cec9', '#fdcb6e', '#ff9f43', '#ff6b6b']} labels={['0', '1', '2', '3+']} />
        </ChartCard>
        <ChartCard title="Score Trend (Recent)">
          <LineChartCanvas data={analytics.scoreTrend} />
        </ChartCard>
      </div>
    </div>
  );
}
function SummaryCard({ label, value, color }) {
  return (
    <div className="summary-card glass-card">
      <div className="summary-card-value" style={{ color }}>{value}</div>
      <div className="summary-card-label">{label}</div>
    </div>
  );
}
function ChartCard({ title, children }) {
  return (
    <div className="chart-card glass-card">
      <h4 className="chart-title">{title}</h4>
      <div className="chart-body">{children}</div>
    </div>
  );
}
function BarChartCanvas({ data, colors, labels }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);
    const max = Math.max(...data, 1);
    const barCount = data.length;
    const gap = 16;
    const barW = (w - gap * (barCount + 1)) / barCount;
    const chartH = h - 40;
    data.forEach((val, i) => {
      const barH = (val / max) * (chartH - 10);
      const x = gap + i * (barW + gap);
      const y = chartH - barH;
      ctx.fillStyle = colors[i % colors.length];
      ctx.beginPath();
      ctx.roundRect(x, y, barW, barH, [6, 6, 0, 0]);
      ctx.fill();
      ctx.fillStyle = '#f0f0f8';
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(val, x + barW / 2, y - 6);
      ctx.fillStyle = '#6b7394';
      ctx.font = '11px Inter, sans-serif';
      ctx.fillText(labels[i] || '', x + barW / 2, h - 6);
    });
  }, [data, colors, labels]);
  return <canvas ref={canvasRef} className="chart-canvas" />;
}
function DonutChartCanvas({ data, labels, colors }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);
    const total = data.reduce((a, b) => a + b, 0) || 1;
    const cx = w / 2;
    const cy = h / 2 - 10;
    const radius = Math.min(cx, cy) - 10;
    const innerRadius = radius * 0.55;
    let startAngle = -Math.PI / 2;
    data.forEach((val, i) => {
      const sliceAngle = (val / total) * 2 * Math.PI;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, startAngle, startAngle + sliceAngle);
      ctx.arc(cx, cy, innerRadius, startAngle + sliceAngle, startAngle, true);
      ctx.closePath();
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();
      startAngle += sliceAngle;
    });
    ctx.fillStyle = '#f0f0f8';
    ctx.font = 'bold 22px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(total, cx, cy - 6);
    ctx.fillStyle = '#6b7394';
    ctx.font = '11px Inter, sans-serif';
    ctx.fillText('total', cx, cy + 12);
    const legendY = h - 16;
    labels.forEach((label, i) => {
      const lx = cx - 70 + i * 140;
      ctx.fillStyle = colors[i];
      ctx.beginPath();
      ctx.arc(lx - 8, legendY, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#a0a8c8';
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${label} (${data[i]})`, lx, legendY + 4);
    });
  }, [data, labels, colors]);
  return <canvas ref={canvasRef} className="chart-canvas" />;
}
function LineChartCanvas({ data }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);
    if (data.length === 0) {
      ctx.fillStyle = '#6b7394';
      ctx.font = '13px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No data yet', w / 2, h / 2);
      return;
    }
    const padding = { top: 20, right: 20, bottom: 30, left: 40 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;
    const max = Math.max(...data, 100);
    const min = 0;
    ctx.strokeStyle = 'rgba(100, 130, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(w - padding.right, y);
      ctx.stroke();
      ctx.fillStyle = '#6b7394';
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(Math.round(max - (max - min) * (i / 4)) + '%', padding.left - 6, y + 3);
    }
    const stepX = data.length > 1 ? chartW / (data.length - 1) : chartW / 2;
    const points = data.map((val, i) => ({
      x: padding.left + stepX * i,
      y: padding.top + chartH - (val / max) * chartH,
    }));
    const gradient = ctx.createLinearGradient(0, padding.top, 0, h - padding.bottom);
    gradient.addColorStop(0, 'rgba(227, 27, 35, 0.25)');
    gradient.addColorStop(1, 'rgba(227, 27, 35, 0.02)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(points[0].x, h - padding.bottom);
    points.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(points[points.length - 1].x, h - padding.bottom);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#e31b23';
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    points.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
    ctx.stroke();
    points.forEach((p) => {
      ctx.fillStyle = '#e31b23';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0a0e1a';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.fillStyle = '#6b7394';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'center';
    points.forEach((p, i) => {
      ctx.fillText(`#${i + 1}`, p.x, h - 8);
    });
  }, [data]);
  return <canvas ref={canvasRef} className="chart-canvas" />;
}
function computeAnalytics(results) {
  const totalStudents = results.length;
  if (totalStudents === 0) {
    return {
      totalStudents: 0, avgScore: 0, passRate: 0, avgTime: 0,
      totalViolations: 0, passCount: 0, failCount: 0,
      scoreDistribution: [0, 0, 0, 0, 0],
      violationDistribution: [0, 0, 0, 0],
      scoreTrend: [],
    };
  }
  let totalScore = 0;
  let totalTime = 0;
  let totalViolations = 0;
  let passCount = 0;
  let failCount = 0;
  const scoreDistribution = [0, 0, 0, 0, 0]; 
  const violationDistribution = [0, 0, 0, 0]; 
  const scoreTrend = [];
  results.forEach((r) => {
    const pct = r.total ? Math.round((r.correct / r.total) * 100) : 0;
    totalScore += pct;
    totalTime += r.timeTaken || 0;
    totalViolations += r.violations || 0;
    if (pct >= 50) passCount++;
    else failCount++;
    if (pct <= 20) scoreDistribution[0]++;
    else if (pct <= 40) scoreDistribution[1]++;
    else if (pct <= 60) scoreDistribution[2]++;
    else if (pct <= 80) scoreDistribution[3]++;
    else scoreDistribution[4]++;
    const v = r.violations || 0;
    if (v === 0) violationDistribution[0]++;
    else if (v === 1) violationDistribution[1]++;
    else if (v === 2) violationDistribution[2]++;
    else violationDistribution[3]++;
    scoreTrend.push(pct);
  });
  return {
    totalStudents,
    avgScore: Math.round(totalScore / totalStudents),
    passRate: Math.round((passCount / totalStudents) * 100),
    avgTime: Math.round(totalTime / totalStudents),
    totalViolations,
    passCount,
    failCount,
    scoreDistribution,
    violationDistribution,
    scoreTrend: scoreTrend.slice(-15), 
  };
}
function formatTimeTaken(sec) {
  if (!sec && sec !== 0) return '—';
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}m ${s}s`;
}
