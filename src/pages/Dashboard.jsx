// Dashboard.jsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActionIcon, Button, Group, Paper, Table, Text, TextInput, Title, Tooltip,
} from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { IconPlus, IconSearch, IconPencil, IconTrash } from '@tabler/icons-react';

const LS_KEY = 'docs';

function readDocs() {
  const raw = localStorage.getItem(LS_KEY);
  try { return Array.isArray(JSON.parse(raw)) ? JSON.parse(raw) : []; } catch { return []; }
}
function writeDocs(docs) { localStorage.setItem(LS_KEY, JSON.stringify(docs)); }
function fmt(dt) { return dt ? new Date(dt).toLocaleString() : '—'; }

export default function Dashboard() {
  const navigate = useNavigate();
  const [docs, setDocs] = useState([]);
  const [q, setQ] = useState('');

  // carga inicial + sync con cambios externos
  useEffect(() => {
    setDocs(readDocs());
    const onStorage = (e) => { if (e.key === LS_KEY) setDocs(readDocs()); };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // ordenar por actualizado desc y filtrar por query
  const view = useMemo(() => {
    const data = [...docs].sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
    if (!q.trim()) return data;
    const needle = q.toLowerCase();
    return data.filter(d =>
      (d.titulo || '').toLowerCase().includes(needle) ||
      (d.html || '').toLowerCase().includes(needle)
    );
  }, [docs, q]);

  const nuevo = () => {
    const id = crypto.randomUUID();
    const ahora = new Date().toISOString();
    const baseTitulo = 'Documento sin título';
    // evitar colisiones del nombre visible
    let titulo = baseTitulo;
    const existing = new Set(docs.map(d => d.titulo));
    for (let i = 2; existing.has(titulo); i++) titulo = `${baseTitulo} ${i}`;

    const nuevos = [
      ...docs,
      { id, titulo, html: '', createdAt: ahora, updatedAt: ahora },
    ];
    writeDocs(nuevos);
    setDocs(nuevos);
    navigate(`/home?id=${id}`); // el editor debe leer ?id
  };

  const editar = (id) => navigate(`/home?id=${id}`);

  const eliminar = (id) => {
    if (!confirm('¿Eliminar este documento?')) return;
    const nuevos = docs.filter(d => d.id !== id);
    writeDocs(nuevos);
    setDocs(nuevos);
  };

  return (
    <Paper p="lg" radius="lg" withBorder style={{ maxWidth: 1000, margin: '40px auto' }}>
      <Group justify="space-between" mb="md">
        <Title order={2}>Documentos</Title>
        <Group gap="sm">
          <TextInput
            placeholder="Buscar por título o contenido"
            leftSection={<IconSearch size={16} />}
            value={q}
            onChange={(e) => setQ(e.currentTarget.value)}
            w={280}
          />
          <Button leftSection={<IconPlus size={16} />} onClick={nuevo}>
            Nuevo documento
          </Button>
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
                <Table.Td>
                  <Text fw={500}>{d.titulo || 'Sin título'}</Text>
                </Table.Td>
                <Table.Td>{fmt(d.createdAt)}</Table.Td>
                <Table.Td>{fmt(d.updatedAt)}</Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <Tooltip label="Editar">
                      <ActionIcon variant="light" onClick={() => editar(d.id)}>
                        <IconPencil size={16} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Eliminar">
                      <ActionIcon color="red" variant="light" onClick={() => eliminar(d.id)}>
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
    </Paper>
  );
}
