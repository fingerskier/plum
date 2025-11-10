const navItems = [
  { id: 'overview', label: 'Overview' },
  { id: 'sessions', label: 'Test Sessions' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'settings', label: 'Settings' },
];

export default function AppSidebar() {
  return (
    <aside className="app-sidebar" aria-label="Primary navigation">
      <nav>
        <ul>
          {navItems.map((item) => (
            <li key={item.id}>
              <button type="button" className="sidebar-link" data-view={item.id}>
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
