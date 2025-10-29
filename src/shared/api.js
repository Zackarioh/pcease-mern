// src/shared/api.js

const API_URL = "http://localhost:5000/api";

// ✅ Register new user
export async function register(username, password) {
  const res = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Registration failed");
  }

  return res.json();
}

// ✅ Login existing user
export async function login(username, password) {
  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Invalid credentials");
  }

  return res.json();
}

// ✅ Fetch all components
export async function getComponents() {
  const res = await fetch(`${API_URL}/components`);
  if (!res.ok) throw new Error("Failed to load components");
  return res.json();
}

// Group list of components by category to mirror the old componentsDB shape
export async function getComponentsStructured() {
  const list = await getComponents();
  const grouped = {};
  for (const c of list) {
    if (!grouped[c.category]) grouped[c.category] = [];
    grouped[c.category].push(c);
  }
  return grouped;
}

// ===== Forum API =====
export async function getThreads(category) {
  const qs = category ? `?category=${encodeURIComponent(category)}` : '';
  const res = await fetch(`${API_URL}/threads${qs}`);
  if (!res.ok) throw new Error('Failed to load threads');
  return res.json();
}

export async function createThread({ title, category = 'General', content, token }) {
  const res = await fetch(`${API_URL}/threads`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ title, category, content })
  });
  if (!res.ok) {
    const err = await res.json().catch(()=>({}));
    throw new Error(err.error || 'Failed to create thread');
  }
  return res.json();
}

export async function deleteThread({ id, token }) {
  const res = await fetch(`${API_URL}/threads/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) {
    const err = await res.json().catch(()=>({}));
    throw new Error(err.error || 'Failed to delete thread');
  }
  return res.json();
}
