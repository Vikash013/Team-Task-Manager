import { Bell, FolderKanban, LayoutDashboard, ListTodo, LogOut, MailPlus, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getOverdueNotificationsRequest } from '../services/notificationService.js';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/tasks', label: 'Tasks', icon: ListTodo }
];

const AppLayout = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState({ count: 0, notifications: [] });
  const visibleNavItems = isAdmin
    ? [
        ...navItems,
        { to: '/team', label: 'Team', icon: Users },
        { to: '/invites', label: 'Invites', icon: MailPlus }
      ]
    : navItems;

  useEffect(() => {
    getOverdueNotificationsRequest()
      .then(({ data }) => setNotifications(data))
      .catch(() => setNotifications({ count: 0, notifications: [] }));
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#f4f7f5_0%,#eef5f0_45%,#f8f1ef_100%)]">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-white/10 bg-ink px-5 py-6 text-white lg:block">
        <div>
          <p className="text-xl font-black tracking-tight">Team Task Manager</p>
          <span className="mt-3 inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold uppercase text-emerald-100">
            {isAdmin ? 'Admin Control' : 'Member Workspace'}
          </span>
        </div>
        <nav className="mt-8 space-y-2">
          {visibleNavItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold transition ${
                  isActive ? 'bg-white text-ink' : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="absolute bottom-6 left-5 right-5">
          <div className="mb-3 rounded-md border border-white/10 bg-white/10 p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-2 text-sm font-black">
                <Bell size={16} />
                Overdue
              </span>
              <span className="rounded-full bg-coral px-2 py-0.5 text-xs font-black">{notifications.count}</span>
            </div>
            <div className="mt-2 max-h-28 space-y-2 overflow-y-auto">
              {notifications.notifications.slice(0, 3).map((item) => (
                <p key={item.id} className="text-xs text-white/75">
                  {item.title}
                </p>
              ))}
              {!notifications.count ? <p className="text-xs text-white/60">No overdue tasks.</p> : null}
            </div>
          </div>
          <div className="rounded-md border border-white/10 bg-white/10 p-3">
            <p className="text-sm font-bold">{user.name}</p>
            <p className="break-all text-xs text-white/65">{user.email}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="focus-ring mt-3 flex w-full items-center justify-center gap-2 rounded-md bg-coral px-3 py-2.5 text-sm font-bold text-white"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-10 border-b border-line bg-white/95 px-4 py-4 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-lg font-black">Team Task Manager</p>
              <p className="text-xs font-semibold uppercase text-pine">{user.role}</p>
            </div>
            <button type="button" onClick={handleLogout} className="focus-ring rounded-md bg-ink p-2 text-white">
              <LogOut size={18} />
            </button>
          </div>
          <nav className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {visibleNavItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center justify-center gap-2 rounded-md px-2 py-2 text-xs font-bold ${
                    isActive ? 'bg-pine text-white' : 'bg-mist text-ink'
                  }`
                }
              >
                <Icon size={15} />
                {label}
              </NavLink>
            ))}
          </nav>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
