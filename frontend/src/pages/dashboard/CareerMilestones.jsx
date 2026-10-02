import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Award,
  Briefcase,
  Plus,
  Calendar,
  ExternalLink,
  CheckCircle2,
  Trash2,
  Sparkles,
  ShieldCheck,
  Building,
  TrendingUp,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { LoadingState } from '../../components/feedback/LoadingState';
import { EmptyState } from '../../components/feedback/EmptyState';

export const CareerMilestones = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [certifications, setCertifications] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showCertModal, setShowCertModal] = useState(false);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [certForm, setCertForm] = useState({
    title: '',
    issuing_organization: '',
    issue_date: '',
    expiration_date: '',
    credential_id: '',
    credential_url: '',
  });

  const [milestoneForm, setMilestoneForm] = useState({
    title: '',
    company_or_org: '',
    milestone_type: 'JOB',
    date_achieved: '',
    description: '',
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const [certRes, mileRes] = await Promise.all([
          api.get('career/certifications/'),
          api.get('career/milestones/'),
        ]);

        setCertifications(Array.isArray(certRes.data) ? certRes.data : (certRes.data.results || []));
        setMilestones(Array.isArray(mileRes.data) ? mileRes.data : (mileRes.data.results || []));
      } catch (err) {
        console.error('Failed to load career data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Cert Submit
  const handleCertSubmit = async (e) => {
    e.preventDefault();
    if (!certForm.title.trim() || !certForm.issuing_organization.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.post('career/certifications/', certForm);
      setCertifications([res.data, ...certifications]);
      setShowCertModal(false);
      setCertForm({
        title: '',
        issuing_organization: '',
        issue_date: '',
        expiration_date: '',
        credential_id: '',
        credential_url: '',
      });
    } catch (err) {
      console.error('Failed to add certification:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Milestone Submit
  const handleMilestoneSubmit = async (e) => {
    e.preventDefault();
    if (!milestoneForm.title.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.post('career/milestones/', milestoneForm);
      setMilestones([res.data, ...milestones]);
      setShowMilestoneModal(false);
      setMilestoneForm({
        title: '',
        company_or_org: '',
        milestone_type: 'JOB',
        date_achieved: '',
        description: '',
      });
    } catch (err) {
      console.error('Failed to add milestone:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete handlers
  const handleDeleteCert = async (id) => {
    if (window.confirm('Delete this certification?')) {
      try {
        await api.delete(`career/certifications/${id}/`);
        setCertifications((prev) => prev.filter((c) => c.id !== id));
      } catch (err) {
        console.error('Failed to delete cert:', err);
      }
    }
  };

  const handleDeleteMilestone = async (id) => {
    if (window.confirm('Delete this milestone?')) {
      try {
        await api.delete(`career/milestones/${id}/`);
        setMilestones((prev) => prev.filter((m) => m.id !== id));
      } catch (err) {
        console.error('Failed to delete milestone:', err);
      }
    }
  };

  if (authLoading || loading) {
    return <LoadingState fullPage message="Loading career milestones & certifications..." />;
  }

  return (
    <div style={{ padding: 'var(--spacing-8) 0 var(--spacing-16)', backgroundColor: 'var(--color-bg-main)', minHeight: 'calc(100vh - 120px)' }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--spacing-4)', marginBottom: 'var(--spacing-8)' }}>
          <div>
            <Badge variant="brand" style={{ marginBottom: 'var(--spacing-2)' }}>Phase 11: Career & Experience</Badge>
            <h1 style={{ fontSize: 'var(--font-size-3xl)' }}>Certifications & Career Timeline</h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-base)' }}>
              Showcase verified industry credentials, technical promotions, and engineering achievements.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 'var(--spacing-3)' }}>
            <Button variant="outline" icon={Award} onClick={() => setShowCertModal(true)}>
              Add Certification
            </Button>
            <Button variant="primary" icon={Plus} onClick={() => setShowMilestoneModal(true)}>
              Add Career Milestone
            </Button>
          </div>
        </div>

        {/* Section 1: Verified Certifications */}
        <div style={{ marginBottom: 'var(--spacing-10)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--spacing-4)' }}>
            <ShieldCheck size={22} color="#0082FF" />
            <h2 style={{ fontSize: 'var(--font-size-xl)' }}>Verified Professional Certifications</h2>
          </div>

          {certifications.length === 0 ? (
            <Card style={{ textAlign: 'center', padding: 'var(--spacing-8)' }}>
              <p style={{ color: 'var(--color-text-muted)' }}>No certifications added yet. Click "Add Certification" to feature AWS, GCP, CKA, or Azure badges.</p>
            </Card>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--spacing-6)' }}>
              {certifications.map((cert) => (
                <Card key={cert.id} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-3)' }}>
                      <Badge variant="brand" icon={Award}>Verified</Badge>
                      <button onClick={() => handleDeleteCert(cert.id)} style={{ background: 'none', border: 'none', color: 'var(--color-error)', cursor: 'pointer' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, marginBottom: '4px' }}>{cert.title}</h3>
                    <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-primary)', marginBottom: '8px' }}>
                      {cert.issuing_organization}
                    </div>

                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: '12px' }}>
                      Issued: {cert.issue_date} {cert.expiration_date ? `| Expires: ${cert.expiration_date}` : '| No Expiration'}
                    </div>

                    {cert.credential_id && (
                      <div style={{ fontSize: '11px', fontFamily: 'monospace', backgroundColor: 'var(--color-bg-section)', padding: '4px 8px', borderRadius: 'var(--radius-sm)', marginBottom: '12px' }}>
                        ID: {cert.credential_id}
                      </div>
                    )}
                  </div>

                  {cert.credential_url && (
                    <a
                      href={cert.credential_url}
                      target="_blank"
                      rel="noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--color-primary)', textDecoration: 'none' }}
                    >
                      Verify Credential <ExternalLink size={12} />
                    </a>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Section 2: Career Timeline */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--spacing-6)' }}>
            <TrendingUp size={22} color="#10B981" />
            <h2 style={{ fontSize: 'var(--font-size-xl)' }}>Career Growth & Engineering Timeline</h2>
          </div>

          {milestones.length === 0 ? (
            <Card style={{ textAlign: 'center', padding: 'var(--spacing-8)' }}>
              <p style={{ color: 'var(--color-text-muted)' }}>No career milestones logged yet. Record your job promotions, talks, or major engineering achievements.</p>
            </Card>
          ) : (
            <div style={{ position: 'relative', paddingLeft: '24px', borderLeft: '2px solid var(--color-primary)' }}>
              {milestones.map((m) => (
                <div key={m.id} style={{ position: 'relative', marginBottom: 'var(--spacing-8)' }}>
                  {/* Timeline Dot */}
                  <div
                    style={{
                      position: 'absolute',
                      left: '-31px',
                      top: '4px',
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-primary)',
                      border: '3px solid #FFFFFF',
                      boxShadow: '0 0 0 2px var(--color-primary)',
                    }}
                  />

                  <Card style={{ padding: 'var(--spacing-5) var(--spacing-6)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 700 }}>{m.title}</h3>
                        <Badge variant="cyan">{m.milestone_type.replace('_', ' ')}</Badge>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                          {m.date_achieved}
                        </span>
                        <button onClick={() => handleDeleteMilestone(m.id)} style={{ background: 'none', border: 'none', color: 'var(--color-error)', cursor: 'pointer' }}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    {m.company_or_org && (
                      <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Building size={13} /> {m.company_or_org}
                      </div>
                    )}

                    {m.description && (
                      <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.5 }}>
                        {m.description}
                      </p>
                    )}
                  </Card>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Certification Modal */}
        {showCertModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(17, 24, 39, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '16px' }}>
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-8)', width: '100%', maxWidth: '500px', boxShadow: 'var(--shadow-xl)' }}>
              <h3 style={{ fontSize: 'var(--font-size-xl)', marginBottom: 'var(--spacing-4)' }}>Add Professional Certification</h3>
              <form onSubmit={handleCertSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
                <Input label="Certification Title" required placeholder="AWS Certified Solutions Architect" value={certForm.title} onChange={(e) => setCertForm({ ...certForm, title: e.target.value })} />
                <Input label="Issuing Organization" required placeholder="Amazon Web Services" value={certForm.issuing_organization} onChange={(e) => setCertForm({ ...certForm, issuing_organization: e.target.value })} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-3)' }}>
                  <Input label="Issue Date" type="date" required value={certForm.issue_date} onChange={(e) => setCertForm({ ...certForm, issue_date: e.target.value })} />
                  <Input label="Expiration Date (Optional)" type="date" value={certForm.expiration_date} onChange={(e) => setCertForm({ ...certForm, expiration_date: e.target.value })} />
                </div>
                <Input label="Credential ID (Optional)" placeholder="AWS-12345678" value={certForm.credential_id} onChange={(e) => setCertForm({ ...certForm, credential_id: e.target.value })} />
                <Input label="Verification URL (Optional)" placeholder="https://aws.amazon.com/verification" value={certForm.credential_url} onChange={(e) => setCertForm({ ...certForm, credential_url: e.target.value })} />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-3)' }}>
                  <Button type="button" variant="secondary" onClick={() => setShowCertModal(false)}>Cancel</Button>
                  <Button type="submit" variant="primary" loading={submitting}>Save Certification</Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Career Milestone Modal */}
        {showMilestoneModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(17, 24, 39, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '16px' }}>
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-8)', width: '100%', maxWidth: '500px', boxShadow: 'var(--shadow-xl)' }}>
              <h3 style={{ fontSize: 'var(--font-size-xl)', marginBottom: 'var(--spacing-4)' }}>Add Career Milestone</h3>
              <form onSubmit={handleMilestoneSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
                <Input label="Milestone Title" required placeholder="Promoted to Senior Cloud Engineer" value={milestoneForm.title} onChange={(e) => setMilestoneForm({ ...milestoneForm, title: e.target.value })} />
                <Input label="Company / Organization" placeholder="TechCorp Systems" value={milestoneForm.company_or_org} onChange={(e) => setMilestoneForm({ ...milestoneForm, company_or_org: e.target.value })} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-3)' }}>
                  <div>
                    <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Milestone Type</label>
                    <select
                      value={milestoneForm.milestone_type}
                      onChange={(e) => setMilestoneForm({ ...milestoneForm, milestone_type: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', backgroundColor: '#FFFFFF', fontSize: 'var(--font-size-sm)' }}
                    >
                      <option value="JOB">New Job / Role</option>
                      <option value="PROMOTION">Promotion</option>
                      <option value="CERTIFICATION">Certification Earned</option>
                      <option value="PROJECT_LAUNCH">Project Launch</option>
                      <option value="OPEN_SOURCE">Open Source Milestone</option>
                      <option value="SPEAKER">Tech Talk / Speaker</option>
                      <option value="OTHER">General Milestone</option>
                    </select>
                  </div>
                  <Input label="Date Achieved" type="date" required value={milestoneForm.date_achieved} onChange={(e) => setMilestoneForm({ ...milestoneForm, date_achieved: e.target.value })} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>Description</label>
                  <textarea rows={3} placeholder="Key achievements or details..." value={milestoneForm.description} onChange={(e) => setMilestoneForm({ ...milestoneForm, description: e.target.value })} style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontFamily: 'inherit', fontSize: 'var(--font-size-sm)' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-3)' }}>
                  <Button type="button" variant="secondary" onClick={() => setShowMilestoneModal(false)}>Cancel</Button>
                  <Button type="submit" variant="primary" loading={submitting}>Save Milestone</Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
