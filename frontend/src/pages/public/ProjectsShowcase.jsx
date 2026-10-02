import React, { useState, useEffect } from 'react';
import { ExternalLink, Search, Filter, Code, Sparkles, Star } from 'lucide-react';
import { GithubIcon as Github } from '../../components/common/Icons';
import api from '../../services/api';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Input } from '../../components/common/Input';
import { LoadingState } from '../../components/feedback/LoadingState';

export const ProjectsShowcase = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTech, setSelectedTech] = useState('All');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        let res;
        try {
          res = await api.get('projects/showcase/');
        } catch (e) {
          res = await api.get('domains/showcase/projects/');
        }
        const data = Array.isArray(res.data) ? res.data : (res.data?.results || []);
        setProjects(data);
      } catch (err) {
        console.error('Error fetching showcase projects:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);


  const allTechs = ['All', 'React', 'Django', 'PostgreSQL', 'AWS', 'Kubernetes', 'Python', 'Docker', 'FastAPI'];

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase()) ||
      (p.community_domain_title && p.community_domain_title.toLowerCase().includes(search.toLowerCase()));
    const matchesTech =
      selectedTech === 'All' ||
      (p.technologies && p.technologies.some((t) => t.toLowerCase() === selectedTech.toLowerCase())) ||
      (p.primary_language && p.primary_language.toLowerCase() === selectedTech.toLowerCase());
    return matchesSearch && matchesTech;
  });

  return (
    <div style={{ padding: 'var(--spacing-10) 0 var(--spacing-16)', backgroundColor: 'var(--color-bg-main)' }}>
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-10)' }}>
          <Badge variant="brand" style={{ marginBottom: 'var(--spacing-2)' }}>Community Showcase</Badge>
          <h1 style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--spacing-2)' }}>Explore Developer Projects</h1>
          <p style={{ maxWidth: '640px', margin: '0 auto', fontSize: 'var(--font-size-base)', color: 'var(--color-text-muted)' }}>
            Production codebases, open-source repositories, and cloud-native applications crafted by community engineers.
          </p>
        </div>

        {/* Filter controls */}
        <div
          style={{
            backgroundColor: 'var(--color-bg-section)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--spacing-6)',
            marginBottom: 'var(--spacing-8)',
          }}
        >
          <div style={{ marginBottom: 'var(--spacing-4)' }}>
            <Input
              placeholder="Search projects by title, stack, or domain..."
              icon={Search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            {allTechs.map((tech) => (
              <button
                key={tech}
                onClick={() => setSelectedTech(tech)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: '1px solid',
                  backgroundColor: selectedTech === tech ? 'var(--color-primary)' : '#FFFFFF',
                  color: selectedTech === tech ? '#FFFFFF' : 'var(--color-text-muted)',
                  borderColor: selectedTech === tech ? 'var(--color-primary)' : 'var(--color-border)',
                  transition: 'all var(--transition-fast)',
                }}
              >
                {tech}
              </button>
            ))}
          </div>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <LoadingState message="Loading developer showcase projects..." />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 'var(--spacing-6)' }}>
            {filteredProjects.map((proj) => (
              <Card key={proj.id} hoverable style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-3)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {proj.community_domain_title && (
                      <Badge variant="brand">{proj.community_domain_title}</Badge>
                    )}
                    {proj.primary_language && (
                      <Badge variant="cyan">{proj.primary_language}</Badge>
                    )}
                  </div>
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                    by <strong>@{proj.user_username}</strong>
                  </span>
                </div>

                <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-2)', color: 'var(--color-text-main)' }}>{proj.title}</h3>
                <p style={{ fontSize: 'var(--font-size-sm)', flex: 1, marginBottom: 'var(--spacing-4)', lineHeight: 1.5, color: 'var(--color-text-muted)' }}>
                  {proj.tagline || proj.description}
                </p>

                {/* Technologies */}
                {proj.technologies && proj.technologies.length > 0 && (
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
                )}

                {/* Footer Links & Stars */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 'var(--spacing-3)', borderTop: '1px solid var(--color-border)' }}>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    {proj.github_url && (
                      <a
                        href={proj.github_url}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: 'var(--font-size-xs)',
                          fontWeight: 600,
                          color: 'var(--color-text-main)',
                        }}
                      >
                        <Github size={14} /> Repo
                      </a>
                    )}
                    {proj.live_demo_url && (
                      <a
                        href={proj.live_demo_url}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: 'var(--font-size-xs)',
                          fontWeight: 600,
                          color: 'var(--color-primary)',
                        }}
                      >
                        <ExternalLink size={14} /> Live Demo
                      </a>
                    )}
                  </div>

                  {proj.github_stars_count > 0 && (
                    <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: '#D97706', display: 'flex', alignItems: 'center', gap: '4px' }}>
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
  );
};
