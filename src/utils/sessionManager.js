const SESSION_KEY = 'netleap_active_session';
const RESULTS_KEY = 'netleap_exam_results';
export function saveSession(data) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save session:', e);
  }
}
export function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}
export function saveResult(result) {
  try {
    const existing = getAllResults();
    existing.push({
      ...result,
      submittedAt: new Date().toISOString(),
    });
    localStorage.setItem(RESULTS_KEY, JSON.stringify(existing));
  } catch (e) {
    console.warn('Failed to save result:', e);
  }
}
export function getAllResults() {
  try {
    const raw = localStorage.getItem(RESULTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
export function clearAllResults() {
  localStorage.removeItem(RESULTS_KEY);
}
