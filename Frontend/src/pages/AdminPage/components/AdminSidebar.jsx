export default function AdminSidebar({ activeModule, navGroups, onSwitchModule }) {
  return (
    <aside className="admin-sidebar">
      <nav className="admin-nav">
        {navGroups.map((group) => {
          const isGroupActive = group.items.some((item) => item.key === activeModule);

          return (
            <details key={group.key} className={"admin-nav-group" + (isGroupActive ? " is-active" : "")} open={isGroupActive}>
              <summary>
                <span>{group.label}</span>
                <i aria-hidden="true"></i>
              </summary>
              <div className="admin-nav-group__items">
                {group.items.map((item) => (
                  <button key={item.key} className={activeModule === item.key ? "active" : ""} onClick={() => onSwitchModule(item.key)}>
                    {item.label}
                  </button>
                ))}
              </div>
            </details>
          );
        })}
      </nav>
    </aside>
  );
}
