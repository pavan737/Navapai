import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Flame,
  Zap,
  Award,
  Compass,
  Code,
  CheckSquare,
  BookOpen,
  Bookmark,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Layers,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { ProgressBar } from '../../components/common/ProgressBar';
import { LoadingState } from '../../components/feedback/LoadingState';

export const OverviewDashboard = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);
  const [heatmapData, setHeatmapData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const [sumRes, heatRes] = await Promise.all([
          api.get('analytics/dashboard/'),
          api.get('analytics/heatmap/'),
        ]);

        setSummary(sumRes.data);
        setHeatmapData(heatRes.data.heatmap || []);
      } catch (err) {
        console.error('Failed to load dashboard analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, authLoading, navigate]);

  if (authLoading || loading) {
    return <LoadingState fullPage message="Loading developer overview dashboard & 365-day activity heatmap..." />;
  }

  const levelInfo = summary?.level_info || { level: 1, title: 'Junior Explorer', total_xp: 0, progress_percentage: 0 };
  const counts = summary?.counts || {};

  // Group 365 days into 52 columns for the heatmap matrix
  const heatmapColumns = [];
  for (let i = 0; i < heatmapData.length; i += 7) {
    heatmapColumns.push(heatmapData.slice(i, i + 7));
  }

  const getHeatmapColor = (level) => {
    switch (level) {
      case 1: return '#A7F3D0'; // Light emerald
      case 2: return '#34D399';
      case 3: return '#10B981';
      case 4: return '#047857'; // Deep emerald
      default: return '#F1F5F9'; // Gray
    }
  };

  return (
    <div style={{ padding: 'var(--spacing-8) 0 var(--spacing-16)', backgroundColor: 'var(--color-bg-main)', minHeight: 'calc(100vh - 120px)' }}>
      <div className="container">
        {/* Welcome Hero Banner */}
        <div
          style={{
            backgroundColor: '#0F172A',
            color: '#FFFFFF',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--spacing-8)',
            marginBottom: 'var(--spacing-8)',
            boxShadow: 'var(--shadow-xl)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--spacing-6)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Badge variant="brand">Level {levelInfo.level}</Badge>
                <span style={{ fontSize: 'var(--font-size-xs)', color: '#94A3B8', fontWeight: 600 }}>
                  Developer Portal
                </span>
              </div>

              <h1 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800, margin: 0, marginBottom: '6px' }}>
                Welcome Back, @{user?.username || 'Developer'}!
              </h1>
              <p style={{ color: '#94A3B8', fontSize: 'var(--font-size-base)', margin: 0, maxWidth: '600px' }}>
                Track your active daily coding streak, 365-day activity matrix, weekly tasks, and learning domain progress.
              </p>
            </div>

            {/* Streak & XP Metric Cards */}
            <div style={{ display: 'flex', gap: 'var(--spacing-4)', flexWrap: 'wrap' }}>
              <div style={{ backgroundColor: '#1E293B', padding: '16px 20px', borderRadius: 'var(--radius-lg)', textAlign: 'center', minWidth: '130px', border: '1px solid #334155' }}>
                <div style={{ color: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '11px', fontWeight: 700 }}>
                  <Flame size={16} fill="#F59E0B" /> ACTIVE STREAK
                </div>
                <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 900, color: '#FFFFFF', marginTop: '4px' }}>
                  {summary?.active_streak || 0} Days
                </div>
              </div>

              <div style={{ backgroundColor: '#1E293B', padding: '16px 20px', borderRadius: 'var(--radius-lg)', textAlign: 'center', minWidth: '130px', border: '1px solid #334155' }}>
                <div style={{ color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '11px', fontWeight: 700 }}>
                  <Zap size={16} fill="#10B981" /> TOTAL XP
                </div>
                <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 900, color: '#FFFFFF', marginTop: '4px' }}>
                  {levelInfo.total_xp}
                </div>
              </div>
            </div>
          </div>

          {/* Level Progress Bar */}
          <div style={{ marginTop: 'var(--spacing-6)', paddingTop: 'var(--spacing-4)', borderTop: '1px solid #334155', maxWidth: '560px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-xs)', color: '#94A3B8', marginBottom: '6px', fontWeight: 600 }}>
              <span>Level {levelInfo.level}: {levelInfo.title}</span>
              <span style={{ color: '#0082FF' }}>{levelInfo.progress_percentage}% to L{levelInfo.level + 1}</span>
            </div>
            <ProgressBar progress={levelInfo.progress_percentage} color="#0082FF" />
          </div>
        </div>

        {/* 365-Day Activity Heatmap Grid */}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={20} color="#0082FF" />
              <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, margin: 0 }}>
                {summary?.total_activities_365 || 0} Contributions in the Past Year
              </h2>
            </div>

            {/* Intensity Legend */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--color-text-muted)' }}>
              <span>Less</span>
              {[0, 1, 2, 3, 4].map((lvl) => (
                <div
                  key={lvl}
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '2px',
                    backgroundColor: getHeatmapColor(lvl),
                  }}
                />
              ))}
              <span>More</span>
            </div>
          </div>

          {/* Heatmap Grid Matrix */}
          <div style={{ overflowX: 'auto', paddingBottom: '8px' }}>
            <div style={{ display: 'flex', gap: '3px', minWidth: '720px' }}>
              {heatmapColumns.map((col, colIdx) => (
                <div key={colIdx} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  {col.map((day, dayIdx) => (
                    <div
                      key={dayIdx}
                      title={`${day.date}: ${day.count} activities`}
                      style={{
                        width: '11px',
                        height: '11px',
                        borderRadius: '2px',
                        backgroundColor: getHeatmapColor(day.level),
                        transition: 'transform 0.1s ease',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.3)')}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Action Navigation Grid */}
        <h2 style={{ fontSize: 'var(--font-size-xl)', marginBottom: 'var(--spacing-6)' }}>Platform Modules</h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--spacing-6)' }}>
          <Card hoverable style={{ borderLeft: '4px solid #0082FF' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-3)' }}>
              <Badge variant="brand" icon={Layers}>Domains</Badge>
              <span style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800 }}>{counts.enrolled_domains || 0}</span>
            </div>
            <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, marginBottom: '4px' }}>My Learning Domains</h3>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-4)' }}>
              Enrolled domain workspaces & skill roadmaps.
            </p>
            <Link to="/dashboard/domains">
              <Button variant="ghost" size="sm" icon={ArrowRight} iconPosition="right">Open Workspace</Button>
            </Link>
          </Card>

          <Card hoverable style={{ borderLeft: '4px solid #10B981' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-3)' }}>
              <Badge variant="success" icon={CheckSquare}>Weekly Tasks</Badge>
              <span style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800 }}>{counts.completed_tasks || 0}</span>
            </div>
            <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, marginBottom: '4px' }}>Weekly To-Dos</h3>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-4)' }}>
              Interactive developer tasks & weekly goals.
            </p>
            <Link to="/dashboard/tasks">
              <Button variant="ghost" size="sm" icon={ArrowRight} iconPosition="right">Open Tasks</Button>
            </Link>
          </Card>

          <Card hoverable style={{ borderLeft: '4px solid #F59E0B' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-3)' }}>
              <Badge variant="brand" icon={Code}>Projects</Badge>
              <span style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800 }}>{counts.projects || 0}</span>
            </div>
            <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, marginBottom: '4px' }}>Portfolio Projects</h3>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-4)' }}>
              Real-world engineering projects & GitHub sync.
            </p>
            <Link to="/dashboard/projects">
              <Button variant="ghost" size="sm" icon={ArrowRight} iconPosition="right">Open Projects</Button>
            </Link>
          </Card>

          <Card hoverable style={{ borderLeft: '4px solid #8B5CF6' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-3)' }}>
              <Badge variant="cyan" icon={BookOpen}>Developer Notes</Badge>
              <span style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800 }}>{counts.notes || 0}</span>
            </div>
            <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, marginBottom: '4px' }}>Notes & Snippets</h3>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-4)' }}>
              Technical cheat sheets & Markdown knowledge.
            </p>
            <Link to="/dashboard/notes">
              <Button variant="ghost" size="sm" icon={ArrowRight} iconPosition="right">Open Notes</Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
};
