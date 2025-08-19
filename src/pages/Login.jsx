import React, { useState } from 'react';
import { Paper, Title, TextInput, PasswordInput, Button, Stack, Text, Group } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useLocation, useNavigate } from 'react-router-dom';
import { addUser, setSession, userExists, validateUser } from '../lib/storage.js';

export default function Login() {
  const nav = useNavigate();
  const loc = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [errors, setErrors] = useState({ user: '', pass: '' });

  const toggleMode = () => {
    setMode((m) => (m === 'login' ? 'register' : 'login'));
    setErrors({ user: '', pass: '' });
  };

  const validate = () => {
    const e = { user: '', pass: '' };
    if (!username.trim()) e.user = 'Ingresa un usuario';
    if (!password.trim()) e.pass = 'Ingresa una contraseña';
    setErrors(e);
    return !e.user && !e.pass;
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (mode === 'register') {
      if (userExists(username)) {
        setErrors((prev) => ({ ...prev, user: 'Ese usuario ya existe' }));
        return;
      }
      addUser({ username, password });
      notifications.show({ color: 'teal', title: 'Registro correcto', message: 'Usuario creado.' });
      setMode('login');
      return;
    }

    if (!validateUser({ username, password })) {
      setErrors({ user: '', pass: 'Credenciales inválidas' });
      return;
    }
    setSession(username);
    notifications.show({ color: 'teal', title: 'Bienvenido', message: `Sesión iniciada como ${username}` });
    const from = loc.state?.from?.pathname || '/dashboard';
    nav(from, { replace: true });
  };

  return (
    <Paper shadow="md" radius="lg" p="xl" withBorder style={{ maxWidth: 420, margin: '80px auto' }}>
      <Title order={2} ta="center" style={{ fontWeight: 700, color: '#0E4C84', marginBottom: 20 }}>
        {mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
      </Title>

      <form onSubmit={onSubmit}>
        <Stack gap="md">
          <TextInput
            label="Usuario"
            autoComplete={mode === 'login' ? 'username' : 'new-username'}
            required
            value={username}
            error={errors.user}
            onChange={(e) => setUsername(e.currentTarget.value)}
          />
          <PasswordInput
            label="Contraseña"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            required
            value={password}
            error={errors.pass}
            onChange={(e) => setPassword(e.currentTarget.value)}
          />

          <Button type="submit" fullWidth radius="md" size="md">
            {mode === 'login' ? 'Entrar' : 'Registrarme'}
          </Button>

          <Group justify="center">
            <Text size="sm" c="dimmed">
              {mode === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
            </Text>
            <Button variant="subtle" size="compact-sm" onClick={toggleMode}>
              {mode === 'login' ? 'Crear una' : 'Iniciar sesión'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Paper>
  );
}
