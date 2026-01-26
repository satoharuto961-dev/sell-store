import React, { useState, useEffect } from 'react';

function StickyBar({ count, onCheckout, onReset }) {
    const isComplete = count === 7;
    const progress = (count / 7) * 100;

    // Countdown Timer State (15 minutes)
    const [timeLeft, setTimeLeft] = useState(15 * 60);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-40 p-4 transition-all duration-300">
            {/* Urgency Banner - Mobile Only (Top of sticky bar) */}
            <div className="md:hidden w-full flex justify-center mb-3">
                <div className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 animate-pulse">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Offer expires in {formatTime(timeLeft)}
                </div>
            </div>

            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">

                {/* Left Side: Progress + Timer (Desktop) */}
                <div className="flex items-center gap-6 w-full md:w-auto">

                    {/* Progress */}
                    <div className="flex-1 md:flex-none min-w-[200px]">
                        <div className="flex items-end justify-between gap-2 mb-1">
                            <div>
                                <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{count}</span>
                                <span className="text-gray-500 font-medium text-sm ml-1">/ 7 books</span>
                            </div>
                            {/* Desktop Timer */}
                            <div className="hidden md:flex items-center gap-1 text-red-500 text-sm font-bold bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-md">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{formatTime(timeLeft)}</span>
                            </div>
                        </div>
                        <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-indigo-600 transition-all duration-500 ease-out"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>

                    {/* Mobile Reset (Hidden on desktop) */}
                    <button
                        onClick={onReset}
                        className="md:hidden text-gray-400 font-medium text-sm hover:text-red-500 transition-colors whitespace-nowrap"
                    >
                        Reset
                    </button>
                </div>

                {/* Right Side: Actions */}
                <div className="flex items-center gap-4 w-full md:w-auto">
                    {/* Desktop Reset */}
                    <button
                        onClick={onReset}
                        className="hidden md:block text-gray-500 hover:text-red-600 font-medium transition-colors px-4 py-2"
                    >
                        Reset Selection
                    </button>

                    <button
                        disabled={!isComplete}
                        onClick={onCheckout}
                        className={`flex-1 md:flex-none py-3 px-6 rounded-xl font-bold text-lg shadow-lg transition-all duration-300 transform flex flex-col items-center justify-center leading-tight ${isComplete
                            ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-105 hover:shadow-indigo-500/30 cursor-pointer'
                            : 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                            }`}
                    >
                        {isComplete ? (
                            <>
                                <span>Proceed to Checkout</span>
                                <span className="text-xs font-normal opacity-90">
                                    <span className="line-through opacity-70 mr-1">$140</span>
                                    <span className="font-bold">$39</span>
                                </span>
                            </>
                        ) : (
                            <span>Select {7 - count} more</span>
                        )}
                    </button>
                </div>

            </div>

            {/* Success Notification */}
            {isComplete && (
                <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-emerald-500 text-white px-6 py-2.5 rounded-full shadow-xl animate-bounce flex items-center gap-2 font-medium w-max max-w-[90vw] text-center z-50">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Bundle complete! Save <span className="font-bold underline decoration-white/50">$101</span> today.</span>
                </div>
            )}
        </div>
    );
}

export default StickyBar;
