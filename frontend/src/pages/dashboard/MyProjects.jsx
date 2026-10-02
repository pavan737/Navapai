import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Code,
  Plus,
  ExternalLink,
  Star,
  GitFork,
  ArrowRight,
  Sparkles,
  Layers,
  Search,
  Lock,
  Globe,
  Users,
  RefreshCw,
  Tag,
  CheckCircle2,
} from 'lucide-react';
import { GithubIcon as Github } from '../../components/common/Icons';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { LoadingState } from '../../components/feedback/LoadingState';
import { EmptyState } from '../../components/feedback/EmptyState';

export const MyProjects = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [userDomains, setUserDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importUsername, setImportUsername] = useState('');
  const [userRepos, setUserRepos] = useState([]);
  const [fetchingUserRepos, setFetchingUserRepos] = useState(false);
  const [importingRepoId, setImportingRepoId] = useState(null);

  const [creating, setCreating] = useState(false);
  const [fetchingGitHub, setFetchingGitHub] = useState(false);
  const [fetchSuccess, setFetchSuccess] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    tagline: '',
    description: '',
    github_url: '',
    live_demo_url: '',
    primary_language: 'Python',
    technologies_str: 'Django, React, PostgreSQL',
    user_domain: '',
    status: 'IN_PROGRESS',
    visibility: 'PUBLIC',
    is_featured: false,
    auto_sync_github: true,
  });

  const handleFetchUserRepos = async (uname) => {
    const targetUser = uname || importUsername;
    setFetchingUserRepos(true);
    try {
      const res = await api.get(`projects/github/user-repos/?username=${targetUser || ''}`);
      setUserRepos(res.data.repositories || []);
      if (res.data.username) {
        setImportUsername(res.data.username);
      }
    } catch (err) {
      console.error('Failed to fetch user GitHub repos:', err);
    } finally {
      setFetchingUserRepos(false);
    }
  };

  const handleImportSingleRepo = async (repo) => {
    setImportingRepoId(repo.id);
    try {
      const payload = {
        title: repo.name.replace(/-/g, ' ').replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
        tagline: repo.description ? repo.description.slice(0, 150) : `Repository for ${repo.name}`,
        description: repo.description || `Production repository ${repo.full_name}`,
        github_url: repo.html_url,
        primary_language: repo.primary_language || 'Python',
        technologies: repo.topics && repo.topics.length > 0
          ? repo.topics.map((t) => t.charAt(0).toUpperCase() + t.slice(1))
          : [repo.primary_language || 'Python'],
        visibility: 'PUBLIC',
        status: 'IN_PROGRESS',
        auto_sync_github: true,
      };

      const res = await api.post('projects/my/', payload);
      setProjects((prev) => [res.data, ...prev]);
      setUserRepos((prev) => prev.filter((r) => r.id !== repo.id));
    } catch (err) {
      console.error('Failed to import repo:', err);
    } finally {
      setImportingRepoId(null);
    }
  };


  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const [projectsRes, domainsRes] = await Promise.all([
          api.get('projects/my/'),
          api.get('domains/my/'),
        ]);
        setProjects(projectsRes.data.results || projectsRes.data);
        setUserDomains(domainsRes.data.results || domainsRes.data);
      } catch (err) {
        console.error('Failed to load projects:', err);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleFetchGitHubMetadata = async () => {
    if (!formData.github_url.trim()) return;
    setFetchingGitHub(true);
    setFetchSuccess(false);

    try {
      const res = await api.post('projects/github/preview/', {
        github_url: formData.github_url.trim(),
      });

      const data = res.data;
      setFormData((prev) => ({
        ...prev,
        title: prev.title || data.title || '',
        tagline: prev.tagline || data.description?.slice(0, 150) || '',
        description: prev.description || data.description || '',
        primary_language: data.primary_language || prev.primary_language,
        technologies_str: data.topics && data.topics.length > 0
          ? data.topics.map((t) => t.charAt(0).toUpperCase() + t.slice(1)).join(', ')
          : prev.technologies_str,
      }));
      setFetchSuccess(true);
      setTimeout(() => setFetchSuccess(false), 4000);
    } catch (err) {
      console.error('GitHub fetch preview failed:', err);
    } finally {
      setFetchingGitHub(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setCreating(true);
    try {
      const techList = formData.technologies_str
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const payload = {
        ...formData,
        technologies: techList,
        user_domain: formData.user_domain ? parseInt(formData.user_domain) : null,
      };

      const res = await api.post('projects/my/', payload);
      setProjects([res.data, ...projects]);
      setShowModal(false);
      setFormData({
        title: '',
        tagline: '',
        description: '',
        github_url: '',
        live_demo_url: '',
        primary_language: 'Python',
        technologies_str: 'Django, React, PostgreSQL',
        user_domain: '',
        status: 'IN_PROGRESS',
        visibility: 'PUBLIC',
        is_featured: false,
        auto_sync_github: true,
      });
      navigate(`/dashboard/projects/${res.data.id}`);
    } catch (err) {
      console.error('Failed to create project:', err);
    } finally {
      setCreating(false);
    }
  };

  const filteredProjects = projects.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.tagline.toLowerCase().includes(search.toLowerCase()) ||
    (p.primary_language && p.primary_language.toLowerCase().includes(search.toLowerCase())) ||
    (p.technologies && p.technologies.some((t) => t.toLowerCase().includes(search.toLowerCase())))
  );

  if (authLoading || loading) {
    return <LoadingState fullPage message="Loading your developer portfolio projects..." />;
  }

  return (
    <div style={{ padding: 'var(--spacing-10) 0 var(--spacing-16)', backgroundColor: 'var(--color-bg-main)' }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--spacing-4)', marginBottom: 'var(--spacing-8)' }}>
          <div>
            <Badge variant="brand" style={{ marginBottom: 'var(--spacing-2)' }}>GitHub & Portfolio Showcase</Badge>
            <h1 style={{ fontSize: 'var(--font-size-3xl)' }}>My Projects</h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-base)' }}>
              Manage production repositories, sync real-time GitHub stars & stats, and attach code to your learning domains.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 'var(--spacing-3)', flexWrap: 'wrap' }}>
            <Link to="/projects">
              <Button variant="secondary" icon={Globe}>
                Explore Public Showcase
              </Button>
            </Link>
            <Button
              variant="outline"
              icon={Github}
              onClick={() => {
                setShowImportModal(true);
                handleFetchUserRepos();
              }}
            >
              Import from GitHub
            </Button>
            <Button variant="primary" icon={Plus} onClick={() => setShowModal(true)}>
              New Project
            </Button>
          </div>

        </div>

        {/* Search Bar */}
        {projects.length > 0 && (
          <div style={{ marginBottom: 'var(--spacing-6)', display: 'flex', gap: 'var(--spacing-4)', alignItems: 'center' }}>
            <div style={{ flex: 1, maxWidth: '400px' }}>
              <Input
                placeholder="Search projects by title, language or tech stack..."
                icon={Search}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontWeight: 600 }}>
              {filteredProjects.length} Projects
            </span>
          </div>
        )}

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <EmptyState
            title="No Projects Added Yet"
            description="Add your production repositories or prototypes and link them to your learning domains to build your verified developer portfolio."
            actionLabel="Add First Project"
            onAction={() => setShowModal(true)}
          />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 'var(--spacing-6)' }}>
            {filteredProjects.map((project) => (
              <Card key={project.id} hoverable style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                {/* Header Metadata */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-3)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Badge variant={project.status === 'COMPLETED' ? 'success' : 'brand'}>
                      {project.status}
                    </Badge>
                    {project.community_domain_title && (
                      <Badge variant="cyan">{project.community_domain_title}</Badge>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--color-text-muted)' }}>
                    {project.visibility === 'PRIVATE' && <Lock size={12} />}
                    {project.visibility === 'COMMUNITY' && <Users size={12} />}
                    {project.visibility === 'PUBLIC' && <Globe size={12} />}
                    <span>{project.visibility}</span>
                  </div>
                </div>

                <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-2)' }}>
                  <Link to={`/dashboard/projects/${project.id}`} style={{ color: 'var(--color-text-main)' }}>
                    {project.title}
                  </Link>
                </h3>

                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', flex: 1, marginBottom: 'var(--spacing-4)', lineHeight: 1.5 }}>
                  {project.tagline || project.description || 'Production-grade software application and architecture prototype.'}
                </p>

                {/* Tech Pills */}
                {project.technologies && project.technologies.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: 'var(--spacing-4)' }}>
                    {project.technologies.slice(0, 4).map((tech, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          backgroundColor: 'var(--color-bg-section)',
                          color: 'var(--color-text-main)',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--color-border)',
                        }}
                      >
                        {tech}
                      </span>
                    ))}
                    {project.technologies.length > 4 && (
                      <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', alignSelf: 'center' }}>
                        +{project.technologies.length - 4}
                      </span>
                    )}
                  </div>
                )}

                {/* GitHub & Live Stats Row */}
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--color-text-muted)' }}>
                    {project.github_stars_count > 0 && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600, color: '#D97706' }}>
                        <Star size={13} /> {project.github_stars_count.toLocaleString()}
                      </span>
                    )}
                    {project.primary_language && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Code size={12} /> {project.primary_language}
                      </span>
                    )}
                  </div>

                  <Link
                    to={`/dashboard/projects/${project.id}`}
                    style={{
                      color: 'var(--color-primary)',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    Manage Workspace <ArrowRight size={12} />
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Create Project Modal with 1-Click GitHub Metadata Auto-Fetch */}
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
                  <Github size={20} color="#0082FF" />
                  <h3 style={{ fontSize: 'var(--font-size-xl)' }}>Add Portfolio Project</h3>
                </div>
                <button onClick={() => setShowModal(false)} style={{ fontSize: '18px', color: 'var(--color-text-muted)', cursor: 'pointer' }}>✕</button>
              </div>

              {/* GitHub Auto-Fetch Banner */}
              <div
                style={{
                  backgroundColor: 'var(--color-bg-section)',
                  border: '1px solid var(--color-border)',
                  borderLeft: '4px solid #0082FF',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 14px',
                  marginBottom: 'var(--spacing-4)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sparkles size={14} /> 1-Click GitHub Repository Metadata Sync
                  </span>
                  {fetchSuccess && (
                    <span style={{ fontSize: '11px', color: '#10B981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle2 size={12} /> Auto-Filled!
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="url"
                    placeholder="https://github.com/owner/repository"
                    value={formData.github_url}
                    onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border)',
                      fontSize: 'var(--font-size-xs)',
                    }}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    loading={fetchingGitHub}
                    onClick={handleFetchGitHubMetadata}
                  >
                    Auto-Fetch
                  </Button>
                </div>
              </div>

              <form onSubmit={handleCreateProject} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
                <Input
                  label="Project Title"
                  required
                  placeholder="e.g. Distributed Task Queue"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />

                <Input
                  label="Tagline (One-line architectural summary)"
                  placeholder="e.g. Asynchronous event orchestrator built on Redis Streams and Python"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-3)' }}>
                  <Input
                    label="Primary Language"
                    placeholder="e.g. Python, TypeScript, Go"
                    value={formData.primary_language}
                    onChange={(e) => setFormData({ ...formData, primary_language: e.target.value })}
                  />

                  <div>
                    <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                      Link to Enrolled Domain
                    </label>
                    <select
                      value={formData.user_domain}
                      onChange={(e) => setFormData({ ...formData, user_domain: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--color-border)',
                        backgroundColor: '#FFFFFF',
                        fontSize: 'var(--font-size-sm)',
                      }}
                    >
                      <option value="">None (Independent Project)</option>
                      {userDomains.map((ud) => (
                        <option key={ud.id} value={ud.id}>
                          {ud.original_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <Input
                  label="Technologies (comma separated)"
                  placeholder="e.g. Django, React, PostgreSQL, Docker, AWS"
                  value={formData.technologies_str}
                  onChange={(e) => setFormData({ ...formData, technologies_str: e.target.value })}
                />

                <Input
                  label="Live Demo URL (Optional)"
                  type="url"
                  placeholder="https://demo.navapai.org"
                  value={formData.live_demo_url}
                  onChange={(e) => setFormData({ ...formData, live_demo_url: e.target.value })}
                />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-3)' }}>
                  <div>
                    <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
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
                      value={formData.visibility}
                      onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
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

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-3)', marginTop: 'var(--spacing-2)' }}>
                  <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" loading={creating}>
                    Create Project
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* GitHub Repositories Auto-Import Modal */}
        {showImportModal && (
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Github size={22} color="#0082FF" />
                  <div>
                    <h3 style={{ fontSize: 'var(--font-size-xl)' }}>Import Repositories from GitHub</h3>
                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                      Auto-import your public GitHub repositories directly into your Navapai portfolio with 1 click.
                    </p>
                  </div>
                </div>
                <button onClick={() => setShowImportModal(false)} style={{ fontSize: '18px', color: 'var(--color-text-muted)', cursor: 'pointer' }}>✕</button>
              </div>

              {/* GitHub Username Input */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: 'var(--spacing-6)' }}>
                <input
                  type="text"
                  placeholder="Enter GitHub Username (e.g. octocat)..."
                  value={importUsername}
                  onChange={(e) => setImportUsername(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    fontSize: 'var(--font-size-sm)',
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleFetchUserRepos();
                  }}
                />
                <Button
                  variant="primary"
                  loading={fetchingUserRepos}
                  onClick={() => handleFetchUserRepos()}
                  icon={RefreshCw}
                >
                  Fetch Repos
                </Button>
              </div>

              {/* Repositories List */}
              {fetchingUserRepos ? (
                <LoadingState message="Fetching public GitHub repositories..." />
              ) : userRepos.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 'var(--spacing-8) 0', color: 'var(--color-text-muted)' }}>
                  <Github size={36} style={{ marginBottom: '8px', opacity: 0.5 }} />
                  <p style={{ fontSize: 'var(--font-size-sm)' }}>
                    Enter a GitHub username above and click "Fetch Repos" to discover public repositories.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
                  {userRepos.map((repo) => (
                    <div
                      key={repo.id}
                      style={{
                        padding: '14px 16px',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--color-bg-section)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '12px',
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)', color: 'var(--color-text-main)' }}>
                            {repo.name}
                          </span>
                          <Badge variant="cyan">{repo.primary_language || 'Code'}</Badge>
                          {repo.stars_count > 0 && (
                            <span style={{ fontSize: '11px', color: '#D97706', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2px' }}>
                              <Star size={12} /> {repo.stars_count}
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          {repo.description || 'No repository description provided.'}
                        </p>
                      </div>

                      <Button
                        variant="secondary"
                        size="sm"
                        loading={importingRepoId === repo.id}
                        onClick={() => handleImportSingleRepo(repo)}
                        icon={Plus}
                      >
                        Import
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--spacing-6)' }}>
                <Button variant="ghost" onClick={() => setShowImportModal(false)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

