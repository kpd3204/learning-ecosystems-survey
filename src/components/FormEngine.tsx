import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SwipeCard from './QuestionTypes/SwipeCard';
import CheckboxTags from './QuestionTypes/CheckboxTags';
import SliderScale from './QuestionTypes/SliderScale';
import ConversationalInput from './QuestionTypes/ConversationalInput';

// Basic Type Definitions
export type QuestionType = {
    title: string;
    type: number; // 0=short, 1=paragraph, 2=mcq, 3=dropdown, 4=checkbox, 5=scale
    entry_id: string;
    options: string[];
    scaleLabels?: { low: string; high: string };
};

export type AnswerMap = Record<string, string | string[]>;

interface FormEngineProps {
    config: {
        formId: string;
        commonInitial: QuestionType[];
        branches: Record<string, QuestionType[]>;
        commonFinal: QuestionType[];
    };
    onSubmit: (answers: AnswerMap) => void;
}

export default function FormEngine({ config, onSubmit }: FormEngineProps) {
    // Initialize answers from URL params if present
    const [answers, setAnswers] = useState<AnswerMap>(() => {
        if (typeof window === 'undefined') return {};

        const params = new URLSearchParams(window.location.search);
        const initialAnswers: AnswerMap = {};

        params.forEach((value, key) => {
            if (key.startsWith('entry.')) {
                if (initialAnswers[key]) {
                    if (Array.isArray(initialAnswers[key])) {
                        (initialAnswers[key] as string[]).push(value);
                    } else {
                        initialAnswers[key] = [initialAnswers[key] as string, value];
                    }
                } else {
                    initialAnswers[key] = value;
                }
            }
        });
        return initialAnswers;
    });

    const [currentIndex, setCurrentIndex] = useState(0);

    // We determine the active path based on the "role" answer.
    // The role question is entry.1923221380
    const roleAnswer = answers['entry.1923221380'] as string;

    // Compute the current linear flow of questions
    const getActiveFlow = (): QuestionType[] => {
        let flow = [...config.commonInitial];

        if (roleAnswer && config.branches[roleAnswer]) {
            flow = flow.concat(config.branches[roleAnswer]);
        } else if (roleAnswer && !config.branches[roleAnswer]) {
            // Fallback for roles with no specific questions mapped
        }

        flow = flow.concat(config.commonFinal);
        return flow.filter(Boolean);
    };

    const activeFlow = getActiveFlow();
    const currentQuestion = activeFlow[currentIndex];
    const isLastQuestion = currentIndex === activeFlow.length - 1;

    const handleNext = () => {
        if (currentIndex < activeFlow.length - 1) {
            setCurrentIndex(curr => curr + 1);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(curr => curr - 1);
        }
    };

    const handleAnswerChange = (entryId: string, val: string | string[]) => {
        setAnswers(prev => ({ ...prev, [entryId]: val }));
    };

    const handleSubmit = async () => {
        onSubmit(answers);
    };

    if (!currentQuestion) return null;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 md:p-6 transition-all duration-300">
            <div className="w-full max-w-2xl bg-white rounded-2xl md:rounded-3xl shadow-xl overflow-hidden relative min-h-[450px] md:min-h-[400px] flex flex-col">
                {/* Progress Bar */}
                <div className="h-1.5 w-full bg-slate-100 absolute top-0 left-0">
                    <div
                        className="h-full bg-blue-600 transition-all duration-300 ease-out"
                        style={{ width: `${((currentIndex + 1) / activeFlow.length) * 100}%` }}
                    />
                </div>

                {/* Question Area */}
                <div className="flex-1 p-6 md:p-12 flex flex-col justify-center">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentQuestion.entry_id}
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="w-full"
                        >
                            <h2 className="text-xl md:text-3xl font-semibold text-slate-800 mb-6 tracking-tight leading-tight">
                                {currentQuestion.title}
                            </h2>

                            <QuestionRenderer
                                question={currentQuestion}
                                currentAnswer={answers[currentQuestion.entry_id]}
                                onChange={handleAnswerChange}
                                onEnter={handleNext}
                            />
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Navigation Footer */}
                <div className="p-6 md:px-12 border-t border-slate-100 flex justify-between items-center bg-white/50 backdrop-blur-sm">
                    <button
                        onClick={handlePrev}
                        disabled={currentIndex === 0}
                        className="text-slate-400 hover:text-slate-600 font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-30"
                    >
                        ← Back
                    </button>

                    {!isLastQuestion ? (
                        <button
                            onClick={handleNext}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 md:px-8 py-3 rounded-xl shadow-md shadow-blue-600/20 transition-all transform active:scale-95 flex items-center gap-2 text-sm md:text-base"
                        >
                            Next <span className="text-blue-200">→</span>
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            className="bg-slate-900 hover:bg-slate-800 text-white font-medium px-6 md:px-8 py-3 rounded-xl shadow-md transition-all transform active:scale-95 text-sm md:text-base"
                        >
                            Submit Responses
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// Sub-component to render the correct input based on type
function QuestionRenderer({ question, currentAnswer, onChange, onEnter }: {
    question: QuestionType,
    currentAnswer: any,
    onChange: (id: string, val: any) => void,
    onEnter: () => void
}) {
    const { type, entry_id, options } = question;

    // 0=short, 1=paragraph, 2=mcq, 3=dropdown, 4=checkbox, 5=scale
    if (type === 0 || type === 1) {
        return (
            <ConversationalInput
                value={currentAnswer as string || ''}
                onChange={(val) => onChange(entry_id, val)}
                onEnter={onEnter}
                isMultiline={type === 1}
            />
        );
    }

    if (type === 2 || type === 3) { // Multiple Choice / Dropdown
        // New Swipe UI Requirement: Use SwipeCard if 4 or fewer options
        // Adding exception: If options contain very long text, fallback to list (Swipe cards are small)
        const hasLongOptions = options.some(opt => opt && opt.length > 50);

        if (options.length > 0 && options.length <= 4 && !hasLongOptions) {
            return (
                <div className="mt-8 relative z-10 w-full flex justify-center">
                    <SwipeCard
                        options={options}
                        onSwipe={(selectedOption) => {
                            onChange(entry_id, selectedOption);
                            setTimeout(onEnter, 400); // Give the animation time to finish before advancing
                        }}
                    />
                </div>
            );
        }

        // Standard List UI fallback for more than 4 options (Polished version)
        return (
            <div className="flex flex-col gap-4 mt-6 w-full max-w-2xl relative z-10">
                {options.map((opt, i) => {
                    if (!opt) return null;
                    const isSelected = currentAnswer === opt;
                    return (
                        <motion.button
                            key={i}
                            whileHover={{ scale: 1.01, x: 4 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => {
                                onChange(entry_id, opt);
                                setTimeout(onEnter, 350); // Auto-advance on select for MCQ
                            }}
                            className={`text-left p-5 rounded-2xl border-2 transition-all duration-300 relative overflow-hidden group ${isSelected
                                ? 'border-blue-600 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-900 shadow-md shadow-blue-600/10'
                                : 'border-slate-100 bg-white hover:border-blue-200 hover:bg-slate-50 text-slate-700 hover:shadow-sm'
                                }`}
                        >
                            {isSelected && (
                                <motion.div
                                    layoutId="selected-bg"
                                    className="absolute inset-0 bg-blue-50/50 -z-10"
                                />
                            )}
                            <div className="flex items-start">
                                <span className={`flex-shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-bold mr-4 transition-colors mt-0.5 ${isSelected
                                    ? 'border-blue-600 bg-blue-600 text-white'
                                    : 'border-slate-300 text-slate-500 group-hover:border-blue-400 group-hover:text-blue-500 bg-slate-50'
                                    }`}>
                                    {String.fromCharCode(65 + i)}
                                </span>
                                <span className={`text-lg leading-relaxed ${isSelected ? 'font-medium' : ''}`}>
                                    {opt}
                                </span>
                            </div>
                        </motion.button>
                    );
                })}
            </div>
        );
    }

    if (type === 4) { // Checkboxes
        const currentList = Array.isArray(currentAnswer) ? currentAnswer : [];
        return (
            <CheckboxTags
                options={options}
                selected={currentList}
                onChange={(selected) => onChange(entry_id, selected)}
            />
        );
    }

    if (type === 5) { // Linear scale
        return (
            <SliderScale
                value={currentAnswer as string || ''}
                options={options}
                onChange={(val) => onChange(entry_id, val)}
                onEnter={onEnter}
                lowLabel={question.scaleLabels?.low}
                highLabel={question.scaleLabels?.high}
            />
        );
    }

    return <p className="text-red-500">Unsupported question type</p>;
}
