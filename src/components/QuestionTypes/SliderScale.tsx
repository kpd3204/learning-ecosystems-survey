import { motion } from 'framer-motion';

interface SliderScaleProps {
    value: string;
    options: string[]; // Usually ["1", "2", "3", "4", "5"]
    onChange: (val: string) => void;
    onEnter: () => void;
    lowLabel?: string;
    highLabel?: string;
}

// Generate contextual labels for all 5 positions based on the low/high endpoints
function getContextualScale(low: string, high: string): { labels: string[]; emojis: string[]; colors: string[] } {
    const l = low.toLowerCase();
    const h = high.toLowerCase();

    // Default fallback
    const defaultScale = {
        labels: [low, `Slightly ${low.toLowerCase()}`, 'Moderate', `Slightly ${high.toLowerCase()}`, high],
        emojis: ['😔', '😕', '😐', '🙂', '🤩'],
        colors: ['from-rose-500 to-rose-400', 'from-orange-500 to-orange-400', 'from-amber-500 to-amber-400', 'from-emerald-400 to-emerald-500', 'from-teal-400 to-teal-500']
    };

    // Confidence-related
    if (l.includes('confident') || h.includes('confident')) {
        return {
            labels: ['Not Confident', 'Slightly Unsure', 'Somewhat Confident', 'Fairly Confident', 'Very Confident'],
            emojis: ['😰', '😟', '🤔', '😊', '💪'],
            colors: ['from-rose-500 to-rose-400', 'from-orange-400 to-orange-300', 'from-amber-400 to-amber-300', 'from-sky-400 to-sky-500', 'from-emerald-500 to-emerald-400']
        };
    }

    // Balance-related
    if (l.includes('imbalanced') || h.includes('balanced')) {
        return {
            labels: ['Very Imbalanced', 'Somewhat Imbalanced', 'Neutral', 'Fairly Balanced', 'Well Balanced'],
            emojis: ['⚖️', '↙️', '➡️', '↗️', '✨'],
            colors: ['from-rose-500 to-rose-400', 'from-orange-400 to-orange-300', 'from-amber-400 to-amber-300', 'from-sky-400 to-sky-500', 'from-emerald-500 to-emerald-400']
        };
    }

    // Difficulty-related
    if (l.includes('easy') || h.includes('difficult') || l.includes('not difficult')) {
        return {
            labels: ['Very Easy', 'Fairly Easy', 'Moderate', 'Somewhat Difficult', 'Very Difficult'],
            emojis: ['😌', '🙂', '😐', '😓', '🥵'],
            colors: ['from-emerald-500 to-emerald-400', 'from-sky-400 to-sky-300', 'from-amber-400 to-amber-300', 'from-orange-400 to-orange-500', 'from-rose-500 to-rose-400']
        };
    }

    // Prepared-related
    if (l.includes('prepared') || h.includes('prepared') || l.includes('unprepared')) {
        return {
            labels: ['Completely Unprepared', 'Underprepared', 'Somewhat Prepared', 'Well Prepared', 'Fully Prepared'],
            emojis: ['😨', '😟', '🤔', '💼', '🎯'],
            colors: ['from-rose-500 to-rose-400', 'from-orange-400 to-orange-300', 'from-amber-400 to-amber-300', 'from-sky-400 to-sky-500', 'from-emerald-500 to-emerald-400']
        };
    }

    // Flexibility-related
    if (l.includes('flexibility') || h.includes('flexibility')) {
        return {
            labels: ['No Flexibility', 'Very Limited', 'Some Flexibility', 'Good Flexibility', 'Complete Flexibility'],
            emojis: ['🔒', '🔐', '🔓', '🚪', '🌊'],
            colors: ['from-rose-500 to-rose-400', 'from-orange-400 to-orange-300', 'from-amber-400 to-amber-300', 'from-sky-400 to-sky-500', 'from-emerald-500 to-emerald-400']
        };
    }

    // Issue / Problem severity
    if (l.includes('not an issue') || h.includes('issue') || h.includes('massive')) {
        return {
            labels: ['Not an Issue', 'Minor Concern', 'Moderate Issue', 'Significant Problem', 'Major Crisis'],
            emojis: ['✅', '💭', '⚠️', '🔥', '🚨'],
            colors: ['from-emerald-500 to-emerald-400', 'from-sky-400 to-sky-300', 'from-amber-400 to-amber-300', 'from-orange-400 to-orange-500', 'from-rose-500 to-rose-400']
        };
    }

    // Frequency-related (rarely → constantly/frequently)
    if (l.includes('rarely') || l.includes('never') || h.includes('constantly') || h.includes('always') || h.includes('frequently')) {
        return {
            labels: ['Rarely / Never', 'Occasionally', 'Sometimes', 'Often', 'Very Frequently'],
            emojis: ['🔇', '💤', '🔔', '🔊', '📣'],
            colors: ['from-slate-400 to-slate-300', 'from-sky-300 to-sky-400', 'from-amber-400 to-amber-300', 'from-blue-400 to-blue-500', 'from-indigo-500 to-indigo-400']
        };
    }

    // Passive → Active
    if (l.includes('passive') || h.includes('active')) {
        return {
            labels: ['Passive Follower', 'Mostly Passive', 'Balanced', 'Mostly Active', 'Active Problem-Solver'],
            emojis: ['🐢', '🚶', '🧭', '🏃', '🚀'],
            colors: ['from-slate-400 to-slate-300', 'from-orange-300 to-orange-400', 'from-amber-400 to-amber-300', 'from-sky-400 to-sky-500', 'from-emerald-500 to-emerald-400']
        };
    }

    // Speed-related (slow → fast)
    if (l.includes('slow') || h.includes('fast')) {
        return {
            labels: ['Very Slow', 'Slow', 'Moderate Pace', 'Fast', 'Very Fast'],
            emojis: ['🐌', '🚶', '🚗', '🚄', '⚡'],
            colors: ['from-slate-400 to-slate-300', 'from-orange-300 to-orange-400', 'from-amber-400 to-amber-300', 'from-sky-400 to-sky-500', 'from-emerald-500 to-emerald-400']
        };
    }

    // Importance-related
    if (l.includes('important') || h.includes('important')) {
        return {
            labels: ['Not Important', 'Slightly Important', 'Moderately Important', 'Important', 'Critically Important'],
            emojis: ['🔅', '💡', '⭐', '🌟', '💎'],
            colors: ['from-slate-400 to-slate-300', 'from-amber-300 to-amber-400', 'from-amber-400 to-amber-300', 'from-sky-400 to-sky-500', 'from-emerald-500 to-emerald-400']
        };
    }

    return defaultScale;
}

