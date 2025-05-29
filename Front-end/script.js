// --- API helpers ---
const API = 'http://localhost:3000/api';

function getToken() {
  return localStorage.getItem('token');
}

async function register(name, email, password) {
  const res = await fetch(`${API}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });
  return await res.json();
}

async function login(email, password) {
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (data.token) localStorage.setItem('token', data.token);
  return data;
}

async function getProfile() {
  const res = await fetch(`${API}/applicant/profile`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  return await res.json();
}

async function submitApplication(data) {
  const res = await fetch(`${API}/applicant/application`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`
    },
    body: JSON.stringify(data)
  });
  return await res.json();
}

async function getApplicationStatus() {
  const res = await fetch(`${API}/applicant/application`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  return await res.json();
}

async function uploadDocument(file) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API}/applicant/documents`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getToken()}` },
    body: formData
  });
  return await res.json();
}

async function listDocuments() {
  const res = await fetch(`${API}/applicant/documents`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  return await res.json();
}

// --- UI helpers ---
function showSection(sectionId) {
  ['register-section', 'login-section', 'profile-section', 'application-section', 'document-section'].forEach(id => {
    document.getElementById(id).style.display = 'none';
  });
  document.getElementById(sectionId).style.display = '';
  // Clear messages
  ['register-msg', 'login-msg', 'application-msg', 'document-msg'].forEach(id => {
    if (document.getElementById(id)) document.getElementById(id).textContent = '';
  });
}

// --- Event handlers ---
document.getElementById('register-form').onsubmit = async (e) => {
  e.preventDefault();
  const name = document.getElementById('reg-name').value;
  const email = document.getElementById('reg-email').value;
  const password = document.getElementById('reg-password').value;
  const res = await register(name, email, password);
  document.getElementById('register-msg').textContent = res.message || 'Registered!';
  if (!res.message || res.message === 'Registration successful.') {
    showSection('login-section');
  }
};

document.getElementById('login-form').onsubmit = async (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const res = await login(email, password);
  document.getElementById('login-msg').textContent = res.message || 'Logged in!';
  if (res.token) {
    await loadProfile();
    showSection('profile-section');
    await loadApplication();
    await loadDocuments();
    document.getElementById('application-section').style.display = '';
    document.getElementById('document-section').style.display = '';
  }
};

document.getElementById('logout-btn').onclick = () => {
  localStorage.removeItem('token');
  showSection('login-section');
  document.getElementById('application-section').style.display = 'none';
  document.getElementById('document-section').style.display = 'none';
};

async function loadProfile() {
  const profile = await getProfile();
  document.getElementById('profile-info').textContent = `Name: ${profile.name || ''}, Email: ${profile.email || ''}`;
}

document.getElementById('application-form').onsubmit = async (e) => {
  e.preventDefault();
  const form = e.target;
  const data = {
    position: form.position.value,
    education: form.education.value
  };
  const res = await submitApplication(data);
  document.getElementById('application-msg').textContent = res.message || '';
  await loadApplication();
};

async function loadApplication() {
  const app = await getApplicationStatus();
  if (app && app.status) {
    document.getElementById('application-status').textContent = app.status;
  } else if (app && app.message) {
    document.getElementById('application-status').textContent = app.message;
  } else {
    document.getElementById('application-status').textContent = 'No application submitted.';
  }
}

document.getElementById('document-form').onsubmit = async (e) => {
  e.preventDefault();
  const file = document.getElementById('doc-file').files[0];
  if (!file) return;
  const res = await uploadDocument(file);
  document.getElementById('document-msg').textContent = res.message || '';
  await loadDocuments();
};

async function loadDocuments() {
  const docs = await listDocuments();
  const list = document.getElementById('document-list');
  list.innerHTML = '';
  (docs || []).forEach(doc => {
    const li = document.createElement('li');
    li.textContent = doc.originalname;
    list.appendChild(li);
  });
}

// Add these after your function declarations and before window.onload

document.getElementById('to-register').onclick = (e) => {
  e.preventDefault();
  showSection('register-section');
};

document.getElementById('to-login').onclick = (e) => {
  e.preventDefault();
  showSection('login-section');
};

// --- On page load ---
window.onload = async () => {
  if (getToken()) {
    await loadProfile();
    showSection('profile-section');
    document.getElementById('application-section').style.display = '';
    document.getElementById('document-section').style.display = '';
    await loadApplication();
    await loadDocuments();
  } else {
    showSection('login-section');
  }
};
