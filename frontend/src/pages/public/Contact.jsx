import React, { useState } from 'react';
import { Mail, MessageSquare, Send, CheckCircle2, HelpCircle } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';

export const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.message) {
      setSubmitted(true);
    }
  };

  return (
    <div style={{ padding: 'var(--spacing-10) 0 var(--spacing-16)', backgroundColor: 'var(--color-bg-main)' }}>
      <div className="container" style={{ maxWidth: '840px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-10)' }}>
          <Badge variant="brand" style={{ marginBottom: 'var(--spacing-2)' }}>Get In Touch</Badge>
          <h1 style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--spacing-2)' }}>Contact Engineering</h1>
          <p style={{ fontSize: 'var(--font-size-base)', maxWidth: '580px', margin: '0 auto', color: 'var(--color-text-muted)' }}>
            Have a question about cloud learning domains, similarity matching algorithms, or curriculum partnerships?
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--spacing-6)' }}>
          {/* Contact Details */}
          <div>
            <Card style={{ marginBottom: 'var(--spacing-4)', padding: 'var(--spacing-6)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: 'var(--spacing-2)' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-primary-subtle)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Mail size={18} />
                </div>
                <h3 style={{ fontSize: 'var(--font-size-md)' }}>Direct Inquiries</h3>
              </div>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                Direct message the engineering team: <strong style={{ color: 'var(--color-primary)' }}>laxmikanthbk27@gmail.com</strong>
              </p>
            </Card>

            <Card style={{ padding: 'var(--spacing-6)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: 'var(--spacing-2)' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-secondary-subtle)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <HelpCircle size={18} />
                </div>
                <h3 style={{ fontSize: 'var(--font-size-md)' }}>Domain Merging & FAQ</h3>
              </div>
              <p style={{ fontSize: 'var(--font-size-sm)', lineHeight: 1.5, color: 'var(--color-text-muted)' }}>
                Inquiries regarding domain approvals, normalized alias mappings, and GitHub OAuth configurations are reviewed within 24 hours.
              </p>
            </Card>
          </div>

          {/* Form */}
          <Card style={{ padding: 'var(--spacing-6)' }}>
            {submitted ? (
              <div style={{ textAlign: 'center', padding: 'var(--spacing-6) 0' }}>
                <CheckCircle2 size={42} color="#10B981" style={{ marginBottom: 'var(--spacing-3)' }} />
                <h3>Message Dispatched</h3>
                <p style={{ fontSize: 'var(--font-size-sm)', margin: 'var(--spacing-2) 0 var(--spacing-4)', color: 'var(--color-text-muted)' }}>
                  Your inquiry has been received by our engineering maintainers.
                </p>
                <Button variant="secondary" size="sm" onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', subject: '', message: '' }); }}>
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
                <Input
                  label="Your Full Name"
                  required
                  placeholder="e.g. Alex Morgan"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                <Input
                  label="Email Address"
                  type="email"
                  required
                  placeholder="alex@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                <Input
                  label="Subject"
                  placeholder="e.g. Cloud domain similarity inquiry"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-text-main)' }}>
                    Message
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe your inquiry..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border)',
                      fontFamily: 'inherit',
                      fontSize: 'var(--font-size-sm)',
                      outline: 'none',
                      backgroundColor: '#FFFFFF',
                    }}
                  />
                </div>
                <Button type="submit" variant="primary" icon={Send} iconPosition="right">
                  Send Message
                </Button>
              </form>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
