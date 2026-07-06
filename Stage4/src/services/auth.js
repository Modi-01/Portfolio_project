const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

async function request(path, body) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.detail || "Request failed.");
  }

  return data;
}

export function registerUser(payload) {
  return request("/api/auth/register", payload);
}

export function loginUser(credentials) {
  return request("/api/auth/login", credentials);
}

export function logoutUser() {
  return request("/api/auth/logout", {});
}

export function isAuthenticated() {
  return !!localStorage.getItem("token");
}

export function getCurrentUser() {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
}