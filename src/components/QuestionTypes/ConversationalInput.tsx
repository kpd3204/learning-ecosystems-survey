import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';

interface ConversationalInputProps {
    value: string;
    onChange: (val: string) => void;
    onEnter: () => void;
    isMultiline: boolean;
}

export default function ConversationalInput({ value, onChange, onEnter, isMultiline }: ConversationalInputProps) {
    const minHeight = isMultiline ? 120 : 64;
    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize textarea
    useEffect(() => {
        if (textAreaRef.current) {
            textAreaRef.current.style.height = `${minHeight}px`;
            const scrollHeight = textAreaRef.current.scrollHeight;
            if (scrollHeight > minHeight) {
                textAreaRef.current.style.height = `${scrollHeight}px`;
            }
        }
    }, [value, minHeight]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            if (!isMultiline) {
                e.preventDefault();
                onEnter();
            } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                // Command/Ctrl + Enter submits multiline
                e.preventDefault();
                onEnter();
            }
        }
    };

    return (
        <form onSubmit={(e) => { e.preventDefault(); onEnter(); }} className="w-full mt-8 relative z-10 group">
            <div className="relative rounded-2xl md:rounded-3xl bg-slate-50 border-2 border-slate-200 transition-all duration-300 group-focus-within:bg-white group-focus-within:border-blue-500 group-focus-within:shadow-xl group-focus-within:shadow-blue-500/10 p-2 pl-4 md:pl-6 overflow-hidden flex items-end">
                <textarea
                    ref={textAreaRef}
                    autoFocus
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={isMultiline ? "Share your thoughts here... (Optional)" : "Type your answer... (Optional)"}
                    className="w-full bg-transparent border-none focus:ring-0 text-lg md:text-2xl text-slate-800 placeholder-slate-400 resize-none overflow-hidden my-4 leading-relaxed outline-none peer"
                    style={{ minHeight: `${minHeight}px` }}
                />

                {/* Submit / Next Button inside the input */}
                <div className="flex-shrink-0 mb-4 mr-1 md:mr-2 ml-2 md:ml-4">
                    <motion.button
                        type="submit"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-colors shadow-sm bg-blue-600 text-white shadow-blue-600/30`}
                        title={isMultiline ? "Cmd/Ctrl + Enter to submit" : "Enter to submit"}
                    >
                        <svg className="w-5 h-5 md:w-6 md:h-6 ml-0.5 md:ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </motion.button>
                </div>
            </div>

            {isMultiline && (
                <p className="text-[10px] md:text-sm font-medium text-slate-400 mt-2 md:mt-3 text-right pr-4">
                    Press <kbd className="font-mono bg-slate-100 px-1.5 py-0.5 md:px-2 md:py-1 rounded text-slate-600 border border-slate-200">Cmd/Ctrl</kbd> + <kbd className="font-mono bg-slate-100 px-1.5 py-0.5 md:px-2 md:py-1 rounded text-slate-600 border border-slate-200">Enter</kbd> to save
                </p>
            )}
        </form>
    );
}
