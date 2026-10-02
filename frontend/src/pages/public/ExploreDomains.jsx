import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Terminal,
  Server,
  Layers,
  Cloud,
  GitBranch,
  Database,
  Brain,
  Cpu,
  ArrowRight,
  Filter,
} from 'lucide-react';
import api from '../../services/api';
import { Input } from '../../components/common/Input';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { LoadingState } from '../../components/feedback/LoadingState';
import { EmptyState } from '../../components/feedback/EmptyState';

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

export const ExploreDomains = () => {
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState([
    'All',
    'Cloud Infrastructure',
    'Programming & Languages',
    'Web & Backend Frameworks',
    'Containerization & Cloud',
    'AI & Data Science',
    'Databases & Data Engineering',
    'Security & Networking',
    'Systems & OS',
  ]);

  useEffect(() => {
    const fetchDomains = async () => {
      setLoading(true);
      try {
        let url = 'domains/';
        const params = [];
        if (search.trim()) params.push(`search=${encodeURIComponent(search.trim())}`);
        if (selectedCategory !== 'All') params.push(`category=${encodeURIComponent(selectedCategory)}`);
        
        if (params.length > 0) {
          url += `?${params.join('&')}`;
        }

        const res = await api.get(url);
        const data = Array.isArray(res.data) ? res.data : (res.data.results || []);
        setDomains(data);

        // Fetch server categories dynamically
        const statsRes = await api.get('domains/stats/');
        if (statsRes.data?.categories && statsRes.data.categories.length > 0) {
          setCategories(['All', ...statsRes.data.categories]);
        }
      } catch (err) {
        console.error('Error fetching domains:', err);
      } finally {
        setLoading(false);
      }
    };


    const debounceTimer = setTimeout(() => {
      fetchDomains();
    }, 250);

    return () => clearTimeout(debounceTimer);
  }, [search, selectedCategory]);

  return (
    <div style={{ padding: 'var(--spacing-10) 0 var(--spacing-16)', backgroundColor: 'var(--color-bg-main)' }}>
      <div className="container">
        {/* Page Header */}
        <div style={{ marginBottom: 'var(--spacing-10)', textAlign: 'center' }}>
          <Badge variant="brand" style={{ marginBottom: 'var(--spacing-2)' }}>Canonical Directory</Badge>
          <h1 style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--spacing-2)' }}>Explore Cloud Domains</h1>
          <p style={{ maxWidth: '640px', margin: '0 auto', fontSize: 'var(--font-size-base)', color: 'var(--color-text-muted)' }}>
            Discover standardized cloud architectures, software engineering roadmaps, and verified community curriculum.
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div
          style={{
            backgroundColor: 'var(--color-bg-section)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--spacing-6)',
            marginBottom: 'var(--spacing-8)',
          }}
        >
          <div style={{ display: 'flex', gap: 'var(--spacing-4)', alignItems: 'center', marginBottom: 'var(--spacing-4)', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '280px' }}>
              <Input
                placeholder="Search domains by title, description, or alias (e.g. 'AWS', 'Python', 'DevOps', 'PostgreSQL')..."
                icon={Search}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {(search || selectedCategory !== 'All') && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSearch('');
                  setSelectedCategory('All');
                }}
              >
                View All Domains
              </Button>
            )}
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontWeight: 600 }}>
              {domains.length} Domains Listed
            </span>
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

        {/* Results Grid */}
        {loading ? (
          <LoadingState message="Fetching domains from database..." />
        ) : domains.length === 0 ? (
          <EmptyState
            title={search || selectedCategory !== 'All' ? "No matching learning domains" : "No Cloud Domains Available"}
            description={
              search || selectedCategory !== 'All'
                ? `We couldn't find any domains matching "${search || selectedCategory}".`
                : "No canonical cloud domains are available in the directory at the moment."
            }
            actionLabel="Reset Search & Filters"
            onAction={() => { setSearch(''); setSelectedCategory('All'); }}
          />
        ) : (

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 'var(--spacing-6)' }}>
            {domains.map((domain) => {
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

                  {/* Aliases */}
                  {domain.aliases && domain.aliases.length > 0 && (
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: 'var(--spacing-4)' }}>
                      {domain.aliases.map((alias, i) => (
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
                    <Link
                      to={`/domains/${domain.slug}`}
                      style={{
                        color: 'var(--color-primary)',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      View Curriculum <ArrowRight size={12} />
                    </Link>
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
