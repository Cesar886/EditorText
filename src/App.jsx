import React, { useState } from 'react';
import { Paper, Title, TextInput, PasswordInput, Button, Stack } from '@mantine/core';
import { useNavigate } from 'react-router-dom';

export default function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = () => {
    if (!username || !password) {
      setError('Completa todos los campos');
      return;
    }
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const exists = users.find((u) => u.username === username);
    if (exists) {
      setError('Ese usuario ya existe');
      return;
    }
    users.push({ username, password });
    localStorage.setItem('users', JSON.stringify(users));
    setError('Usuario registrado con éxito');
  };

  // Login
  const handleSubmit = (e) => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const found = users.find((u) => u.username === username && u.password === password);
    if (found) {
      setError('');
      navigate('/dashboard');
    } else {
      setError('Usuario o contraseña incorrectos');
    }
  };

  return (
    <Paper shadow="md" radius="lg" p="xl" withBorder style={{ maxWidth: 400, margin: '80px auto', backgroundColor: '#f8f9fa' }}>
      <Title order={2} ta="center" style={{ fontWeight: 700, color: '#0E4C84', marginBottom: 20 }}>
        Login / Registro
      </Title>

      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <TextInput label="Username" placeholder="user" required radius="md"
            value={username} onChange={(e) => setUsername(e.target.value)} />
          <PasswordInput label="Password" placeholder="123456" required radius="md"
            value={password} onChange={(e) => setPassword(e.target.value)} />

          {error && <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>}

          <Button type="submit" fullWidth radius="md" size="md" style={{ backgroundColor: '#0E4C84' }}>
            Login
          </Button>
          <Button onClick={handleRegister} fullWidth radius="md" size="md" variant="outline" color="blue">
            Registrar
          </Button>
        </Stack>
      </form>
    </Paper>
  );
}
