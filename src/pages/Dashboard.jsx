import React, { useEffect, useMemo, useState } from 'react';
import {
  ActionIcon, Button, Group, Paper, Table, Text, TextInput, Title, Tooltip, Menu, Divider, Badge,
} from '@mantine/core';
import { IconPlus, IconSearch, IconPencil, IconTrash, IconLogout, IconUser } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { deleteDoc, getDocs } from '../lib/storage.js';
import { getSession, clearSession } from '../lib/storage.js';

const LS_KEY = 'docs';
const fmt = (dt) => (dt ? new Date(dt).toLocaleString() : '—');

export default function Dashboard() {
  const navigate = useNavigate();
  const session = getSession();
  const [docs, setDocs] = useState([]);
  const [q, setQ] = useState('');
  const [confirmFor, setConfirmFor] = useState(null);

  // carga + sync por cambios externos
  useEffect(() => {
    setDocs(getDocs());
    const onStorage = (e) => { if (e.key === LS_KEY) setDocs(getDocs()); };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // ordenar por actualizado desc y filtrar
  const view = useMemo(() => {
    const data = [...docs].sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
    if (!q.trim()) return data;
    const needle = q.toLowerCase();
    return data.filter(d =>
      (d.titulo || '').toLowerCase().includes(needle) ||
      (d.html || '').toLowerCase().includes(needle)
    );
  }, [docs, q]);

  const nuevo = () => navigate('/home'); // Home crea id si no llega por query
  const editar = (id) => navigate(`/home?id=${id}`);
  const solicitarEliminar = (id) => setConfirmFor(id);

  const confirmarEliminar = () => {
    if (!confirmFor) return;
    deleteDoc(confirmFor);
    setDocs(getDocs());
    setConfirmFor(null);
  };

  const logout = () => {
    clearSession();
    navigate('/login', { replace: true });
  };

  return (
    <Paper p="lg" radius="lg" withBorder style={{ maxWidth: 1000, margin: '40px auto' }}>
      <Group justify="space-between" mb="md">
        <Group gap="xs">
          <Title order={2}>Documentos</Title>
          <Badge variant="light">Total {docs.length}</Badge>
        </Group>
        <Group gap="sm">
          <TextInput
            placeholder="Buscar por título o contenido"
            leftSection={<IconSearch size={16} aria-hidden="true" />}
            value={q}
            onChange={(e) => setQ(e.currentTarget.value)}
            w={280}
            aria-label="Buscar documentos"
          />
          <Button leftSection={<IconPlus size={16} />} onClick={nuevo}>
            Nuevo documento
          </Button>

          <Menu withinPortal position="bottom-end" shadow="md">
            <Menu.Target>
              <Button variant="light" leftSection={<IconUser size={16} />}>
                {session?.username || 'Usuario'}
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>Cuenta</Menu.Label>
              <Menu.Item leftSection={<IconLogout size={16} />} onClick={logout}>
                Cerrar sesión
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Group>

      {view.length === 0 ? (
        <Paper p="xl" radius="md" withBorder>
          <Text c="dimmed" mb="md">No hay documentos.</Text>
          <Button leftSection={<IconPlus size={16} />} onClick={nuevo}>
            Crear el primero
          </Button>
        </Paper>
      ) : (
        <Table striped highlightOnHover withColumnBorders stickyHeader>
          <Table.Thead>
            <Table.Tr>
              <Table.Th style={{ width: '40%' }}>Título</Table.Th>
              <Table.Th style={{ width: '20%' }}>Creado</Table.Th>
              <Table.Th style={{ width: '20%' }}>Actualizado</Table.Th>
              <Table.Th style={{ width: '20%' }}>Acciones</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {view.map((d) => (
              <Table.Tr key={d.id}>
                <Table.Td><Text fw={500}>{d.titulo || 'Sin título'}</Text></Table.Td>
                <Table.Td>{fmt(d.createdAt)}</Table.Td>
                <Table.Td>{fmt(d.updatedAt)}</Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <Tooltip label="Editar">
                      <ActionIcon variant="light" onClick={() => editar(d.id)} aria-label="Editar documento">
                        <IconPencil size={16} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Eliminar">
                      <ActionIcon color="red" variant="light" onClick={() => solicitarEliminar(d.id)} aria-label="Eliminar documento">
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}

      {/* Modal simple de confirmación */}
      <Divider my="md" style={{ opacity: 0 }} />
      {confirmFor && (
        <Paper withBorder radius="md" p="md" style={{ position: 'fixed', right: 24, bottom: 24, background: 'white' }}>
          <Text mb="sm">¿Eliminar este documento?</Text>
          <Group justify="end">
            <Button variant="default" onClick={() => setConfirmFor(null)}>Cancelar</Button>
            <Button color="red" onClick={confirmarEliminar}>Eliminar</Button>
          </Group>
        </Paper>
      )}
    </Paper>
  );
}
