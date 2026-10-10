import React, { useState } from 'react';
import { Cpu, RefreshCw, CheckCircle2, AlertTriangle, ShieldCheck, Terminal } from 'lucide-react';
import { AIStatus } from '../types';

interface AIStatusBadgeProps {
  status: AIStatus | null;
  loading: boolean;
  onRefresh: () => void;
}

export const AIStatusBadge: React.FC<AIStatusBadgeProps> = ({ status, loading, onRefresh }) => {
  const [isOpen, setIsOpen] = useState(false);

  const isModelReady = status?.connected && status?.model_available;
  const isOllamaUp = status?.connected;

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-forest-700/30 ${
          isModelReady
            ? 'bg-forest-50 text-forest-800 border-forest-200 hover:bg-forest-100'
            : isOllamaUp
            ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
            : 'bg-stone-100 text-stone-700 border-stone-300 hover:bg-stone-200'
        }`}
        title="Click to view AI Engine Status"
      >
        <span
          className={`w-2 h-2 rounded-full ${
            isModelReady
              ? 'bg-forest-600 animate-pulse'
              : isOllamaUp
              ? 'bg-amber-500'
              : 'bg-stone-400'
          }`}
        />
        <Cpu className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">
          {isModelReady
            ? `Local AI: ${status?.configured_model}`
            : isOllamaUp
            ? 'Ollama Ready (Model Pending)'
            : 'Offline Template Mode'}
        </span>
        <span className="sm:hidden">
          {isModelReady ? 'Local AI' : 'Offline Mode'}
        </span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-natural-lg border border-stone-200 p-4 z-50 text-xs text-earth-800 animate-fade-in">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-100">
              <div className="flex items-center gap-1.5 font-semibold text-sm text-forest-900">
                <Cpu className="w-4 h-4 text-forest-700" />
                <span>AI Inference Engine</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRefresh();
                }}
                disabled={loading}
                className="text-stone-500 hover:text-forest-800 p-1 rounded transition-colors"
                title="Refresh Status"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-start gap-2">
                {isModelReady ? (
                  <CheckCircle2 className="w-4 h-4 text-forest-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-medium text-stone-900">
                    {isModelReady ? 'Local Model Active' : 'Offline Template Engine Active'}
                  </div>
                  <p className="text-stone-600 text-[11px] mt-0.5 leading-relaxed">
                    {status?.message || 'Checking local runtime status...'}
                  </p>
                </div>
              </div>

              <div className="bg-stone-50 rounded-lg p-2.5 space-y-1.5 border border-stone-100 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-stone-500">Configured Model:</span>
                  <span className="font-mono font-medium text-forest-800">
                    {status?.configured_model || 'qwen2.5:3b'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Ollama Daemon:</span>
                  <span className={status?.connected ? 'text-forest-700 font-medium' : 'text-stone-500'}>
                    {status?.connected ? 'Online (127.0.0.1:11434)' : 'Offline'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Data Isolation:</span>
                  <span className="text-forest-700 font-medium flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> 100% Local
                  </span>
                </div>
              </div>

              {!isModelReady && (
                <div className="bg-amber-50/70 border border-amber-200/60 rounded-lg p-2.5 text-amber-900">
                  <div className="flex items-center gap-1 font-semibold text-[11px] mb-1">
                    <Terminal className="w-3 h-3" /> To enable local AI model:
                  </div>
                  <code className="block bg-amber-100/70 p-1.5 rounded font-mono text-[10px] text-amber-950 select-all">
                    ollama run {status?.configured_model || 'qwen2.5:3b'}
                  </code>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
