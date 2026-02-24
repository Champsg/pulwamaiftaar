import { useState, useEffect, useCallback } from 'react';

const RAMADAN_FACTS = [
    "Ramadan shifts ~10–11 days earlier each solar year.",
    "Laylatul Qadr is described in the Quran as 'better than a thousand months'.",
    "The Islamic calendar is entirely lunar-based, depending on moon sightings.",
    "Fasting during Ramadan is one of the Five Pillars of Islam.",
    "The Quran was first revealed during the month of Ramadan.",
    "Suhoor refers to the pre-dawn meal, and Iftar to the fast-breaking meal.",
    "It is highly recommended to break the fast with dates and water.",
    "Taraweeh are special voluntary prayers performed exclusively in Ramadan."
];

// Simple inline animated crescent
const MiniMoonIcon = ({ isActive, date }: { isActive: boolean, date: number }) => {
    // Rotate the moon slightly based on the day of the month to simulate phase tilt
    const rotation = (date - 15) * 4;
    return (
        <svg
            viewBox="0 0 24 24"
            className={`w-4 h-4 transition-all duration-300 ${isActive ? 'text-ramadan-gold drop-shadow-[0_0_4px_rgba(212,175,55,0.8)] scale-125' : 'text-white/20'}`}
            style={{ transform: `rotate(${rotation}deg)` }}
            fill={isActive ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth={isActive ? "0" : "1.5"}
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
    );
};

export default function ClickableMoon({ currentDay }: { currentDay: number }) {
    const [isOpen, setIsOpen] = useState(false);
    const [fact, setFact] = useState("");
    const [showContent, setShowContent] = useState(false);

    // Use 1447 AH for 2026 Ramadan matching
    const [hijriYear] = useState(1447);

    const openModal = () => {
        const randomFact = RAMADAN_FACTS[Math.floor(Math.random() * RAMADAN_FACTS.length)];
        setFact(randomFact);
        setIsOpen(true);
        // Slight delay for content stagger
        setTimeout(() => setShowContent(true), 150);
    };

    const closeModal = useCallback(() => {
        setShowContent(false);
        setTimeout(() => setIsOpen(false), 400); // Wait for transition
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) closeModal();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, closeModal]);

    return (
        <>
            <style>{`
        @keyframes subtleFloat {
          0%, 100% { transform: translateY(0px) rotate(-5deg); }
          50% { transform: translateY(-5px) rotate(5deg); }
        }
        .moon-trigger {
          animation: subtleFloat 4s ease-in-out infinite alternate;
          filter: drop-shadow(0 0 8px rgba(212,175,55,0.3));
        }
        .moon-trigger:hover {
          filter: drop-shadow(0 0 15px rgba(212,175,55,0.8));
          transform: scale(1.1);
        }
        .easter-egg-backdrop {
          transition: opacity 0.4s ease, backdrop-filter 0.4s ease;
        }
        .easter-egg-modal {
          transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.4s ease;
        }
        .stagger-fade-in > * {
          opacity: 0;
          transform: translateY(10px);
          animation: staggerFade 0.6s ease-out forwards;
        }
        @keyframes staggerFade {
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>

            {/* Trigger Button */}
            <button
                onClick={openModal}
                className="moon-trigger absolute top-6 right-6 sm:top-10 sm:right-10 z-30 text-ramadan-gold transition-all duration-300 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-ramadan-deep focus-visible:ring-ramadan-gold rounded-full p-2 outline-none cursor-pointer hover:bg-white/5"
                aria-label="Discover Ramadan Easter Egg"
                title="Secret Lunar Panel"
            >
                <svg viewBox="0 0 24 24" className="w-8 h-8 sm:w-10 sm:h-10" fill="currentColor" stroke="none">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                    <circle cx="15" cy="8" r="1" fill="white" className="animate-pulse opacity-60" />
                </svg>
            </button>

            {/* Modal Overlay */}
            <div
                className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 easter-egg-backdrop ${isOpen ? 'opacity-100 backdrop-blur-md bg-black/40 pointer-events-auto' : 'opacity-0 backdrop-blur-none bg-black/0 pointer-events-none'}`}
                onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
                aria-hidden={!isOpen}
            >
                {/* Modal Card */}
                <div
                    className={`w-full max-w-sm sm:max-w-md bg-ramadan-surface/90 border border-ramadan-gold/30 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(212,175,55,0.15)] relative easter-egg-modal ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="easter-egg-title"
                >
                    {/* Close Button */}
                    <button
                        onClick={closeModal}
                        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                        aria-label="Close modal"
                    >
                        ✕
                    </button>

                    {showContent && (
                        <div className="stagger-fade-in space-y-8">

                            {/* Header / Hijri Date Animation */}
                            <div className="text-center mt-2" style={{ animationDelay: '0.1s' }}>
                                <h3 id="easter-egg-title" className="text-ramadan-gold uppercase tracking-widest text-[10px] sm:text-xs font-bold mb-2">Lunar Phase</h3>
                                <div className="flex justify-center items-center gap-2 text-2xl sm:text-3xl font-serif text-white">
                                    <span className="font-sans font-light">{Math.max(currentDay, 1)}</span>
                                    <span>Ramadan</span>
                                    <span className="font-sans font-light text-white/50">{hijriYear} AH</span>
                                </div>
                            </div>

                            {/* Lunar Calendar Grid View */}
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 shadow-inner" style={{ animationDelay: '0.3s' }}>
                                <div className="grid grid-cols-6 gap-x-2 gap-y-3 place-items-center">
                                    {Array.from({ length: 30 }).map((_, i) => {
                                        const day = i + 1;
                                        const isActive = day === currentDay;
                                        return (
                                            <div key={day} className="flex flex-col items-center gap-1" title={`Ramadan ${day}`}>
                                                <MiniMoonIcon isActive={isActive} date={day} />
                                                <span className={`text-[7px] tabular-nums ${isActive ? 'text-ramadan-gold font-bold' : 'text-white/30'}`}>
                                                    {day}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Random Ramadan Fact */}
                            <div className="bg-ramadan-gold/10 border border-ramadan-gold/20 rounded-2xl p-4 sm:p-5 relative overflow-hidden" style={{ animationDelay: '0.5s' }}>
                                <span className="absolute -top-4 -right-2 text-7xl text-ramadan-gold/10 font-serif leading-none">"</span>
                                <p className="text-sm sm:text-base text-ramadan-accent italic leading-relaxed text-center font-serif relative z-10">
                                    {fact}
                                </p>
                            </div>

                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
