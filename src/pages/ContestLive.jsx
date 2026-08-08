import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useContestStore } from '../store/contestStore';
import { useAuthStore } from '../store/authStore';
import Editor from '@monaco-editor/react';
import { Trophy, Clock, CheckCircle, XCircle, ArrowLeft, ChevronRight, Play, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { useFairnessTracker } from '../hooks/useFairnessTracker';
import { joinContestRoom, leaveContestRoom, onContestUpdate, removeListener } from '../utils/socket';
import { useThemeStore } from '../store/themeStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const LANGUAGES = [
  { id: 'cpp', name: 'C++' },
  { id: 'java', name: 'Java' },
  { id: 'python', name: 'Python 3' },
  { id: 'javascript', name: 'JavaScript' },
];
const DEFAULT_CODE = {
  cpp: '#include <bits/stdc++.h>\nusing namespace std;\n\nclass Solution {\npublic:\n    \n};\n',
  java: 'class Solution {\n    \n}\n',
  python: 'class Solution:\n    pass\n',
  javascript: 'var solution = function() {\n    \n};\n',
};

export default function ContestLive() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();
  const { currentContest, getContest, startContest, registerForContest, stopVirtualContest, giveUpVirtualContest } = useContestStore();

  const participant = currentContest?.userData;
  const isVirtual = !!participant?.isVirtual;

  const [timeRemaining, setTimeRemaining] = useState(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [isOver, setIsOver] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState(() => localStorage.getItem('lc_lang') || 'cpp');
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [showConsole, setShowConsole] = useState(true);
  const [leftWidth, setLeftWidth] = useState(38);
  const [editorHeight, setEditorHeight] = useState(65);
  const [loading, setLoading] = useState(true);
  const editorRef = useRef(null);

  // Initialize Phase 1 Anti-Cheat tracking
  useFairnessTracker({
    contestId: id,
    enabled: hasStarted && !isOver && currentContest?.status === 'running'
  });

  // Load contest
  const loadContest = useCallback(async () => {
    try {
      setLoading(true);
      await getContest(id);
    } catch { toast.error('Failed to load contest'); navigate('/contests'); }
    finally { setLoading(false); }
  }, [id, getContest, navigate]);

  useEffect(() => { loadContest(); }, [loadContest]);

  // Real-time Contest Updates
  const currentContestRef = useRef(currentContest);
  currentContestRef.current = currentContest;

  // Refs for stable keyboard shortcut handlers (avoids stale closures)
  const handleRunRef = useRef(null);
  const handleSubmitRef = useRef(null);

  useEffect(() => {
    if (id) {
      joinContestRoom(id);
      
      const handleContestUpdate = (data) => {
        if (data.type === 'submission' && data.status === 'accepted') {
          // Play a tiny subtle sound or just toast
          if (data.userId !== currentContestRef.current?.userData?.user) {
            toast(`${data.username} solved a problem! ${data.isFirstToSolve ? '🔥 First to solve!' : ''}`, {
              icon: '🚀',
              position: 'bottom-right'
            });
          }
          // Refresh the contest state to update leaderboard/stats if needed
          loadContest();
        }
      };

      onContestUpdate(handleContestUpdate);

      return () => {
        removeListener('contest-update', handleContestUpdate);
        leaveContestRoom(id);
      };
    }
  }, [id, loadContest]);

  // Global / Virtual timer countdown
  useEffect(() => {
    if (loading || !currentContest) return;

    const participant = currentContest?.userData;
    // Use explicit isVirtual flag from the DB, not fragile time-based detection
    const isVirtual = !!participant?.isVirtual;
    const endTimeSource = isVirtual
      ? new Date(new Date(participant.startedAt).getTime() + currentContest.duration * 60000)
      : (currentContest?.endTime ? new Date(currentContest.endTime) : null);

    if (participant?.endedAt) {
      setTimeRemaining(0);
      setIsOver(true);
      return;
    }

    if (!endTimeSource || isNaN(endTimeSource.getTime())) return;

    const tick = () => {
      const now = new Date();
      const r = Math.max(0, endTimeSource - now);
      setTimeRemaining(r);
      if (r === 0 && !isOver) { 
        setIsOver(true); 
        toast.error('⏰ Contest time is up!'); 
      }
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, [currentContest, isOver, loading]);

  // Check started
  useEffect(() => {
    if (currentContest?.userData?.startedAt) setHasStarted(true);
  }, [currentContest]);

  // Keyboard shortcuts (use refs to avoid stale closures)
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (e.shiftKey) {
          handleSubmitRef.current?.();
        } else {
          handleRunRef.current?.();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []); // Empty deps — refs always point to latest handlers

  // Load code for selected problem
  useEffect(() => {
    if (!currentContest?.problems?.[selectedIdx]?.problem) return;
    const p = currentContest.problems[selectedIdx].problem;
    const saved = localStorage.getItem(`contest_${id}_${p._id}_${language}`);
    if (saved) setCode(saved);
    else setCode(p.functionSignature?.[language] || DEFAULT_CODE[language] || '');
    setRunResult(null); setSubmitResult(null);
  }, [selectedIdx, language, currentContest, id]);

  // Auto-save code
  useEffect(() => {
    if (!code || !currentContest?.problems?.[selectedIdx]) return;
    const pid = currentContest.problems[selectedIdx].problem._id;
    const t = setTimeout(() => localStorage.setItem(`contest_${id}_${pid}_${language}`, code), 1500);
    return () => clearTimeout(t);
  }, [code, selectedIdx, language, id, currentContest]);

  const handleEnter = async () => {
    try {
      // For virtual participants on finished contests, they already started via /virtual-contests/:id/start
      // Just mark as started and reload — don't call startContest which requires 'running' status
      if (currentContest?.status === 'finished' && currentContest?.userData?.isVirtual) {
        setHasStarted(true);
        loadContest();
        return;
      }
      if (!currentContest?.isRegistered) await registerForContest(id);
      await startContest(id);
      setHasStarted(true);
      toast.success("You're in! Good luck!");
      loadContest();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to enter'); }
  };

  const currentProblem = currentContest?.problems?.[selectedIdx]?.problem;

  const handleRun = async () => {
    if (running || submitting || !currentProblem) return;
    setRunning(true); setShowConsole(true);
    try {
      const res = await fetch(`${API_URL}/judge/run-batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ code, language, problemId: currentProblem._id })
      });
      const r = await res.json();
      if (!res.ok) throw new Error(r.message);
      setRunResult({ ...r, status: r.testCasesPassed === r.totalTestCases ? 'Accepted' : (r.status || 'Wrong Answer') });
      toast[r.testCasesPassed === r.totalTestCases ? 'success' : 'error'](
        r.testCasesPassed === r.totalTestCases ? '✓ All visible cases passed!' : `✗ ${r.testCasesPassed}/${r.totalTestCases} passed`
      );
    } catch (e) { toast.error(e.message); setRunResult({ status: e.message, outputs: [], errors: [e.message] }); }
    finally { setRunning(false); }
  };
  // Keep ref in sync
  handleRunRef.current = handleRun;

  const handleSubmit = async () => {
    if (running || submitting || !currentProblem) return;
    setSubmitting(true); setShowConsole(true);
    try {
      const res = await fetch(`${API_URL}/contests/${id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ problemId: currentProblem._id, code, language })
      });
      const r = await res.json();
      if (!res.ok) throw new Error(r.message);
      setSubmitResult(r);
      if (r.status === 'accepted') {
        if (isVirtual) {
          toast.success(`✓ Accepted! Score: ${r.totalScore}`);
        } else {
          toast.success(`✓ Accepted! Score: ${r.totalScore} | Rank: #${r.rank}`);
        }
      } else {
        toast.error(`✗ ${r.status}: ${r.executionResult?.testCasesPassed}/${r.executionResult?.totalTestCases} passed`);
      }
      loadContest(); // Refresh to get updated userData
    } catch (e) { toast.error(e.message); }
    finally { setSubmitting(false); }
  };
  // Keep ref in sync
  handleSubmitRef.current = handleSubmit;

  // LeetCode-style "Give Up": deletes your entire virtual record
  const handleGiveUp = async () => {
    if (window.confirm("Are you sure you want to give up? All your progress will be deleted and cannot be recovered.")) {
      try {
        await giveUpVirtualContest(id);
        toast.success("Virtual contest abandoned.");
        navigate(`/contests/${id}`);
      } catch (e) {
        toast.error(e.response?.data?.message || 'Failed to give up');
      }
    }
  };

  const getProblemStatus = (pid) => {
    if (!currentContest?.userData?.submissions) return null;
    const subs = currentContest.userData.submissions.filter(s => s.problem?.toString() === pid?.toString());
    if (subs.some(s => s.status === 'accepted')) return 'accepted';
    if (subs.length > 0) return 'attempted';
    return null;
  };

  const formatTime = (ms) => {
    if (ms == null) return '--:--:--';
    const h = Math.floor(ms / 3600000), m = Math.floor((ms % 3600000) / 60000), s = Math.floor((ms % 60000) / 1000);
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  };

  const diffColor = (d) => d === 'Easy' ? '#00b8a3' : d === 'Medium' ? '#ffc01e' : d === 'Hard' ? '#ef4743' : '#999';

  // Resizers
  const startH = (e) => {
    const sx = e.clientX, sw = leftWidth;
    const move = (e) => setLeftWidth(Math.max(20, Math.min(55, sw + ((e.clientX - sx) / window.innerWidth) * 100)));
    const up = () => { document.removeEventListener('mousemove', move); document.removeEventListener('mouseup', up); document.body.style.cssText = ''; };
    document.body.style.cssText = 'cursor:col-resize;user-select:none';
    document.addEventListener('mousemove', move); document.addEventListener('mouseup', up);
  };
  const startV = (e) => {
    const sy = e.clientY, sh = editorHeight, ct = e.target.parentElement;
    const move = (e) => setEditorHeight(Math.max(20, Math.min(85, sh + ((e.clientY - sy) / ct.clientHeight) * 100)));
    const up = () => { document.removeEventListener('mousemove', move); document.removeEventListener('mouseup', up); document.body.style.cssText = ''; };
    document.body.style.cssText = 'cursor:row-resize;user-select:none';
    document.addEventListener('mousemove', move); document.addEventListener('mouseup', up);
  };

  // Loading
  if (loading || !currentContest) return (
    <div className="h-screen bg-[#1a1a2e] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#3c3c3c] border-t-[#ffa116] rounded-full animate-spin" />
    </div>
  );

  // participant and isVirtual are defined at the top of the component
  const personalEndTime = isVirtual ? new Date(new Date(participant.startedAt).getTime() + currentContest.duration * 60000) : null;
  const isVirtualOver = isVirtual && (new Date() >= personalEndTime || !!participant?.endedAt);

  // Contest finished screen triggers if:
  // 1. Contest status is finished AND user is NOT a virtual participant, OR
  // 2. User IS virtual but their virtual session has expired/ended
  const isContestFinishedScreen = (currentContest.status === 'finished' && !isVirtual) || isVirtualOver;

  // Contest finished
  if (isContestFinishedScreen || isOver) return (
    <div className="h-screen bg-[#1a1a2e] flex items-center justify-center text-white">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-[#ffa11620] rounded-full flex items-center justify-center mx-auto mb-4">
          <Trophy className="w-8 h-8 text-[#ffa116]" />
        </div>
        <h2 className="text-2xl font-bold mb-2">{isVirtual ? 'Virtual Contest Complete' : 'Contest Ended'}</h2>
        {/* Show score summary — no ranking for virtual (LeetCode-style) */}
        {participant && (
          <div className="mb-6 space-y-3">
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-[#ffffff08] border border-[#ffffff10] rounded-xl p-3">
                <div className="text-2xl font-bold text-[#ffa116]">{participant.totalScore || 0}</div>
                <div className="text-xs text-[#eff1f660]">Score</div>
              </div>
              <div className="bg-[#ffffff08] border border-[#ffffff10] rounded-xl p-3">
                <div className="text-2xl font-bold text-[#2cbb5d]">{participant.problemsSolved || 0}</div>
                <div className="text-xs text-[#eff1f660]">Solved</div>
              </div>
            </div>
            {isVirtual && (
              <div className="text-xs text-[#eff1f660]">Virtual practice — does not affect your contest rating</div>
            )}
          </div>
        )}
        <div className="flex gap-3 justify-center">
          <button onClick={() => navigate(`/contests/${id}`)} className="px-6 py-2.5 bg-[#ffa116] text-black rounded-lg font-semibold text-sm hover:bg-[#ffb340] transition">View Contest</button>
          <button onClick={() => navigate('/contests')} className="px-6 py-2.5 border border-[#3c3c3c] text-[#eff1f6] rounded-lg text-sm hover:bg-[#ffffff08] transition">All Contests</button>
        </div>
      </div>
    </div>
  );

  // Not started — Enter screen
  // For finished contests where user is NOT virtual, redirect them back to contest detail
  if (!hasStarted && currentContest.status === 'finished' && !isVirtual) {
    return (
      <div className="h-screen bg-[#1a1a2e] flex items-center justify-center text-white">
        <div className="text-center max-w-md">
          <Trophy className="w-16 h-16 text-[#eff1f640] mx-auto mb-6" />
          <h2 className="text-xl font-bold mb-2">This contest has ended</h2>
          <p className="text-[#eff1f680] mb-6">Start a virtual practice session from the contest page to solve these problems under timed conditions.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => navigate(`/contests/${id}`)} className="px-6 py-2.5 bg-[#ffa116] text-black rounded-lg font-semibold text-sm hover:bg-[#ffb340] transition">Go to Contest Page</button>
            <button onClick={() => navigate('/contests')} className="px-6 py-2.5 border border-[#3c3c3c] text-[#eff1f6] rounded-lg text-sm hover:bg-[#ffffff08] transition">All Contests</button>
          </div>
        </div>
      </div>
    );
  }

  if (!hasStarted) return (
    <div className="h-screen bg-slate-100 dark:bg-[#1a1a2e] flex items-center justify-center text-slate-800 dark:text-white">
      <div className="text-center max-w-md bg-white dark:bg-[#282828] p-8 rounded-2xl border border-slate-350 dark:border-[#3c3c3c] shadow-2xl">
        <Trophy className="w-16 h-16 text-[#ffa116] mx-auto mb-6" />
        <h2 className="text-2xl font-bold mb-2 text-slate-800 dark:text-white">{currentContest.title}</h2>
        <p className="text-slate-500 dark:text-[#eff1f680] mb-2">{currentContest.problems?.length} problems • {currentContest.duration} minutes</p>
        <div className="text-3xl font-mono font-bold text-[#2cbb5d] mb-6">{formatTime(timeRemaining)}</div>
        <button onClick={handleEnter} className="px-8 py-3 bg-[#ffa116] text-black rounded-xl font-bold text-lg hover:bg-[#ffb340] transition">
          Enter Contest
        </button>
        <p className="text-slate-400 dark:text-[#eff1f650] text-xs mt-4">You'll see all problems once you enter</p>
      </div>
    </div>
  );

  // ─── FULL EDITOR VIEW ───
  const visibleTests = (currentProblem?.testCases || []).filter(t => !t.isHidden);
  const solvedCount = currentContest.problems?.filter(cp => getProblemStatus(cp.problem._id) === 'accepted').length || 0;

  return (
    <div className="h-screen flex flex-col bg-slate-100 dark:bg-[#1a1a2e] text-slate-800 dark:text-[#eff1f6] overflow-hidden select-none" style={{ fontFamily: "-apple-system,BlinkMacSystemFont,'Inter',sans-serif" }}>
      {/* NAVBAR */}
      <nav className="h-[46px] flex-shrink-0 bg-slate-200 dark:bg-[#282828] border-b border-slate-300 dark:border-[#3c3c3c] flex items-center px-3 gap-2 z-20 text-slate-850 dark:text-[#eff1f6]">
        <button onClick={() => navigate(`/contests/${id}`)} className="p-1.5 rounded hover:bg-slate-350 dark:hover:bg-[#ffffff12] text-slate-600 dark:text-[#eff1f680] transition">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <Trophy className="w-4 h-4 text-[#ffa116]" />
        <span className="text-sm font-medium truncate max-w-[200px] text-slate-800 dark:text-white">{currentContest.title}</span>
        {isVirtual && (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-500/20 text-green-400 border border-green-500/30">VIRTUAL</span>
        )}
        <span className="text-[10px] text-slate-500 dark:text-[#eff1f650] ml-1">{solvedCount}/{currentContest.problems?.length} solved</span>

        <div className="flex-1" />
        <button onClick={toggleTheme} className="p-1.5 rounded hover:bg-slate-350 dark:hover:bg-[#ffffff12] text-slate-655 dark:text-[#eff1f680] transition mr-2" title="Toggle Theme">
          {isDark ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="5"/>
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          )}
        </button>

        {isVirtual && !isVirtualOver && (
          <button 
            onClick={handleGiveUp}
            className="h-[30px] px-3.5 rounded-lg text-xs font-semibold bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 hover:border-red-500/50 transition flex items-center gap-1.5 mr-2"
          >
            Give Up
          </button>
        )}

        {/* Timer */}
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold font-mono ${
          timeRemaining < 300000 ? 'bg-red-500/20 text-red-400 animate-pulse' :
          timeRemaining < 900000 ? 'bg-amber-500/20 text-amber-400' :
          'bg-[#2cbb5d20] text-[#2cbb5d]'
        }`}>
          <Clock className="w-3.5 h-3.5" />
          {formatTime(timeRemaining)}
        </div>

        {/* Run / Submit */}
        <button onClick={handleRun} disabled={running || submitting} className="h-[30px] px-3 rounded-lg text-xs font-medium border border-slate-300 dark:border-[#404040] text-slate-800 dark:text-[#eff1f6] hover:bg-slate-350 dark:hover:bg-[#ffffff12] disabled:opacity-40 transition flex items-center gap-1.5 ml-2">
          {running ? <div className="w-3 h-3 border border-slate-500 dark:border-[#eff1f680] border-t-white rounded-full animate-spin" /> : <Play className="w-3 h-3" />}Run
        </button>
        <button onClick={handleSubmit} disabled={running || submitting} className="h-[30px] px-3 rounded-lg text-xs font-medium bg-[#2cbb5d] text-white hover:bg-[#26a651] disabled:opacity-40 transition flex items-center gap-1.5">
          {submitting ? <div className="w-3 h-3 border border-white/50 border-t-white rounded-full animate-spin" /> : <Upload className="w-3 h-3" />}Submit
        </button>
      </nav>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT PANEL: Problem Sidebar + Description */}
        <div className="flex flex-col overflow-hidden bg-white dark:bg-[#282828] border-r border-slate-300 dark:border-none min-w-0" style={{ width: `${leftWidth}%` }}>
          {/* Problem tabs */}
          <div className="flex border-b border-slate-300 dark:border-[#3c3c3c] bg-slate-200 dark:bg-slate-900 overflow-x-auto flex-shrink-0">
            {currentContest.problems?.map((cp, i) => {
              const st = getProblemStatus(cp.problem._id);
              return (
                <button key={cp._id} onClick={() => setSelectedIdx(i)}
                  className={`px-3 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition flex items-center gap-1.5 ${
                    selectedIdx === i ? 'border-[#ffa116] text-slate-800 dark:text-white font-bold' : 'border-transparent text-slate-500 dark:text-[#eff1f680] hover:text-slate-800 dark:hover:text-[#eff1f6a0]'
                  }`}>
                  {st === 'accepted' ? <CheckCircle className="w-3 h-3 text-[#2cbb5d]" /> :
                   st === 'attempted' ? <XCircle className="w-3 h-3 text-[#ffc01e]" /> :
                   <span className="w-3 h-3 rounded-full border border-slate-400 dark:border-[#eff1f640] inline-block" />}
                  Q{i + 1}
                </button>
              );
            })}
          </div>

          {/* Problem description */}
          <div className="flex-1 overflow-y-auto p-5 lc-scroll text-slate-800 dark:text-[#eff1f6]">
            {currentProblem ? (
              <>
                <div className="flex items-center gap-2 mb-3">
                  <h2 className="text-lg font-bold">{currentProblem.title}</h2>
                  <span className="px-2 py-0.5 rounded text-xs font-bold" style={{ color: diffColor(currentProblem.difficulty), background: diffColor(currentProblem.difficulty) + '20' }}>
                    {currentProblem.difficulty}
                  </span>
                  <span className="text-xs text-[#ffa116] font-semibold ml-auto">{currentContest.problems[selectedIdx].points} pts</span>
                </div>
                <div className="text-sm text-[#eff1f6cc] leading-relaxed mb-4 lc-description" dangerouslySetInnerHTML={{ __html: currentProblem.description }} />
                {currentProblem.constraints && (
                  <div className="mb-4">
                    <h3 className="text-xs font-bold text-[#eff1f680] uppercase mb-2">Constraints</h3>
                    <div className="text-xs text-[#eff1f6aa] bg-[#1a1a2e] rounded-lg p-3 whitespace-pre-wrap">{currentProblem.constraints}</div>
                  </div>
                )}
                {currentProblem.examples?.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-[#eff1f680] uppercase mb-2">Examples</h3>
                    {currentProblem.examples.map((ex, i) => (
                      <div key={i} className="bg-[#1a1a2e] rounded-lg p-3 mb-3 text-xs">
                        <div className="mb-1"><span className="text-[#eff1f680]">Input:</span> <code className="text-[#2cbb5d]">{ex.input}</code></div>
                        <div className="mb-1"><span className="text-[#eff1f680]">Output:</span> <code className="text-[#ffa116]">{ex.output}</code></div>
                        {ex.explanation && <div className="text-[#eff1f660] mt-1">{ex.explanation}</div>}
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : <p className="text-[#eff1f650]">Select a problem</p>}
          </div>
        </div>

        {/* H-RESIZE */}
        <div className="w-[5px] flex-shrink-0 cursor-col-resize bg-[#1a1a2e] hover:bg-[#ffa11640] active:bg-[#ffa11660] transition-colors" onMouseDown={startH} />

        {/* RIGHT: Editor + Console */}
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 dark:bg-[#1e1e1e] min-w-0">
          {/* Editor header */}
          <div className="h-[38px] flex-shrink-0 flex items-center justify-between px-3 bg-slate-200 dark:bg-[#282828] border-b border-slate-300 dark:border-[#3c3c3c]">
            <span className="text-xs font-medium text-slate-800 dark:text-[#eff1f680]">Code</span>
            <select value={language} onChange={e => { setLanguage(e.target.value); localStorage.setItem('lc_lang', e.target.value); }}
              className="bg-white dark:bg-[#3c3c3c] text-slate-800 dark:text-[#eff1f6] border border-slate-300 dark:border-none text-xs rounded px-2 py-1 outline-none cursor-pointer">
              {LANGUAGES.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>

          {/* Editor + Console */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div style={{ height: showConsole ? `${editorHeight}%` : '100%' }} className="overflow-hidden">
              <Editor
                onMount={ed => { editorRef.current = ed; }}
                height="100%" language={language === 'cpp' ? 'cpp' : language} value={code} onChange={v => setCode(v || '')} theme={isDark ? 'vs-dark' : 'vs'}
                options={{ minimap: { enabled: false }, fontSize: 14, fontFamily: "'Fira Code','Consolas',monospace", fontLigatures: true, lineNumbers: 'on', scrollBeyondLastLine: false, automaticLayout: true, padding: { top: 12, bottom: 12 }, tabSize: language === 'python' ? 4 : 2, bracketPairColorization: { enabled: true }, smoothScrolling: true, cursorBlinking: 'smooth', renderLineHighlight: 'line' }}
              />
            </div>
            {showConsole && (
              <>
                <div className="h-[5px] flex-shrink-0 cursor-row-resize bg-slate-300 dark:bg-[#1a1a2e] hover:bg-[#ffa11640] active:bg-[#ffa11660] transition-colors" onMouseDown={startV} />
                <div style={{ height: `${100 - editorHeight}%` }} className="overflow-hidden bg-slate-50 dark:bg-[#282828] border border-slate-300 dark:border-[#3c3c3c] flex flex-col">
                  <div className="flex items-center gap-4 px-3 py-2 border-b border-slate-300 dark:border-[#3c3c3c] bg-slate-200 dark:bg-slate-900 text-slate-800 dark:text-white">
                    <span className="text-xs font-medium">Result</span>
                  </div>
                  <div className="flex-1 overflow-y-auto p-3 lc-scroll text-xs">
                    {submitResult ? (
                      (submitResult.status?.toLowerCase() === 'compilation error' || submitResult.status?.toLowerCase() === 'compile error') ? (
                        <div className="space-y-3">
                          <div className="text-lg font-bold text-red-500">
                            Compile Error
                          </div>
                          <div className="bg-[#ff4b4b0a] border border-[#ff4b4b22] rounded-lg p-4 font-mono text-xs text-[#ff8e8e] whitespace-pre-wrap leading-relaxed select-text max-h-[300px] overflow-y-auto custom-scrollbar">
                            {submitResult.executionResult?.compile_output || submitResult.executionResult?.errors?.[0] || 'Unknown compilation error'}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className={`text-lg font-bold mb-2 ${submitResult.status === 'accepted' ? 'text-[#2cbb5d]' : 'text-[#ef4743]'}`}>
                            {submitResult.status === 'accepted' ? '✓ Accepted' : `✗ ${submitResult.status}`}
                          </div>
                          <div className="text-[#eff1f680]">
                            Score: <span className="text-[#ffa116] font-bold">{submitResult.totalScore}</span>
                            {!isVirtual && (
                              <> • Rank: <span className="text-white font-bold">#{submitResult.rank}</span></>
                            )}
                            • Solved: {submitResult.problemsSolved}
                          </div>
                        </div>
                      )
                    ) : runResult ? (
                      (runResult.status?.toLowerCase() === 'compilation error' || runResult.status?.toLowerCase() === 'compile error') ? (
                        <div className="space-y-3">
                          <div className="text-lg font-bold text-red-500">
                            Compile Error
                          </div>
                          <div className="bg-[#ff4b4b0a] border border-[#ff4b4b22] rounded-lg p-4 font-mono text-xs text-[#ff8e8e] whitespace-pre-wrap leading-relaxed select-text max-h-[300px] overflow-y-auto custom-scrollbar">
                            {runResult.compile_output || runResult.errors?.[0] || 'Unknown compilation error'}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className={`text-lg font-bold mb-2 ${runResult.status === 'Accepted' ? 'text-[#2cbb5d]' : 'text-[#ef4743]'}`}>
                            {runResult.status}
                          </div>
                          {runResult.outputs?.map((o, i) => (
                            <div key={i} className="mb-2 p-2 bg-[#1a1a2e] rounded">
                              <div className="text-[#eff1f680]">Case {i + 1}: <span className={o.passed ? 'text-[#2cbb5d]' : 'text-[#ef4743]'}>{o.passed ? 'Passed' : 'Failed'}</span></div>
                              {o.stdout && <div className="text-[#eff1f6aa] mt-1">Output: {o.stdout}</div>}
                              {o.error && <div className="text-[#ef4743] mt-1">{o.error}</div>}
                            </div>
                          ))}
                          {runResult.errors?.map((e, i) => <div key={i} className="text-[#ef4743]">{e}</div>)}
                        </div>
                      )
                    ) : (
                      <p className="text-[#eff1f650]">Run or submit your code to see results</p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Bottom bar */}
          <div className="h-[34px] flex-shrink-0 flex items-center justify-between px-3 bg-[#282828] border-t border-[#3c3c3c]">
            <button onClick={() => setShowConsole(c => !c)} className="text-xs text-[#eff1f680] hover:text-white transition">
              {showConsole ? '▼ Hide' : '▲ Show'} Console
            </button>
            <span className="text-[10px] text-[#eff1f650]">Ctrl+Enter: Run • Ctrl+Shift+Enter: Submit</span>
          </div>
        </div>
      </div>

      <style>{`.lc-scroll::-webkit-scrollbar{width:6px}.lc-scroll::-webkit-scrollbar-track{background:transparent}.lc-scroll::-webkit-scrollbar-thumb{background:#ffffff20;border-radius:3px}`}</style>
    </div>
  );
}
