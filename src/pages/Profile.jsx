import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-hot-toast';
import { Trophy, TrendingUp, ArrowLeft, Edit2, Save, X, Lock, Trash2, User, Mail, FileText, Code2, Sparkles, Award, Swords, Target } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Profile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { getUserProfile } = useUserStore();
  const { user: currentUser, logout } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    username: '',
    email: '',
    bio: ''
  });

  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Delete account state
  const [deletePassword, setDeletePassword] = useState('');

  const isOwnProfile = currentUser?.username === username;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getUserProfile(username);
        setProfile(data);
        setEditForm({
          username: data.username,
          email: currentUser?.email || '',
          bio: data.bio || ''
        });
      } catch (error) {
        toast.error('Failed to load profile');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username, getUserProfile, navigate, currentUser]);

  const handleUpdateProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_URL}/users/profile`, editForm, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setProfile({ ...profile, ...response.data });
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/users/change-password`, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setShowPasswordModal(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password changed successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/users/account`, {
        data: { password: deletePassword },
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Account deleted successfully');
      logout();
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete account');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <p className="text-xl font-semibold text-red-400">Profile not found</p>
        </div>
      </div>
    );
  }

  const winRate = profile.totalMatches > 0 ? ((profile.wins / profile.totalMatches) * 100).toFixed(1) : 0;

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
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg shadow-indigo-500/30">
                <User className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Player Profile
              </h1>
            </div>
          </div>
          {isOwnProfile && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-lg transition-all shadow-lg shadow-indigo-500/30"
            >
              <Edit2 className="w-4 h-4" />
              <span className="hidden md:inline">Edit Profile</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12 relative z-10">
        {/* Profile Header */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 mb-8 shadow-xl animate-fade-in">
          {isEditing ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold">Edit Profile</h3>
                <div className="flex gap-2">
                  <button
                    onClick={handleUpdateProfile}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-lg transition-all shadow-lg shadow-green-500/30"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-all border border-slate-600"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Username
                  </label>
                  <input
                    type="text"
                    value={editForm.username}
                    onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email
                  </label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  <FileText className="w-4 h-4 inline mr-2" />
                  Bio
                </label>
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  rows={3}
                  maxLength={200}
                  placeholder="Tell us about yourself..."
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
                />
                <p className="text-xs text-slate-500 mt-1">{editForm.bio.length}/200 characters</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-start gap-6 mb-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-4xl font-bold shadow-xl shadow-indigo-500/30">
                    {profile.username.charAt(0).toUpperCase()}
                  </div>
                  {profile.isOnline && (
                    <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 border-4 border-slate-800 rounded-full"></div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">
                      {profile.username}
                    </h2>
                    {profile.isOnline ? (
                      <span className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-xs font-semibold text-green-300">
                        Online
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-slate-700/50 border border-slate-600 rounded-full text-xs font-semibold text-slate-400">
                        Offline
                      </span>
                    )}
                  </div>
                  {profile.bio && (
                    <p className="text-slate-400 mb-4">{profile.bio}</p>
                  )}
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="relative overflow-hidden bg-gradient-to-br from-yellow-500/10 to-orange-500/10 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-500/10 rounded-full blur-2xl"></div>
                  <div className="relative">
                    <p className="text-slate-400 text-sm mb-1 font-medium">Rating</p>
                    <p className="text-3xl font-bold bg-gradient-to-br from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                      {profile.rating}
                    </p>
                  </div>
                </div>
                <div className="relative overflow-hidden bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full blur-2xl"></div>
                  <div className="relative">
                    <p className="text-slate-400 text-sm mb-1 font-medium">Wins</p>
                    <p className="text-3xl font-bold bg-gradient-to-br from-green-400 to-emerald-400 bg-clip-text text-transparent">
                      {profile.wins}
                    </p>
                  </div>
                </div>
                <div className="relative overflow-hidden bg-gradient-to-br from-red-500/10 to-pink-500/10 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/10 rounded-full blur-2xl"></div>
                  <div className="relative">
                    <p className="text-slate-400 text-sm mb-1 font-medium">Losses</p>
                    <p className="text-3xl font-bold bg-gradient-to-br from-red-400 to-pink-400 bg-clip-text text-transparent">
                      {profile.losses}
                    </p>
                  </div>
                </div>
                <div className="relative overflow-hidden bg-gradient-to-br from-slate-500/10 to-slate-600/10 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-slate-500/10 rounded-full blur-2xl"></div>
                  <div className="relative">
                    <p className="text-slate-400 text-sm mb-1 font-medium">Draws</p>
                    <p className="text-3xl font-bold text-slate-300">
                      {profile.draws}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 shadow-xl">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg shadow-lg shadow-yellow-500/30">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              Performance
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-4 bg-slate-900/50 rounded-xl border border-slate-700/50 hover:border-indigo-500/30 transition-all">
                <span className="text-slate-400 flex items-center gap-2">
                  <Swords className="w-4 h-4" />
                  Total Matches
                </span>
                <span className="font-bold text-white text-lg">{profile.totalMatches}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-slate-900/50 rounded-xl border border-slate-700/50 hover:border-green-500/30 transition-all">
                <span className="text-slate-400 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Win Rate
                </span>
                <span className="font-bold text-green-400 text-lg">{winRate}%</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-slate-900/50 rounded-xl border border-slate-700/50 hover:border-yellow-500/30 transition-all">
                <span className="text-slate-400 flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  Highest Rating
                </span>
                <span className="font-bold text-yellow-400 text-lg">{profile.highestRating}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-slate-900/50 rounded-xl border border-slate-700/50 hover:border-slate-500/30 transition-all">
                <span className="text-slate-400 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Lowest Rating
                </span>
                <span className="font-bold text-slate-400 text-lg">{profile.lowestRating}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 shadow-xl">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg shadow-lg shadow-purple-500/30">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              Statistics
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-4 bg-slate-900/50 rounded-xl border border-slate-700/50 hover:border-green-500/30 transition-all">
                <span className="text-slate-400">Wins</span>
                <span className="font-bold text-green-400 text-lg">{profile.wins}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-slate-900/50 rounded-xl border border-slate-700/50 hover:border-red-500/30 transition-all">
                <span className="text-slate-400">Losses</span>
                <span className="font-bold text-red-400 text-lg">{profile.losses}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-slate-900/50 rounded-xl border border-slate-700/50 hover:border-slate-500/30 transition-all">
                <span className="text-slate-400">Draws</span>
                <span className="font-bold text-slate-400 text-lg">{profile.draws}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-slate-900/50 rounded-xl border border-slate-700/50 hover:border-indigo-500/30 transition-all">
                <span className="text-slate-400">Current Rating</span>
                <span className="font-bold text-indigo-400 text-lg">{profile.rating}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {isOwnProfile ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/leaderboard')}
              className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-xl transition-all shadow-lg shadow-indigo-500/30 hover:scale-105 font-semibold"
            >
              <Trophy className="w-5 h-5" />
              View Leaderboard
            </button>
            <button
              onClick={() => setShowPasswordModal(true)}
              className="flex items-center justify-center gap-2 px-6 py-4 bg-slate-700 hover:bg-slate-600 rounded-xl transition-all border border-slate-600 hover:border-indigo-500/50 hover:scale-105 font-semibold"
            >
              <Lock className="w-5 h-5" />
              Change Password
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center justify-center gap-2 px-6 py-4 bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 hover:border-red-500 rounded-xl transition-all hover:scale-105 font-semibold text-red-400"
            >
              <Trash2 className="w-5 h-5" />
              Delete Account
            </button>
          </div>
        ) : (
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-slate-700 hover:bg-slate-600 rounded-xl transition-all border border-slate-600 hover:scale-105 font-semibold"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Dashboard
            </button>
            <button
              onClick={() => navigate('/leaderboard')}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-xl transition-all shadow-lg shadow-indigo-500/30 hover:scale-105 font-semibold"
            >
              <Trophy className="w-5 h-5" />
              View Leaderboard
            </button>
          </div>
        )}
      </main>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-md w-full shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <Lock className="w-6 h-6 text-indigo-400" />
                Change Password
              </h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="p-2 hover:bg-slate-700 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  placeholder="Enter new password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  placeholder="Confirm new password"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl transition-all border border-slate-600 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleChangePassword}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-xl transition-all shadow-lg shadow-indigo-500/30 font-semibold"
              >
                Change Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-red-500/50 rounded-2xl p-8 max-w-md w-full shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold flex items-center gap-2 text-red-400">
                <Trash2 className="w-6 h-6" />
                Delete Account
              </h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="p-2 hover:bg-slate-700 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6">
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-4">
                <p className="text-red-300 font-semibold mb-2">⚠️ Warning</p>
                <p className="text-slate-300 text-sm">
                  This action cannot be undone. All your data, including match history, ratings, and statistics will be permanently deleted.
                </p>
              </div>

              <label className="block text-sm font-medium text-slate-400 mb-2">
                Enter your password to confirm
              </label>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
                placeholder="Enter your password"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl transition-all border border-slate-600 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 rounded-xl transition-all shadow-lg shadow-red-500/30 font-semibold"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

