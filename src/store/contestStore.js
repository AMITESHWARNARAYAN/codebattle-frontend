import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const useContestStore = create((set) => ({
  contests: [],
  currentContest: null,
  leaderboard: [],
  loading: false,
  error: null,

  // Get all contests
  getContests: async (filters = {}) => {
    try {
      set({ loading: true, error: null });
      const token = localStorage.getItem('token');
      
      const params = new URLSearchParams(filters);
      const response = await axios.get(`${API_URL}/contests?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      set({ contests: response.data, loading: false });
      return response.data;
    } catch (error) {
      set({ error: 'Failed to fetch contests', loading: false });
      throw error;
    }
  },

  // Get upcoming contests
  getUpcomingContests: async () => {
    try {
      set({ loading: true, error: null });
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${API_URL}/contests/upcoming`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      set({ loading: false });
      return response.data;
    } catch (error) {
      set({ error: 'Failed to fetch upcoming contests', loading: false });
      throw error;
    }
  },

  // Get running contests
  getRunningContests: async () => {
    try {
      set({ loading: true, error: null });
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${API_URL}/contests/running`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      set({ loading: false });
      return response.data;
    } catch (error) {
      set({ error: 'Failed to fetch running contests', loading: false });
      throw error;
    }
  },

  // Get past contests
  getPastContests: async () => {
    try {
      set({ loading: true, error: null });
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${API_URL}/contests/past`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      set({ loading: false });
      return response.data;
    } catch (error) {
      set({ error: 'Failed to fetch past contests', loading: false });
      throw error;
    }
  },

  // Get single contest
  getContest: async (contestId) => {
    try {
      set({ loading: true, error: null });
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${API_URL}/contests/${contestId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      set({ currentContest: response.data, loading: false });
      return response.data;
    } catch (error) {
      set({ error: 'Failed to fetch contest', loading: false });
      throw error;
    }
  },

  // Register for contest
  registerForContest: async (contestId) => {
    try {
      set({ loading: true, error: null });
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        `${API_URL}/contests/${contestId}/register`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      set((state) => ({
        currentContest: state.currentContest?._id === contestId 
          ? response.data.contest 
          : state.currentContest,
        loading: false
      }));

      return response.data;
    } catch (error) {
      set({ error: 'Failed to register for contest', loading: false });
      throw error;
    }
  },

  // Start contest
  startContest: async (contestId) => {
    try {
      set({ loading: true, error: null });
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        `${API_URL}/contests/${contestId}/start`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // POST /start returns { message, startedAt, endTime } — not a contest object.
      // Don't overwrite currentContest here; the caller should re-fetch via getContest().
      set({ loading: false });

      return response.data;
    } catch (error) {
      set({ error: 'Failed to start contest', loading: false });
      throw error;
    }
  },

  // Start virtual contest
  startVirtualContest: async (contestId) => {
    try {
      set({ loading: true, error: null });
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        `${API_URL}/virtual-contests/${contestId}/start`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      set({ loading: false });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to start virtual contest';
      set({ error: message, loading: false });
      throw error;
    }
  },

  // Stop virtual contest (keeps record)
  stopVirtualContest: async (contestId) => {
    try {
      set({ loading: true, error: null });
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        `${API_URL}/virtual-contests/${contestId}/stop`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      set({ loading: false });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to stop virtual contest';
      set({ error: message, loading: false });
      throw error;
    }
  },

  // Give up virtual contest — deletes all progress (LeetCode-style)
  giveUpVirtualContest: async (contestId) => {
    try {
      set({ loading: true, error: null });
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        `${API_URL}/virtual-contests/${contestId}/give-up`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      set({ loading: false });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to give up virtual contest';
      set({ error: message, loading: false });
      throw error;
    }
  },

  // Submit solution
  submitSolution: async (contestId, problemId, code, language) => {
    try {
      set({ loading: true, error: null });
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        `${API_URL}/contests/${contestId}/submit`,
        { problemId, code, language },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      set({ loading: false });
      return response.data;
    } catch (error) {
      set({ error: 'Failed to submit solution', loading: false });
      throw error;
    }
  },

  // Get leaderboard
  getLeaderboard: async (contestId, params = {}) => {
    try {
      const token = localStorage.getItem('token');
      
      const query = new URLSearchParams(params).toString();
      const response = await axios.get(`${API_URL}/contests/${contestId}/leaderboard?${query}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Return data without setting global state — callers should manage their own local state
      // to prevent race conditions between pages (e.g., ContestDetail vs Contests page)
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Clear current contest
  clearCurrentContest: () => set({ currentContest: null }),

  setError: (error) => set({ error }),
  clearError: () => set({ error: null })
}));

