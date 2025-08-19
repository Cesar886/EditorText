// Editor con autosave, atajos y notificaciones
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Button, Group, Loader, Paper, Stack, TextInput, Title, Badge, Tooltip, Divider,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useHotkeys, useInterval } from '@mantine/hooks';
import { RichTextEditor, Link } from '@mantine/tiptap';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import Superscript from '@tiptap/extension-superscript';
import SubScript from '@tiptap/extension-subscript';
import TextAlign from '@tiptap/extension-text-align';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { deleteDoc, findDocById, getDocs, saveDoc, writeDocs } from '../lib/storage.js';

function fmtTime(iso) { try { return new Date(iso).toLocaleTimeString(); } catch { return '—'; } }

export default function Home() {
  const navigate = useNavigate();
  const [sp] = useSearchParams();
  const urlId = sp.get('id') || null;

  const [docId, setDocId] = useState(urlId);
  const [titulo, setTitulo] = useState('');
  const [loading, setLoading] = useState(true);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [createdAt, setCreatedAt] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const mounted = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link,
      Superscript,
      SubScript,
      Highlight,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: '',
    onUpdate: () => setIsDirty(true),
  });

  // Crear documento si no viene id
  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;

    if (urlId) {
      setDocId(urlId);
      return;
    }

    const id = crypto.randomUUID();
    const ahora = new Date().toISOString();
    const docs = getDocs();

    let base = 'Documento sin título';
    let t = base;
    const existentes = new Set(docs.map((d) => d.titulo));
    for (let i = 2; existentes.has(t); i++) t = `${base} ${i}`;

    const nuevo = { id, titulo: t, html: '', createdAt: ahora, updatedAt: ahora };
    writeDocs([...docs, nuevo]);
    setDocId(id);
    setTitulo(t);
    setCreatedAt(ahora);
    setLastSavedAt(ahora);
    navigate(`/home?id=${id}`, { replace: true });
  }, [urlId, navigate]);

  // Cargar documento
  useEffect(() => {
    if (!docId || !editor) return;
    setLoading(true);
    const found = findDocById(docId);
    if (!found) {
      const ahora = new Date().toISOString();
      const nuevo = { id: docId, titulo: 'Documento sin título', html: '', createdAt: ahora, updatedAt: ahora };
      const docs = getDocs();
      writeDocs([...docs, nuevo]);
      setTitulo(nuevo.titulo);
      setCreatedAt(nuevo.createdAt);
      setLastSavedAt(nuevo.updatedAt);
      editor.commands.setContent('');
      setLoading(false);
      return;
    }
    setTitulo(found.titulo || '');
    setCreatedAt(found.createdAt || null);
    setLastSavedAt(found.updatedAt || null);
    editor.commands.setContent(found.html || '');
    setLoading(false);
  }, [docId, editor]);

  // Atajo Ctrl/Cmd+S
  useHotkeys([['mod+s', (e) => { e.preventDefault(); guardar(false); }]], [editor, titulo, docId]);

  // Autosave 2s
  const autosave = useInterval(() => { if (isDirty) guardar(true); }, 2000);
  useEffect(() => { autosave.start(); return autosave.stop; }, []); // iniciar al montar

  // Aviso al cerrar si hay cambios
  useEffect(() => {
    const onBeforeUnload = (e) => { if (!isDirty) return; e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [isDirty]);

  const disabled = useMemo(() => !editor || loading, [editor, loading]);

  function guardar(silencioso = false) {
    if (!editor || !docId) return;
    const html = editor.getHTML();
    const ahora = new Date().toISOString();
    const t = (titulo || '').trim() || 'Documento sin título';

    // Colisión de título
    const collides = getDocs().find(d => d.titulo === t && d.id !== docId);
    if (collides && !silencioso) {
      notifications.show({ color: 'yellow', title: 'Título en uso', message: 'Ya existe otro documento con ese título.' });
    }

    const prev = findDocById(docId);
    const doc = prev
      ? { ...prev, titulo: t, html, updatedAt: ahora }
      : { id: docId, titulo: t, html, createdAt: createdAt || ahora, updatedAt: ahora };

    saveDoc(doc);
    setIsDirty(false);
    setLastSavedAt(ahora);
    if (!silencioso) notifications.show({ color: 'teal', title: 'Guardado', message: `Cambios guardados · ${fmtTime(ahora)}` });
  }

  function eliminarDoc() {
    if (!docId) return;
    if (!confirm('¿Eliminar este documento?')) return;
    deleteDoc(docId);
    notifications.show({ color: 'red', title: 'Eliminado', message: 'El documento fue eliminado.' });
    navigate('/dashboard');
  }

  if (!editor) {
    return (<Group justify="center" mt="xl"><Loader /></Group>);
  }

  return (
    <Paper p="md" radius="lg" withBorder style={{ margin: '20px 12% 0 12%' }}>
      <Stack gap="sm">
        <Group justify="space-between" align="center">
          <Title order={3} style={{ color: '#0E4C84' }}>Editor</Title>
          <Group gap="xs">
            <Badge variant="light" color={isDirty ? 'yellow' : 'green'}>
              {isDirty ? 'Cambios sin guardar' : `Guardado ${lastSavedAt ? `· ${fmtTime(lastSavedAt)}` : ''}`}
            </Badge>
            <Tooltip label="Eliminar documento">
              <Button variant="outline" color="red" onClick={eliminarDoc} disabled={disabled}>
                Eliminar
              </Button>
            </Tooltip>
            <Tooltip label="Ctrl/Cmd + S">
              <Button onClick={() => guardar(false)} disabled={disabled}>Guardar</Button>
            </Tooltip>
          </Group>
        </Group>

        <TextInput
          label="Título"
          placeholder="Documento sin título"
          value={titulo}
          onChange={(e) => { setTitulo(e.currentTarget.value); setIsDirty(true); }}
          disabled={loading}
          autoFocus
        />

        <Divider />

        <RichTextEditor editor={editor} style={{ minWidth: '100%' }}>
          <RichTextEditor.Toolbar sticky stickyOffset="var(--docs-header-height)">
            <RichTextEditor.ControlsGroup>
              <RichTextEditor.Bold />
              <RichTextEditor.Italic />
              <RichTextEditor.Underline />
              <RichTextEditor.Strikethrough />
              <RichTextEditor.ClearFormatting />
              <RichTextEditor.Highlight />
              <RichTextEditor.Code />
            </RichTextEditor.ControlsGroup>

            <RichTextEditor.ControlsGroup>
              <RichTextEditor.H1 />
              <RichTextEditor.H2 />
              <RichTextEditor.H3 />
              <RichTextEditor.H4 />
            </RichTextEditor.ControlsGroup>

            <RichTextEditor.ControlsGroup>
              <RichTextEditor.Blockquote />
              <RichTextEditor.Hr />
              <RichTextEditor.BulletList />
              <RichTextEditor.OrderedList />
              <RichTextEditor.Subscript />
              <RichTextEditor.Superscript />
            </RichTextEditor.ControlsGroup>

            <RichTextEditor.ControlsGroup>
              <RichTextEditor.Link />
              <RichTextEditor.Unlink />
            </RichTextEditor.ControlsGroup>

            <RichTextEditor.ControlsGroup>
              <RichTextEditor.AlignLeft />
              <RichTextEditor.AlignCenter />
              <RichTextEditor.AlignJustify />
              <RichTextEditor.AlignRight />
            </RichTextEditor.ControlsGroup>

            <RichTextEditor.ControlsGroup>
              <RichTextEditor.Undo />
              <RichTextEditor.Redo />
            </RichTextEditor.ControlsGroup>
          </RichTextEditor.Toolbar>

          <RichTextEditor.Content />
        </RichTextEditor>
      </Stack>
    </Paper>
  );
}
