import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2, ArrowRight } from 'lucide-react';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  return (
    <div style={{ padding: 'var(--spacing-12) 0', backgroundColor: 'var(--color-bg-section)', minHeight: 'calc(100vh - 140px)' }}>
      <div className="container" style={{ maxWidth: '440px' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-6)' }}>
          <Badge variant="brand" style={{ marginBottom: 'var(--spacing-2)' }}>Account Recovery</Badge>
          <h1 style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 'var(--spacing-2)' }}>Reset Your Password</h1>
          <p style={{ fontSize: 'var(--font-size-sm)' }}>
            Enter your registered email address and we will send you password reset instructions.
          </p>
        </div>

        <Card style={{ padding: 'var(--spacing-8)', backgroundColor: '#FFFFFF' }}>
          {submitted ? (
            <div style={{ textAlign: 'center', padding: 'var(--spacing-4) 0' }}>
              <CheckCircle2 size={40} color="#10B981" style={{ marginBottom: 'var(--spacing-3)' }} />
              <h3>Check Your Inbox</h3>
              <p style={{ fontSize: 'var(--font-size-sm)', margin: 'var(--spacing-2) 0 var(--spacing-6)' }}>
                If an account exists for <strong>{email}</strong>, a secure reset link has been dispatched.
              </p>
              <Link to="/login">
                <Button variant="primary" style={{ width: '100%' }}>Return to Sign In</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
              <Input
                label="Email Address"
                type="email"
                required
                icon={Mail}
                placeholder="alex@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <Button type="submit" variant="primary" style={{ width: '100%', marginTop: 'var(--spacing-2)' }} icon={ArrowRight} iconPosition="right">
                Send Reset Link
              </Button>
            </form>
          )}

          <div style={{ textAlign: 'center', marginTop: 'var(--spacing-6)', paddingTop: 'var(--spacing-4)', borderTop: '1px solid var(--color-border)' }}>
            <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
              <ArrowLeft size={14} /> Back to Sign In
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
