import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  ArrowRight,
  User,
  LogOut,
  LayoutDashboard,
  Compass,
  Code,
  ListTodo,
  BookOpen,
  Bookmark,
  Award,
  Briefcase,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';

import logoImg from '../../assets/logo.png';

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { name: 'Domains', path: '/domains' },
    { name: 'Projects', path: '/projects' },
    { name: 'Resources', path: '/resources' },
    { name: 'Community', path: '/community' },
    { name: 'Leaderboard', path: '/leaderboard' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const handleLogout = () => {
    setUserDropdownOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="nav-container">
        {/* Brand Identity */}
        <Link to="/" className="brand-logo" onClick={() => setMobileMenuOpen(false)}>
          <img src={logoImg} alt="Navapai Cloud Logo" />
          <span>NAVAPAI</span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="nav-links" style={{ gap: 'var(--spacing-5)' }}>
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`nav-link ${isActive(link.path) ? 'active' : ''}`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Desktop Auth Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }} className="desktop-auth">
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)', position: 'relative' }}>
              <Link to="/dashboard">
                <Button variant="primary" size="sm" icon={LayoutDashboard}>
                  Dashboard
                </Button>
              </Link>
              {(user?.is_staff || user?.role === 'ADMIN' || user?.role === 'CORE_MAINTAINER') && (
                <Link to="/admin-suite">
                  <Button variant="outline" size="sm" icon={ShieldCheck}>
                    Admin Suite
                  </Button>
                </Link>
              )}

              {/* User Dropdown Menu */}
              <div ref={dropdownRef} style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: '#FFFFFF',
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: 600,
                    color: 'var(--color-text-main)',
                    cursor: 'pointer',
                  }}
                >
                  <User size={15} color="var(--color-primary)" />
                  <span>@{user?.username || 'Profile'}</span>
                  <ChevronDown size={14} style={{ transform: userDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                </button>

                {userDropdownOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 'calc(100% + 8px)',
                      width: '230px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-lg)',
                      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                      zIndex: 100,
                      padding: '8px 0',
                    }}
                  >
                    <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--color-border)', marginBottom: '4px' }}>
                      <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--color-text-main)' }}>@{user?.username}</div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</div>
                    </div>

                    <Link to="/profile" onClick={() => setUserDropdownOpen(false)} style={dropdownItemStyle}>
                      <User size={14} /> My Profile & Portfolio
                    </Link>
                    <Link to="/dashboard/domains" onClick={() => setUserDropdownOpen(false)} style={dropdownItemStyle}>
                      <LayoutDashboard size={14} /> My Domains
                    </Link>
                    <Link to="/dashboard/plans" onClick={() => setUserDropdownOpen(false)} style={dropdownItemStyle}>
                      <Compass size={14} /> Learning Plans
                    </Link>
                    <Link to="/dashboard/projects" onClick={() => setUserDropdownOpen(false)} style={dropdownItemStyle}>
                      <Code size={14} /> My Projects
                    </Link>
                    <Link to="/dashboard/tasks" onClick={() => setUserDropdownOpen(false)} style={dropdownItemStyle}>
                      <ListTodo size={14} /> Weekly Tasks
                    </Link>
                    <Link to="/dashboard/notes" onClick={() => setUserDropdownOpen(false)} style={dropdownItemStyle}>
                      <BookOpen size={14} /> Developer Notes
                    </Link>
                    <Link to="/dashboard/bookmarks" onClick={() => setUserDropdownOpen(false)} style={dropdownItemStyle}>
                      <Bookmark size={14} /> Bookmarks
                    </Link>
                    <Link to="/dashboard/achievements" onClick={() => setUserDropdownOpen(false)} style={dropdownItemStyle}>
                      <Award size={14} /> Badges & Achievements
                    </Link>
                    <Link to="/dashboard/career" onClick={() => setUserDropdownOpen(false)} style={dropdownItemStyle}>
                      <Briefcase size={14} /> Career Milestones
                    </Link>

                    <div style={{ height: '1px', backgroundColor: 'var(--color-border)', margin: '6px 0' }} />

                    <button
                      type="button"
                      onClick={handleLogout}
                      style={{ ...dropdownItemStyle, width: '100%', color: 'var(--color-error)', cursor: 'pointer', textAlign: 'left', border: 'none', background: 'none' }}
                    >
                      <LogOut size={14} /> Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm" icon={ArrowRight} iconPosition="right">
                  Get Started
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className="mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ display: 'none', color: 'var(--color-text-main)', padding: '6px' }}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          className="mobile-drawer"
          style={{
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid var(--color-border)',
            padding: 'var(--spacing-4) var(--spacing-6)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--spacing-3)',
          }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              style={{
                padding: '8px 0',
                color: isActive(link.path) ? 'var(--color-primary)' : 'var(--color-text-main)',
                fontWeight: isActive(link.path) ? 700 : 500,
              }}
            >
              {link.name}
            </Link>
          ))}
          <div style={{ paddingTop: 'var(--spacing-3)', borderTop: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" style={{ width: '100%' }}>Dashboard</Button>
                </Link>
                {(user?.is_staff || user?.role === 'ADMIN' || user?.role === 'CORE_MAINTAINER') && (
                  <Link to="/admin-suite" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" style={{ width: '100%' }}>Admin Suite</Button>
                  </Link>
                )}
                <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" style={{ width: '100%' }}>My Profile</Button>
                </Link>
                <Button variant="ghost" onClick={handleLogout} style={{ width: '100%', color: 'var(--color-error)' }}>Logout</Button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" style={{ width: '100%' }}>Sign In</Button>
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" style={{ width: '100%' }}>Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

const dropdownItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '8px 16px',
  fontSize: '12px',
  fontWeight: 500,
  color: 'var(--color-text-main)',
  textDecoration: 'none',
  transition: 'background-color 0.15s ease',
};
