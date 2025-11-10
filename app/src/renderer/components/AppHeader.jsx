export default function AppHeader() {
  return (
    <header className="app-header">
      <h1 className="app-title">Plum Operator Console</h1>
      <div className="app-header-meta">
        <span className="app-status-indicator" aria-label="Connection status" />
        <span className="app-status-label">Disconnected</span>
      </div>
    </header>
  );
}
