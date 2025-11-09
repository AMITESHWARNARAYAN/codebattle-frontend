import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useUserStore } from '../store/userStore';
import { useMatchStore } from '../store/matchStore';
import { LogOut, Trophy, Zap, Users, Check, X, Settings, Calendar, Target, Brain, Sparkles, TrendingUp, Award, Code2, Swords, BookOpen } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getSocket, acceptChallenge as emitAcceptChallenge, rejectChallenge as emitRejectChallenge } from '../utils/socket';
import NotificationBell from '../components/NotificationBell';
import ThemeToggle from '../components/ThemeToggle';
import EmailVerificationBanner from '../components/EmailVerificationBanner';

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
  const [showVerificationBanner, setShowVerificationBanner] = useState(true);

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
    <div className="min-h-screen bg-gray-50 dark:bg-dark-950">
      {/* Header */}
      <header className="bg-white dark:bg-dark-900 border-b border-gray-200 dark:border-dark-800 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gray-900 dark:bg-white rounded-lg">
              <Code2 className="w-5 h-5 text-white dark:text-gray-900" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              CodeBattle
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-700">
              <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">{user?.username}</span>
            </div>
            <NotificationBell />
            <ThemeToggle />
            {user?.isAdmin && (
              <button
                onClick={() => navigate('/admin')}
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 rounded-lg transition font-medium text-sm"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden md:inline">Admin</span>
              </button>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-dark-800 hover:bg-gray-200 dark:hover:bg-dark-700 text-gray-900 dark:text-white border border-gray-200 dark:border-dark-700 rounded-lg transition font-medium text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Email Verification Banner */}
        {user && !user.isEmailVerified && showVerificationBanner && (
          <EmailVerificationBanner onClose={() => setShowVerificationBanner(false)} />
        )}

        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {user?.username}!
          </h2>
          <p className="text-gray-600 dark:text-gray-400">Ready to compete and improve your coding skills?</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white dark:bg-dark-900 rounded-lg p-6 border border-gray-200 dark:border-dark-800"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2 bg-gray-100 dark:bg-dark-800 rounded-lg">
                    <Icon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  </div>
                  <div className="flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                    <TrendingUp className="w-3 h-3" />
                    {stat.change}
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
              </div>
            );
          })}
        </div>

        {/* Pending Challenges */}
        {pendingChallenges.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Pending Challenges</h3>
              <span className="px-2 py-1 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-full text-xs font-semibold text-red-700 dark:text-red-300">
                {pendingChallenges.length} New
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingChallenges.map((challenge) => (
                <div
                  key={challenge._id}
                  className="bg-white dark:bg-dark-900 rounded-lg p-6 border-l-4 border-gray-900 dark:border-white"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Challenge from</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{challenge.challengerEmail}</p>
                    </div>
                    <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-full text-xs font-semibold text-yellow-700 dark:text-yellow-300">
                      Pending
                    </span>
                  </div>

                  <div className="mb-4 p-3 bg-gray-50 dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Problem</p>
                    <p className="font-semibold text-gray-900 dark:text-white mb-2">{challenge.problem?.title}</p>
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      challenge.problem?.difficulty === 'Easy' ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300' :
                      challenge.problem?.difficulty === 'Medium' ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300' :
                      'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                    }`}>
                      {challenge.problem?.difficulty}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAcceptChallenge(challenge._id, challenge)}
                      disabled={challengeLoading[challenge._id]}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
                    >
                      <Check className="w-4 h-4" />
                      {challengeLoading[challenge._id] ? 'Accepting...' : 'Accept'}
                    </button>
                    <button
                      onClick={() => handleRejectChallenge(challenge._id, challenge)}
                      disabled={challengeLoading[challenge._id]}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 dark:bg-dark-800 hover:bg-gray-300 dark:hover:bg-dark-700 text-gray-900 dark:text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm border border-gray-300 dark:border-dark-700"
                    >
                      <X className="w-4 h-4" />
                      {challengeLoading[challenge._id] ? 'Rejecting...' : 'Reject'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Action Banners */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Daily Challenge Banner */}
          <div
            onClick={() => navigate('/daily-challenge')}
            className="bg-white dark:bg-dark-900 rounded-lg p-6 cursor-pointer hover:shadow-md transition border border-gray-200 dark:border-dark-800"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <Calendar className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="text-gray-400 dark:text-gray-500 font-bold text-xl">
                →
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Daily Challenge</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Maintain your streak!
            </p>
          </div>

          {/* Admin Challenges Banner */}
          <div
            onClick={() => navigate('/challenges')}
            className="bg-white dark:bg-dark-900 rounded-lg p-6 cursor-pointer hover:shadow-md transition border border-gray-200 dark:border-dark-800"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="text-gray-400 dark:text-gray-500 font-bold text-xl">
                →
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Challenges</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Complete & earn rewards!
            </p>
          </div>

          {/* Contests Banner */}
          <div
            onClick={() => navigate('/contests')}
            className="bg-white dark:bg-dark-900 rounded-lg p-6 cursor-pointer hover:shadow-md transition border border-gray-200 dark:border-dark-800"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                <Trophy className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="text-gray-400 dark:text-gray-500 font-bold text-xl">
                →
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Contests</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {runningContestsCount > 0 ? (
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  {runningContestsCount} Live Now!
                </span>
              ) : (
                'Compete & climb the leaderboard!'
              )}
            </p>
          </div>
        </div>

        {/* Game Modes */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Choose Your Mode</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Matchmaking */}
            <div
              onClick={() => navigate('/matchmaking')}
              className="bg-white dark:bg-dark-900 rounded-lg p-6 border border-gray-200 dark:border-dark-800 cursor-pointer hover:shadow-md transition"
            >
              <div className="text-4xl mb-3">⚡</div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Matchmaking</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Get matched with players of similar skill level and compete in real-time.
              </p>
              <div className="flex items-center gap-2 text-gray-900 dark:text-white font-medium text-sm">
                Start Matching
                <span>→</span>
              </div>
            </div>

            {/* Friend Challenge */}
            <div
              onClick={() => navigate('/friend-challenge')}
              className="bg-white dark:bg-dark-900 rounded-lg p-6 border border-gray-200 dark:border-dark-800 cursor-pointer hover:shadow-md transition"
            >
              <div className="text-4xl mb-3">👥</div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Challenge Friend</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Send an invitation link to your friend and compete head-to-head.
              </p>
              <div className="flex items-center gap-2 text-gray-900 dark:text-white font-medium text-sm">
                Challenge
                <span>→</span>
              </div>
            </div>

            {/* Solo Practice */}
            <div
              onClick={() => navigate('/match/solo')}
              className="bg-white dark:bg-dark-900 rounded-lg p-6 border border-gray-200 dark:border-dark-800 cursor-pointer hover:shadow-md transition"
            >
              <div className="text-4xl mb-3">🎯</div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Solo Practice</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Practice DSA problems at your own pace without time pressure.
              </p>
              <div className="flex items-center gap-2 text-gray-900 dark:text-white font-medium text-sm">
                Practice
                <span>→</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Quick Access</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              onClick={() => navigate('/problems')}
              className="bg-white dark:bg-dark-900 rounded-lg p-5 border border-gray-200 dark:border-dark-800 cursor-pointer hover:shadow-md transition"
            >
              <div className="text-3xl mb-2">📚</div>
              <h4 className="text-base font-bold text-gray-900 dark:text-white mb-1">Practice Problems</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Browse problems by category</p>
            </div>

            <div
              onClick={() => navigate('/leaderboard')}
              className="bg-white dark:bg-dark-900 rounded-lg p-5 border border-gray-200 dark:border-dark-800 cursor-pointer hover:shadow-md transition"
            >
              <div className="text-3xl mb-2">🏆</div>
              <h4 className="text-base font-bold text-gray-900 dark:text-white mb-1">Leaderboard</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">See global rankings</p>
            </div>

            <div
              onClick={() => navigate(`/profile/${user?.username}`)}
              className="bg-white dark:bg-dark-900 rounded-lg p-5 border border-gray-200 dark:border-dark-800 cursor-pointer hover:shadow-md transition"
            >
              <div className="text-3xl mb-2">📊</div>
              <h4 className="text-base font-bold text-gray-900 dark:text-white mb-1">Your Profile</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">View your statistics</p>
            </div>

            <div
              onClick={() => navigate('/submissions')}
              className="bg-white dark:bg-dark-900 rounded-lg p-5 border border-gray-200 dark:border-dark-800 cursor-pointer hover:shadow-md transition"
            >
              <div className="text-3xl mb-2">📝</div>
              <h4 className="text-base font-bold text-gray-900 dark:text-white mb-1">Submissions</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">View your code history</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

