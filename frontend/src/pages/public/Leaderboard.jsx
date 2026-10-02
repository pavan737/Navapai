import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Award, Zap, ShieldCheck, User, Sparkles, ExternalLink } from 'lucide-react';
import api from '../../services/api';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { LoadingState } from '../../components/feedback/LoadingState';

export const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const res = await api.get('gamification/leaderboard/');
        const data = Array.isArray(res.data) ? res.data : (res.data.results || []);
        setLeaderboard(data);
      } catch (err) {
        console.error('Failed to load leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <div style={{ padding: 'var(--spacing-10) 0 var(--spacing-16)', backgroundColor: 'var(--color-bg-main)', minHeight: 'calc(100vh - 120px)' }}>
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-10)' }}>
          <Badge variant="brand" style={{ marginBottom: 'var(--spacing-2)' }}>Community Rankings</Badge>
          <h1 style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--spacing-2)' }}>Developer Leaderboard</h1>
          <p style={{ maxWidth: '640px', margin: '0 auto', fontSize: 'var(--font-size-base)', color: 'var(--color-text-muted)' }}>
            Recognizing top engineers by skill domain mastery, project architecture, verified certifications, and total XP.
          </p>
        </div>

        {loading ? (
          <LoadingState message="Fetching global developer rankings..." />
        ) : (
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'var(--font-size-sm)' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--color-bg-section)', borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <th style={{ padding: '14px 20px', width: '80px', textAlign: 'center' }}>Rank</th>
                    <th style={{ padding: '14px 20px' }}>Developer</th>
                    <th style={{ padding: '14px 20px' }}>Developer Title</th>
                    <th style={{ padding: '14px 20px', textAlign: 'center' }}>Level</th>
                    <th style={{ padding: '14px 20px', textAlign: 'center' }}>Badges</th>
                    <th style={{ padding: '14px 20px', textAlign: 'right' }}>Total XP</th>
                    <th style={{ padding: '14px 20px', textAlign: 'center' }}>Portfolio</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((item) => {
                    const isTop1 = item.rank === 1;
                    const isTop2 = item.rank === 2;
                    const isTop3 = item.rank === 3;

                    return (
                      <tr
                        key={item.id}
                        style={{
                          borderBottom: '1px solid var(--color-border)',
                          backgroundColor: isTop1 ? 'rgba(245, 158, 11, 0.05)' : (isTop2 ? 'rgba(148, 163, 184, 0.05)' : (isTop3 ? 'rgba(217, 119, 6, 0.03)' : '#FFFFFF')),
                        }}
                      >
                        <td style={{ padding: '14px 20px', textAlign: 'center', fontWeight: 800, fontSize: 'var(--font-size-md)' }}>
                          {isTop1 ? (
                            <span style={{ color: '#F59E0B', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <Trophy size={18} /> 1
                            </span>
                          ) : isTop2 ? (
                            <span style={{ color: '#94A3B8', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <Trophy size={18} /> 2
                            </span>
                          ) : isTop3 ? (
                            <span style={{ color: '#D97706', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <Trophy size={18} /> 3
                            </span>
                          ) : (
                            `#${item.rank}`
                          )}
                        </td>

                        <td style={{ padding: '14px 20px', fontWeight: 700 }}>
                          <Link to={`/portfolio/${item.username}`} style={{ color: 'var(--color-text-main)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--color-bg-section)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'var(--color-primary)', border: '1px solid var(--color-border)' }}>
                              {item.username.charAt(0).toUpperCase()}
                            </div>
                            <span>@{item.username}</span>
                          </Link>
                        </td>

                        <td style={{ padding: '14px 20px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                          {item.level_info?.title || 'Junior Explorer'}
                        </td>

                        <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                          <Badge variant="brand">L{item.level_info?.level || 1}</Badge>
                        </td>

                        <td style={{ padding: '14px 20px', textAlign: 'center', fontWeight: 700 }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#10B981' }}>
                            <Award size={15} /> {item.unlocked_badges_count || 0}
                          </span>
                        </td>

                        <td style={{ padding: '14px 20px', textAlign: 'right', fontWeight: 900, color: '#F59E0B', fontSize: 'var(--font-size-base)' }}>
                          {item.total_xp} XP
                        </td>

                        <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                          <Link to={`/portfolio/${item.username}`} style={{ color: 'var(--color-primary)', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600, fontSize: '12px' }}>
                            Portfolio <ExternalLink size={12} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
