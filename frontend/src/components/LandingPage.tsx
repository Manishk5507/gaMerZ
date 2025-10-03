import React from 'react';
import { PuzzlePieceIcon, RocketLaunchIcon, CursorArrowRaysIcon } from '@heroicons/react/24/outline';

interface LandingPageProps {
  onEnter: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  return (
    <div className="relative flex flex-col items-center justify-center py-28 md:py-36 text-center gap-10">
      <div className="space-y-6 max-w-3xl px-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/40 bg-indigo-500/10 px-4 py-1.5 text-[11px] uppercase tracking-wider font-medium text-indigo-300 shadow shadow-indigo-900/40">
          <CursorArrowRaysIcon className="h-4 w-4" /> Interactive Mini‑Arcade
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight heading-gradient">
          Tiny Games. Big Fun.
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-slate-400 leading-relaxed">
          Dive into a growing collection of snack-sized games built with <span className="text-indigo-300">Go</span> + <span className="text-sky-300">React</span>. No sign‑up, no clutter—just instant play.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <button onClick={onEnter} className="btn-primary group px-7 py-3 text-base">
            <RocketLaunchIcon className="h-5 w-5 mr-2 -ml-1 inline-block group-hover:rotate-12 transition" />
            Enter Arcade
          </button>
          <a href="https://github.com/" target="_blank" rel="noreferrer" className="text-xs sm:text-sm text-slate-400 hover:text-slate-200 transition">
            <PuzzlePieceIcon className="h-5 w-5 inline-block mr-1" /> View Source
          </a>
        </div>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 max-w-xl opacity-60 mt-6">
        {['TicTacToe','Number Guess','More Soon','Logic','Arcade','Fun'].map(tag => (
          <div key={tag} className="text-[10px] sm:text-[11px] tracking-wide font-medium px-2.5 py-2 rounded-md bg-slate-800/40 border border-slate-700/60 backdrop-blur-sm text-slate-300">
            {tag}
          </div>
        ))}
      </div>
    </div>
  );
};
