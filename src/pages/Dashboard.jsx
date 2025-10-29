import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useUserStore } from '../store/userStore';
import { useMatchStore } from '../store/matchStore';
import { LogOut, Trophy, Zap, Users, Check, X, Settings, Calendar, Target, Brain, Sparkles, TrendingUp, Award, Code2, Swords, BookOpen } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getSocket, acceptChallenge as emitAcceptChallenge, rejectChallenge as emitRejectChallenge } from '../utils/socket';
import NotificationBell from '../components/NotificationBell';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { getUserStats, userStats } = useUserStore();
  const { getPendingChallenges, acceptChallenge, rejectChallenge } = useMatchStore();
  const [loading, setLoading] = useState(true);
  const [pendingChallenges, setPendingChallenges] = useState([]);
  const [challengeLoading, setChallengeLoading] = useState({});
  const [activeChallengesCount, setActiveChallengesCount] = useState(0);
  const [runningContestsCount, setRunningContestsCount] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        await getUserStats();
        await fetchPendingChallenges();
        await fetchRunningContests();
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [getUserStats]);

  const fetchRunningContests = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/contests/running`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const contests = await response.json();
      setRunningContestsCount(contests.length);
    } catch (error) {
      console.error('Failed to fetch running contests:', error);
    }
  };

  const fetchPendingChallenges = async () => {
    try {
      const challenges = await getPendingChallenges();
      setPendingChallenges(challenges);
    } catch (error) {
      console.error('Failed to fetch challenges:', error);
    }
  };

  const handleAcceptChallenge = async (matchId, challenge) => {
    setChallengeLoading({ ...challengeLoading, [matchId]: true });
    try {
      const match = await acceptChallenge(matchId);

      // Notify challenger via socket
      emitAcceptChallenge(matchId, challenge.challengerEmail);

      toast.success('Challenge accepted! Starting match...');
      navigate(`/match/${matchId}`);
    } catch (error) {
      toast.error('Failed to accept challenge');
    } finally {
      setChallengeLoading({ ...challengeLoading, [matchId]: false });
    }
  };

  const handleRejectChallenge = async (matchId, challenge) => {
    setChallengeLoading({ ...challengeLoading, [matchId]: true });
    try {
      await rejectChallenge(matchId);

      // Notify challenger via socket
      emitRejectChallenge(matchId, challenge.challengerEmail);

      toast.success('Challenge rejected');
      setPendingChallenges(pendingChallenges.filter(c => c._id !== matchId));
    } catch (error) {
      toast.error('Failed to reject challenge');
    } finally {
      setChallengeLoading({ ...challengeLoading, [matchId]: false });
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  const winRate = user?.totalMatches > 0 ? ((user.wins / user.totalMatches) * 100).toFixed(1) : 0;

  const stats = [
    {
      label: 'ELO Rating',
      value: user?.rating || 1200,
      icon: Trophy,
      gradient: 'from-yellow-500 to-orange-500',
      bgGradient: 'from-yellow-500/10 to-orange-500/10',
      change: user?.rating > 1200 ? `+${user.rating - 1200}` : user?.rating < 1200 ? `${user.rating - 1200}` : '0'
    },
    {
      label: 'Total Wins',
      value: user?.wins || 0,
      icon: Zap,
      gradient: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-500/10 to-emerald-500/10',
      change: `${winRate}% WR`
    },
    {
      label: 'Total Matches',
      value: user?.totalMatches || 0,
      icon: Swords,
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-500/10 to-cyan-500/10',
      change: `${user?.losses || 0} losses`
    },
    {
      label: 'Highest Rating',
      value: user?.highestRating || user?.rating || 1200,
      icon: Award,
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-500/10 to-pink-500/10',
      change: 'Peak'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg shadow-indigo-500/30">
              <Code2 className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              CodeBattle
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-slate-300 font-medium">{user?.username}</span>
            </div>
            <NotificationBell />
            {user?.isAdmin && (
              <button
                onClick={() => navigate('/admin')}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-lg transition-all shadow-lg shadow-purple-500/30"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden md:inline">Admin</span>
              </button>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12 relative z-10">
        {/* Welcome Section */}
        <div className="mb-12 animate-fade-in">
          <div className="flex items-center gap-3 mb-3">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-indigo-200 to-purple-200 bg-clip-text text-transparent">
              Welcome back, {user?.username}!
            </h2>
            <span className="text-4xl animate-bounce-slow">👋</span>
          </div>
          <p className="text-slate-400 text-lg">Ready to compete and improve your coding skills?</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 animate-slide-up">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className={`relative overflow-hidden bg-gradient-to-br ${stat.bgGradient} backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-slate-600 transition-all duration-300 group hover:scale-105`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.gradient} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity"></div>
                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 bg-gradient-to-br ${stat.gradient} rounded-xl shadow-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex items-center gap-1 text-xs font-semibold text-slate-400">
                      <TrendingUp className="w-3 h-3" />
                      {stat.change}
                    </div>
                  </div>
                  <p className="text-slate-400 text-sm mb-1 font-medium">{stat.label}</p>
                  <p className="text-4xl font-bold bg-gradient-to-br ${stat.gradient} bg-clip-text text-transparent">
                    {stat.value}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pending Challenges */}
        {pendingChallenges.length > 0 && (
          <div className="mb-12 animate-slide-down">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                <Target className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-2xl font-bold">Pending Challenges</h3>
              <span className="px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-full text-xs font-semibold text-red-300">
                {pendingChallenges.length} New
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pendingChallenges.map((challenge) => (
                <div
                  key={challenge._id}
                  className="relative overflow-hidden bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border-l-4 border-indigo-500 hover:border-indigo-400 transition-all group"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl"></div>
                  <div className="relative">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-slate-500 text-xs font-medium mb-1">Challenge from</p>
                        <p className="text-lg font-bold text-white">{challenge.challengerEmail}</p>
                      </div>
                      <span className="px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 rounded-full text-xs font-semibold text-indigo-300 animate-pulse">
                        Pending
                      </span>
                    </div>

                    <div className="mb-4 p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
                      <p className="text-slate-500 text-xs font-medium mb-2">Problem</p>
                      <p className="font-bold text-white mb-1">{challenge.problem?.title}</p>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          challenge.problem?.difficulty === 'Easy' ? 'bg-green-500/20 text-green-300' :
                          challenge.problem?.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' :
                          'bg-red-500/20 text-red-300'
                        }`}>
                          {challenge.problem?.difficulty}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => handleAcceptChallenge(challenge._id, challenge)}
                        disabled={challengeLoading[challenge._id]}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg shadow-green-500/30"
                      >
                        <Check className="w-4 h-4" />
                        {challengeLoading[challenge._id] ? 'Accepting...' : 'Accept'}
                      </button>
                      <button
                        onClick={() => handleRejectChallenge(challenge._id, challenge)}
                        disabled={challengeLoading[challenge._id]}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold border border-slate-600"
                      >
                        <X className="w-4 h-4" />
                        {challengeLoading[challenge._id] ? 'Rejecting...' : 'Reject'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Action Banners */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Daily Challenge Banner */}
          <div
            onClick={() => navigate('/daily-challenge')}
            className="relative overflow-hidden bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 cursor-pointer hover:scale-105 transition-all duration-300 group shadow-xl shadow-orange-500/30"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
                <div className="text-white font-bold text-2xl group-hover:translate-x-2 transition-transform">
                  →
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Daily Challenge</h3>
              <p className="text-white/90 text-sm flex items-center gap-2">
                Maintain your streak! <span className="text-lg">🔥</span>
              </p>
            </div>
          </div>

          {/* Admin Challenges Banner */}
          <div
            onClick={() => navigate('/challenges')}
            className="relative overflow-hidden bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-6 cursor-pointer hover:scale-105 transition-all duration-300 group shadow-xl shadow-purple-500/30"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <div className="text-white font-bold text-2xl group-hover:translate-x-2 transition-transform">
                  →
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Challenges</h3>
              <p className="text-white/90 text-sm flex items-center gap-2">
                Complete & earn rewards! <span className="text-lg">🏆</span>
              </p>
            </div>
          </div>

          {/* Contests Banner */}
          <div
            onClick={() => navigate('/contests')}
            className="relative overflow-hidden bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl p-6 cursor-pointer hover:scale-105 transition-all duration-300 group shadow-xl shadow-yellow-500/30"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <div className="text-white font-bold text-2xl group-hover:translate-x-2 transition-transform">
                  →
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Contests</h3>
              <p className="text-white/90 text-sm">
                {runningContestsCount > 0 ? (
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></span>
                    {runningContestsCount} Live Now!
                  </span>
                ) : (
                  'Compete & climb the leaderboard!'
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Game Modes */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
              <Swords className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-2xl font-bold">Choose Your Battle Mode</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Matchmaking */}
            <div
              onClick={() => navigate('/matchmaking')}
              className="relative overflow-hidden bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 cursor-pointer hover:border-indigo-500 hover:scale-105 transition-all duration-300 group shadow-lg"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all"></div>
              <div className="relative">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">⚡</div>
                <h4 className="text-xl font-bold mb-3 group-hover:text-indigo-400 transition">Matchmaking</h4>
                <p className="text-slate-400 mb-6 text-sm leading-relaxed">
                  Get matched with players of similar skill level. Compete in real-time and climb the rankings.
                </p>
                <div className="flex items-center gap-2 text-indigo-400 font-semibold group-hover:gap-3 transition-all">
                  Start Matching
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </div>

            {/* Friend Challenge */}
            <div
              onClick={() => navigate('/friend-challenge')}
              className="relative overflow-hidden bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 cursor-pointer hover:border-purple-500 hover:scale-105 transition-all duration-300 group shadow-lg"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all"></div>
              <div className="relative">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">👥</div>
                <h4 className="text-xl font-bold mb-3 group-hover:text-purple-400 transition">Challenge Friend</h4>
                <p className="text-slate-400 mb-6 text-sm leading-relaxed">
                  Send an invitation link to your friend and compete head-to-head in a private match.
                </p>
                <div className="flex items-center gap-2 text-purple-400 font-semibold group-hover:gap-3 transition-all">
                  Challenge
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </div>

            {/* Solo Practice */}
            <div
              onClick={() => navigate('/match/solo')}
              className="relative overflow-hidden bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 cursor-pointer hover:border-pink-500 hover:scale-105 transition-all duration-300 group shadow-lg"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl group-hover:bg-pink-500/20 transition-all"></div>
              <div className="relative">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">🎯</div>
                <h4 className="text-xl font-bold mb-3 group-hover:text-pink-400 transition">Solo Practice</h4>
                <p className="text-slate-400 mb-6 text-sm leading-relaxed">
                  Practice DSA problems at your own pace. No time pressure, just pure coding.
                </p>
                <div className="flex items-center gap-2 text-pink-400 font-semibold group-hover:gap-3 transition-all">
                  Practice
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-2xl font-bold">Quick Access</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div
              onClick={() => navigate('/problems')}
              className="relative overflow-hidden bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 cursor-pointer hover:border-indigo-500 hover:scale-105 transition-all duration-300 group"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl"></div>
              <div className="relative">
                <div className="text-3xl mb-3">📚</div>
                <h4 className="text-lg font-bold mb-2 group-hover:text-indigo-400 transition">Practice Problems</h4>
                <p className="text-slate-400 text-sm">Browse and practice problems by category</p>
              </div>
            </div>

            <div
              onClick={() => navigate('/leaderboard')}
              className="relative overflow-hidden bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 cursor-pointer hover:border-yellow-500 hover:scale-105 transition-all duration-300 group"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/10 rounded-full blur-2xl"></div>
              <div className="relative">
                <div className="text-3xl mb-3">🏆</div>
                <h4 className="text-lg font-bold mb-2 group-hover:text-yellow-400 transition">Global Leaderboard</h4>
                <p className="text-slate-400 text-sm">See where you stand against other players worldwide</p>
              </div>
            </div>

            <div
              onClick={() => navigate(`/profile/${user?.username}`)}
              className="relative overflow-hidden bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 cursor-pointer hover:border-cyan-500 hover:scale-105 transition-all duration-300 group"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl"></div>
              <div className="relative">
                <div className="text-3xl mb-3">📊</div>
                <h4 className="text-lg font-bold mb-2 group-hover:text-cyan-400 transition">Your Profile</h4>
                <p className="text-slate-400 text-sm">View your detailed statistics and match history</p>
              </div>
            </div>

            <div
              onClick={() => navigate('/submissions')}
              className="relative overflow-hidden bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 cursor-pointer hover:border-green-500 hover:scale-105 transition-all duration-300 group"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-full blur-2xl"></div>
              <div className="relative">
                <div className="text-3xl mb-3">📝</div>
                <h4 className="text-lg font-bold mb-2 group-hover:text-green-400 transition">Submissions</h4>
                <p className="text-slate-400 text-sm">View all your code submissions and statistics</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

