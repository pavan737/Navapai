import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Plus,
  Pin,
  Search,
  Tag,
  Code,
  Globe,
  Lock,
  Trash2,
  Edit,
  Copy,
  Check,
  Sparkles,
  Layers,
  Eye,
  BookOpen,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { LoadingState } from '../../components/feedback/LoadingState';
import { EmptyState } from '../../components/feedback/EmptyState';

export const DeveloperNotes = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [notes, setNotes] = useState([]);
  const [stats, setStats] = useState(null);
  const [userDomains, setUserDomains] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('ALL');
  const [selectedTag, setSelectedTag] = useState('ALL');

  // Copy feedback tracking
  const [copiedNoteId, setCopiedNoteId] = useState(null);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Live preview tab inside modal
  const [modalTab, setModalTab] = useState('WRITE'); // 'WRITE' or 'PREVIEW'

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    code_snippet: '',
    programming_language: 'python',
    tags: '',
    is_pinned: false,
    is_public: false,
    user_domain: '',
    project: '',
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const [notesRes, statsRes, domainsRes, projectsRes] = await Promise.all([
          api.get('notes/my/'),
          api.get('notes/stats/'),
          api.get('domains/my/'),
          api.get('projects/my/'),
        ]);

        setNotes(notesRes.data.results || notesRes.data);
        setStats(statsRes.data);
        setUserDomains(domainsRes.data.results || domainsRes.data);
        setProjects(projectsRes.data.results || projectsRes.data);
      } catch (err) {
        console.error('Failed to load notes data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Copy code snippet to clipboard
  const handleCopyCode = (noteId, snippet) => {
    if (!snippet) return;
    navigator.clipboard.writeText(snippet);
    setCopiedNoteId(noteId);
    setTimeout(() => setCopiedNoteId(null), 2000);
  };

  // Toggle Pin Status
  const handleTogglePin = async (noteId) => {
    try {
      const res = await api.post(`notes/my/${noteId}/pin/`);
      const updated = res.data.note;
      setNotes((prev) => prev.map((n) => (n.id === noteId ? updated : n)));
      const statsRes = await api.get('notes/stats/');
      setStats(statsRes.data);
    } catch (err) {
      console.error('Failed to toggle pin:', err);
    }
  };

  // Delete Note
  const handleDeleteNote = async (noteId) => {
    if (window.confirm('Are you sure you want to delete this developer note?')) {
      try {
        await api.delete(`notes/my/${noteId}/`);
        setNotes((prev) => prev.filter((n) => n.id !== noteId));
        const statsRes = await api.get('notes/stats/');
        setStats(statsRes.data);
      } catch (err) {
        console.error('Failed to delete note:', err);
      }
    }
  };

  // Create / Edit Submit
  const handleSubmitNote = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        user_domain: formData.user_domain ? parseInt(formData.user_domain) : null,
        project: formData.project ? parseInt(formData.project) : null,
      };

      if (editingNote) {
        const res = await api.patch(`notes/my/${editingNote.id}/`, payload);
        setNotes((prev) => prev.map((n) => (n.id === editingNote.id ? res.data : n)));
      } else {
        const res = await api.post('notes/my/', payload);
        setNotes((prev) => [res.data, ...prev]);
      }

      const statsRes = await api.get('notes/stats/');
      setStats(statsRes.data);
      setShowModal(false);
      setEditingNote(null);
      setFormData({
        title: '',
        content: '',
        code_snippet: '',
        programming_language: 'python',
        tags: '',
        is_pinned: false,
        is_public: false,
        user_domain: '',
        project: '',
      });
    } catch (err) {
      console.error('Failed to save note:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Open edit modal
  const handleOpenEdit = (note) => {
    setEditingNote(note);
    setFormData({
      title: note.title,
      content: note.content || '',
      code_snippet: note.code_snippet || '',
      programming_language: note.programming_language || 'python',
      tags: note.tags || '',
      is_pinned: note.is_pinned || false,
      is_public: note.is_public || false,
      user_domain: note.user_domain || '',
      project: note.project || '',
    });
    setModalTab('WRITE');
    setShowModal(true);
  };

  // Extract all unique tags
  const allTags = Array.from(
    new Set(notes.flatMap((n) => n.tag_list || []))
  );

  // Filter notes
  const filteredNotes = notes.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase()) ||
      n.tags.toLowerCase().includes(search.toLowerCase());
    const matchesLang = selectedLanguage === 'ALL' || n.programming_language.toLowerCase() === selectedLanguage.toLowerCase();
    const matchesTag = selectedTag === 'ALL' || (n.tag_list && n.tag_list.includes(selectedTag));
    return matchesSearch && matchesLang && matchesTag;
  });

  if (authLoading || loading) {
    return <LoadingState fullPage message="Loading developer notes & knowledge base..." />;
  }

  return (
    <div style={{ padding: 'var(--spacing-8) 0 var(--spacing-16)', backgroundColor: 'var(--color-bg-main)', minHeight: 'calc(100vh - 120px)' }}>
      <div className="container">
        {/* Page Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--spacing-4)', marginBottom: 'var(--spacing-8)' }}>
          <div>
            <Badge variant="brand" style={{ marginBottom: 'var(--spacing-2)' }}>Phase 9: Developer Knowledge Base</Badge>
            <h1 style={{ fontSize: 'var(--font-size-3xl)' }}>Notes & Code Snippets</h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-base)' }}>
              Capture technical architecture notes, code snippets, cheat sheets, and system commands.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 'var(--spacing-3)' }}>
            <Button
              variant="primary"
              icon={Plus}
              onClick={() => {
                setEditingNote(null);
                setFormData({
                  title: '',
                  content: '',
                  code_snippet: '',
                  programming_language: 'python',
                  tags: '',
                  is_pinned: false,
                  is_public: false,
                  user_domain: '',
                  project: '',
                });
                setModalTab('WRITE');
                setShowModal(true);
              }}
            >
              New Developer Note
            </Button>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--spacing-6)',
            marginBottom: 'var(--spacing-8)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 'var(--spacing-4)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Total Notes</div>
            <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800 }}>{stats?.total_notes || 0}</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#F59E0B', fontWeight: 600 }}>Pinned Snippets</div>
            <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: '#F59E0B' }}>{stats?.pinned_notes || 0}</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#10B981', fontWeight: 600 }}>Public Community Notes</div>
            <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: '#10B981' }}>{stats?.public_notes || 0}</div>
          </div>
        </div>

        {/* Filter Bar */}
        <div
          style={{
            backgroundColor: 'var(--color-bg-section)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--spacing-4) var(--spacing-6)',
            marginBottom: 'var(--spacing-6)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 'var(--spacing-4)',
          }}
        >
          <div style={{ flex: 1, minWidth: '260px' }}>
            <Input
              placeholder="Search notes by title, code, or tag..."
              icon={Search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: 'var(--spacing-3)', flexWrap: 'wrap' }}>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                backgroundColor: '#FFFFFF',
                fontSize: 'var(--font-size-xs)',
                fontWeight: 600,
              }}
            >
              <option value="ALL">All Languages</option>
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="sql">SQL</option>
              <option value="bash">Bash / Shell</option>
              <option value="dockerfile">Dockerfile</option>
              <option value="yaml">YAML</option>
              <option value="json">JSON</option>
              <option value="markdown">Markdown</option>
            </select>

            {allTags.length > 0 && (
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: '#FFFFFF',
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: 600,
                }}
              >
                <option value="ALL">All Tags</option>
                {allTags.map((tag) => (
                  <option key={tag} value={tag}>#{tag}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Notes Grid */}
        {filteredNotes.length === 0 ? (
          <EmptyState
            title="No Developer Notes Found"
            description="Create technical cheat sheets, code snippets, or architecture notes to build your personal developer knowledge base."
            actionLabel="Create Note"
            onAction={() => {
              setEditingNote(null);
              setFormData({
                title: '',
                content: '',
                code_snippet: '',
                programming_language: 'python',
                tags: '',
                is_pinned: false,
                is_public: false,
                user_domain: '',
                project: '',
              });
              setModalTab('WRITE');
              setShowModal(true);
            }}
          />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 'var(--spacing-6)' }}>
            {filteredNotes.map((note) => (
              <Card
                key={note.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justify: 'space-between',
                  borderTop: note.is_pinned ? '4px solid #F59E0B' : '1px solid var(--color-border)',
                }}
              >
                <div>
                  {/* Title & Pin / Lock badges */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--spacing-2)', marginBottom: 'var(--spacing-3)' }}>
                    <div>
                      <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, marginBottom: '4px' }}>
                        {note.title}
                      </h3>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <Badge variant="brand">{note.programming_language}</Badge>
                        {note.is_public ? (
                          <span style={{ fontSize: '11px', color: '#10B981', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            <Globe size={11} /> Public
                          </span>
                        ) : (
                          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            <Lock size={11} /> Private
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleTogglePin(note.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: note.is_pinned ? '#F59E0B' : 'var(--color-text-muted)',
                        padding: '4px',
                      }}
                      title={note.is_pinned ? 'Unpin Note' : 'Pin Note'}
                    >
                      <Pin size={18} fill={note.is_pinned ? '#F59E0B' : 'none'} />
                    </button>
                  </div>

                  {/* Content Preview */}
                  <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-4)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                    {note.content}
                  </p>

                  {/* Code Snippet Container */}
                  {note.code_snippet && (
                    <div style={{ position: 'relative', marginBottom: 'var(--spacing-4)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1E293B', color: '#94A3B8', padding: '6px 12px', borderTopLeftRadius: 'var(--radius-md)', borderTopRightRadius: 'var(--radius-md)', fontSize: '11px', fontFamily: 'monospace' }}>
                        <span>{note.programming_language.toUpperCase()}</span>
                        <button
                          type="button"
                          onClick={() => handleCopyCode(note.id, note.code_snippet)}
                          style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}
                        >
                          {copiedNoteId === note.id ? <Check size={12} color="#10B981" /> : <Copy size={12} />}
                          {copiedNoteId === note.id ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                      <pre
                        style={{
                          backgroundColor: '#0F172A',
                          color: '#E2E8F0',
                          padding: '12px',
                          borderBottomLeftRadius: 'var(--radius-md)',
                          borderBottomRightRadius: 'var(--radius-md)',
                          fontSize: '12px',
                          fontFamily: 'monospace',
                          overflowX: 'auto',
                          margin: 0,
                        }}
                      >
                        <code>{note.code_snippet}</code>
                      </pre>
                    </div>
                  )}

                  {/* Tags & Domain/Project badges */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: 'var(--spacing-4)' }}>
                    {note.tag_list && note.tag_list.map((tag) => (
                      <span key={tag} style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-primary)', backgroundColor: 'var(--color-bg-section)', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
                        #{tag}
                      </span>
                    ))}

                    {note.user_domain_name && (
                      <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-primary)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <Layers size={11} /> {note.user_domain_name}
                      </span>
                    )}

                    {note.project_title && (
                      <span style={{ fontSize: '11px', fontWeight: 600, color: '#10B981', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <Code size={11} /> {note.project_title}
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer Action buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: 'var(--spacing-3)', borderTop: '1px solid var(--color-border)' }}>
                  <Button variant="ghost" size="sm" icon={Edit} onClick={() => handleOpenEdit(note)}>
                    Edit
                  </Button>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    style={{ color: 'var(--color-error)', cursor: 'pointer', padding: '6px', border: 'none', background: 'none' }}
                    title="Delete Note"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Create / Edit Note Modal */}
        {showModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(17, 24, 39, 0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 100,
              padding: 'var(--spacing-4)',
            }}
          >
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--spacing-8)',
                width: '100%',
                maxWidth: '680px',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: 'var(--shadow-xl)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BookOpen size={22} color="#0082FF" />
                  <h3 style={{ fontSize: 'var(--font-size-xl)' }}>
                    {editingNote ? 'Edit Developer Note' : 'Create Developer Note'}
                  </h3>
                </div>
                <button onClick={() => setShowModal(false)} style={{ fontSize: '18px', color: 'var(--color-text-muted)', cursor: 'pointer', background: 'none', border: 'none' }}>✕</button>
              </div>

              {/* Write vs Preview Tabs */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: 'var(--spacing-4)', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
                <button
                  type="button"
                  onClick={() => setModalTab('WRITE')}
                  style={{
                    padding: '6px 16px',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    backgroundColor: modalTab === 'WRITE' ? 'var(--color-primary)' : 'transparent',
                    color: modalTab === 'WRITE' ? '#FFFFFF' : 'var(--color-text-muted)',
                    fontWeight: 600,
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  Write Note
                </button>
                <button
                  type="button"
                  onClick={() => setModalTab('PREVIEW')}
                  style={{
                    padding: '6px 16px',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    backgroundColor: modalTab === 'PREVIEW' ? 'var(--color-primary)' : 'transparent',
                    color: modalTab === 'PREVIEW' ? '#FFFFFF' : 'var(--color-text-muted)',
                    fontWeight: 600,
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  Preview Note
                </button>
              </div>

              <form onSubmit={handleSubmitNote} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
                {modalTab === 'WRITE' ? (
                  <>
                    <Input
                      label="Note Title"
                      required
                      placeholder="e.g. PostgreSQL Trigram Search Optimization"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-3)' }}>
                      <div>
                        <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Programming Language</label>
                        <select
                          value={formData.programming_language}
                          onChange={(e) => setFormData({ ...formData, programming_language: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--color-border)',
                            fontSize: 'var(--font-size-sm)',
                            backgroundColor: '#FFFFFF',
                          }}
                        >
                          <option value="python">Python</option>
                          <option value="javascript">JavaScript</option>
                          <option value="typescript">TypeScript</option>
                          <option value="sql">SQL</option>
                          <option value="bash">Bash / Shell</option>
                          <option value="dockerfile">Dockerfile</option>
                          <option value="yaml">YAML / Config</option>
                          <option value="json">JSON</option>
                          <option value="markdown">Markdown</option>
                          <option value="plaintext">Plain Text</option>
                        </select>
                      </div>

                      <Input
                        label="Tags (Comma-separated)"
                        placeholder="jwt, postgres, auth"
                        value={formData.tags}
                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>Markdown Content / Notes</label>
                      <textarea
                        rows={4}
                        placeholder="Write detailed technical notes, commands, architecture details..."
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--color-border)',
                          fontFamily: 'inherit',
                          fontSize: 'var(--font-size-sm)',
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>Code Snippet (Optional)</label>
                      <textarea
                        rows={5}
                        placeholder="Paste raw code snippet here..."
                        value={formData.code_snippet}
                        onChange={(e) => setFormData({ ...formData, code_snippet: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--color-border)',
                          fontFamily: 'monospace',
                          fontSize: '12px',
                          backgroundColor: '#0F172A',
                          color: '#E2E8F0',
                        }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-3)' }}>
                      <div>
                        <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Link to User Domain</label>
                        <select
                          value={formData.user_domain}
                          onChange={(e) => setFormData({ ...formData, user_domain: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--color-border)',
                            fontSize: 'var(--font-size-sm)',
                            backgroundColor: '#FFFFFF',
                          }}
                        >
                          <option value="">None (Independent)</option>
                          {userDomains.map((ud) => (
                            <option key={ud.id} value={ud.id}>{ud.original_name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Link to Project</label>
                        <select
                          value={formData.project}
                          onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--color-border)',
                            fontSize: 'var(--font-size-sm)',
                            backgroundColor: '#FFFFFF',
                          }}
                        >
                          <option value="">None (Independent)</option>
                          {projects.map((p) => (
                            <option key={p.id} value={p.id}>{p.title}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 'var(--spacing-6)', alignItems: 'center' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--font-size-sm)', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={formData.is_pinned}
                          onChange={(e) => setFormData({ ...formData, is_pinned: e.target.checked })}
                        />
                        Pin to Top
                      </label>

                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--font-size-sm)', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={formData.is_public}
                          onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                        />
                        Make Public in Knowledge Base
                      </label>
                    </div>
                  </>
                ) : (
                  <div style={{ minHeight: '260px', padding: '16px', backgroundColor: 'var(--color-bg-section)', borderRadius: 'var(--radius-md)' }}>
                    <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, marginBottom: '8px' }}>{formData.title || 'Untitled Note'}</h3>
                    <p style={{ fontSize: 'var(--font-size-sm)', whiteSpace: 'pre-wrap', lineHeight: 1.6, marginBottom: '16px' }}>
                      {formData.content || 'No Markdown content written yet.'}
                    </p>
                    {formData.code_snippet && (
                      <pre style={{ backgroundColor: '#0F172A', color: '#E2E8F0', padding: '12px', borderRadius: 'var(--radius-md)', fontSize: '12px', fontFamily: 'monospace' }}>
                        <code>{formData.code_snippet}</code>
                      </pre>
                    )}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-3)', marginTop: 'var(--spacing-2)' }}>
                  <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" loading={submitting}>
                    Save Developer Note
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
