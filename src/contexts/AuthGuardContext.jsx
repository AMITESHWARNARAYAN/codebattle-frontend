import { createContext, useContext, useState, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import AuthModal from '../components/AuthModal';

const AuthGuardContext = createContext(null);

export function AuthGuardProvider({ children }) {
  const token = useAuthStore((state) => state.token);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('Sign in to Continue');
  const [modalMessage, setModalMessage] = useState(
    'Join thousands of developers solving algorithmic challenges, competing in weekly contests, and climbing the global leaderboard.'
  );

  const requireAuth = useCallback(
    (callback, title, message) => {
      if (token) {
        if (typeof callback === 'function') callback();
        return true;
      }
      if (title) setModalTitle(title);
      if (message) setModalMessage(message);
      setModalOpen(true);
      return false;
    },
    [token]
  );

  const isGuest = !token;

  return (
    <AuthGuardContext.Provider value={{ requireAuth, isGuest }}>
      {children}
      <AuthModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalTitle}
        message={modalMessage}
      />
    </AuthGuardContext.Provider>
  );
}

export function useRequireAuth() {
  const ctx = useContext(AuthGuardContext);
  if (!ctx) throw new Error('useRequireAuth must be used within AuthGuardProvider');
  return ctx.requireAuth;
}

export function useIsGuest() {
  const ctx = useContext(AuthGuardContext);
  if (!ctx) throw new Error('useIsGuest must be used within AuthGuardProvider');
  return ctx.isGuest;
}
