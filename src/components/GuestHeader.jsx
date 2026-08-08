import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import ThemeToggle from './ThemeToggle';

export default function GuestHeader({ children }) {
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);

  return (
    <div className="flex items-center gap-3">
      <ThemeToggle />
      {children}
      {!token ? (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/login')}
            className="px-3.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-dark-800 rounded-lg transition"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate('/register')}
            className="px-3.5 py-1.5 text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition shadow-sm"
          >
            Register
          </button>
        </div>
      ) : (
        <div className="px-3 py-1 bg-slate-100 dark:bg-dark-800 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300">
          {user?.username}
        </div>
      )}
    </div>
  );
}
