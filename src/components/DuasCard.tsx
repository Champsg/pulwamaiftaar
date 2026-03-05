import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp } from 'lucide-react';

export default function DuasCard() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <section className="w-full relative z-10" aria-labelledby="duas-heading">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
                <h2 id="duas-heading" className="text-xl sm:text-2xl font-serif text-white flex items-center gap-3">
                    Iftar <span className="italic text-ramadan-gold">Duas</span>
                </h2>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsOpen(!isOpen)}
                    aria-expanded={isOpen}
                    aria-controls="duas-container"
                    className="btn-shimmer w-full sm:w-auto flex items-center justify-center gap-3 px-6 py-3 rounded-full bg-ramadan-gold/10 border border-ramadan-gold/20 text-[10px] font-black uppercase tracking-[0.2em] text-ramadan-gold hover:bg-ramadan-gold hover:text-ramadan-deep transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-ramadan-gold"
                >
                    {isOpen ? 'Hide Duas' : 'View Duas'}
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </motion.button>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        id="duas-container"
                        className="overflow-hidden rounded-[1.5rem] sm:rounded-[2rem] glass-card mt-6"
                    >
                        <div className="p-4 sm:p-8 space-y-8">

                            {/* First Dua */}
                            <div className="text-center space-y-4">
                                <div className="inline-flex items-center justify-center gap-2 text-ramadan-gold/80 mb-2">
                                    <BookOpen className="w-4 h-4" />
                                    <span className="text-xs uppercase tracking-widest font-bold">Dua 1</span>
                                </div>
                                <p className="text-3xl sm:text-4xl md:text-5xl font-arabic text-white leading-loose sm:leading-loose md:leading-loose text-shadow-glow py-4 rounded-xl bg-white/[0.02] border border-white/[0.05]" dir="rtl">
                                    اَللّٰهُمَّ اِنِّی لَكَ صُمْتُ وَبِكَ اٰمَنْتُ وَعَلَيْكَ تَوَكَّلْتُ وَعَلٰی رِزْقِكَ اَفْطَرْتُ
                                </p>
                                <div className="space-y-2 mt-4">
                                    <p className="text-sm sm:text-base text-gray-300 italic font-serif">
                                        "Allahumma inni laka sumtu, wa bika aamantu, wa 'alayka tawakkaltu, wa 'ala rizqika aftartu."
                                    </p>
                                    <p className="text-xs sm:text-sm text-ramadan-accent/80">
                                        O Allah, I fasted for You and I believe in You and I put my trust in You and I break my fast with Your sustenance.
                                    </p>
                                </div>
                            </div>

                            <div className="w-24 h-px bg-gradient-to-r from-transparent via-ramadan-gold/30 to-transparent mx-auto"></div>

                            {/* Second Dua */}
                            <div className="text-center space-y-4">
                                <div className="inline-flex items-center justify-center gap-2 text-ramadan-gold/80 mb-2">
                                    <BookOpen className="w-4 h-4" />
                                    <span className="text-xs uppercase tracking-widest font-bold">Dua 2</span>
                                </div>
                                <p className="text-3xl sm:text-4xl md:text-5xl font-arabic text-white leading-loose sm:leading-loose md:leading-loose text-shadow-glow py-4 rounded-xl bg-white/[0.02] border border-white/[0.05]" dir="rtl">
                                    ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ وَثَبَتَ الأَجْرُ إِنْ شَاءَ اللهُ
                                </p>
                                <div className="space-y-2 mt-4">
                                    <p className="text-sm sm:text-base text-gray-300 italic font-serif">
                                        "Dhahabaz-zama'u wabtallatil-'urooqu, wa thabatal-ajru in shaa' Allah."
                                    </p>
                                    <p className="text-xs sm:text-sm text-ramadan-accent/80">
                                        The thirst is gone, the veins are moistened, and the reward is confirmed, if Allah wills.
                                    </p>
                                </div>
                            </div>

                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}
