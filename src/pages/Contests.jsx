import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContestStore } from '../store/contestStore';
import { useUserStore } from '../store/userStore';
import { useAuthStore } from '../store/authStore';
import { Trophy, Clock, Bell, ArrowRight, ChevronLeft, Shuffle } from 'lucide-react';
import toast from 'react-hot-toast';
import GuestHeader from '../components/GuestHeader';
import { useRequireAuth } from '../contexts/AuthGuardContext';



const getPlayerAvatar = (username) => {
  if (!username) {
    return (
      <div className="w-full h-full bg-slate-300 dark:bg-dark-800 text-slate-500 flex items-center justify-center font-bold text-lg">
        ?
      </div>
    );
  }

  // Generate a consistent color from the username
  const colors = [
    '#005fb8', '#e65100', '#2e7d32', '#6a1b9a', '#c62828',
    '#00838f', '#4527a0', '#bf360c', '#1565c0', '#ad1457'
  ];
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = colors[Math.abs(hash) % colors.length];

  return (
    <div
      className="w-full h-full text-white flex items-center justify-center font-bold text-lg uppercase shadow-inner"
      style={{ backgroundColor: color }}
    >
      {username[0]}
    </div>
  );
};

// ─── Custom Alarm Icon ───
const AlarmIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="13" r="6" />
    <path d="M12 10v3h2.5" strokeLinecap="round" />
    <path d="M5 6.5a2.5 2.5 0 012.5-2.5M19 6.5a2.5 2.5 0 00-2.5-2.5" strokeLinecap="round" />
    <path d="M9 20.5l-1.5 1.5M15 20.5l1.5-1.5" strokeLinecap="round" />
  </svg>
);

// ─── Shield Icon ───
const ShieldIcon = ({ className = "w-3.5 h-3.5 inline-block ml-1 align-middle" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="#3182ce" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

// ─── Flag Image CDN Component for Windows Compatibility ───
const FlagIcon = ({ code, className = "w-4 h-3 inline-block ml-1.5 align-middle rounded-sm shadow-sm" }) => {
  if (!code) return null;
  const lowerCode = code.toLowerCase();
  return (
    <img 
      src={`https://flagcdn.com/w20/${lowerCode}.png`} 
      srcSet={`https://flagcdn.com/w40/${lowerCode}.png 2x`}
      width="16"
      height="11"
      alt={code}
      className={className}
    />
  );
};

// ─── Crown Badge component floating on top of Avatar ───
const CrownBadge = ({ type }) => {
  const isGold = type === 'gold';
  const isSilver = type === 'silver';
  const borderColor = isGold ? 'border-[#ffa116]' : isSilver ? 'border-[#8da2bb]' : 'border-[#c77a44]';
  const crownColor = isGold ? '#ffa116' : isSilver ? '#8da2bb' : '#c77a44';
  
  return (
    <div className={`absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-white dark:bg-[#1a1a1a] border-[2px] ${borderColor} flex items-center justify-center shadow-md z-20`}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill={crownColor}>
        <path d="M2 5l4 4 6-6 6 6 4-4-2 14H4L2 5z" />
      </svg>
    </div>
  );
};

// ─── 3D Glass Cube SVG Component ───
const GlassCube = ({ size = 60, className = "", cubeType = "weekly" }) => {
  const isWeekly = cubeType === 'weekly';
  const leftFill = isWeekly ? "rgba(255, 200, 50, 0.25)" : "rgba(100, 150, 255, 0.25)";
  const rightFill = isWeekly ? "rgba(255, 150, 0, 0.18)" : "rgba(120, 80, 255, 0.18)";
  const topFill = isWeekly ? "rgba(255, 240, 180, 0.4)" : "rgba(200, 220, 255, 0.4)";
  const strokeColor = isWeekly ? "rgba(255, 220, 100, 0.8)" : "rgba(180, 200, 255, 0.8)";
  
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} style={{ filter: 'drop-shadow(0px 8px 20px rgba(0, 0, 0, 0.18))' }}>
      <polygon points="20,50 50,68 50,98 20,80" fill={leftFill} stroke={strokeColor} strokeWidth="1.5" />
      <polygon points="50,68 80,50 80,80 50,98" fill={rightFill} stroke={strokeColor} strokeWidth="1.5" />
      <polygon points="20,50 50,32 80,50 50,68" fill={topFill} stroke={strokeColor} strokeWidth="1.5" />
    </svg>
  );
};

