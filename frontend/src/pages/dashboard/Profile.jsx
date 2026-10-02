import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Shield,
  Save,
  CheckCircle2,
  AlertCircle,
  Plus,
  X,
  Layers,
  Sparkles,
} from 'lucide-react';
import { GithubIcon as Github, LinkedinIcon as Linkedin } from '../../components/common/Icons';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { LoadingState } from '../../components/feedback/LoadingState';

export const Profile = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState({
    bio: '',
    location: '',
    github_username: '',
    linkedin_url: '',
    website_url: '',
    skills: [],
    portfolio_slug: '',
    is_portfolio_public: true,
    theme_color: '#0082FF',
    custom_headline: '',
    show_heatmap: true,
    show_certifications: true,
    show_badges: true,
  });

  const [newSkill, setNewSkill] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await api.get('auth/profile/');
        setProfileData({
          bio: res.data.bio || '',
          location: res.data.location || '',
          github_username: res.data.github_username || '',
          linkedin_url: res.data.linkedin_url || '',
          website_url: res.data.website_url || '',
          skills: Array.isArray(res.data.skills) ? res.data.skills : [],
          portfolio_slug: res.data.portfolio_slug || '',
          is_portfolio_public: res.data.is_portfolio_public ?? true,
          theme_color: res.data.theme_color || '#0082FF',
          custom_headline: res.data.custom_headline || '',
          show_heatmap: res.data.show_heatmap ?? true,
          show_certifications: res.data.show_certifications ?? true,
          show_badges: res.data.show_badges ?? true,
        });
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated, authLoading, navigate]);


  const handleAddSkill = (e) => {
    e.preventDefault();
    if (newSkill.trim() && !profileData.skills.includes(newSkill.trim())) {
      setProfileData({
        ...profileData,
        skills: [...profileData.skills, newSkill.trim()],
      });
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setProfileData({
      ...profileData,
      skills: profileData.skills.filter((s) => s !== skillToRemove),
    });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);
    try {
      await api.patch('auth/profile/', profileData);
      setSuccessMessage('Profile updated successfully.');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      console.error('Failed to save profile:', err);
      setErrorMessage('Could not update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return <LoadingState fullPage message="Loading developer profile..." />;
  }

  return (
    <div style={{ padding: 'var(--spacing-8) 0 var(--spacing-12)', backgroundColor: 'var(--color-bg-section)', minHeight: 'calc(100vh - 140px)' }}>
      <div className="container" style={{ maxWidth: '840px' }}>
        {/* Profile Header Card */}
        <Card style={{ padding: 'var(--spacing-8)', marginBottom: 'var(--spacing-6)', backgroundColor: '#FFFFFF' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-6)', flexWrap: 'wrap' }}>
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-primary)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'var(--font-size-2xl)',
                fontWeight: 700,
              }}
            >
              {user?.first_name ? user.first_name[0].toUpperCase() : user?.username?.[0]?.toUpperCase() || 'U'}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
                <h2 style={{ fontSize: 'var(--font-size-xl)' }}>
                  {user?.first_name} {user?.last_name}
                </h2>
                <Badge variant="brand">{user?.role || 'LEARNER'}</Badge>
                <Badge variant="cyan">{user?.subscription?.tier || 'FREE TIER'}</Badge>
              </div>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                @{user?.username} • {user?.email}
              </p>
            </div>
          </div>
        </Card>

        {/* Profile Editor Card */}
        <Card style={{ padding: 'var(--spacing-8)', backgroundColor: '#FFFFFF' }}>
          <div style={{ marginBottom: 'var(--spacing-6)' }}>
            <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: '4px' }}>Profile Settings & Skills</h3>
            <p style={{ fontSize: 'var(--font-size-sm)' }}>
              Customize your developer bio, verified skills, and external portfolio links.
            </p>
          </div>

          {successMessage && (
            <div style={{ backgroundColor: 'var(--color-success-subtle)', color: 'var(--color-success)', padding: '10px 14px', borderRadius: 'var(--radius-md)', marginBottom: 'var(--spacing-4)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--font-size-sm)' }}>
              <CheckCircle2 size={16} />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div style={{ backgroundColor: 'var(--color-error-subtle)', color: 'var(--color-error)', padding: '10px 14px', borderRadius: 'var(--radius-md)', marginBottom: 'var(--spacing-4)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--font-size-sm)' }}>
              <AlertCircle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-5)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-text-main)' }}>
                Bio
              </label>
              <textarea
                rows={3}
                placeholder="Software engineer interested in cloud infrastructure, microservices, and PostgreSQL..."
                value={profileData.bio}
                onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  fontFamily: 'inherit',
                  fontSize: 'var(--font-size-sm)',
                  backgroundColor: '#FFFFFF',
                  outline: 'none',
                }}
              />
            </div>

            <Input
              label="Location"
              icon={MapPin}
              placeholder="San Francisco, CA / Bengaluru, India / Remote"
              value={profileData.location}
              onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
            />

            {/* Skills Tag Management */}
            <div>
              <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-text-main)', display: 'block', marginBottom: '6px' }}>
                Verified Skills & Technologies
              </label>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                {profileData.skills.map((skill, index) => (
                  <span
                    key={index}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 10px',
                      backgroundColor: 'var(--color-bg-section)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-full)',
                      fontSize: 'var(--font-size-xs)',
                      fontWeight: 600,
                      color: 'var(--color-text-main)',
                    }}
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--color-text-muted)' }}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Add skill (e.g. AWS, React, Python, Docker)..."
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    fontSize: 'var(--font-size-sm)',
                    outline: 'none',
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkill(e);
                    }
                  }}
                />
                <Button type="button" variant="secondary" size="sm" icon={Plus} onClick={handleAddSkill}>
                  Add
                </Button>
              </div>
            </div>

            {/* External Links */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--spacing-4)' }}>
              <Input
                label="GitHub Username"
                icon={Github}
                placeholder="alexmorgan"
                value={profileData.github_username}
                onChange={(e) => setProfileData({ ...profileData, github_username: e.target.value })}
              />

              <Input
                label="LinkedIn Profile URL"
                icon={Linkedin}
                placeholder="https://linkedin.com/in/alexmorgan"
                value={profileData.linkedin_url}
                onChange={(e) => setProfileData({ ...profileData, linkedin_url: e.target.value })}
              />

              <Input
                label="Personal Portfolio / Website"
                icon={Globe}
                placeholder="https://alexmorgan.dev"
                value={profileData.website_url}
                onChange={(e) => setProfileData({ ...profileData, website_url: e.target.value })}
              />
            </div>

            {/* Public Portfolio Customizations (Phase 15) */}
            <div style={{ marginTop: 'var(--spacing-6)', paddingTop: 'var(--spacing-6)', borderTop: '1px solid var(--color-border)' }}>
              <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, marginBottom: 'var(--spacing-4)' }}>Public Portfolio & Showcase Customization</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--spacing-4)', marginBottom: 'var(--spacing-4)' }}>
                <Input
                  label="Custom Vanity Portfolio Slug"
                  placeholder="e.g. alex-cloud-architect"
                  value={profileData.portfolio_slug}
                  onChange={(e) => setProfileData({ ...profileData, portfolio_slug: e.target.value })}
                />

                <Input
                  label="Custom Portfolio Headline"
                  placeholder="e.g. Senior Cloud Architect | Kubernetes & Django Specialist"
                  value={profileData.custom_headline}
                  onChange={(e) => setProfileData({ ...profileData, custom_headline: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: 'var(--spacing-6)', flexWrap: 'wrap', marginTop: 'var(--spacing-4)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--font-size-sm)', cursor: 'pointer', fontWeight: 600 }}>
                  <input type="checkbox" checked={profileData.show_heatmap} onChange={(e) => setProfileData({ ...profileData, show_heatmap: e.target.checked })} />
                  Show 365-Day Activity Heatmap
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--font-size-sm)', cursor: 'pointer', fontWeight: 600 }}>
                  <input type="checkbox" checked={profileData.show_certifications} onChange={(e) => setProfileData({ ...profileData, show_certifications: e.target.checked })} />
                  Show Verified Certifications
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--font-size-sm)', cursor: 'pointer', fontWeight: 600 }}>
                  <input type="checkbox" checked={profileData.show_badges} onChange={(e) => setProfileData({ ...profileData, show_badges: e.target.checked })} />
                  Show Skill Badges & Achievements
                </label>
              </div>
            </div>


            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 'var(--spacing-4)', borderTop: '1px solid var(--color-border)' }}>
              <Button type="submit" variant="primary" loading={saving} icon={Save}>
                Save Changes
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
