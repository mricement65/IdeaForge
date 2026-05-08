import { useState } from 'react';
import './Dashboard.css';

/* ─── Sample project data ─── */
const SAMPLE_PROJECTS = [
  { id: 1, name: 'Website Redesign',      deadline: '2026-04-15', finished: true  },
  { id: 2, name: 'Mobile App MVP',         deadline: '2026-06-20', finished: false },
  { id: 3, name: 'Brand Identity Kit',     deadline: '2026-03-01', finished: false },
  { id: 4, name: 'API Integration',        deadline: '2026-07-10', finished: false },
  { id: 5, name: 'Analytics Dashboard',    deadline: '2026-05-01', finished: true  },
  { id: 6, name: 'E-Commerce Platform',    deadline: '2026-08-25', finished: false },
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
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [calYear, setCalYear]   = useState(today.getFullYear());

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
    <div className="dashboard">
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
            {SAMPLE_PROJECTS.map((proj) => {
              const status = getStatus(proj);
              return (
                <li key={proj.id} className="project-item">
                  <span className={`status-dot status-${status}`} title={STATUS_LABELS[status]} />
                  <div className="project-info">
                    <span className="project-name">{proj.name}</span>
                    <span className="project-date">{proj.deadline}</span>
                  </div>
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
          {/* Create New Project */}
          <section className="create-section">
            <button className="create-btn" id="create-project-btn">
              <span className="create-icon">＋</span>
              Create New Project
            </button>
            <p className="create-hint">Start tracking a new gig or project</p>
          </section>

          {/* Calendar */}
          <section className="calendar-section">
            <div className="calendar-header">
              <h2 className="calendar-title">Calendar</h2>
              <div className="calendar-nav">
                <button className="cal-nav-btn" onClick={prevMonth} aria-label="Previous month">‹</button>
                <span className="cal-month-label">{MONTH_NAMES[calMonth]} {calYear}</span>
                <button className="cal-nav-btn" onClick={nextMonth} aria-label="Next month">›</button>
              </div>
            </div>

            <div className="calendar-grid">
              {DAY_NAMES.map((d) => (
                <div key={d} className="cal-cell cal-day-name">{d}</div>
              ))}
              {calendarCells}
            </div>
          </section>

          {/* Upcoming Events */}
          <section className="upcoming-section">
            <h2 className="upcoming-title">Upcoming Events</h2>
            {upcoming.length === 0 && (
              <p className="upcoming-empty">No upcoming events.</p>
            )}
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
          </section>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
