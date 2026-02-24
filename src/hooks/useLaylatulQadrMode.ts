import { useMemo } from 'react';

export default function useLaylatulQadrMode(currentDay: number) {
    const isActive = currentDay >= 21 && currentDay <= 30;

    const extraStars = useMemo(() => {
        if (!isActive) return [];
        return Array.from({ length: 40 }).map((_, i) => ({
            id: `lq-star-${i}`,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            size: Math.random() * 2.5 + 1,
            duration: `${Math.random() * 15 + 15}s`, // slow animation
            delay: `${Math.random() * 10}s`,
        }));
    }, [isActive]);

    return { isActive, extraStars };
}
