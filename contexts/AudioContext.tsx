import React, { createContext, useState, useRef, ReactNode, useCallback } from 'react';
import { AudioContextType } from '../types';

export const AudioContext = createContext<AudioContextType>({
    playLobbyMusic: () => {},
    playGameMusic: () => {},
    stopMusic: () => {},
    userHasInteracted: false,
    setUserHasInteracted: () => {},
});

// Using placeholder URLs. In a real app, these would point to actual audio files.
const LOBBY_MUSIC_URL = 'https://storage.googleapis.com/assets.promption.com/lobby-music.mp3';
const GAME_MUSIC_URL = 'https://storage.googleapis.com/assets.promption.com/game-music.mp3';

export const AudioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [currentTrack, setCurrentTrack] = useState<string | null>(null);
    const [userHasInteracted, setUserHasInteracted] = useState(false);

    const playAudio = useCallback((src: string) => {
        if (!audioRef.current) {
            audioRef.current = new Audio();
            audioRef.current.loop = true;
            audioRef.current.volume = 0.3;
        }

        if (currentTrack === src && !audioRef.current.paused) {
            return;
        }
        
        audioRef.current.src = src;
        setCurrentTrack(src);

        if (userHasInteracted) {
             audioRef.current.play().catch(error => {
                console.warn("Audio play was prevented:", error);
            });
        }
    }, [userHasInteracted, currentTrack]);


    const playLobbyMusic = useCallback(() => {
        playAudio(LOBBY_MUSIC_URL);
    }, [playAudio]);

    const playGameMusic = useCallback(() => {
        playAudio(GAME_MUSIC_URL);
    }, [playAudio]);

    const stopMusic = useCallback(() => {
        if (audioRef.current && !audioRef.current.paused) {
            audioRef.current.pause();
            setCurrentTrack(null);
        }
    }, []);
    
    const value = {
        playLobbyMusic,
        playGameMusic,
        stopMusic,
        userHasInteracted,
        setUserHasInteracted
    };

    return (
        <AudioContext.Provider value={value}>
            {children}
        </AudioContext.Provider>
    );
};