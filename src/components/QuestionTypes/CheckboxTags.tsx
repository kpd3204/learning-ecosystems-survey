import { motion } from 'framer-motion';

interface CheckboxTagsProps {
    options: string[];
    selected: string[];
    onChange: (selected: string[]) => void;
}

export default function CheckboxTags({ options, selected, onChange }: CheckboxTagsProps) {
    const toggleOption = (opt: string) => {
        if (selected.includes(opt)) {
            onChange(selected.filter(o => o !== opt));
        } else {
            onChange([...selected, opt]);
        }
    };

    return (
        <div className="flex flex-wrap gap-2 md:gap-3 mt-8 relative z-10 w-full max-w-2xl">
            {options.map((opt, i) => {
                if (!opt) return null;
                const isSelected = selected.includes(opt);
                return (
                    <motion.button
                        key={i}
                        layout
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2, delay: i * 0.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toggleOption(opt)}
                        className={`relative px-4 md:px-6 py-2 md:py-3 rounded-full text-sm md:text-base font-medium transition-all duration-300 ease-out flex items-center gap-2 tracking-wide overflow-hidden border ${isSelected
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 border-transparent shadow-lg shadow-blue-500/30 text-white'
                                : 'bg-white border-slate-200 hover:border-blue-300 text-slate-700 hover:shadow-md'
                            }`}
                    >
                        {isSelected && (
                            <motion.span
                                initial={{ scale: 0, rotate: -45 }}
                                animate={{ scale: 1, rotate: 0 }}
                                className="block"
                            >
                                <svg className="w-4 h-4 md:w-5 md:h-5 text-white drop-shadow-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            </motion.span>
                        )}
                        <span className="relative z-10">{opt}</span>
                    </motion.button>
                );
            })}
        </div>
    );
}
