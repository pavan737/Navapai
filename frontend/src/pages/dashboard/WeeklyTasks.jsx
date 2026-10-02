import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  CheckSquare,
  Square,
  Plus,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  Tag,
  Trash2,
  Edit2,
  Sparkles,
  Layers,
  Code,
  Lock,
  ListTodo,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { ProgressBar } from '../../components/common/ProgressBar';
import { LoadingState } from '../../components/feedback/LoadingState';
import { EmptyState } from '../../components/feedback/EmptyState';

export const WeeklyTasks = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Current ISO year and week number default
  const getCurrentIsoWeek = () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
    const week1 = new Date(d.getFullYear(), 0, 4);
    const week = 1 + Math.round(((d - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
    return { year: d.getFullYear(), week };
  };

  const currentIso = getCurrentIsoWeek();
  const [selectedWeek, setSelectedWeek] = useState(currentIso.week);
  const [selectedYear, setSelectedYear] = useState(currentIso.year);

  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [userDomains, setUserDomains] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [expandedTaskId, setExpandedTaskId] = useState(null);

  // New Subtask inline input
  const [newSubtaskInput, setNewSubtaskInput] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    category: 'LEARNING',
    due_date: '',
    estimated_minutes: 60,
    actual_minutes: 0,
    user_domain: '',
    project: '',
    initial_subtasks: [],
  });

  const [newSubtaskDraft, setNewSubtaskDraft] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const [tasksRes, statsRes, domainsRes, projectsRes] = await Promise.all([
          api.get(`tasks/my/?week=${selectedWeek}&year=${selectedYear}`),
          api.get(`tasks/stats/?week=${selectedWeek}&year=${selectedYear}`),
          api.get('domains/my/'),
          api.get('projects/my/'),
        ]);

        setTasks(tasksRes.data.results || tasksRes.data);
        setStats(statsRes.data);
        setUserDomains(domainsRes.data.results || domainsRes.data);
        setProjects(projectsRes.data.results || projectsRes.data);
      } catch (err) {
        console.error('Failed to load weekly tasks data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchData();
    }
  }, [selectedWeek, selectedYear, isAuthenticated, authLoading, navigate]);

  // Week Navigator
  const handlePrevWeek = () => {
    if (selectedWeek === 1) {
      setSelectedWeek(52);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedWeek(selectedWeek - 1);
    }
  };

  const handleNextWeek = () => {
    if (selectedWeek >= 52) {
      setSelectedWeek(1);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedWeek(selectedWeek + 1);
    }
  };

  const handleResetToCurrentWeek = () => {
    setSelectedWeek(currentIso.week);
    setSelectedYear(currentIso.year);
  };

  // 1-Click Toggle Task Status
  const handleToggleTaskStatus = async (taskId) => {
    try {
      const res = await api.post(`tasks/my/${taskId}/toggle/`);
      const updatedTask = res.data.task;

      setTasks((prev) => prev.map((t) => (t.id === taskId ? updatedTask : t)));

      // Refresh Stats
      const statsRes = await api.get(`tasks/stats/?week=${selectedWeek}&year=${selectedYear}`);
      setStats(statsRes.data);
    } catch (err) {
      console.error('Failed to toggle task status:', err);
    }
  };

  // Add subtask inline to task
  const handleAddInlineSubtask = async (taskId) => {
    if (!newSubtaskInput.trim()) return;
    try {
      const res = await api.post(`tasks/my/${taskId}/subtasks/`, {
        title: newSubtaskInput.trim(),
        is_completed: false,
      });

      setTasks((prev) =>
        prev.map((t) => {
          if (t.id === taskId) {
            const subtasks = t.subtasks || [];
            return { ...t, subtasks: [...subtasks, res.data] };
          }
          return t;
        })
      );
      setNewSubtaskInput('');
    } catch (err) {
      console.error('Failed to add subtask:', err);
    }
  };

  // Toggle Subtask Completion
  const handleToggleSubtask = async (taskId, subtaskId, currentVal) => {
    try {
      const res = await api.patch(`tasks/subtasks/${subtaskId}/`, {
        is_completed: !currentVal,
      });

      setTasks((prev) =>
        prev.map((t) => {
          if (t.id === taskId) {
            const subtasks = (t.subtasks || []).map((s) => (s.id === subtaskId ? res.data : s));
            return { ...t, subtasks };
          }
          return t;
        })
      );
    } catch (err) {
      console.error('Failed to toggle subtask:', err);
    }
  };

  // Delete Task
  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await api.delete(`tasks/my/${taskId}/`);
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
        const statsRes = await api.get(`tasks/stats/?week=${selectedWeek}&year=${selectedYear}`);
        setStats(statsRes.data);
      } catch (err) {
        console.error('Failed to delete task:', err);
      }
    }
  };

  // Create / Update Task Submit
  const handleSubmitTask = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        week_number: selectedWeek,
        year: selectedYear,
        user_domain: formData.user_domain ? parseInt(formData.user_domain) : null,
        project: formData.project ? parseInt(formData.project) : null,
      };

      if (editingTask) {
        const res = await api.patch(`tasks/my/${editingTask.id}/`, payload);
        setTasks((prev) => prev.map((t) => (t.id === editingTask.id ? res.data : t)));
      } else {
        const res = await api.post('tasks/my/', payload);
        // Refresh list to include created task with subtasks
        const listRes = await api.get(`tasks/my/?week=${selectedWeek}&year=${selectedYear}`);
        setTasks(listRes.data.results || listRes.data);
      }

      const statsRes = await api.get(`tasks/stats/?week=${selectedWeek}&year=${selectedYear}`);
      setStats(statsRes.data);
      setShowModal(false);
      setEditingTask(null);
      setFormData({
        title: '',
        description: '',
        priority: 'MEDIUM',
        category: 'LEARNING',
        due_date: '',
        estimated_minutes: 60,
        actual_minutes: 0,
        user_domain: '',
        project: '',
        initial_subtasks: [],
      });
    } catch (err) {
      console.error('Failed to save task:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Subtask Draft handlers for modal
  const handleAddSubtaskDraft = () => {
    if (newSubtaskDraft.trim()) {
      setFormData({
        ...formData,
        initial_subtasks: [...formData.initial_subtasks, newSubtaskDraft.trim()],
      });
      setNewSubtaskDraft('');
    }
  };

  const handleRemoveSubtaskDraft = (idx) => {
    setFormData({
      ...formData,
      initial_subtasks: formData.initial_subtasks.filter((_, i) => i !== idx),
    });
  };

  // Filter Tasks
  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  if (authLoading || loading) {
    return <LoadingState fullPage message="Loading weekly tasks & to-do management..." />;
  }

  return (
    <div style={{ padding: 'var(--spacing-8) 0 var(--spacing-16)', backgroundColor: 'var(--color-bg-main)', minHeight: 'calc(100vh - 120px)' }}>
      <div className="container">
        {/* Page Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--spacing-4)', marginBottom: 'var(--spacing-8)' }}>
          <div>
            <Badge variant="brand" style={{ marginBottom: 'var(--spacing-2)' }}>Phase 8: Weekly Tasks & To-Dos</Badge>
            <h1 style={{ fontSize: 'var(--font-size-3xl)' }}>Weekly Task Manager</h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-base)' }}>
              Set actionable developer goals, track sub-tasks, and link progress to your learning domains & projects.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 'var(--spacing-3)' }}>
            <Button variant="primary" icon={Plus} onClick={() => { setEditingTask(null); setShowModal(true); }}>
              New Task
            </Button>
          </div>
        </div>

        {/* Week Navigator & Metrics Banner */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--spacing-6)',
            marginBottom: 'var(--spacing-8)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--spacing-4)', marginBottom: 'var(--spacing-6)' }}>
            {/* Week Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
              <Button variant="outline" size="sm" icon={ChevronLeft} onClick={handlePrevWeek} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 800, fontSize: 'var(--font-size-lg)', color: 'var(--color-text-main)' }}>
                  Week {selectedWeek}, {selectedYear}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                  {selectedWeek === currentIso.week && selectedYear === currentIso.year ? 'Current Active Week' : 'Historical Week'}
                </div>
              </div>
              <Button variant="outline" size="sm" icon={ChevronRight} onClick={handleNextWeek} />

              {(selectedWeek !== currentIso.week || selectedYear !== currentIso.year) && (
                <Button variant="ghost" size="sm" onClick={handleResetToCurrentWeek} style={{ fontSize: '12px' }}>
                  Current Week
                </Button>
              )}
            </div>

            {/* Weekly Completion Progress */}
            <div style={{ flex: 1, maxWidth: '320px', minWidth: '240px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-xs)', marginBottom: '4px', fontWeight: 600 }}>
                <span>Weekly Goal Completion</span>
                <span style={{ color: 'var(--color-primary)' }}>{stats?.completion_rate || 0}%</span>
              </div>
              <ProgressBar progress={stats?.completion_rate || 0} color="#0082FF" />
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--spacing-4)', paddingTop: 'var(--spacing-4)', borderTop: '1px solid var(--color-border)' }}>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Total Tasks</div>
              <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800 }}>{stats?.total_tasks || 0}</div>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: '#10B981', fontWeight: 600 }}>Completed</div>
              <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: '#10B981' }}>{stats?.completed_tasks || 0}</div>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: '#0082FF', fontWeight: 600 }}>In Progress</div>
              <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: '#0082FF' }}>{stats?.in_progress_tasks || 0}</div>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Estimated vs Actual</div>
              <div style={{ fontSize: 'var(--font-size-md)', fontWeight: 700 }}>
                {stats?.estimated_hours || 0}h / {stats?.actual_hours || 0}h
              </div>
            </div>
          </div>
        </div>

        {/* Controls: Search, Status Tabs, Priority Filter */}
        <div
          style={{
            backgroundColor: 'var(--color-bg-section)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--spacing-4) var(--spacing-6)',
            marginBottom: 'var(--spacing-6)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 'var(--spacing-4)',
          }}
        >
          {/* Status Tabs */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {['ALL', 'TODO', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: '1px solid',
                  backgroundColor: statusFilter === st ? 'var(--color-primary)' : '#FFFFFF',
                  color: statusFilter === st ? '#FFFFFF' : 'var(--color-text-muted)',
                  borderColor: statusFilter === st ? 'var(--color-primary)' : 'var(--color-border)',
                  transition: 'all var(--transition-fast)',
                }}
              >
                {st === 'ALL' ? 'All Tasks' : st.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 'var(--spacing-3)', alignItems: 'center' }}>
            <div style={{ width: '220px' }}>
              <Input
                placeholder="Search tasks..."
                icon={Search}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                backgroundColor: '#FFFFFF',
                fontSize: 'var(--font-size-xs)',
                fontWeight: 600,
              }}
            >
              <option value="ALL">All Priorities</option>
              <option value="URGENT">Urgent</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </div>

        {/* Tasks List / Grid */}
        {filteredTasks.length === 0 ? (
          <EmptyState
            title="No Weekly Tasks Found"
            description={`No tasks match the selected week (${selectedWeek}) and filters. Create your first task to start tracking.`}
            actionLabel="Add New Task"
            onAction={() => { setEditingTask(null); setShowModal(true); }}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
            {filteredTasks.map((task) => {
              const isCompleted = task.status === 'COMPLETED';
              const isExpanded = expandedTaskId === task.id;

              return (
                <Card
                  key={task.id}
                  style={{
                    padding: 'var(--spacing-5) var(--spacing-6)',
                    backgroundColor: isCompleted ? 'var(--color-bg-section)' : '#FFFFFF',
                    borderLeft: `4px solid ${
                      task.priority === 'URGENT' ? '#EF4444' : (task.priority === 'HIGH' ? '#F59E0B' : '#0082FF')
                    }`,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--spacing-3)' }}>
                    {/* Checkbox & Main Info */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-4)', flex: 1, minWidth: '280px' }}>
                      <button
                        type="button"
                        onClick={() => handleToggleTaskStatus(task.id)}
                        style={{
                          cursor: 'pointer',
                          marginTop: '2px',
                          background: 'none',
                          border: 'none',
                          color: isCompleted ? '#10B981' : 'var(--color-text-muted)',
                        }}
                      >
                        {isCompleted ? <CheckSquare size={22} /> : <Square size={22} />}
                      </button>

                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                          <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 700, textDecoration: isCompleted ? 'line-through' : 'none', color: isCompleted ? 'var(--color-text-muted)' : 'var(--color-text-main)' }}>
                            {task.title}
                          </h3>

                          <Badge variant={task.priority === 'URGENT' ? 'error' : (task.priority === 'HIGH' ? 'brand' : 'neutral')}>
                            {task.priority}
                          </Badge>

                          <Badge variant="cyan">{task.category}</Badge>

                          {task.user_domain_name && (
                            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-primary)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                              <Layers size={12} /> {task.user_domain_name}
                            </span>
                          )}

                          {task.project_title && (
                            <span style={{ fontSize: '11px', fontWeight: 600, color: '#10B981', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                              <Code size={12} /> {task.project_title}
                            </span>
                          )}
                        </div>

                        {task.description && (
                          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginBottom: '8px', lineHeight: 1.4 }}>
                            {task.description}
                          </p>
                        )}

                        {/* Subtasks Count & Time details */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                          <button
                            type="button"
                            onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                            style={{ cursor: 'pointer', color: 'var(--color-primary)', fontWeight: 600, background: 'none', border: 'none', padding: 0 }}
                          >
                            Sub-tasks ({task.completed_subtasks_count}/{task.subtasks_count || 0})
                          </button>

                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={13} /> {task.estimated_minutes} min est.
                          </span>

                          {task.due_date && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <Calendar size={13} /> Due {task.due_date}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        style={{ color: 'var(--color-error)', cursor: 'pointer', padding: '6px', border: 'none', background: 'none' }}
                        title="Delete Task"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Expandable Sub-tasks Drawer */}
                  {isExpanded && (
                    <div style={{ marginTop: 'var(--spacing-4)', paddingTop: 'var(--spacing-4)', borderTop: '1px dashed var(--color-border)', backgroundColor: '#FAFAFA', padding: '12px 16px', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, marginBottom: '8px', color: 'var(--color-text-main)' }}>
                        Sub-tasks & Action Checklist
                      </div>

                      {/* Sub-task List */}
                      {task.subtasks && task.subtasks.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
                          {task.subtasks.map((st) => (
                            <div key={st.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--font-size-xs)' }}>
                              <input
                                type="checkbox"
                                checked={st.is_completed}
                                onChange={() => handleToggleSubtask(task.id, st.id, st.is_completed)}
                                style={{ cursor: 'pointer' }}
                              />
                              <span style={{ textDecoration: st.is_completed ? 'line-through' : 'none', color: st.is_completed ? 'var(--color-text-muted)' : 'var(--color-text-main)' }}>
                                {st.title}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
                          No sub-tasks added yet.
                        </div>
                      )}

                      {/* Add Inline Subtask */}
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                          type="text"
                          placeholder="Add action sub-task item..."
                          value={newSubtaskInput}
                          onChange={(e) => setNewSubtaskInput(e.target.value)}
                          style={{
                            flex: 1,
                            padding: '6px 10px',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--color-border)',
                            fontSize: '12px',
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAddInlineSubtask(task.id);
                          }}
                        />
                        <Button variant="secondary" size="sm" onClick={() => handleAddInlineSubtask(task.id)}>
                          Add Sub-task
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        {/* Create / Edit Task Modal */}
        {showModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(17, 24, 39, 0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 100,
              padding: 'var(--spacing-4)',
            }}
          >
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--spacing-8)',
                width: '100%',
                maxWidth: '600px',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: 'var(--shadow-xl)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ListTodo size={22} color="#0082FF" />
                  <h3 style={{ fontSize: 'var(--font-size-xl)' }}>Add Weekly Task</h3>
                </div>
                <button onClick={() => setShowModal(false)} style={{ fontSize: '18px', color: 'var(--color-text-muted)', cursor: 'pointer', background: 'none', border: 'none' }}>✕</button>
              </div>

              <form onSubmit={handleSubmitTask} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
                <Input
                  label="Task Title"
                  required
                  placeholder="e.g. Implement JWT Refresh Interceptor"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>Description</label>
                  <textarea
                    rows={3}
                    placeholder="Details, requirements, or links for this task..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border)',
                      fontFamily: 'inherit',
                      fontSize: 'var(--font-size-sm)',
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-3)' }}>
                  <div>
                    <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Priority</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--color-border)',
                        fontSize: 'var(--font-size-sm)',
                        backgroundColor: '#FFFFFF',
                      }}
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="URGENT">Urgent</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--color-border)',
                        fontSize: 'var(--font-size-sm)',
                        backgroundColor: '#FFFFFF',
                      }}
                    >
                      <option value="LEARNING">Learning & Theory</option>
                      <option value="CODING">Coding & Dev</option>
                      <option value="ARCHITECTURE">Architecture & Design</option>
                      <option value="REVIEW">Code Review & Refactoring</option>
                      <option value="OTHER">General / Other</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-3)' }}>
                  <div>
                    <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Link to User Domain</label>
                    <select
                      value={formData.user_domain}
                      onChange={(e) => setFormData({ ...formData, user_domain: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--color-border)',
                        fontSize: 'var(--font-size-sm)',
                        backgroundColor: '#FFFFFF',
                      }}
                    >
                      <option value="">None (Independent)</option>
                      {userDomains.map((ud) => (
                        <option key={ud.id} value={ud.id}>{ud.original_name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Link to Project</label>
                    <select
                      value={formData.project}
                      onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--color-border)',
                        fontSize: 'var(--font-size-sm)',
                        backgroundColor: '#FFFFFF',
                      }}
                    >
                      <option value="">None (Independent)</option>
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>{p.title}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-3)' }}>
                  <Input
                    label="Due Date (Optional)"
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  />

                  <Input
                    label="Estimated Time (Minutes)"
                    type="number"
                    value={formData.estimated_minutes}
                    onChange={(e) => setFormData({ ...formData, estimated_minutes: parseInt(e.target.value) || 0 })}
                  />
                </div>

                {/* Subtasks Builder */}
                <div>
                  <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                    Initial Action Items / Sub-tasks
                  </label>
                  {formData.initial_subtasks.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '8px' }}>
                      {formData.initial_subtasks.map((st, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', backgroundColor: 'var(--color-bg-section)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--font-size-xs)' }}>
                          <span>• {st}</span>
                          <button type="button" onClick={() => handleRemoveSubtaskDraft(i)} style={{ color: 'var(--color-error)', cursor: 'pointer', border: 'none', background: 'none' }}>✕</button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder="Add initial sub-task item..."
                      value={newSubtaskDraft}
                      onChange={(e) => setNewSubtaskDraft(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--color-border)',
                        fontSize: 'var(--font-size-xs)',
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSubtaskDraft();
                        }
                      }}
                    />
                    <Button type="button" variant="secondary" size="sm" onClick={handleAddSubtaskDraft}>
                      Add Item
                    </Button>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-3)', marginTop: 'var(--spacing-2)' }}>
                  <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" loading={submitting}>
                    Save Task
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
