import React from 'react';
import { GameComponentProps } from '../types';
import { ArrowLeft, Sparkles, History } from 'lucide-react';

export const ComingSoonGame: React.FC<GameComponentProps> = ({ onBackToLobby, gameName }) => {
  return (
    <div className="w-full flex flex-col items-center justify-center min-h-[400px] text-center p-8 bg-slate-900/80 rounded-3xl border border-slate-800 shadow-xl gap-4">
      <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
        <Sparkles className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-bold text-white">{gameName} is in Development</h2>
      <p className="text-sm text-slate-400 max-w-md">
        This title is being equipped with our interactive Move-History Recorder engine for full game review and analysis.
      </p>
      <div className="flex items-center gap-2 text-xs text-cyan-300 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
        <History className="w-4 h-4" />
        <span>Move-History Recording Supported</span>
      </div>
      <button
        onClick={onBackToLobby}
        className="mt-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 flex items-center gap-2 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Game Lobby</span>
      </button>
    </div>
  );
};

export default ComingSoonGame;
