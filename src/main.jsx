import '@mantine/core/styles.css';
import '@mantine/tiptap/styles.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import App from './App';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';

ReactDOM.createRoot(document.getElementById('root')).render(
  <MantineProvider defaultColorScheme="light">
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/home" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  </MantineProvider>
);
