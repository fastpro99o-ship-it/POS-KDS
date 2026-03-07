import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';

const KITCHEN_BELL = '/Sound/simple-notification-152054.mp3';

export default function useSoundAlert() {
    const audioRef = useRef(null);
    const unlockedRef = useRef(false);

    // Lazy init — only create Audio after user interaction
    const getAudio = useCallback(() => {
        if (!audioRef.current) {
            audioRef.current = new Audio(KITCHEN_BELL);
            audioRef.current.volume = 1.0;
        }
        return audioRef.current;
    }, []);

    const playNewOrderSound = useCallback(() => {
        const audio = getAudio();
        audio.currentTime = 0;

        const promise = audio.play();
        if (promise !== undefined) {
            promise
                .then(() => {
                    unlockedRef.current = true;
                })
                .catch((error) => {
                    if (error.name === 'NotAllowedError') {
                        // Browser blocked autoplay — ask user to enable
                        if (!unlockedRef.current) {
                            toast('🔔 انقر لتفعيل الصوت', {
                                action: {
                                    label: 'تفعيل',
                                    onClick: () => {
                                        // Unlock by playing on click event
                                        audio.play()
                                            .then(() => { unlockedRef.current = true; })
                                            .catch(() => { });
                                    },
                                },
                                duration: 8000,
                            });
                        }
                    } else {
                        console.error('Sound playback failed:', error);
                    }
                });
        }
    }, [getAudio]);

    return { playNewOrderSound };
}
