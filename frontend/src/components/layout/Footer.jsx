import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Cloud, ArrowRight } from 'lucide-react';
import { GithubIcon as Github } from '../common/Icons';
import logoImg from '../../assets/logo.png';

export const Footer = () => {
  return (
    <footer
      style={{
        backgroundColor: '#111827',
        color: '#FFFFFF',
        borderTop: '1px solid #1F2937',
        padding: 'var(--spacing-16) 0 var(--spacing-8)',
        marginTop: 'auto',
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 'var(--spacing-10)',
            marginBottom: 'var(--spacing-12)',
          }}
        >
          {/* Brand Col */}
          <div>
            <div className="brand-logo" style={{ marginBottom: 'var(--spacing-4)', color: '#FFFFFF' }}>
              <img src={logoImg} alt="Navapai Logo" style={{ height: '34px' }} />
              <span style={{ color: '#FFFFFF' }}>NAVAPAI</span>
            </div>
            <p style={{ fontSize: 'var(--font-size-sm)', color: '#9CA3AF', marginBottom: 'var(--spacing-4)', lineHeight: 1.6 }}>
              Enterprise cloud infrastructure, canonical developer curriculum, project portfolio tracking, and verified career progression.
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 12px', backgroundColor: 'rgba(0, 210, 255, 0.08)', borderRadius: 'var(--radius-full)', fontSize: '12px', color: '#00D2FF', border: '1px solid rgba(0, 210, 255, 0.2)' }}>
              <ShieldCheck size={14} />
              <span>Core Tenet: Merge Community Topic, Never User Content</span>
            </div>
          </div>

          {/* Solutions Col */}
          <div>
            <h4 style={{ fontSize: 'var(--font-size-sm)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--spacing-4)', color: '#FFFFFF' }}>
              Cloud Solutions
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: 'var(--font-size-sm)' }}>
              <li><Link to="/domains/aws" style={{ color: '#D1D5DB' }} onMouseOver={(e) => e.target.style.color = '#00D2FF'} onMouseOut={(e) => e.target.style.color = '#D1D5DB'}>AWS Cloud Infrastructure</Link></li>
              <li><Link to="/domains/devops" style={{ color: '#D1D5DB' }} onMouseOver={(e) => e.target.style.color = '#00D2FF'} onMouseOut={(e) => e.target.style.color = '#D1D5DB'}>DevOps & CI/CD Pipelines</Link></li>
              <li><Link to="/domains/kubernetes" style={{ color: '#D1D5DB' }} onMouseOver={(e) => e.target.style.color = '#00D2FF'} onMouseOut={(e) => e.target.style.color = '#D1D5DB'}>Kubernetes & Containers</Link></li>
              <li><Link to="/domains/python" style={{ color: '#D1D5DB' }} onMouseOver={(e) => e.target.style.color = '#00D2FF'} onMouseOut={(e) => e.target.style.color = '#D1D5DB'}>Python Enterprise Engineering</Link></li>
              <li><Link to="/domains/django" style={{ color: '#D1D5DB' }} onMouseOver={(e) => e.target.style.color = '#00D2FF'} onMouseOut={(e) => e.target.style.color = '#D1D5DB'}>Django REST APIs</Link></li>
            </ul>
          </div>

          {/* Platform Links Col */}
          <div>
            <h4 style={{ fontSize: 'var(--font-size-sm)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--spacing-4)', color: '#FFFFFF' }}>
              Platform
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: 'var(--font-size-sm)' }}>
              <li><Link to="/domains" style={{ color: '#D1D5DB' }} onMouseOver={(e) => e.target.style.color = '#00D2FF'} onMouseOut={(e) => e.target.style.color = '#D1D5DB'}>Explore Domains</Link></li>
              <li><Link to="/projects" style={{ color: '#D1D5DB' }} onMouseOver={(e) => e.target.style.color = '#00D2FF'} onMouseOut={(e) => e.target.style.color = '#D1D5DB'}>Project Showcase</Link></li>
              <li><Link to="/resources" style={{ color: '#D1D5DB' }} onMouseOver={(e) => e.target.style.color = '#00D2FF'} onMouseOut={(e) => e.target.style.color = '#D1D5DB'}>Learning Materials</Link></li>
              <li><Link to="/about" style={{ color: '#D1D5DB' }} onMouseOver={(e) => e.target.style.color = '#00D2FF'} onMouseOut={(e) => e.target.style.color = '#D1D5DB'}>Architecture & Security</Link></li>
              <li><Link to="/contact" style={{ color: '#D1D5DB' }} onMouseOver={(e) => e.target.style.color = '#00D2FF'} onMouseOut={(e) => e.target.style.color = '#D1D5DB'}>Contact Engineering</Link></li>
            </ul>
          </div>

          {/* Technology Capabilities Col */}
          <div>
            <h4 style={{ fontSize: 'var(--font-size-sm)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--spacing-4)', color: '#FFFFFF' }}>
              Enterprise Architecture
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: 'var(--font-size-xs)', color: '#9CA3AF' }}>
              <span>• React 19 + Vite Frontend SPA</span>
              <span>• Python 3.14 + Django 5.2 + DRF</span>
              <span>• PostgreSQL 18 with <code>pg_trgm</code></span>
              <span>• SimpleJWT Authentication</span>
              <span>• AWS CloudFormation / Terraform Ready</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            paddingTop: 'var(--spacing-6)',
            borderTop: '1px solid #1F2937',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 'var(--spacing-4)',
            fontSize: 'var(--font-size-xs)',
            color: '#9CA3AF',
          }}
        >
          <div>
            © {new Date().getFullYear()} Navapai. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: 'var(--spacing-6)' }}>
            <Link to="/about" style={{ color: '#9CA3AF' }}>Privacy Policy</Link>
            <Link to="/about" style={{ color: '#9CA3AF' }}>Terms of Service</Link>
            <Link to="/contact" style={{ color: '#9CA3AF' }}>System Status</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
