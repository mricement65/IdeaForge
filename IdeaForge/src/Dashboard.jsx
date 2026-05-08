import { useState } from 'react';
import './Dashboard.css';

/* ─── Sample project data ─── */
const SAMPLE_PROJECTS = [
  { id: 1, name: 'Website Redesign',      deadline: '2026-04-15', finished: true,  priority: 'none' },
  { id: 2, name: 'Mobile App MVP',         deadline: '2026-06-20', finished: false, priority: 'high' },
  { id: 3, name: 'Brand Identity Kit',     deadline: '2026-03-01', finished: false, priority: 'medium' },
  { id: 4, name: 'API Integration',        deadline: '2026-07-10', finished: false, priority: 'none' },
  { id: 5, name: 'Analytics Dashboard',    deadline: '2026-05-01', finished: true,  priority: 'low' },
  { id: 6, name: 'E-Commerce Platform',    deadline: '2026-08-25', finished: false, priority: 'none' },
];

const PRIORITY_OPTIONS = [
  { value: 'high',   label: 'High',   color: '#ef4444' },
  { value: 'medium', label: 'Medium', color: '#f59e0b' },
  { value: 'low',    label: 'Low',    color: '#22c55e' },
  { value: 'none',   label: 'None',   color: 'transparent' },
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
  if (dl < today && project.finished)  return 'done';    // green
  if (dl < today && !project.finished) return 'overdue';  // red
  return 'active'; // blue
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

/* ====================================================================
   Dashboard Component
   ==================================================================== */
function Dashboard({ onLogout }) {
  const [projects, setProjects]       = useState(SAMPLE_PROJECTS);
  const [calMonth, setCalMonth]       = useState(today.getMonth());
  const [calYear, setCalYear]         = useState(today.getFullYear());
  const [calOpen, setCalOpen]         = useState(false);
  const [createOpen, setCreateOpen]   = useState(false);
  const [newName, setNewName]         = useState('');
  const [newDeadline, setNewDeadline] = useState('');

  /* Dropdown & delete-confirm state */
  const [menuOpenId, setMenuOpenId]       = useState(null);
  const [prioritySubId, setPrioritySubId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // project object or null

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
    setProjects(projects.filter((p) => p.id !== deleteConfirm.id));
    setDeleteConfirm(null);
    closeMenu();
  };

  const handleCreateProject = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const newProject = {
      id: Date.now(),
      name: newName.trim(),
      deadline: newDeadline || new Date().toISOString().split('T')[0],
      finished: false,
      priority: 'none',
    };
    setProjects([newProject, ...projects]);
    setNewName('');
    setNewDeadline('');
    setCreateOpen(false);
  };

  const prevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); }
    else setCalMonth(calMonth - 1);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); }
    else setCalMonth(calMonth + 1);
  };

  /* Calendar grid */
  const daysInMonth  = getDaysInMonth(calYear, calMonth);
  const firstDay     = getFirstDayOfMonth(calYear, calMonth);
  const calendarCells = [];

  // blanks before first day
  for (let i = 0; i < firstDay; i++) {
    calendarCells.push(<div key={`b-${i}`} className="cal-cell cal-blank" />);
  }

  // actual days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const isToday =
      d === today.getDate() &&
      calMonth === today.getMonth() &&
      calYear === today.getFullYear();

    // events on this day
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
              <span
                key={ev.id}
                className="cal-dot"
                style={{ background: ev.color }}
                title={ev.title}
              />
            ))}
          </div>
        )}
      </div>,
    );
  }

  /* Upcoming events (next 30 days) */
  const upcoming = SAMPLE_EVENTS
    .filter((ev) => {
      const d = new Date(ev.date);
      return d >= today;
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5);

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
              const pColor = PRIORITY_OPTIONS.find((p) => p.value === proj.priority)?.color || 'transparent';
              return (
                <li
                  key={proj.id}
                  className="project-item"
                  style={{ borderLeft: pColor !== 'transparent' ? `3px solid ${pColor}` : '3px solid transparent' }}
                >
                  <span className={`status-dot status-${status}`} title={STATUS_LABELS[status]} />
                  <div className="project-info">
                    <span className="project-name">{proj.name}</span>
                    <span className="project-date">{proj.deadline}</span>
                  </div>

                  {/* Kebab menu button */}
                  <button
                    className="project-menu-btn"
                    onClick={(e) => { e.stopPropagation(); toggleMenu(proj.id); }}
                    aria-label="Project options"
                  >
                    ⋮
                  </button>

                  {/* Dropdown */}
                  {menuOpenId === proj.id && (
                    <div className="project-dropdown">
                      {/* Priority option */}
                      <button
                        className="dropdown-item"
                        onClick={(e) => { e.stopPropagation(); setPrioritySubId(prioritySubId === proj.id ? null : proj.id); }}
                      >
                        <span className="dropdown-icon">⚑</span>
                        Priority
                        <span className="dropdown-arrow">{prioritySubId === proj.id ? '‹' : '›'}</span>
                      </button>

                      {/* Priority sub-menu */}
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

                      {/* Delete option */}
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

          {/* Legend */}
          <div className="legend">
            <div className="legend-item"><span className="status-dot status-active" /> Active</div>
            <div className="legend-item"><span className="status-dot status-done" /> Completed</div>
            <div className="legend-item"><span className="status-dot status-overdue" /> Overdue</div>
          </div>
        </aside>

        {/* ─── Main Content ─── */}
        <main className="main-content" id="main-content">
          {/* Create New Project – centered button */}
          <div className="create-center">
            <button
              className="create-btn"
              id="create-project-btn"
              onClick={() => setCreateOpen(true)}
            >
              <span className="create-icon">＋</span>
              Create New Project
            </button>
          </div>
        </main>
      </div>

      {/* ─── Floating Calendar Button ─── */}
      <button
        className="cal-fab"
        id="cal-fab"
        onClick={() => setCalOpen(true)}
        aria-label="Open calendar"
        title="Open calendar"
      >
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

            {/* Upcoming inside the panel */}
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

      {/* ─── Create Project Modal ─── */}
      {createOpen && (
        <div className="modal-overlay" onClick={() => setCreateOpen(false)}>
          <form className="modal-panel" onClick={(e) => e.stopPropagation()} onSubmit={handleCreateProject}>
            <div className="modal-header">
              <h2 className="modal-title">New Project</h2>
              <button type="button" className="cal-close-btn" onClick={() => setCreateOpen(false)} aria-label="Close">✕</button>
            </div>

            <div className="modal-field">
              <label htmlFor="new-project-name">Project Name</label>
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
              <label htmlFor="new-project-deadline">Deadline</label>
              <input
                id="new-project-deadline"
                type="date"
                value={newDeadline}
                onChange={(e) => setNewDeadline(e.target.value)}
              />
            </div>

            <button type="submit" className="modal-submit-btn">
              Add Project
            </button>
          </form>
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
              <button className="delete-cancel-btn" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </button>
              <button className="delete-confirm-btn" onClick={handleDeleteProject}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
