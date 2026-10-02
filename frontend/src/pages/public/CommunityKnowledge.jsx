import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  ThumbsUp,
  Search,
  BookOpen,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Globe,
  Tag,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { LoadingState } from '../../components/feedback/LoadingState';

export const CommunityKnowledge = () => {
  const { isAuthenticated, user } = useAuth();

  const [contributions, setContributions] = useState([]);
  const [moderationQueue, setModerationQueue] = useState([]);
  const [activeTab, setActiveTab] = useState('PUBLIC'); // 'PUBLIC' or 'MODERATION'
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [upvotingId, setUpvotingId] = useState(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'GUIDE',
  });

  const isStaffOrAdmin = user && (user.is_staff || user.role === 'ADMIN' || user.role === 'MENTOR');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await api.get('community/');
        setContributions(Array.isArray(res.data) ? res.data : (res.data.results || []));

        if (isStaffOrAdmin) {
          const modRes = await api.get('community/moderation/');
          setModerationQueue(Array.isArray(modRes.data) ? modRes.data : (modRes.data.results || []));
        }
      } catch (err) {
        console.error('Failed to load community knowledge:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isStaffOrAdmin]);

  // Upvote Toggle
  const handleToggleUpvote = async (id) => {
    if (!isAuthenticated) {
      alert('Please sign in to upvote community contributions!');
      return;
    }
    setUpvotingId(id);
    try {
      const res = await api.post(`community/${id}/upvote/`);
      setContributions((prev) =>
        prev.map((c) =>
          c.id === id
            ? { ...c, has_upvoted: res.data.has_upvoted, upvotes_count: res.data.upvotes_count }
            : c
        )
      );
    } catch (err) {
      console.error('Failed to upvote:', err);
    } finally {
      setUpvotingId(null);
    }
  };

  // Submit Contribution
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.post('community/my/', formData);
      setContributions([res.data, ...contributions]);
      setShowModal(false);
      setFormData({ title: '', content: '', category: 'GUIDE' });
    } catch (err) {
      console.error('Failed to submit contribution:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Review Contribution
  const handleReview = async (id, newStatus) => {
    try {
      const res = await api.post(`community/moderation/${id}/review/`, {
        status: newStatus,
        review_notes: `Reviewed as ${newStatus} by @${user?.username}`,
      });

      setModerationQueue((prev) => prev.map((c) => (c.id === id ? res.data.contribution : c)));

      // Refresh public list
      const publicRes = await api.get('community/');
      setContributions(Array.isArray(publicRes.data) ? publicRes.data : (publicRes.data.results || []));
    } catch (err) {
      console.error('Failed to review contribution:', err);
    }
  };

  const categories = ['All', 'GUIDE', 'BLUEPRINT', 'INTERVIEW_PREP', 'BEST_PRACTICES', 'BUG_FIX'];

  const filteredContributions = contributions.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.content.toLowerCase().includes(search.toLowerCase()) ||
      (c.author_username && c.author_username.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ padding: 'var(--spacing-10) 0 var(--spacing-16)', backgroundColor: 'var(--color-bg-main)', minHeight: 'calc(100vh - 120px)' }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--spacing-4)', marginBottom: 'var(--spacing-8)' }}>
          <div>
            <Badge variant="brand" style={{ marginBottom: 'var(--spacing-2)' }}>Phase 13: Community Knowledge Hub</Badge>
            <h1 style={{ fontSize: 'var(--font-size-3xl)' }}>Developer Community Knowledge & Blueprints</h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-base)' }}>
              Peer-reviewed technical guides, production architecture blueprints, interview Q&A, and troubleshooting patterns.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 'var(--spacing-3)' }}>
            {isStaffOrAdmin && (
              <Button
                variant={activeTab === 'MODERATION' ? 'primary' : 'outline'}
                icon={ShieldAlert}
                onClick={() => setActiveTab(activeTab === 'PUBLIC' ? 'MODERATION' : 'PUBLIC')}
              >
                Moderation Queue ({moderationQueue.filter((m) => m.status === 'PENDING').length})
              </Button>
            )}

            <Button variant="primary" icon={Plus} onClick={() => setShowModal(true)}>
              Submit Contribution
            </Button>
          </div>
        </div>

        {activeTab === 'PUBLIC' ? (
          <>
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
              <div style={{ marginBottom: 'var(--spacing-4)' }}>
                <Input
                  placeholder="Search community guides by title, content, or author..."
                  icon={Search}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto' }}>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: 'var(--font-size-xs)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: '1px solid',
                      backgroundColor: selectedCategory === cat ? 'var(--color-primary)' : '#FFFFFF',
                      color: selectedCategory === cat ? '#FFFFFF' : 'var(--color-text-muted)',
                      borderColor: selectedCategory === cat ? 'var(--color-primary)' : 'var(--color-border)',
                    }}
                  >
                    {cat === 'All' ? 'All Categories' : cat.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Contributions List */}
            {loading ? (
              <LoadingState message="Fetching community knowledge guides..." />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
                {filteredContributions.map((item) => (
                  <Card key={item.id} style={{ padding: 'var(--spacing-6)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--spacing-3)', marginBottom: 'var(--spacing-3)' }}>
                      <div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                          <Badge variant="brand">{item.category.replace('_', ' ')}</Badge>
                          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                            Shared by <strong>@{item.author_username}</strong>
                          </span>
                        </div>
                        <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700 }}>{item.title}</h2>
                      </div>

                      {/* Upvote Button */}
                      <button
                        onClick={() => handleToggleUpvote(item.id)}
                        disabled={upvotingId === item.id}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '8px 16px',
                          borderRadius: 'var(--radius-full)',
                          border: '1px solid',
                          borderColor: item.has_upvoted ? 'var(--color-primary)' : 'var(--color-border)',
                          backgroundColor: item.has_upvoted ? 'var(--color-primary)' : '#FFFFFF',
                          color: item.has_upvoted ? '#FFFFFF' : 'var(--color-text-main)',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        <ThumbsUp size={16} fill={item.has_upvoted ? '#FFFFFF' : 'none'} />
                        <span>{item.upvotes_count} Upvotes</span>
                      </button>
                    </div>

                    <p style={{ fontSize: 'var(--font-size-sm)', lineHeight: 1.6, color: 'var(--color-text-muted)', whiteSpace: 'pre-wrap', margin: 0 }}>
                      {item.content}
                    </p>
                  </Card>
                ))}
              </div>
            )}
          </>
        ) : (
          /* Moderation Queue Tab */
          <div>
            <h2 style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 'var(--spacing-6)' }}>Staff & Mentor Moderation Queue</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
              {moderationQueue.map((item) => (
                <Card key={item.id} style={{ borderLeft: `4px solid ${item.status === 'APPROVED' ? '#10B981' : (item.status === 'PENDING' ? '#F59E0B' : '#EF4444')}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                    <div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                        <Badge variant={item.status === 'APPROVED' ? 'success' : (item.status === 'PENDING' ? 'brand' : 'error')}>
                          {item.status}
                        </Badge>
                        <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>By @{item.author_username}</span>
                      </div>
                      <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700 }}>{item.title}</h3>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Button variant="outline" size="sm" icon={CheckCircle2} onClick={() => handleReview(item.id, 'APPROVED')}>
                        Approve
                      </Button>
                      <Button variant="secondary" size="sm" icon={XCircle} onClick={() => handleReview(item.id, 'REJECTED')}>
                        Reject
                      </Button>
                    </div>
                  </div>

                  <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', whiteSpace: 'pre-wrap', lineHeight: 1.5, marginBottom: '8px' }}>
                    {item.content}
                  </p>

                  {item.review_notes && (
                    <div style={{ fontSize: '12px', italic: 'true', color: 'var(--color-text-muted)', backgroundColor: 'var(--color-bg-section)', padding: '6px 10px', borderRadius: 'var(--radius-sm)' }}>
                      Moderator Note: {item.review_notes}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Submit Modal */}
        {showModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(17, 24, 39, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '16px' }}>
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-8)', width: '100%', maxWidth: '600px', boxShadow: 'var(--shadow-xl)' }}>
              <h3 style={{ fontSize: 'var(--font-size-xl)', marginBottom: 'var(--spacing-4)' }}>Submit Technical Contribution</h3>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
                <Input label="Title" required placeholder="e.g. Production PostgreSQL Connection Pooling Blueprint" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                <div>
                  <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Category</label>
                  <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', backgroundColor: '#FFFFFF', fontSize: 'var(--font-size-sm)' }}>
                    <option value="GUIDE">Technical Guide / Tutorial</option>
                    <option value="BLUEPRINT">Architecture Blueprint</option>
                    <option value="INTERVIEW_PREP">Interview Prep & Q&A</option>
                    <option value="BEST_PRACTICES">Production Best Practices</option>
                    <option value="BUG_FIX">Troubleshooting & Bug Fix</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>Markdown Content</label>
                  <textarea rows={6} required placeholder="Write detailed guide or architecture blueprint..." value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontFamily: 'inherit', fontSize: 'var(--font-size-sm)' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-3)' }}>
                  <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                  <Button type="submit" variant="primary" loading={submitting}>Publish Contribution</Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
