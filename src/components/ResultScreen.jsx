import { CheckCircle, AlertTriangle, Send } from 'lucide-react';
export default function ResultScreen({ result, studentName }) {
  const { violations } = result;
  return (
    <div className="result-screen">
      <div className="glass-card result-card">
        <div className="result-icon submitted">
          <Send size={40} color="var(--accent-primary)" />
        </div>
        <h1>Assessment Submitted</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: '1.7', marginBottom: '28px' }}>
          Thank you, <strong style={{ color: 'var(--text-primary)' }}>{studentName}</strong>. Your exam has been submitted successfully.
          <br />
          Your results will be reviewed by the administrator.
        </p>
        {}
        <div className="cheat-count-card">
          <div className="cheat-count-header">
            <AlertTriangle size={20} />
            <span>Integrity Report</span>
          </div>
          <div className="cheat-count-value">{violations}</div>
          <div className="cheat-count-label">
            {violations === 0
              ? 'No violations detected — clean assessment'
              : `Cheating attempt${violations > 1 ? 's' : ''} recorded during the exam`}
          </div>
        </div>
        {violations === 0 && (
          <div className="violations-banner" style={{
            background: 'rgba(0,206,201,0.08)',
            borderColor: 'rgba(0,206,201,0.2)',
            color: 'var(--accent-success)'
          }}>
            <CheckCircle size={18} />
            No violations detected — clean assessment
          </div>
        )}
        {violations > 0 && (
          <div className="violations-banner">
            <AlertTriangle size={18} />
            {violations} violation{violations > 1 ? 's' : ''} have been logged and reported
          </div>
        )}
      </div>
    </div>
  );
}
