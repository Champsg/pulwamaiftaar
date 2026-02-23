import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Moon, Sun, Clock, MapPin, Calendar, ChevronDown, ChevronUp, Bell, Share2 } from 'lucide-react';
import { RAMADAN_TIMETABLE, RamadanDay } from './constants';

// Helper to parse time string like "05:49 AM" into a Date object for today
const parseTime = (timeStr: string, dateStr: string) => {
  const [day, month, year] = dateStr.split('-').map(Number);
  const [time, modifier] = timeStr.split(' ');
  let [hours, minutes] = time.split(':').map(Number);

  if (modifier === 'PM' && hours < 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;

  return new Date(year, month - 1, day, hours, minutes, 0);
};

export default function App() {
  const [now, setNow] = useState(new Date());
  const [showFullTable, setShowFullTable] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);

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

  const currentDayData = useMemo(() => {
    const todayStr = now.toLocaleDateString('en-GB').replace(/\//g, '-');
    return RAMADAN_TIMETABLE.find(d => d.date === todayStr) || null;
  }, [now]);

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

    const nextDay = RAMADAN_TIMETABLE.find(d => {
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

  const toggleTable = () => {
    setShowFullTable(!showFullTable);
    if (!showFullTable) {
      setTimeout(() => {
        tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  const handleShare = async () => {
    if (!currentDayData) return;
    const message = `Ramadan Timetable for Pulwama (Today, ${currentDayData.date}):\nSehri Ends: ${currentDayData.sehri}\nIftar Starts: ${currentDayData.iftar}\n\nCheck the full timetable here: ${window.location.href}`;
    
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

  return (
    <div className="min-h-screen flex flex-col items-center py-8 px-4 sm:px-6 lg:px-8 bg-ramadan-deep selection:bg-ramadan-gold/30 relative overflow-hidden">
      
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
          className="flex items-center justify-center gap-2 mb-3"
        >
          <MapPin className="w-4 h-4 text-ramadan-gold" aria-hidden="true" />
          <span className="text-xs uppercase tracking-[0.2em] font-bold text-ramadan-accent">Pulwama, Kashmir</span>
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
          className="glass-card rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-12 mb-8 sm:mb-12 relative overflow-hidden animate-float"
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
                    onClick={handleShare}
                    className="p-2 rounded-full bg-white/5 border border-white/10 text-ramadan-gold hover:bg-ramadan-gold/20 transition-colors"
                    title="Share today's times"
                    aria-label="Share today's Sehri and Iftar times"
                  >
                    <Share2 className="w-4 h-4" />
                  </motion.button>
                </div>
                
                <div className="mb-10">
                  <div className="flex justify-center items-center gap-3 sm:gap-8 p-4" aria-label={`Time remaining: ${countdown?.hours} hours, ${countdown?.minutes} minutes, and ${countdown?.seconds} seconds`}>
                    {[
                      { val: countdown?.hours, label: 'Hours' },
                      { val: countdown?.minutes, label: 'Minutes' },
                      { val: countdown?.seconds, label: 'Seconds' }
                    ].map((item, idx) => (
                      <div key={item.label} className="flex items-center gap-3 sm:gap-8">
                        <div className="flex flex-col items-center">
                          <span className="text-5xl sm:text-8xl font-sans font-semibold text-white tabular-nums leading-none tracking-tighter">
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

      {/* Timetable Section */}
      <section className="w-full max-w-4xl relative z-10" aria-labelledby="calendar-heading">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 px-4 gap-4">
          <h2 id="calendar-heading" className="text-2xl sm:text-3xl font-serif text-white">
            Ramadan <span className="italic text-ramadan-gold">Calendar</span>
          </h2>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTable}
            aria-expanded={showFullTable}
            aria-controls="timetable-container"
            className="w-full sm:w-auto flex items-center justify-center gap-3 px-6 py-3 rounded-full bg-ramadan-gold/10 border border-ramadan-gold/20 text-[10px] font-black uppercase tracking-[0.2em] text-ramadan-gold hover:bg-ramadan-gold hover:text-ramadan-deep transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-ramadan-gold"
          >
            {showFullTable ? 'Hide Timetable' : 'View Timetable'}
            {showFullTable ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </motion.button>
        </div>

        <AnimatePresence>
          {showFullTable && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              ref={tableRef}
              id="timetable-container"
              className="overflow-hidden rounded-[1.5rem] sm:rounded-[2.5rem] glass-card"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[400px]" role="table">
                  <thead>
                    <tr className="bg-white/[0.02]">
                      <th scope="col" className="px-2 sm:px-6 py-5 text-[8px] sm:text-[9px] uppercase tracking-[0.1em] sm:tracking-[0.2em] font-black text-ramadan-accent border-b border-white/5 whitespace-nowrap">Day</th>
                      <th scope="col" className="px-2 sm:px-6 py-5 text-[8px] sm:text-[9px] uppercase tracking-[0.1em] sm:tracking-[0.2em] font-black text-ramadan-accent border-b border-white/5 whitespace-nowrap">Date</th>
                      <th scope="col" className="px-2 sm:px-6 py-5 text-[8px] sm:text-[9px] uppercase tracking-[0.1em] sm:tracking-[0.2em] font-black text-ramadan-accent border-b border-white/5 whitespace-nowrap">Sehri Ends</th>
                      <th scope="col" className="px-2 sm:px-6 py-5 text-[8px] sm:text-[9px] uppercase tracking-[0.1em] sm:tracking-[0.2em] font-black text-ramadan-accent border-b border-white/5 whitespace-nowrap">Iftar Starts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {RAMADAN_TIMETABLE.map((day, index) => {
                      const isToday = day.date === now.toLocaleDateString('en-GB').replace(/\//g, '-');
                      return (
                        <motion.tr 
                          key={day.day}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ 
                            opacity: 1,
                            x: 0,
                            backgroundColor: isToday ? "rgba(212, 175, 55, 0.15)" : "rgba(255, 255, 255, 0)"
                          }}
                          transition={{
                            delay: index * 0.02,
                            backgroundColor: isToday ? {
                              duration: 2,
                              repeat: Infinity,
                              repeatType: "reverse"
                            } : { duration: 0.3 }
                          }}
                          className={`group transition-colors ${isToday ? '' : 'hover:bg-white/[0.02]'}`}
                          aria-current={isToday ? 'date' : undefined}
                        >
                          <td className="px-2 sm:px-6 py-5 font-mono text-[10px] sm:text-xs text-ramadan-accent/60 whitespace-nowrap">
                            {String(day.day).padStart(2, '0')}
                          </td>
                          <td className="px-2 sm:px-6 py-5 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className={`text-xs sm:text-sm font-semibold ${isToday ? 'text-white' : 'text-gray-400'}`}>
                                {day.date}
                              </span>
                              {isToday && (
                                <motion.span 
                                  animate={{ scale: [1, 1.1, 1] }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                  className="px-1.5 py-0.5 rounded text-[7px] font-black bg-ramadan-gold text-ramadan-deep uppercase tracking-tighter shadow-[0_0_10px_rgba(212,175,55,0.5)]"
                                >
                                  Today
                                </motion.span>
                              )}
                            </div>
                          </td>
                          <td className="px-2 sm:px-6 py-5 font-sans text-sm sm:text-lg font-medium text-white group-hover:text-ramadan-gold transition-colors whitespace-nowrap">
                            {day.sehri}
                          </td>
                          <td className="px-2 sm:px-6 py-5 font-sans text-sm sm:text-lg font-medium text-white group-hover:text-ramadan-gold transition-colors whitespace-nowrap">
                            {day.iftar}
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="sm:hidden text-center py-2 text-[8px] uppercase tracking-widest text-ramadan-accent/40 bg-white/[0.01]">
                ← Scroll horizontally to see Iftar time →
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Mobile-only Card View for Timetable (Optional but good for UX) */}
      <div className="sm:hidden w-full mt-4 flex flex-col gap-3">
        {/* This is already handled by the scrollable table, but we could add more mobile-specific tweaks if needed */}
      </div>

      {/* Footer */}
      <footer className="mt-16 sm:mt-24 text-center px-4">
        <div className="w-12 h-px bg-ramadan-gold/20 mx-auto mb-8"></div>
        <p className="text-[9px] uppercase tracking-[0.3em] font-black text-ramadan-accent/40 leading-loose">
          © 2026 Ramadan Timetable • Pulwama, Kashmir
          <br />
          <span className="italic font-serif normal-case tracking-normal text-xs mt-2 block">
            "O you who have believed, decreed upon you is fasting as it was decreed upon those before you that you may become righteous."
          </span>
        </p>
        <p className="mt-8 text-[10px] uppercase tracking-[0.2em] font-bold text-ramadan-gold/60">
          Made with AI by Shujaat ❤️
        </p>
      </footer>
    </div>
  );
}
