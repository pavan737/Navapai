import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, User, Phone, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { GithubIcon as Github } from '../../components/common/Icons';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';

const registerSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  username: z.string().min(3, 'Username must be at least 3 characters').regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscores'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  password_confirm: z.string().min(8, 'Please confirm your password'),
}).refine((data) => data.password === data.password_confirm, {
  message: 'Passwords do not match',
  path: ['password_confirm'],
});

export const Register = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setServerError(null);
    try {
      await registerUser(data);
      navigate('/profile');
    } catch (err) {
      console.error('Registration failed:', err);
      const errorData = err.response?.data;
      if (typeof errorData === 'object') {
        const firstKey = Object.keys(errorData)[0];
        const errorMsg = Array.isArray(errorData[firstKey]) ? errorData[firstKey][0] : errorData[firstKey];
        setServerError(`${firstKey}: ${errorMsg}`);
      } else {
        setServerError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 'var(--spacing-12) 0', backgroundColor: 'var(--color-bg-section)', minHeight: 'calc(100vh - 140px)' }}>
      <div className="container" style={{ maxWidth: '520px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-6)' }}>
          <Badge variant="brand" style={{ marginBottom: 'var(--spacing-2)' }}>Join Navapai</Badge>
          <h1 style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 'var(--spacing-2)' }}>Create Developer Account</h1>
          <p style={{ fontSize: 'var(--font-size-sm)' }}>
            Start mastering canonical cloud domains and building verified portfolios.
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

          {/* GitHub Quick Connect */}
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
              Or with email
            </span>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }} />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-3)' }}>
              <Input
                label="First Name"
                placeholder="Alex"
                {...register('first_name')}
                error={errors.first_name?.message}
              />
              <Input
                label="Last Name"
                placeholder="Morgan"
                {...register('last_name')}
                error={errors.last_name?.message}
              />
            </div>

            <Input
              label="Username"
              icon={User}
              placeholder="alex_dev"
              {...register('username')}
              error={errors.username?.message}
            />

            <Input
              label="Email Address"
              type="email"
              icon={Mail}
              placeholder="alex@company.com"
              {...register('email')}
              error={errors.email?.message}
            />

            <Input
              label="Phone Number (Optional)"
              type="tel"
              icon={Phone}
              placeholder="+1 (555) 000-0000"
              {...register('phone')}
              error={errors.phone?.message}
            />

            <Input
              label="Password"
              type="password"
              icon={Lock}
              placeholder="••••••••"
              {...register('password')}
              error={errors.password?.message}
            />

            <Input
              label="Confirm Password"
              type="password"
              icon={Lock}
              placeholder="••••••••"
              {...register('password_confirm')}
              error={errors.password_confirm?.message}
            />

            <Button
              type="submit"
              variant="primary"
              loading={loading}
              style={{ width: '100%', marginTop: 'var(--spacing-2)' }}
              icon={ArrowRight}
              iconPosition="right"
            >
              Create Account
            </Button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 'var(--spacing-6)', paddingTop: 'var(--spacing-4)', borderTop: '1px solid var(--color-border)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
              Sign In
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
