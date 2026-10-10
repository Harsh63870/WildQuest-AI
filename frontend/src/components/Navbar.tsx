import React, { useState } from 'react';
import { 
  Compass, 
  BookOpen, 
  Award, 
  ShieldCheck, 
  Sparkles, 
  Menu, 
  X, 
  Leaf,
  Play
} from 'lucide-react';
import { AIStatusBadge } from './AIStatusBadge';
import { AIStatus } from '../types';

export type ActiveTab = 'dashboard' | 'generator' | 'session' | 'journal' | 'progress';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  hasActiveSession: boolean;
  aiStatus: AIStatus | null;
  aiLoading: boolean;
  onRefreshAI: () => void;
  onOpenPrivacy: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  hasActiveSession,
  aiStatus,
  aiLoading,
  onRefreshAI,
  onOpenPrivacy
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'dashboard', label: 'Overview', icon: <Compass className="w-4 h-4" /> },
    { id: 'generator', label: 'Start Quest', icon: <Sparkles className="w-4 h-4" /> },
    { 
      id: 'session', 
      label: 'Active Quest', 
      icon: <Play className="w-4 h-4" />, 
      badge: hasActiveSession ? 'In Progress' : undefined 
    },
    { id: 'journal', label: 'Field Journal', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'progress', label: 'Badges & Stats', icon: <Award className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-30 bg-cream-50/90 backdrop-blur-md border-b border-sage-200/60 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div 
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className="w-9 h-9 rounded-xl bg-forest-900 flex items-center justify-center text-cream shadow-natural group-hover:scale-105 transition-transform duration-200">
              <Leaf className="w-5 h-5 text-sage-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif font-bold text-lg text-forest-950 tracking-tight">
                  WildQuest
                </span>
                <span className="text-xs px-1.5 py-0.5 rounded font-mono font-medium bg-forest-100 text-forest-800">
                  AI
                </span>
              </div>
              <p className="text-[10px] text-stone-500 font-sans tracking-wide hidden sm:block">
                Less scrolling. More discovering.
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-forest-900 text-cream shadow-sm'
                      : 'text-stone-600 hover:text-forest-900 hover:bg-stone-100/70'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-400 text-amber-950 font-semibold animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Status Actions */}
          <div className="flex items-center gap-2">
            <AIStatusBadge 
              status={aiStatus} 
              loading={aiLoading} 
              onRefresh={onRefreshAI} 
            />

            <button
              onClick={onOpenPrivacy}
              title="Privacy Architecture"
              className="p-2 rounded-full text-stone-500 hover:text-forest-900 hover:bg-stone-100 transition-colors"
            >
              <ShieldCheck className="w-4 h-4" />
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-stone-600 hover:text-forest-900 hover:bg-stone-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-white/95 px-4 pt-2 pb-4 space-y-1 shadow-lg animate-fade-in">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-forest-900 text-cream'
                    : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-2 py-0.5 rounded-full text-xs bg-amber-400 text-amber-950 font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
