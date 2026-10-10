import React from 'react';
import { ShieldCheck, Heart, Terminal, Sparkles } from 'lucide-react';

interface FooterProps {
  onOpenPrivacy: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenPrivacy }) => {
  return (
    <footer className="mt-20 border-t border-sage-200/80 bg-cream-100/60 text-stone-600 text-xs py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            <span className="font-serif font-bold text-forest-950">
              WildQuest AI
            </span>
            <span className="hidden sm:inline text-stone-300">•</span>
            <span className="text-stone-500">
              “Less scrolling. More discovering.”
            </span>
            <span className="hidden sm:inline text-stone-300">•</span>
            <span className="inline-flex items-center gap-1 text-forest-800 bg-forest-100/60 px-2 py-0.5 rounded-full font-medium text-[11px]">
              <Sparkles className="w-3 h-3 text-forest-700" /> Hacktoberfest 2026 Edition
            </span>
          </div>

          <div className="flex items-center gap-5 text-stone-500">
            <button
              onClick={onOpenPrivacy}
              className="flex items-center gap-1 hover:text-forest-900 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-forest-700" />
              <span>Zero-Cloud Privacy Guarantee</span>
            </button>

            <span className="text-stone-300">•</span>

            <span className="flex items-center gap-1">
              <Terminal className="w-3.5 h-3.5" />
              <span>Local Ollama + SQLite</span>
            </span>

            <span className="text-stone-300">•</span>

            <span>MIT License</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-stone-200/60 text-[11px] text-stone-400 text-center flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            Designed to help screen-bound explorers, developers, and students build an intentional, mindful connection with the outdoors.
          </p>
          <p className="flex items-center gap-1 text-stone-500">
            Built with <Heart className="w-3 h-3 text-forest-600 fill-forest-600" /> for open-source AI enthusiasts.
          </p>
        </div>
      </div>
    </footer>
  );
};
