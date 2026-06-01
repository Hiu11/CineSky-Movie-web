import { useEffect, useState } from "react";

export default function AdminSidebar({ activeModule, navGroups, onSwitchModule }) {
  const getActiveGroupKey = () => navGroups.find((group) => group.items.some((item) => item.key === activeModule))?.key || "";
  const [openGroupKey, setOpenGroupKey] = useState(getActiveGroupKey);
  const navColumns = navGroups.reduce(
    (columns, group, index) => {
      columns[index % 2].push(group);
      return columns;
    },
    [[], []]
  );

  useEffect(() => {
    setOpenGroupKey(getActiveGroupKey());
  }, [activeModule, navGroups]);

  return (
    <aside className="admin-sidebar">
      <nav className="admin-nav">
        {navColumns.map((groups, columnIndex) => (
          <div className="admin-nav__column" key={`admin-nav-column-${columnIndex}`}>
            {groups.map((group) => {
              const isGroupActive = group.items.some((item) => item.key === activeModule);
              const isGroupOpen = openGroupKey === group.key;

              return (
                <details key={group.key} className={"admin-nav-group" + (isGroupActive ? " is-active" : "")} open={isGroupOpen}>
                  <summary
                    onClick={(event) => {
                      event.preventDefault();
                      setOpenGroupKey((current) => (current === group.key ? "" : group.key));
                    }}
                  >
                    <span>{group.label}</span>
                    <i aria-hidden="true"></i>
                  </summary>
                  <div className="admin-nav-group__items">
                    {group.items.map((item) => (
                      <button
                        key={item.key}
                        className={activeModule === item.key ? "active" : ""}
                        onClick={() => {
                          setOpenGroupKey(group.key);
                          onSwitchModule(item.key);
                        }}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </details>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
