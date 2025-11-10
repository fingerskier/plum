import TestSessionsPanel from './TestSessionsPanel.jsx';

export default function AppWorkspace({ activeView }) {
  return (
    <main className="app-workspace" role="main">
      {activeView === 'sessions' ? (
        <TestSessionsPanel />
      ) : (
        <section className="workspace-card">
          <h2>Welcome aboard</h2>
          <p>
            Select a section from the sidebar to begin coordinating test operators. This area will
            display live telemetry, analytics, and controls as the application evolves.
          </p>
        </section>
      )}
    </main>
  );
}
