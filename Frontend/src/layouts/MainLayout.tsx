import { Outlet, Link } from 'react-router-dom';
import { useAppStore } from '../store/appStore';

export const MainLayout = () => {
  const { theme, toggleTheme } = useAppStore();

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <header className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
        <nav className="flex gap-4">
          <Link to="/" className="hover:underline">Home</Link>
          <Link to="/dashboard" className="hover:underline">Dashboard</Link>
        </nav>
        <button onClick={toggleTheme} className="px-3 py-1 rounded bg-slate-200 dark:bg-slate-700">
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </header>
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
};