import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useContestStore } from '../store/contestStore';
import { useAuthStore } from '../store/authStore';
import { Trophy, Calendar, Clock, Users, CheckCircle, XCircle, Play, ChevronLeft, X, MessageSquare, Share2, Award, List } from 'lucide-react';
import toast from 'react-hot-toast';
import GuestHeader from '../components/GuestHeader';
import { useRequireAuth } from '../contexts/AuthGuardContext';

export default function ContestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuthStore();
  const { currentContest, getContest, registerForContest, startVirtualContest, getLeaderboard, loading } = useContestStore();
  const [leaderboard, setLeaderboard] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [countdown, setCountdown] = useState(null);
  const [registering, setRegistering] = useState(false);
  const [startingVirtual, setStartingVirtual] = useState(false);
  const requireAuth = useRequireAuth();

  // Virtual modal state — LeetCode has a 2-step modal flow
  const [virtualModalStep, setVirtualModalStep] = useState(0); // 0=hidden, 1=step1, 2=step2

  // Derive virtual contest details
  const participant = currentContest?.userData;
  const isVirtual = !!participant?.isVirtual;
  const personalEndTime = isVirtual ? new Date(new Date(participant.startedAt).getTime() + currentContest.duration * 60000) : null;
  const isVirtualExpired = isVirtual && (!!participant?.endedAt || new Date() >= personalEndTime);

  // Can user start virtual practice?
  const canStartVirtual = currentContest?.status === 'finished' && (
    !participant ||
    (!participant.startedAt && !participant.isVirtual) ||
    isVirtualExpired
  );

  // Virtual in progress (started but not expired)
  const isVirtualInProgress = isVirtual && !isVirtualExpired;

  useEffect(() => { loadContest(); }, [id]);

  const loadContest = async () => {
    try {
      await getContest(id);
      const lb = await getLeaderboard(id, { type: 'live' });
      setLeaderboard(lb || []);
    } catch (error) {
      toast.error('Failed to load contest');
    }
  };

  useEffect(() => {
    if (id && activeTab === 'leaderboard') {
      getLeaderboard(id, { type: 'live' }).then(lb => setLeaderboard(lb || [])).catch(() => {});
    }
  }, [id, activeTab, getLeaderboard]);

  // Live countdown
  useEffect(() => {
    if (!currentContest) return;
    const endTimeSource = isVirtual
      ? new Date(new Date(participant.startedAt).getTime() + currentContest.duration * 60000)
      : new Date(currentContest.status === 'upcoming' ? currentContest.startTime : currentContest.endTime);

    const tick = () => {
      const now = new Date();
      if (currentContest.status === 'upcoming') {
        setCountdown(Math.max(0, new Date(currentContest.startTime) - now));
      } else if (currentContest.status === 'running' || (isVirtual && !isVirtualExpired)) {
        setCountdown(Math.max(0, endTimeSource - now));
      } else {
        setCountdown(0);
      }
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [currentContest, isVirtual, isVirtualExpired, participant]);

  const handleRegister = async () => {
    if (!requireAuth(null, 'Sign in to Enter Contest', 'Create a free CodeBattle account or sign in to register, compete in live & virtual contests, and climb the global ranking.')) return;
    setRegistering(true);
    try {
      await registerForContest(id);
      toast.success('Successfully registered!');
      loadContest();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to register');
    } finally {
      setRegistering(false);
    }
  };

  // LeetCode-style: clicking "Virtual Contest" opens step 1 modal (Replay Past Contests)
  const handleVirtualClick = () => {
      if (!requireAuth(null, 'Sign in to Enter Contest', 'Create a free CodeBattle account or sign in to register, compete in live & virtual contests, and climb the global ranking.')) return;
    setVirtualModalStep(1);
  };

  // Step 1: "Start Practice" clicked → start virtual in backend, then advance to step 2 (Ready to Go!)
  const handleStartPractice = async () => {
    setStartingVirtual(true);
    try {
      await startVirtualContest(id);
      await loadContest();
      // Advance to "Ready to Go!" step
      setVirtualModalStep(2);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to start virtual contest');
    } finally {
      setStartingVirtual(false);
    }
  };

  // Step 2: "Join Now" clicked → go to live room
  const handleJoinNow = () => {
    setVirtualModalStep(0);
    navigate(`/contests/${id}/live`);
  };

  const handleEnterContest = () => {
      if (!requireAuth(null, 'Sign in to Enter Contest', 'Create a free CodeBattle account or sign in to register, compete in live & virtual contests, and climb the global ranking.')) return;
    navigate(`/contests/${id}/live`);
  };

  const formatCountdown = (ms) => {
    if (ms === null || ms === 0) return '00:00:00';
    const d = Math.floor(ms / 86400000);
    const h = Math.floor((ms % 86400000) / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    if (d > 0) return `${d}d ${h}h ${m}m`;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const getDifficultyColor = (d) => {
    if (d === 'Easy') return 'text-green-500 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
    if (d === 'Medium') return 'text-amber-600 dark:text-yellow-400 bg-amber-50 dark:bg-yellow-900/20';
    if (d === 'Hard') return 'text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
    return 'text-gray-500';
  };

  if (loading || !currentContest) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const statusLabel = {
    upcoming: { text: 'Upcoming', cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
    running: { text: '🔴 LIVE', cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 animate-pulse' },
    finished: { text: 'Ended', cls: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
    cancelled: { text: 'Cancelled', cls: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
  };

  const st = statusLabel[currentContest.status] || statusLabel.upcoming;

  return (
    <div className="min-h-screen bg-[#faf9f6] dark:bg-dark-950 text-gray-800 dark:text-gray-100">
      {/* ── Virtual Contest Modal (LeetCode-style 2-step) ── */}
      {virtualModalStep > 0 && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          {/* Backdrop with blur */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setVirtualModalStep(0)} />
          
          {/* Modal card */}
          <div className="relative bg-white dark:bg-dark-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8 animate-[fadeInUp_0.2s_ease-out]">
            {/* Close button */}
            <button onClick={() => setVirtualModalStep(0)} className="absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-800 transition">
              <X className="w-5 h-5 text-gray-400" />
            </button>

            {virtualModalStep === 1 && (
              <>
                {/* Step 1: Replay Past Contests */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-purple-500" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Replay Past Contests 👥</h3>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
                  Practice in virtual mode! Earn scores & rankings without impacting your official profile.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setVirtualModalStep(0)}
                    className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 hover:bg-gray-200 dark:bg-dark-800 dark:hover:bg-dark-700 rounded-lg transition"
                  >
                    Not Now
                  </button>
                  <button
                    onClick={handleStartPractice}
                    disabled={startingVirtual}
                    className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-semibold transition shadow-lg shadow-purple-500/25 disabled:opacity-50"
                  >
                    {startingVirtual ? 'Starting...' : 'Start Practice'}
                  </button>
                </div>
              </>
            )}

            {virtualModalStep === 2 && (
              <>
                {/* Step 2: Ready to Go! */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Ready to Go! 🚀</h3>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
                  The virtual contest is live! Jump in and showcase your skills.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setVirtualModalStep(0)}
                    className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 hover:bg-gray-200 dark:bg-dark-800 dark:hover:bg-dark-700 rounded-lg transition"
                  >
                    Maybe Later
                  </button>
                  <button
                    onClick={handleJoinNow}
                    className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-semibold transition shadow-lg shadow-purple-500/25"
                  >
                    Join Now
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Header bar */}
      <header className="bg-white dark:bg-dark-900 border-b border-gray-200 dark:border-dark-800 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/contests')} className="p-2 hover:bg-gray-100 dark:hover:bg-dark-800 rounded-lg transition">
              <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Contest Details</h1>
          </div>
          <GuestHeader />
        </div>
      </header>



      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* LeetCode-style Contest Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h1 className={`text-3xl font-extrabold ${currentContest.type === 'biweekly' ? 'text-purple-600 dark:text-purple-400' : 'text-orange-500 dark:text-orange-400'}`}>
              {currentContest.title}
            </h1>
            {isVirtual && (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300 border border-green-500/20">
                Virtual
              </span>
            )}
            {currentContest.isRated && (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700 dark:bg-orange-950/20 dark:text-orange-300">
                RATED
              </span>
            )}
          </div>
          
          <div className="text-gray-500 dark:text-gray-400 text-sm font-semibold flex items-center gap-3 mb-6 flex-wrap">
            <span>{new Date(currentContest.startTime).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZoneName: 'short' })}</span>
            <span>•</span>
            <span className="capitalize">{currentContest.status === 'finished' ? 'End' : currentContest.status}</span>
            {isVirtualInProgress && (
              <>
                <span>•</span>
                <span className="text-orange-500 flex items-center gap-1.5">
                  Ends in <span className="font-bold font-mono">{formatCountdown(countdown)}</span>
                </span>
              </>
            )}
          </div>

          {/* Action buttons row */}
          <div className="flex items-center gap-3 mb-8">
            {/* Upcoming: Register */}
            {currentContest.status === 'upcoming' && !currentContest.isRegistered && (
              <button onClick={handleRegister} disabled={registering} className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full font-bold text-sm hover:from-blue-600 hover:to-purple-600 transition shadow-md disabled:opacity-50">
                {registering ? 'Registering...' : 'Register'}
              </button>
            )}
            {currentContest.status === 'upcoming' && currentContest.isRegistered && (
              <div className="px-6 py-2 bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 rounded-full font-bold text-sm border border-green-200/50">
                ✓ Registered
              </div>
            )}

            {/* Running: Enter */}
            {currentContest.status === 'running' && (
              <button onClick={handleEnterContest} className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-full font-bold text-sm hover:from-red-600 hover:to-orange-600 transition shadow-md animate-pulse">
                <Play className="w-4 h-4 fill-current" />
                Enter Contest
              </button>
            )}

            {/* Finished actions */}
            {currentContest.status === 'finished' && (
              <>
                {isVirtualInProgress ? (
                  <button onClick={handleEnterContest} className="flex items-center gap-2 px-6 py-2 border border-purple-500 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/20 rounded-full font-bold text-sm transition">
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Continue
                  </button>
                ) : (
                  canStartVirtual && (
                    <button onClick={handleVirtualClick} className="flex items-center gap-2 px-6 py-2 border border-purple-500 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/20 rounded-full font-bold text-sm transition">
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Virtual Contest
                    </button>
                  )
                )}
              </>
            )}

            {/* Circular detail buttons */}
            <button className="p-2.5 bg-white hover:bg-gray-100 dark:bg-dark-900 dark:hover:bg-dark-800 rounded-full border border-gray-200 dark:border-dark-800 text-gray-500 transition" title="Discussions">
              <MessageSquare className="w-4 h-4" />
            </button>
            <button className="p-2.5 bg-white hover:bg-gray-100 dark:bg-dark-900 dark:hover:bg-dark-800 rounded-full border border-gray-200 dark:border-dark-800 text-gray-500 transition" title="Share">
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <hr className="border-gray-200 dark:border-dark-850 mb-8" />

        {/* 2-Column Dashboard Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* LEFT COLUMN: Rules & details (width 66%) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Welcome to {currentContest.title}</h2>
              <div className="text-gray-650 dark:text-gray-400 whitespace-pre-line text-sm leading-relaxed">
                {currentContest.rules || 
                  `Standard ICPC rules apply.\n\n• You can submit multiple times for each problem\n• Wrong submissions incur a 20-minute penalty\n• Final ranking: most problems solved, then lowest penalty`
                }
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Sidebar Cards (width 33%) */}
          <div className="lg:col-span-1 space-y-6">
            {/* Ranking Sidebar Card */}
            <div
              className="bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 rounded-2xl p-5 shadow-sm cursor-pointer hover:shadow-md hover:border-orange-200 dark:hover:border-orange-900/50 transition group"
              onClick={() => navigate(`/contests/${id}/ranking`)}
            >
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100 dark:border-dark-800">
                <Award className="w-5 h-5 text-orange-500" />
                <h3 className="font-bold text-gray-950 dark:text-white text-base group-hover:text-orange-500 transition">Ranking</h3>
              </div>
              
              <div className="space-y-3">
                {leaderboard && leaderboard.length > 0 ? (
                  leaderboard.slice(0, 5).map((p, i) => (
                    <div key={p.user?.toString() || i} className="flex items-center justify-between text-sm py-1.5">
                      <div className="flex items-center gap-3">
                        <span className={`font-bold w-6 text-center ${i === 0 ? 'text-amber-500' : i === 1 ? 'text-gray-450' : i === 2 ? 'text-orange-400' : 'text-gray-400'}`}>
                          {i + 1}
                        </span>
                        <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-dark-850 flex items-center justify-center text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase">
                          {p.username?.slice(0, 2)}
                        </div>
                        <span className="font-semibold text-gray-900 dark:text-gray-150 truncate max-w-[120px]">
                          {p.username}
                        </span>
                      </div>
                      <span className="font-bold text-green-600 dark:text-green-400">
                        {p.totalScore}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-xs text-gray-400 dark:text-gray-500">No participants yet</div>
                )}
              </div>
            </div>

            {/* Problem List Sidebar Card */}
            <div className="bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100 dark:border-dark-800">
                <List className="w-5 h-5 text-blue-500" />
                <h3 className="font-bold text-gray-950 dark:text-white text-base">Problem List</h3>
              </div>

              {currentContest.status === 'upcoming' ? (
                <div className="text-center py-6 text-xs text-gray-400 dark:text-gray-500">
                  Problems will be revealed when the contest starts
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-dark-850">
                  {currentContest.problems?.map((cp, index) => {
                    const isClickable = cp.problem?._id && (currentContest.status === 'finished' || currentContest.status === 'running');
                    const isSolved = participant?.submissions?.some(s => s.problem?.toString() === cp.problem?._id?.toString() && s.status === 'accepted');
                    const isAttempted = !isSolved && participant?.submissions?.some(s => s.problem?.toString() === cp.problem?._id?.toString());
                    const displayPoints = cp.points >= 100 ? Math.round(cp.points / 100) : cp.points;

                    const handleClick = () => {
                      if (isVirtualInProgress) {
                        navigate(`/contests/${currentContest._id}/live`);
                      } else if (currentContest.status === 'finished') {
                        navigate(`/problem/${cp.problem._id}`);
                      } else if (currentContest.status === 'running') {
                        navigate(`/contests/${currentContest._id}/live`);
                      }
                    };

                    return (
                      <div 
                        key={cp._id}
                        onClick={isClickable ? handleClick : undefined}
                        className={`flex items-center justify-between py-3 cursor-pointer group transition ${isClickable ? 'hover:text-orange-500 dark:hover:text-orange-400' : ''}`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Play/Solved icon */}
                          <div className="flex-shrink-0">
                            {isSolved ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : isAttempted ? (
                              <XCircle className="w-4 h-4 text-amber-500" />
                            ) : (
                              <span className="text-xs text-gray-300 dark:text-dark-600 font-bold w-4 h-4 flex items-center justify-center">{index + 1}</span>
                            )}
                          </div>
                          <span className="font-semibold text-sm text-gray-900 dark:text-gray-150 group-hover:text-orange-500 transition truncate max-w-[150px]">
                            {cp.problem?.title}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getDifficultyColor(cp.problem?.difficulty)}`}>
                            {cp.problem?.difficulty}
                          </span>
                          <span className="w-5 h-5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center text-[10px] font-bold">
                            {displayPoints}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Keyframe animation for modal */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
