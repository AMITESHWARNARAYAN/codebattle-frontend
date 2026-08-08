import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useMatchStore } from '../store/matchStore';
import { useContestStore } from '../store/contestStore';
import Editor from '@monaco-editor/react';
import { submitCodeNotification, onOpponentSubmitted } from '../utils/socket';
import { toast } from 'react-hot-toast';
import { TestCasePanel, Confetti } from './leetcode/Panels';
import { LANGUAGES, DEFAULT_CODE, DIFF_COLORS } from './leetcode/constants';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function CodeEditor() {
  const { matchId, problemId: paramProblemId } = useParams();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const contestId = searchParams.get('contest');
  const navigate = useNavigate();
  const editorRef = useRef(null);

  const { user, token } = useAuthStore();
  const { currentMatch, submitCode, getMatch, giveUp } = useMatchStore();
  const { submitSolution: submitContestSolution } = useContestStore();

  const isContestMode = !!contestId;
  const problemId = paramProblemId || searchParams.get('problem') || matchId;

  const [problem, setProblem] = useState(location.state?.problem || null);
  const [match, setMatch] = useState(currentMatch);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('cpp');
  const [fontSize, setFontSize] = useState(14);

  // Layout
  const [leftWidth, setLeftWidth] = useState(40);
  const [editorHeight, setEditorHeight] = useState(65);
  const [showConsole, setShowConsole] = useState(true);
  const [bottomTab, setBottomTab] = useState('testcase');
  const [activeTestCase, setActiveTestCase] = useState(0);

  // Timer
  const [timeLeft, setTimeLeft] = useState(600);
  const [elapsed, setElapsed] = useState(0);

  // Execution
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // Match state
  const [opponentSubmitted, setOpponentSubmitted] = useState(false);

  // Fetch match data
  useEffect(() => {
    if (matchId && !match) {
      (async () => {
        try {
          const data = await getMatch(matchId);
          setMatch(data);
          setProblem(data.problem);
        } catch { toast.error('Failed to load match'); navigate('/'); }
        finally { setLoading(false); }
      })();
    } else if (paramProblemId && !problem) {
      (async () => {
        try {
          const res = await fetch(`${API_URL}/problems/${paramProblemId}`, { headers: { Authorization: `Bearer ${token}` } });
          if (!res.ok) throw new Error();
          setProblem(await res.json());
        } catch { toast.error('Failed to load problem'); navigate('/'); }
        finally { setLoading(false); }
      })();
    } else if (match || problem) {
      setLoading(false);
      if (match?.problem && !problem) setProblem(match.problem);
    } else {
      setLoading(false);
    }
  }, [matchId, paramProblemId]);

  // Pre-fill code
  useEffect(() => {
    if (!problem) return;
    const saved = localStorage.getItem(`code_match_${matchId || problemId}_${language}`);
    if (saved) { setCode(saved); return; }
    setCode(problem.functionSignature?.[language] || DEFAULT_CODE[language] || '');
  }, [problem, language]);

  // Auto-save
  useEffect(() => {
    if (!code || (!matchId && !problemId)) return;
    const t = setTimeout(() => localStorage.setItem(`code_match_${matchId || problemId}_${language}`, code), 2000);
    return () => clearTimeout(t);
  }, [code, matchId, problemId, language]);

  // Solo timer countdown
  useEffect(() => {
    if (!match || match.matchType !== 'solo') return;
    const t = setInterval(() => setTimeLeft(p => { if (p <= 1) { clearInterval(t); handleSubmit(); return 0; } return p - 1; }), 1000);
    return () => clearInterval(t);
  }, [match]);

  // Elapsed timer
  useEffect(() => {
    const t = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // Opponent socket
  useEffect(() => {
    onOpponentSubmitted((data) => { setOpponentSubmitted(true); toast.success(`${data.username} submitted!`); });
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const h = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); e.shiftKey ? handleSubmit() : handleRun(); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [code, language, running, submitting]);

  const handleRun = async () => {
    if (running || submitting || !code.trim() || code.trim().length < 5) { toast.error('Code too short'); return; }
    setRunning(true); setBottomTab('result'); setShowConsole(true);
    try {
      const res = await fetch(`${API_URL}/judge/run-batch`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ code, language, problemId: problem?._id || problemId })
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.message); }
      const r = await res.json();
      setRunResult({ ...r, status: r.testCasesPassed === r.totalTestCases && !r.errors?.length ? 'Accepted' : (r.status || 'Wrong Answer') });
      toast[r.testCasesPassed === r.totalTestCases ? 'success' : 'error'](r.testCasesPassed === r.totalTestCases ? '✓ All passed!' : `✗ ${r.testCasesPassed}/${r.totalTestCases}`);
    } catch (e) { toast.error(e.message); }
    finally { setRunning(false); }
  };

  const handleSubmit = async () => {
    if (running || submitting || !code.trim()) { toast.error('Write code first'); return; }
    setSubmitting(true); setBottomTab('result'); setShowConsole(true);
    try {
      if (isContestMode) {
        const r = await submitContestSolution(contestId, problemId, code, language);
        setSubmitResult(r);
        if (r.status === 'accepted') { toast.success(`✓ Accepted! +${r.score}`); setShowConfetti(true); setTimeout(() => setShowConfetti(false), 3000); }
        else toast.error(`✗ ${r.status}`);
        setTimeout(() => navigate(`/contests/${contestId}/live`), 2000);
      } else if (matchId) {
        const r = await submitCode(matchId, code, language);
        setSubmitResult(r.executionResult);
        if (match?.matchType !== 'solo') submitCodeNotification(matchId, user._id, user.username);
        if (r.executionResult?.status === 'Accepted') { toast.success('✓ All passed!'); setShowConfetti(true); setTimeout(() => setShowConfetti(false), 3000); }
        else toast.error(`✗ ${r.executionResult?.status || 'Failed'}`);
      }
    } catch (e) { toast.error(e.response?.data?.message || 'Submit failed'); }
    finally { setSubmitting(false); }
  };

  const handleGiveUp = async () => {
    if (!match || match.matchType === 'solo') return;
    if (!confirm('Give up? Your opponent will win!')) return;
    try { await giveUp(matchId); toast.success('You gave up'); setTimeout(() => navigate(`/results/${matchId}`), 1500); }
    catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  const handleReset = () => { if (confirm('Reset code?')) setCode(problem?.functionSignature?.[language] || DEFAULT_CODE[language]); };

  const startHResize = (e) => {
    const startX = e.clientX, startW = leftWidth;
    const onMove = (e) => setLeftWidth(Math.max(25, Math.min(65, startW + ((e.clientX - startX) / window.innerWidth) * 100)));
    const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); document.body.style.cssText = ''; };
    document.body.style.cssText = 'cursor:col-resize;user-select:none';
    document.addEventListener('mousemove', onMove); document.addEventListener('mouseup', onUp);
  };
  const startVResize = (e) => {
    const startY = e.clientY, startH = editorHeight;
    const onMove = (e) => setEditorHeight(Math.max(20, Math.min(85, startH + ((e.clientY - startY) / e.target.parentElement?.clientHeight || 600) * 100)));
    const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); document.body.style.cssText = ''; };
    document.body.style.cssText = 'cursor:row-resize;user-select:none';
    document.addEventListener('mousemove', onMove); document.addEventListener('mouseup', onUp);
  };

  const fmtTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  const matchType = match?.matchType || 'solo';
  const isVs = matchType === 'matchmaking' || matchType === 'friend';
  const opponent = isVs && match?.players ? match.players.find(p => (p._id || p) !== user?._id) : null;

  if (loading) return <div className="h-screen bg-[#1a1a2e] flex items-center justify-center"><div className="w-6 h-6 border-2 border-[#3c3c3c] border-t-[#2cbb5d] rounded-full animate-spin" /></div>;
  if (!problem) return <div className="h-screen bg-[#1a1a2e] flex items-center justify-center text-center"><p className="text-[#ef4743] mb-3">Problem not found</p><button onClick={() => navigate('/')} className="px-4 py-2 bg-[#2cbb5d] text-white rounded-lg text-sm">Go Back</button></div>;

  const visibleTestCases = (problem.testCases || problem.visibleTestCases || []).filter(tc => !tc.isHidden);

  return (
    <div className="h-screen flex flex-col bg-[#1a1a2e] text-[#eff1f6] overflow-hidden select-none" style={{ fontFamily: "-apple-system,BlinkMacSystemFont,'Inter',sans-serif" }}>
      <Confetti show={showConfetti} />

      {/* NAVBAR */}
      <nav className="h-[46px] flex-shrink-0 bg-[#282828] border-b border-[#3c3c3c] flex items-center px-3 gap-2 z-20">
        <button onClick={() => navigate('/')} className="text-[#ffa116] font-bold text-base mr-2 hover:opacity-80">CB</button>
        <button onClick={() => navigate(-1)} className="p-1.5 rounded hover:bg-[#ffffff12] text-[#eff1f680]">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>
        </button>

        {/* Match type badge */}
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${isVs ? 'bg-[#ef474320] text-[#ef4743]' : matchType === 'solo' ? 'bg-[#ffc01e20] text-[#ffc01e]' : 'bg-[#2cbb5d20] text-[#2cbb5d]'}`}>
          {matchType === 'matchmaking' ? '⚔ RANKED' : matchType === 'friend' ? '👥 FRIEND' : '🎯 SOLO'}
        </span>

        <span className="text-sm font-medium truncate max-w-[250px]">{problem.title}</span>
        <span className="text-xs font-medium" style={{ color: DIFF_COLORS[problem.difficulty] }}>{problem.difficulty}</span>

        {/* Opponent info */}
        {isVs && opponent && (
          <div className="flex items-center gap-1.5 ml-2 px-2 py-1 rounded bg-[#ffffff08] text-xs">
            <span className="text-[#eff1f680]">vs</span>
            <span className="text-[#eff1f6] font-medium">{opponent.username || 'Opponent'}</span>
            {opponentSubmitted && <span className="text-[#2cbb5d] font-bold">✓ Submitted</span>}
          </div>
        )}

        <div className="flex-1" />

        {/* Timer */}
        {matchType === 'solo' ? (
          <div className={`flex items-center gap-1.5 text-xs font-mono mr-2 ${timeLeft < 60 ? 'text-[#ef4743]' : 'text-[#eff1f680]'}`}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            {fmtTime(timeLeft)}
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-[#eff1f680] mr-2">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            {fmtTime(elapsed)}
          </div>
        )}

        {/* Give Up (vs modes only) */}
        {isVs && (
          <button onClick={handleGiveUp} className="h-[30px] px-3 rounded-lg text-xs font-medium border border-[#ef474340] text-[#ef4743] hover:bg-[#ef474315] transition mr-1">
            Give Up
          </button>
        )}

        <button onClick={handleRun} disabled={running || submitting} className="h-[30px] px-3.5 rounded-lg text-xs font-medium border border-[#404040] text-[#eff1f6] hover:bg-[#ffffff12] disabled:opacity-40 transition flex items-center gap-1.5">
          {running ? <div className="w-3 h-3 border border-[#eff1f680] border-t-white rounded-full animate-spin"/> : <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>}Run
        </button>
        <button onClick={handleSubmit} disabled={running || submitting} className="h-[30px] px-3.5 rounded-lg text-xs font-medium bg-[#2cbb5d] text-white hover:bg-[#26a651] disabled:opacity-40 transition flex items-center gap-1.5">
          {submitting ? <div className="w-3 h-3 border border-white/50 border-t-white rounded-full animate-spin"/> : <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 12l5 5L20 6"/></svg>}Submit
        </button>
      </nav>

      {/* MAIN */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT - Problem Description */}
        <div className="flex flex-col overflow-hidden bg-[#282828]" style={{ width: `${leftWidth}%` }}>
          <div className="flex-1 overflow-y-auto p-5 space-y-5 text-sm lc-scroll">
            <div>
              <h1 className="text-xl font-semibold mb-1">{problem.title}</h1>
              <span className="text-sm font-medium" style={{ color: DIFF_COLORS[problem.difficulty] }}>{problem.difficulty}</span>
            </div>
            <div className="text-[#eff1f6cc] leading-relaxed whitespace-pre-wrap">{problem.description}</div>

            {(problem.examples || []).map((ex, i) => (
              <div key={i} className="space-y-2">
                <p className="font-semibold">Example {i + 1}:</p>
                <div className="bg-[#ffffff08] rounded-lg p-4 border-l-2 border-[#3c3c3c] font-mono text-xs space-y-1">
                  <div><span className="font-bold">Input:</span> <span className="text-[#eff1f6cc]">{ex.input}</span></div>
                  <div><span className="font-bold">Output:</span> <span className="text-[#eff1f6cc]">{ex.output}</span></div>
                  {ex.explanation && <div><span className="font-bold">Explanation:</span> <span className="text-[#eff1f6cc]">{ex.explanation}</span></div>}
                </div>
              </div>
            ))}

            {problem.constraints && (
              <div>
                <p className="font-semibold mb-2">Constraints:</p>
                <ul className="list-disc list-inside space-y-1 text-[#eff1f6cc]">
                  {problem.constraints.split('\n').filter(Boolean).map((c, i) => <li key={i} className="font-mono text-xs">{c.replace(/^[-•]\s*/, '')}</li>)}
                </ul>
              </div>
            )}

            {problem.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {problem.tags.map((t, i) => <span key={i} className="px-2.5 py-1 rounded-full bg-[#ffffff0f] text-[#eff1f6a0] text-xs">{t}</span>)}
              </div>
            )}
          </div>
        </div>

        {/* H-RESIZE */}
        <div className="w-[5px] flex-shrink-0 cursor-col-resize bg-[#1a1a2e] hover:bg-[#ffa11640] active:bg-[#ffa11660] transition-colors" onMouseDown={startHResize} />

        {/* RIGHT - Editor + Testcase */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#1e1e1e]">
          {/* Editor Header */}
          <div className="h-[38px] flex-shrink-0 flex items-center justify-between px-3 bg-[#282828] border-b border-[#3c3c3c]">
            <div className="flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-[#2cbb5d]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M16 18l6-6-6-6M8 6l-6 6 6 6"/></svg>
              <span className="text-xs font-medium">Code</span>
            </div>
            <div className="flex items-center gap-2">
              <select value={language} onChange={e => setLanguage(e.target.value)} className="bg-[#3c3c3c] text-[#eff1f6] text-xs rounded px-2 py-1 border-none outline-none cursor-pointer">
                {LANGUAGES.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
              <button onClick={handleReset} className="p-1 rounded hover:bg-[#ffffff12] text-[#eff1f680] transition" title="Reset">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 4v6h6M23 20v-6h-6"/><path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15"/></svg>
              </button>
              <button onClick={() => setFontSize(f => Math.min(22, f + 1))} className="p-1 rounded hover:bg-[#ffffff12] text-[#eff1f680] text-[10px] font-bold">A+</button>
              <button onClick={() => setFontSize(f => Math.max(11, f - 1))} className="p-1 rounded hover:bg-[#ffffff12] text-[#eff1f680] text-[10px] font-bold">A-</button>
            </div>
          </div>

          <div className="flex-1 flex flex-col overflow-hidden">
            <div style={{ height: showConsole ? `${editorHeight}%` : '100%' }} className="overflow-hidden">
              <Editor onMount={ed => { editorRef.current = ed; }} height="100%" language={language === 'cpp' ? 'cpp' : language} value={code} onChange={v => setCode(v || '')} theme="vs-dark"
                options={{ minimap: { enabled: false }, fontSize, fontFamily: "'Fira Code','Consolas',monospace", lineNumbers: 'on', scrollBeyondLastLine: false, automaticLayout: true, padding: { top: 12, bottom: 12 }, tabSize: language === 'python' ? 4 : 2, bracketPairColorization: { enabled: true }, smoothScrolling: true, cursorBlinking: 'smooth', renderLineHighlight: 'line' }}
              />
            </div>
            {showConsole && (
              <>
                <div className="h-[5px] flex-shrink-0 cursor-row-resize bg-[#1a1a2e] hover:bg-[#ffa11640] active:bg-[#ffa11660] transition-colors" onMouseDown={startVResize} />
                <div style={{ height: `${100 - editorHeight}%` }} className="overflow-hidden">
                  <TestCasePanel testCases={visibleTestCases} activeCase={activeTestCase} setActiveCase={setActiveTestCase} runResult={runResult} submitResult={submitResult} activeTab={bottomTab} setActiveTab={setBottomTab} customCases={[]} setCustomCases={() => {}} onAddCase={() => {}} onRemoveCase={() => {}} />
                </div>
              </>
            )}
          </div>

          <div className="h-[36px] flex-shrink-0 flex items-center justify-between px-3 bg-[#282828] border-t border-[#3c3c3c]">
            <button onClick={() => setShowConsole(c => !c)} className="flex items-center gap-1.5 text-xs text-[#eff1f680] hover:text-[#eff1f6] transition">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 17l6-5-6-5M12 19h8"/></svg>Console
            </button>
            <div className="text-[10px] text-[#eff1f650]">Ctrl+Enter: Run • Ctrl+Shift+Enter: Submit</div>
          </div>
        </div>
      </div>

      <style>{`.lc-scroll::-webkit-scrollbar{width:6px}.lc-scroll::-webkit-scrollbar-track{background:transparent}.lc-scroll::-webkit-scrollbar-thumb{background:#ffffff20;border-radius:3px}`}</style>
    </div>
  );
}
