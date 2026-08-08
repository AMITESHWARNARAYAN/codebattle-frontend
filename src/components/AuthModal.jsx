import { useNavigate } from 'react-router-dom';

export default function AuthModal({ isOpen, onClose, title = 'Sign in to Continue', message = 'Join thousands of developers solving algorithmic challenges, competing in weekly contests, and climbing the global leaderboard.' }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]">
      <div 
        className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-dark-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden p-6 sm:p-8 relative transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-dark-800 transition flex items-center justify-center font-bold text-sm"
        >
          ✕
        </button>

        {/* Heading */}
        <div className="mb-4 pr-8">
          <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-orange-500/10 text-orange-500 rounded border border-orange-500/20 inline-block mb-2">
            CodeBattle Platform
          </span>
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {title}
          </h3>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-5">
          {message}
        </p>

        {/* Feature Highlights */}
        <div className="space-y-2 mb-6 bg-slate-50 dark:bg-dark-900/60 p-4 rounded-2xl border border-slate-100 dark:border-dark-800/80">
          <div className="text-xs text-slate-700 dark:text-slate-300 font-medium flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0" />
            <span>Compete in rated Weekly & Virtual Contests</span>
          </div>
          <div className="text-xs text-slate-700 dark:text-slate-300 font-medium flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 flex-shrink-0" />
            <span>1v1 Real-Time Ranked Matchmaking</span>
          </div>
          <div className="text-xs text-slate-700 dark:text-slate-300 font-medium flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
            <span>Save submissions & track streak calendar</span>
          </div>
          <div className="text-xs text-slate-700 dark:text-slate-300 font-medium flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
            <span>Climb the Global Leaderboard</span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={() => {
              onClose();
              navigate('/register');
            }}
            className="w-full py-3 px-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-sm shadow-md shadow-orange-500/20 transition text-center"
          >
            Create Free Account
          </button>

          <button
            onClick={() => {
              onClose();
              navigate('/login');
            }}
            className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-dark-800 dark:hover:bg-dark-700 text-slate-800 dark:text-slate-200 rounded-xl font-semibold text-xs transition text-center"
          >
            Already have an account? Sign in
          </button>
        </div>

        {/* Footnote */}
        <p className="text-[11px] text-center text-slate-400 dark:text-slate-500 mt-4">
          No credit card required. Start coding in 10 seconds.
        </p>
      </div>
    </div>
  );
}
