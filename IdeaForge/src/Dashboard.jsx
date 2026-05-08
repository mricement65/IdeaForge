import { useState } from 'react';
import './Dashboard.css';

/* ─── Priority options ─── */
const PRIORITY_OPTIONS = [
  { value: 'high',   label: 'High',   color: '#ef4444' },
  { value: 'medium', label: 'Medium', color: '#f59e0b' },
  { value: 'low',    label: 'Low',    color: '#22c55e' },
  { value: 'none',   label: 'None',   color: 'transparent' },
];

/* ─── Predefined tag palette ─── */
const TAG_PALETTE = ['Design', 'Dev', 'Marketing', 'Research', 'Content', 'QA', 'Ops', 'Finance'];

/* ─── Sample project data ─── */
const SAMPLE_PROJECTS = [
  { id: 1, name: 'Website Redesign',   description: 'Full overhaul of the marketing site with new branding guidelines.', deadline: '2026-04-15', finished: true,  priority: 'none',   tags: ['Design', 'Dev'] },
  { id: 2, name: 'Mobile App MVP',     description: 'Build the first version of the iOS/Android app.',                  deadline: '2026-06-20', finished: false, priority: 'high',   tags: ['Dev'] },
  { id: 3, name: 'Brand Identity Kit', description: 'Logo, colors, typography, and brand guidelines document.',          deadline: '2026-03-01', finished: false, priority: 'medium', tags: ['Design', 'Marketing'] },
  { id: 4, name: 'API Integration',    description: 'Connect third-party APIs for payments and analytics.',              deadline: '2026-07-10', finished: false, priority: 'none',   tags: ['Dev', 'Ops'] },
  { id: 5, name: 'Analytics Dashboard',description: 'Internal dashboard for tracking user engagement metrics.',          deadline: '2026-05-01', finished: true,  priority: 'low',    tags: ['Dev', 'Research'] },
  { id: 6, name: 'E-Commerce Platform',description: 'Launch the online store with inventory management.',                deadline: '2026-08-25', finished: false, priority: 'none',   tags: ['Dev', 'Design'] },
];

/* ─── Sample calendar events ─── */
const SAMPLE_EVENTS = [
  { id: 1, title: 'API Integration – Kickoff',      date: '2026-05-12', color: 'var(--status-active)'  },
  { id: 2, title: 'Mobile App MVP – Design Review',  date: '2026-05-15', color: 'var(--status-active)'  },
  { id: 3, title: 'E-Commerce – Wireframes Due',      date: '2026-05-20', color: 'var(--accent)'         },
  { id: 4, title: 'Analytics Dashboard – Delivered',   date: '2026-05-01', color: 'var(--status-done)'    },
  { id: 5, title: 'Brand Identity – Deadline Passed', date: '2026-03-01', color: 'var(--status-overdue)' },
  { id: 6, title: 'Website Redesign – Final Handoff', date: '2026-04-15', color: 'var(--status-done)'    },
];

/* ─── Helpers ─── */
const today = new Date();
today.setHours(0, 0, 0, 0);

function getStatus(project) {
  const dl = new Date(project.deadline);
  dl.setHours(0, 0, 0, 0);
  if (dl < today && project.finished)  return 'done';
  if (dl < today && !project.finished) return 'overdue';
  return 'active';
}

const STATUS_LABELS = {
  active:  'Active',
  done:    'Completed',
  overdue: 'Overdue',
};

/* ─── Calendar helpers ─── */
const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

/* ─── Days remaining helper ─── */
function daysUntil(deadline) {
  const dl = new Date(deadline);
  dl.setHours(0, 0, 0, 0);
  const diff = Math.ceil((dl - today) / (1000 * 60 * 60 * 24));
  return diff;
}

/* ====================================================================
   Dashboard Component
   ==================================================================== */
