import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Terminal,
  Layers,
  Server,
  Cloud,
  Cpu,
  Brain,
  Database,
  ShieldCheck,
  Sparkles,
  GitBranch,
  BookOpen,
  Users,
  CheckCircle2,
  ExternalLink,
  FolderGit2,
  Zap,
  Lock,
  Globe,
} from 'lucide-react';
import { GithubIcon as Github } from '../../components/common/Icons';
import api from '../../services/api';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { ProgressBar } from '../../components/common/ProgressBar';
import { LoadingState } from '../../components/feedback/LoadingState';

const getDomainIcon = (iconName) => {
  switch (iconName) {
    case 'Terminal': return Terminal;
    case 'Server': return Server;
    case 'Layers': return Layers;
    case 'Cloud': return Cloud;
    case 'GitBranch': return GitBranch;
    case 'Database': return Database;
    case 'Brain': return Brain;
    case 'Cpu': return Cpu;
    default: return Cloud;
  }
};

export const Home = () => {
  const [featuredDomains, setFeaturedDomains] = useState([]);
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [domainsRes, statsRes, projectsRes] = await Promise.all([
          api.get('domains/?featured=true').catch(() => ({ data: [] })),
          api.get('domains/stats/').catch(() => ({ data: null })),
          api.get('projects/showcase/').catch(() => api.get('domains/showcase/projects/')),
        ]);

        let domainList = domainsRes.data?.results || domainsRes.data || [];
        if (!Array.isArray(domainList) || domainList.length === 0) {
          const fallbackDomRes = await api.get('domains/');
          domainList = fallbackDomRes.data?.results || fallbackDomRes.data || [];
        }

        setFeaturedDomains(Array.isArray(domainList) ? domainList.slice(0, 6) : []);
        setStats(statsRes.data);

        let projList = projectsRes.data?.results || projectsRes.data || [];
        setProjects(Array.isArray(projList) ? projList.slice(0, 3) : []);
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);


  return (
    <div>
      {/* 1. Hero Section (White Canvas with Subtle Cyan Glow) */}
      <section
        className="section-white"
        style={{
          position: 'relative',
          paddingTop: 'var(--spacing-16)',
          paddingBottom: 'var(--spacing-16)',
          overflow: 'hidden',
        }}
      >
        {/* Subtle decorative glow */}
        <div
          style={{
            position: 'absolute',
            top: '-20%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '600px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(0, 210, 255, 0.08) 0%, rgba(0, 130, 255, 0) 70%)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--spacing-12)', alignItems: 'center' }}>
            {/* Left Content */}
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--spacing-4)' }}>
                <Badge variant="brand" icon={Sparkles}>
                  Enterprise Cloud & Developer Platform
                </Badge>
              </div>

              <h1 style={{ color: 'var(--color-text-main)', marginBottom: 'var(--spacing-4)' }}>
                Build Smarter. <br />
                <span style={{ background: 'var(--gradient-brand)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Scale Without Limits.
                </span>
              </h1>

              <p style={{ fontSize: 'var(--font-size-lg)', color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: 'var(--spacing-8)', maxWidth: '540px' }}>
                Navapai helps engineers and organizations master canonical cloud domains, build verified project portfolios, simplify roadmap execution, and share community knowledge.
              </p>

              <div style={{ display: 'flex', gap: 'var(--spacing-4)', flexWrap: 'wrap', marginBottom: 'var(--spacing-8)' }}>
                <Link to="/register">
                  <Button variant="primary" size="lg" icon={ArrowRight} iconPosition="right">
                    Get Started
                  </Button>
                </Link>
                <Link to="/domains">
                  <Button variant="secondary" size="lg">
                    Explore Solutions
                  </Button>
                </Link>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-6)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={15} color="#0082FF" />
                  <span>Free Developer Access</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={15} color="#0082FF" />
                  <span>PostgreSQL Powered</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={15} color="#0082FF" />
                  <span>AWS Ready</span>
                </div>
              </div>
            </div>

            {/* Right Graphic / Interactive Cloud Card */}
            <div>
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--spacing-8)',
                  boxShadow: 'var(--shadow-lg)',
                  position: 'relative',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-6)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10B981' }} />
                    <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-text-main)' }}>
                      Navapai Cloud Gateway • Live
                    </span>
                  </div>
                  <Badge variant="cyan">v1.0.0</Badge>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
                  <div style={{ padding: '12px 16px', backgroundColor: 'var(--color-bg-section)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginBottom: '2px' }}>Canonical Learning Domain</div>
                    <div style={{ fontWeight: 600, color: 'var(--color-text-main)', display: 'flex', justifyContent: 'space-between' }}>
                      <span>AWS Cloud & DevOps</span>
                      <span style={{ color: 'var(--color-primary)' }}>100% Verified</span>
                    </div>
                  </div>

                  <div style={{ padding: '12px 16px', backgroundColor: 'var(--color-bg-section)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginBottom: '2px' }}>Topic Similarity Matching</div>
                    <div style={{ fontWeight: 600, color: 'var(--color-text-main)', display: 'flex', justifyContent: 'space-between' }}>
                      <span>PostgreSQL pg_trgm Engine</span>
                      <span style={{ color: '#10B981' }}>94% Confidence</span>
                    </div>
                  </div>

                  <div style={{ padding: '12px 16px', backgroundColor: 'var(--color-bg-section)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginBottom: '2px' }}>Data Isolation Guarantee</div>
                    <div style={{ fontWeight: 600, color: 'var(--color-text-main)', display: 'flex', justifyContent: 'space-between' }}>
                      <span>User Ownership Protected</span>
                      <span style={{ color: 'var(--color-primary)' }}>Immutable FKs</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Platform Stats Metrics Bar (White Canvas) */}
      {stats && (
        <section style={{ borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)', backgroundColor: '#FFFFFF', padding: 'var(--spacing-8) 0' }}>
          <div className="container">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-8)', textAlign: 'center' }}>
              <div>
                <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800, color: 'var(--color-primary)' }}>
                  {stats.total_domains}+
                </div>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                  Canonical Cloud Domains
                </div>
              </div>
              <div>
                <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800, color: 'var(--color-text-main)' }}>
                  {stats.active_learners.toLocaleString()}+
                </div>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                  Active Developers
                </div>
              </div>
              <div>
                <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800, color: 'var(--color-primary)' }}>
                  {stats.community_projects}+
                </div>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                  Verified Repositories
                </div>
              </div>
              <div>
                <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800, color: 'var(--color-text-main)' }}>
                  {stats.learning_resources}+
                </div>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                  Curated Guides & Blueprints
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. Featured Cloud & Engineering Domains (Section Gray #F4F7FA) */}
      <section className="section-gray">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'var(--spacing-8)', flexWrap: 'wrap', gap: 'var(--spacing-4)' }}>
            <div>
              <Badge variant="brand" style={{ marginBottom: 'var(--spacing-2)' }}>Standardized Curriculum</Badge>
              <h2>Featured Learning Domains</h2>
              <p>Explore production-grade topics, community roadmaps, and verified learning materials.</p>
            </div>
            <Link to="/domains">
              <Button variant="secondary" size="sm" icon={ArrowRight} iconPosition="right">
                View All Domains
              </Button>
            </Link>
          </div>

          {loading ? (
            <LoadingState message="Loading canonical domains..." />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 'var(--spacing-6)' }}>
              {featuredDomains.map((domain) => {
                const IconComponent = getDomainIcon(domain.icon_name);
                return (
                  <Card key={domain.id} hoverable style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-4)' }}>
                      <div
                        style={{
                          width: '46px',
                          height: '46px',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: 'var(--color-primary-subtle)',
                          color: 'var(--color-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <IconComponent size={24} />
                      </div>
                      <Badge variant="neutral">{domain.category}</Badge>
                    </div>

                    <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-2)' }}>
                      <Link to={`/domains/${domain.slug}`} style={{ color: 'var(--color-text-main)' }}>
                        {domain.title}
                      </Link>
                    </h3>

                    <p style={{ fontSize: 'var(--font-size-sm)', flex: 1, marginBottom: 'var(--spacing-4)', lineHeight: 1.5, color: 'var(--color-text-muted)' }}>
                      {domain.description}
                    </p>

                    {domain.aliases && domain.aliases.length > 0 && (
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: 'var(--spacing-4)' }}>
                        {domain.aliases.slice(0, 3).map((alias, i) => (
                          <span
                            key={i}
                            style={{
                              fontSize: '11px',
                              padding: '2px 8px',
                              backgroundColor: 'var(--color-bg-section)',
                              border: '1px solid var(--color-border)',
                              borderRadius: 'var(--radius-sm)',
                              color: 'var(--color-text-muted)',
                            }}
                          >
                            {alias}
                          </span>
                        ))}
                      </div>
                    )}

                    <div
                      style={{
                        paddingTop: 'var(--spacing-3)',
                        borderTop: '1px solid var(--color-border)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: 'var(--font-size-xs)',
                        color: 'var(--color-text-muted)',
                      }}
                    >
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <span><strong>{domain.topics_count}</strong> Topics</span>
                        <span><strong>{domain.members_count}</strong> Learners</span>
                      </div>
                      <Link to={`/domains/${domain.slug}`} style={{ color: 'var(--color-primary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        Explore <ArrowRight size={12} />
                      </Link>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 4. Real-World Developer Projects (White Canvas) */}
      <section className="section-white">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'var(--spacing-8)', flexWrap: 'wrap', gap: 'var(--spacing-4)' }}>
            <div>
              <Badge variant="brand" style={{ marginBottom: 'var(--spacing-2)' }}>Verified Portfolios</Badge>
              <h2>Real-World Engineering Projects</h2>
              <p>Explore production implementations, code repos, and live demos built by developers.</p>
            </div>
            <Link to="/projects">
              <Button variant="secondary" size="sm" icon={ArrowRight} iconPosition="right">
                View All Projects
              </Button>
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--spacing-6)' }}>
            {projects.map((proj) => (
              <Card key={proj.id} hoverable style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-3)' }}>
                  <Badge variant="brand">{proj.domain}</Badge>
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                    by <strong>@{proj.contributor}</strong>
                  </span>
                </div>

                <h3 style={{ fontSize: 'var(--font-size-md)', marginBottom: 'var(--spacing-2)' }}>{proj.title}</h3>
                <p style={{ fontSize: 'var(--font-size-sm)', flex: 1, marginBottom: 'var(--spacing-4)' }}>{proj.description}</p>

                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: 'var(--spacing-4)' }}>
                  {proj.technologies.map((tech, idx) => (
                    <span
                      key={idx}
                      style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        padding: '3px 8px',
                        backgroundColor: 'var(--color-bg-section)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--color-text-main)',
                      }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                <div style={{ marginBottom: 'var(--spacing-4)' }}>
                  <ProgressBar progress={proj.progress} color="#0082FF" />
                </div>

                <div style={{ display: 'flex', gap: 'var(--spacing-3)', paddingTop: 'var(--spacing-3)', borderTop: '1px solid var(--color-border)' }}>
                  {proj.github_url && (
                    <a
                      href={proj.github_url}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: 'var(--font-size-xs)',
                        fontWeight: 600,
                        color: 'var(--color-text-main)',
                      }}
                    >
                      <Github size={14} /> Repository
                    </a>
                  )}
                  {proj.live_url && (
                    <a
                      href={proj.live_url}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: 'var(--font-size-xs)',
                        fontWeight: 600,
                        color: 'var(--color-primary)',
                      }}
                    >
                      <ExternalLink size={14} /> Live Demo
                    </a>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Smart Domain Merging Architecture (Section Gray #F4F7FA) */}
      <section className="section-gray">
        <div className="container">
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--spacing-10)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: 'var(--spacing-8)',
              alignItems: 'center',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div>
              <Badge variant="brand" style={{ marginBottom: 'var(--spacing-3)' }}>
                Unique Architecture
              </Badge>
              <h2 style={{ color: 'var(--color-text-main)', marginBottom: 'var(--spacing-3)' }}>
                Smart Topic Similarity & Domain Merging
              </h2>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-6)', lineHeight: 1.6 }}>
                Eliminate fragmented learning paths without risking user data. Navapai uses multi-tier PostgreSQL similarity matching to suggest canonical domains while preserving your personal project ownership 100% intact.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--font-size-sm)' }}>
                  <CheckCircle2 size={16} color="#0082FF" />
                  <span>Personal notes, tasks, and learning plans remain in your account.</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--font-size-sm)' }}>
                  <CheckCircle2 size={16} color="#0082FF" />
                  <span>Transactional atomic merge with full audit logging.</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--font-size-sm)' }}>
                  <CheckCircle2 size={16} color="#0082FF" />
                  <span>Original topic names are never destroyed or renamed.</span>
                </div>
              </div>
            </div>

            <div
              style={{
                backgroundColor: 'var(--color-bg-section)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--spacing-6)',
              }}
            >
              <div style={{ fontSize: 'var(--font-size-xs)', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-3)', fontWeight: 600 }}>
                Live Trigram Similarity Engine
              </div>
              <div style={{ backgroundColor: '#FFFFFF', padding: '14px', borderRadius: 'var(--radius-sm)', marginBottom: '12px', borderLeft: '4px solid #0082FF', border: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Your Topic Submission</div>
                <div style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>Python Development</div>
              </div>
              <div style={{ textAlign: 'center', color: '#0082FF', fontWeight: 700, fontSize: '12px', margin: '6px 0' }}>
                ↓ 94% PostgreSQL Trigram Match
              </div>
              <div style={{ backgroundColor: '#FFFFFF', padding: '14px', borderRadius: 'var(--radius-sm)', borderLeft: '4px solid #10B981', border: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Canonical Community Domain</div>
                <div style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>Python (28 Topics, 340 Members)</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Call to Action (White Canvas) */}
      <section className="section-white" style={{ textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '700px' }}>
          <h2 style={{ marginBottom: 'var(--spacing-3)' }}>Accelerate Your Cloud & Engineering Journey</h2>
          <p style={{ marginBottom: 'var(--spacing-6)', fontSize: 'var(--font-size-base)' }}>
            Join thousands of developers mastering domains, tracking projects, and sharing knowledge.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--spacing-3)' }}>
            <Link to="/register">
              <Button variant="primary" size="lg" icon={ArrowRight} iconPosition="right">
                Get Started for Free
              </Button>
            </Link>
            <Link to="/domains">
              <Button variant="secondary" size="lg">
                Explore Curriculum
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