// Fallback generic scale
const genericScale = {
    labels: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    emojis: ['😔', '😕', '😐', '🙂', '🤩'],
    colors: ['from-rose-500 to-rose-400', 'from-orange-500 to-orange-400', 'from-amber-500 to-amber-400', 'from-emerald-400 to-emerald-500', 'from-teal-400 to-teal-500']
};

export default function SliderScale({ value, options, onChange, onEnter, lowLabel, highLabel }: SliderScaleProps) {
    const numericValue = value ? parseInt(value) : 0;
    const maxVal = options.length;

    // Get contextual scale based on the question's low/high endpoints
    const scale = (lowLabel && highLabel)
        ? getContextualScale(lowLabel, highLabel)
        : genericScale;

    const handleSelect = (v: string) => {
        onChange(v);
        setTimeout(onEnter, 400);
    };

    const getLabel = (idx: number) => scale.labels[idx] || '';
    const getEmoji = (idx: number) => scale.emojis[idx] || '🎯';
    const getColor = (idx: number) => scale.colors[idx] || 'from-blue-500 to-blue-400';

    return (
        <div className="w-full max-w-lg mt-10 relative z-10 flex flex-col items-center">

            {/* Dynamic Label Area */}
            <div className="h-20 md:h-24 flex flex-col items-center justify-center mb-4 md:mb-6 w-full">
                {numericValue > 0 ? (
                    <motion.div
                        key={value}
                        initial={{ opacity: 0, y: 10, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className="text-center"
                    >
                        <div className="text-4xl md:text-6xl mb-1 md:mb-2 drop-shadow-lg filter">{getEmoji(numericValue - 1)}</div>
                        <div className={`text-sm md:text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r ${getColor(numericValue - 1)}`}>
                            {getLabel(numericValue - 1)}
                        </div>
                    </motion.div>
                ) : (
                    <div className="text-slate-300 font-medium text-sm md:text-lg">Select a point on the scale</div>
                )}
            </div>

            {/* Endpoint Labels */}
            {(lowLabel || highLabel) && (
                <div className="flex justify-between w-full mb-3 px-1">
                    <span className="text-[10px] md:text-xs font-semibold text-rose-400 max-w-[100px] md:max-w-[120px] leading-tight">{lowLabel || ""}</span>
                    <span className="text-[10px] md:text-xs font-semibold text-teal-500 max-w-[100px] md:max-w-[120px] leading-tight text-right">{highLabel || ""}</span>
                </div>
            )}

            {/* Slider Track Nodes */}
            <div className="flex w-full justify-between items-center relative">
                <div className="absolute top-1/2 left-0 right-0 h-2 bg-slate-100 rounded-full -translate-y-1/2 -z-10 overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-rose-300 via-amber-300 to-teal-400 transition-all duration-300 ease-out"
                        style={{ width: numericValue > 0 ? `${((numericValue - 1) / (maxVal - 1)) * 100}%` : '0%' }}
                    />
                </div>

                {options.map((opt, idx) => {
                    const isSelected = value === opt;
                    const numOpt = parseInt(opt);
                    const isPast = numericValue >= numOpt;

                    return (
                        <motion.button
                            key={opt}
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleSelect(opt)}
                            className={`relative w-11 h-11 md:w-16 md:h-16 rounded-full flex items-center justify-center text-sm md:text-xl font-bold transition-all duration-300 ${isSelected
                                ? `bg-gradient-to-br ${getColor(idx)} text-white shadow-xl shadow-current/30 scale-110 z-20 ring-4 ring-white`
                                : isPast
                                    ? 'bg-slate-300 text-white z-10 shadow-inner'
                                    : 'bg-white border-4 border-slate-100 text-slate-400 hover:border-slate-300 z-10 hover:shadow-md'
                                }`}
                        >
                            {opt}
                        </motion.button>
                    )
                })}
            </div>
        </div>
    );
}