// ─── Custom Trophy Component ───
const TrophyIcon = () => (
  <svg width="68" height="68" viewBox="0 0 100 100" className="drop-shadow-md">
    <defs>
      <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffd35c" />
        <stop offset="50%" stopColor="#f59f1b" />
        <stop offset="100%" stopColor="#b56e00" />
      </linearGradient>
      <linearGradient id="goldLight" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#fff1ba" />
        <stop offset="70%" stopColor="#f59f1b" />
        <stop offset="100%" stopColor="#965a00" />
      </linearGradient>
    </defs>
    
    <ellipse cx="50" cy="86" rx="20" ry="5" fill="url(#gold)" />
    <ellipse cx="50" cy="82" rx="16" ry="4" fill="url(#goldLight)" />
    <rect x="45" y="72" width="10" height="10" fill="url(#gold)" rx="1" />
    <path d="M47 62 L53 62 L52 72 L48 72 Z" fill="url(#goldLight)" />
    <path d="M30 22 C30 46, 42 58, 50 58 C58 58, 70 46, 70 22 Z" fill="url(#gold)" />
    <path d="M30 22 C35 25, 65 25, 70 22 C70 22, 66 28, 50 28 C34 28, 30 22, 30 22 Z" fill="#9c5a00" opacity="0.3" />
    <path d="M30 26 C16 26, 14 43, 33 43" fill="none" stroke="url(#gold)" strokeWidth="4" strokeLinecap="round" />
    <path d="M70 26 C84 26, 86 43, 67 43" fill="none" stroke="url(#gold)" strokeWidth="4" strokeLinecap="round" />
    <circle cx="50" cy="37" r="10" fill="white" />
    <path d="M47 33.5 L44 37 L47 40.5 M53 33.5 L56 37 L53 40.5" fill="none" stroke="#f59f1b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M51 34 L49 40" fill="none" stroke="#f59f1b" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

// ─── 3D Podium Pedestal Component ───
const PodiumPedestal = ({ rank, player, heightVal, onPlayerClick }) => {
  const isFirst = rank === 1;
  const isSecond = rank === 2;
  const isThird = rank === 3;
  
  const crownType = isFirst ? 'gold' : isSecond ? 'silver' : 'bronze';
  const borderColor = isFirst ? 'border-[#ffa116]' : isSecond ? 'border-[#8da2bb]' : 'border-[#c77a44]';
  const playerAvatar = player ? getPlayerAvatar(player.username) : (
    <div className="w-full h-full bg-slate-100 dark:bg-dark-800 flex items-center justify-center font-bold text-slate-400 text-sm">
      -
    </div>
  );

  return (
    <div 
      onClick={() => player?.username && onPlayerClick && onPlayerClick(player.username)}
      className="flex flex-col items-center cursor-pointer group"
    >
      {/* Avatar & Crown Badge */}
      <div className="relative mb-4 flex flex-col items-center z-10">
        <CrownBadge type={crownType} />
        <div className={`w-15 h-15 rounded-full border-[4px] ${borderColor} shadow-md overflow-hidden bg-white dark:bg-[#1a1a1a] flex items-center justify-center z-10 group-hover:scale-105 transition-transform`}>
          <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center">
            {playerAvatar}
          </div>
        </div>
      </div>
      
      {/* Pedestal Column */}
      <div className="relative w-22 flex flex-col items-center">
        {/* Top Cap (Slightly wider than base) */}
        <div className="w-22 h-3.5 rounded-full bg-gradient-to-r from-slate-100 via-white to-slate-200 dark:from-dark-750 dark:via-dark-800 dark:to-dark-700 border border-slate-300 dark:border-dark-700/60 shadow-inner z-10" />
        {/* Cylindrical Base */}
        <div 
          className="w-20 bg-gradient-to-r from-slate-200 via-white to-slate-250 dark:from-dark-800 dark:via-dark-850 dark:to-dark-800 border-x border-b border-slate-300/80 dark:border-dark-700/80 shadow-md -mt-2.5 rounded-b-xl flex flex-col justify-end pb-3 text-center"
          style={{ height: heightVal }}
        >
          {/* Overlapping Info Card (Wider than column to pop out 3D style) */}
          <div className="absolute -bottom-5.5 left-1/2 -translate-x-1/2 bg-white dark:bg-[#1f1f1f] border border-slate-200/80 dark:border-dark-800 rounded-xl px-1.5 py-1.5 shadow-md w-[112px] text-center z-20 transition group-hover:shadow-lg">
            <div className="text-[11px] font-bold text-slate-800 dark:text-white flex items-center justify-center gap-0.5">
              <span className="truncate max-w-[72px] text-center leading-none group-hover:text-orange-500 transition-colors">{player ? player.username : '-'}</span>
            </div>
            <div className="text-[10px] text-slate-450 dark:text-slate-400 font-semibold mt-0.5 text-center leading-none">
              {player ? player.contestRating : '0'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Contests() {
  const navigate = useNavigate();
  const { getUpcomingContests, getRunningContests, getPastContests, registerForContest } = useContestStore();
  const { getLeaderboard } = useUserStore();
  const { token, user } = useAuthStore();

  const [upcomingContests, setUpcomingContests] = useState([]);
  const [runningContests, setRunningContests] = useState([]);
  const [pastContests, setPastContests] = useState([]);
  const [rankings, setRankings] = useState([]);
  const [timers, setTimers] = useState({});
  const [loading, setLoading] = useState(true);
  const requireAuth = useRequireAuth();

  const handleUserClick = (username) => {
    if (!username) return;
    if (!requireAuth(null, 'Sign in to View User Profiles', 'Create a free CodeBattle account or sign in to view user profiles, contest ratings, and match history.')) return;
    navigate(`/profile/${username}`);
  };

  // Pagination for Past Contests
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const firstRank = rankings[0];
  const secondRank = rankings[1];
  const thirdRank = rankings[2];

  const displayFeatured = [...runningContests, ...upcomingContests];

  // Pagination bounds
  const totalPages = Math.ceil(pastContests.length / itemsPerPage) || 1;
  const paginatedPast = pastContests.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    loadContests();
  }, []);

  // Live countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const updated = {};
      let shouldReload = false;

      [...upcomingContests, ...runningContests].forEach(c => {
        const target = c.status === 'running' ? new Date(c.endTime) : new Date(c.startTime);
        const diff = target - now;
        if (diff > 0) {
          const d = Math.floor(diff / 86400000);
          const h = Math.floor((diff % 86400000) / 3600000);
          const m = Math.floor((diff % 3600000) / 60000);
          const s = Math.floor((diff % 60000) / 1000);
          
          updated[c._id] = d > 0 
            ? `${d}d ${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}` 
            : `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
        } else {
          updated[c._id] = '00:00:00';
          if (new Date(c.endTime) <= now) {
            shouldReload = true;
          }
        }
      });
      setTimers(updated);

      if (shouldReload) {
        loadContests();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [upcomingContests, runningContests]);

  const loadContests = async () => {
    setLoading(true);
    const [upcoming, running, past, leaderResult] = await Promise.allSettled([
      getUpcomingContests(), 
      getRunningContests(), 
      getPastContests(),
      getLeaderboard(10, 'contest')
    ]);
    
    const rawUpcoming = upcoming.status === 'fulfilled' ? (upcoming.value || []) : [];
    const rawRunning = running.status === 'fulfilled' ? (running.value || []) : [];
    const rawPast = past.status === 'fulfilled' ? (past.value || []) : [];

    const now = new Date();
    const activeUpcoming = [];
    const activeRunning = [];
    const extraPast = [];

    // Filter out any contests whose end time has passed and move them to pastContests
    rawUpcoming.forEach(c => {
      if (new Date(c.endTime) <= now) {
        extraPast.push({ ...c, status: 'finished' });
      } else if (new Date(c.startTime) <= now) {
        activeRunning.push({ ...c, status: 'running' });
      } else {
        activeUpcoming.push(c);
      }
    });

    rawRunning.forEach(c => {
      if (new Date(c.endTime) <= now) {
        extraPast.push({ ...c, status: 'finished' });
      } else {
        activeRunning.push(c);
      }
    });

    const combinedPast = [...extraPast, ...rawPast];
    const uniquePast = Array.from(new Map(combinedPast.map(c => [c._id, c])).values());
    uniquePast.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));

    setUpcomingContests(activeUpcoming);
    setRunningContests(activeRunning);
    setPastContests(uniquePast);
    
    if (leaderResult.status === 'fulfilled' && leaderResult.value) {
      setRankings(leaderResult.value);
    } else {
      setRankings([]);
    }
    setLoading(false);
  };

  // Custom premium date formatting matching LeetCode: "Sun, Jun 7, 08:00 GMT+05:30"
  const formatContestDate = (d) => {
    const date = new Date(d);
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    const dateStr = date.toLocaleDateString('en-US', options);
    
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    const offsetMinutes = date.getTimezoneOffset();
    const offsetHours = Math.abs(offsetMinutes / 60);
    const offsetSign = offsetMinutes <= 0 ? '+' : '-';
    const offsetHoursStr = String(Math.floor(offsetHours)).padStart(2, '0');
    const offsetMinutesStr = String((offsetHours % 1) * 60).padStart(2, '0');
    const tzStr = `GMT${offsetSign}${offsetHoursStr}:${offsetMinutesStr}`;
    
    return `${dateStr}, ${hours}:${minutes} ${tzStr}`;
  };

  const FeaturedCard = ({ contest }) => {
    const isBiweekly = contest.type === 'biweekly' || contest.title?.toLowerCase().includes('biweekly');
    const isWeekly = !isBiweekly && (contest.type === 'weekly' || contest.title?.toLowerCase().includes('weekly') || !contest.type);
    
    const cardBg = isWeekly
      ? 'from-[#ffc837] via-[#ffa012] to-[#ff8008]'
      : 'from-[#8272f6] via-[#6352e8] to-[#402db3]';

    const footerBg = isWeekly 
      ? 'bg-[#fdf3e7] dark:bg-[#34220f]' 
      : 'bg-[#f3f0fd] dark:bg-[#201a35]';

    const alarmBg = isWeekly
      ? 'bg-[#f4e2ce] hover:bg-[#ebd7c0] text-[#c77a00] dark:bg-amber-950/40 dark:hover:bg-amber-950/60 dark:text-amber-400'
      : 'bg-[#e3dcf6] hover:bg-[#d5cceb] text-purple-700 dark:bg-purple-950/40 dark:hover:bg-purple-950/60 dark:text-purple-400';

    return (
      <div
        className="rounded-[32px] overflow-hidden bg-white dark:bg-[#1e1e1e] shadow-lg border border-black/5 dark:border-white/5 flex flex-col cursor-pointer transition-transform duration-300 hover:scale-[1.025]"
        onClick={() => navigate(`/contests/${contest._id}`)}
      >
        {/* Top half: Gradient with glass cube */}
        <div className={`relative h-[165px] bg-gradient-to-br ${cardBg} overflow-hidden flex items-center justify-center`}>
          {/* Glass Cubes overlay */}
          <div className="absolute right-12 top-1/2 -translate-y-1/2 transform scale-110">
            {isWeekly ? (
              <GlassCube size={105} className="rotate-[15deg]" cubeType="weekly" />
            ) : (
              <div className="flex items-center">
                <GlassCube size={85} className="-rotate-12 translate-x-4 z-0" cubeType="biweekly" />
                <GlassCube size={85} className="rotate-12 z-10" cubeType="biweekly" />
              </div>
            )}
          </div>

          {/* Hourglass timer pill */}
          <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-black/15 text-white backdrop-blur-md">
            <Clock className="w-3.5 h-3.5" />
            <span>{timers[contest._id] || '00:00:00'}</span>
          </div>
        </div>

        {/* Bottom half: Footer card info */}
        <div className={`${footerBg} p-5 flex items-center justify-between border-t border-black/5 dark:border-white/5`}>
          <div>
            <h3 className="text-[17px] font-bold text-slate-800 dark:text-white leading-tight">
              {contest.title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">
              {formatContestDate(contest.startTime)}
            </p>
          </div>
          <button 
            className={`w-9 h-9 rounded-full flex items-center justify-center transition ${alarmBg}`}
            onClick={(e) => {
              e.stopPropagation();
              toast.success('Reminder notification set!');
            }}
          >
            <AlarmIcon className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>
    );
  };

  const PastRow = ({ contest }) => {
    const isWeekly = contest.type === 'weekly' || contest.title?.toLowerCase().includes('weekly');
    const thumbBg = isWeekly 
      ? 'from-[#ffc837] to-[#ffa012]' 
      : 'from-[#8272f6] to-[#6352e8]';

    return (
      <div
        onClick={() => navigate(`/contests/${contest._id}`)}
        className="flex items-center justify-between px-5 py-4 hover:bg-slate-50/80 dark:hover:bg-dark-800/40 cursor-pointer transition group border-b border-slate-100 dark:border-dark-800/50 last:border-0"
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {/* Miniature card gradient thumbnail */}
          <div className={`flex-shrink-0 w-16 h-10 rounded-lg bg-gradient-to-br ${thumbBg} relative overflow-hidden flex items-center justify-center shadow-inner`}>
            <div className="absolute inset-0 bg-white/10" />
            <GlassCube size={36} className="opacity-90 rotate-6" cubeType={isWeekly ? 'weekly' : 'biweekly'} />
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-slate-800 dark:text-white text-[14px] group-hover:text-amber-500 dark:group-hover:text-amber-400 transition truncate">
              {contest.title}
            </h4>
            <p className="text-xs text-slate-400 dark:text-slate-555 font-semibold mt-0.5">
              {formatContestDate(contest.startTime)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3.5 flex-shrink-0">
          <div className="px-2.5 py-0.5 bg-slate-100 dark:bg-dark-800 text-slate-550 dark:text-slate-400 rounded-full text-xs font-semibold">
            {contest.problemsSolved || 0} / {contest.problems?.length || 4}
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/contests/${contest._id}/ranking`); }}
            className="px-3.5 py-1 rounded-full text-xs font-bold text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-900/50 bg-orange-50/50 hover:bg-orange-50 dark:bg-orange-950/10 dark:hover:bg-orange-950/20 transition"
          >
            Ranking
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/contests/${contest._id}`); }}
            className="px-3.5 py-1 rounded-full text-xs font-bold text-fuchsia-600 dark:text-fuchsia-400 border border-fuchsia-200 dark:border-fuchsia-900/50 bg-fuchsia-50/50 hover:bg-fuchsia-50 dark:bg-fuchsia-950/10 dark:hover:bg-fuchsia-950/20 transition"
          >
            Virtual
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f4f7f6] dark:bg-[#0c0c0c] text-slate-800 dark:text-slate-200 relative overflow-hidden font-sans">
      
      {/* ─── Chess Checkered Background Overlay ─── */}
      <div className="absolute inset-0 pointer-events-none opacity-60 dark:hidden" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cpolygon points='40,0 80,40 40,80 0,40' fill='rgba(0, 0, 0, 0.005)' stroke='%23e2e8f0' stroke-width='0.8'/%3E%3C/svg%3E")`,
        backgroundSize: '80px 80px',
      }} />
      <div className="absolute inset-0 pointer-events-none opacity-30 hidden dark:block" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cpolygon points='40,0 80,40 40,80 0,40' fill='rgba(255, 255, 255, 0.002)' stroke='%23334155' stroke-width='0.8'/%3E%3C/svg%3E")`,
        backgroundSize: '80px 80px',
      }} />

      {/* Header */}
      <header className="bg-white dark:bg-[#111111] border-b border-slate-200 dark:border-dark-800 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="p-2 hover:bg-slate-100 dark:hover:bg-dark-800 rounded-lg transition">
              <ChevronLeft className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            </button>
            <h1 className="text-lg font-semibold text-slate-800 dark:text-white">Contests</h1>
          </div>
          <GuestHeader />
        </div>
      </header>



      <div className="max-w-7xl mx-auto px-4 py-10 relative z-10">
        
        {/* Title / Hero */}
        <div className="text-center mb-10 flex flex-col items-center">
          <div className="mb-4">
            <TrophyIcon />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Codebattle Contest
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-[13px] mt-1 font-medium">
            Contest every week. Compete and see your ranking!
          </p>
        </div>

        {/* Featured Contest Cards Grid */}
        {displayFeatured.length === 0 ? (
          <div className="max-w-2xl mx-auto bg-white dark:bg-[#161616] border border-slate-200/60 dark:border-dark-800/80 rounded-[32px] p-10 text-center shadow-md mb-8">
            <Clock className="w-10 h-10 text-slate-350 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-850 dark:text-white">No Upcoming Contests</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
              We are currently scheduling new contests. Please check back later!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-6">
            {displayFeatured.slice(0, 2).map((c) => (
              <FeaturedCard key={c._id} contest={c} />
            ))}
          </div>
        )}

        {/* Sponsor Banner */}
        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-505 dark:text-slate-455 hover:text-slate-800 dark:hover:text-white transition cursor-pointer mt-4 mb-10 font-semibold">
          <span>🤝</span>
          <span>Sponsor a Contest</span>
        </div>

        {/* Columns: Rankings (Left) & Past Contests (Right) */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* LEFT: ELO Contest Rankings with 3D Pedestal */}
          <div className="w-full lg:w-[350px] flex-shrink-0 bg-white dark:bg-[#161616] border border-slate-200/80 dark:border-dark-800/80 rounded-[24px] p-5 shadow-md">
            
            {/* Header / Segmented Control */}
            <div className="flex items-center justify-between mb-8">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">Contest Rankings</span>
              <div className="bg-slate-100 dark:bg-dark-800 p-0.5 rounded-lg flex text-[10px] font-extrabold">
                <button className="px-3 py-1 bg-[#ffa116] text-white rounded-md shadow-sm transition">GLOBAL</button>
              </div>
            </div>

            {/* 3D Cylindrical Podium */}
            <div className="flex items-end justify-center gap-5 mt-6 mb-8 border-b border-slate-100 dark:border-dark-800/60 pb-8 min-h-[170px]">
              
              {/* 2nd place (Left Column) */}
              <PodiumPedestal rank={2} player={secondRank} heightVal={76} onPlayerClick={handleUserClick} />

              {/* 1st place (Center Column) */}
              <PodiumPedestal rank={1} player={firstRank} heightVal={98} onPlayerClick={handleUserClick} />

              {/* 3rd place (Right Column) */}
              <PodiumPedestal rank={3} player={thirdRank} heightVal={58} onPlayerClick={handleUserClick} />

            </div>

            {/* List ranks 4-10 */}
            <div className="space-y-3">
              {rankings.slice(3, 10).map((player, idx) => {
                const rankNum = idx + 4;
                return (
                  <div 
                    key={idx} 
                    onClick={() => handleUserClick(player.username)}
                    className="flex items-center justify-between p-3 bg-white dark:bg-dark-800/30 border border-slate-100/80 dark:border-dark-800/40 rounded-[20px] shadow-sm hover:shadow-md hover:bg-slate-50/80 dark:hover:bg-dark-800 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      {/* Circle encased Rank Number */}
                      <div className="w-6 h-6 rounded-full bg-slate-100/70 dark:bg-dark-800 text-slate-550 dark:text-slate-400 font-bold text-[11px] flex items-center justify-center shadow-inner">
                        {rankNum}
                      </div>
                      
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-dark-800 flex items-center justify-center font-bold overflow-hidden shadow-sm border border-slate-100 dark:border-dark-850">
                        {getPlayerAvatar(player.username)}
                      </div>
                      
                      <span className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-0.5">
                        <span className="truncate max-w-[85px]">{player.username}</span>
                      </span>
                    </div>
                    
                    {/* Two-toned Rating & Attended Stats */}
                    <div className="text-right text-[11px]">
                      <div className="text-slate-450 dark:text-slate-500 font-semibold">
                        Rating: <span className="text-slate-700 dark:text-slate-200 font-bold">{player.contestRating}</span>
                      </div>
                      <div className="text-slate-455 dark:text-slate-500 font-semibold mt-0.5">
                        Attended: <span className="text-slate-700 dark:text-slate-300 font-bold">{player.attended}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Flat centered link button */}
            <div className="text-center mt-5">
              <button 
                onClick={() => navigate('/leaderboard')}
                className="text-xs font-bold text-slate-400 hover:text-slate-605 transition"
              >
                Show More
              </button>
            </div>

          </div>

          {/* RIGHT: Segmented Past Contests Card */}
          <div className="flex-1 bg-white dark:bg-[#161616] border border-slate-200/80 dark:border-dark-800/80 rounded-2xl p-5 shadow-md w-full min-w-0">
            
            {/* Tabs + Shuffle Button */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-dark-800/60 mb-5">
              <div className="flex bg-slate-100 dark:bg-dark-800 p-0.5 rounded-full text-xs font-bold">
                <button className="px-4.5 py-1.5 bg-white dark:bg-dark-900 rounded-full text-slate-800 dark:text-white shadow-sm transition">Past Contests</button>
                <button className="px-4.5 py-1.5 text-slate-400 dark:text-slate-550 cursor-not-allowed transition">My Contests</button>
              </div>
              <button 
                onClick={() => {
                  if (pastContests.length > 0) {
                    const rnd = pastContests[Math.floor(Math.random() * pastContests.length)];
                    navigate(`/contests/${rnd._id}`);
                  }
                }}
                className="w-9 h-9 bg-fuchsia-600 hover:bg-fuchsia-700 text-white rounded-full transition shadow-md shadow-fuchsia-650/20 flex items-center justify-center transform active:scale-95" 
                title="Random Contest"
              >
                <Shuffle className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            {/* Past Contests List */}
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-slate-100 dark:border-dark-800 animate-pulse">
                    <div className="w-16 h-10 bg-slate-200 dark:bg-dark-700 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-200 dark:bg-dark-700 rounded w-1/3" />
                      <div className="h-3 bg-slate-200 dark:bg-dark-700 rounded w-1/5" />
                    </div>
                  </div>
                ))}
              </div>
            ) : pastContests.length === 0 ? (
              <div className="text-center py-16 text-slate-500 dark:text-slate-455 text-xs font-medium">
                No past contests available.
              </div>
            ) : (
              <div className="flex flex-col">
                {paginatedPast.map((c) => (
                  <PastRow key={c._id} contest={c} />
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5 mt-8 border-t border-slate-100 dark:border-dark-800/60 pt-5">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-dark-800 text-slate-550 dark:text-slate-455 disabled:opacity-40 transition"
                >
                  <ChevronLeft className="w-4.5 h-4.5 stroke-[2.2]" />
                </button>
                {[...Array(totalPages)].map((_, idx) => {
                  const pNum = idx + 1;
                  if (
                    pNum === 1 ||
                    pNum === totalPages ||
                    (pNum >= currentPage - 2 && pNum <= currentPage + 2)
                  ) {
                    return (
                      <button
                        key={idx}
                        onClick={() => setCurrentPage(pNum)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold transition flex items-center justify-center ${currentPage === pNum ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-slate-100 dark:hover:bg-dark-800 text-slate-655 dark:text-slate-400'}`}
                      >
                        {pNum}
                      </button>
                    );
                  } else if (
                    pNum === currentPage - 3 ||
                    pNum === currentPage + 3
                  ) {
                    return (
                      <span key={idx} className="text-slate-400 px-1 text-xs select-none">...</span>
                    );
                  }
                  return null;
                })}
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-dark-800 text-slate-550 dark:text-slate-455 disabled:opacity-40 transition"
                >
                  <ArrowRight className="w-4.5 h-4.5 stroke-[2.2]" />
                </button>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}