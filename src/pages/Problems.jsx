import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import axios from 'axios';
import { ChevronLeft, Search, BarChart3, ChevronDown, ChevronUp, Building2, ListChecks, TrendingUp, CheckCircle2, Code2, Filter, X, Sparkles, Award } from 'lucide-react';
import { toast } from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Problems() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedList, setSelectedList] = useState('');
  const [selectedFrequency, setSelectedFrequency] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sortBy, setSortBy] = useState('acceptance');
  
  // Sidebar collapse states
  const [companiesExpanded, setCompaniesExpanded] = useState(true);
  const [listsExpanded, setListsExpanded] = useState(true);
  const [frequencyExpanded, setFrequencyExpanded] = useState(true);
  const [statusExpanded, setStatusExpanded] = useState(true);
  const [difficultyExpanded, setDifficultyExpanded] = useState(true);

  const companies = ['Google', 'Meta', 'Amazon', 'Microsoft', 'Apple', 'Netflix', 'Tesla', 'Adobe', 'Bloomberg', 'Uber', 'LinkedIn', 'Oracle', 'Salesforce', 'Twitter'];
  const lists = ['Top 100 Liked', 'Blind 75', 'NeetCode 150', 'Top Interview Questions', 'Beginner Friendly', 'Amazon Top 50', 'Google Top 50', 'Meta Top 50', 'Microsoft Top 50', 'Apple Top 50'];
  const frequencies = ['6 Months', '1 Year', '2 Years', 'All Time'];
  const statuses = ['Solved', 'Unsolved'];
  const difficulties = ['Easy', 'Medium', 'Hard'];

  useEffect(() => {
    fetchProblems();
  }, [selectedDifficulty, selectedCompany, selectedList, selectedFrequency, selectedStatus, searchQuery, sortBy]);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch all problems
      const problemsResponse = await axios.get(`${API_URL}/problems`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      let allProblems = problemsResponse.data;

      // Fetch metadata for each problem and merge
      const problemsWithMetadata = await Promise.all(
        allProblems.map(async (problem) => {
          try {
            const metadataResponse = await axios.get(`${API_URL}/problem-metadata/${problem._id}`);
            return { ...problem, metadata: metadataResponse.data };
          } catch (error) {
            return { ...problem, metadata: null };
          }
        })
      );

      let filteredProblems = problemsWithMetadata;

      // Apply filters
      if (searchQuery) {
        filteredProblems = filteredProblems.filter(p =>
          p.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      if (selectedDifficulty) {
        filteredProblems = filteredProblems.filter(p => p.difficulty === selectedDifficulty);
      }

      if (selectedCompany) {
        filteredProblems = filteredProblems.filter(p =>
          p.metadata?.companies?.some(c => c.name === selectedCompany)
        );
      }

      if (selectedList) {
        filteredProblems = filteredProblems.filter(p =>
          p.metadata?.lists?.includes(selectedList)
        );
      }

      if (selectedFrequency) {
        filteredProblems = filteredProblems.filter(p => {
          const freq = getFrequencyValue(p.metadata?.frequencyData);
          return freq > 0;
        });
      }

      if (selectedStatus === 'Solved') {
        // Mock - in real app would check user's solved problems
        filteredProblems = filteredProblems.filter((_, idx) => idx % 3 === 0);
      } else if (selectedStatus === 'Unsolved') {
        filteredProblems = filteredProblems.filter((_, idx) => idx % 3 !== 0);
      }

      // Sort problems
      filteredProblems.sort((a, b) => {
        if (sortBy === 'acceptance') {
          return (b.acceptanceRate || 0) - (a.acceptanceRate || 0);
        } else if (sortBy === 'difficulty') {
          const diffOrder = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };
          return diffOrder[a.difficulty] - diffOrder[b.difficulty];
        } else if (sortBy === 'submissions') {
          return (b.totalSubmissions || 0) - (a.totalSubmissions || 0);
        } else if (sortBy === 'frequency') {
          const freqA = getFrequencyValue(a.metadata?.frequencyData);
          const freqB = getFrequencyValue(b.metadata?.frequencyData);
          return freqB - freqA;
        }
        return 0;
      });

      setProblems(filteredProblems);
    } catch (error) {
      console.error('Failed to fetch problems:', error);
      toast.error('Failed to load problems');
    } finally {
      setLoading(false);
    }
  };

  const getFrequencyValue = (frequencyData) => {
    if (!frequencyData) return 0;
    if (selectedFrequency === '6 Months') return frequencyData.sixMonths || 0;
    if (selectedFrequency === '1 Year') return frequencyData.oneYear || 0;
    if (selectedFrequency === '2 Years') return frequencyData.twoYears || 0;
    if (selectedFrequency === 'All Time') return frequencyData.allTime || 0;
    return frequencyData.allTime || 0;
  };

  const handleProblemClick = (problemId) => {
    navigate(`/match/solo?problemId=${problemId}`);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy':
        return 'text-green-400';
      case 'Medium':
        return 'text-yellow-400';
      case 'Hard':
        return 'text-red-400';
      default:
        return 'text-slate-400';
    }
  };

  const activeFiltersCount = [selectedDifficulty, selectedCompany, selectedList, selectedFrequency, selectedStatus].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-slate-800 rounded-lg transition-all hover:scale-105"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg shadow-indigo-500/30">
                <Code2 className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Practice Problems
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-slate-300 font-medium">{user?.username}</span>
          </div>
        </div>
      </header>

      {/* Main Content with Sidebar */}
      <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
        <div className="flex gap-6">
          {/* Sidebar - Filters */}
          <div className="w-72 flex-shrink-0">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 sticky top-24 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                    <Filter className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-lg font-bold">Filters</h2>
                </div>
                {activeFiltersCount > 0 && (
                  <span className="px-2 py-1 bg-indigo-500/20 border border-indigo-500/30 rounded-full text-xs font-semibold text-indigo-300">
                    {activeFiltersCount}
                  </span>
                )}
              </div>
              
              {/* Companies Filter */}
              <div className="mb-5">
                <button
                  onClick={() => setCompaniesExpanded(!companiesExpanded)}
                  className="flex items-center justify-between w-full text-sm font-semibold mb-3 hover:text-indigo-400 transition-all group"
                >
                  <span className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    Companies
                  </span>
                  {companiesExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {companiesExpanded && (
                  <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar">
                    {companies.map(company => (
                      <button
                        key={company}
                        onClick={() => setSelectedCompany(selectedCompany === company ? '' : company)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                          selectedCompany === company
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                            : 'hover:bg-slate-700/50 text-slate-300'
                        }`}
                      >
                        {company}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Lists Filter */}
              <div className="mb-5">
                <button
                  onClick={() => setListsExpanded(!listsExpanded)}
                  className="flex items-center justify-between w-full text-sm font-semibold mb-3 hover:text-indigo-400 transition-all group"
                >
                  <span className="flex items-center gap-2">
                    <ListChecks className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    Lists
                  </span>
                  {listsExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {listsExpanded && (
                  <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar">
                    {lists.map(list => (
                      <button
                        key={list}
                        onClick={() => setSelectedList(selectedList === list ? '' : list)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                          selectedList === list
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                            : 'hover:bg-slate-700/50 text-slate-300'
                        }`}
                      >
                        {list}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Frequency Filter */}
              <div className="mb-5">
                <button
                  onClick={() => setFrequencyExpanded(!frequencyExpanded)}
                  className="flex items-center justify-between w-full text-sm font-semibold mb-3 hover:text-indigo-400 transition-all group"
                >
                  <span className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    Frequency
                  </span>
                  {frequencyExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {frequencyExpanded && (
                  <div className="space-y-1">
                    {frequencies.map(freq => (
                      <button
                        key={freq}
                        onClick={() => setSelectedFrequency(selectedFrequency === freq ? '' : freq)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                          selectedFrequency === freq
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                            : 'hover:bg-slate-700/50 text-slate-300'
                        }`}
                      >
                        {freq}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Status Filter */}
              <div className="mb-5">
                <button
                  onClick={() => setStatusExpanded(!statusExpanded)}
                  className="flex items-center justify-between w-full text-sm font-semibold mb-3 hover:text-indigo-400 transition-all group"
                >
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    Status
                  </span>
                  {statusExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {statusExpanded && (
                  <div className="space-y-1">
                    {statuses.map(status => (
                      <button
                        key={status}
                        onClick={() => setSelectedStatus(selectedStatus === status ? '' : status)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                          selectedStatus === status
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                            : 'hover:bg-slate-700/50 text-slate-300'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Difficulty Filter */}
              <div className="mb-5">
                <button
                  onClick={() => setDifficultyExpanded(!difficultyExpanded)}
                  className="flex items-center justify-between w-full text-sm font-semibold mb-3 hover:text-indigo-400 transition-all group"
                >
                  <span className="flex items-center gap-2">
                    <Award className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    Difficulty
                  </span>
                  {difficultyExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {difficultyExpanded && (
                  <div className="space-y-1">
                    {difficulties.map(diff => (
                      <button
                        key={diff}
                        onClick={() => setSelectedDifficulty(selectedDifficulty === diff ? '' : diff)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                          selectedDifficulty === diff
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                            : 'hover:bg-slate-700/50 text-slate-300'
                        }`}
                      >
                        {diff}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Clear Filters */}
              {activeFiltersCount > 0 && (
                <button
                  onClick={() => {
                    setSelectedCompany('');
                    setSelectedList('');
                    setSelectedFrequency('');
                    setSelectedStatus('');
                    setSelectedDifficulty('');
                    setSearchQuery('');
                  }}
                  className="w-full px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-lg text-sm font-semibold transition-all shadow-lg shadow-red-500/30 flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Clear All Filters
                </button>
              )}
            </div>
          </div>

          {/* Problems List */}
          <div className="flex-1">
            {/* Search Bar */}
            <div className="mb-6 animate-slide-down">
              <div className="relative">
                <Search className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search problems by title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-lg"
                />
              </div>
            </div>

            {/* Stats and Sort Options */}
            <div className="flex items-center justify-between mb-6">
              <div className="text-sm text-slate-400">
                Showing <span className="text-white font-semibold">{problems.length}</span> problems
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSortBy('acceptance')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    sortBy === 'acceptance'
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                      : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 border border-slate-700/50'
                  }`}
                >
                  Acceptance
                </button>
                <button
                  onClick={() => setSortBy('difficulty')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    sortBy === 'difficulty'
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                      : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 border border-slate-700/50'
                  }`}
                >
                  Difficulty
                </button>
                <button
                  onClick={() => setSortBy('frequency')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    sortBy === 'frequency'
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                      : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 border border-slate-700/50'
                  }`}
                >
                  Frequency
                </button>
              </div>
            </div>

            {/* Problems Table */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-slate-400">Loading problems...</p>
                </div>
              </div>
            ) : problems.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-xl font-semibold text-slate-300 mb-2">No problems found</p>
                <p className="text-slate-400">Try adjusting your filters or search query</p>
              </div>
            ) : (
              <div className="space-y-3">
                {problems.map((problem, idx) => (
                  <div
                    key={problem._id}
                    onClick={() => handleProblemClick(problem._id)}
                    className="relative overflow-hidden bg-slate-800/50 backdrop-blur-sm hover:bg-slate-800 border border-slate-700/50 hover:border-indigo-500/50 rounded-2xl p-5 cursor-pointer transition-all duration-300 group hover:scale-[1.02] shadow-lg hover:shadow-indigo-500/20"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-all"></div>
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex items-center justify-center w-10 h-10 bg-slate-700/50 rounded-lg font-bold text-slate-400 group-hover:bg-indigo-500/20 group-hover:text-indigo-400 transition-all">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-white group-hover:text-indigo-400 transition-all mb-1">
                            {problem.title}
                          </h3>
                          {problem.metadata?.companies && problem.metadata.companies.length > 0 && (
                            <div className="flex gap-2 mt-2">
                              {problem.metadata.companies.slice(0, 3).map(company => (
                                <span key={company.name} className="text-xs px-2 py-1 bg-slate-700/70 rounded-lg text-slate-300 font-medium">
                                  {company.name}
                                </span>
                              ))}
                              {problem.metadata.companies.length > 3 && (
                                <span className="text-xs px-2 py-1 bg-slate-700/70 rounded-lg text-slate-400">
                                  +{problem.metadata.companies.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-6 ml-4">
                        <span className={`px-3 py-1.5 rounded-lg text-sm font-bold ${
                          problem.difficulty === 'Easy' ? 'bg-green-500/20 text-green-300' :
                          problem.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' :
                          'bg-red-500/20 text-red-300'
                        }`}>
                          {problem.difficulty}
                        </span>
                        <div className="flex items-center gap-2 text-slate-400 text-sm bg-slate-700/50 px-3 py-1.5 rounded-lg">
                          <BarChart3 className="w-4 h-4" />
                          <span className="font-semibold">{problem.acceptanceRate || 0}%</span>
                        </div>
                        {selectedFrequency && problem.metadata?.frequencyData && (
                          <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                              style={{ width: `${Math.min(getFrequencyValue(problem.metadata.frequencyData), 100)}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

