import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import { useAuthStore } from '../store/authStore';
import GuestHeader from '../components/GuestHeader';
import { toast } from 'react-hot-toast';
import { useRequireAuth } from '../contexts/AuthGuardContext';

export default function Leaderboard() {
  const navigate = useNavigate();
  const requireAuth = useRequireAuth();
  const { token, user } = useAuthStore();
  const { getLeaderboard, leaderboard, loading } = useUserStore();
  const [limit, setLimit] = useState(100);

  const handleUserClick = (username) => {
    if (!username) return;
    if (!requireAuth(null, 'Sign in to View User Profiles', 'Create a free CodeBattle account or sign in to view user profiles, ratings, and match history.')) return;
    navigate(`/profile/${username}`);
  };

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        await getLeaderboard(limit);
      } catch (error) {
        toast.error('Failed to load leaderboard');
      }
    };

    fetchLeaderboard();
  }, [limit, getLeaderboard]);

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
            <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Global Leaderboard</h1>
          </div>
          <GuestHeader />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mx-auto mb-4" />
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Loading leaderboard...</p>
          </div>
        ) : (
          <div className="bg-slate-50 dark:bg-dark-900 border border-slate-200/80 dark:border-dark-800 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white dark:bg-dark-800/80 border-b border-slate-200/80 dark:border-dark-700/60 text-slate-500 dark:text-slate-400 text-[10px] font-extrabold uppercase tracking-wider">
                    <th className="px-6 py-4">Rank</th>
                    <th className="px-6 py-4">Player</th>
                    <th className="px-6 py-4 text-center">Battle Rating</th>
                    <th className="px-6 py-4 text-center">Contest Rating</th>
                    <th className="px-6 py-4 text-center">Wins</th>
                    <th className="px-6 py-4 text-center">Losses</th>
                    <th className="px-6 py-4 text-center">Win Rate</th>
                    <th className="px-6 py-4 text-center">Matches</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 dark:divide-dark-800 text-xs">
                  {leaderboard.map((player, idx) => (
                    <tr
                      key={idx}
                      onClick={() => handleUserClick(player.username)}
                      className="hover:bg-white dark:hover:bg-dark-800/50 transition cursor-pointer font-bold"
                    >
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-black ${
                          idx === 0 
                            ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                            : idx === 1 
                            ? 'bg-slate-500/10 text-slate-500 border border-slate-500/20' 
                            : idx === 2 
                            ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' 
                            : 'text-slate-700 dark:text-slate-300'
                        }`}>
                          #{player.rank}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-900 dark:text-white font-extrabold">{player.username}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-2.5 py-1 bg-orange-500/10 text-orange-500 rounded-lg font-black border border-orange-500/20">
                          {player.rating}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-2.5 py-1 bg-blue-500/10 text-blue-500 rounded-lg font-black border border-blue-500/20">
                          {player.contestRating || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-emerald-500 font-extrabold">{player.wins}</td>
                      <td className="px-6 py-4 text-center text-rose-500 font-extrabold">{player.losses}</td>
                      <td className="px-6 py-4 text-center font-extrabold text-slate-900 dark:text-white">{player.winRate}%</td>
                      <td className="px-6 py-4 text-center font-extrabold text-slate-900 dark:text-white">{player.totalMatches}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {leaderboard.length === 0 && (
              <div className="text-center py-12">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">No players found</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
