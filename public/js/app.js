const API_BASE = '/api';

function getToken() {
  return localStorage.getItem('token');
}

function setToken(token) {
  localStorage.setItem('token', token);
}

function clearToken() {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  localStorage.removeItem('role');
}

function setUserInfo({ username, role }) {
  localStorage.setItem('username', username);
  localStorage.setItem('role', role);
}

function getUserInfo() {
  return {
    username: localStorage.getItem('username'),
    role: localStorage.getItem('role')
  };
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function apiFetch(path, options = {}) {
  const headers = Object.assign({ 'Content-Type': 'application/json' }, options.headers || {});
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const json = await res.json();
  if (!json.success) {
    throw new Error(json.error || 'Request failed');
  }
  return json.data;
}

function renderHeader() {
  const header = document.querySelector('header');
  if (!header) return;
  const { username } = getUserInfo();
  const { role } = getUserInfo();
  const status = header.querySelector('[data-auth-status]');
  const logoutBtn = header.querySelector('[data-logout]');
  const loginLink = header.querySelector('[data-login-link]');
  const registerLink = header.querySelector('[data-register-link]');
  const adminLink = header.querySelector('[data-admin-link]');
  if (username) {
    status.textContent = `${username} (${role || 'USER'})`;
    logoutBtn.style.display = 'inline-block';
    if (loginLink) loginLink.style.display = 'none';
    if (registerLink) registerLink.style.display = 'none';
  } else {
    status.textContent = 'Guest';
    logoutBtn.style.display = 'none';
    if (loginLink) loginLink.style.display = 'inline-block';
    if (registerLink) registerLink.style.display = 'inline-block';
  }
  if (adminLink) {
    adminLink.style.display = role === 'ADMIN' ? 'inline-block' : 'none';
  }
  logoutBtn?.addEventListener('click', () => {
    clearToken();
    window.location.href = '/login.html';
  });
}

function getQueryParam(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

function requireAuth(redirectTo = '/login.html') {
  if (!getToken()) {
    window.location.href = redirectTo;
    return false;
  }
  return true;
}

function requireAdmin(redirectTo = '/index.html') {
  const { role } = getUserInfo();
  if (role !== 'ADMIN') {
    window.location.href = redirectTo;
    return false;
  }
  return true;
}

window.App = {
  apiFetch,
  authHeaders,
  setToken,
  setUserInfo,
  clearToken,
  getUserInfo,
  renderHeader,
  getQueryParam,
  requireAuth,
  requireAdmin
};
