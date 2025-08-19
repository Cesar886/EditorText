import React from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Home from './pages/Home.jsx';
import { getSession } from './lib/storage.js';

function RequireAuth({ children }) {
  const session = getSession();
  const loc = useLocation();
  if (!session) return <Navigate to="/login" replace state={{ from: loc }} />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard"
        element={<RequireAuth><Dashboard /></RequireAuth>}
      />
      <Route
        path="/home"
        element={<RequireAuth><Home /></RequireAuth>}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
