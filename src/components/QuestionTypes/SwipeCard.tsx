import { useEffect } from 'react';
import { motion, useMotionValue, useTransform, useAnimation } from 'framer-motion';

export interface SwipeCardProps {
    options: string[];
    onSwipe: (selectedOption: string) => void;
}

export default function SwipeCard({ options, onSwipe }: SwipeCardProps) {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const controls = useAnimation();

    // Map options to directions
    const rightOption = options[0];
    const leftOption = options[1];
    const upOption = options[2];
    const downOption = options[3];

    // Map drag distance to visual indicators
    const rightOpacity = useTransform(x, [0, 100], [0, 1]);
    const leftOpacity = useTransform(x, [0, -100], [0, 1]);
    const upOpacity = useTransform(y, [0, -100], [0, 1]);
    const downOpacity = useTransform(y, [0, 100], [0, 1]);

    // Card rotation
    const rotate = useTransform(x, [-200, 200], [-15, 15]);

    // Base content opacity (fades out when dragging)
    const baseOpacity = useTransform(
        [x, y],
        ([latestX, latestY]) => {
            const distance = Math.sqrt((latestX as number) ** 2 + (latestY as number) ** 2);
            return Math.max(0, 1 - distance / 50); // Fades out completely by 50px
        }
    );

    const swipeThreshold = 120;

    const handleDragEnd = async (_e: any, info: any) => {
        const offsetX = info.offset.x;
        const offsetY = info.offset.y;

        if (Math.abs(offsetX) > Math.abs(offsetY)) {
            if (offsetX > swipeThreshold && rightOption) {
                await controls.start({ x: 500, opacity: 0, transition: { duration: 0.3 } });
                onSwipe(rightOption);
            } else if (offsetX < -swipeThreshold && leftOption) {
                await controls.start({ x: -500, opacity: 0, transition: { duration: 0.3 } });
                onSwipe(leftOption);
            } else {
                controls.start({ x: 0, y: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } });
            }
        } else {
            if (offsetY < -swipeThreshold && upOption) {
                await controls.start({ y: -500, opacity: 0, transition: { duration: 0.3 } });
                onSwipe(upOption);
            } else if (offsetY > swipeThreshold && downOption) {
                await controls.start({ y: 500, opacity: 0, transition: { duration: 0.3 } });
                onSwipe(downOption);
            } else {
                controls.start({ x: 0, y: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } });
            }
        }
    };

    useEffect(() => {
        controls.set({ x: 0, y: 0, opacity: 1 });
    }, [options, controls]);

    return (
        <div className="relative w-full h-[420px] flex items-center justify-center overflow-hidden">

            {/* Directional answer labels — show the actual answer text (Visible during drag) */}
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-between p-4 px-1">
                {upOption && (
                    <motion.div
                        style={{ opacity: upOpacity }}
                        className="text-center max-w-[240px] mb-auto z-0"
                    >
                        <span className="inline-block text-sm md:text-base font-bold text-blue-700 bg-blue-100/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-md border border-blue-200">
                            ↑ {upOption}
                        </span>
                    </motion.div>
                )}

                {/* Left/Right container — positioned to be at the extreme edges */}
                <div className="w-full flex justify-between items-center absolute top-1/2 -translate-y-1/2 px-1 z-0">
                    {leftOption ? (
                        <motion.div
                            style={{ opacity: leftOpacity }}
                            className="max-w-[90px] md:max-w-[120px] text-left"
                        >
                            <span className="inline-block text-sm md:text-base font-bold text-rose-700 bg-rose-100/90 backdrop-blur-sm px-3 md:px-4 py-2 rounded-full shadow-md border border-rose-200 leading-tight">
                                ← {leftOption}
                            </span>
                        </motion.div>
                    ) : <div />}

                    {rightOption ? (
                        <motion.div
                            style={{ opacity: rightOpacity }}
                            className="max-w-[90px] md:max-w-[120px] text-right"
                        >
                            <span className="inline-block text-sm md:text-base font-bold text-emerald-700 bg-emerald-100/90 backdrop-blur-sm px-3 md:px-4 py-2 rounded-full shadow-md border border-emerald-200 leading-tight">
                                {rightOption} →
                            </span>
                        </motion.div>
                    ) : <div />}
                </div>

                {downOption && (
                    <motion.div
                        style={{ opacity: downOpacity }}
                        className="text-center max-w-[240px] mt-auto z-0"
                    >
                        <span className="inline-block text-sm md:text-base font-bold text-amber-700 bg-amber-100/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-md border border-amber-200">
                            {downOption} ↓
                        </span>
                    </motion.div>
                )}
            </div>

            {/* Static hint labels (Visible before/during small drags) */}
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-between p-4 px-1 opacity-40">
                {upOption && (
                    <div className="text-center mb-auto">
                        <span className="text-xs md:text-sm font-semibold text-blue-500 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100">
                            ↑ {upOption}
                        </span>
                    </div>
                )}
                <div className="w-full flex justify-between items-center absolute top-1/2 -translate-y-1/2 px-1">
                    {leftOption ? (
                        <div className="max-w-[80px] md:max-w-[100px]">
                            <span className="inline-block text-xs md:text-sm font-semibold text-rose-500 bg-rose-50 px-3 py-1.5 rounded-full leading-tight border border-rose-100">
                                ← {leftOption}
                            </span>
                        </div>
                    ) : <div />}
                    {rightOption ? (
                        <div className="max-w-[80px] md:max-w-[100px] text-right">
                            <span className="inline-block text-xs md:text-sm font-semibold text-emerald-500 bg-emerald-50 px-3 py-1.5 rounded-full leading-tight border border-emerald-100">
                                {rightOption} →
                            </span>
                        </div>
                    ) : <div />}
                </div>
                {downOption && (
                    <div className="text-center mt-auto">
                        <span className="text-xs md:text-sm font-semibold text-amber-500 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100">
                            {downOption} ↓
                        </span>
                    </div>
                )}
            </div>

            <motion.div
                drag
                dragDirectionLock={false}
                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                dragElastic={0.8}
                onDragEnd={handleDragEnd}
                style={{ x, y, rotate }}
                animate={controls}
                className="w-[210px] h-[260px] md:w-[240px] md:h-[280px] bg-gradient-to-br from-white to-slate-50 border-2 border-slate-100 rounded-3xl shadow-2xl flex flex-col items-center justify-center p-6 cursor-grab active:cursor-grabbing relative overflow-hidden z-10 mx-auto"
            >
                {/* Base content — fades out on drag */}
                <motion.div
                    style={{ opacity: baseOpacity }}
                    className="text-center pointer-events-none"
                >
                    <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                    </div>
                    <h3 className="text-base md:text-lg font-bold text-slate-700">Drag to choose</h3>
                    <p className="text-[10px] text-slate-400 mt-1 font-medium">Swipe toward your answer</p>
                </motion.div>

                {/* Dynamic overlay on drag — This is the primary indicator of selection */}
                {rightOption && (
                    <motion.div
                        style={{ opacity: rightOpacity }}
                        className="absolute inset-0 bg-emerald-500 flex items-center justify-center p-6 rounded-3xl"
                    >
                        <div className="text-center text-white">
                            <div className="text-3xl mb-2">✨</div>
                            <span className="text-lg font-black leading-tight uppercase tracking-wider">{rightOption}</span>
                        </div>
                    </motion.div>
                )}
                {leftOption && (
                    <motion.div
                        style={{ opacity: leftOpacity }}
                        className="absolute inset-0 bg-rose-500 flex items-center justify-center p-6 rounded-3xl"
                    >
                        <div className="text-center text-white">
                            <div className="text-3xl mb-2">❌</div>
                            <span className="text-lg font-black leading-tight uppercase tracking-wider">{leftOption}</span>
                        </div>
                    </motion.div>
                )}
                {upOption && (
                    <motion.div
                        style={{ opacity: upOpacity }}
                        className="absolute inset-0 bg-blue-500 flex items-center justify-center p-6 rounded-3xl"
                    >
                        <div className="text-center text-white">
                            <div className="text-3xl mb-2">⭐</div>
                            <span className="text-lg font-black leading-tight uppercase tracking-wider">{upOption}</span>
                        </div>
                    </motion.div>
                )}
                {downOption && (
                    <motion.div
                        style={{ opacity: downOpacity }}
                        className="absolute inset-0 bg-amber-500 flex items-center justify-center p-6 rounded-3xl"
                    >
                        <div className="text-center text-white">
                            <div className="text-3xl mb-2">📍</div>
                            <span className="text-lg font-black leading-tight uppercase tracking-wider">{downOption}</span>
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}
