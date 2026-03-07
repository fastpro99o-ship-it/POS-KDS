'use client';

import { motion, AnimatePresence } from 'framer-motion';
import useOnlineStatus from '@/hooks/useOnlineStatus';

export default function ConnectionLostOverlay() {
    const isOnline = useOnlineStatus();

    return (
        <AnimatePresence>
            {!isOnline && (
                <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 50, opacity: 0 }}
                    className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-[9999]"
                >
                    <div className="flex items-center gap-3 px-6 py-3 bg-red-600 dark:bg-red-700 text-white rounded-full shadow-xl border border-red-500/50 backdrop-blur-sm">
                        <span className="material-symbols-outlined text-[20px] animate-pulse">wifi_off</span>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold leading-tight">OFFLINE MODE</span>
                            <span className="text-[10px] opacity-90 font-medium">Changes currently saved locally</span>
                        </div>
                        <button
                            onClick={() => window.location.reload()}
                            className="ml-2 p-1 hover:bg-white/20 rounded-full transition-colors"
                            title="Retry Connection"
                        >
                            <span className="material-symbols-outlined text-[18px]">refresh</span>
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
