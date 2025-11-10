import React from 'react';

function Sidebar() {
  return (
    <aside className="sidebar">
      <h2 className="sidebar__title">Plum</h2>
      <nav className="sidebar__nav">
        <button type="button">Dashboard</button>
        <button type="button">Sessions</button>
        <button type="button">Settings</button>
      </nav>
    </aside>
  );
}

function Header() {
  return (
    <header className="header">
      <div>
        <h1 className="header__title">AI Test Operator</h1>
        <p className="header__subtitle">Monitor your evaluation runs and tune automation.</p>
      </div>
      <div className="header__actions">
        <button type="button" className="primary">New run</button>
        <button type="button" className="secondary">Import plan</button>
      </div>
    </header>
  );
}

function ActivityPanel() {
  return (
    <section className="panel">
      <h3>Recent activity</h3>
      <ul>
        <li>No runs yet. Kick off your first evaluation from the New run button.</li>
      </ul>
    </section>
  );
}

function EmptyState() {
  return (
    <section className="panel panel--empty">
      <h3>Getting started</h3>
      <p>
        Use the actions above to connect a workspace, configure prompts, and begin tracking
        automated tests.
      </p>
    </section>
  );
}

export default function App() {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="content">
        <Header />
        <div className="content__grid">
          <ActivityPanel />
          <EmptyState />
        </div>
      </main>
    </div>
  );
}
