import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useAdminStore } from '../store/adminStore';
import { toast } from 'react-hot-toast';
import { Plus, Trash2, ArrowLeft, Tags, Check, X, Calendar, Trophy } from 'lucide-react';

export default function Admin() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { problems, categories, stats, loading, getProblems, createProblem, deleteProblem, getStats, createCategory, getCategories, deleteCategory, createChallenge, getChallenges, challenges, deleteChallenge, createContest, getContests, contests, deleteContest } = useAdminStore();
  const { token } = useAuthStore();
  const [activeTab, setActiveTab] = useState('problems');
  const [showForm, setShowForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showChallengeForm, setShowChallengeForm] = useState(false);
  const [showContestForm, setShowContestForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'Medium',
    tags: '',
    constraints: '',
    examples: '[]',
    testCases: '[]',
    functionSignature: '{}',
    timeLimit: 2000,
    memoryLimit: 256,
    solutionLink: '',
    category: ''
  });
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    description: '',
    icon: '📚',
    color: 'indigo'
  });
  const [challengeFormData, setChallengeFormData] = useState({
    title: '',
    description: '',
    problemId: '',
    challengeType: 'global',
    startDate: '',
    endDate: '',
    difficulty: 'Medium',
    rewards: { points: 100, badge: '' }
  });
  const [contestFormData, setContestFormData] = useState({
    title: '',
    description: '',
    type: 'weekly',
    problems: [],
    startTime: '',
    duration: 120,
    rules: '',
    prizes: '',
    isRated: true
  });
  const [selectedProblems, setSelectedProblems] = useState([]);

  // Check if user is admin
  useEffect(() => {
    if (!user?.isAdmin) {
      navigate('/');
      toast.error('Admin access required');
    }
  }, [user, navigate]);

  // Load problems, categories and stats
  useEffect(() => {
    if (token) {
      getProblems();
      getCategories();
      getStats();
      if (activeTab === 'challenges') {
        getChallenges();
      }
      if (activeTab === 'contests') {
        getContests();
      }
    }
  }, [token, getProblems, getCategories, getStats, activeTab]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Parse JSON fields
      const problemData = {
        ...formData,
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
        examples: JSON.parse(formData.examples),
        testCases: JSON.parse(formData.testCases),
        functionSignature: JSON.parse(formData.functionSignature),
        timeLimit: parseInt(formData.timeLimit),
        memoryLimit: parseInt(formData.memoryLimit)
      };

      await createProblem(problemData);
      toast.success('Problem created successfully!');

      setShowForm(false);
      setFormData({
        title: '',
        description: '',
        difficulty: 'Medium',
        tags: '',
        constraints: '',
        examples: '[]',
        testCases: '[]',
        functionSignature: '{}',
        timeLimit: 2000,
        memoryLimit: 256,
        solutionLink: ''
      });
    } catch (error) {
      toast.error('Failed to create problem');
    }
  };

  const handleDelete = async (problemId) => {
    if (window.confirm('Are you sure you want to delete this problem?')) {
      try {
        await deleteProblem(problemId);
        toast.success('Problem deleted successfully');
      } catch (error) {
        toast.error('Failed to delete problem');
      }
    }
  };

  const handleCategoryInputChange = (e) => {
    const { name, value } = e.target;
    setCategoryFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      await createCategory(categoryFormData);
      toast.success('Category created successfully!');
      setShowCategoryForm(false);
      setCategoryFormData({
        name: '',
        description: '',
        icon: '📚',
        color: 'indigo'
      });
    } catch (error) {
      toast.error('Failed to create category');
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await deleteCategory(categoryId);
        toast.success('Category deleted successfully');
      } catch (error) {
        toast.error('Failed to delete category');
      }
    }
  };

  const handleChallengeInputChange = (e) => {
    const { name, value } = e.target;
    setChallengeFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleChallengeSubmit = async (e) => {
    e.preventDefault();
    try {
      await createChallenge(challengeFormData);
      toast.success('Challenge created successfully!');
      setShowChallengeForm(false);
      setChallengeFormData({
        title: '',
        description: '',
        problemId: '',
        challengeType: 'global',
        startDate: '',
        endDate: '',
        difficulty: 'Medium',
        rewards: { points: 100, badge: '' }
      });
      getChallenges();
    } catch (error) {
      toast.error('Failed to create challenge');
    }
  };

  const handleContestInputChange = (e) => {
    const { name, value } = e.target;
    setContestFormData((prev) => ({
      ...prev,
      [name]: name === 'duration' ? parseInt(value) || 0 : value
    }));
  };

  const handleContestSubmit = async (e) => {
    e.preventDefault();
    try {
      // Format problems array for backend
      const formattedProblems = selectedProblems.map((problemId, index) => ({
        problemId,
        points: 100,
        order: index + 1
      }));

      // Format prizes - convert comma-separated string to array
      const prizesArray = contestFormData.prizes
        ? contestFormData.prizes.split(',').map(p => p.trim()).filter(p => p)
        : [];

      const contestPayload = {
        title: contestFormData.title,
        description: contestFormData.description,
        type: contestFormData.type,
        problems: formattedProblems,
        startTime: contestFormData.startTime,
        duration: parseInt(contestFormData.duration),
        rules: contestFormData.rules || '',
        prizes: prizesArray,
        isRated: contestFormData.isRated
      };

      console.log('Submitting contest:', contestPayload);

      await createContest(contestPayload);
      toast.success('Contest created successfully!');
      setShowContestForm(false);
      setContestFormData({
        title: '',
        description: '',
        type: 'weekly',
        problems: [],
        startTime: '',
        duration: 120,
        rules: '',
        prizes: '',
        isRated: true
      });
      setSelectedProblems([]);
      getContests();
    } catch (error) {
      console.error('Contest creation error:', error);
      toast.error(error.response?.data?.message || 'Failed to create contest');
    }
  };

  const handleProblemSelection = (problemId) => {
    setSelectedProblems(prev => {
      if (prev.includes(problemId)) {
        return prev.filter(id => id !== problemId);
      } else {
        return [...prev, problemId];
      }
    });
  };

  const handleDeleteChallenge = async (challengeId) => {
    if (window.confirm('Are you sure you want to delete this challenge?')) {
      try {
        await deleteChallenge(challengeId);
        toast.success('Challenge deleted successfully');
        getChallenges();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete challenge');
      }
    }
  };

  const handleDeleteContest = async (contestId) => {
    if (window.confirm('Are you sure you want to delete this contest?')) {
      try {
        await deleteContest(contestId);
        toast.success('Contest deleted successfully');
        getContests();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete contest');
      }
    }
  };

  if (!user?.isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="glass border-b border-slate-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-slate-800 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold">Admin Panel</h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/problem-metadata')}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition"
            >
              <Tags className="w-4 h-4" />
              Manage Metadata
            </button>
            <div className="text-sm text-slate-400">
              Welcome, {user?.username}
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-slate-700 px-6">
        <div className="max-w-7xl mx-auto flex gap-8">
          <button
            onClick={() => setActiveTab('categories')}
            className={`py-4 px-2 font-semibold border-b-2 transition ${
              activeTab === 'categories'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-300'
            }`}
          >
            Categories
          </button>
          <button
            onClick={() => setActiveTab('problems')}
            className={`py-4 px-2 font-semibold border-b-2 transition ${
              activeTab === 'problems'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-300'
            }`}
          >
            Problems
          </button>
          <button
            onClick={() => setActiveTab('challenges')}
            className={`py-4 px-2 font-semibold border-b-2 transition ${
              activeTab === 'challenges'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-300'
            }`}
          >
            Challenges
          </button>
          <button
            onClick={() => setActiveTab('contests')}
            className={`py-4 px-2 font-semibold border-b-2 transition ${
              activeTab === 'contests'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-300'
            }`}
          >
            Contests
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Categories Section */}
        {activeTab === 'categories' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Manage Categories</h2>
              <button
                onClick={() => setShowCategoryForm(!showCategoryForm)}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Category
              </button>
            </div>

            {/* Add Category Form */}
            {showCategoryForm && (
              <div className="glass border border-slate-700 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-bold mb-4">Create New Category</h3>
                <form onSubmit={handleCategorySubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="name"
                      placeholder="Category Name"
                      value={categoryFormData.name}
                      onChange={handleCategoryInputChange}
                      required
                      className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg"
                    />
                    <input
                      type="text"
                      name="icon"
                      placeholder="Icon (emoji)"
                      value={categoryFormData.icon}
                      onChange={handleCategoryInputChange}
                      className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg"
                    />
                  </div>

                  <textarea
                    name="description"
                    placeholder="Category Description"
                    value={categoryFormData.description}
                    onChange={handleCategoryInputChange}
                    required
                    rows="3"
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg"
                  />

                  <select
                    name="color"
                    value={categoryFormData.color}
                    onChange={handleCategoryInputChange}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg"
                  >
                    <option value="indigo">Indigo</option>
                    <option value="blue">Blue</option>
                    <option value="purple">Purple</option>
                    <option value="pink">Pink</option>
                    <option value="red">Red</option>
                    <option value="orange">Orange</option>
                    <option value="yellow">Yellow</option>
                    <option value="green">Green</option>
                    <option value="cyan">Cyan</option>
                  </select>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary flex-1"
                    >
                      {loading ? 'Creating...' : 'Create Category'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCategoryForm(false)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Categories List */}
            <div className="space-y-4">
              {categories.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  No categories yet. Create one to get started!
                </div>
              ) : (
                categories.map((category) => (
                  <div key={category._id} className="glass border border-slate-700 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">{category.icon}</span>
                          <div>
                            <h3 className="font-bold text-lg">{category.name}</h3>
                            <p className="text-slate-400 text-sm">{category.description}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-2">
                          <span className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-300">
                            {category.problemCount} problems
                          </span>
                          <span className="px-2 py-1 bg-green-900 text-green-300 rounded text-xs">
                            Easy: {category.difficulty.easy}
                          </span>
                          <span className="px-2 py-1 bg-yellow-900 text-yellow-300 rounded text-xs">
                            Medium: {category.difficulty.medium}
                          </span>
                          <span className="px-2 py-1 bg-red-900 text-red-300 rounded text-xs">
                            Hard: {category.difficulty.hard}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteCategory(category._id)}
                        className="p-2 hover:bg-red-900 text-red-400 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Problems Section */}
        {activeTab === 'problems' && (
        <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Manage Problems</h2>
              <button
                onClick={() => setShowForm(!showForm)}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Problem
              </button>
            </div>

            {/* Add Problem Form */}
            {showForm && (
              <div className="glass border border-slate-700 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-bold mb-4">Create New Problem</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="title"
                      placeholder="Problem Title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg"
                    />
                    <select
                      name="difficulty"
                      value={formData.difficulty}
                      onChange={handleInputChange}
                      className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>

                  <textarea
                    name="description"
                    placeholder="Problem Description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows="4"
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg"
                  />

                  <textarea
                    name="constraints"
                    placeholder="Constraints"
                    value={formData.constraints}
                    onChange={handleInputChange}
                    rows="2"
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg"
                  />

                  <input
                    type="text"
                    name="tags"
                    placeholder="Tags (comma separated)"
                    value={formData.tags}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg"
                  />

                  <textarea
                    name="examples"
                    placeholder='Examples (JSON array): [{"input": "...", "output": "...", "explanation": "..."}]'
                    value={formData.examples}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg font-mono text-sm"
                  />

                  <textarea
                    name="testCases"
                    placeholder='Test Cases (JSON array): [{"input": "...", "expectedOutput": "...", "isHidden": false}]'
                    value={formData.testCases}
                    onChange={handleInputChange}
                    rows="3"
                    required
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg font-mono text-sm"
                  />

                  <textarea
                    name="functionSignature"
                    placeholder='Function Signature (JSON): {"javascript": "function solve(arr) {}", "python": "def solve(arr):", ...}'
                    value={formData.functionSignature}
                    onChange={handleInputChange}
                    rows="3"
                    required
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg font-mono text-sm"
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="number"
                      name="timeLimit"
                      placeholder="Time Limit (ms)"
                      value={formData.timeLimit}
                      onChange={handleInputChange}
                      className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg"
                    />
                    <input
                      type="number"
                      name="memoryLimit"
                      placeholder="Memory Limit (MB)"
                      value={formData.memoryLimit}
                      onChange={handleInputChange}
                      className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg"
                    />
                  </div>

                  <input
                    type="url"
                    name="solutionLink"
                    placeholder="Solution Link (optional - for solo practice help)"
                    value={formData.solutionLink}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg"
                  />

                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg"
                  >
                    <option value="">Select Category (optional)</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary flex-1"
                    >
                      {loading ? 'Creating...' : 'Create Problem'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Problems List */}
            <div className="space-y-4">
              {problems.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  No problems yet. Create one to get started!
                </div>
              ) : (
                problems.map((problem) => (
                  <div key={problem._id} className="glass border border-slate-700 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg">{problem.title}</h3>
                        <p className="text-sm text-slate-400 mt-1">{problem.description.substring(0, 100)}...</p>
                        <div className="flex gap-2 mt-2">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            problem.difficulty === 'Easy' ? 'bg-green-900 text-green-300' :
                            problem.difficulty === 'Medium' ? 'bg-yellow-900 text-yellow-300' :
                            'bg-red-900 text-red-300'
                          }`}>
                            {problem.difficulty}
                          </span>
                          <span className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-300">
                            {problem.totalSubmissions} submissions
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDelete(problem._id)}
                          className="p-2 hover:bg-red-900 text-red-400 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Challenges Section */}
        {activeTab === 'challenges' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Manage Challenges</h2>
              <button
                onClick={() => setShowChallengeForm(!showChallengeForm)}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Challenge
              </button>
            </div>

            {/* Create Challenge Form */}
            {showChallengeForm && (
              <div className="glass border border-slate-700 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-bold mb-4">Create New Challenge</h3>
                <form onSubmit={handleChallengeSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="title"
                      placeholder="Challenge Title"
                      value={challengeFormData.title}
                      onChange={handleChallengeInputChange}
                      required
                      className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg"
                    />
                    <select
                      name="difficulty"
                      value={challengeFormData.difficulty}
                      onChange={handleChallengeInputChange}
                      className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>

                  <textarea
                    name="description"
                    placeholder="Challenge Description"
                    value={challengeFormData.description}
                    onChange={handleChallengeInputChange}
                    required
                    rows="3"
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg"
                  />

                  <select
                    name="problemId"
                    value={challengeFormData.problemId}
                    onChange={handleChallengeInputChange}
                    required
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg"
                  >
                    <option value="">Select Problem</option>
                    {problems.map((problem) => (
                      <option key={problem._id} value={problem._id}>
                        {problem.title} ({problem.difficulty})
                      </option>
                    ))}
                  </select>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Start Date</label>
                      <input
                        type="datetime-local"
                        name="startDate"
                        value={challengeFormData.startDate}
                        onChange={handleChallengeInputChange}
                        required
                        className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">End Date</label>
                      <input
                        type="datetime-local"
                        name="endDate"
                        value={challengeFormData.endDate}
                        onChange={handleChallengeInputChange}
                        required
                        className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg"
                      />
                    </div>
                  </div>

                  <select
                    name="challengeType"
                    value={challengeFormData.challengeType}
                    onChange={handleChallengeInputChange}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg"
                  >
                    <option value="global">Global Challenge</option>
                    <option value="targeted">Targeted Challenge</option>
                  </select>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary flex-1"
                    >
                      {loading ? 'Creating...' : 'Create Challenge'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowChallengeForm(false)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Challenges List */}
            <div className="space-y-4">
              {!challenges || challenges.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  No challenges yet. Create one to get started!
                </div>
              ) : (
                challenges.map((challenge) => (
                  <div key={challenge._id} className="glass border border-slate-700 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg">{challenge.title}</h3>
                        <p className="text-sm text-slate-400 mt-1">{challenge.description}</p>
                        <div className="flex gap-2 mt-2">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            challenge.difficulty === 'Easy' ? 'bg-green-900 text-green-300' :
                            challenge.difficulty === 'Medium' ? 'bg-yellow-900 text-yellow-300' :
                            'bg-red-900 text-red-300'
                          }`}>
                            {challenge.difficulty}
                          </span>
                          <span className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-300">
                            {challenge.status}
                          </span>
                          {challenge.problem && (
                            <span className="px-2 py-1 bg-indigo-900 text-indigo-300 rounded text-xs">
                              {challenge.problem.title}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteChallenge(challenge._id)}
                        className="ml-4 p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition"
                        title="Delete Challenge"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Contests Section */}
        {activeTab === 'contests' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Manage Contests</h2>
              <button
                onClick={() => setShowContestForm(!showContestForm)}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Contest
              </button>
            </div>

            {/* Create Contest Form */}
            {showContestForm && (
              <div className="glass border border-slate-700 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-bold mb-4">Create New Contest</h3>
                <form onSubmit={handleContestSubmit} className="space-y-4">
                  <input
                    type="text"
                    name="title"
                    placeholder="Contest Title"
                    value={contestFormData.title}
                    onChange={handleContestInputChange}
                    required
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg"
                  />

                  <textarea
                    name="description"
                    placeholder="Contest Description"
                    value={contestFormData.description}
                    onChange={handleContestInputChange}
                    required
                    rows="3"
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg"
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <select
                      name="type"
                      value={contestFormData.type}
                      onChange={handleContestInputChange}
                      className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg"
                    >
                      <option value="weekly">Weekly Contest</option>
                      <option value="biweekly">Biweekly Contest</option>
                      <option value="special">Special Contest</option>
                      <option value="virtual">Virtual Contest</option>
                    </select>
                    <input
                      type="number"
                      name="duration"
                      placeholder="Duration (minutes)"
                      value={contestFormData.duration}
                      onChange={handleContestInputChange}
                      required
                      className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Start Time</label>
                    <input
                      type="datetime-local"
                      name="startTime"
                      value={contestFormData.startTime}
                      onChange={handleContestInputChange}
                      required
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Select Problems (at least 1 required)</label>
                    <div className="max-h-48 overflow-y-auto border border-slate-700 rounded-lg p-3 bg-slate-800/50">
                      {problems.length === 0 ? (
                        <p className="text-slate-500 text-sm">No problems available</p>
                      ) : (
                        problems.map((problem) => (
                          <label key={problem._id} className="flex items-center gap-2 p-2 hover:bg-slate-700/50 rounded cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedProblems.includes(problem._id)}
                              onChange={() => handleProblemSelection(problem._id)}
                              className="w-4 h-4"
                            />
                            <span className="text-sm">{problem.title}</span>
                            <span className={`ml-auto text-xs px-2 py-0.5 rounded ${
                              problem.difficulty === 'Easy' ? 'bg-green-900 text-green-300' :
                              problem.difficulty === 'Medium' ? 'bg-yellow-900 text-yellow-300' :
                              'bg-red-900 text-red-300'
                            }`}>
                              {problem.difficulty}
                            </span>
                          </label>
                        ))
                      )}
                    </div>
                    {selectedProblems.length > 0 && (
                      <p className="text-xs text-slate-400 mt-1">{selectedProblems.length} problem(s) selected</p>
                    )}
                  </div>

                  <textarea
                    name="rules"
                    placeholder="Contest Rules (optional)"
                    value={contestFormData.rules}
                    onChange={handleContestInputChange}
                    rows="2"
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg"
                  />

                  <input
                    type="text"
                    name="prizes"
                    placeholder="Prizes (comma-separated, optional)"
                    value={contestFormData.prizes}
                    onChange={handleContestInputChange}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg"
                  />

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="isRated"
                      checked={contestFormData.isRated}
                      onChange={(e) => setContestFormData(prev => ({ ...prev, isRated: e.target.checked }))}
                      className="w-4 h-4"
                    />
                    <label className="text-sm text-slate-300">Rated Contest</label>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={loading || selectedProblems.length === 0}
                      className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Creating...' : 'Create Contest'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowContestForm(false);
                        setSelectedProblems([]);
                      }}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition"
                    >
                      Cancel
                    </button>
                  </div>
                  {selectedProblems.length === 0 && (
                    <p className="text-xs text-red-400">Please select at least one problem</p>
                  )}
                </form>
              </div>
            )}

            {/* Contests List */}
            <div className="space-y-4">
              {!contests || contests.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  No contests yet. Create one to get started!
                </div>
              ) : (
                contests.map((contest) => (
                  <div key={contest._id} className="glass border border-slate-700 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg">{contest.title}</h3>
                        <p className="text-sm text-slate-400 mt-1">{contest.description}</p>
                        <div className="flex gap-2 mt-2">
                          <span className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-300">
                            {contest.type}
                          </span>
                          <span className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-300">
                            {contest.duration} mins
                          </span>
                          <span className="px-2 py-1 bg-purple-900 text-purple-300 rounded text-xs">
                            {contest.problems?.length || 0} problems
                          </span>
                          {contest.isRated && (
                            <span className="px-2 py-1 bg-yellow-900 text-yellow-300 rounded text-xs">
                              Rated
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteContest(contest._id)}
                        className="ml-4 p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition"
                        title="Delete Contest"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

