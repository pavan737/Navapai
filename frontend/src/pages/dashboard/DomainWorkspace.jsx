import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Lock,
  Globe,
  Users,
  Save,
  Trash2,
  Calendar,
  Sparkles,
  ExternalLink,
  Code,
  FileText,
  Clock,
  Layers,
  GitMerge,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { ProgressBar } from '../../components/common/ProgressBar';
import { LoadingState } from '../../components/feedback/LoadingState';
import { ErrorState } from '../../components/feedback/ErrorState';

export const DomainWorkspace = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [domain, setDomain] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('roadmap');
  const [attachedProjects, setAttachedProjects] = useState([]);

  // Smart Merge State for unlinked custom topics
  const [mergeSuggestion, setMergeSuggestion] = useState(null);
  const [merging, setMerging] = useState(false);
  const [mergeSuccessMsg, setMergeSuccessMsg] = useState(null);

  // Interactive Milestones Checklist
  const [milestones, setMilestones] = useState([
    { id: 1, title: 'Core Fundamentals & Architecture Foundations', completed: true },
    { id: 2, title: 'Enterprise Design Patterns & Module Decoupling', completed: true },
    { id: 3, title: 'Concurrency, Async & Performance Tuning', completed: false },
    { id: 4, title: 'PostgreSQL Database Integration & Index Profiling', completed: false },
    { id: 5, title: 'Production CI/CD Pipelines & Cloud Deployment', completed: false },
  ]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchUserDomain = async () => {
      try {
        const [domainRes, projectsRes] = await Promise.all([
          api.get(`domains/my/${id}/`),
          api.get(`projects/my/?user_domain=${id}`),
        ]);

        setDomain(domainRes.data);
        setAttachedProjects(projectsRes.data.results || projectsRes.data);

        // If unlinked custom topic, detect potential canonical merge candidates
        if (!domainRes.data.community_domain) {
          const simRes = await api.post('domains/similarity/', { query: domainRes.data.original_name });
          if (simRes.data.top_match && simRes.data.top_match.similarity_score >= 0.70) {
            setMergeSuggestion(simRes.data.top_match);
          }
        }
      } catch (err) {
        console.error('Error fetching user domain workspace:', err);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchUserDomain();
    }
  }, [id, isAuthenticated, authLoading, navigate]);

  const toggleMilestone = async (index) => {
    const updated = [...milestones];
    updated[index].completed = !updated[index].completed;
    setMilestones(updated);

    const completedCount = updated.filter((m) => m.completed).length;
    const calcProgress = Math.round((completedCount / updated.length) * 100);

    setDomain({ ...domain, progress: calcProgress });

    try {
      await api.patch(`domains/my/${id}/`, { progress: calcProgress });
    } catch (err) {
      console.error('Failed to sync progress:', err);
    }
  };

  const handleSaveNotes = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    try {
      await api.patch(`domains/my/${id}/`, {
        custom_notes: domain.custom_notes,
        visibility: domain.visibility,
        status: domain.status,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving domain settings:', err);
    } finally {
      setSaving(false);
    }
  };

  const handlePerformMerge = async () => {
    if (!mergeSuggestion) return;
    setMerging(true);
    try {
      const res = await api.post(`domains/my/${id}/merge/`, {
        target_domain_id: mergeSuggestion.domain_id,
        reason: `User merged '${domain.original_name}' with canonical domain '${mergeSuggestion.title}'`,
      });

      setDomain(res.data.user_domain);
      setMergeSuggestion(null);
      setMergeSuccessMsg(res.data.message);
      setTimeout(() => setMergeSuccessMsg(null), 5000);
    } catch (err) {
      console.error('Merge failed:', err);
    } finally {
      setMerging(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to unenroll from this domain? Your personal notes will be removed.')) {
      try {
        await api.delete(`domains/my/${id}/`);
        navigate('/dashboard/domains');
      } catch (err) {
        console.error('Failed to delete user domain:', err);
      }
    }
  };

  if (authLoading || loading) {
    return <LoadingState fullPage message="Loading your domain workspace..." />;
  }

  if (!domain) {
    return (
      <div className="container" style={{ padding: 'var(--spacing-12) 0' }}>
        <ErrorState
          title="Domain Workspace Not Found"
          message="You are not enrolled in this domain or it has been archived."
          onRetry={() => navigate('/dashboard/domains')}
        />
      </div>
    );
  }

  return (
    <div style={{ padding: 'var(--spacing-8) 0 var(--spacing-16)', backgroundColor: 'var(--color-bg-main)' }}>
      <div className="container">
        {/* Back Link */}
        <Link
          to="/dashboard/domains"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--color-text-muted)',
            fontSize: 'var(--font-size-sm)',
            marginBottom: 'var(--spacing-6)',
            fontWeight: 500,
          }}
        >
          <ArrowLeft size={16} /> Back to My Learning Domains
        </Link>

        {/* Merge Success Alert */}
        {mergeSuccessMsg && (
          <div
            style={{
              backgroundColor: 'var(--color-success-subtle)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              color: 'var(--color-success)',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              marginBottom: 'var(--spacing-6)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 600,
            }}
          >
            <CheckCircle2 size={18} />
            <span>{mergeSuccessMsg}</span>
          </div>
        )}

        {/* Smart Merge Proposal Banner for Custom Unlinked Topics */}
        {mergeSuggestion && !domain.community_domain && (
          <div
            style={{
              backgroundColor: 'var(--color-bg-section)',
              border: '1px solid var(--color-border)',
              borderLeft: '4px solid #0082FF',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--spacing-6)',
              marginBottom: 'var(--spacing-6)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 'var(--spacing-4)',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <GitMerge size={18} color="#0082FF" />
                <strong style={{ color: 'var(--color-text-main)', fontSize: 'var(--font-size-base)' }}>
                  Smart Canonical Merge Available ({Math.round(mergeSuggestion.similarity_score * 100)}% Match)
                </strong>
                <Badge variant="brand">{mergeSuggestion.category}</Badge>
              </div>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                Your custom topic <strong>"{domain.original_name}"</strong> matches the verified canonical domain <strong>"{mergeSuggestion.title}"</strong>. Merging links you to standard curriculum while preserving your personal notes and tasks 100% intact.
              </p>
            </div>

            <Button variant="primary" size="sm" icon={GitMerge} loading={merging} onClick={handlePerformMerge}>
              Merge into {mergeSuggestion.title}
            </Button>
          </div>
        )}

        {/* Workspace Banner */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--spacing-8)',
            marginBottom: 'var(--spacing-8)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--spacing-4)', marginBottom: 'var(--spacing-4)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--spacing-2)' }}>
                <Badge variant={domain.joined_via === 'ENROLLED' ? 'brand' : (domain.joined_via === 'MERGED' ? 'success' : 'cyan')}>
                  {domain.joined_via === 'ENROLLED' ? 'Canonical Enrolled' : (domain.joined_via === 'MERGED' ? 'Merged with Canonical' : 'Custom Topic')}
                </Badge>
                <Badge variant="neutral">Status: {domain.status}</Badge>
              </div>
              <h1 style={{ fontSize: 'var(--font-size-3xl)', color: 'var(--color-text-main)' }}>
                {domain.original_name}
              </h1>
            </div>

            <div style={{ display: 'flex', gap: 'var(--spacing-3)', flexWrap: 'wrap' }}>
              <Button
                variant="primary"
                size="sm"
                icon={Sparkles}
                onClick={async () => {
                  try {
                    const res = await api.post('domains/my/plans/', {
                      user_domain: domain.id,
                      title: `${domain.original_name} Structured Roadmap`,
                      auto_populate_topics: true,
                    });
                    navigate(`/dashboard/plans/${res.data.id}`);
                  } catch (err) {
                    console.error('Failed to auto-generate plan:', err);
                  }
                }}
              >
                Track Topics & Roadmap
              </Button>
              {domain.community_domain_details && (
                <Link to={`/domains/${domain.community_domain_details.slug}`}>
                  <Button variant="secondary" size="sm" icon={ExternalLink}>
                    View Public Curriculum
                  </Button>
                </Link>
              )}
              <Button variant="ghost" size="sm" onClick={handleDelete} style={{ color: 'var(--color-error)' }}>
                <Trash2 size={16} />
              </Button>
            </div>
          </div>

          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-base)', maxWidth: '780px', marginBottom: 'var(--spacing-6)' }}>
            {domain.original_description || 'Track milestones, store study notes, and link real-world projects for this domain.'}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-4)', paddingTop: 'var(--spacing-4)', borderTop: '1px solid var(--color-border)' }}>
            <div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                Roadmap Completion ({domain.progress}%)
              </div>
              <ProgressBar progress={domain.progress} color="#0082FF" />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
              <Globe size={16} color="#0082FF" />
              <span>Visibility: <strong>{domain.visibility}</strong></span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
              <Calendar size={16} color="#0082FF" />
              <span>Target: <strong>{domain.target_date || 'Ongoing'}</strong></span>
            </div>
          </div>
        </div>

        {/* Tab Headers */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--color-border)', marginBottom: 'var(--spacing-8)' }}>
          {[
            { id: 'roadmap', label: 'Milestones & Roadmap' },
            { id: 'notes', label: 'Personal Study Notes' },
            { id: 'projects', label: 'Attached Projects' },
            { id: 'settings', label: 'Domain Settings' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '10px 18px',
                fontSize: 'var(--font-size-sm)',
                fontWeight: activeTab === tab.id ? 700 : 500,
                color: activeTab === tab.id ? 'var(--color-primary)' : 'var(--color-text-muted)',
                borderBottom: activeTab === tab.id ? '2px solid var(--color-primary)' : '2px solid transparent',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Milestones */}
        {activeTab === 'roadmap' && (
          <div>
            <div style={{ marginBottom: 'var(--spacing-6)' }}>
              <h3 style={{ fontSize: 'var(--font-size-xl)' }}>Interactive Learning Milestones</h3>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                Check off topics as you master them to update your verified domain progress meter.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
              {milestones.map((milestone, index) => (
                <Card
                  key={milestone.id}
                  hoverable
                  onClick={() => toggleMilestone(index)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    backgroundColor: milestone.completed ? 'var(--color-bg-section)' : '#FFFFFF',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)' }}>
                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        border: milestone.completed ? 'none' : '2px solid var(--color-border)',
                        backgroundColor: milestone.completed ? '#10B981' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFFFFF',
                      }}
                    >
                      {milestone.completed && <CheckCircle2 size={16} />}
                    </div>
                    <span style={{ fontSize: 'var(--font-size-base)', fontWeight: milestone.completed ? 600 : 400, textDecoration: milestone.completed ? 'line-through' : 'none', color: milestone.completed ? 'var(--color-text-muted)' : 'var(--color-text-main)' }}>
                      {milestone.title}
                    </span>
                  </div>

                  <span style={{ fontSize: 'var(--font-size-xs)', color: milestone.completed ? '#10B981' : 'var(--color-text-muted)', fontWeight: 600 }}>
                    {milestone.completed ? 'Completed' : 'Pending'}
                  </span>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Notes */}
        {activeTab === 'notes' && (
          <Card style={{ padding: 'var(--spacing-8)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-4)' }}>
              <div>
                <h3 style={{ fontSize: 'var(--font-size-lg)' }}>Personal Study Notes</h3>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                  Your notes remain 100% private to your account, protected by the core data isolation guarantee.
                </p>
              </div>
              {saveSuccess && (
                <div style={{ color: '#10B981', display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>
                  <CheckCircle2 size={16} /> Saved!
                </div>
              )}
            </div>

            <form onSubmit={handleSaveNotes} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
              <textarea
                rows={10}
                placeholder="Write your personal insights, code snippets, architectural patterns, and links..."
                value={domain.custom_notes || ''}
                onChange={(e) => setDomain({ ...domain, custom_notes: e.target.value })}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  fontFamily: 'monospace',
                  fontSize: 'var(--font-size-sm)',
                  backgroundColor: '#FFFFFF',
                  outline: 'none',
                }}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button type="submit" variant="primary" loading={saving} icon={Save}>
                  Save Notes
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Tab 3: Attached Projects */}
        {activeTab === 'projects' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-6)', flexWrap: 'wrap', gap: 'var(--spacing-3)' }}>
              <div>
                <h3 style={{ fontSize: 'var(--font-size-xl)' }}>Domain Projects</h3>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                  Production repositories and prototypes tagged with {domain.original_name}.
                </p>
              </div>
              <div style={{ display: 'flex', gap: 'var(--spacing-3)' }}>
                <Link to="/dashboard/projects">
                  <Button variant="primary" size="sm" icon={Plus}>Add Domain Project</Button>
                </Link>
                <Link to="/projects">
                  <Button variant="secondary" size="sm" icon={ExternalLink}>Explore Showcase</Button>
                </Link>
              </div>
            </div>

            {attachedProjects.length === 0 ? (
              <Card style={{ textAlign: 'center', padding: 'var(--spacing-8)' }}>
                <Code size={36} color="#0082FF" style={{ marginBottom: 'var(--spacing-2)' }} />
                <h4 style={{ marginBottom: 'var(--spacing-2)' }}>No Projects Linked Yet</h4>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-4)' }}>
                  Tag your production GitHub repositories with {domain.original_name} to build your verified domain portfolio.
                </p>
                <Link to="/dashboard/projects">
                  <Button variant="primary" size="sm" icon={Plus}>Create Project for {domain.original_name}</Button>
                </Link>
              </Card>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--spacing-4)' }}>
                {attachedProjects.map((p) => (
                  <Card key={p.id} hoverable style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-2)' }}>
                      <Badge variant={p.status === 'COMPLETED' ? 'success' : 'brand'}>{p.status}</Badge>
                      {p.github_stars_count > 0 && (
                        <span style={{ fontSize: '11px', fontWeight: 600, color: '#D97706', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          ⭐ {p.github_stars_count.toLocaleString()}
                        </span>
                      )}
                    </div>

                    <h4 style={{ fontSize: 'var(--font-size-base)', marginBottom: '4px' }}>
                      <Link to={`/dashboard/projects/${p.id}`} style={{ color: 'var(--color-text-main)' }}>
                        {p.title}
                      </Link>
                    </h4>

                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', flex: 1, marginBottom: 'var(--spacing-3)', lineHeight: 1.4 }}>
                      {p.tagline || p.description}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 'var(--spacing-2)', borderTop: '1px solid var(--color-border)', fontSize: 'var(--font-size-xs)' }}>
                      <span style={{ color: 'var(--color-text-muted)' }}>{p.primary_language || 'Python'}</span>
                      <Link to={`/dashboard/projects/${p.id}`} style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
                        Manage Workspace →
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Settings */}
        {activeTab === 'settings' && (
          <Card style={{ padding: 'var(--spacing-8)' }}>
            <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-4)' }}>Domain Preferences</h3>

            <form onSubmit={handleSaveNotes} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)', maxWidth: '480px' }}>
              <div>
                <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Visibility
                </label>
                <select
                  value={domain.visibility}
                  onChange={(e) => setDomain({ ...domain, visibility: e.target.value })}
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
                  Status
                </label>
                <select
                  value={domain.status}
                  onChange={(e) => setDomain({ ...domain, status: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: '#FFFFFF',
                    fontSize: 'var(--font-size-sm)',
                  }}
                >
                  <option value="ACTIVE">In Progress / Active</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>

              <div style={{ marginTop: 'var(--spacing-2)' }}>
                <Button type="submit" variant="primary" loading={saving} icon={Save}>
                  Update Settings
                </Button>
              </div>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
};
