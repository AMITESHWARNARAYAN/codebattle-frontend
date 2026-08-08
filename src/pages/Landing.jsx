import { useNavigate } from 'react-router-dom';
import { useThemeStore } from '../store/themeStore';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const LANGUAGES = {
  javascript: {
    label: 'JavaScript',
    filename: 'twoSum.js',
    template: `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}

console.log(JSON.stringify(twoSum([2, 7, 11, 15], 9)));
`
  },
  python: {
    label: 'Python 3',
    filename: 'two_sum.py',
    template: `def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []

print(two_sum([2, 7, 11, 15], 9))
`
  },
  cpp: {
    label: 'C++',
    filename: 'two_sum.cpp',
    template: `#include <iostream>
#include <vector>
#include <unordered_map>
using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    unordered_map<int, int> seen;
    for (int i = 0; i < nums.size(); ++i) {
        int complement = target - nums[i];
        if (seen.count(complement)) {
            return {seen[complement], i};
        }
        seen[nums[i]] = i;
    }
    return {};
}

int main() {
    vector<int> nums = {2, 7, 11, 15};
    vector<int> result = twoSum(nums, 9);
    cout << "[" << result[0] << ", " << result[1] << "]" << endl;
    return 0;
}
`
  }
};

export default function Landing() {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useThemeStore();
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [code, setCode] = useState(LANGUAGES.javascript.template);
  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    fetch(`${API_URL}/auth/registration-status`)
      .then((res) => {
        if (!res.ok) throw new Error('Offline');
        return res.json();
      })
      .then((data) => {
        if (data && typeof data.totalUsers === 'number') {
          setTotalUsers(data.totalUsers);
        } else {
          setTotalUsers(0);
        }
      })
      .catch(() => {
        setTotalUsers(0);
      });
  }, []);

  const handleLanguageChange = (lang) => {
    setSelectedLanguage(lang);
    setCode(LANGUAGES[lang].template);
    setOutput(null);
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput(null);
    try {
      const response = await fetch(`${API_URL}/judge/run-public`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language: selectedLanguage })
      });

      if (!response.ok) throw new Error('Failed to run code');
      const result = await response.json();
      setOutput(result);
      if (result.error) {
        toast.error('Code execution error');
      } else {
        toast.success('Code executed successfully');
      }
    } catch (error) {
      toast.error('Failed to run code');
      setOutput({ error: error.message || 'Execution error' });
    } finally {
      setIsRunning(false);
    }
  };

  const bgColor = isDark ? 'bg-slate-950' : 'bg-white';
  const textColor = isDark ? 'text-white' : 'text-slate-900';
  const textMuted = isDark ? 'text-slate-400' : 'text-slate-600';
  const borderColor = isDark ? 'border-slate-800' : 'border-slate-200';
  const cardBg = isDark ? 'bg-slate-900/60' : 'bg-slate-50';

  return (
    <div className={`min-h-screen ${bgColor} transition-colors duration-200 font-sans`}>
      {/* Header Navigation */}
      <header className={`${isDark ? 'bg-slate-950/90' : 'bg-white/90'} border-b ${borderColor} sticky top-0 z-50 backdrop-blur-md`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600 bg-clip-text text-transparent">
                CodeBattle
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-orange-500/10 text-orange-500 rounded border border-orange-500/20">
                Platform
              </span>
            </div>

            {/* Navigation Links */}
            <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold uppercase tracking-wider">
              <button onClick={() => navigate('/problems')} className={`${textMuted} hover:text-orange-500 transition-colors`}>
                Problems
              </button>
              <button onClick={() => navigate('/contests')} className={`${textMuted} hover:text-orange-500 transition-colors`}>
                Contests
              </button>
              <button onClick={() => navigate('/matchmaking')} className={`${textMuted} hover:text-orange-500 transition-colors`}>
                1v1 Battles
              </button>
              <button onClick={() => navigate('/friend-challenge')} className={`${textMuted} hover:text-orange-500 transition-colors`}>
                Challenge Friend
              </button>
              <button onClick={() => navigate('/daily-challenge')} className={`${textMuted} hover:text-orange-500 transition-colors`}>
                Daily Challenge
              </button>
              <button onClick={() => navigate('/leaderboard')} className={`${textMuted} hover:text-orange-500 transition-colors`}>
                Leaderboard
              </button>
              <button onClick={() => navigate('/stories')} className={`${textMuted} hover:text-orange-500 transition-colors`}>
                Stories
              </button>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${borderColor} ${textMuted} hover:text-orange-500 transition-colors`}
              >
                {isDark ? 'Light' : 'Dark'}
              </button>
              <button
                onClick={() => navigate('/login')}
                className={`text-xs font-semibold px-3.5 py-1.5 ${textMuted} hover:text-orange-500 transition-colors`}
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/register')}
                className="text-xs font-bold px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-all shadow-md shadow-orange-500/20"
              >
                Get Started
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-16 sm:py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Hero Left */}
            <div>
              <div className="inline-block px-3 py-1 rounded-full bg-orange-500/10 text-orange-500 border border-orange-500/20 text-xs font-bold uppercase tracking-widest mb-6">
                Competitive Programming & DSA Platform
              </div>

              <h1 className={`text-4xl sm:text-6xl font-black tracking-tight leading-none mb-6 ${textColor}`}>
                Code. Battle.{' '}
                <span className="block mt-2 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600 bg-clip-text text-transparent">
                  Dominate.
                </span>
              </h1>

              <p className={`text-base sm:text-lg mb-8 ${textMuted} max-w-xl leading-relaxed`}>
                Master algorithms with real-time 1v1 matchmaking, LeetCode-style weekly contests, Monaco code editor, daily streaks, and global leaderboards. Explore every feature freely without sign-up.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3.5 mb-10">
                <button
                  onClick={() => navigate('/problems')}
                  className="px-6 py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm rounded-xl transition shadow-lg shadow-orange-500/25 text-center"
                >
                  Explore Practice Problems
                </button>
                <button
                  onClick={() => navigate('/contests')}
                  className={`px-6 py-3.5 font-bold text-sm rounded-xl border ${borderColor} ${textColor} hover:border-orange-500 hover:text-orange-500 transition text-center`}
                >
                  View Weekly Contests
                </button>
              </div>

              {/* Real Platform Statistics */}
              <div className={`grid grid-cols-3 gap-6 pt-6 border-t ${borderColor}`}>
                <div>
                  <div className={`text-2xl sm:text-3xl font-black ${textColor}`}>500+</div>
                  <div className={`text-xs font-semibold uppercase tracking-wider ${textMuted} mt-1`}>DSA Problems</div>
                </div>
                <div>
                  <div className={`text-2xl sm:text-3xl font-black ${textColor}`}>{totalUsers}</div>
                  <div className={`text-xs font-semibold uppercase tracking-wider ${textMuted} mt-1`}>Active Coders</div>
                </div>
                <div>
                  <div className={`text-2xl sm:text-3xl font-black ${textColor}`}>24/7</div>
                  <div className={`text-xs font-semibold uppercase tracking-wider ${textMuted} mt-1`}>Live Contests</div>
                </div>
              </div>
            </div>

            {/* Hero Right - Interactive Playground */}
            <div className={`rounded-2xl border ${borderColor} ${cardBg} p-5 shadow-2xl relative`}>
              <div className={`flex items-center justify-between mb-4 pb-3 border-b ${borderColor}`}>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-orange-500">Live Code Playground</span>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => handleLanguageChange(e.target.value)}
                    className={`text-xs font-semibold px-2.5 py-1 rounded bg-slate-200 dark:bg-slate-800 border ${borderColor} ${textColor} outline-none cursor-pointer`}
                  >
                    {Object.entries(LANGUAGES).map(([key, lang]) => (
                      <option key={key} value={key}>
                        {lang.label} ({lang.filename})
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleRunCode}
                  disabled={isRunning}
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg font-bold text-xs transition shadow-sm disabled:opacity-50"
                >
                  {isRunning ? 'Running...' : 'Run Code'}
                </button>
              </div>

              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className={`w-full text-xs font-mono bg-transparent border-none outline-none resize-none ${textMuted}`}
                rows={13}
                spellCheck={false}
              />

              {output && (
                <div className={`mt-3 pt-3 border-t ${borderColor}`}>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Execution Result:</div>
                  {output.error ? (
                    <div className="text-xs p-3 rounded-lg font-mono bg-red-500/10 text-red-400 border border-red-500/20">
                      {output.error}
                    </div>
                  ) : (
                    <div className="text-xs p-3 rounded-lg font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {output.output || output.stdout || 'Finished execution'}
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      </section>




      <section className="py-16 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className={`text-3xl font-black mb-3 ${textColor}`}>Ready to test your algorithmic skills?</h2>
          <p className={`text-sm mb-6 ${textMuted}`}>
            Choose any section above or start practice right now. No registration required to view statements or test code.
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => navigate('/problems')}
              className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-orange-500/20"
            >
              Start Practice Now
            </button>
            <button
              onClick={() => navigate('/contests')}
              className={`px-6 py-3 font-bold text-xs uppercase tracking-wider rounded-xl border ${borderColor} ${textColor} hover:border-orange-500 transition`}
            >
              Browse Contests
            </button>
          </div>
        </div>
      </section>

      {/* Professional Text Footer */}
      <footer className={`border-t ${borderColor} py-10 ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8 text-xs">
            <div>
              <div className="font-bold uppercase tracking-wider text-orange-500 mb-3">Platform</div>
              <ul className="space-y-2 font-medium">
                <li><button onClick={() => navigate('/problems')} className={`${textMuted} hover:text-orange-500 transition-colors`}>Practice Problems</button></li>
                <li><button onClick={() => navigate('/contests')} className={`${textMuted} hover:text-orange-500 transition-colors`}>Weekly Contests</button></li>
                <li><button onClick={() => navigate('/matchmaking')} className={`${textMuted} hover:text-orange-500 transition-colors`}>1v1 Matchmaking</button></li>
              </ul>
            </div>
            <div>
              <div className="font-bold uppercase tracking-wider text-orange-500 mb-3">Explore</div>
              <ul className="space-y-2 font-medium">
                <li><button onClick={() => navigate('/daily-challenge')} className={`${textMuted} hover:text-orange-500 transition-colors`}>Daily Challenge</button></li>
                <li><button onClick={() => navigate('/leaderboard')} className={`${textMuted} hover:text-orange-500 transition-colors`}>Global Leaderboard</button></li>
                <li><button onClick={() => navigate('/stories')} className={`${textMuted} hover:text-orange-500 transition-colors`}>Developer Stories</button></li>
              </ul>
            </div>
            <div>
              <div className="font-bold uppercase tracking-wider text-orange-500 mb-3">Account</div>
              <ul className="space-y-2 font-medium">
                <li><button onClick={() => navigate('/login')} className={`${textMuted} hover:text-orange-500 transition-colors`}>Sign In</button></li>
                <li><button onClick={() => navigate('/register')} className={`${textMuted} hover:text-orange-500 transition-colors`}>Create Free Account</button></li>
              </ul>
            </div>
            <div>
              <div className="font-bold uppercase tracking-wider text-orange-500 mb-3">CodeBattle</div>
              <p className={`${textMuted} leading-relaxed font-medium`}>
                High-performance competitive programming environment built for developers worldwide.
              </p>
            </div>
          </div>

          <div className={`pt-6 border-t ${borderColor} flex flex-col sm:flex-row justify-between items-center gap-3 text-[11px] font-medium ${textMuted}`}>
            <div>© 2026 CodeBattle. All rights reserved.</div>
            <div className="flex gap-6">
              <button onClick={() => navigate('/stories')} className="hover:text-orange-500 transition-colors">Terms of Service</button>
              <button onClick={() => navigate('/stories')} className="hover:text-orange-500 transition-colors">Privacy Policy</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
