import React from 'react';
import { ShieldCheck, Database, Layers, Lock, Cpu, Sparkles, CheckCircle2 } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';

export const About = () => {
  return (
    <div style={{ padding: 'var(--spacing-10) 0 var(--spacing-16)', backgroundColor: 'var(--color-bg-main)' }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-12)' }}>
          <Badge variant="brand" style={{ marginBottom: 'var(--spacing-2)' }}>Architecture & Mission</Badge>
          <h1 style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--spacing-3)' }}>About Navapai</h1>
          <p style={{ fontSize: 'var(--font-size-lg)', lineHeight: 1.6, color: 'var(--color-text-muted)' }}>
            Navapai is an enterprise-grade cloud learning, developer portfolio, and community knowledge ecosystem engineered to eliminate duplicate learning paths while strictly preserving user content ownership.
          </p>
        </div>

        {/* Core Pillars */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 'var(--spacing-6)', marginBottom: 'var(--spacing-10)' }}>
          <Card hoverable>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: 'var(--spacing-3)' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-primary-subtle)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={22} />
              </div>
              <h3 style={{ fontSize: 'var(--font-size-lg)', color: 'var(--color-text-main)' }}>Non-Negotiable Ownership</h3>
            </div>
            <p style={{ fontSize: 'var(--font-size-sm)', lineHeight: 1.6, color: 'var(--color-text-muted)' }}>
              <strong>"Merge the community topic, not the user's content."</strong> When you link your personal topic (e.g. <em>"Python Development"</em>) to a canonical domain (<em>"Python"</em>), your notes, tasks, learning plans, and projects remain 100% under your ownership.
            </p>
          </Card>

          <Card hoverable>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: 'var(--spacing-3)' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-primary-subtle)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Database size={22} />
              </div>
              <h3 style={{ fontSize: 'var(--font-size-lg)', color: 'var(--color-text-main)' }}>PostgreSQL Similarity Engine</h3>
            </div>
            <p style={{ fontSize: 'var(--font-size-sm)', lineHeight: 1.6, color: 'var(--color-text-muted)' }}>
              Leverages PostgreSQL <code>pg_trgm</code>, normalized alias indexes, and semantic scoring to detect topic collisions in real-time before duplicate public domains are created.
            </p>
          </Card>

          <Card hoverable>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: 'var(--spacing-3)' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-primary-subtle)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Layers size={22} />
              </div>
              <h3 style={{ fontSize: 'var(--font-size-lg)', color: 'var(--color-text-main)' }}>Decoupled Micro-Layering</h3>
            </div>
            <p style={{ fontSize: 'var(--font-size-sm)', lineHeight: 1.6, color: 'var(--color-text-muted)' }}>
              Strict separation between global <code>CommunityDomain</code>, user-scoped <code>UserDomain</code>, and individual developer artefacts (<code>Project</code>, <code>Task</code>, <code>Note</code>).
            </p>
          </Card>

          <Card hoverable>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: 'var(--spacing-3)' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-primary-subtle)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Lock size={22} />
              </div>
              <h3 style={{ fontSize: 'var(--font-size-lg)', color: 'var(--color-text-main)' }}>Server-Enforced Security</h3>
            </div>
            <p style={{ fontSize: 'var(--font-size-sm)', lineHeight: 1.6, color: 'var(--color-text-muted)' }}>
              Zero reliance on client-side authorization. Permissions, visibility filters, and atomic rollback workflows are strictly enforced inside DRF permissions and database transactions.
            </p>
          </Card>
        </div>

        {/* Technology Highlights */}
        <Card style={{ backgroundColor: 'var(--color-bg-section)', border: '1px solid var(--color-border)', padding: 'var(--spacing-8)' }}>
          <h3 style={{ color: 'var(--color-text-main)', marginBottom: 'var(--spacing-4)' }}>Enterprise Architecture Summary</h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle2 size={16} color="#0082FF" />
              <span><strong>Frontend:</strong> React 19, Vite, React Router, CSS Design Tokens, Zod, React Hook Form</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle2 size={16} color="#0082FF" />
              <span><strong>Backend:</strong> Python 3.14, Django 5.2, Django REST Framework, SimpleJWT</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle2 size={16} color="#0082FF" />
              <span><strong>Database:</strong> PostgreSQL 18 with <code>pg_trgm</code> similarity indexing & atomic transactions</span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
};
