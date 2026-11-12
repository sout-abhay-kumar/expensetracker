import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  LogOut,
  Sparkles,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
export default function Layout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const links = [
    ["/", "Overview", LayoutDashboard],
    ["/transactions", "Transactions", ArrowLeftRight],
    ["/budgets", "Budgets", Wallet],
  ];
  return (
    <div className="app-shell">
      <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark">E</div>
          <span>
            Expense<span className="brand-light">Tracker</span>
          </span>
          <button className="mobile-close" onClick={() => setOpen(false)}>
            <X size={18} />
          </button>
        </div>
        <div className="nav-label">WORKSPACE</div>
        <nav>
          {links.map(([to, label, Icon]) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <Sparkles size={17} />
            <strong>Money, made clearer.</strong>
            <p>Small steps today make a calmer tomorrow.</p>
          </div>
          <button
            className="nav-link logout"
            onClick={() => {
              signOut();
              navigate("/login");
            }}
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>
      {open && <div className="mobile-scrim" onClick={() => setOpen(false)} />}
      <main className="main-area">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setOpen(true)}>
            <Menu />
          </button>
          <div className="breadcrumb">
            Workspace <span>/</span>{" "}
            <b>
              {links.find((x) => x[0] === location.pathname)?.[1] || "Overview"}
            </b>
          </div>
          <div className="profile">
            <div className="avatar">
              {user?.picture ? (
                <img src={user.picture} referrerPolicy="no-referrer" />
              ) : (
                user?.name?.[0]
              )}
            </div>
            <div className="profile-name">
              <b>{user?.name}</b>
              <small>{user?.email}</small>
            </div>
          </div>
        </header>
        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
