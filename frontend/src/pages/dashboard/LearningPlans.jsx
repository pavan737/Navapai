import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Compass,
  Plus,
  BookOpen,
  ArrowRight,
  Sparkles,
  Calendar,
  CheckCircle2,
  Clock,
  Layers,
  ListTodo,
  TrendingUp,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { ProgressBar } from '../../components/common/ProgressBar';
import { LoadingState } from '../../components/feedback/LoadingState';
import { EmptyState } from '../../components/feedback/EmptyState';

export const LearningPlans = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [plans, setPlans] = useState([]);
  const [userDomains, setUserDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);

  const [formData, setFormData] = useState({
    user_domain: '',
    title: '',
    description: '',
    target_completion_date: '',
    auto_populate_topics: true,
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const [plansRes, domainsRes] = await Promise.all([
          api.get('domains/my/plans/'),
          api.get('domains/my/'),
        ]);

        setPlans(plansRes.data.results || plansRes.data);
        setUserDomains(domainsRes.data.results || domainsRes.data);
      } catch (err) {
        console.error('Failed to load learning plans:', err);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleCreatePlan = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const payload = {
        ...formData,
        user_domain: formData.user_domain ? parseInt(formData.user_domain) : null,
        target_completion_date: formData.target_completion_date || null,
      };

      const res = await api.post('domains/my/plans/', payload);
      setPlans([res.data, ...plans]);
      setShowModal(false);
      navigate(`/dashboard/plans/${res.data.id}`);
    } catch (err) {
      console.error('Failed to create learning plan:', err);
    } finally {
      setCreating(false);
    }
  };

  if (authLoading || loading) {
    return <LoadingState fullPage message="Loading your curriculum roadmaps..." />;
  }

  return (
    <div style={{ padding: 'var(--spacing-10) 0 var(--spacing-16)', backgroundColor: 'var(--color-bg-main)' }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--spacing-4)', marginBottom: 'var(--spacing-8)' }}>
          <div>
            <Badge variant="brand" style={{ marginBottom: 'var(--spacing-2)' }}>Structured Roadmaps</Badge>
            <h1 style={{ fontSize: 'var(--font-size-3xl)' }}>Personal Learning Plans</h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-base)' }}>
              Track topic-by-topic curriculum milestones, log study insights, and monitor verified completion rates.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 'var(--spacing-3)' }}>
            <Link to="/dashboard/domains">
              <Button variant="secondary" icon={Layers}>
                My Enrolled Domains
              </Button>
            </Link>
            <Button variant="primary" icon={Plus} onClick={() => setShowModal(true)}>
              New Learning Plan
            </Button>
          </div>
        </div>

        {/* Plans Grid */}
        {plans.length === 0 ? (
          <EmptyState
            title="No Learning Plans Created Yet"
            description="Generate a structured learning plan from any of your enrolled domains to start tracking canonical curriculum topics."
            actionLabel="Create First Learning Plan"
            onAction={() => setShowModal(true)}
          />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 'var(--spacing-6)' }}>
            {plans.map((plan) => (
              <Card key={plan.id} hoverable style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-3)' }}>
                  <Badge variant={plan.status === 'COMPLETED' ? 'success' : 'brand'}>
                    {plan.status === 'COMPLETED' ? 'Completed Plan' : 'Active Plan'}
                  </Badge>
                  {plan.user_domain_name && (
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-primary)', fontWeight: 600 }}>
                      {plan.user_domain_name}
                    </span>
                  )}
                </div>

                <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-2)' }}>
                  <Link to={`/dashboard/plans/${plan.id}`} style={{ color: 'var(--color-text-main)' }}>
                    {plan.title}
                  </Link>
                </h3>

                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', flex: 1, marginBottom: 'var(--spacing-4)', lineHeight: 1.5 }}>
                  {plan.description || 'Structured topic roadmap with interactive milestone verification.'}
                </p>

                <div style={{ marginBottom: 'var(--spacing-4)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-xs)', marginBottom: '4px', fontWeight: 600 }}>
                    <span>{plan.completed_topics} of {plan.total_topics} Topics Completed</span>
                    <span>{plan.progress_percentage}%</span>
                  </div>
                  <ProgressBar progress={plan.progress_percentage} color="#0082FF" />
                </div>

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
                  <span style={{ color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={12} /> Target: <strong>{plan.target_completion_date || 'Flexible'}</strong>
                  </span>
                  <Link
                    to={`/dashboard/plans/${plan.id}`}
                    style={{
                      color: 'var(--color-primary)',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    Open Roadmap <ArrowRight size={12} />
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Create Plan Modal */}
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
                maxWidth: '520px',
                boxShadow: 'var(--shadow-xl)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-4)' }}>
                <h3 style={{ fontSize: 'var(--font-size-xl)' }}>Create Learning Plan</h3>
                <button onClick={() => setShowModal(false)} style={{ fontSize: '18px', color: 'var(--color-text-muted)', cursor: 'pointer' }}>✕</button>
              </div>

              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-4)' }}>
                Link your plan to an enrolled domain to automatically populate canonical topics and milestones.
              </p>

              <form onSubmit={handleCreatePlan} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
                <div>
                  <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                    Select Enrolled Domain
                  </label>
                  <select
                    value={formData.user_domain}
                    onChange={(e) => {
                      const sel = userDomains.find((d) => d.id === parseInt(e.target.value));
                      setFormData({
                        ...formData,
                        user_domain: e.target.value,
                        title: sel ? `${sel.original_name} Mastery Roadmap` : formData.title,
                      });
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border)',
                      backgroundColor: '#FFFFFF',
                      fontSize: 'var(--font-size-sm)',
                    }}
                  >
                    <option value="">None (Custom Freeform Plan)</option>
                    {userDomains.map((ud) => (
                      <option key={ud.id} value={ud.id}>
                        {ud.original_name} ({ud.community_domain_details ? 'Canonical' : 'Custom'})
                      </option>
                    ))}
                  </select>
                </div>

                <Input
                  label="Learning Plan Title"
                  required
                  placeholder="e.g. AWS Solutions Architect 90-Day Roadmap"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>Description</label>
                  <textarea
                    rows={3}
                    placeholder="Key focus areas, projects to build, and certification goals..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border)',
                      fontFamily: 'inherit',
                      fontSize: 'var(--font-size-sm)',
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                    Target Completion Date
                  </label>
                  <input
                    type="date"
                    value={formData.target_completion_date}
                    onChange={(e) => setFormData({ ...formData, target_completion_date: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border)',
                      fontSize: 'var(--font-size-sm)',
                    }}
                  />
                </div>

                {formData.user_domain && (
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--font-size-sm)', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.auto_populate_topics}
                      onChange={(e) => setFormData({ ...formData, auto_populate_topics: e.target.checked })}
                    />
                    <span>Auto-populate verified canonical curriculum topics</span>
                  </label>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-3)', marginTop: 'var(--spacing-2)' }}>
                  <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" loading={creating}>
                    Create Roadmap
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
