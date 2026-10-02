import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Activity,
  Users,
  Database,
  Lock,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Terminal,
  UserCheck,
  UserX,
  RefreshCw,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { LoadingState } from '../../components/feedback/LoadingState';

export const AdminSuite = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [healthData, setHealthData] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [activeTab, setActiveTab] = useState('HEALTH'); // 'HEALTH', 'AUDIT', 'USERS'
  const [loading, setLoading] = useState(true);
  const [userSearch, setUserSearch] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const [healthRes, auditRes, usersRes] = await Promise.all([
          api.get('admin-suite/system-health/'),
          api.get('admin-suite/audit-logs/'),
          api.get('admin-suite/users/'),
        ]);

        setHealthData(healthRes.data);
        setAuditLogs(Array.isArray(auditRes.data) ? auditRes.data : (auditRes.data.results || []));
        setUsersList(Array.isArray(usersRes.data) ? usersRes.data : (usersRes.data.results || []));
      } catch (err) {
        console.error('Failed to load admin suite data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Toggle user active status
  const handleToggleUserActive = async (userId) => {
    try {
      const res = await api.post(`admin-suite/users/${userId}/toggle-active/`);
      setUsersList((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_active: res.data.is_active } : u))
      );
    } catch (err) {
      console.error('Failed to toggle user status:', err);
    }
  };

  // Change user role
  const handleChangeRole = async (userId, newRole) => {
    try {
      const res = await api.post(`admin-suite/users/${userId}/change-role/`, { role: newRole });
      setUsersList((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: res.data.role } : u))
      );
    } catch (err) {
      console.error('Failed to update role:', err);
    }
  };

  if (authLoading || loading) {
    return <LoadingState fullPage message="Loading Admin Moderation Suite & System Health..." />;
  }

  const metrics = healthData?.metrics || {};
  const dbInfo = healthData?.database || {};

  const filteredUsers = usersList.filter(
    (u) =>
      u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div style={{ padding: 'var(--spacing-8) 0 var(--spacing-16)', backgroundColor: 'var(--color-bg-main)', minHeight: 'calc(100vh - 120px)' }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--spacing-4)', marginBottom: 'var(--spacing-8)' }}>
          <div>
            <Badge variant="brand" style={{ marginBottom: 'var(--spacing-2)' }}>Phase 16: Admin Moderation & Health</Badge>
            <h1 style={{ fontSize: 'var(--font-size-3xl)' }}>Admin Moderation Suite & System Health</h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-base)' }}>
              Real-time database health monitoring, security audit logs stream, and developer account moderation controls.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
            <Button variant={activeTab === 'HEALTH' ? 'primary' : 'outline'} icon={Activity} onClick={() => setActiveTab('HEALTH')}>
              System Health
            </Button>
            <Button variant={activeTab === 'AUDIT' ? 'primary' : 'outline'} icon={Lock} onClick={() => setActiveTab('AUDIT')}>
              Audit Logs
            </Button>
            <Button variant={activeTab === 'USERS' ? 'primary' : 'outline'} icon={Users} onClick={() => setActiveTab('USERS')}>
              User Moderation ({usersList.length})
            </Button>
          </div>
        </div>

        {/* Tab 1: System Health */}
        {activeTab === 'HEALTH' && (
          <div>
            {/* System Status Hero */}
            <div
              style={{
                backgroundColor: healthData?.status === 'OPERATIONAL' ? '#064E3B' : '#7F1D1D',
                color: '#FFFFFF',
                borderRadius: 'var(--radius-xl)',
                padding: 'var(--spacing-6) var(--spacing-8)',
                marginBottom: 'var(--spacing-8)',
                display: 'flex',
                justify: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 'var(--spacing-4)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)' }}>
                <CheckCircle2 size={36} color="#34D399" />
                <div>
                  <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, margin: 0 }}>
                    System Status: {healthData?.status || 'OPERATIONAL'}
                  </h2>
                  <div style={{ fontSize: 'var(--font-size-sm)', opacity: 0.85 }}>
                    Database Engine: {dbInfo.engine} ({dbInfo.status})
                  </div>
                </div>
              </div>

              <Button variant="secondary" icon={RefreshCw} onClick={() => window.location.reload()}>
                Refresh Status
              </Button>
            </div>

            {/* Metrics Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--spacing-6)' }}>
              <Card style={{ borderLeft: '4px solid #0082FF' }}>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 700 }}>TOTAL USERS</div>
                <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 900, color: 'var(--color-primary)', marginTop: '4px' }}>
                  {metrics.total_users || 0}
                </div>
              </Card>

              <Card style={{ borderLeft: '4px solid #10B981' }}>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 700 }}>ACTIVE DOMAINS</div>
                <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 900, color: '#10B981', marginTop: '4px' }}>
                  {metrics.total_domains || 0}
                </div>
              </Card>

              <Card style={{ borderLeft: '4px solid #F59E0B' }}>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 700 }}>PROJECTS BUILT</div>
                <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 900, color: '#F59E0B', marginTop: '4px' }}>
                  {metrics.total_projects || 0}
                </div>
              </Card>

              <Card style={{ borderLeft: '4px solid #8B5CF6' }}>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 700 }}>TASKS COMPLETED</div>
                <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 900, color: '#8B5CF6', marginTop: '4px' }}>
                  {metrics.completed_tasks || 0}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Tab 2: Security Audit Logs */}
        {activeTab === 'AUDIT' && (
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: 'var(--spacing-4) var(--spacing-6)', backgroundColor: 'var(--color-bg-section)', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: 'var(--font-size-base)', fontWeight: 700, margin: 0 }}>Security Audit Stream (Latest 100 Events)</h2>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'var(--font-size-sm)' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--color-bg-section)', borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>
                    <th style={{ padding: '12px 16px' }}>Timestamp</th>
                    <th style={{ padding: '12px 16px' }}>Actor</th>
                    <th style={{ padding: '12px 16px' }}>Action</th>
                    <th style={{ padding: '12px 16px' }}>Target</th>
                    <th style={{ padding: '12px 16px' }}>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 700 }}>
                        @{log.actor_username || 'System'}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <Badge variant="brand">{log.action}</Badge>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                        {log.target_model} #{log.target_id}
                      </td>
                      <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: '11px', color: 'var(--color-text-muted)' }}>
                        {JSON.stringify(log.details)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Tab 3: User Moderation */}
        {activeTab === 'USERS' && (
          <div>
            <div style={{ marginBottom: 'var(--spacing-4)' }}>
              <Input
                placeholder="Search developers by username or email..."
                icon={Search}
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
            </div>

            <Card style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'var(--font-size-sm)' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--color-bg-section)', borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>
                      <th style={{ padding: '14px 20px' }}>User</th>
                      <th style={{ padding: '14px 20px' }}>Role</th>
                      <th style={{ padding: '14px 20px', textAlign: 'center' }}>Projects</th>
                      <th style={{ padding: '14px 20px', textAlign: 'center' }}>Status</th>
                      <th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                        <td style={{ padding: '14px 20px' }}>
                          <div style={{ fontWeight: 700 }}>@{u.username}</div>
                          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{u.email}</div>
                        </td>

                        <td style={{ padding: '14px 20px' }}>
                          <select
                            value={u.role}
                            onChange={(e) => handleChangeRole(u.id, e.target.value)}
                            style={{ padding: '4px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', fontSize: '12px', backgroundColor: '#FFFFFF' }}
                          >
                            <option value="LEARNER">Learner</option>
                            <option value="CORE_MAINTAINER">Core Maintainer</option>
                            <option value="ADMIN">Administrator</option>
                          </select>
                        </td>

                        <td style={{ padding: '14px 20px', textAlign: 'center', fontWeight: 700 }}>
                          {u.projects_count || 0}
                        </td>

                        <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                          <Badge variant={u.is_active ? 'success' : 'error'}>
                            {u.is_active ? 'Active' : 'Banned'}
                          </Badge>
                        </td>

                        <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                          <Button
                            variant={u.is_active ? 'secondary' : 'primary'}
                            size="sm"
                            icon={u.is_active ? UserX : UserCheck}
                            onClick={() => handleToggleUserActive(u.id)}
                          >
                            {u.is_active ? 'Ban Account' : 'Reactivate'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
