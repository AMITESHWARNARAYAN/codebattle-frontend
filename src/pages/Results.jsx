import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMatchStore } from '../store/matchStore';
import { toast } from 'react-hot-toast';
import GuestHeader from '../components/GuestHeader';

export default function Results() {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const { getMatch } = useMatchStore();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        const data = await getMatch(matchId);
        setMatch(data);
      } catch (error) {
        toast.error('Failed to load match results');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchMatch();
  }, [matchId, getMatch, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mx-auto mb-4" />
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Loading match results...</p>
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 font-bold text-sm mb-3">Match not found</p>
          <button onClick={() => navigate('/')} className="px-4 py-2 bg-orange-500 text-white rounded-xl text-xs font-bold">Go Back</button>
        </div>
      </div>
    );
  }

  const isMultiplayer = match.players.length > 1;
  const winner = match.winner;
  const ratingChanges = match.ratingChanges || [];

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
            <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Match Results</h1>
          </div>
          <GuestHeader />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        {/* Problem Info Card */}
        <div className="bg-slate-50 dark:bg-dark-900 border border-slate-200/80 dark:border-dark-800 rounded-3xl p-6 shadow-sm mb-8">
          <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-orange-500/10 text-orange-500 rounded-lg border border-orange-500/20 inline-block mb-2">
            Match Problem
          </span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-1">{match.problem?.title}</h2>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Difficulty: <span className="text-orange-500 font-bold">{match.problem?.difficulty}</span>
          </p>
        </div>

        {/* Results */}
        {isMultiplayer ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {match.players.map((player, idx) => {
              const submission = match.submissions?.find(s => (s.userId?._id || s.userId) === player._id);
              const ratingChange = ratingChanges.find(rc => rc.userId === player._id);
              const isWinner = winner && (winner._id || winner) === player._id;

              return (
                <div
                  key={idx}
                  className={`bg-slate-50 dark:bg-dark-900 border rounded-3xl p-6 shadow-sm relative transition-all ${
                    isWinner 
                      ? 'border-amber-500/80 dark:border-amber-500/80 shadow-xl shadow-amber-500/10 ring-2 ring-amber-500/30' 
                      : 'border-slate-200/80 dark:border-dark-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200/80 dark:border-dark-800">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-orange-500/10 text-orange-500 font-extrabold text-sm flex items-center justify-center uppercase">
                        {player.username?.charAt(0)}
                      </div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white">{player.username}</h3>
                    </div>
                    {isWinner && (
                      <span className="px-3 py-1 text-xs font-black uppercase tracking-wider bg-amber-500/10 text-amber-500 rounded-full border border-amber-500/20">
                        WINNER
                      </span>
                    )}
                  </div>

                  {submission && (
                    <div className="space-y-3 mb-5">
                      <div className="p-3.5 bg-white dark:bg-dark-800/80 border border-slate-200/80 dark:border-dark-700/60 rounded-2xl flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Submission Status</span>
                        <span className={`font-black text-xs px-2.5 py-1 rounded-lg ${
                          submission.status === 'Accepted' || submission.status === 'accepted'
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                            : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                        }`}>
                          {submission.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-white dark:bg-dark-800/80 border border-slate-200/80 dark:border-dark-700/60 rounded-2xl">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-0.5">Test Cases</p>
                          <p className="font-bold text-sm text-slate-900 dark:text-white">{submission.testCasesPassed}/{submission.totalTestCases}</p>
                        </div>
                        <div className="p-3 bg-white dark:bg-dark-800/80 border border-slate-200/80 dark:border-dark-700/60 rounded-2xl">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-0.5">Time</p>
                          <p className="font-bold text-sm text-slate-900 dark:text-white">{submission.executionTime || 0}ms</p>
                        </div>
                        <div className="p-3 bg-white dark:bg-dark-800/80 border border-slate-200/80 dark:border-dark-700/60 rounded-2xl">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-0.5">Memory</p>
                          <p className="font-bold text-sm text-slate-900 dark:text-white">{submission.memoryUsed || 0}MB</p>
                        </div>
                        <div className="p-3 bg-white dark:bg-dark-800/80 border border-slate-200/80 dark:border-dark-700/60 rounded-2xl">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-0.5">Complexity</p>
                          <p className="font-bold text-xs text-slate-900 dark:text-white truncate">{submission.timeComplexity || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {ratingChange && (
                    <div className="p-4 bg-white dark:bg-dark-800/80 border border-slate-200/80 dark:border-dark-700/60 rounded-2xl">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Rating Change</p>
                      <div className="flex items-center justify-between">
                        <span className="font-black text-sm text-slate-900 dark:text-white">{ratingChange.oldRating} → {ratingChange.newRating}</span>
                        <div className={`px-2.5 py-1 rounded-lg text-xs font-black ${
                          ratingChange.change >= 0 
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                            : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                        }`}>
                          <span>{ratingChange.change > 0 ? '+' : ''}{ratingChange.change}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-slate-50 dark:bg-dark-900 border border-slate-200/80 dark:border-dark-800 rounded-3xl p-6 shadow-sm mb-8">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4">Your Performance</h3>
            {match.submissions?.[0] && (
              <div className="space-y-3">
                <div className="p-3.5 bg-white dark:bg-dark-800/80 border border-slate-200/80 dark:border-dark-700/60 rounded-2xl flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Status</span>
                  <span className={`font-black text-xs px-2.5 py-1 rounded-lg ${
                    match.submissions[0].status === 'Accepted' || match.submissions[0].status === 'accepted'
                      ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                      : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                  }`}>
                    {match.submissions[0].status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-white dark:bg-dark-800/80 border border-slate-200/80 dark:border-dark-700/60 rounded-2xl">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-0.5">Test Cases</p>
                    <p className="font-bold text-sm text-slate-900 dark:text-white">{match.submissions[0].testCasesPassed}/{match.submissions[0].totalTestCases}</p>
                  </div>
                  <div className="p-3 bg-white dark:bg-dark-800/80 border border-slate-200/80 dark:border-dark-700/60 rounded-2xl">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-0.5">Time</p>
                    <p className="font-bold text-sm text-slate-900 dark:text-white">{match.submissions[0].executionTime || 0}ms</p>
                  </div>
                  <div className="p-3 bg-white dark:bg-dark-800/80 border border-slate-200/80 dark:border-dark-700/60 rounded-2xl">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-0.5">Memory</p>
                    <p className="font-bold text-sm text-slate-900 dark:text-white">{match.submissions[0].memoryUsed || 0}MB</p>
                  </div>
                  <div className="p-3 bg-white dark:bg-dark-800/80 border border-slate-200/80 dark:border-dark-700/60 rounded-2xl">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-0.5">Complexity</p>
                    <p className="font-bold text-xs text-slate-900 dark:text-white truncate">{match.submissions[0].timeComplexity || 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => navigate('/')}
            className="flex-1 py-3.5 px-6 rounded-2xl border border-slate-300 dark:border-dark-700 text-slate-700 dark:text-slate-200 font-extrabold text-sm hover:bg-slate-100 dark:hover:bg-dark-800 transition text-center shadow-sm"
          >
            Back to Dashboard
          </button>
          <button
            onClick={() => navigate('/matchmaking')}
            className="flex-1 py-3.5 px-6 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-orange-500/20 transition text-center"
          >
            Play Again
          </button>
        </div>
      </main>
    </div>
  );
}
