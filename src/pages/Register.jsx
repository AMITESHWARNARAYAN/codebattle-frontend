import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-hot-toast';
import { Code2, Users, AlertCircle, CheckCircle, Lock, Mail, User, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState(null);
  const navigate = useNavigate();
  const { register, loading } = useAuthStore();

  useEffect(() => {
    // Fetch registration status
    const fetchStatus = async () => {
      try {
        const response = await axios.get(`${API_URL}/auth/registration-status`);
        setRegistrationStatus(response.data);
      } catch (error) {
        console.error('Failed to fetch registration status:', error);
      }
    };
    fetchStatus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !email || !password || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (username.length < 3 || username.length > 20) {
      toast.error('Username must be 3-20 characters');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      await register(username, email, password);
      toast.success('Registration successful!');
      navigate('/');
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Registration failed';
      if (error.response?.data?.limitReached) {
        toast.error(errorMsg, { duration: 5000 });
      } else {
        toast.error(errorMsg);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50 dark:bg-dark-950">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="p-1.5 bg-gray-900 dark:bg-white rounded-lg">
              <Code2 className="w-6 h-6 text-white dark:text-gray-900" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              CodeBattle
            </h1>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Create an account
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Start your coding journey today
          </p>
        </div>

        {/* Registration Status Banner */}
        {registrationStatus && (
          <div className={`mb-6 p-4 rounded-lg border ${
            registrationStatus.isAvailable
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
          }`}>
            <div className="flex items-center gap-3">
              {registrationStatus.isAvailable ? (
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
              )}
              <div className="flex-1">
                <p className={`font-semibold ${registrationStatus.isAvailable ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                  {registrationStatus.isAvailable
                    ? `${registrationStatus.availableSlots} spots remaining`
                    : 'Registration Closed'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {registrationStatus.totalUsers} / {registrationStatus.maxUsers} users registered
                </p>
              </div>
              <Users className={`w-6 h-6 ${registrationStatus.isAvailable ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} />
            </div>
          </div>
        )}

        {/* Register Form */}
        <div className="bg-white dark:bg-dark-900 rounded-lg shadow-sm border border-gray-200 dark:border-dark-800 p-8">
          {registrationStatus && !registrationStatus.isAvailable ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Registration Limit Reached</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                We've reached our maximum capacity. Please check back later.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 rounded-lg font-medium transition"
              >
                Go to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username"
                    className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-700 rounded-lg focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent transition text-gray-900 dark:text-white placeholder-gray-400"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">3-20 characters</p>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-700 rounded-lg focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent transition text-gray-900 dark:text-white placeholder-gray-400"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
                    className="w-full pl-11 pr-12 py-2.5 bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-700 rounded-lg focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent transition text-gray-900 dark:text-white placeholder-gray-400"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Minimum 6 characters</p>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className="w-full pl-11 pr-12 py-2.5 bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-700 rounded-lg focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent transition text-gray-900 dark:text-white placeholder-gray-400"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 px-6 py-2.5 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white dark:text-gray-900 rounded-lg font-medium transition"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 dark:border-gray-900/30 border-t-white dark:border-t-gray-900 rounded-full animate-spin"></div>
                    Creating account...
                  </span>
                ) : (
                  'Create account'
                )}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-gray-900 dark:text-white font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

