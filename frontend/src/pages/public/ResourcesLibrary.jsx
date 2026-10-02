import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  ExternalLink,
  Search,
  FileText,
  Video,
  Bookmark,
  BookmarkCheck,
  Globe,
  Code,
  Layers,
  Sparkles,
  Award,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { LoadingState } from '../../components/feedback/LoadingState';

const getResourceIcon = (type) => {
  switch (type) {
    case 'VIDEO': return Video;
    case 'DOCUMENTATION': return Globe;
    case 'GITHUB_REPO': return Code;
    case 'COURSE': return Award;
    default: return BookOpen;
  }
};

export const ResourcesLibrary = () => {
  const { isAuthenticated } = useAuth();
  const [resources, setResources] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [bookmarkingId, setBookmarkingId] = useState(null);

  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true);
      try {
        const [res, statsRes] = await Promise.all([
          api.get('resources/'),
          api.get('resources/stats/'),
        ]);

        const data = Array.isArray(res.data) ? res.data : (res.data.results || []);
        setResources(data);

        if (statsRes.data?.categories) {
          setCategories(['All', ...statsRes.data.categories]);
        }
      } catch (err) {
        console.error('Error fetching resources:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, []);

  const handleToggleBookmark = async (resourceId) => {
    if (!isAuthenticated) {
      alert('Please sign in to save learning resources to your personal bookmarks!');
      return;
    }

    setBookmarkingId(resourceId);
    try {
      const res = await api.post('resources/toggle-bookmark/', { resource_id: resourceId });
      const isBookmarked = res.data.is_bookmarked;

      setResources((prev) =>
        prev.map((r) => (r.id === resourceId ? { ...r, is_bookmarked: isBookmarked } : r))
      );
    } catch (err) {
      console.error('Error toggling bookmark:', err);
    } finally {
      setBookmarkingId(null);
    }
  };

  const types = ['All', 'DOCUMENTATION', 'COURSE', 'GITHUB_REPO', 'ARTICLE', 'VIDEO', 'TOOL'];

  const filtered = resources.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase()) ||
      (r.author_or_creator && r.author_or_creator.toLowerCase().includes(search.toLowerCase())) ||
      r.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || r.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesType = selectedType === 'All' || r.resource_type === selectedType;
    return matchesSearch && matchesCategory && matchesType;
  });

  return (
    <div style={{ padding: 'var(--spacing-10) 0 var(--spacing-16)', backgroundColor: 'var(--color-bg-main)', minHeight: 'calc(100vh - 120px)' }}>
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-10)' }}>
          <Badge variant="brand" style={{ marginBottom: 'var(--spacing-2)' }}>Curated Knowledge Base</Badge>
          <h1 style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--spacing-2)' }}>Developer Learning Resources & Guides</h1>
          <p style={{ maxWidth: '640px', margin: '0 auto', fontSize: 'var(--font-size-base)', color: 'var(--color-text-muted)' }}>
            Curated official documentation, interactive tutorials, GitHub repositories, system design primers, and architecture blueprints.
          </p>
        </div>

        {/* Filter Bar */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--spacing-6)',
            marginBottom: 'var(--spacing-8)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', gap: 'var(--spacing-4)', flexWrap: 'wrap', alignItems: 'center', marginBottom: 'var(--spacing-4)' }}>
            <div style={{ flex: 1, minWidth: '280px' }}>
              <Input
                placeholder="Search resources by title, topic, author, or keyword..."
                icon={Search}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: 'var(--spacing-3)' }}>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: '#FFFFFF',
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: 600,
                }}
              >
                {types.map((t) => (
                  <option key={t} value={t}>{t === 'All' ? 'All Formats' : t.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  border: '1px solid',
                  backgroundColor: selectedCategory === cat ? 'var(--color-primary)' : '#FFFFFF',
                  color: selectedCategory === cat ? '#FFFFFF' : 'var(--color-text-muted)',
                  borderColor: selectedCategory === cat ? 'var(--color-primary)' : 'var(--color-border)',
                  transition: 'all var(--transition-fast)',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <LoadingState message="Fetching learning resources..." />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 'var(--spacing-6)' }}>
            {filtered.map((item) => {
              const IconComp = getResourceIcon(item.resource_type);
              const isBookmarked = item.is_bookmarked;

              return (
                <Card key={item.id} hoverable style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-3)' }}>
                      <Badge variant="brand" icon={IconComp}>{item.resource_type.replace('_', ' ')}</Badge>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Badge variant="neutral">{item.difficulty}</Badge>

                        <button
                          onClick={() => handleToggleBookmark(item.id)}
                          disabled={bookmarkingId === item.id}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: isBookmarked ? '#0082FF' : 'var(--color-text-muted)',
                            padding: '4px',
                          }}
                          title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Resource'}
                        >
                          {isBookmarked ? <BookmarkCheck size={20} fill="#0082FF" /> : <Bookmark size={20} />}
                        </button>
                      </div>
                    </div>

                    <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, marginBottom: 'var(--spacing-2)', color: 'var(--color-text-main)', lineHeight: 1.3 }}>
                      {item.title}
                    </h3>

                    {item.author_or_creator && (
                      <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-primary)', marginBottom: '8px' }}>
                        By {item.author_or_creator}
                      </div>
                    )}

                    <p style={{ fontSize: 'var(--font-size-sm)', flex: 1, marginBottom: 'var(--spacing-4)', lineHeight: 1.5, color: 'var(--color-text-muted)' }}>
                      {item.description}
                    </p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 'var(--spacing-3)', borderTop: '1px solid var(--color-border)', fontSize: 'var(--font-size-xs)' }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>
                      Category: <strong style={{ color: 'var(--color-text-main)' }}>{item.category}</strong>
                    </span>

                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontWeight: 700,
                        color: 'var(--color-primary)',
                        textDecoration: 'none',
                      }}
                    >
                      Open Link <ExternalLink size={13} />
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
