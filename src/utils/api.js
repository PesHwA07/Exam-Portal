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
