import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { GithubIcon as Github } from '../../components/common/Icons';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';

const loginSchema = z.object({
  email: z.string().min(1, 'Email or username is required'),
  password: z.string().min(1, 'Password is required'),
});

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setServerError(null);
    try {
      await login(data.email, data.password);
      navigate('/profile');
    } catch (err) {
      console.error('Login failed:', err);
      const errorMsg = err.response?.data?.detail || 'Invalid email or password. Please check your credentials.';
      setServerError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 'var(--spacing-12) 0', backgroundColor: 'var(--color-bg-section)', minHeight: 'calc(100vh - 140px)' }}>
      <div className="container" style={{ maxWidth: '440px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-6)' }}>
          <Badge variant="brand" style={{ marginBottom: 'var(--spacing-2)' }}>Welcome Back</Badge>
          <h1 style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 'var(--spacing-2)' }}>Sign In to Navapai</h1>
          <p style={{ fontSize: 'var(--font-size-sm)' }}>
            Access your cloud roadmaps, project tasks, and developer portfolio.
          </p>
        </div>

        <Card style={{ padding: 'var(--spacing-8)', backgroundColor: '#FFFFFF' }}>
          {serverError && (
            <div
              style={{
                backgroundColor: 'var(--color-error-subtle)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                color: 'var(--color-error)',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                marginBottom: 'var(--spacing-4)',
                fontSize: 'var(--font-size-sm)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <AlertCircle size={18} />
              <span>{serverError}</span>
            </div>
          )}

          {/* GitHub Connect */}
          <button
            type="button"
            className="btn btn-secondary"
            style={{ width: '100%', marginBottom: 'var(--spacing-4)', display: 'flex', gap: '8px', justifyContent: 'center' }}
            onClick={() => alert('GitHub OAuth is enabled and ready for backend client ID configuration in Phase 3.')}
          >
            <Github size={16} />
            <span>Continue with GitHub</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: 'var(--spacing-4) 0' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }} />
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Or with credentials
            </span>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }} />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
            <Input
              label="Email Address or Username"
              type="text"
              icon={Mail}
              placeholder="alex@company.com"
              {...register('email')}
              error={errors.email?.message}
            />

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-text-main)' }}>
                  Password
                </label>
                <Link to="/forgot-password" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-primary)', fontWeight: 500 }}>
                  Forgot password?
                </Link>
              </div>
              <Input
                type="password"
                icon={Lock}
                placeholder="••••••••"
                {...register('password')}
                error={errors.password?.message}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              loading={loading}
              style={{ width: '100%', marginTop: 'var(--spacing-2)' }}
              icon={ArrowRight}
              iconPosition="right"
            >
              Sign In
            </Button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 'var(--spacing-6)', paddingTop: 'var(--spacing-4)', borderTop: '1px solid var(--color-border)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
              Create Account
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
