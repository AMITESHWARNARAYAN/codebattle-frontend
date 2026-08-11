import { useThemeStore } from '../store/themeStore';

export default function ThemeToggle({ className = '' }) {
  const { isDark, toggleTheme } = useThemeStore();

  return (
    <button
      onClick={toggleTheme}
      className={`px-2.5 py-1 rounded-xl transition text-[10px] font-black tracking-wider uppercase border border-slate-200 dark:border-dark-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-dark-800 ${className}`}
      aria-label="Toggle theme"
    >
      {isDark ? 'LIGHT' : 'DARK'}
    </button>
  );
}
