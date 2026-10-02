import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Layers,
  Plus,
  BookOpen,
  ArrowRight,
  Sparkles,
  Calendar,
  Lock,
  Globe,
  Users,
  CheckCircle2,
  Clock,
  Search,
  ExternalLink,
  GitMerge,
  HelpCircle,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { ProgressBar } from '../../components/common/ProgressBar';
import { LoadingState } from '../../components/feedback/LoadingState';
import { EmptyState } from '../../components/feedback/EmptyState';

export const MyDomains = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [userDomains, setUserDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);

  // Form State
  const [newTopic, setNewTopic] = useState({
    original_name: '',
    original_description: '',
    visibility: 'COMMUNITY',
    target_date: '',
    custom_notes: '',
    community_domain: null,
  });

  // Similarity Engine State
  const [similarityResult, setSimilarityResult] = useState(null);
  const [checkingSimilarity, setCheckingSimilarity] = useState(false);
  const [linkToCanonical, setLinkToCanonical] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchMyDomains = async () => {
      try {
        const res = await api.get('domains/my/');
        setUserDomains(res.data.results || res.data);
      } catch (err) {
        console.error('Failed to load user domains:', err);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchMyDomains();
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Real-time Trigram Similarity Detection
  useEffect(() => {
    if (!newTopic.original_name || newTopic.original_name.trim().length < 2) {
      setSimilarityResult(null);
      setCheckingSimilarity(false);
      return;
    }

    setCheckingSimilarity(true);
    const debounce = setTimeout(async () => {
      try {
        const res = await api.post('domains/similarity/', {
          query: newTopic.original_name.trim(),
        });
        setSimilarityResult(res.data);
        if (res.data.top_match && res.data.top_match.similarity_score >= 0.70) {
          setLinkToCanonical(true);
          setNewTopic((prev) => ({ ...prev, community_domain: res.data.top_match.domain_id }));
        } else {
          setNewTopic((prev) => ({ ...prev, community_domain: null }));
        }
      } catch (err) {
        console.error('Similarity check failed:', err);
      } finally {
        setCheckingSimilarity(false);
      }
    }, 200);

    return () => clearTimeout(debounce);
  }, [newTopic.original_name]);

  const handleCreateTopic = async (e) => {
    e.preventDefault();
    if (!newTopic.original_name.trim()) return;

    setCreating(true);
    try {
      const payload = {
        ...newTopic,
        target_date: newTopic.target_date || null,
        community_domain: linkToCanonical && similarityResult?.top_match ? similarityResult.top_match.domain_id : null,
      };

      const res = await api.post('domains/my/', payload);
      setUserDomains([res.data, ...userDomains]);
      setShowModal(false);
      setNewTopic({
        original_name: '',
        original_description: '',
        visibility: 'COMMUNITY',
        target_date: '',
        custom_notes: '',
        community_domain: null,
      });
      setSimilarityResult(null);
      navigate(`/dashboard/domains/${res.data.id}`);
    } catch (err) {
      console.error('Error creating custom topic:', err);
    } finally {
      setCreating(false);
    }
  };

  const filteredDomains = userDomains.filter((d) =>
    d.original_name.toLowerCase().includes(search.toLowerCase()) ||
    (d.community_domain_details?.title && d.community_domain_details.title.toLowerCase().includes(search.toLowerCase()))
  );

  if (authLoading || loading) {
    return <LoadingState fullPage message="Loading your personal learning domains..." />;
  }

  return (
    <div style={{ padding: 'var(--spacing-10) 0 var(--spacing-16)', backgroundColor: 'var(--color-bg-main)' }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--spacing-4)', marginBottom: 'var(--spacing-8)' }}>
          <div>
            <Badge variant="brand" style={{ marginBottom: 'var(--spacing-2)' }}>Personal Workspace</Badge>
            <h1 style={{ fontSize: 'var(--font-size-3xl)' }}>My Learning Domains</h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-base)' }}>
              Manage your enrolled curriculum, track roadmaps, and build verified domain portfolios.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 'var(--spacing-3)' }}>
            <Link to="/domains">
              <Button variant="secondary" icon={BookOpen}>
                Explore Canonical Domains
              </Button>
            </Link>
            <Button variant="primary" icon={Plus} onClick={() => setShowModal(true)}>
              New Custom Topic
            </Button>
          </div>
        </div>

        {/* Search & Counter */}
        {userDomains.length > 0 && (
          <div style={{ marginBottom: 'var(--spacing-6)', display: 'flex', gap: 'var(--spacing-4)', alignItems: 'center' }}>
            <div style={{ flex: 1, maxWidth: '400px' }}>
              <Input
                placeholder="Search your enrolled domains..."
                icon={Search}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontWeight: 600 }}>
              {filteredDomains.length} Enrolled
            </span>
          </div>
        )}

        {/* Empty State */}
        {userDomains.length === 0 ? (
          <EmptyState
            title="No Learning Domains Enrolled Yet"
            description="Enroll in a verified canonical cloud domain (e.g. AWS, Python, Kubernetes) or create your own custom topic to start tracking your curriculum."
            actionLabel="Explore Canonical Domains"
            onAction={() => navigate('/domains')}
          />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 'var(--spacing-6)' }}>
            {filteredDomains.map((ud) => (
              <Card key={ud.id} hoverable style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-3)' }}>
                  <Badge variant={ud.joined_via === 'ENROLLED' ? 'brand' : (ud.joined_via === 'MERGED' ? 'success' : 'cyan')}>
                    {ud.joined_via === 'ENROLLED' ? 'Canonical Enrolled' : (ud.joined_via === 'MERGED' ? 'Merged Topic' : 'Custom Topic')}
                  </Badge>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--color-text-muted)' }}>
                    {ud.visibility === 'PRIVATE' && <Lock size={12} />}
                    {ud.visibility === 'COMMUNITY' && <Users size={12} />}
                    {ud.visibility === 'PUBLIC' && <Globe size={12} />}
                    <span>{ud.visibility}</span>
                  </div>
                </div>

                <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-2)' }}>
                  <Link to={`/dashboard/domains/${ud.id}`} style={{ color: 'var(--color-text-main)' }}>
                    {ud.original_name}
                  </Link>
                </h3>

                {ud.community_domain_details && (
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-3)' }}>
                    Canonical Link: <strong style={{ color: 'var(--color-primary)' }}>{ud.community_domain_details.title}</strong>
                  </div>
                )}

                <p style={{ fontSize: 'var(--font-size-sm)', flex: 1, color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-4)', lineHeight: 1.5 }}>
                  {ud.original_description || 'Track your notes, weekly tasks, and project implementations for this domain.'}
                </p>

                <div style={{ marginBottom: 'var(--spacing-4)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-xs)', marginBottom: '4px', fontWeight: 600 }}>
                    <span>Progress</span>
                    <span>{ud.progress}%</span>
                  </div>
                  <ProgressBar progress={ud.progress} color="#0082FF" />
                </div>

                <div
                  style={{
                    paddingTop: 'var(--spacing-3)',
                    borderTop: '1px solid var(--color-border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: 'var(--font-size-xs)',
                  }}
                >
                  <span style={{ color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} /> Status: <strong>{ud.status}</strong>
                  </span>
                  <Link
                    to={`/dashboard/domains/${ud.id}`}
                    style={{
                      color: 'var(--color-primary)',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    Open Workspace <ArrowRight size={12} />
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Create Topic Modal with Real-Time Similarity Matching */}
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
                maxWidth: '560px',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: 'var(--shadow-xl)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={20} color="#0082FF" />
                  <h3 style={{ fontSize: 'var(--font-size-xl)' }}>Create Learning Topic</h3>
                </div>
                <button onClick={() => { setShowModal(false); setSimilarityResult(null); }} style={{ fontSize: '18px', color: 'var(--color-text-muted)', cursor: 'pointer' }}>✕</button>
              </div>

              <form onSubmit={handleCreateTopic} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
                <div>
                  <Input
                    label="Topic Name"
                    required
                    placeholder="e.g. Python Development, Cloud DevOps, Rust Web"
                    value={newTopic.original_name}
                    onChange={(e) => setNewTopic({ ...newTopic, original_name: e.target.value })}
                  />
                  {checkingSimilarity && (
                    <div style={{ fontSize: '11px', color: 'var(--color-primary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <div className="spinner" style={{ width: '10px', height: '10px', borderWidth: '1.5px', borderTopColor: '#0082FF' }} />
                      <span>Checking similarity against PostgreSQL canonical registry...</span>
                    </div>
                  )}
                </div>

                {/* Similarity Match Banner */}
                {similarityResult?.top_match && (
                  <div
                    style={{
                      backgroundColor: 'var(--color-bg-section)',
                      border: '1px solid var(--color-border)',
                      borderLeft: '4px solid #0082FF',
                      borderRadius: 'var(--radius-md)',
                      padding: '12px 14px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <GitMerge size={14} />
                        <span>Canonical Domain Detected ({Math.round(similarityResult.top_match.similarity_score * 100)}% Match)</span>
                      </div>
                      <Badge variant="brand">{similarityResult.top_match.category}</Badge>
                    </div>

                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
                      We found canonical curriculum for <strong>{similarityResult.top_match.title}</strong> ({similarityResult.top_match.topics_count} vetted topics). Linking will connect your roadmap while keeping your personal notes 100% private.
                    </p>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--font-size-xs)', cursor: 'pointer', fontWeight: 600 }}>
                        <input
                          type="radio"
                          name="mergeChoice"
                          checked={linkToCanonical}
                          onChange={() => setLinkToCanonical(true)}
                        />
                        <span>Link to {similarityResult.top_match.title} (Recommended)</span>
                      </label>

                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--font-size-xs)', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
                        <input
                          type="radio"
                          name="mergeChoice"
                          checked={!linkToCanonical}
                          onChange={() => setLinkToCanonical(false)}
                        />
                        <span>Keep Unlinked</span>
                      </label>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>Description</label>
                  <textarea
                    rows={3}
                    placeholder="What are your goals in this learning topic?"
                    value={newTopic.original_description}
                    onChange={(e) => setNewTopic({ ...newTopic, original_description: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border)',
                      fontFamily: 'inherit',
                      fontSize: 'var(--font-size-sm)',
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-3)' }}>
                  <div>
                    <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                      Visibility
                    </label>
                    <select
                      value={newTopic.visibility}
                      onChange={(e) => setNewTopic({ ...newTopic, visibility: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--color-border)',
                        backgroundColor: '#FFFFFF',
                        fontSize: 'var(--font-size-sm)',
                      }}
                    >
                      <option value="PRIVATE">Private (Only Me)</option>
                      <option value="COMMUNITY">Community</option>
                      <option value="PUBLIC">Public on Portfolio</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                      Target Completion Date
                    </label>
                    <input
                      type="date"
                      value={newTopic.target_date}
                      onChange={(e) => setNewTopic({ ...newTopic, target_date: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--color-border)',
                        fontSize: 'var(--font-size-sm)',
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-3)', marginTop: 'var(--spacing-2)' }}>
                  <Button type="button" variant="secondary" onClick={() => { setShowModal(false); setSimilarityResult(null); }}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" loading={creating}>
                    Create Topic
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