function Dashboard({ onLogout }) {
  const [projects, setProjects]       = useState(SAMPLE_PROJECTS);
  const [calMonth, setCalMonth]       = useState(today.getMonth());
  const [calYear, setCalYear]         = useState(today.getFullYear());
  const [calOpen, setCalOpen]         = useState(false);

  /* Create modal state */
  const [createOpen, setCreateOpen]   = useState(false);
  const [createStep, setCreateStep]   = useState(1); // 1 = basics, 2 = details
  const [newName, setNewName]         = useState('');
  const [newDesc, setNewDesc]         = useState('');
  const [newDeadline, setNewDeadline] = useState('');
  const [newPriority, setNewPriority] = useState('none');
  const [newTags, setNewTags]         = useState([]);

  /* Project detail view */
  const [selectedProject, setSelectedProject] = useState(null);

  /* Per-project todos & notes (keyed by project id) */
  const [todosMap, setTodosMap] = useState({});
  const [notesMap, setNotesMap] = useState({});

  const getProjectTodos = (id) => todosMap[id] || [];
  const getProjectNotes = (id) => notesMap[id] || '';

  const setProjectTodos = (id, todos) => {
    setTodosMap((prev) => ({ ...prev, [id]: todos }));
  };
  const setProjectNotes = (id, notes) => {
    setNotesMap((prev) => ({ ...prev, [id]: notes }));
  };

  /* Sidebar dropdown state */
  const [menuOpenId, setMenuOpenId]       = useState(null);
  const [prioritySubId, setPrioritySubId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  /* ─── Sidebar dropdown handlers ─── */
  const toggleMenu = (id) => {
    setMenuOpenId(menuOpenId === id ? null : id);
    setPrioritySubId(null);
  };
  const closeMenu = () => {
    setMenuOpenId(null);
    setPrioritySubId(null);
  };
  const handleSetPriority = (projectId, priority) => {
    setProjects(projects.map((p) =>
      p.id === projectId ? { ...p, priority } : p
    ));
    closeMenu();
  };
  const handleDeleteProject = () => {
    if (!deleteConfirm) return;
    if (selectedProject && selectedProject.id === deleteConfirm.id) {
      setSelectedProject(null);
    }
    setProjects(projects.filter((p) => p.id !== deleteConfirm.id));
    setDeleteConfirm(null);
    closeMenu();
  };

  /* ─── Create project handlers ─── */
  const resetCreateForm = () => {
    setNewName('');
    setNewDesc('');
    setNewDeadline('');
    setNewPriority('none');
    setNewTags([]);
    setCreateStep(1);
  };

  const openCreateModal = () => {
    resetCreateForm();
    setCreateOpen(true);
  };

  const closeCreateModal = () => {
    setCreateOpen(false);
    resetCreateForm();
  };

  const handleNextStep = () => {
    if (!newName.trim()) return;
    setCreateStep(2);
  };

  const toggleTag = (tag) => {
    setNewTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleCreateProject = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const newProject = {
      id: Date.now(),
      name: newName.trim(),
      description: newDesc.trim(),
      deadline: newDeadline || new Date().toISOString().split('T')[0],
      finished: false,
      priority: newPriority,
      tags: [...newTags],
    };
    setProjects([newProject, ...projects]);
    closeCreateModal();
  };

  /* ─── Calendar navigation ─── */
  const prevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); }
    else setCalMonth(calMonth - 1);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); }
    else setCalMonth(calMonth + 1);
  };

  /* ─── Build calendar grid ─── */
  const daysInMonth  = getDaysInMonth(calYear, calMonth);
  const firstDay     = getFirstDayOfMonth(calYear, calMonth);
  const calendarCells = [];

  for (let i = 0; i < firstDay; i++) {
    calendarCells.push(<div key={`b-${i}`} className="cal-cell cal-blank" />);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const isToday =
      d === today.getDate() &&
      calMonth === today.getMonth() &&
      calYear === today.getFullYear();
    const dayEvents = SAMPLE_EVENTS.filter((ev) => ev.date === dateStr);

    calendarCells.push(
      <div
        key={d}
        className={`cal-cell${isToday ? ' cal-today' : ''}${dayEvents.length ? ' cal-has-event' : ''}`}
      >
        <span className="cal-day-number">{d}</span>
        {dayEvents.length > 0 && (
          <div className="cal-dots">
            {dayEvents.map((ev) => (
              <span key={ev.id} className="cal-dot" style={{ background: ev.color }} title={ev.title} />
            ))}
          </div>
        )}
      </div>,
    );
  }

  /* ─── Upcoming events ─── */
  const upcoming = SAMPLE_EVENTS
    .filter((ev) => new Date(ev.date) >= today)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5);

  /* ─── Priority badge helper ─── */
  const getPriorityInfo = (val) => PRIORITY_OPTIONS.find((p) => p.value === val) || PRIORITY_OPTIONS[3];

  return (
    <div className="dashboard" onClick={closeMenu}>
      {/* ─── Navbar ─── */}
      <nav className="navbar" id="navbar">
        <div className="navbar-brand">
          <div className="navbar-logo-icon">⚡</div>
          <span className="navbar-logo-text">IdeaForge</span>
        </div>
        <div className="navbar-right">
          <button className="profile-btn" id="profile-btn" onClick={onLogout} title="Sign out">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="4"/>
              <path d="M4 20c0-4 4-6 8-6s8 2 8 6"/>
            </svg>
          </button>
        </div>
      </nav>

      <div className="dashboard-body">
        {/* ─── Sidebar ─── */}
        <aside className="sidebar" id="sidebar">
          <h2 className="sidebar-heading">Projects</h2>

          <ul className="project-list">
            {projects.map((proj) => {
              const status = getStatus(proj);
              const pColor = getPriorityInfo(proj.priority).color;
              return (
                <li
                  key={proj.id}
                  className={`project-item${selectedProject?.id === proj.id ? ' project-item-selected' : ''}`}
                  style={{ borderLeft: pColor !== 'transparent' ? `3px solid ${pColor}` : '3px solid transparent' }}
                  onClick={() => setSelectedProject(proj)}
                >
                  <span className={`status-dot status-${status}`} title={STATUS_LABELS[status]} />
                  <div className="project-info">
                    <span className="project-name">{proj.name}</span>
                    <span className="project-date">{proj.deadline}</span>
                  </div>

                  <button
                    className="project-menu-btn"
                    onClick={(e) => { e.stopPropagation(); toggleMenu(proj.id); }}
                    aria-label="Project options"
                  >
                    ⋮
                  </button>

                  {menuOpenId === proj.id && (
                    <div className="project-dropdown">
                      <button
                        className="dropdown-item"
                        onClick={(e) => { e.stopPropagation(); setPrioritySubId(prioritySubId === proj.id ? null : proj.id); }}
                      >
                        <span className="dropdown-icon">⚑</span>
                        Priority
                        <span className="dropdown-arrow">{prioritySubId === proj.id ? '‹' : '›'}</span>
                      </button>

                      {prioritySubId === proj.id && (
                        <div className="priority-submenu">
                          {PRIORITY_OPTIONS.map((opt) => (
                            <button
                              key={opt.value}
                              className={`dropdown-item priority-option${proj.priority === opt.value ? ' priority-active' : ''}`}
                              onClick={(e) => { e.stopPropagation(); handleSetPriority(proj.id, opt.value); }}
                            >
                              <span className="priority-dot" style={{ background: opt.color === 'transparent' ? 'var(--border-strong)' : opt.color }} />
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      )}

                      <button
                        className="dropdown-item dropdown-danger"
                        onClick={(e) => { e.stopPropagation(); setDeleteConfirm(proj); closeMenu(); }}
                      >
                        <span className="dropdown-icon">🗑</span>
                        Delete
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

          <div className="legend">
            <div className="legend-item"><span className="status-dot status-active" /> Active</div>
            <div className="legend-item"><span className="status-dot status-done" /> Completed</div>
            <div className="legend-item"><span className="status-dot status-overdue" /> Overdue</div>
          </div>
        </aside>

        {/* ─── Main Content ─── */}
        <main className="main-content" id="main-content">
          {/* Show project detail if selected, otherwise show create-project prompt */}
          {selectedProject ? (
            <ProjectDetail
              project={selectedProject}
              onClose={() => setSelectedProject(null)}
              getPriorityInfo={getPriorityInfo}
              todos={getProjectTodos(selectedProject.id)}
              onTodosChange={(todos) => setProjectTodos(selectedProject.id, todos)}
              notes={getProjectNotes(selectedProject.id)}
              onNotesChange={(notes) => setProjectNotes(selectedProject.id, notes)}
            />
          ) : (
            <div className="create-center">
              <div className="create-prompt">
                <div className="create-prompt-icon">📋</div>
                <h2 className="create-prompt-title">Start a new project</h2>
                <p className="create-prompt-desc">
                  Track deadlines, set priorities, and keep your work organized.
                </p>
                <button className="create-btn" id="create-project-btn" onClick={openCreateModal}>
                  <span className="create-icon">＋</span>
                  Create New Project
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ─── Floating Calendar Button ─── */}
      <button className="cal-fab" id="cal-fab" onClick={() => setCalOpen(true)} aria-label="Open calendar" title="Open calendar">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </button>

      {/* ─── Calendar Overlay ─── */}
      {calOpen && (
        <div className="cal-overlay" onClick={() => setCalOpen(false)}>
          <div className="cal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="cal-panel-header">
              <h2 className="calendar-title">Global Calendar</h2>
              <button className="cal-close-btn" onClick={() => setCalOpen(false)} aria-label="Close calendar">✕</button>
            </div>

            <div className="calendar-nav">
              <button className="cal-nav-btn" onClick={prevMonth} aria-label="Previous month">‹</button>
              <span className="cal-month-label">{MONTH_NAMES[calMonth]} {calYear}</span>
              <button className="cal-nav-btn" onClick={nextMonth} aria-label="Next month">›</button>
            </div>

            <div className="calendar-grid">
              {DAY_NAMES.map((d) => (
                <div key={d} className="cal-cell cal-day-name">{d}</div>
              ))}
              {calendarCells}
            </div>

            {upcoming.length > 0 && (
              <div className="cal-panel-upcoming">
                <h3 className="cal-panel-upcoming-title">Upcoming Events</h3>
                <ul className="upcoming-list">
                  {upcoming.map((ev) => (
                    <li key={ev.id} className="upcoming-item">
                      <span className="upcoming-dot" style={{ background: ev.color }} />
                      <div className="upcoming-info">
                        <span className="upcoming-name">{ev.title}</span>
                        <span className="upcoming-date">{ev.date}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Create Project Modal (multi-step) ─── */}
      {createOpen && (
        <div className="modal-overlay" onClick={closeCreateModal}>
          <div className="modal-panel create-modal" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="modal-header">
              <h2 className="modal-title">New Project</h2>
              <button type="button" className="cal-close-btn" onClick={closeCreateModal} aria-label="Close">✕</button>
            </div>

            {/* Step indicator */}
            <div className="step-indicator">
              <div className={`step-dot${createStep >= 1 ? ' step-active' : ''}`}>1</div>
              <div className="step-line" />
              <div className={`step-dot${createStep >= 2 ? ' step-active' : ''}`}>2</div>
            </div>
            <div className="step-labels">
              <span className={createStep === 1 ? 'step-label-active' : ''}>Basics</span>
              <span className={createStep === 2 ? 'step-label-active' : ''}>Details</span>
            </div>

            <form onSubmit={handleCreateProject}>
              {/* Step 1: Basics */}
              {createStep === 1 && (
                <div className="create-step">
                  <div className="modal-field">
                    <label htmlFor="new-project-name">Project Name *</label>
                    <input
                      id="new-project-name"
                      type="text"
                      placeholder="e.g. Landing Page Redesign"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      autoFocus
                      required
                    />
                  </div>

                  <div className="modal-field">
                    <label htmlFor="new-project-desc">Description</label>
                    <textarea
                      id="new-project-desc"
                      placeholder="Brief summary of what this project involves…"
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="modal-field">
                    <label htmlFor="new-project-deadline">Deadline</label>
                    <input
                      id="new-project-deadline"
                      type="date"
                      value={newDeadline}
                      onChange={(e) => setNewDeadline(e.target.value)}
                    />
                  </div>

                  <button type="button" className="modal-submit-btn" onClick={handleNextStep}>
                    Next →
                  </button>
                </div>
              )}

              {/* Step 2: Details */}
              {createStep === 2 && (
                <div className="create-step">
                  {/* Priority */}
                  <div className="modal-field">
                    <label>Priority</label>
                    <div className="priority-selector">
                      {PRIORITY_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          className={`priority-chip${newPriority === opt.value ? ' priority-chip-active' : ''}`}
                          onClick={() => setNewPriority(opt.value)}
                        >
                          <span
                            className="priority-chip-dot"
                            style={{ background: opt.color === 'transparent' ? 'var(--border-strong)' : opt.color }}
                          />
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="modal-field">
                    <label>Tags</label>
                    <div className="tag-selector">
                      {TAG_PALETTE.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          className={`tag-chip${newTags.includes(tag) ? ' tag-chip-active' : ''}`}
                          onClick={() => toggleTag(tag)}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Summary preview */}
                  <div className="create-preview">
                    <h4 className="create-preview-heading">Summary</h4>
                    <div className="create-preview-row">
                      <span className="create-preview-label">Name</span>
                      <span className="create-preview-value">{newName}</span>
                    </div>
                    {newDesc && (
                      <div className="create-preview-row">
                        <span className="create-preview-label">Description</span>
                        <span className="create-preview-value create-preview-desc">{newDesc}</span>
                      </div>
                    )}
                    <div className="create-preview-row">
                      <span className="create-preview-label">Deadline</span>
                      <span className="create-preview-value">{newDeadline || 'Today'}</span>
                    </div>
                    <div className="create-preview-row">
                      <span className="create-preview-label">Priority</span>
                      <span className="create-preview-value" style={{ textTransform: 'capitalize' }}>{newPriority}</span>
                    </div>
                    {newTags.length > 0 && (
                      <div className="create-preview-row">
                        <span className="create-preview-label">Tags</span>
                        <span className="create-preview-value">{newTags.join(', ')}</span>
                      </div>
                    )}
                  </div>

                  <div className="create-step-actions">
                    <button type="button" className="step-back-btn" onClick={() => setCreateStep(1)}>
                      ← Back
                    </button>
                    <button type="submit" className="modal-submit-btn create-submit">
                      Create Project
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* ─── Delete Confirmation Modal ─── */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-panel delete-confirm-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Delete Project</h2>
              <button type="button" className="cal-close-btn" onClick={() => setDeleteConfirm(null)} aria-label="Close">✕</button>
            </div>
            <p className="delete-confirm-text">
              Are you sure you want to delete <strong>{deleteConfirm.name}</strong>? This action cannot be undone.
            </p>
            <div className="delete-confirm-actions">
              <button className="delete-cancel-btn" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="delete-confirm-btn" onClick={handleDeleteProject}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ====================================================================
   Project Detail View (shown in main content when a project is selected)
   ==================================================================== */
function ProjectDetail({ project, onClose, getPriorityInfo, todos, onTodosChange, notes, onNotesChange }) {
  const status = getStatus(project);
  const priority = getPriorityInfo(project.priority);
  const days = daysUntil(project.deadline);

  /* Local state for adding a new todo */
  const [newTodo, setNewTodo] = useState('');
  const [newTodoDeadline, setNewTodoDeadline] = useState('');
  const [isNotesEditing, setIsNotesEditing] = useState(false);
  const [notesDraft, setNotesDraft] = useState(notes);

  let deadlineLabel;
  if (project.finished) {
    deadlineLabel = 'Completed';
  } else if (days < 0) {
    deadlineLabel = `${Math.abs(days)} days overdue`;
  } else if (days === 0) {
    deadlineLabel = 'Due today';
  } else {
    deadlineLabel = `${days} days remaining`;
  }

  /* ─── Todo handlers ─── */
  const addTodo = () => {
    if (!newTodo.trim()) return;
    const todo = {
      id: Date.now(),
      text: newTodo.trim(),
      deadline: newTodoDeadline || null,
      done: false,
    };
    onTodosChange([...todos, todo]);
    setNewTodo('');
    setNewTodoDeadline('');
  };

  const toggleTodo = (todoId) => {
    onTodosChange(todos.map((t) => t.id === todoId ? { ...t, done: !t.done } : t));
  };

  const deleteTodo = (todoId) => {
    onTodosChange(todos.filter((t) => t.id !== todoId));
  };

  /* ─── Notes handlers ─── */
  const startEditingNotes = () => {
    setNotesDraft(notes);
    setIsNotesEditing(true);
  };

  const saveNotes = () => {
    onNotesChange(notesDraft);
    setIsNotesEditing(false);
  };

  const cancelNotes = () => {
    setNotesDraft(notes);
    setIsNotesEditing(false);
  };

  const completedCount = todos.filter((t) => t.done).length;
  const totalCount = todos.length;

  return (
    <div className="project-detail">
      {/* Header row */}
      <div className="detail-header">
        <div className="detail-header-left">
          <span className={`status-dot status-${status}`} />
          <h2 className="detail-title">{project.name}</h2>
        </div>
        <button className="detail-close-btn" onClick={onClose} aria-label="Close detail">✕</button>
      </div>

      {/* Meta row */}
      <div className="detail-meta">
        <div className="detail-meta-item">
          <span className="detail-meta-label">Status</span>
          <span className={`detail-badge detail-badge-${status}`}>{STATUS_LABELS[status]}</span>
        </div>
        <div className="detail-meta-item">
          <span className="detail-meta-label">Priority</span>
          <span className="detail-badge" style={{
            background: priority.color !== 'transparent' ? priority.color + '14' : 'var(--bg-tertiary)',
            color: priority.color !== 'transparent' ? priority.color : 'var(--text-secondary)',
          }}>
            {priority.label}
          </span>
        </div>
        <div className="detail-meta-item">
          <span className="detail-meta-label">Deadline</span>
          <span className="detail-meta-value">{project.deadline}</span>
        </div>
        <div className="detail-meta-item">
          <span className="detail-meta-label">Time Left</span>
          <span className={`detail-meta-value ${days < 0 && !project.finished ? 'detail-overdue-text' : ''}`}>
            {deadlineLabel}
          </span>
        </div>
      </div>

      {/* Tags */}
      {project.tags && project.tags.length > 0 && (
        <div className="detail-tags">
          {project.tags.map((tag) => (
            <span key={tag} className="detail-tag">{tag}</span>
          ))}
        </div>
      )}

      {/* Description */}
      {project.description && (
        <div className="detail-section">
          <h3 className="detail-section-title">Description</h3>
          <p className="detail-description">{project.description}</p>
        </div>
      )}

      {/* ─── To-Do List ─── */}
      <div className="detail-section">
        <div className="detail-section-header">
          <h3 className="detail-section-title">To-Do List</h3>
          {totalCount > 0 && (
            <span className="todo-progress">{completedCount}/{totalCount} done</span>
          )}
        </div>

        {/* Progress bar */}
        {totalCount > 0 && (
          <div className="todo-progress-bar">
            <div
              className="todo-progress-fill"
              style={{ width: `${(completedCount / totalCount) * 100}%` }}
            />
          </div>
        )}

        {/* Todo items */}
        <ul className="todo-list">
          {todos.map((todo) => {
            const overdue = todo.deadline && !todo.done && new Date(todo.deadline) < today;
            return (
              <li key={todo.id} className={`todo-item${todo.done ? ' todo-done' : ''}${overdue ? ' todo-overdue' : ''}`}>
                <button
                  className={`todo-checkbox${todo.done ? ' todo-checked' : ''}`}
                  onClick={() => toggleTodo(todo.id)}
                  aria-label={todo.done ? 'Mark incomplete' : 'Mark complete'}
                >
                  {todo.done && '✓'}
                </button>
                <div className="todo-content">
                  <span className="todo-text">{todo.text}</span>
                  {todo.deadline && (
                    <span className={`todo-deadline${overdue ? ' todo-deadline-overdue' : ''}`}>
                      {overdue ? '⚠ ' : '📅 '}{todo.deadline}
                    </span>
                  )}
                </div>
                <button className="todo-delete" onClick={() => deleteTodo(todo.id)} aria-label="Delete task">✕</button>
              </li>
            );
          })}
        </ul>

        {/* Add todo form */}
        <div className="todo-add">
          <input
            className="todo-add-input"
            type="text"
            placeholder="Add a task…"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTodo()}
          />
          <input
            className="todo-add-date"
            type="date"
            value={newTodoDeadline}
            onChange={(e) => setNewTodoDeadline(e.target.value)}
            title="Optional deadline"
          />
          <button className="todo-add-btn" onClick={addTodo} disabled={!newTodo.trim()}>Add</button>
        </div>
      </div>

      {/* ─── Notes Blackboard ─── */}
      <div className="detail-section">
        <div className="detail-section-header">
          <h3 className="detail-section-title">Notes</h3>
          {!isNotesEditing && (
            <button className="notes-edit-btn" onClick={startEditingNotes}>
              {notes ? 'Edit' : '+ Add Notes'}
            </button>
          )}
        </div>

        {isNotesEditing ? (
          <div className="notes-editor">
            <textarea
              className="notes-textarea"
              value={notesDraft}
              onChange={(e) => setNotesDraft(e.target.value)}
              placeholder="Write your notes here… supports free-form text, ideas, reminders…"
              rows={8}
              autoFocus
            />
            <div className="notes-actions">
              <button className="notes-cancel-btn" onClick={cancelNotes}>Cancel</button>
              <button className="notes-save-btn" onClick={saveNotes}>Save Notes</button>
            </div>
          </div>
        ) : (
          <div className="notes-blackboard" onClick={startEditingNotes}>
            {notes ? (
              <pre className="notes-content">{notes}</pre>
            ) : (
              <p className="notes-placeholder">Click to add notes…</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
