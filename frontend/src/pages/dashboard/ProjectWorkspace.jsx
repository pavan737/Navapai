import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ExternalLink,
  Star,
  GitFork,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Trash2,
  Save,
  Code,
  Globe,
  Lock,
  Layers,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { GithubIcon as Github } from '../../components/common/Icons';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { LoadingState } from '../../components/feedback/LoadingState';
import { ErrorState } from '../../components/feedback/ErrorState';

export const ProjectWorkspace = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(null);

  const [technologiesInput, setTechnologiesInput] = useState('');
  const [screenshots, setScreenshots] = useState([]);
  const [newScreenshotUrl, setNewScreenshotUrl] = useState('');
  const [newScreenshotCaption, setNewScreenshotCaption] = useState('');
  const [addingScreenshot, setAddingScreenshot] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchProject = async () => {
      try {
        const res = await api.get(`projects/my/${id}/`);
        setProject(res.data);
        setTechnologiesInput(res.data.technologies?.join(', ') || '');
        setScreenshots(res.data.screenshots || []);
      } catch (err) {
        console.error('Failed to load project workspace:', err);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchProject();
    }
  }, [id, isAuthenticated, authLoading, navigate]);

  const handleAddScreenshot = async (e) => {
    e.preventDefault();
    if (!newScreenshotUrl.trim()) return;
    setAddingScreenshot(true);
    try {
      const res = await api.post(`projects/my/${id}/screenshots/`, {
        image_url: newScreenshotUrl.trim(),
        caption: newScreenshotCaption.trim(),
      });
      setScreenshots((prev) => [...prev, res.data]);
      setNewScreenshotUrl('');
      setNewScreenshotCaption('');
    } catch (err) {
      console.error('Failed to add screenshot:', err);
    } finally {
      setAddingScreenshot(false);
    }
  };

  const handleSyncGitHub = async () => {
    setSyncing(true);
    setSyncSuccessMsg(null);
    try {
      const res = await api.post(`projects/my/${id}/sync-github/`);
      setProject(res.data.project);
      setTechnologiesInput(res.data.project.technologies?.join(', ') || '');
      setSyncSuccessMsg(res.data.message);
      setTimeout(() => setSyncSuccessMsg(null), 5000);
    } catch (err) {
      console.error('GitHub sync failed:', err);
    } finally {
      setSyncing(false);
    }
  };

  const handleSaveDetails = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccessMsg(null);
    try {
      const techList = technologiesInput
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const payload = {
        title: project.title,
        tagline: project.tagline,
        description: project.description,
        github_url: project.github_url,
        live_demo_url: project.live_demo_url,
        primary_language: project.primary_language,
        status: project.status,
        visibility: project.visibility,
        technologies: techList,
      };

      const res = await api.patch(`projects/my/${id}/`, payload);
      setProject(res.data);
      setSaveSuccessMsg('Project updated successfully!');
      setTimeout(() => setSaveSuccessMsg(null), 4000);
    } catch (err) {
      console.error('Failed to save project:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this project from your portfolio?')) {
      try {
        await api.delete(`projects/my/${id}/`);
        navigate('/dashboard/projects');
      } catch (err) {
        console.error('Failed to delete project:', err);
      }
    }
  };

  if (authLoading || loading) {
    return <LoadingState fullPage message="Loading project workspace..." />;
  }

  if (!project) {
    return (
      <div className="container" style={{ padding: 'var(--spacing-12) 0' }}>
        <ErrorState
          title="Project Not Found"
          message="This project does not exist or has been removed."
          onRetry={() => navigate('/dashboard/projects')}
        />
      </div>
    );
  }

  return (
    <div style={{ padding: 'var(--spacing-8) 0 var(--spacing-16)', backgroundColor: 'var(--color-bg-main)' }}>
      <div className="container">
        {/* Back Link */}
        <Link
          to="/dashboard/projects"
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
          <ArrowLeft size={16} /> Back to My Projects
        </Link>

        {/* Sync Alert */}
        {syncSuccessMsg && (
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
            <span>{syncSuccessMsg}</span>
          </div>
        )}

        {/* Project Header Banner */}
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
                <Badge variant={project.status === 'COMPLETED' ? 'success' : 'brand'}>
                  {project.status}
                </Badge>
                {project.community_domain_title && (
                  <Badge variant="cyan">{project.community_domain_title}</Badge>
                )}
                {project.visibility === 'PUBLIC' && (
                  <Badge variant="neutral">Public on Portfolio</Badge>
                )}
              </div>
              <h1 style={{ fontSize: 'var(--font-size-3xl)', color: 'var(--color-text-main)' }}>
                {project.title}
              </h1>
            </div>

            <div style={{ display: 'flex', gap: 'var(--spacing-3)', flexWrap: 'wrap' }}>
              {project.github_url && (
                <Button
                  variant="secondary"
                  size="sm"
                  icon={RefreshCw}
                  loading={syncing}
                  onClick={handleSyncGitHub}
                >
                  Sync GitHub
                </Button>
              )}
              {project.github_url && (
                <a href={project.github_url} target="_blank" rel="noreferrer">
                  <Button variant="outline" size="sm" icon={Github}>
                    Repository
                  </Button>
                </a>
              )}
              {project.live_demo_url && (
                <a href={project.live_demo_url} target="_blank" rel="noreferrer">
                  <Button variant="primary" size="sm" icon={ExternalLink}>
                    Live Demo
                  </Button>
                </a>
              )}
              <Button variant="ghost" size="sm" onClick={handleDelete} style={{ color: 'var(--color-error)' }}>
                <Trash2 size={16} />
              </Button>
            </div>
          </div>

          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-base)', maxWidth: '800px', marginBottom: 'var(--spacing-6)' }}>
            {project.tagline || project.description}
          </p>

          {/* GitHub Stats Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--spacing-4)', paddingTop: 'var(--spacing-4)', borderTop: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Star size={18} color="#D97706" />
              <div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>GitHub Stars</div>
                <div style={{ fontWeight: 700, fontSize: '14px' }}>{project.github_stars_count.toLocaleString()}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <GitFork size={18} color="#0082FF" />
              <div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Forks</div>
                <div style={{ fontWeight: 700, fontSize: '14px' }}>{project.github_forks_count.toLocaleString()}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Code size={18} color="#10B981" />
              <div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Primary Language</div>
                <div style={{ fontWeight: 700, fontSize: '14px' }}>{project.primary_language || 'Python'}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={18} color="#6B7280" />
              <div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Last Synced</div>
                <div style={{ fontWeight: 600, fontSize: '12px' }}>
                  {project.github_last_synced_at ? new Date(project.github_last_synced_at).toLocaleDateString() : 'Manual'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Project Edit & Architecture Settings */}
        <Card style={{ padding: 'var(--spacing-8)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-6)' }}>
            <div>
              <h2 style={{ fontSize: 'var(--font-size-xl)' }}>Architecture & Metadata</h2>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                Update your application specifications, live endpoints, and tech stack tags.
              </p>
            </div>
            {saveSuccessMsg && (
              <span style={{ color: '#10B981', fontSize: 'var(--font-size-sm)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={16} /> {saveSuccessMsg}
              </span>
            )}
          </div>

          <form onSubmit={handleSaveDetails} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-4)' }}>
              <Input
                label="Project Title"
                required
                value={project.title}
                onChange={(e) => setProject({ ...project, title: e.target.value })}
              />

              <Input
                label="Primary Language"
                value={project.primary_language}
                onChange={(e) => setProject({ ...project, primary_language: e.target.value })}
              />
            </div>

            <Input
              label="One-Line Tagline"
              value={project.tagline || ''}
              onChange={(e) => setProject({ ...project, tagline: e.target.value })}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>Architecture Description & Highlights</label>
              <textarea
                rows={4}
                value={project.description || ''}
                onChange={(e) => setProject({ ...project, description: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  fontFamily: 'inherit',
                  fontSize: 'var(--font-size-sm)',
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-4)' }}>
              <Input
                label="GitHub Repository URL"
                type="url"
                value={project.github_url || ''}
                onChange={(e) => setProject({ ...project, github_url: e.target.value })}
              />

              <Input
                label="Live Deployment / Demo URL"
                type="url"
                value={project.live_demo_url || ''}
                onChange={(e) => setProject({ ...project, live_demo_url: e.target.value })}
              />
            </div>

            <Input
              label="Technologies & Frameworks (comma separated)"
              value={technologiesInput}
              onChange={(e) => setTechnologiesInput(e.target.value)}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-4)' }}>
              <div>
                <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Project Status
                </label>
                <select
                  value={project.status}
                  onChange={(e) => setProject({ ...project, status: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: '#FFFFFF',
                    fontSize: 'var(--font-size-sm)',
                  }}
                >
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="MAINTENANCE">Maintenance</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Visibility
                </label>
                <select
                  value={project.visibility}
                  onChange={(e) => setProject({ ...project, visibility: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: '#FFFFFF',
                    fontSize: 'var(--font-size-sm)',
                  }}
                >
                  <option value="PUBLIC">Public on Portfolio</option>
                  <option value="COMMUNITY">Community Developers</option>
                  <option value="PRIVATE">Private (Only Me)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--spacing-4)' }}>
              <Button type="submit" variant="primary" loading={saving} icon={Save}>
                Save Project Changes
              </Button>
            </div>
          </form>
        </Card>

        {/* Project Screenshots & Architecture Diagrams Section */}
        <Card style={{ padding: 'var(--spacing-8)', marginTop: 'var(--spacing-8)' }}>
          <div style={{ marginBottom: 'var(--spacing-6)' }}>
            <h2 style={{ fontSize: 'var(--font-size-xl)', marginBottom: '4px' }}>Screenshots & Architecture Diagrams</h2>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
              Attach system diagrams, UI mockups, and architectural schematics for this project.
            </p>
          </div>

          {/* Add Screenshot Form */}
          <form onSubmit={handleAddScreenshot} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)', marginBottom: 'var(--spacing-6)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--spacing-3)' }}>
              <Input
                placeholder="Image URL (e.g. https://raw.githubusercontent.com/.../architecture.png)"
                value={newScreenshotUrl}
                onChange={(e) => setNewScreenshotUrl(e.target.value)}
              />
              <Input
                placeholder="Caption (e.g. Microservices Topology)"
                value={newScreenshotCaption}
                onChange={(e) => setNewScreenshotCaption(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button type="submit" variant="secondary" size="sm" loading={addingScreenshot} icon={Sparkles}>
                Attach Diagram / Screenshot
              </Button>
            </div>
          </form>

          {/* Gallery Grid */}
          {screenshots.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--spacing-6) 0', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
              No architecture diagrams or screenshots attached yet.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 'var(--spacing-4)' }}>
              {screenshots.map((screen) => (
                <div
                  key={screen.id}
                  style={{
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    backgroundColor: 'var(--color-bg-section)',
                  }}
                >
                  <img
                    src={screen.image_url}
                    alt={screen.caption || 'Project Architecture'}
                    style={{ width: '100%', height: '160px', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/400x200?text=Architecture+Diagram';
                    }}
                  />
                  {screen.caption && (
                    <div style={{ padding: '8px 12px', fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-text-main)' }}>
                      {screen.caption}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

