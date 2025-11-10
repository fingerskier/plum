import { useState } from 'react';

import AppHeader from './components/AppHeader.jsx';
import AppSidebar from './components/AppSidebar.jsx';
import AppWorkspace from './components/AppWorkspace.jsx';

export default function App() {
  const [activeView, setActiveView] = useState('overview');

  const handleSelectView = (viewId) => {
    if (typeof viewId === 'string' && viewId.trim()) {
      setActiveView(viewId);
    }
  };

  return (
    <div className="app-shell">
      <AppHeader />
      <div className="app-body">
        <AppSidebar activeView={activeView} onSelectView={handleSelectView} />
        <AppWorkspace activeView={activeView} />
      </div>
    </div>
  );
}
