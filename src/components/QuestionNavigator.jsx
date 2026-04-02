export default function QuestionNavigator({ questions, answers, currentIndex, onNavigate, answeredCount }) {
  return (
    <div className="sidebar">
      <div className="sidebar-stats">
        <div className="stat-box">
          <div className="stat-value">{answeredCount}</div>
          <div className="stat-label">Answered</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{questions.length - answeredCount}</div>
          <div className="stat-label">Remaining</div>
        </div>
      </div>

      <div className="sidebar-title">Questions</div>
      <div className="nav-grid">
        {questions.map((q, i) => {
          let cls = 'nav-btn';
          if (i === currentIndex) cls += ' current';
          else if (answers[q.id] !== undefined) cls += ' answered';
          return (
            <button key={q.id} className={cls} onClick={() => onNavigate(i)}>
              {i + 1}
            </button>
          );
        })}
      </div>

      <div className="sidebar-legend">
        <div className="legend-item">
          <span className="legend-dot current" />
          Current Question
        </div>
        <div className="legend-item">
          <span className="legend-dot answered" />
          Answered
        </div>
        <div className="legend-item">
          <span className="legend-dot unanswered" />
          Unanswered
        </div>
      </div>
    </div>
  );
}
