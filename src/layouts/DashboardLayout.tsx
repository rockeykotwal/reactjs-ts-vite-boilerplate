import { Outlet, NavLink } from 'react-router-dom';
import { useLogout } from '../features/auth/hooks/useAuth';
import { env } from '../config/env';
import ThemeToggle from '../components/common/ThemeToggle';

export default function DashboardLayout() {
  const logout = useLogout();

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 flex flex-col bg-card border-r border-border">
        <div className="px-6 py-5 border-b border-border">
          <span className="text-lg font-bold text-card-foreground">
            {env.appName}
          </span>
        </div>

        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          <NavLink
            to="/dashboard"
            end
            className={({ isActive }) =>
              `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/dashboard/settings"
            className={({ isActive }) =>
              `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`
            }
          >
            Settings
          </NavLink>
        </nav>

        <div className="px-3 py-4 border-t border-border">
          <button
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
            className="w-full rounded-md px-3 py-2 text-sm font-medium text-left text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50 transition-colors"
          >
            {logout.isPending ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col bg-background">
        <header className="flex items-center justify-end px-6 py-3 border-b border-border">
          <ThemeToggle />
        </header>
        <main className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
