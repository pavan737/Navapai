import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Share2,
  PlusCircle,
  Clock,
  FileText,
  Video,
} from 'lucide-react';
import { GithubIcon as Github } from '../../components/common/Icons';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { ProgressBar } from '../../components/common/ProgressBar';
import { LoadingState } from '../../components/feedback/LoadingState';
import { ErrorState } from '../../components/feedback/ErrorState';

export const DomainDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [domain, setDomain] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('curriculum');
  const [resources, setResources] = useState([]);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchDomain = async () => {
      setLoading(true);
      setError(null);
      try {
        const [domainRes, resourcesRes, projectsRes] = await Promise.all([
          api.get(`domains/${slug}/`),
          api.get(`domains/showcase/resources/?domain=${slug}`),
          api.get('domains/showcase/projects/'),
        ]);

        setDomain(domainRes.data);
        setResources(resourcesRes.data);
        setProjects(projectsRes.data);
      } catch (err) {
        console.error('Error loading domain detail:', err);
        setError('Domain not found or unavailable.');
      } finally {
        setLoading(false);
      }
    };

    fetchDomain();
  }, [slug]);

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setEnrolling(true);
    try {
      const res = await api.post(`domains/${domain.id}/join/`);
      navigate(`/dashboard/domains/${res.data.user_domain.id}`);
    } catch (err) {
      console.error('Failed to enroll in domain:', err);
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return <LoadingState fullPage message="Loading learning domain curriculum..." />;
  }

  if (error || !domain) {
    return (
      <div className="container" style={{ padding: 'var(--spacing-12) 0' }}>
        <ErrorState
          title="Domain Not Found"
          message={error || "The requested learning domain does not exist in the canonical registry."}
          onRetry={() => window.location.reload()}
        />
        <div style={{ textAlign: 'center', marginTop: 'var(--spacing-4)' }}>
          <Link to="/domains">
            <Button variant="secondary" icon={ArrowLeft}>Back to Domains</Button>
          </Link>
        </div>
      </div>
    );
  }

  const sampleTopics = [
    { title: `${domain.title} Core Architecture & Fundamentals`, hours: '4-6 hrs', completedBy: '85%' },
    { title: `${domain.title} Enterprise Best Practices & Design Patterns`, hours: '6-8 hrs', completedBy: '72%' },
    { title: `High-Throughput Asynchronous Orchestration in ${domain.title}`, hours: '8-10 hrs', completedBy: '58%' },
    { title: `Performance Tuning & PostgreSQL Optimization`, hours: '5-7 hrs', completedBy: '49%' },
    { title: `Production Deployment, CI/CD & Cloud Monitoring`, hours: '6-8 hrs', completedBy: '42%' },
  ];

  return (
    <div style={{ padding: 'var(--spacing-8) 0 var(--spacing-16)', backgroundColor: 'var(--color-bg-main)' }}>
      <div className="container">
        {/* Back Link */}
        <Link
          to="/domains"
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
          <ArrowLeft size={16} /> Back to all domains
        </Link>

        {/* Domain Hero Banner */}
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
              <Badge variant="brand" style={{ marginBottom: 'var(--spacing-2)' }}>{domain.category}</Badge>
              <h1 style={{ fontSize: 'var(--font-size-3xl)', color: 'var(--color-text-main)' }}>{domain.title}</h1>
            </div>
            <div style={{ display: 'flex', gap: 'var(--spacing-3)' }}>
              <Button variant="primary" icon={PlusCircle} loading={enrolling} onClick={handleEnroll}>
                Enroll in Domain
              </Button>
            </div>
          </div>

          <p style={{ fontSize: 'var(--font-size-base)', maxWidth: '800px', lineHeight: 1.6, marginBottom: 'var(--spacing-6)', color: 'var(--color-text-muted)' }}>
            {domain.description}
          </p>

          {/* Metadata Chips */}
          <div style={{ display: 'flex', gap: 'var(--spacing-6)', flexWrap: 'wrap', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', paddingTop: 'var(--spacing-4)', borderTop: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Users size={16} color="#0082FF" />
              <span><strong>{domain.members_count}</strong> Active Developers</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <BookOpen size={16} color="#0082FF" />
              <span><strong>{domain.topics_count || 24}</strong> Vetted Topics</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={16} color="#10B981" />
              <span>Canonical Curriculum Verified</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--color-border)', marginBottom: 'var(--spacing-8)' }}>
          {[
            { id: 'curriculum', label: 'Curriculum & Topics' },
            { id: 'resources', label: 'Learning Materials' },
            { id: 'projects', label: 'Community Projects' },
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

        {/* Tab 1: Curriculum */}
        {activeTab === 'curriculum' && (
          <div>
            <div style={{ marginBottom: 'var(--spacing-6)' }}>
              <h3 style={{ fontSize: 'var(--font-size-xl)' }}>Structured Learning Path</h3>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                Step-by-step milestones to achieve production mastery in {domain.title}.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
              {(domain.topics && domain.topics.length > 0 ? domain.topics : sampleTopics).map((topic, index) => (
                <Card key={topic.id || index} hoverable style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--spacing-4)', padding: 'var(--spacing-6)' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-4)', flex: 1 }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: '#0082FF',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: 'var(--font-size-sm)',
                        flexShrink: 0,
                      }}
                    >
                      {topic.order || index + 1}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <h4 style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-text-main)' }}>{topic.title}</h4>
                        {topic.difficulty && (
                          <Badge variant="brand">{topic.difficulty}</Badge>
                        )}
                      </div>

                      <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginBottom: '8px', lineHeight: 1.5 }}>
                        {topic.description || 'Master fundamental concepts and architectural patterns.'}
                      </p>

                      <div style={{ display: 'flex', gap: '12px', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={12} /> {topic.estimated_hours ? `${topic.estimated_hours} hours` : (topic.hours || '6 hours')}
                        </span>
                        {topic.milestones && topic.milestones.length > 0 && (
                          <span>• {topic.milestones.length} Vetted Milestones</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <Button variant="secondary" size="sm" onClick={handleEnroll}>
                    Enroll & Track
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Resources */}
        {activeTab === 'resources' && (
          <div>
            <div style={{ marginBottom: 'var(--spacing-6)' }}>
              <h3 style={{ fontSize: 'var(--font-size-xl)' }}>Curated Learning Materials</h3>
              <p style={{ fontSize: 'var(--font-size-sm)' }}>Vetted documentation, video tutorials, and blueprints for {domain.title}.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--spacing-6)' }}>
              {resources.length === 0 ? (
                <Card style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 'var(--spacing-8)' }}>
                  <p>Materials are currently being curated by the community for {domain.title}.</p>
                </Card>
              ) : (
                resources.map((res) => (
                  <Card key={res.id} hoverable style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-3)' }}>
                      <Badge variant="brand">{res.type}</Badge>
                      <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{res.read_time}</span>
                    </div>
                    <h4 style={{ fontSize: 'var(--font-size-base)', marginBottom: 'var(--spacing-2)' }}>{res.title}</h4>
                    <p style={{ fontSize: 'var(--font-size-sm)', flex: 1, marginBottom: 'var(--spacing-4)' }}>{res.description}</p>
                    <a
                      href={res.url}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        paddingTop: 'var(--spacing-3)',
                        borderTop: '1px solid var(--color-border)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: 'var(--font-size-xs)',
                        fontWeight: 600,
                        color: 'var(--color-primary)',
                      }}
                    >
                      <ExternalLink size={14} /> Open Material
                    </a>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Projects */}
        {activeTab === 'projects' && (
          <div>
            <div style={{ marginBottom: 'var(--spacing-6)' }}>
              <h3 style={{ fontSize: 'var(--font-size-xl)' }}>Public Projects Built in this Domain</h3>
              <p style={{ fontSize: 'var(--font-size-sm)' }}>Explore open-source repositories and live prototypes built with {domain.title}.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--spacing-6)' }}>
              {projects.slice(0, 2).map((proj) => (
                <Card key={proj.id} hoverable style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-2)' }}>
                    <Badge variant="brand">{proj.domain}</Badge>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>@{proj.contributor}</span>
                  </div>
                  <h4 style={{ fontSize: 'var(--font-size-base)', marginBottom: 'var(--spacing-2)' }}>{proj.title}</h4>
                  <p style={{ fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-4)' }}>{proj.description}</p>
                  <div style={{ marginBottom: 'var(--spacing-4)' }}>
                    <ProgressBar progress={proj.progress} color="#0082FF" />
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--spacing-3)' }}>
                    {proj.github_url && (
                      <a href={proj.github_url} target="_blank" rel="noreferrer" style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-text-main)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Github size={14} /> Code
                      </a>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
