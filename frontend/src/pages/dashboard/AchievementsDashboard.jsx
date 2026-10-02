import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Award,
  Zap,
  ShieldCheck,
  Flame,
  Star,
  Trophy,
  CheckCircle2,
  Lock,
  Sparkles,
  Compass,
  Layers,
  Code,
  CheckSquare,
  BookOpen,
  Bookmark,
  RefreshCw,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { ProgressBar } from '../../components/common/ProgressBar';
import { LoadingState } from '../../components/feedback/LoadingState';

const getBadgeIconComponent = (iconName) => {
  switch (iconName) {
    case 'Compass': return Compass;
    case 'Layers': return Layers;
    case 'Code': return Code;
    case 'Sparkles': return Sparkles;
    case 'CheckSquare': return CheckSquare;
    case 'BookOpen': return BookOpen;
    case 'Bookmark': return Bookmark;
    case 'ShieldCheck': return ShieldCheck;
    case 'Flame': return Flame;
    default: return Award;
  }
};

export const AchievementsDashboard = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [allBadges, setAllBadges] = useState([]);
  const [achievementsData, setAchievementsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const [badgesRes, userAchRes] = await Promise.all([
          api.get('gamification/badges/'),
          api.get('gamification/my-achievements/'),
        ]);

        setAllBadges(Array.isArray(badgesRes.data) ? badgesRes.data : (badgesRes.data.results || []));
        setAchievementsData(userAchRes.data);
      } catch (err) {
        console.error('Failed to load achievements data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleManualCheck = async () => {
    setRefreshing(true);
    try {
      await api.post('gamification/check-achievements/');
      const [badgesRes, userAchRes] = await Promise.all([
        api.get('gamification/badges/'),
        api.get('gamification/my-achievements/'),
      ]);
      setAllBadges(Array.isArray(badgesRes.data) ? badgesRes.data : (badgesRes.data.results || []));
      setAchievementsData(userAchRes.data);
    } catch (err) {
      console.error('Failed to re-evaluate badges:', err);
    } finally {
      setRefreshing(false);
    }
  };

  if (authLoading || loading) {
    return <LoadingState fullPage message="Loading developer gamification & achievements..." />;
  }

  const levelInfo = achievementsData?.level_info || { level: 1, title: 'Junior Explorer', total_xp: 0, progress_percentage: 0, xp_in_current_level: 0, xp_for_next_level: 200 };

  return (
    <div style={{ padding: 'var(--spacing-8) 0 var(--spacing-16)', backgroundColor: 'var(--color-bg-main)', minHeight: 'calc(100vh - 120px)' }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--spacing-4)', marginBottom: 'var(--spacing-8)' }}>
          <div>
            <Badge variant="brand" style={{ marginBottom: 'var(--spacing-2)' }}>Phase 12: Gamification & Badges</Badge>
            <h1 style={{ fontSize: 'var(--font-size-3xl)' }}>Developer Achievements & Skill Badges</h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-base)' }}>
              Earn XP, level up your engineering status, unlock skill badges, and rank on the public developer leaderboard.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 'var(--spacing-3)' }}>
            <Button variant="secondary" icon={RefreshCw} loading={refreshing} onClick={handleManualCheck}>
              Re-evaluate Badges
            </Button>
            <Link to="/leaderboard">
              <Button variant="primary" icon={Trophy}>
                View Leaderboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Level & XP Hero Banner */}
        <div
          style={{
            backgroundColor: '#1E293B',
            color: '#FFFFFF',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--spacing-8)',
            marginBottom: 'var(--spacing-8)',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 'var(--spacing-6)',
          }}
        >
          <div style={{ flex: 1, minWidth: '280px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)', marginBottom: 'var(--spacing-2)' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: '#0082FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: 'var(--font-size-xl)',
                }}
              >
                L{levelInfo.level}
              </div>
              <div>
                <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, margin: 0 }}>{levelInfo.title}</h2>
                <div style={{ fontSize: 'var(--font-size-sm)', color: '#94A3B8' }}>Developer Rank Level {levelInfo.level}</div>
              </div>
            </div>

            <div style={{ marginTop: 'var(--spacing-4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-xs)', marginBottom: '6px', fontWeight: 600 }}>
                <span>XP Progress to Level {levelInfo.level + 1}</span>
                <span style={{ color: '#0082FF' }}>{levelInfo.xp_in_current_level} / {levelInfo.xp_for_next_level} XP</span>
              </div>
              <ProgressBar progress={levelInfo.progress_percentage} color="#0082FF" />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--spacing-6)', alignItems: 'center', backgroundColor: '#0F172A', padding: 'var(--spacing-6)', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600 }}>TOTAL XP</div>
              <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 900, color: '#F59E0B' }}>{levelInfo.total_xp}</div>
            </div>

            <div style={{ borderLeft: '1px solid #334155', height: '40px' }} />

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600 }}>BADGES UNLOCKED</div>
              <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 900, color: '#10B981' }}>{achievementsData?.unlocked_badges_count || 0}</div>
            </div>
          </div>
        </div>

        {/* Badges Gallery */}
        <h2 style={{ fontSize: 'var(--font-size-xl)', marginBottom: 'var(--spacing-6)' }}>Skill Badges Gallery</h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--spacing-6)' }}>
          {allBadges.map((badge) => {
            const isUnlocked = badge.is_unlocked;
            const IconComp = getBadgeIconComponent(badge.icon_name);

            return (
              <Card
                key={badge.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justify: 'space-between',
                  backgroundColor: isUnlocked ? '#FFFFFF' : '#FAFAFA',
                  opacity: isUnlocked ? 1 : 0.75,
                  border: isUnlocked ? '2px solid #10B981' : '1px solid var(--color-border)',
                  boxShadow: isUnlocked ? '0 4px 12px rgba(16, 185, 129, 0.15)' : 'none',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-4)' }}>
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: 'var(--radius-lg)',
                        backgroundColor: isUnlocked ? '#ECFDF5' : 'var(--color-bg-section)',
                        color: isUnlocked ? '#10B981' : 'var(--color-text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <IconComp size={24} />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Badge variant={isUnlocked ? 'success' : 'neutral'}>
                        +{badge.points_reward} XP
                      </Badge>
                      {isUnlocked ? (
                        <CheckCircle2 size={20} color="#10B981" />
                      ) : (
                        <Lock size={18} color="var(--color-text-muted)" />
                      )}
                    </div>
                  </div>

                  <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 700, marginBottom: '4px', color: isUnlocked ? 'var(--color-text-main)' : 'var(--color-text-muted)' }}>
                    {badge.name}
                  </h3>

                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', lineHeight: 1.5, margin: 0 }}>
                    {badge.description}
                  </p>
                </div>

                <div style={{ marginTop: 'var(--spacing-4)', paddingTop: 'var(--spacing-3)', borderTop: '1px solid var(--color-border)', fontSize: '11px', fontWeight: 600, color: isUnlocked ? '#10B981' : 'var(--color-text-muted)' }}>
                  {isUnlocked ? `Unlocked ${badge.unlocked_at ? new Date(badge.unlocked_at).toLocaleDateString() : ''}` : 'Locked (Complete requirement)'}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};
