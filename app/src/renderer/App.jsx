import AppHeader from './components/AppHeader.jsx';
import AppSidebar from './components/AppSidebar.jsx';
import AppWorkspace from './components/AppWorkspace.jsx';

export default function App() {
  return (
    <div className="app-shell">
      <AppHeader />
      <div className="app-body">
        <AppSidebar />
        <AppWorkspace />
      </div>
    </div>
  );
}
