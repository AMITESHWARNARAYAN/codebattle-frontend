import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useContestStore } from '../store/contestStore';
import { ChevronLeft, ChevronRight, Users, Play, Search, X, Copy, Check } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import toast from 'react-hot-toast';

const LANG_COLORS = {
  cpp: '#00599c',
  java: '#f89820',
  python: '#3776ab',
  javascript: '#f7df1e',
  c: '#a8b9cc',
};

const LANG_LABELS = {
  cpp: 'C++',
  java: 'Java',
  python: 'Python',
  javascript: 'JS',
  c: 'C',
};

export default function ContestRanking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getLeaderboard } = useContestStore();

  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCode, setSelectedCode] = useState(null); // { username, problemTitle, language, time, code }
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadRanking();
  }, [id, page]);

  const loadRanking = async () => {
    try {
      setLoading(true);
      const result = await getLeaderboard(id, { detailed: 'true', page, limit: 25 });
      setData(result);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (selectedCode?.code) {
      navigator.clipboard.writeText(selectedCode.code);
      setCopied(true);
      toast.success('Code copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-[#faf9f6] dark:bg-[#0c0c0c] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!data || !data.meta) {
    return (
      <div className="min-h-screen bg-[#faf9f6] dark:bg-[#0c0c0c] flex items-center justify-center text-slate-800 dark:text-slate-200">
        <p>Failed to load ranking data.</p>
      </div>
    );
  }

  const { rankings, meta } = data;
  const isWeekly = meta.contestType === 'weekly' || meta.contestTitle?.toLowerCase().includes('weekly');

  const statusBadge = {
    upcoming: { text: 'Upcoming', cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800' },
    running: { text: 'Live', cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800 animate-pulse' },
    finished: { text: 'Ended', cls: 'bg-slate-100 text-slate-700 dark:bg-dark-800 dark:text-slate-300 border-slate-200 dark:border-dark-700' },
    cancelled: { text: 'Cancelled', cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800' },
  };

  const st = statusBadge[meta.status] || statusBadge.finished;

  const filteredRankings = searchQuery.trim()
    ? rankings.filter(r => r.username?.toLowerCase().includes(searchQuery.toLowerCase()))
    : rankings;

  return (
    <div className="min-h-screen bg-[#faf9f6] dark:bg-[#0c0c0c] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      
      {/* ── View Code Modal (LeetCode-Style) ── */}
      {selectedCode && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]">
          <div className="bg-white dark:bg-[#1e1e1e] border border-slate-200 dark:border-dark-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-dark-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold text-xs">
                  {selectedCode.language.toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    {selectedCode.username}'s Submission
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {selectedCode.problemTitle} • Time: {selectedCode.time}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-dark-800 dark:hover:bg-dark-700 rounded-lg transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
                <button
                  onClick={() => setSelectedCode(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-dark-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Code Body */}
            <div className="p-6 overflow-y-auto bg-slate-50 dark:bg-[#161616] font-mono text-xs text-slate-800 dark:text-slate-200 flex-1 leading-relaxed whitespace-pre-wrap select-text">
              {selectedCode.code || '// No code recorded for this submission'}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-slate-100 dark:border-dark-800 bg-white dark:bg-[#1e1e1e] flex justify-end">
              <button
                onClick={() => setSelectedCode(null)}
                className="px-5 py-2 text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white dark:bg-[#111111] border-b border-slate-200 dark:border-dark-800 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(`/contests/${id}`)} 
              className="p-2 hover:bg-slate-100 dark:hover:bg-dark-800 rounded-lg transition text-slate-700 dark:text-slate-300"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Contest Details</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-6 py-8">

        {/* Hero Title & Global Tag */}
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              <span className="text-slate-700 dark:text-slate-300">Ranking of </span>
              <span className={isWeekly ? 'text-orange-500 dark:text-orange-400' : 'text-purple-600 dark:text-purple-400'}>
                {meta.contestTitle}
              </span>
            </h1>

            <div className="flex items-center gap-4 mt-4 flex-wrap">
              <span className="px-4 py-1.5 bg-[#ffa116] text-white text-xs font-extrabold rounded-full shadow-sm">
                Global
              </span>

              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 font-medium">
                <Users className="w-4 h-4" />
                <span className="font-bold text-slate-700 dark:text-slate-200">{meta.totalParticipants.toLocaleString()}</span>
                <span className="text-slate-300 dark:text-slate-700">|</span>
                <span className="font-bold text-slate-700 dark:text-slate-200">{meta.akCount.toLocaleString()} AK!</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search user..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-white dark:bg-[#161616] border border-slate-200 dark:border-dark-800 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-orange-500 transition w-52 shadow-sm"
              />
            </div>
            <span className={`px-3.5 py-1.5 rounded-full text-xs font-bold border ${st.cls}`}>
              {st.text}
            </span>
          </div>
        </div>

        {/* LeetCode Ranking Table */}
        <div className="bg-white dark:bg-[#161616] border border-slate-200/80 dark:border-dark-800/80 rounded-2xl overflow-hidden shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-dark-800 bg-slate-50/50 dark:bg-dark-850/40">
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-16">Rank</th>
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider min-w-[200px]">Name</th>
                  <th className="text-center px-4 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-20">Score</th>
                  <th className="text-center px-4 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-28">Finish Time</th>
                  {meta.problems.map((p, i) => (
                    <th key={p.id} className="text-center px-4 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider min-w-[140px]">
                      Q{i + 1} ({p.points})
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRankings.length === 0 ? (
                  <tr>
                    <td colSpan={4 + meta.totalProblems} className="text-center py-20 text-slate-400 font-medium text-sm">
                      {searchQuery ? 'No matching users found' : 'No participants yet'}
                    </td>
                  </tr>
                ) : (
                  filteredRankings.map((entry) => (
                    <tr
                      key={entry.rank}
                      className="border-b border-slate-100 dark:border-dark-800/50 hover:bg-slate-50/80 dark:hover:bg-dark-800/30 transition-colors"
                    >
                      {/* Rank */}
                      <td className="px-5 py-3.5">
                        <span className={`font-bold text-sm ${
                          entry.rank === 1 ? 'text-amber-500' :
                          entry.rank === 2 ? 'text-slate-400 dark:text-slate-300' :
                          entry.rank === 3 ? 'text-amber-700 dark:text-amber-500' :
                          'text-slate-500 dark:text-slate-400'
                        }`}>
                          {entry.rank}
                        </span>
                      </td>

                      {/* Name */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-dark-800 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-300 uppercase shadow-inner flex-shrink-0">
                            {entry.username?.[0] || '?'}
                          </div>
                          <span
                            className="font-bold text-slate-800 dark:text-slate-200 hover:text-orange-500 dark:hover:text-orange-400 cursor-pointer transition truncate max-w-[160px]"
                            onClick={() => navigate(`/profile/${entry.username}`)}
                          >
                            {entry.username}
                          </span>
                        </div>
                      </td>

                      {/* Score */}
                      <td className="px-4 py-3.5 text-center">
                        <span className="font-bold text-slate-800 dark:text-white text-sm">{entry.totalScore}</span>
                      </td>

                      {/* Finish Time */}
                      <td className="px-4 py-3.5 text-center">
                        <span className="font-mono text-xs text-slate-600 dark:text-slate-400 font-semibold">{entry.finishTime}</span>
                      </td>

                      {/* Per-Problem Columns (Q1..Q4) */}
                      {entry.problems.map((pd, pi) => {
                        const probMeta = meta.problems[pi];
                        return (
                          <td key={pi} className="px-4 py-3.5 text-center">
                            {pd.status === 'accepted' ? (
                              <div
                                onClick={() => setSelectedCode({
                                  username: entry.username,
                                  problemTitle: probMeta?.title || `Problem Q${pi + 1}`,
                                  language: pd.language,
                                  time: pd.time,
                                  code: pd.code
                                })}
                                className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-dark-800/80 dark:hover:bg-dark-700 rounded-lg cursor-pointer transition shadow-sm group"
                                title="Click to view code"
                              >
                                <span
                                  className="w-4 h-4 rounded text-[9px] font-black text-white flex items-center justify-center"
                                  style={{ backgroundColor: LANG_COLORS[pd.language] || '#666' }}
                                >
                                  {(LANG_LABELS[pd.language] || 'C')[0]}
                                </span>
                                <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-200">
                                  {pd.time}
                                </span>
                                <Play className="w-3 h-3 text-slate-400 group-hover:text-orange-500 transition fill-current" />
                                {pd.wrongAttempts > 0 && (
                                  <span className="text-[10px] text-red-500 font-bold">(-{pd.wrongAttempts})</span>
                                )}
                              </div>
                            ) : pd.status === 'attempted' ? (
                              <span className="inline-block px-2 py-0.5 rounded text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20">
                                -{pd.wrongAttempts}
                              </span>
                            ) : (
                              <span className="text-slate-300 dark:text-slate-700">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Controls */}
        {meta.totalPages > 1 && (
          <div className="flex items-center justify-center gap-1.5 mt-8">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-dark-800 text-slate-500 dark:text-slate-400 disabled:opacity-30 transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {Array.from({ length: meta.totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === meta.totalPages || (p >= page - 2 && p <= page + 2))
              .reduce((acc, p, i, arr) => {
                if (i > 0 && p - arr[i - 1] > 1) {
                  acc.push('...');
                }
                acc.push(p);
                return acc;
              }, [])
              .map((item, i) =>
                item === '...' ? (
                  <span key={`e${i}`} className="text-slate-400 dark:text-slate-600 px-2 text-xs select-none">...</span>
                ) : (
                  <button
                    key={item}
                    onClick={() => setPage(item)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition flex items-center justify-center ${
                      page === item
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'hover:bg-slate-100 dark:hover:bg-dark-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {item}
                  </button>
                )
              )}

            <button
              onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
              disabled={page === meta.totalPages}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-dark-800 text-slate-500 dark:text-slate-400 disabled:opacity-30 transition"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
