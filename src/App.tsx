import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Moon, Sun, Clock, MapPin, Calendar, ChevronDown, ChevronUp, Bell, Share2, Settings, X } from 'lucide-react';
import { RAMADAN_TIMETABLE, RamadanDay, REGIONS, Region } from './constants';
import FastingProgress from './components/FastingProgress';
import useLaylatulQadrMode from './hooks/useLaylatulQadrMode';
import useTimeSpeedPerceptionMode from './hooks/useTimeSpeedPerceptionMode';
import ClickableMoon from './components/ClickableMoon';
import DuasCard from './components/DuasCard';

// Helper to parse time string like "05:49 AM" into a Date object for today
const parseTime = (timeStr: string, dateStr: string) => {
  const [day, month, year] = dateStr.split('-').map(Number);
  const [time, modifier] = timeStr.split(' ');
  let [hours, minutes] = time.split(':').map(Number);

  if (modifier === 'PM' && hours < 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;

  return new Date(year, month - 1, day, hours, minutes, 0);
};

// Helper to add offset to a time string
const applyOffset = (timeStr: string, offsetMinutes: number) => {
  const [time, modifier] = timeStr.split(' ');
  let [hours, minutes] = time.split(':').map(Number);

  if (modifier === 'PM' && hours < 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;

  const date = new Date(2026, 0, 1, hours, minutes + offsetMinutes);
  let newH = date.getHours();
  let newM = date.getMinutes();
  const newAmpm = newH >= 12 ? 'PM' : 'AM';
  newH = newH % 12;
  newH = newH ? newH : 12;
  return String(newH).padStart(2, '0') + ':' + String(newM).padStart(2, '0') + ' ' + newAmpm;
};

// Helper to reliably get local storage values
const getStoredVal = <T,>(key: string, defaultVal: T): T => {
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultVal;
  } catch {
    return defaultVal;
  }
};

const LanternSVG = ({ className, style }: { className?: string, style?: any, key?: any }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 2h8l1 4H7z" />
    <path d="M7 6v12h10V6z" />
    <path d="M12 18v4" />
    <path d="M9 22h6" />
    <path d="M12 2v-2" />
    <path d="M12 6v12" />
    <path d="M9 6v12" />
    <path d="M15 6v12" />
  </svg>
);

export default function App() {
  const [now, setNow] = useState(new Date());

  const [selectedRegion, setSelectedRegion] = useState<Region>(() => {
    const stored = getStoredVal<Region | null>('ramadan_region', null);
    if (stored) {
      const found = REGIONS.find(r => r.name === stored.name);
      if (found) return found;
    }
    return REGIONS[1];
  });

  const [showSettings, setShowSettings] = useState(false);
  const [animationStyle, setAnimationStyle] = useState(() => getStoredVal('ramadan_anim', 'none'));
  const [showVisualEffects, setShowVisualEffects] = useState(() => getStoredVal('ramadan_visuals', true));
  const [showDuas, setShowDuas] = useState(() => getStoredVal('ramadan_duas', true));

  // Save settings automatically
  useEffect(() => {
    window.localStorage.setItem('ramadan_region', JSON.stringify(selectedRegion));
    window.localStorage.setItem('ramadan_anim', JSON.stringify(animationStyle));
    window.localStorage.setItem('ramadan_visuals', JSON.stringify(showVisualEffects));
    window.localStorage.setItem('ramadan_duas', JSON.stringify(showDuas));
  }, [selectedRegion, animationStyle, showVisualEffects, showDuas]);

  // Generate random stars once
  const stars = useMemo(() => {
    return Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 2 + 1,
      duration: `${Math.random() * 3 + 2}s`,
      delay: `${Math.random() * 5}s`,
    }));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const activeTimetable = useMemo(() => {
    return RAMADAN_TIMETABLE.map(day => ({
      ...day,
      sehri: applyOffset(day.sehri, selectedRegion.offset),
      iftar: applyOffset(day.iftar, selectedRegion.offset)
    }));
  }, [selectedRegion]);

  const currentDayData = useMemo(() => {
    const todayStr = now.toLocaleDateString('en-GB').replace(/\//g, '-');
    return activeTimetable.find(d => d.date === todayStr) || null;
  }, [now, activeTimetable]);

  const nextEvent = useMemo(() => {
    if (currentDayData) {
      const sehriTime = parseTime(currentDayData.sehri, currentDayData.date);
      const iftarTime = parseTime(currentDayData.iftar, currentDayData.date);

      if (now < sehriTime) {
        return { type: 'Sehri', time: sehriTime, label: 'Sehri Ends In' };
      }
      if (now < iftarTime) {
        return { type: 'Iftar', time: iftarTime, label: 'Iftar Starts In' };
      }
    }

    const nextDay = activeTimetable.find(d => {
      const dDate = parseTime(d.sehri, d.date);
      return dDate > now;
    });

    if (nextDay) {
      return { type: 'Sehri', time: parseTime(nextDay.sehri, nextDay.date), label: 'Next Sehri Ends In' };
    }

    return null;
  }, [now, currentDayData]);

  const countdown = useMemo(() => {
    if (!nextEvent) return null;
    const diff = nextEvent.time.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return { hours, minutes, seconds };
  }, [nextEvent, now]);

  const fastProgress = useMemo(() => {
    if (!currentDayData || !nextEvent) return { completedHours: 0, percent: 0, isFasting: false };
    if (nextEvent.type === 'Iftar') {
      const sehriTime = parseTime(currentDayData.sehri, currentDayData.date);
      const iftarTime = parseTime(currentDayData.iftar, currentDayData.date);
      const total = iftarTime.getTime() - sehriTime.getTime();
      const passed = now.getTime() - sehriTime.getTime();
      const percent = Math.min(Math.max((passed / total) * 100, 0), 100);
      const completedHours = Math.max(0, Math.floor(passed / (1000 * 60 * 60)));
      return { completedHours, percent, isFasting: true };
    }
    return { completedHours: 0, percent: 0, isFasting: false };
  }, [now, currentDayData, nextEvent]);

  const progressStars = useMemo(() => {
    return Array.from({ length: 20 }).map((_, i) => ({
      id: `pstar-${i}`,
      top: `${Math.random() * 80 + 10}%`,
      left: `${Math.random() * 90 + 5}%`,
      delay: `${Math.random() * 5}s`
    }));
  }, []);

  const lanterns = useMemo(() => {
    return Array.from({ length: 5 }).map((_, i) => ({
      id: `lantern-${i}`,
      left: `${15 + Math.random() * 70}%`,
      duration: `${Math.random() * 15 + 20}s`,
      delay: `${Math.random() * 10}s`,
      size: Math.random() * 16 + 24,
    }));
  }, []);

  const [particles, setParticles] = useState<Array<{ id: number, dx: number, dy: number, size: number, duration: number }>>([]);
  const [isExploding, setIsExploding] = useState(false);
  const particleId = useRef(0);
  const prevEventInfo = useRef<{ type: string, time: number } | null>(null);

  const { isActive: lqModeActive, extraStars: lqStars } = useLaylatulQadrMode(currentDayData?.day || 0);

  const remainingSeconds = useMemo(() => {
    if (nextEvent?.type === 'Iftar' && countdown) {
      return countdown.hours * 3600 + countdown.minutes * 60 + countdown.seconds;
    }
    return Infinity;
  }, [nextEvent, countdown]);

  const { isPerceptionActive } = useTimeSpeedPerceptionMode(remainingSeconds);

  // Normal particle tick
  useEffect(() => {
    if (!countdown) return;
    const dx = (Math.random() - 0.5) * 80;
    const dy = -(Math.random() * 80 + 20);
    const newParticle = {
      id: particleId.current++,
      dx, dy,
      size: Math.random() * 3 + 2,
      duration: Math.random() * 2 + 2,
    };
    setParticles(prev => [...prev.slice(-25), newParticle]);
    const timer = setTimeout(() => {
      setParticles(prev => prev.filter(p => p.id !== newParticle.id));
    }, newParticle.duration * 1000);
    return () => clearTimeout(timer);
  }, [countdown?.seconds]);

  // Explosion effect
  useEffect(() => {
    if (nextEvent) {
      if (
        prevEventInfo.current &&
        prevEventInfo.current.type === 'Iftar' &&
        nextEvent.time.getTime() !== prevEventInfo.current.time
      ) {
        setIsExploding(true);
        setTimeout(() => setIsExploding(false), 2000);
        const explosionParticles: any[] = [];
        const count = 45;
        for (let i = 0; i < count; i++) {
          const angle = (Math.PI * 2 * i) / count + (Math.random() * 0.2);
          const distance = 100 + Math.random() * 150;
          explosionParticles.push({
            id: particleId.current++,
            dx: Math.cos(angle) * distance,
            dy: Math.sin(angle) * distance,
            size: Math.random() * 5 + 3,
            duration: Math.random() * 1.5 + 1.5,
          });
        }
        setParticles(prev => [...prev.slice(-10), ...explosionParticles]);
        setTimeout(() => {
          setParticles(prev => prev.filter(p => !explosionParticles.find(ep => ep.id === p.id)));
        }, 3500);
      }
      prevEventInfo.current = { type: nextEvent.type, time: nextEvent.time.getTime() };
    }
  }, [nextEvent]);

  const handleShare = async () => {
    if (!currentDayData) return;
    const message = `Ramadan Timetable for ${selectedRegion.name} (Fiqah Hanafiya - Dar-ul-uloom Raheemiya)\nToday, ${currentDayData.date}:\nSehri Ends: ${currentDayData.sehri}\nIftar Starts: ${currentDayData.iftar}\n\nCheck the full timetable here: ${window.location.href}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Ramadan Timetable - Pulwama',
          text: message,
          url: window.location.href,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(message);
        alert('Timetable copied to clipboard!');
      } catch (err) {
        console.error('Error copying:', err);
      }
    }
  };

  let countdownGlowClass = '';
  if (nextEvent?.type === 'Iftar' && countdown) {
    const totalSecs = countdown.hours * 3600 + countdown.minutes * 60 + countdown.seconds;
    if (totalSecs < 60) {
      countdownGlowClass = 'glow-pulse-1m';
    } else if (totalSecs < 900) {
      countdownGlowClass = 'glow-pulse-15m';
    } else if (totalSecs < 3600) {
      countdownGlowClass = 'glow-solid-1h';
    }
  }

  return (
    <div className={`min-h-screen flex flex-col items-center py-8 px-4 sm:px-6 lg:px-8 bg-ramadan-deep selection:bg-ramadan-gold/30 relative overflow-hidden transition-colors duration-1000 ${lqModeActive ? 'lq-active' : ''} ${isPerceptionActive ? 'perception-active' : ''}`}>
      <ClickableMoon currentDay={currentDayData?.day || 0} />

      <style>{`
        @keyframes floatParticle {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
          10% { opacity: 1; filter: blur(0px); }
          100% { transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(0); opacity: 0; filter: blur(2px); }
        }
        .timer-particle {
          position: absolute;
          left: 50%;
          top: 50%;
          background: radial-gradient(circle, #FFD700 30%, rgba(212,175,55,0.8) 60%, transparent 100%);
          border-radius: 50%;
          pointer-events: none;
          animation: floatParticle var(--duration) cubic-bezier(0.25, 1, 0.5, 1) forwards;
          will-change: transform, opacity;
          box-shadow: 0 0 6px rgba(212,175,55,0.5);
          z-index: 0;
        }
        @keyframes explosionGlow {
          0% { filter: drop-shadow(0 0 0px rgba(212,175,55,0)); }
          20% { filter: drop-shadow(0 0 40px rgba(212,175,55,0.8)); }
          100% { filter: drop-shadow(0 0 0px rgba(212,175,55,0)); }
        }
        .timer-explosion {
          animation: explosionGlow 2s ease-out forwards;
        }
        .progress-star {
          position: absolute;
          width: 3px;
          height: 3px;
          border-radius: 50%;
          transition: opacity 0.8s ease-out, transform 0.8s ease-out, box-shadow 2s ease-out, background 2s ease-out;
          will-change: opacity, transform, box-shadow, background;
        }
        .progress-star.is-visible {
          animation: progressStarTwinkle 4s ease-in-out infinite alternate;
        }
        @keyframes progressStarTwinkle {
          0% { opacity: 0.4; transform: scale(0.8); }
          100% { opacity: 1; transform: scale(1.2); }
        }
        .magic-moon {
          position: absolute;
          top: 15%;
          right: 5%;
          color: rgba(212,175,55,0.4);
          filter: drop-shadow(0 0 20px rgba(212,175,55,0.4));
          transition: opacity 2.5s ease-out, transform 4s ease-out;
          will-change: opacity, transform;
        }
        @keyframes progressPulse {
          0%, 100% { box-shadow: 0 0 10px rgba(212,175,55,0.5); filter: brightness(1); }
          50% { box-shadow: 0 0 20px rgba(212,175,55,1); filter: brightness(1.2); }
        }
        .progress-fill-glow-med {
          box-shadow: 0 0 10px rgba(212,175,55,0.4);
        }
        .progress-fill-glow-high {
          animation: progressPulse 2s ease-in-out infinite;
          will-change: box-shadow, filter;
        }
        .progress-fill-complete {
          box-shadow: 0 0 25px rgba(255,215,0,1);
        }
        @keyframes fadeIn {
          0% { opacity: 0; filter: blur(2px); transform: translateY(-2px); }
          100% { opacity: 1; filter: blur(0px); transform: translateY(0); }
        }
        .animate-fade {
          animation: fadeIn 0.3s ease-out forwards;
          display: inline-block;
          will-change: opacity, filter, transform;
        }
        @keyframes flipVertical {
          0% { transform: perspective(400px) rotateX(-90deg); opacity: 0; transform-origin: top; }
          100% { transform: perspective(400px) rotateX(0deg); opacity: 1; transform-origin: top; }
        }
        .animate-flip { animation: flipVertical 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; display: inline-block; backface-visibility: hidden; will-change: transform, opacity; }

        @keyframes popIn {
          0% { transform: scale(0.8); opacity: 0; filter: blur(4px); }
          50% { transform: scale(1.05); filter: blur(0px); }
          100% { transform: scale(1); opacity: 1; filter: blur(0px); }
        }
        .animate-pop { animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; display: inline-block; will-change: transform, opacity, filter; }

        @keyframes slideUp {
          0% { transform: translateY(20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up { animation: slideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; display: inline-block; will-change: transform, opacity; }

        .animate-none { display: inline-block; }
        .glow-solid-1h { box-shadow: 0 0 30px rgba(212,175,55,0.15) !important; transition: box-shadow 1s ease; }
        .glow-pulse-15m { animation: pulse15m 3s infinite alternate; }
        .glow-pulse-1m { animation: pulse1m 1.5s infinite alternate; }
        @keyframes pulse15m {
          0% { box-shadow: 0 0 30px rgba(212,175,55,0.1) !important; filter: brightness(1); }
          100% { box-shadow: 0 0 50px rgba(212,175,55,0.3) !important; filter: brightness(1.05); }
        }
        @keyframes pulse1m {
          0% { box-shadow: 0 0 40px rgba(212,175,55,0.2) !important; filter: brightness(1.05); }
          100% { box-shadow: 0 0 70px rgba(212,175,55,0.6) !important; filter: brightness(1.15); }
        }
        .btn-shimmer {
          position: relative;
          overflow: hidden;
        }
        .btn-shimmer::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 50%;
          height: 100%;
          background: linear-gradient(to right, transparent, rgba(212,175,55,0.3), transparent);
          transform: skewX(-20deg);
          transition: none;
        }
        .btn-shimmer:hover::before {
          animation: shimmerSlide 0.6s ease-out;
        }
        @keyframes shimmerSlide {
          100% { left: 200%; }
        }
        @keyframes floatUpSVG {
          0% { transform: translateY(10vh) rotate(-3deg); opacity: 0; }
          10% { opacity: 0.15; }
          90% { opacity: 0.15; }
          100% { transform: translateY(-110vh) rotate(3deg); opacity: 0; }
        }
        .lantern-float {
          animation: floatUpSVG linear infinite;
          will-change: transform, opacity;
        }
        .lq-overlay {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: radial-gradient(circle at top, rgba(212,175,55,0.08) 0%, transparent 70%);
          z-index: 0;
          transition: opacity 2s ease-in-out;
        }
        .lq-twinkle {
          animation: floatUpSVG var(--duration) linear infinite alternate;
          filter: drop-shadow(0 0 3px rgba(255,255,255,0.8));
          opacity: 0.8;
          background: white;
          border-radius: 50%;
        }
        .lq-banner {
          border: 1px solid rgba(212,175,55,0.4);
          background: rgba(212,175,55,0.05);
          box-shadow: 0 0 15px rgba(212,175,55,0.15);
          animation: lqBannerFade 2s ease-out forwards;
        }
        @keyframes lqBannerFade {
          0% { opacity: 0; transform: translateY(-10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .lq-card-glow {
          box-shadow: 0 0 40px rgba(212,175,55,0.08) !important;
          animation: lqBreathingGlow 4s ease-in-out infinite alternate !important;
        }
        @keyframes lqBreathingGlow {
          0% { box-shadow: 0 0 30px rgba(212,175,55,0.08); border-color: rgba(255,255,255,0.05); }
          100% { box-shadow: 0 0 60px rgba(212,175,55,0.15); border-color: rgba(212,175,55,0.2); }
        }
        .lq-active .text-ramadan-gold {
          color: #FFE66D;
          text-shadow: 0 0 8px rgba(255,230,109,0.3);
          transition: color 2s ease;
        }
        .lq-active .lantern-float {
          filter: drop-shadow(0 0 8px rgba(212,175,55,0.5));
          transition: filter 2s ease;
        }
        .perception-overlay {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at center, rgba(212,175,55,0.06) 0%, transparent 100%);
          opacity: 0;
          pointer-events: none;
          transition: opacity 3s ease-in-out;
          z-index: 1;
        }
        .perception-active .perception-overlay {
          opacity: 1;
        }
        .perception-heartbeat {
          animation: perceptionPulse 3s ease-in-out infinite alternate;
        }
        @keyframes perceptionPulse {
          0% { transform: scale(1); filter: drop-shadow(0 0 10px rgba(212,175,55,0.0)); }
          100% { transform: scale(1.02); filter: drop-shadow(0 0 40px rgba(212,175,55,0.15)); }
        }
      `}</style>

      {showVisualEffects && (
        <>
          {/* Starry Background */}
          <div className="fixed inset-0 pointer-events-none z-0">
            {stars.map((star) => (
              <div
                key={star.id}
                className="star"
                style={{
                  top: star.top,
                  left: star.left,
                  width: `${star.size}px`,
                  height: `${star.size}px`,
                  '--duration': star.duration,
                  '--delay': star.delay,
                } as any}
              />
            ))}
          </div>

          <div className={`lq-overlay ${lqModeActive ? 'opacity-100' : 'opacity-0'}`} />
          <div className="perception-overlay" />

          {/* LQ Extra Stars */}
          <div className={`fixed inset-0 pointer-events-none z-0 transition-opacity duration-[3s] ${lqModeActive ? 'opacity-100' : 'opacity-0'}`}>
            {lqStars.map((star) => (
              <div
                key={star.id}
                className="star lq-twinkle absolute"
                style={{
                  top: star.top,
                  left: star.left,
                  width: `${star.size}px`,
                  height: `${star.size}px`,
                  animationDuration: star.duration,
                  animationDelay: star.delay,
                } as any}
              />
            ))}
          </div>

          {/* Star Progress Counter */}
          <div id="star-sky" className="fixed inset-0 pointer-events-none z-0">
            {progressStars.map((star, i) => {
              const isVisible = fastProgress.isFasting && i < fastProgress.completedHours;
              const isMagicHour = fastProgress.percent > 80;
              return (
                <div
                  key={star.id}
                  className={`progress-star ${isVisible ? 'is-visible opacity-100 scale-100' : 'opacity-0 scale-50'}`}
                  style={{
                    top: star.top,
                    left: star.left,
                    animationDelay: star.delay,
                    boxShadow: isMagicHour ? '0 0 12px 2px rgba(212,175,55,0.8)' : '0 0 6px 1px rgba(255,255,255,0.4)',
                    background: isMagicHour ? '#FFD700' : '#FFF'
                  } as any}
                />
              );
            })}
            {/* Magic Moon */}
            <div className={`magic-moon ${fastProgress.isFasting && fastProgress.percent > 80 ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
              <Moon className="w-32 h-32 sm:w-48 sm:h-48" strokeWidth={0.5} />
            </div>
          </div>

          {/* Floating Lanterns */}
          <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            {lanterns.map((lantern) => (
              <LanternSVG
                key={lantern.id}
                className="lantern-float absolute text-ramadan-gold"
                style={{
                  left: lantern.left,
                  bottom: '-50px',
                  width: `${lantern.size}px`,
                  height: `${lantern.size}px`,
                  animationDuration: lantern.duration,
                  animationDelay: lantern.delay,
                } as any}
              />
            ))}
          </div>
        </>
      )}

      {/* Skip Link for Accessibility */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-ramadan-gold text-ramadan-deep px-4 py-2 rounded-lg font-bold">
        Skip to main content
      </a>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8 sm:mb-12 relative z-10"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col items-center justify-center gap-2 mb-4"
        >
          <div className="flex items-center gap-2 relative z-50">
            <MapPin className="w-4 h-4 text-ramadan-gold shrink-0" aria-hidden="true" />
            <div className="relative">
              <select
                value={selectedRegion.name}
                onChange={(e) => setSelectedRegion(REGIONS.find(r => r.name === e.target.value) || REGIONS[1])}
                className="bg-transparent text-xs sm:text-[13px] uppercase tracking-[0.05em] font-black text-white/90 outline-none cursor-pointer appearance-none pr-5 hover:text-ramadan-gold transition-colors border-b border-dashed border-white/20 pb-0.5 max-w-[200px] sm:max-w-none text-ellipsis"
              >
                {REGIONS.map(r => (
                  <option key={r.name} value={r.name} className="bg-ramadan-deep text-white">{r.name}</option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 text-ramadan-gold absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
          <span className="text-[10px] sm:text-xs text-ramadan-gold/80 italic font-serif border border-ramadan-gold/20 px-3 py-1 rounded-full bg-white/[0.02] backdrop-blur-sm shadow-[0_0_10px_rgba(212,175,55,0.05)] mt-1">
            Based on Fiqah Hanafiya (Dar-ul-uloom Raheemiya)
          </span>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-4xl sm:text-7xl font-serif font-light text-white tracking-tight mb-4"
        >
          Ramadan <span className="italic text-ramadan-gold text-glow">Kareem</span>
        </motion.h1>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-400 font-mono" aria-label="Current date and time"
        >
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-ramadan-gold/60" aria-hidden="true" />
            {now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
          <div className="flex items-center gap-2" aria-live="polite">
            <Clock className="w-4 h-4 text-ramadan-gold/60" aria-hidden="true" />
            {now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
        </motion.div>
      </motion.header>

      {/* Main Countdown Card */}
      <main id="main-content" className="w-full max-w-2xl relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className={`glass-card rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-12 mb-8 sm:mb-12 relative overflow-hidden animate-float ${countdownGlowClass} ${lqModeActive ? 'lq-card-glow' : ''}`}
          role="region"
          aria-label="Countdown to next Ramadan event"
        >
          {/* Decorative Background Elements */}
          <div className="absolute -top-12 -right-12 opacity-[0.03] pointer-events-none">
            <Moon className="w-64 h-64" />
          </div>

          <div className="relative z-10 text-center">
            {nextEvent ? (
              <>
                {lqModeActive && (
                  <div
                    className="w-full max-w-sm mx-auto mb-8 p-3 rounded-2xl lq-banner text-center"
                    role="status"
                    aria-live="polite"
                  >
                    <p className="text-white font-serif text-sm sm:text-base leading-relaxed">
                      Last 10 Nights of Ramadan <span className="inline-block animate-pulse ml-1 opacity-80 text-ramadan-gold">🌙</span><br />
                      <span className="text-ramadan-gold text-xs sm:text-sm italic tracking-wide">Seek Laylatul Qadr — The Night of Power</span>
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-center gap-3 mb-8">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-ramadan-gold/10 border border-ramadan-gold/20 text-ramadan-gold text-[10px] font-black uppercase tracking-[0.2em]"
                  >
                    <Bell className="w-3 h-3 animate-pulse" />
                    {nextEvent.label}
                  </motion.div>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowSettings(true)}
                    className="btn-shimmer p-2 rounded-full bg-white/5 border border-white/10 text-ramadan-gold hover:bg-ramadan-gold/20 transition-colors"
                    title="Settings"
                    aria-label="Settings"
                  >
                    <Settings className="w-4 h-4" />
                  </motion.button>
                </div>

                <div className={`mb-10 relative flex justify-center items-center ${isExploding ? 'timer-explosion' : ''}`}>
                  {/* Particle Layer */}
                  {showVisualEffects && (
                    <div id="particle-layer" className="absolute inset-0 pointer-events-none z-0 overflow-visible flex justify-center items-center">
                      {particles.map(p => (
                        <div
                          key={p.id}
                          className="timer-particle"
                          style={{
                            width: `${p.size}px`,
                            height: `${p.size}px`,
                            '--dx': `${p.dx}px`,
                            '--dy': `${p.dy}px`,
                            '--duration': `${p.duration}s`,
                          } as any}
                        />
                      ))}
                    </div>
                  )}

                  <div className={`relative z-10 flex justify-center items-center gap-3 sm:gap-8 p-4 ${isPerceptionActive ? 'perception-heartbeat' : ''}`} aria-label={`Time remaining: ${countdown?.hours} hours, ${countdown?.minutes} minutes, and ${countdown?.seconds} seconds`}>
                    {[
                      { val: countdown?.hours, label: 'Hours' },
                      { val: countdown?.minutes, label: 'Minutes' },
                      { val: countdown?.seconds, label: 'Seconds' }
                    ].map((item, idx) => (
                      <div key={item.label} className="flex items-center gap-3 sm:gap-8">
                        <div className={`flex flex-col items-center transition-transform duration-500 ease-out ${isPerceptionActive ? 'scale-[1.06]' : 'scale-100'}`}>
                          <span key={item.val} className={`animate-${animationStyle} text-5xl sm:text-8xl font-sans font-semibold text-white tabular-nums leading-none tracking-tighter block`}>
                            {String(item.val).padStart(2, '0')}
                          </span>
                          <span className="text-[9px] uppercase tracking-[0.2em] font-black text-ramadan-accent mt-3">{item.label}</span>
                        </div>
                        {idx < 2 && (
                          <span className="text-3xl sm:text-5xl font-serif text-ramadan-gold/30 mb-6" aria-hidden="true">:</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Fasting Completed Percentage Bar */}
                {fastProgress.isFasting && (
                  <div className="w-full max-w-[280px] sm:max-w-[340px] mx-auto mb-10">
                    <div className="flex justify-between text-[10px] sm:text-xs font-bold uppercase tracking-widest text-ramadan-accent mb-3 transition-colors duration-500 hover:text-ramadan-gold">
                      <span>Fasting Completed</span>
                      <span className="text-ramadan-gold tabular-nums text-glow">{Math.floor(fastProgress.percent)}%</span>
                    </div>
                    <div className="h-2 sm:h-2.5 w-full bg-white/[0.08] rounded-full overflow-hidden border border-white/5">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r from-[#d4af37] to-[#ffd700] transition-all duration-1000 ease-out ${fastProgress.percent === 100 ? 'progress-fill-complete' : fastProgress.percent > 75 ? 'progress-fill-glow-high' : fastProgress.percent > 50 ? 'progress-fill-glow-med' : ''}`}
                        style={{ width: `${Math.floor(fastProgress.percent)}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 sm:gap-6 pt-8 border-t border-white/5">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="flex flex-col items-center p-4 sm:p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors group cursor-default"
                  >
                    <div className="flex items-center gap-2 text-ramadan-accent text-[9px] uppercase tracking-[0.2em] font-black mb-2">
                      <Sun className="w-3 h-3 group-hover:text-ramadan-gold transition-colors" aria-hidden="true" /> Sehri
                    </div>
                    <span className="text-xl sm:text-3xl font-sans font-medium text-white group-hover:text-ramadan-gold transition-colors">
                      {currentDayData?.sehri || '---'}
                    </span>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="flex flex-col items-center p-4 sm:p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors group cursor-default"
                  >
                    <div className="flex items-center gap-2 text-ramadan-accent text-[9px] uppercase tracking-[0.2em] font-black mb-2">
                      <Moon className="w-3 h-3 group-hover:text-ramadan-gold transition-colors" aria-hidden="true" /> Iftar
                    </div>
                    <span className="text-xl sm:text-3xl font-sans font-medium text-white group-hover:text-ramadan-gold transition-colors">
                      {currentDayData?.iftar || '---'}
                    </span>
                  </motion.div>
                </div>

                {showDuas && (
                  <div className="mt-8 sm:mt-10 pt-8 sm:pt-10 border-t border-white/5">
                    {/* Duas Section */}
                    <DuasCard />
                  </div>
                )}

                <div className="mt-8 sm:mt-10 pt-8 sm:pt-10 border-t border-white/5">
                  {/* Fasting Progress Crescent Grid */}
                  <FastingProgress currentDay={currentDayData?.day || 0} />
                </div>
              </>
            ) : (
              <div className="py-12">
                <h2 className="text-3xl font-serif text-white mb-2">Ramadan has concluded</h2>
                <p className="text-ramadan-accent italic">Eid Mubarak to you and your family!</p>
              </div>
            )}
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="mt-16 sm:mt-24 text-center px-4">
        <div className="w-12 h-px bg-ramadan-gold/20 mx-auto mb-8"></div>
        <p className="text-[9px] uppercase tracking-[0.3em] font-black text-ramadan-accent/40 leading-loose">
          © 2026 Ramadan Timetable • {selectedRegion.name}
          <br />
          <span className="italic font-serif normal-case tracking-normal text-xs mt-2 block opacity-70">
            Timings are based on Fiqah Hanafiya (Dar-ul-uloom Raheemiya)
          </span>
        </p>
        <p className="mt-8 text-[10px] uppercase tracking-[0.2em] font-bold text-ramadan-gold/60">
          Made with AI by Shujaat ❤️
        </p>
      </footer>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-ramadan-deep border border-ramadan-gold/20 p-6 sm:p-8 rounded-3xl w-full max-w-sm relative shadow-[0_0_40px_rgba(212,175,55,0.15)] glow-pulse-1m"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setShowSettings(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xl sm:text-2xl font-serif text-white mb-8 flex items-center gap-3 border-b border-white/10 pb-4">
                <Settings className="w-5 h-5 text-ramadan-gold" />
                Timetable Settings
              </h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] sm:text-xs uppercase tracking-[0.2em] font-black text-ramadan-accent mb-3 flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    Timer Animation
                  </label>
                  <div className="relative">
                    <select
                      value={animationStyle}
                      onChange={(e) => setAnimationStyle(e.target.value)}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3.5 text-white appearance-none outline-none hover:bg-white/[0.05] focus:border-ramadan-gold/50 cursor-pointer text-sm sm:text-base transition-colors"
                    >
                      <option value="none" className="bg-ramadan-deep text-white">None (Default)</option>
                      <option value="fade" className="bg-ramadan-deep text-white">Fade In</option>
                      <option value="pop" className="bg-ramadan-deep text-white">Pop & Scale</option>
                      <option value="flip" className="bg-ramadan-deep text-white">3D Flip</option>
                      <option value="slide-up" className="bg-ramadan-deep text-white">Slide Up</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-ramadan-gold absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  <p className="text-[10px] text-gray-500 mt-2 italic px-1">Choose how the numbers change every second.</p>
                </div>

                <div className="flex items-center justify-between py-2 border-t border-white/5 pt-4">
                  <div>
                    <span className="block text-sm font-semibold text-white">Visual Effects</span>
                    <span className="text-[10px] text-gray-400">Stars, magic moon, and particles</span>
                  </div>
                  <button
                    onClick={() => setShowVisualEffects(!showVisualEffects)}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-300 ease-in-out ${showVisualEffects ? 'bg-ramadan-gold' : 'bg-white/10'}`}
                  >
                    <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 ease-in-out shadow-sm ${showVisualEffects ? 'translate-x-6' : 'translate-x-0'}`}></div>
                  </button>
                </div>

                <div className="flex items-center justify-between py-2 border-t border-white/5 pt-4">
                  <div>
                    <span className="block text-sm font-semibold text-white">Iftar Duas</span>
                    <span className="text-[10px] text-gray-400">Show dua section below countdown</span>
                  </div>
                  <button
                    onClick={() => setShowDuas(!showDuas)}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-300 ease-in-out ${showDuas ? 'bg-ramadan-gold' : 'bg-white/10'}`}
                  >
                    <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 ease-in-out shadow-sm ${showDuas ? 'translate-x-6' : 'translate-x-0'}`}></div>
                  </button>
                </div>
              </div>

              <button
                onClick={() => setShowSettings(false)}
                className="w-full mt-8 btn-shimmer py-3.5 rounded-xl bg-ramadan-gold text-sm font-black uppercase tracking-[0.2em] text-ramadan-deep hover:bg-[#FFE66D] shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:shadow-[0_0_25px_rgba(212,175,55,0.5)] transition-all active:scale-95"
              >
                Save & Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
