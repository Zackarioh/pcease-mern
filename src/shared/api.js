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
