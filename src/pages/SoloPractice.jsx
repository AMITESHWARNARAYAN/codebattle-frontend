import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMatchStore } from '../store/matchStore';
import { toast } from 'react-hot-toast';

export default function SoloPractice() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { startSoloMatch } = useMatchStore();
  const [loading, setLoading] = useState(true);
  const problemId = searchParams.get('problemId');
  const isDailyChallenge = searchParams.get('dailyChallenge') === 'true';
  const hasInitiatedRef = useRef(false);

  useEffect(() => {
    if (hasInitiatedRef.current) return;
    hasInitiatedRef.current = true;

    const initiateSoloMatch = async () => {
      try {
        setLoading(true);
        const match = await startSoloMatch(problemId);

        if (isDailyChallenge) {
          sessionStorage.setItem('isDailyChallenge', 'true');
        }

        navigate(`/problem/${match.problem._id || match.problem}`);
      } catch (error) {
        console.error('Failed to start solo match:', error);
        toast.error(error.response?.data?.message || 'Failed to start solo match');
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } finally {
        setLoading(false);
      }
    };

    initiateSoloMatch();
  }, [startSoloMatch, navigate, problemId, isDailyChallenge]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950 text-slate-900 dark:text-white transition-colors">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500/20 border-t-orange-500 mx-auto mb-6"></div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Starting Practice Session</h2>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Preparing your coding challenge...</p>
      </div>
    </div>
  );
}
