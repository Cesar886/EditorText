// Home.jsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Group,
  Loader,
  Paper,
  Stack,
  TextInput,
  Title,
} from '@mantine/core';
import { RichTextEditor, Link } from '@mantine/tiptap';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import Superscript from '@tiptap/extension-superscript';
import SubScript from '@tiptap/extension-subscript';
import TextAlign from '@tiptap/extension-text-align';
import { useNavigate, useSearchParams } from 'react-router-dom';

const LS_KEY = 'docs';

function readDocs() {
  const raw = localStorage.getItem(LS_KEY);
  try {
    const arr = JSON.parse(raw || '[]');
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}
function writeDocs(docs) {
  localStorage.setItem(LS_KEY, JSON.stringify(docs));
}

export default function Home() {
  const navigate = useNavigate();
  const [sp] = useSearchParams();
  const urlId = sp.get('id');

  const [docId, setDocId] = useState(urlId);
  const [titulo, setTitulo] = useState('');
  const [loading, setLoading] = useState(true);

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
  });

  // crear documento si no viene id
  useEffect(() => {
    if (urlId) return;
    const id = crypto.randomUUID();
    const ahora = new Date().toISOString();
    const docs = readDocs();
    let base = 'Documento sin título';
    let titulo = base;
    const setTit = new Set(docs.map((d) => d.titulo));
    for (let i = 2; setTit.has(titulo); i++) titulo = `${base} ${i}`;
    const nuevo = { id, titulo, html: '', createdAt: ahora, updatedAt: ahora };
    writeDocs([...docs, nuevo]);
    setDocId(id);
    navigate(`/home?id=${id}`, { replace: true });
  }, [urlId, navigate]);

  // cargar documento por id
  useEffect(() => {
    if (!docId || !editor) return;
    setLoading(true);
    const docs = readDocs();
    const found = docs.find((d) => d.id === docId);
    if (!found) {
      // si no existe, crearlo y redirigir
      const ahora = new Date().toISOString();
      const nuevo = { id: docId, titulo: 'Documento sin título', html: '', createdAt: ahora, updatedAt: ahora };
      writeDocs([...docs, nuevo]);
      setTitulo(nuevo.titulo);
      editor.commands.setContent(nuevo.html || '');
      setLoading(false);
      return;
    }
    setTitulo(found.titulo || '');
    editor.commands.setContent(found.html || '');
    setLoading(false);
  }, [docId, editor]);

  const disabled = useMemo(() => !editor || loading, [editor, loading]);

  const guardar = () => {
    if (!editor || !docId) return;
    const html = editor.getHTML();
    const ahora = new Date().toISOString();
    const docs = readDocs();
    const idx = docs.findIndex((d) => d.id === docId);
    if (idx === -1) {
      docs.push({ id: docId, titulo: titulo || 'Documento sin título', html, createdAt: ahora, updatedAt: ahora });
    } else {
      docs[idx] = {
        ...docs[idx],
        titulo: titulo || 'Documento sin título',
        html,
        updatedAt: ahora,
      };
    }
    writeDocs(docs);
    navigate('/dashboard'); // redirigir al dashboard
  };

  const eliminar = () => {
    if (!docId) return;
    if (!confirm('¿Eliminar este documento?')) return;
    const docs = readDocs().filter((d) => d.id !== docId);
    writeDocs(docs);
    navigate('/dashboard'); // ajusta si tu ruta es distinta
  };

  if (!editor) {
    return (
      <Group justify="center" mt="xl">
        <Loader />
      </Group>
    );
  }

  return (
    <Paper p="md" radius="lg" withBorder style={{ margin: '20px 12% 0 12%' }}>
      <Stack gap="sm">
        <Group justify="space-between">
          <Title order={3} style={{ color: '#0E4C84' }}>
            Editor
          </Title>
          <Group gap="xs">
            <Button variant="outline" color="red" onClick={eliminar} disabled={disabled}>
              Eliminar
            </Button>
            <Button onClick={guardar} disabled={disabled}>
              Guardar
            </Button>
          </Group>
        </Group>

        <TextInput
          label="Título"
          placeholder="Documento sin título"
          value={titulo}
          onChange={(e) => setTitulo(e.currentTarget.value)}
          disabled={loading}
        />

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
