import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  joinMatchmakingQueue,
  leaveMatchmakingQueue,
  onQueueJoined,
  onQueueUpdate,
  onMatchFound,
  removeListener
} from '../utils/socket';
import GuestHeader from '../components/GuestHeader';
import { useRequireAuth } from '../contexts/AuthGuardContext';

export default function Matchmaking() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const requireAuth = useRequireAuth();
  const [searching, setSearching] = useState(false);
  const [waitTime, setWaitTime] = useState(0);
  const [queueSize, setQueueSize] = useState(0);
  const timerRef = useRef(null);

  // Local timer for smooth second-by-second updates
  useEffect(() => {
    if (searching) {
      timerRef.current = setInterval(() => {
        setWaitTime(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [searching]);

  useEffect(() => {
    onQueueJoined(() => {
      setSearching(true);
      setWaitTime(0);
    });

    onQueueUpdate((data) => {
      setQueueSize(data.queueSize);
    });

    onMatchFound((match) => {
      setSearching(false);
      navigate(`/match/${match._id}`);
    });

    return () => {
      removeListener('queue-joined');
      removeListener('queue-update');
      removeListener('match-found');
    };
  }, [navigate]);

  const handleStartSearch = () => {
    if (!requireAuth(null, 'Sign in for 1v1 Battle Arena', 'Create a free account or sign in to join real-time 1v1 matchmaking, climb ranks, and earn battle rating.')) return;
    if (!user) return;
    joinMatchmakingQueue(user._id, user.rating);
  };

  const handleCancelSearch = () => {
    if (!user) return;
    leaveMatchmakingQueue(user._id);
    setSearching(false);
    setWaitTime(0);
    setQueueSize(0);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white transition-colors">
      {/* Header */}
      <header className="bg-white/90 dark:bg-slate-950/90 border-b border-slate-200 dark:border-dark-800 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1 px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-dark-800 rounded-xl transition text-slate-700 dark:text-slate-200 font-bold text-xs"
            >
              ← Back
            </button>
            <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Ranked Matchmaking</h1>
          </div>
          <GuestHeader />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <div className="bg-slate-50 dark:bg-dark-900 border border-slate-200/80 dark:border-dark-800 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="text-center mb-8">
            <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-orange-500/10 text-orange-500 rounded-lg border border-orange-500/20 inline-block mb-2">
              Competitive Arena
            </span>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-1">Find an Opponent</h2>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Get matched with another player and compete in a real-time DSA battle.
            </p>
          </div>

          {!searching ? (
            <>
              {/* Rating Display */}
              <div className="mb-6 p-5 bg-white dark:bg-dark-800/80 border border-slate-200/80 dark:border-dark-700/60 rounded-2xl text-center shadow-xs">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Your Battle Rating</p>
                <p className="text-4xl font-black bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600 bg-clip-text text-transparent">
                  {user?.rating || 0}
                </p>
              </div>

              <button
                onClick={handleStartSearch}
                className="w-full py-3.5 px-6 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-orange-500/20 transition text-center"
              >
                Start Matchmaking
              </button>
            </>
          ) : (
            <>
              {/* Searching Animation */}
              <div className="mb-6 flex flex-col items-center">
                <div className="relative w-16 h-16 mb-4 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-4 border-slate-200 dark:border-dark-700"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-t-orange-500 border-r-transparent border-b-orange-500 border-l-transparent animate-spin"></div>
                </div>
                <p className="text-base font-black text-slate-900 dark:text-white">Searching for opponent...</p>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">You will be matched with the next available player</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-white dark:bg-dark-800/80 border border-slate-200/80 dark:border-dark-700/60 rounded-2xl text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Search Time</p>
                  <p className="text-xl font-bold font-mono text-slate-900 dark:text-white">{formatTime(waitTime)}</p>
                </div>
                <div className="p-4 bg-white dark:bg-dark-800/80 border border-slate-200/80 dark:border-dark-700/60 rounded-2xl text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">In Queue</p>
                  <p className="text-xl font-bold font-mono text-slate-900 dark:text-white">{queueSize}</p>
                </div>
              </div>

              <button
                onClick={handleCancelSearch}
                className="w-full py-3.5 px-6 rounded-2xl border border-slate-300 dark:border-dark-700 text-slate-700 dark:text-slate-200 font-extrabold text-sm hover:bg-slate-100 dark:hover:bg-dark-800 transition text-center shadow-sm"
              >
                Cancel Search
              </button>
            </>
          )}

          {/* Info Cards */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-dark-800/80 border border-slate-200/80 dark:border-dark-700/60 rounded-2xl p-5">
              <h3 className="text-sm font-black text-slate-900 dark:text-white mb-2 uppercase tracking-wider">Match Rules</h3>
              <ul className="text-slate-500 dark:text-slate-400 space-y-1.5 text-xs font-semibold">
                <li>• Same DSA problem for both</li>
                <li>• 30-minute time limit</li>
                <li>• Fastest correct solution wins</li>
                <li>• ELO rating changes apply</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-dark-800/80 border border-slate-200/80 dark:border-dark-700/60 rounded-2xl p-5">
              <h3 className="text-sm font-black text-slate-900 dark:text-white mb-2 uppercase tracking-wider">How It Works</h3>
              <ul className="text-slate-500 dark:text-slate-400 space-y-1.5 text-xs font-semibold">
                <li>1. Click Start Matchmaking</li>
                <li>2. Wait for another player</li>
                <li>3. Solve the problem faster</li>
                <li>4. Win and climb the leaderboard!</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
