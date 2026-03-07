'use client';

import { useState, useEffect } from 'react';

/**
 * Custom hook to track the user's online status
 * Returns true if online, false if offline
 */
export default function useOnlineStatus() {
    // Assume online by default to avoid hydration mismatch, check on mount
    const [isOnline, setIsOnline] = useState(true);

    useEffect(() => {
        // Set initial status
        setIsOnline(navigator.onLine);

        // Event listeners for status changes
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return isOnline;
}
