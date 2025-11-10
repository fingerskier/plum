import TestSessionsPanel from './TestSessionsPanel.jsx';
import SettingsPanel from './SettingsPanel.jsx';

export default function AppWorkspace({ activeView }) {
  let content;

  switch (activeView) {
    case 'sessions':
      content = <TestSessionsPanel />;
      break;
    case 'settings':
      content = <SettingsPanel />;
      break;
    default:
      content = (
        <section className="workspace-card">
          <h2>Welcome aboard</h2>
          <p>
            Select a section from the sidebar to begin coordinating test operators. This area will
            display live telemetry, analytics, and controls as the application evolves.
          </p>
        </section>
      );
  }

  return (
    <main className="app-workspace" role="main">
      {content}
    </main>
  );
}
