import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  Search,
  Star,
  Trash2,
  BookOpen,
  Globe,
  Code,
  Award,
  Edit2,
  Sparkles,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { LoadingState } from '../../components/feedback/LoadingState';
import { EmptyState } from '../../components/feedback/EmptyState';

const getResourceIcon = (type) => {
  switch (type) {
    case 'DOCUMENTATION': return Globe;
    case 'GITHUB_REPO': return Code;
    case 'COURSE': return Award;
    default: return BookOpen;
  }
};

export const MyBookmarks = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [favoriteFilter, setFavoriteFilter] = useState('ALL');

  // Edit personal notes state
  const [editingNotesId, setEditingNotesId] = useState(null);
  const [notesInput, setNotesInput] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchBookmarks = async () => {
      setLoading(true);
      try {
        const res = await api.get('resources/bookmarks/');
        const data = Array.isArray(res.data) ? res.data : (res.data.results || []);
        setBookmarks(data);
      } catch (err) {
        console.error('Failed to load bookmarks:', err);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchBookmarks();
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Remove Bookmark
  const handleRemoveBookmark = async (bookmarkId) => {
    try {
      await api.delete(`resources/bookmarks/${bookmarkId}/`);
      setBookmarks((prev) => prev.filter((b) => b.id !== bookmarkId));
    } catch (err) {
      console.error('Failed to remove bookmark:', err);
    }
  };

  // Toggle Favorite Status
  const handleToggleFavorite = async (bookmark) => {
    try {
      const res = await api.patch(`resources/bookmarks/${bookmark.id}/`, {
        is_favorite: !bookmark.is_favorite,
      });
      setBookmarks((prev) => prev.map((b) => (b.id === bookmark.id ? res.data : b)));
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  };

  // Save Personal Notes
  const handleSavePersonalNotes = async (bookmarkId) => {
    try {
      const res = await api.patch(`resources/bookmarks/${bookmarkId}/`, {
        personal_notes: notesInput,
      });
      setBookmarks((prev) => prev.map((b) => (b.id === bookmarkId ? res.data : b)));
      setEditingNotesId(null);
      setNotesInput('');
    } catch (err) {
      console.error('Failed to save personal notes:', err);
    }
  };

  // Filter Bookmarks
  const filteredBookmarks = bookmarks.filter((b) => {
    const resTitle = b.resource?.title || '';
    const resDesc = b.resource?.description || '';
    const notesText = b.personal_notes || '';
    const matchesSearch =
      resTitle.toLowerCase().includes(search.toLowerCase()) ||
      resDesc.toLowerCase().includes(search.toLowerCase()) ||
      notesText.toLowerCase().includes(search.toLowerCase());

    const matchesFav = favoriteFilter === 'ALL' || (favoriteFilter === 'FAVORITES' && b.is_favorite);
    return matchesSearch && matchesFav;
  });

  if (authLoading || loading) {
    return <LoadingState fullPage message="Loading saved bookmarks..." />;
  }

  return (
    <div style={{ padding: 'var(--spacing-8) 0 var(--spacing-16)', backgroundColor: 'var(--color-bg-main)', minHeight: 'calc(100vh - 120px)' }}>
      <div className="container">
        {/* Page Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--spacing-4)', marginBottom: 'var(--spacing-8)' }}>
          <div>
            <Badge variant="brand" style={{ marginBottom: 'var(--spacing-2)' }}>Phase 10: Saved Bookmarks</Badge>
            <h1 style={{ fontSize: 'var(--font-size-3xl)' }}>My Bookmarks & Learning Saved Items</h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-base)' }}>
              Quick access to your saved documentation, tutorials, courses, and personal study notes.
            </p>
          </div>

          <Link to="/resources">
            <Button variant="outline" icon={BookOpen}>
              Explore Resources Directory
            </Button>
          </Link>
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
              placeholder="Search saved bookmarks or notes..."
              icon={Search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setFavoriteFilter('ALL')}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                fontSize: 'var(--font-size-xs)',
                fontWeight: 600,
                cursor: 'pointer',
                border: '1px solid',
                backgroundColor: favoriteFilter === 'ALL' ? 'var(--color-primary)' : '#FFFFFF',
                color: favoriteFilter === 'ALL' ? '#FFFFFF' : 'var(--color-text-muted)',
                borderColor: favoriteFilter === 'ALL' ? 'var(--color-primary)' : 'var(--color-border)',
              }}
            >
              All Bookmarks ({bookmarks.length})
            </button>

            <button
              onClick={() => setFavoriteFilter('FAVORITES')}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                fontSize: 'var(--font-size-xs)',
                fontWeight: 600,
                cursor: 'pointer',
                border: '1px solid',
                backgroundColor: favoriteFilter === 'FAVORITES' ? '#F59E0B' : '#FFFFFF',
                color: favoriteFilter === 'FAVORITES' ? '#FFFFFF' : 'var(--color-text-muted)',
                borderColor: favoriteFilter === 'FAVORITES' ? '#F59E0B' : 'var(--color-border)',
              }}
            >
              ★ Favorites ({bookmarks.filter((b) => b.is_favorite).length})
            </button>
          </div>
        </div>

        {/* Bookmarks Grid */}
        {filteredBookmarks.length === 0 ? (
          <EmptyState
            title="No Bookmarks Saved Yet"
            description="Explore our curated learning resources library and click the bookmark button to save guides, courses, and documentation here."
            actionLabel="Browse Resources"
            onAction={() => navigate('/resources')}
          />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 'var(--spacing-6)' }}>
            {filteredBookmarks.map((b) => {
              const res = b.resource || {};
              const IconComp = getResourceIcon(res.resource_type);
              const isEditingNotes = editingNotesId === b.id;

              return (
                <Card key={b.id} style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-3)' }}>
                      <Badge variant="brand" icon={IconComp}>{res.resource_type ? res.resource_type.replace('_', ' ') : 'Resource'}</Badge>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          onClick={() => handleToggleFavorite(b)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: b.is_favorite ? '#F59E0B' : 'var(--color-text-muted)', padding: '4px' }}
                          title={b.is_favorite ? 'Remove Favorite' : 'Mark Favorite'}
                        >
                          <Star size={18} fill={b.is_favorite ? '#F59E0B' : 'none'} />
                        </button>

                        <button
                          onClick={() => handleRemoveBookmark(b.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-error)', padding: '4px' }}
                          title="Remove Bookmark"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, marginBottom: '4px', color: 'var(--color-text-main)', lineHeight: 1.3 }}>
                      {res.title}
                    </h3>

                    {res.author_or_creator && (
                      <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-primary)', marginBottom: '8px' }}>
                        By {res.author_or_creator}
                      </div>
                    )}

                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-4)', lineHeight: 1.4 }}>
                      {res.description}
                    </p>

                    {/* Personal Notes Section */}
                    <div style={{ backgroundColor: 'var(--color-bg-section)', padding: '10px 12px', borderRadius: 'var(--radius-md)', marginBottom: 'var(--spacing-4)', border: '1px solid var(--color-border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-main)' }}>Personal Study Notes</span>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingNotesId(isEditingNotes ? null : b.id);
                            setNotesInput(b.personal_notes || '');
                          }}
                          style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontSize: '11px', fontWeight: 600 }}
                        >
                          {isEditingNotes ? 'Cancel' : (b.personal_notes ? 'Edit Notes' : '+ Add Note')}
                        </button>
                      </div>

                      {isEditingNotes ? (
                        <div style={{ marginTop: '6px' }}>
                          <textarea
                            rows={2}
                            value={notesInput}
                            onChange={(e) => setNotesInput(e.target.value)}
                            placeholder="Add study takeaways or key concepts..."
                            style={{ width: '100%', padding: '6px', fontSize: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', fontFamily: 'inherit' }}
                          />
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '6px' }}>
                            <Button size="sm" variant="primary" onClick={() => handleSavePersonalNotes(b.id)}>
                              Save Note
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p style={{ fontSize: '12px', color: b.personal_notes ? 'var(--color-text-main)' : 'var(--color-text-muted)', italic: !b.personal_notes, margin: 0 }}>
                          {b.personal_notes || 'No personal study notes added yet.'}
                        </p>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 'var(--spacing-3)', borderTop: '1px solid var(--color-border)', fontSize: 'var(--font-size-xs)' }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>
                      Category: <strong style={{ color: 'var(--color-text-main)' }}>{res.category}</strong>
                    </span>

                    <a
                      href={res.url}
                      target="_blank"
                      rel="noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 700, color: 'var(--color-primary)', textDecoration: 'none' }}
                    >
                      Open Guide <ExternalLink size={13} />
                    </a>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
