const API_BASE = '/api';
export async function loginAdmin(username, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Login failed');
  return data; 
}
export async function submitResult(result) {
  try {
    const res = await fetch(`${API_BASE}/results`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result),
    });
    if (!res.ok) throw new Error('Failed to save result to server');
    return await res.json();
  } catch (err) {
    console.warn('API submitResult failed (will use localStorage fallback):', err.message);
    return null;
  }
}
export async function fetchResults(token) {
  const res = await fetch(`${API_BASE}/results`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch results');
  return await res.json();
}
export async function deleteAllResults(token) {
  const res = await fetch(`${API_BASE}/results`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to delete results');
  return await res.json();
}

// ────────────────────────────────────────────
// Question Management APIs
// ────────────────────────────────────────────

export async function uploadQuestionFile(file, token) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/questions/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Upload failed');
  return data;
}

export async function publishQuestions(examData, token) {
  const res = await fetch(`${API_BASE}/questions/publish`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(examData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Publish failed');
  return data;
}

export async function fetchActiveQuestions() {
  const res = await fetch(`${API_BASE}/questions/active`);
  if (!res.ok) throw new Error('Failed to fetch questions');
  return await res.json();
}

export async function fetchActiveAnswers() {
  const res = await fetch(`${API_BASE}/questions/active/answers`);
  if (!res.ok) throw new Error('Failed to fetch answers');
  return await res.json();
}

export async function fetchQuestionHistory(token) {
  const res = await fetch(`${API_BASE}/questions/history`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch history');
  return await res.json();
}

export async function updateQuestionSet(id, data, token) {
  const res = await fetch(`${API_BASE}/questions/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.error || 'Update failed');
  return result;
}

export async function deleteQuestionSet(id, token) {
  const res = await fetch(`${API_BASE}/questions/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Delete failed');
  return data;
}

