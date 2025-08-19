const USERS_KEY = 'users';
const DOCS_KEY = 'docs';
const SESSION_KEY = 'session';

function readJSON(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    const x = JSON.parse(v ?? 'null');
    return x ?? fallback;
  } catch {
    return fallback;
  }
}
function writeJSON(key, value) { localStorage.setItem(key, JSON.stringify(value)); }

// Usuarios
export function getUsers() { return readJSON(USERS_KEY, []); }
export function userExists(username) { return getUsers().some(u => u.username === username); }
export function addUser({ username, password }) {
  const users = getUsers();
  if (userExists(username)) return false;
  users.push({ username, password, createdAt: new Date().toISOString() });
  writeJSON(USERS_KEY, users);
  return true;
}
export function validateUser({ username, password }) {
  return getUsers().some(u => u.username === username && u.password === password);
}

// Sesión
export function setSession(username) { writeJSON(SESSION_KEY, { username, loggedAt: new Date().toISOString() }); }
export function getSession() { return readJSON(SESSION_KEY, null); }
export function clearSession() { localStorage.removeItem(SESSION_KEY); }

// Docs
export function getDocs() { return readJSON(DOCS_KEY, []); }
export function writeDocs(arr) { writeJSON(DOCS_KEY, Array.isArray(arr) ? arr : []); }
export function findDocById(id) { return getDocs().find(d => d.id === id) || null; }
export function saveDoc(doc) {
  const docs = getDocs();
  const idx = docs.findIndex(d => d.id === doc.id);
  if (idx === -1) docs.push(doc); else docs[idx] = doc;
  writeDocs(docs);
}
export function deleteDoc(id) {
  writeDocs(getDocs().filter(d => d.id !== id));
}
