import { useNavigate } from 'react-router-dom';
import { Code2, Zap, Trophy, Users, ArrowRight, Moon, Sun, Target, Award, Rocket, Star, CheckCircle2, Swords, Brain } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';

export default function Landing() {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useThemeStore();

  return (
    <div className={`min-h-screen transition-colors duration-200 ${isDark ? 'bg-dark-950' : 'bg-white'}`}>
      {/* Header */}
      <header className={`${isDark ? 'bg-dark-900 border-dark-800' : 'bg-white border-gray-200'} border-b sticky top-0 z-50 backdrop-blur-sm bg-opacity-90`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 ${isDark ? 'bg-dark-800' : 'bg-gray-100'} rounded-lg`}>
                <Code2 className={`w-5 h-5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`} />
              </div>
              <span className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                CodeBattle
              </span>
            </div>
            <div className="flex items-center gap-4">
              <a href="#features" className={`hidden md:block text-sm font-medium ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition`}>
                Features
              </a>
              <a href="#how-it-works" className={`hidden md:block text-sm font-medium ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition`}>
                How it Works
              </a>
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg ${isDark ? 'bg-dark-800 hover:bg-dark-700' : 'bg-gray-100 hover:bg-gray-200'} transition`}
                aria-label="Toggle theme"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <button
                onClick={() => navigate('/login')}
                className={`px-4 py-2 text-sm font-medium rounded-lg ${isDark ? 'text-gray-300 hover:bg-dark-800' : 'text-gray-700 hover:bg-gray-100'} transition`}
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/register')}
                className="px-4 py-2 text-sm font-medium bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className={`relative py-20 sm:py-24 lg:py-32 ${isDark ? 'bg-dark-950' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              A better way to practice
              <span className={`block ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                competitive programming
              </span>
            </h1>
            <p className={`text-lg sm:text-xl mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'} max-w-2xl mx-auto`}>
              Master data structures and algorithms through real-time coding battles.
              Track your progress, compete with peers, and prepare for technical interviews.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/register')}
                className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition inline-flex items-center justify-center gap-2"
              >
                Start Practicing
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate('/login')}
                className={`px-6 py-3 rounded-lg font-medium transition inline-flex items-center justify-center gap-2 ${isDark ? 'bg-dark-800 hover:bg-dark-700 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'}`}
              >
                Sign In
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>1000+</div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Coding Problems</div>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>100</div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Active Users</div>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>24/7</div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Live Battles</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className={`py-20 ${isDark ? 'bg-dark-900' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-3xl sm:text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Everything you need to excel
            </h2>
            <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'} max-w-2xl mx-auto`}>
              Practice, compete, and improve with our comprehensive platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Swords,
                title: 'Real-Time Battles',
                desc: 'Compete head-to-head with other developers in live coding matches'
              },
              {
                icon: Trophy,
                title: 'ELO Rating',
                desc: 'Track your progress with a Chess.com-style rating system'
              },
              {
                icon: Target,
                title: 'Daily Challenges',
                desc: 'Solve curated problems every day to sharpen your skills'
              },
              {
                icon: Users,
                title: 'Friend Challenges',
                desc: 'Challenge friends directly with custom invitation links'
              },
              {
                icon: Award,
                title: 'Contests',
                desc: 'Participate in timed contests and climb the leaderboard'
              },
              {
                icon: Brain,
                title: 'AI Hints',
                desc: 'Get intelligent hints when stuck on a problem'
              }
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className={`p-6 rounded-lg ${isDark ? 'bg-dark-800 border border-dark-700' : 'bg-white border border-gray-200'}`}
                >
                  <Icon className={`w-8 h-8 mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                  <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {feature.title}
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {feature.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className={`py-20 ${isDark ? 'bg-dark-950' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-3xl sm:text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              How it works
            </h2>
            <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Get started in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                step: '01',
                title: 'Create Account',
                desc: 'Sign up and complete your profile to join the community'
              },
              {
                step: '02',
                title: 'Choose Mode',
                desc: 'Practice solo, challenge friends, or join matchmaking'
              },
              {
                step: '03',
                title: 'Start Coding',
                desc: 'Solve problems, compete in battles, and track your progress'
              }
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div className={`text-5xl font-bold mb-4 ${isDark ? 'text-dark-700' : 'text-gray-200'}`}>
                  {item.step}
                </div>
                <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {item.title}
                </h3>
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`py-20 ${isDark ? 'bg-dark-900' : 'bg-gray-50'}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className={`text-3xl sm:text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Ready to level up your coding skills?
          </h2>
          <p className={`text-lg mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Join developers worldwide and start competing today
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/register')}
              className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition inline-flex items-center justify-center gap-2"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/login')}
              className={`px-6 py-3 rounded-lg font-medium transition inline-flex items-center justify-center gap-2 ${isDark ? 'bg-dark-800 hover:bg-dark-700 text-white' : 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-300'}`}
            >
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`${isDark ? 'bg-dark-950 border-dark-800' : 'bg-white border-gray-200'} border-t py-12`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 ${isDark ? 'bg-dark-800' : 'bg-gray-100'} rounded-lg`}>
                <Code2 className={`w-5 h-5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`} />
              </div>
              <span className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                CodeBattle
              </span>
            </div>
            <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
              © 2025 CodeBattle. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className={`text-sm transition ${isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'}`}>
                Privacy
              </a>
              <a href="#" className={`text-sm transition ${isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'}`}>
                Terms
              </a>
              <a href="#" className={`text-sm transition ${isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'}`}>
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

