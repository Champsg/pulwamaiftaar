import React from 'react';

interface FastingProgressProps {
    currentDay: number;
}

const CrescentIcon = ({ completed }: { completed: boolean }) => (
    <svg
        viewBox="0 0 24 24"
        className={`w-5 h-5 transition-all duration-700 ease-in-out ${completed ? 'text-[rgba(212,175,55,1)] drop-shadow-[0_0_5px_rgba(212,175,55,0.7)]' : 'text-white/10'
            }`}
        fill={completed ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={completed ? "0" : "1.5"}
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
);

export default function FastingProgress({ currentDay }: FastingProgressProps) {
    const totalDays = 30;
    const clampedDay = Math.min(Math.max(currentDay, 0), totalDays);
    const remainingDays = totalDays - clampedDay;

    return (
        <div className="w-full max-w-[280px] sm:max-w-sm mx-auto mb-10 relative z-10 transition-opacity duration-1000">
            <style>{`
        .crescent-item {
          transition: transform 0.3s ease, filter 0.3s ease;
        }
        .crescent-item:hover {
          transform: scale(1.25);
          filter: drop-shadow(0 0 10px rgba(212,175,55,0.9));
        }
      `}</style>

            <div className="flex justify-between items-end mb-4 px-2">
                <div className="text-white font-serif tracking-wide leading-none">
                    <span className="text-xs uppercase tracking-widest opacity-80 mr-1">Day</span>
                    <span className="text-[rgba(212,175,55,1)] text-2xl font-bold">{clampedDay}</span>
                    <span className="text-xs opacity-60 ml-1">of {totalDays}</span>
                </div>
                <div className="text-[9px] sm:text-[10px] uppercase tracking-widest text-[rgba(212,175,55,0.8)] font-bold mb-1">
                    {remainingDays} days remaining
                </div>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-[1.5rem] p-5 sm:p-6 shadow-2xl">
                <div className="grid grid-cols-5 sm:grid-cols-6 gap-y-4 gap-x-2 place-items-center">
                    {Array.from({ length: totalDays }).map((_, idx) => {
                        const dayNum = idx + 1;
                        const isCompleted = dayNum <= clampedDay;
                        return (
                            <div
                                key={dayNum}
                                className="crescent-item cursor-default flex items-center justify-center p-1"
                                aria-label={isCompleted ? `Ramadan day ${dayNum} completed` : `Ramadan day ${dayNum} upcoming`}
                                title={`Day ${dayNum}`}
                            >
                                <CrescentIcon completed={isCompleted} />
                            </div>
                        );
                    })}
                </div>
            </div>
        </div >
    );
}
