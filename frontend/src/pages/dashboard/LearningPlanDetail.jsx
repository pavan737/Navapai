import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertCircle,
  Circle,
  Save,
  BookOpen,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  FileText,
  Trash2,
  Sparkles,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { ProgressBar } from '../../components/common/ProgressBar';
import { LoadingState } from '../../components/feedback/LoadingState';
import { ErrorState } from '../../components/feedback/ErrorState';

export const LearningPlanDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedTopicId, setExpandedTopicId] = useState(null);
  const [updatingTopicId, setUpdatingTopicId] = useState(null);
  const [notesState, setNotesState] = useState({});

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchPlan = async () => {
      try {
        const res = await api.get(`domains/my/plans/${id}/`);
        setPlan(res.data);
        const initialNotes = {};
        res.data.plan_topics?.forEach((pt) => {
          initialNotes[pt.id] = pt.notes || '';
        });
        setNotesState(initialNotes);
      } catch (err) {
        console.error('Failed to load learning plan:', err);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchPlan();
    }
  }, [id, isAuthenticated, authLoading, navigate]);

  const handleStatusChange = async (planTopicId, newStatus) => {
    setUpdatingTopicId(planTopicId);
    try {
      const res = await api.patch(`domains/my/plans/${id}/topics/${planTopicId}/`, {
        status: newStatus,
      });
      setPlan(res.data.plan);
    } catch (err) {
      console.error('Failed to update topic status:', err);
    } finally {
      setUpdatingTopicId(null);
    }
  };

  const handleSaveTopicNotes = async (planTopicId) => {
    setUpdatingTopicId(planTopicId);
    try {
      const res = await api.patch(`domains/my/plans/${id}/topics/${planTopicId}/`, {
        notes: notesState[planTopicId] || '',
      });
      setPlan(res.data.plan);
    } catch (err) {
      console.error('Failed to save topic notes:', err);
    } finally {
      setUpdatingTopicId(null);
    }
  };

  const handleDeletePlan = async () => {
    if (window.confirm('Are you sure you want to delete this learning roadmap?')) {
      try {
        await api.delete(`domains/my/plans/${id}/`);
        navigate('/dashboard/plans');
      } catch (err) {
        console.error('Failed to delete plan:', err);
      }
    }
  };

  if (authLoading || loading) {
    return <LoadingState fullPage message="Loading curriculum roadmap..." />;
  }

  if (!plan) {
    return (
      <div className="container" style={{ padding: 'var(--spacing-12) 0' }}>
        <ErrorState
          title="Learning Plan Not Found"
          message="This roadmap does not exist or has been deleted."
          onRetry={() => navigate('/dashboard/plans')}
        />
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge variant="success">Completed</Badge>;
      case 'IN_PROGRESS':
        return <Badge variant="brand">In Progress</Badge>;
      case 'BLOCKED':
        return <Badge variant="warning">Blocked</Badge>;
      default:
        return <Badge variant="neutral">Not Started</Badge>;
    }
  };

  const getDifficultyVariant = (diff) => {
    switch (diff) {
      case 'BEGINNER':
        return 'success';
      case 'INTERMEDIATE':
        return 'brand';
      case 'ADVANCED':
        return 'warning';
      case 'EXPERT':
        return 'danger';
      default:
        return 'neutral';
    }
  };

  return (
    <div style={{ padding: 'var(--spacing-8) 0 var(--spacing-16)', backgroundColor: 'var(--color-bg-main)' }}>
      <div className="container">
        {/* Back Link */}
        <Link
          to="/dashboard/plans"
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
          <ArrowLeft size={16} /> Back to All Learning Plans
        </Link>

        {/* Roadmap Overview Banner */}
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
                <Badge variant={plan.status === 'COMPLETED' ? 'success' : 'brand'}>
                  {plan.status === 'COMPLETED' ? 'Completed Plan' : 'Active Roadmap'}
                </Badge>
                {plan.user_domain_name && (
                  <Badge variant="cyan">Domain: {plan.user_domain_name}</Badge>
                )}
              </div>
              <h1 style={{ fontSize: 'var(--font-size-3xl)', color: 'var(--color-text-main)' }}>
                {plan.title}
              </h1>
            </div>

            <div style={{ display: 'flex', gap: 'var(--spacing-3)' }}>
              {plan.user_domain && (
                <Link to={`/dashboard/domains/${plan.user_domain}`}>
                  <Button variant="secondary" size="sm" icon={Layers}>
                    Open Domain Workspace
                  </Button>
                </Link>
              )}
              <Button variant="ghost" size="sm" onClick={handleDeletePlan} style={{ color: 'var(--color-error)' }}>
                <Trash2 size={16} />
              </Button>
            </div>
          </div>

          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-base)', maxWidth: '780px', marginBottom: 'var(--spacing-6)' }}>
            {plan.description || 'Master each canonical topic below by marking progress and logging your implementation notes.'}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--spacing-4)', paddingTop: 'var(--spacing-4)', borderTop: '1px solid var(--color-border)' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: '4px', fontWeight: 600 }}>
                <span>Curriculum Mastery</span>
                <span>{plan.completed_topics} / {plan.total_topics} Topics ({plan.progress_percentage}%)</span>
              </div>
              <ProgressBar progress={plan.progress_percentage} color="#0082FF" />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
              <Calendar size={16} color="#0082FF" />
              <span>Target: <strong>{plan.target_completion_date || 'Flexible Timeline'}</strong></span>
            </div>
          </div>
        </div>

        {/* Topics List Header */}
        <div style={{ marginBottom: 'var(--spacing-6)' }}>
          <h2 style={{ fontSize: 'var(--font-size-2xl)' }}>Roadmap Topics & Milestones</h2>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
            Update topic status to synchronize verified progress to your portfolio.
          </p>
        </div>

        {/* Topics Checklist */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
          {plan.plan_topics?.map((pt, idx) => {
            const isExpanded = expandedTopicId === pt.id;
            const topic = pt.topic_details;

            return (
              <Card
                key={pt.id}
                style={{
                  padding: 'var(--spacing-6)',
                  borderLeft: pt.status === 'COMPLETED' ? '4px solid #10B981' : (pt.status === 'IN_PROGRESS' ? '4px solid #0082FF' : '4px solid var(--color-border)'),
                  backgroundColor: pt.status === 'COMPLETED' ? 'var(--color-bg-section)' : '#FFFFFF',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--spacing-4)' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--color-text-muted)' }}>
                        Topic {idx + 1}
                      </span>
                      {topic && (
                        <Badge variant={getDifficultyVariant(topic.difficulty)}>
                          {topic.difficulty}
                        </Badge>
                      )}
                      {topic && (
                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={12} /> {topic.estimated_hours}h estimated
                        </span>
                      )}
                    </div>

                    <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: '4px' }}>
                      {topic ? topic.title : 'Curriculum Topic'}
                    </h3>

                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', lineHeight: 1.5, marginBottom: '8px' }}>
                      {topic ? topic.description : 'Master key fundamentals and architectural design.'}
                    </p>
                  </div>

                  {/* Status Action Buttons */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    {[
                      { status: 'NOT_STARTED', label: 'Not Started' },
                      { status: 'IN_PROGRESS', label: 'In Progress' },
                      { status: 'COMPLETED', label: 'Completed' },
                      { status: 'BLOCKED', label: 'Blocked' },
                    ].map((btn) => (
                      <button
                        key={btn.status}
                        onClick={() => handleStatusChange(pt.id, btn.status)}
                        disabled={updatingTopicId === pt.id}
                        style={{
                          padding: '6px 12px',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          border: pt.status === btn.status ? '1px solid transparent' : '1px solid var(--color-border)',
                          backgroundColor: pt.status === btn.status
                            ? (btn.status === 'COMPLETED' ? '#10B981' : (btn.status === 'IN_PROGRESS' ? '#0082FF' : (btn.status === 'BLOCKED' ? '#F59E0B' : '#6B7280')))
                            : '#FFFFFF',
                          color: pt.status === btn.status ? '#FFFFFF' : 'var(--color-text-muted)',
                          transition: 'all var(--transition-fast)',
                        }}
                      >
                        {btn.label}
                      </button>
                    ))}

                    <button
                      onClick={() => setExpandedTopicId(isExpanded ? null : pt.id)}
                      style={{
                        padding: '6px 10px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--color-border)',
                        backgroundColor: 'transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '12px',
                        color: 'var(--color-text-muted)',
                      }}
                    >
                      <span>Notes & Milestones</span>
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>
                </div>

                {/* Collapsible Milestones & Notes Section */}
                {isExpanded && (
                  <div style={{ marginTop: 'var(--spacing-6)', paddingTop: 'var(--spacing-4)', borderTop: '1px solid var(--color-border)' }}>
                    {/* Sub-Milestones */}
                    {topic?.milestones && topic.milestones.length > 0 && (
                      <div style={{ marginBottom: 'var(--spacing-4)' }}>
                        <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, marginBottom: 'var(--spacing-2)' }}>
                          Vetted Canonical Milestones:
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {topic.milestones.map((m) => (
                            <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-main)' }}>
                              <CheckCircle2 size={14} color="#0082FF" />
                              <span>{m.title}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Topic Notes */}
                    <div>
                      <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                        Personal Study Notes & Key Insights for this Topic:
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Log what you learned, links to documentation, or repository commits..."
                        value={notesState[pt.id] || ''}
                        onChange={(e) => setNotesState({ ...notesState, [pt.id]: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--color-border)',
                          fontSize: 'var(--font-size-xs)',
                          fontFamily: 'inherit',
                          backgroundColor: '#FFFFFF',
                          marginBottom: '8px',
                        }}
                      />
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                          size="sm"
                          variant="secondary"
                          icon={Save}
                          loading={updatingTopicId === pt.id}
                          onClick={() => handleSaveTopicNotes(pt.id)}
                        >
                          Save Notes
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};
