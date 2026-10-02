import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  User,
  MapPin,
  Globe,
  Star,
  GitFork,
  ExternalLink,
  Code,
  CheckCircle2,
  Share2,
  Layers,
  Sparkles,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { GithubIcon as Github, LinkedinIcon as Linkedin } from '../../components/common/Icons';
import api from '../../services/api';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { LoadingState } from '../../components/feedback/LoadingState';
import { ErrorState } from '../../components/feedback/ErrorState';

export const DeveloperPortfolio = () => {
  const { username } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const [heatmap, setHeatmap] = useState([]);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        setLoading(true);
        const [res, heatRes] = await Promise.all([
          api.get(`projects/portfolio/${username}/`),
          api.get(`analytics/public/${username}/`).catch(() => ({ data: { heatmap: [], streak: 0 } })),
        ]);
        setData(res.data);
        setHeatmap(heatRes.data.heatmap || []);
        setStreak(heatRes.data.streak || 0);
      } catch (err) {
        console.error('Failed to load portfolio:', err);
        setError('Developer portfolio not found or profile is private.');
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchPortfolio();
    }
  }, [username]);


  const handleSharePortfolio = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  if (loading) {
    return <LoadingState fullPage message="Loading developer portfolio..." />;
  }

  if (error || !data) {
    return (
      <div className="container" style={{ padding: 'var(--spacing-16) 0' }}>
        <ErrorState
          title="Portfolio Not Found"
          message={error || 'Could not find developer profile.'}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  const { developer, enrolled_domains, projects, total_stars } = data;

  return (
    <div style={{ padding: 'var(--spacing-10) 0 var(--spacing-16)', backgroundColor: 'var(--color-bg-main)', minHeight: 'calc(100vh - 120px)' }}>
      <div className="container">
        {/* Developer Hero Card */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--spacing-8)',
            marginBottom: 'var(--spacing-8)',
            boxShadow: 'var(--shadow-md)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', gap: 'var(--spacing-6)', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            {/* Avatar Circle */}
            <div
              style={{
                width: '88px',
                height: '88px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-primary)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'var(--font-size-3xl)',
                fontWeight: 800,
                boxShadow: '0 4px 14px rgba(0, 130, 255, 0.3)',
              }}
            >
              {developer.full_name ? developer.full_name[0].toUpperCase() : developer.username[0].toUpperCase()}
            </div>

            {/* Main Info */}
            <div style={{ flex: 1, minWidth: '280px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--spacing-3)' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <h1 style={{ fontSize: 'var(--font-size-3xl)', color: 'var(--color-text-main)' }}>
                      {developer.full_name}
                    </h1>
                    <Badge variant="brand">{developer.role || 'DEVELOPER'}</Badge>
                  </div>
                  <p style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-2)' }}>
                    @{developer.username} {developer.location && `• ${developer.location}`}
                  </p>
                  {data.portfolio_settings?.custom_headline && (
                    <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-primary)', marginBottom: 'var(--spacing-3)' }}>
                      {data.portfolio_settings.custom_headline}
                    </div>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  icon={copied ? CheckCircle2 : Share2}
                  onClick={handleSharePortfolio}
                >
                  {copied ? 'Link Copied!' : 'Share Portfolio'}
                </Button>
              </div>


              {developer.bio && (
                <p style={{ fontSize: 'var(--font-size-sm)', lineHeight: 1.6, color: 'var(--color-text-main)', maxWidth: '780px', marginBottom: 'var(--spacing-4)' }}>
                  {developer.bio}
                </p>
              )}

              {/* Verified Skills */}
              {developer.skills && developer.skills.length > 0 && (
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: 'var(--spacing-4)' }}>
                  {developer.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      style={{
                        fontSize: 'var(--font-size-xs)',
                        fontWeight: 600,
                        backgroundColor: 'var(--color-bg-section)',
                        border: '1px solid var(--color-border)',
                        color: 'var(--color-text-main)',
                        padding: '4px 12px',
                        borderRadius: 'var(--radius-full)',
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              {/* Social Links */}
              <div style={{ display: 'flex', gap: 'var(--spacing-4)', alignItems: 'center', flexWrap: 'wrap' }}>
                {developer.github_username && (
                  <a
                    href={`https://github.com/${developer.github_username}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-text-main)' }}
                  >
                    <Github size={16} /> @{developer.github_username}
                  </a>
                )}
                {developer.linkedin_url && (
                  <a
                    href={developer.linkedin_url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: 'var(--font-size-xs)', fontWeight: 600, color: '#0A66C2' }}
                  >
                    <Linkedin size={16} /> LinkedIn
                  </a>
                )}
                {developer.website_url && (
                  <a
                    href={developer.website_url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-primary)' }}
                  >
                    <Globe size={16} /> Website
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Key Metrics Banner */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 'var(--spacing-4)',
              marginTop: 'var(--spacing-6)',
              paddingTop: 'var(--spacing-6)',
              borderTop: '1px solid var(--color-border)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', backgroundColor: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Star size={20} />
              </div>
              <div>
                <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800 }}>{total_stars.toLocaleString()}</div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Total GitHub Stars</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', backgroundColor: '#E0F2FE', color: '#0082FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Code size={20} />
              </div>
              <div>
                <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800 }}>{projects.length}</div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Featured Repositories</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', backgroundColor: '#D1FAE5', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BookOpen size={20} />
              </div>
              <div>
                <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800 }}>{enrolled_domains.length}</div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Verified Domains</div>
              </div>
            </div>
          </div>
        </div>

        {/* 365-Day Activity Heatmap */}
        {heatmap && heatmap.length > 0 && (
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-4)', flexWrap: 'wrap', gap: '8px' }}>
              <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, margin: 0 }}>
                {heatmap.reduce((acc, d) => acc + d.count, 0)} Contributions in the Past Year
              </h2>
              {streak > 0 && (
                <Badge variant="brand">🔥 {streak} Day Streak</Badge>
              )}
            </div>

            <div style={{ overflowX: 'auto', paddingBottom: '8px' }}>
              <div style={{ display: 'flex', gap: '3px', minWidth: '720px' }}>
                {Array.from({ length: Math.ceil(heatmap.length / 7) }).map((_, colIdx) => {
                  const col = heatmap.slice(colIdx * 7, (colIdx + 1) * 7);
                  return (
                    <div key={colIdx} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      {col.map((day, dayIdx) => (
                        <div
                          key={dayIdx}
                          title={`${day.date}: ${day.count} activities`}
                          style={{
                            width: '11px',
                            height: '11px',
                            borderRadius: '2px',
                            backgroundColor:
                              day.level === 4
                                ? '#047857'
                                : day.level === 3
                                ? '#10B981'
                                : day.level === 2
                                ? '#34D399'
                                : day.level === 1
                                ? '#A7F3D0'
                                : '#F1F5F9',
                          }}
                        />
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}


        {/* Enrolled Domains Badges */}
        {enrolled_domains.length > 0 && (
          <div style={{ marginBottom: 'var(--spacing-8)' }}>
            <h2 style={{ fontSize: 'var(--font-size-xl)', marginBottom: 'var(--spacing-4)' }}>Verified Learning Domains</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 'var(--spacing-4)' }}>
              {enrolled_domains.map((dom) => (
                <Card key={dom.id} style={{ padding: 'var(--spacing-4)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 700, fontSize: 'var(--font-size-base)', color: 'var(--color-text-main)' }}>
                      {dom.original_name}
                    </span>
                    <Badge variant="cyan">{dom.status}</Badge>
                  </div>
                  <div style={{ height: '6px', backgroundColor: 'var(--color-bg-section)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div style={{ width: `${dom.progress_percent}%`, height: '100%', backgroundColor: 'var(--color-primary)', transition: 'width 0.5s ease' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '11px', color: 'var(--color-text-muted)' }}>
                    <span>Progress</span>
                    <span style={{ fontWeight: 700 }}>{dom.progress_percent}%</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Verified Certifications */}
        {data.certifications && data.certifications.length > 0 && (
          <div style={{ marginBottom: 'var(--spacing-10)' }}>
            <h2 style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 'var(--spacing-6)' }}>Verified Professional Certifications</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--spacing-6)' }}>
              {data.certifications.map((cert) => (
                <Card key={cert.id} style={{ borderTop: '3px solid #0082FF' }}>
                  <Badge variant="brand" style={{ marginBottom: '8px' }}>Verified Credential</Badge>
                  <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 700, marginBottom: '4px' }}>{cert.title}</h3>
                  <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-primary)', marginBottom: '4px' }}>{cert.issuing_organization}</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Issued: {cert.issue_date}</div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Unlocked Skill Badges */}
        {data.achievements && data.achievements.length > 0 && (
          <div style={{ marginBottom: 'var(--spacing-10)' }}>
            <h2 style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 'var(--spacing-6)' }}>Unlocked Skill Badges & Achievements</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 'var(--spacing-4)' }}>
              {data.achievements.map((ach) => (
                <Card key={ach.id} style={{ border: '2px solid #10B981', backgroundColor: '#FFFFFF' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <h3 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, margin: 0 }}>{ach.badge.name}</h3>
                    <Badge variant="success">+{ach.badge.points_reward} XP</Badge>
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', margin: 0 }}>{ach.badge.description}</p>
                </Card>
              ))}
            </div>
          </div>
        )}


        {/* Portfolio Projects Grid */}
        <div>
          <h2 style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 'var(--spacing-6)' }}>Portfolio & Production Projects</h2>

          {projects.length === 0 ? (
            <Card style={{ padding: 'var(--spacing-8)', textAlign: 'center' }}>
              <p style={{ color: 'var(--color-text-muted)' }}>No public projects showcase available yet.</p>
            </Card>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 'var(--spacing-6)' }}>
              {projects.map((proj) => (
                <Card key={proj.id} hoverable style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-3)' }}>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      {proj.community_domain_title && (
                        <Badge variant="brand">{proj.community_domain_title}</Badge>
                      )}
                      {proj.primary_language && (
                        <Badge variant="cyan">{proj.primary_language}</Badge>
                      )}
                    </div>
                  </div>

                  <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-2)', color: 'var(--color-text-main)' }}>
                    {proj.title}
                  </h3>

                  <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', flex: 1, marginBottom: 'var(--spacing-4)', lineHeight: 1.5 }}>
                    {proj.tagline || proj.description}
                  </p>

                  {/* Tech Tags */}
                  {proj.technologies && proj.technologies.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: 'var(--spacing-4)' }}>
                      {proj.technologies.map((tech, idx) => (
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
                    </div>
                  )}

                  {/* Footer */}
                  <div
                    style={{
                      paddingTop: 'var(--spacing-3)',
                      borderTop: '1px solid var(--color-border)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div style={{ display: 'flex', gap: '12px' }}>
                      {proj.github_url && (
                        <a
                          href={proj.github_url}
                          target="_blank"
                          rel="noreferrer"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-text-main)' }}
                        >
                          <Github size={14} /> Repository
                        </a>
                      )}
                      {proj.live_demo_url && (
                        <a
                          href={proj.live_demo_url}
                          target="_blank"
                          rel="noreferrer"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-primary)' }}
                        >
                          <ExternalLink size={14} /> Demo
                        </a>
                      )}
                    </div>

                    {proj.github_stars_count > 0 && (
                      <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: '#D97706', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Star size={13} /> {proj.github_stars_count.toLocaleString()}
                      </span>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
