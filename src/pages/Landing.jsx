import { useNavigate } from 'react-router-dom';
import { Code2, Zap, Trophy, Users, ArrowRight, Moon, Sun, Sparkles, Target, Award, Rocket, Star } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Landing() {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setIsDark(savedTheme === 'dark');
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    setIsDark(!isDark);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white' : 'bg-gradient-to-br from-white via-slate-50 to-white text-slate-900'}`}>
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
      </div>

      {/* Header */}
      <header className={`${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-200'} border-b sticky top-0 z-50 backdrop-blur-xl transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg shadow-indigo-500/30">
              <Code2 className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              CodeBattle
            </h1>
          </div>
          <div className="flex items-center gap-6">
            <a href="#features" className={`text-sm font-medium transition ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}>Features</a>
            <a href="#explore" className={`text-sm font-medium transition ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}>Explore</a>
            <a href="#stats" className={`text-sm font-medium transition ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}>Stats</a>
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition ${isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-200 hover:bg-slate-300'}`}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => navigate('/login')}
              className={`px-6 py-2 rounded-lg font-semibold transition ${isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-200 hover:bg-slate-300'}`}
            >
              Sign In
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className={`relative overflow-hidden py-32 ${isDark ? 'bg-transparent' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
          {/* Left Content */}
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/30 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span className="text-sm font-medium text-indigo-300">Limited to 100 Elite Coders</span>
            </div>
            <h2 className="text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-white via-indigo-200 to-purple-200 bg-clip-text text-transparent">
                A New Way to
              </span>
              <br />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Master Coding
              </span>
            </h2>
            <p className={`text-xl mb-8 leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              CodeBattle is the ultimate platform to enhance your skills, expand your knowledge, and prepare for technical interviews through competitive coding battles.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate('/register')}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold flex items-center justify-center gap-2 transition-all duration-200 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transform hover:scale-105"
              >
                Start Your Journey <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigate('/login')}
                className={`px-8 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${isDark ? 'bg-slate-800/50 hover:bg-slate-800 border border-slate-700' : 'bg-white border border-slate-300 hover:border-slate-400'}`}
              >
                Sign In <Rocket className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Right Illustration */}
          <div className="relative h-96 lg:h-[500px] animate-slide-up">
            <div className={`absolute inset-0 rounded-3xl ${isDark ? 'bg-gradient-to-br from-slate-800/50 to-slate-900/50' : 'bg-gradient-to-br from-slate-100 to-slate-200'} backdrop-blur-sm shadow-2xl overflow-hidden border ${isDark ? 'border-slate-700/50' : 'border-slate-300'}`}>
              {/* Animated code blocks */}
              <div className="absolute inset-0 flex items-center justify-center p-8">
                <div className="grid grid-cols-2 gap-6 w-full">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 transform hover:scale-105 transition-all duration-300 animate-fade-in">
                    <Trophy className="w-10 h-10 text-white mb-3" />
                    <p className="text-white font-bold text-lg">ELO Rating</p>
                    <p className="text-blue-100 text-sm">Track Progress</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-xl p-6 transform hover:scale-105 transition-all duration-300 animate-fade-in delay-100">
                    <Zap className="w-10 h-10 text-white mb-3" />
                    <p className="text-white font-bold text-lg">Live Battles</p>
                    <p className="text-green-100 text-sm">Real-time</p>
                  </div>
                  <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl shadow-xl p-6 transform hover:scale-105 transition-all duration-300 animate-fade-in delay-200">
                    <Target className="w-10 h-10 text-white mb-3" />
                    <p className="text-white font-bold text-lg">Challenges</p>
                    <p className="text-yellow-100 text-sm">Daily Tasks</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-xl p-6 transform hover:scale-105 transition-all duration-300 animate-fade-in delay-300">
                    <Users className="w-10 h-10 text-white mb-3" />
                    <p className="text-white font-bold text-lg">Community</p>
                    <p className="text-purple-100 text-sm">100 Coders</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className={`py-20 relative ${isDark ? 'bg-slate-900/50' : 'bg-slate-50/50'} backdrop-blur-sm`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className={`p-8 rounded-2xl text-center ${isDark ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-white border border-slate-200'} backdrop-blur-sm`}>
              <div className="text-5xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-2">100</div>
              <p className={`text-lg font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Elite Coders</p>
              <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Exclusive Community</p>
            </div>
            <div className={`p-8 rounded-2xl text-center ${isDark ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-white border border-slate-200'} backdrop-blur-sm`}>
              <div className="text-5xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-2">1000+</div>
              <p className={`text-lg font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Challenges</p>
              <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Coding Problems</p>
            </div>
            <div className={`p-8 rounded-2xl text-center ${isDark ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-white border border-slate-200'} backdrop-blur-sm`}>
              <div className="text-5xl font-bold bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent mb-2">24/7</div>
              <p className={`text-lg font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Live Battles</p>
              <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Always Available</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className={`py-24 relative ${isDark ? 'bg-transparent' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full mb-4">
              <Star className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-purple-300">Premium Features</span>
            </div>
            <h2 className="text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Everything You Need
              </span>
            </h2>
            <p className={`text-xl max-w-2xl mx-auto ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              A well-organized platform that helps you get the most out of your coding journey
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                gradient: 'from-blue-500 to-cyan-500',
                title: 'Real-Time Matches',
                desc: 'Compete live with other developers in real-time coding battles with instant feedback'
              },
              {
                icon: Trophy,
                gradient: 'from-yellow-500 to-orange-500',
                title: 'ELO Rating System',
                desc: 'Track your skill progression with our Chess.com-style advanced rating algorithm'
              },
              {
                icon: Users,
                gradient: 'from-purple-500 to-pink-500',
                title: 'Friend Challenges',
                desc: 'Challenge your friends directly via invitation links and prove your coding skills'
              },
              {
                icon: Target,
                gradient: 'from-green-500 to-emerald-500',
                title: 'Daily Challenges',
                desc: 'Solve new problems every day to keep your skills sharp and earn rewards'
              },
              {
                icon: Award,
                gradient: 'from-indigo-500 to-purple-500',
                title: 'Contests & Tournaments',
                desc: 'Participate in scheduled contests and compete for top positions on leaderboards'
              },
              {
                icon: Sparkles,
                gradient: 'from-pink-500 to-rose-500',
                title: 'AI-Powered Hints',
                desc: 'Get intelligent hints and explanations powered by advanced AI when you need help'
              }
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className={`group p-8 rounded-2xl transition-all duration-300 transform hover:scale-105 ${isDark ? 'bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600' : 'bg-white hover:shadow-2xl border border-slate-200 hover:border-slate-300'} backdrop-blur-sm`}
                >
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 shadow-lg group-hover:shadow-xl transition-shadow`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`py-32 relative overflow-hidden ${isDark ? 'bg-gradient-to-br from-slate-900 to-slate-950' : 'bg-gradient-to-br from-slate-50 to-white'}`}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/30 rounded-full mb-6">
            <Rocket className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-medium text-indigo-300">Join the Elite</span>
          </div>
          <h3 className="text-5xl lg:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Ready to Start Coding?
            </span>
          </h3>
          <p className={`text-xl mb-10 max-w-2xl mx-auto ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            Join an exclusive community of 100 elite developers improving their skills through competitive coding battles.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/register')}
              className="px-10 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-lg flex items-center justify-center gap-2 transition-all duration-200 shadow-2xl shadow-indigo-500/40 hover:shadow-indigo-500/60 transform hover:scale-105"
            >
              Get Started Now <ArrowRight className="w-6 h-6" />
            </button>
            <button
              onClick={() => navigate('/login')}
              className={`px-10 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all duration-200 ${isDark ? 'bg-slate-800/50 hover:bg-slate-800 border-2 border-slate-700 hover:border-slate-600' : 'bg-white border-2 border-slate-300 hover:border-slate-400 shadow-lg'}`}
            >
              Sign In
            </button>
          </div>

          {/* Trust indicators */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className={`text-3xl font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>100</div>
              <div className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>Max Users</div>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>24/7</div>
              <div className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>Support</div>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>∞</div>
              <div className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>Challenges</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`${isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'} border-t py-12 relative z-10`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg shadow-indigo-500/30">
                <Code2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                CodeBattle
              </span>
            </div>
            <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
              © 2025 CodeBattle. All rights reserved. Built for elite coders.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className={`text-sm transition ${isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-600 hover:text-slate-900'}`}>Privacy</a>
              <a href="#" className={`text-sm transition ${isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-600 hover:text-slate-900'}`}>Terms</a>
              <a href="#" className={`text-sm transition ${isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-600 hover:text-slate-900'}`}>Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

