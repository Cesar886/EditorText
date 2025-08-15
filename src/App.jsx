import React, { useState } from 'react';
import { Paper, Title, TextInput, PasswordInput, Button, Stack } from '@mantine/core';
import { useNavigate } from 'react-router-dom';

export default function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username === 'user' && password === '123456') {
      setError('');
      navigate('/home'); // coincide con la Route
    } else {
      setError('Usuario o contraseña incorrectos');
    }
  };

  return (
    <Paper shadow="md" radius="lg" p="xl" withBorder style={{ maxWidth: 400, margin: '80px auto', backgroundColor: '#f8f9fa' }}>
      <Title order={2} ta="center" style={{ fontWeight: 700, color: '#0E4C84', marginBottom: 20 }}>
        Login
      </Title>

      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <TextInput label="Username" placeholder="Enter your username" required radius="md"
            value={username} onChange={(e) => setUsername(e.target.value)} />
          <PasswordInput label="Password" placeholder="Enter your password" required radius="md"
            value={password} onChange={(e) => setPassword(e.target.value)} />
          {error && <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>}
          <Button type="submit" fullWidth radius="md" size="md" style={{ backgroundColor: '#0E4C84' }}>
            Login
          </Button>
        </Stack>
      </form>
    </Paper>
  );
}
