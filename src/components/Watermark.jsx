import { useMemo } from 'react';

/**
 * Watermark
 * Renders a full-screen overlay of repeating, rotated student name text.
 * This deters screen photography and sharing since the student's identity is embedded.
 */
export default function Watermark({ studentName }) {
  const items = useMemo(() => {
    const grid = [];
    const cols = 6;
    const rows = 12;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        grid.push({
          key: `${r}-${c}`,
          top: `${(r / rows) * 100 + 2}%`,
          left: `${(c / cols) * 100 + 2}%`,
        });
      }
    }
    return grid;
  }, []);

  return (
    <div className="watermark-overlay">
      {items.map((item) => (
        <span
          key={item.key}
          className="watermark-text"
          style={{ top: item.top, left: item.left }}
        >
          {studentName}
        </span>
      ))}
    </div>
  );
}
