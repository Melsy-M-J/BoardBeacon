import React from 'react';

export const TicTacToeIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="8" y1="3" x2="8" y2="21" />
    <line x1="16" y1="3" x2="16" y2="21" />
    <line x1="3" y1="8" x2="21" y2="8" />
    <line x1="3" y1="16" x2="21" y2="16" />
    <line x1="4" y1="4" x2="7" y2="7" stroke="currentColor" strokeWidth="2" />
    <line x1="7" y1="4" x2="4" y2="7" stroke="currentColor" strokeWidth="2" />
    <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="2" />
  </svg>
);

export const ConnectFourIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="3" width="20" height="18" rx="3" className="stroke-current" />
    <circle cx="6.5" cy="7.5" r="1.8" fill="currentColor" fillOpacity="0.8" />
    <circle cx="11.5" cy="7.5" r="1.8" stroke="currentColor" />
    <circle cx="16.5" cy="7.5" r="1.8" fill="currentColor" fillOpacity="0.8" />
    <circle cx="6.5" cy="12" r="1.8" stroke="currentColor" />
    <circle cx="11.5" cy="12" r="1.8" fill="currentColor" fillOpacity="0.8" />
    <circle cx="16.5" cy="12" r="1.8" stroke="currentColor" />
    <circle cx="6.5" cy="16.5" r="1.8" fill="currentColor" fillOpacity="0.8" />
    <circle cx="11.5" cy="16.5" r="1.8" fill="currentColor" fillOpacity="0.8" />
    <circle cx="16.5" cy="16.5" r="1.8" fill="currentColor" fillOpacity="0.8" />
  </svg>
);

export const CheckersIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 9h18M3 15h18M9 3v18M15 3v18" opacity="0.4" />
    <circle cx="6" cy="6" r="2" fill="currentColor" />
    <circle cx="18" cy="18" r="2" fill="currentColor" fillOpacity="0.5" />
    <circle cx="12" cy="12" r="2.2" stroke="currentColor" strokeWidth="2" />
  </svg>
);

export const ChessIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 2v3M10 3.5h4" />
    <path d="M8 8a4 4 0 0 1 8 0c0 2-1 3-1 5H9c0-2-1-3-1-5z" />
    <path d="M8 15h8v2H8z" />
    <path d="M6 19h12a1 1 0 0 1 1 1v1H5v-1a1 1 0 0 1 1-1z" />
    <circle cx="12" cy="7" r="1" fill="currentColor" />
  </svg>
);

export const MemoryGameIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="5" width="8" height="12" rx="2" fill="currentColor" fillOpacity="0.2" />
    <rect x="13" y="7" width="8" height="12" rx="2" fill="currentColor" fillOpacity="0.6" />
    <path d="M7 11l-2 2h4l-2-2z" fill="currentColor" />
    <circle cx="17" cy="13" r="1.5" stroke="currentColor" />
  </svg>
);

export const SudokuIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <line x1="9" y1="3" x2="9" y2="21" strokeWidth="2.5" />
    <line x1="15" y1="3" x2="15" y2="21" strokeWidth="2.5" />
    <line x1="3" y1="9" x2="21" y2="9" strokeWidth="2.5" />
    <line x1="3" y1="15" x2="21" y2="15" strokeWidth="2.5" />
    <circle cx="6" cy="6" r="1" fill="currentColor" />
    <circle cx="18" cy="12" r="1" fill="currentColor" />
    <circle cx="12" cy="18" r="1" fill="currentColor" />
  </svg>
);

export const LudoIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <rect x="3" y="3" width="7" height="7" fill="currentColor" fillOpacity="0.4" />
    <rect x="14" y="3" width="7" height="7" fill="currentColor" fillOpacity="0.7" />
    <rect x="3" y="14" width="7" height="7" fill="currentColor" fillOpacity="0.5" />
    <rect x="14" y="14" width="7" height="7" fill="currentColor" fillOpacity="0.9" />
    <circle cx="12" cy="12" r="2" stroke="currentColor" />
  </svg>
);

export const SnakeAndLadderIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <line x1="7" y1="5" x2="11" y2="19" strokeWidth="1.5" />
    <line x1="10" y1="5" x2="14" y2="19" strokeWidth="1.5" />
    <line x1="8" y1="8" x2="11.5" y2="8" />
    <line x1="9" y1="12" x2="12.5" y2="12" />
    <line x1="10" y1="16" x2="13.5" y2="16" />
    <path d="M18 6c-2 2-1 4-3 5s-2 3-1 5" stroke="currentColor" strokeWidth="2" strokeDasharray="1 1" />
  </svg>
);

export const MahjongIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="5" y="3" width="14" height="18" rx="3" fill="currentColor" fillOpacity="0.1" />
    <circle cx="12" cy="8" r="2.5" fill="currentColor" />
    <line x1="9" y1="14" x2="15" y2="14" strokeWidth="2" />
    <line x1="12" y1="12" x2="12" y2="17" strokeWidth="2" />
  </svg>
);

export const TrophyIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.45 1-1 1H7" />
    <path d="M14 14.66V17c0 .55.45 1 1 1h2" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
);
