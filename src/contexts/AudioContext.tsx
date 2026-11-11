import React, { createContext, useState, useEffect, useRef, useCallback } from 'react';

interface GameAudioContextType {
  soundEnabled: boolean;
  toggleSound: () => void;
  playMoveSound: (type?: 'place' | 'capture' | 'jump' | 'flip') => void;
  playWinSound: () => void;
  playLoseSound: () => void;
  playClickSound: () => void;
  playLobbyMusic: () => void;
  playGameMusic: () => void;
  stopMusic: () => void;
  userHasInteracted: boolean;
  setUserHasInteracted: (interacted: boolean) => void;
}

export const GameAudioContext = createContext<GameAudioContextType>({
  soundEnabled: true,
  toggleSound: () => {},
  playMoveSound: () => {},
  playWinSound: () => {},
  playLoseSound: () => {},
  playClickSound: () => {},
  playLobbyMusic: () => {},
  playGameMusic: () => {},
  stopMusic: () => {},
  userHasInteracted: false,
  setUserHasInteracted: () => {},
});

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('boardbeacon_sound');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const [userHasInteracted, setUserHasInteracted] = useState<boolean>(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const musicIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const getAudioContext = useCallback(() => {
    if (typeof window === 'undefined') return null;
    if (!audioCtxRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioCtxRef.current = new AudioContextClass();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('boardbeacon_sound', JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  // Procedural synthesized sound effects
  const playTone = useCallback(
    (freq: number, type: OscillatorType, duration: number, gainValue = 0.1) => {
      if (!soundEnabled) return;
      const ctx = getAudioContext();
      if (!ctx) return;

      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        gain.gain.setValueAtTime(gainValue, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + duration);
      } catch {}
    },
    [soundEnabled, getAudioContext]
  );

  const playClickSound = useCallback(() => {
    playTone(600, 'sine', 0.05, 0.04);
  }, [playTone]);

  const playMoveSound = useCallback(
    (type: 'place' | 'capture' | 'jump' | 'flip' = 'place') => {
      if (!soundEnabled) return;
      if (type === 'capture') {
        playTone(320, 'square', 0.1, 0.08);
        setTimeout(() => playTone(240, 'triangle', 0.15, 0.09), 60);
      } else if (type === 'jump') {
        playTone(480, 'sine', 0.08, 0.08);
        setTimeout(() => playTone(640, 'sine', 0.1, 0.08), 70);
      } else if (type === 'flip') {
        playTone(550, 'triangle', 0.06, 0.05);
      } else {
        // Place mark / disc
        playTone(440, 'sine', 0.07, 0.06);
      }
    },
    [soundEnabled, playTone]
  );

  const playWinSound = useCallback(() => {
    if (!soundEnabled) return;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        playTone(freq, 'sine', 0.25, 0.08);
      }, idx * 110);
    });
  }, [soundEnabled, playTone]);

  const playLoseSound = useCallback(() => {
    if (!soundEnabled) return;
    const notes = [440, 415.3, 392, 349.23];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        playTone(freq, 'sawtooth', 0.2, 0.05);
      }, idx * 130);
    });
  }, [soundEnabled, playTone]);

  const stopMusic = useCallback(() => {
    if (musicIntervalRef.current) {
      clearInterval(musicIntervalRef.current);
      musicIntervalRef.current = null;
    }
  }, []);

  const playLobbyMusic = useCallback(() => {
    stopMusic();
    // Gentle synthesized ambient bell every 4 seconds if enabled
    if (!soundEnabled || !userHasInteracted) return;
  }, [soundEnabled, userHasInteracted, stopMusic]);

  const playGameMusic = useCallback(() => {
    stopMusic();
  }, [stopMusic]);

  return (
    <GameAudioContext.Provider
      value={{
        soundEnabled,
        toggleSound,
        playMoveSound,
        playWinSound,
        playLoseSound,
        playClickSound,
        playLobbyMusic,
        playGameMusic,
        stopMusic,
        userHasInteracted,
        setUserHasInteracted,
      }}
    >
      {children}
    </GameAudioContext.Provider>
  );
};

export default AudioProvider;
