import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMatchStore } from '../store/matchStore';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-hot-toast';
import { getSocket, onChallengeRejected } from '../utils/socket';
import GuestHeader from '../components/GuestHeader';
import { useRequireAuth } from '../contexts/AuthGuardContext';

export default function FriendChallenge() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const requireAuth = useRequireAuth();
  const { challengeFriendByEmail, loading } = useMatchStore();
  const [friendEmail, setFriendEmail] = useState('');
  const [challengeData, setChallengeData] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [currentMatchId, setCurrentMatchId] = useState(null);

  // Listen for challenge rejection only (acceptance is handled globally in App.jsx)
  useEffect(() => {
    const handleRejection = () => {
      toast.error('Your challenge was rejected');
      setChallengeData(null);
      setCurrentMatchId(null);
    };

    onChallengeRejected(handleRejection);
    return () => {
      import('../utils/socket').then(({ removeListener }) => {
        removeListener('challenge-rejected', handleRejection);
      });
    };
  }, []);

  const handleSendChallenge = async (e) => {
    e.preventDefault();

    if (!requireAuth(null, 'Sign in to Challenge Friends', 'Create a free CodeBattle account or sign in to send 1v1 battle invites by email or custom link.')) return;
    if (!user) return;

    if (!friendEmail.trim()) {
      toast.error('Please enter your friend\'s email');
      return;
    }

    if (!friendEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      const data = await challengeFriendByEmail(friendEmail);
      setChallengeData(data);
      setCurrentMatchId(data.matchId);
      setIsOnline(data.isOnline);

      // Send live notification if friend is online
      if (data.isOnline) {
        const socket = getSocket();
        socket.emit('send-challenge', {
          matchId: data.matchId,
          challengerEmail: user.email,
          challengerUsername: user.username,
          challengedEmail: friendEmail,
          challengedUsername: data.challengedUser
        });
        toast.success(`Challenge sent to ${data.challengedUser}! They're online now.`);
      } else {
        toast.success(`Challenge sent to ${friendEmail}. They'll see it when they log in.`);
      }

      setFriendEmail('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send challenge');
    }
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
            <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Challenge a Friend</h1>
          </div>
          <GuestHeader />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        {!challengeData ? (
          <div className="bg-slate-50 dark:bg-dark-900 border border-slate-200/80 dark:border-dark-800 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="text-center mb-8">
              <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-orange-500/10 text-orange-500 rounded-lg border border-orange-500/20 inline-block mb-2">
                1v1 Duel
              </span>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-1">Challenge Your Friend</h2>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Send a challenge via email. If they're online, they'll get a live notification!
              </p>
            </div>

            <form onSubmit={handleSendChallenge} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-slate-700 dark:text-slate-300">
                  Friend's Email Address
                </label>
                <input
                  type="email"
                  value={friendEmail}
                  onChange={(e) => setFriendEmail(e.target.value)}
                  placeholder="friend@example.com"
                  className="w-full px-4 py-3 bg-white dark:bg-dark-800 border border-slate-200 dark:border-dark-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition text-sm text-slate-900 dark:text-white placeholder-slate-400 font-medium"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-orange-500/20 transition text-center"
              >
                {loading ? 'Sending Challenge...' : 'Send Challenge'}
              </button>
            </form>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-dark-800/80 border border-slate-200/80 dark:border-dark-700/60 rounded-2xl p-5">
                <h3 className="text-sm font-black text-slate-900 dark:text-white mb-2 uppercase tracking-wider">Features</h3>
                <ul className="text-slate-500 dark:text-slate-400 space-y-1.5 text-xs font-semibold">
                  <li>• Send via email</li>
                  <li>• Live notifications if online</li>
                  <li>• Same DSA problem</li>
                  <li>• Rating changes apply</li>
                </ul>
              </div>

              <div className="bg-white dark:bg-dark-800/80 border border-slate-200/80 dark:border-dark-700/60 rounded-2xl p-5">
                <h3 className="text-sm font-black text-slate-900 dark:text-white mb-2 uppercase tracking-wider">How It Works</h3>
                <ul className="text-slate-500 dark:text-slate-400 space-y-1.5 text-xs font-semibold">
                  <li>1. Enter friend's email</li>
                  <li>2. Send challenge</li>
                  <li>3. They get notified</li>
                  <li>4. Start competing!</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 dark:bg-dark-900 border border-slate-200/80 dark:border-dark-800 rounded-3xl p-6 sm:p-8 shadow-sm text-center">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Challenge Sent!</h2>

            <div className="mb-6 p-5 bg-white dark:bg-dark-800/80 border border-slate-200/80 dark:border-dark-700/60 rounded-2xl">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Challenged Player</p>
              <p className="text-lg font-black text-slate-900 dark:text-white">{challengeData.challengedUser}</p>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">{challengeData.challengedEmail || friendEmail}</p>
            </div>

            {isOnline ? (
              <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-xs rounded-2xl">
                Your friend is online! They will see the challenge notification right now.
              </div>
            ) : (
              <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-bold text-xs rounded-2xl">
                Your friend is offline. They will see the challenge when they log in.
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={() => navigate('/')}
                className="w-full py-3.5 px-6 rounded-2xl border border-slate-300 dark:border-dark-700 text-slate-700 dark:text-slate-200 font-extrabold text-sm hover:bg-slate-100 dark:hover:bg-dark-800 transition text-center shadow-sm"
              >
                Back to Dashboard
              </button>
              <button
                onClick={() => {
                  setChallengeData(null);
                  setFriendEmail('');
                }}
                className="w-full py-3.5 px-6 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-orange-500/20 transition text-center"
              >
                Send Another Challenge
              </button>
            </div>

            <div className="mt-6 p-4 bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 font-bold text-xs rounded-2xl">
              Tip: Once your friend accepts the challenge, you will both be taken to the code editor to solve the problem!
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
