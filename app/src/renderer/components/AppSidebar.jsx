const navItems = [
  { id: 'overview', label: 'Overview' },
  { id: 'sessions', label: 'Test Sessions' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'settings', label: 'Settings' },
];

export default function AppSidebar({ activeView, onSelectView }) {
  const handleClick = (viewId) => {
    if (typeof onSelectView === 'function') {
      onSelectView(viewId);
    }
  };

  return (
    <aside className="app-sidebar" aria-label="Primary navigation">
      <nav>
        <ul>
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className={`sidebar-link${activeView === item.id ? ' is-active' : ''}`}
                data-view={item.id}
                aria-current={activeView === item.id ? 'page' : undefined}
                onClick={() => handleClick(item.id)}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
