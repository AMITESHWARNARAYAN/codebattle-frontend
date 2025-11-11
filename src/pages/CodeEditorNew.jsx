import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import Editor from '@monaco-editor/react';
import { toast } from 'react-hot-toast';
import { 
  Play, Send, ChevronLeft, ChevronRight, ChevronDown, Settings, 
  Clock, CheckCircle2, XCircle, Loader2, Code2, FileText, 
  MessageSquare, BarChart3, Lightbulb, BookOpen, ThumbsUp,
  Share2, Star, Eye, EyeOff, RotateCcw, Maximize2, Minimize2
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function CodeEditorNew() {
  const { problemId } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  const { isDark } = useThemeStore();
  const editorRef = useRef(null);

  // Problem data
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);

  // Editor state
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('cpp');
  const [fontSize, setFontSize] = useState(14);
  
  // UI state
  const [activeTab, setActiveTab] = useState('description'); // description, editorial, solutions, submissions
  const [leftPanelTab, setLeftPanelTab] = useState('description');
  const [consoleTab, setConsoleTab] = useState('testcase'); // testcase, result
  const [showConsole, setShowConsole] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Test execution
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [customInput, setCustomInput] = useState('');
  const [selectedTestCase, setSelectedTestCase] = useState(0);
  
  // Problem metadata
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [unlockedHints, setUnlockedHints] = useState([]);

  // Layout
  const [leftWidth, setLeftWidth] = useState(50);
  const [consoleHeight, setConsoleHeight] = useState(200);

  // Fetch problem
  useEffect(() => {
    fetchProblem();
  }, [problemId]);

  // Set initial code template
  useEffect(() => {
    if (problem?.functionSignature && !code) {
      setCode(problem.functionSignature[language] || '');
    }
  }, [problem, language]);

  const fetchProblem = async () => {
    try {
      const response = await fetch(`${API_URL}/problems/${problemId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setProblem(data);
    } catch (error) {
      toast.error('Failed to load problem');
      navigate('/problems');
    } finally {
      setLoading(false);
    }
  };

  const handleRunCode = async () => {
    if (!code.trim()) {
      toast.error('Please write some code first');
      return;
    }

    setRunning(true);
    setConsoleTab('result');
    
    try {
      const response = await fetch(`${API_URL}/judge/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          code,
          language,
          problemId,
          testCaseIndex: selectedTestCase
        })
      });

      const result = await response.json();
      setTestResults(result);

      if (result.status === 'Accepted') {
        toast.success('Test case passed!');
      } else {
        toast.error(result.status);
      }
    } catch (error) {
      toast.error('Failed to run code');
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!code.trim()) {
      toast.error('Please write some code first');
      return;
    }

    setSubmitting(true);
    setConsoleTab('result');

    try {
      const response = await fetch(`${API_URL}/judge/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          code,
          language,
          problemId
        })
      });

      const result = await response.json();
      setTestResults(result);

      if (result.status === 'Accepted') {
        toast.success('✅ Accepted!');
      } else {
        toast.error(`❌ ${result.status}`);
      }
    } catch (error) {
      toast.error('Failed to submit code');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    if (confirm('Reset to default code template?')) {
      setCode(problem?.functionSignature?.[language] || '');
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return isDark ? 'text-green-400' : 'text-green-600';
      case 'Medium': return isDark ? 'text-yellow-400' : 'text-yellow-600';
      case 'Hard': return isDark ? 'text-red-400' : 'text-red-600';
      default: return isDark ? 'text-gray-400' : 'text-gray-600';
    }
  };

  const bgColor = isDark ? 'bg-[#1a1a1a]' : 'bg-white';
  const borderColor = isDark ? 'border-gray-800' : 'border-gray-200';
  const textColor = isDark ? 'text-gray-100' : 'text-gray-900';
  const mutedText = isDark ? 'text-gray-400' : 'text-gray-600';
  const hoverBg = isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100';

  if (loading) {
    return (
      <div className={`min-h-screen ${bgColor} flex items-center justify-center`}>
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className={`h-screen flex flex-col ${bgColor} ${textColor}`}>
      {/* Header */}
      <header className={`border-b ${borderColor} px-4 py-2 flex items-center justify-between`}>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/problems')}
            className={`${hoverBg} p-2 rounded-lg transition`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <h1 className={`text-lg font-semibold ${textColor}`}>
              {problem?.title}
            </h1>
            <span className={`text-sm font-medium ${getDifficultyColor(problem?.difficulty)}`}>
              {problem?.difficulty}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Like */}
          <button
            onClick={() => setLiked(!liked)}
            className={`${hoverBg} p-2 rounded-lg transition ${liked ? 'text-blue-500' : mutedText}`}
          >
            <ThumbsUp className="w-5 h-5" fill={liked ? 'currentColor' : 'none'} />
          </button>

          {/* Bookmark */}
          <button
            onClick={() => setBookmarked(!bookmarked)}
            className={`${hoverBg} p-2 rounded-lg transition ${bookmarked ? 'text-yellow-500' : mutedText}`}
          >
            <Star className="w-5 h-5" fill={bookmarked ? 'currentColor' : 'none'} />
          </button>

          {/* Settings */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`${hoverBg} p-2 rounded-lg transition`}
          >
            <Settings className="w-5 h-5" />
          </button>

          {/* Fullscreen */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className={`${hoverBg} p-2 rounded-lg transition`}
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Problem Description */}
        <div 
          className={`border-r ${borderColor} overflow-hidden flex flex-col`}
          style={{ width: `${leftWidth}%` }}
        >
          {/* Tabs */}
          <div className={`border-b ${borderColor} flex`}>
            {['Description', 'Editorial', 'Solutions', 'Submissions'].map((tab) => (
              <button
                key={tab}
                onClick={() => setLeftPanelTab(tab.toLowerCase())}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition ${
                  leftPanelTab === tab.toLowerCase()
                    ? 'border-orange-500 text-orange-500'
                    : `border-transparent ${mutedText} ${hoverBg}`
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {leftPanelTab === 'description' && (
              <div className="space-y-6">
                {/* Problem Description */}
                <div>
                  <p className="text-sm leading-relaxed">{problem?.description}</p>
                </div>

                {/* Examples */}
                {problem?.examples?.map((example, idx) => (
                  <div key={idx} className={`${isDark ? 'bg-gray-900' : 'bg-gray-50'} rounded-lg p-4`}>
                    <p className="text-sm font-semibold mb-2">Example {idx + 1}:</p>
                    <div className="space-y-2 text-sm font-mono">
                      <div>
                        <span className={mutedText}>Input:</span> {example.input}
                      </div>
                      <div>
                        <span className={mutedText}>Output:</span> {example.output}
                      </div>
                      {example.explanation && (
                        <div>
                          <span className={mutedText}>Explanation:</span> {example.explanation}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Constraints */}
                {problem?.constraints && (
                  <div>
                    <h3 className="text-sm font-semibold mb-2">Constraints:</h3>
                    <ul className="text-sm space-y-1 list-disc list-inside">
                      {problem.constraints.split(',').map((constraint, idx) => (
                        <li key={idx} className={mutedText}>{constraint.trim()}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Topics */}
                {problem?.tags && problem.tags.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold mb-2">Topics:</h3>
                    <div className="flex flex-wrap gap-2">
                      {problem.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className={`px-3 py-1 text-xs rounded-full ${
                            isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Hints */}
                <div>
                  <button
                    onClick={() => setShowHints(!showHints)}
                    className={`flex items-center gap-2 text-sm font-semibold ${hoverBg} px-3 py-2 rounded-lg transition`}
                  >
                    <Lightbulb className="w-4 h-4" />
                    Hints ({unlockedHints.length}/3)
                    <ChevronRight className={`w-4 h-4 transition-transform ${showHints ? 'rotate-90' : ''}`} />
                  </button>
                  
                  {showHints && (
                    <div className="mt-2 space-y-2">
                      {[0, 1, 2].map((idx) => (
                        <div
                          key={idx}
                          className={`${isDark ? 'bg-gray-900' : 'bg-gray-50'} rounded-lg p-3`}
                        >
                          {unlockedHints.includes(idx) ? (
                            <p className="text-sm">Hint {idx + 1}: Think about using hash maps...</p>
                          ) : (
                            <button
                              onClick={() => setUnlockedHints([...unlockedHints, idx])}
                              className="text-sm text-orange-500 hover:text-orange-600 flex items-center gap-2"
                            >
                              <EyeOff className="w-4 h-4" />
                              Unlock Hint {idx + 1}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {leftPanelTab === 'editorial' && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold">Official Editorial</h2>
                <p className={`text-sm ${mutedText}`}>
                  Editorial will be available after you solve this problem or unlock it.
                </p>
                <button className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition">
                  Unlock Editorial (Premium)
                </button>
              </div>
            )}

            {leftPanelTab === 'solutions' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold">Solutions</h2>
                  <select className={`px-3 py-1.5 text-sm rounded-lg border ${borderColor} ${bgColor}`}>
                    <option>Most Voted</option>
                    <option>Most Recent</option>
                    <option>Fastest Runtime</option>
                  </select>
                </div>
                <p className={`text-sm ${mutedText}`}>
                  Community solutions will appear here after you solve the problem.
                </p>
              </div>
            )}

            {leftPanelTab === 'submissions' && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold">My Submissions</h2>
                <p className={`text-sm ${mutedText}`}>
                  Your submission history will appear here.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Resize Handle */}
        <div
          className={`w-1 cursor-col-resize ${hoverBg} transition`}
          onMouseDown={(e) => {
            const startX = e.clientX;
            const startWidth = leftWidth;

            const handleMouseMove = (e) => {
              const delta = ((e.clientX - startX) / window.innerWidth) * 100;
              const newWidth = Math.max(30, Math.min(70, startWidth + delta));
              setLeftWidth(newWidth);
            };

            const handleMouseUp = () => {
              document.removeEventListener('mousemove', handleMouseMove);
              document.removeEventListener('mouseup', handleMouseUp);
            };

            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
          }}
        />

        {/* Right Panel - Code Editor */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Editor Toolbar */}
          <div className={`border-b ${borderColor} px-4 py-2 flex items-center justify-between`}>
            <div className="flex items-center gap-2">
              {/* Language Selector */}
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className={`px-3 py-1.5 text-sm rounded-lg border ${borderColor} ${bgColor} font-medium`}
              >
                <option value="cpp">C++</option>
                <option value="java">Java</option>
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              {/* Font Size */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setFontSize(Math.max(12, fontSize - 2))}
                  className={`${hoverBg} px-2 py-1 rounded text-sm font-medium`}
                >
                  A-
                </button>
                <span className="text-sm px-2">{fontSize}px</span>
                <button
                  onClick={() => setFontSize(Math.min(24, fontSize + 2))}
                  className={`${hoverBg} px-2 py-1 rounded text-sm font-medium`}
                >
                  A+
                </button>
              </div>

              {/* Reset */}
              <button
                onClick={handleReset}
                className={`${hoverBg} p-2 rounded-lg transition`}
                title="Reset Code"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1 overflow-hidden">
            <Editor
              height="100%"
              language={language === 'cpp' ? 'cpp' : language}
              value={code}
              onChange={(value) => setCode(value || '')}
              theme={isDark ? 'vs-dark' : 'light'}
              options={{
                fontSize,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                automaticLayout: true,
                tabSize: 4,
                fontFamily: "'Fira Code', 'Consolas', 'Monaco', monospace",
                fontLigatures: true,
                cursorBlinking: 'smooth',
                smoothScrolling: true,
                formatOnPaste: true,
                formatOnType: true,
                suggestOnTriggerCharacters: true,
                quickSuggestions: true,
                bracketPairColorization: { enabled: true },
              }}
              onMount={(editor) => {
                editorRef.current = editor;
              }}
            />
          </div>

          {/* Console - Test Cases & Results */}
          {showConsole && (
            <>
              {/* Resize Handle */}
              <div
                className={`h-1 cursor-row-resize ${hoverBg} transition border-t ${borderColor}`}
                onMouseDown={(e) => {
                  const startY = e.clientY;
                  const startHeight = consoleHeight;

                  const handleMouseMove = (e) => {
                    const delta = startY - e.clientY;
                    const newHeight = Math.max(150, Math.min(400, startHeight + delta));
                    setConsoleHeight(newHeight);
                  };

                  const handleMouseUp = () => {
                    document.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleMouseUp);
                  };

                  document.addEventListener('mousemove', handleMouseMove);
                  document.addEventListener('mouseup', handleMouseUp);
                }}
              />

              <div
                className={`border-t ${borderColor} overflow-hidden flex flex-col`}
                style={{ height: `${consoleHeight}px` }}
              >
                {/* Console Tabs */}
                <div className={`border-b ${borderColor} flex items-center justify-between px-4`}>
                  <div className="flex">
                    <button
                      onClick={() => setConsoleTab('testcase')}
                      className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
                        consoleTab === 'testcase'
                          ? 'border-orange-500 text-orange-500'
                          : `border-transparent ${mutedText} ${hoverBg}`
                      }`}
                    >
                      Testcase
                    </button>
                    <button
                      onClick={() => setConsoleTab('result')}
                      className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
                        consoleTab === 'result'
                          ? 'border-orange-500 text-orange-500'
                          : `border-transparent ${mutedText} ${hoverBg}`
                      }`}
                    >
                      Test Result
                    </button>
                  </div>

                  <button
                    onClick={() => setShowConsole(false)}
                    className={`${hoverBg} p-1 rounded`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>

                {/* Console Content */}
                <div className="flex-1 overflow-y-auto p-4">
                  {consoleTab === 'testcase' && (
                    <div className="space-y-3">
                      {/* Test Case Selector */}
                      <div className="flex gap-2">
                        {problem?.testCases?.slice(0, 3).map((tc, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedTestCase(idx)}
                            className={`px-3 py-1.5 text-sm rounded transition ${
                              selectedTestCase === idx
                                ? 'bg-orange-500 text-white'
                                : `${isDark ? 'bg-gray-800' : 'bg-gray-200'} ${mutedText}`
                            }`}
                          >
                            Case {idx + 1}
                          </button>
                        ))}
                      </div>

                      {/* Test Case Input */}
                      <div>
                        <label className="text-sm font-medium mb-1 block">Input:</label>
                        <div className={`${isDark ? 'bg-gray-900' : 'bg-gray-50'} rounded p-3 font-mono text-sm`}>
                          {problem?.testCases?.[selectedTestCase]?.input}
                        </div>
                      </div>

                      {/* Expected Output */}
                      <div>
                        <label className="text-sm font-medium mb-1 block">Expected Output:</label>
                        <div className={`${isDark ? 'bg-gray-900' : 'bg-gray-50'} rounded p-3 font-mono text-sm`}>
                          {problem?.testCases?.[selectedTestCase]?.expectedOutput}
                        </div>
                      </div>
                    </div>
                  )}

                  {consoleTab === 'result' && (
                    <div className="space-y-3">
                      {testResults ? (
                        <>
                          {/* Status */}
                          <div className="flex items-center gap-2">
                            {testResults.status === 'Accepted' ? (
                              <>
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                                <span className="text-lg font-semibold text-green-500">Accepted</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-5 h-5 text-red-500" />
                                <span className="text-lg font-semibold text-red-500">{testResults.status}</span>
                              </>
                            )}
                          </div>

                          {/* Stats */}
                          {testResults.status === 'Accepted' && (
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className={`text-xs ${mutedText} mb-1`}>Runtime</p>
                                <p className="text-sm font-semibold">{testResults.executionTime}ms</p>
                                <p className="text-xs text-green-500">Beats 85.2%</p>
                              </div>
                              <div>
                                <p className={`text-xs ${mutedText} mb-1`}>Memory</p>
                                <p className="text-sm font-semibold">{testResults.memoryUsed?.toFixed(2)}MB</p>
                                <p className="text-xs text-green-500">Beats 72.4%</p>
                              </div>
                            </div>
                          )}

                          {/* Test Cases Passed */}
                          <div>
                            <p className="text-sm font-medium mb-1">
                              Test Cases: {testResults.testCasesPassed}/{testResults.totalTestCases}
                            </p>
                          </div>

                          {/* Output */}
                          {testResults.output && (
                            <div>
                              <label className="text-sm font-medium mb-1 block">Your Output:</label>
                              <div className={`${isDark ? 'bg-gray-900' : 'bg-gray-50'} rounded p-3 font-mono text-sm`}>
                                {testResults.output}
                              </div>
                            </div>
                          )}

                          {/* Error */}
                          {testResults.error && (
                            <div>
                              <label className="text-sm font-medium mb-1 block text-red-500">Error:</label>
                              <div className="bg-red-900/20 border border-red-500/30 rounded p-3 font-mono text-sm text-red-400">
                                {testResults.error}
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <p className={`text-sm ${mutedText}`}>
                          Run your code to see results here
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Bottom Action Bar */}
          <div className={`border-t ${borderColor} px-4 py-3 flex items-center justify-between`}>
            <div className="flex items-center gap-2">
              {!showConsole && (
                <button
                  onClick={() => setShowConsole(true)}
                  className={`${hoverBg} px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-2`}
                >
                  <Terminal className="w-4 h-4" />
                  Console
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Run Code */}
              <button
                onClick={handleRunCode}
                disabled={running}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
                  isDark 
                    ? 'bg-gray-800 hover:bg-gray-700 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                }`}
              >
                {running ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Run
                  </>
                )}
              </button>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
