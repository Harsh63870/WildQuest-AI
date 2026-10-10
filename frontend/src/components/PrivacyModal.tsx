import React from 'react';
import { X, ShieldCheck, Database, HardDrive, MapPinOff, EyeOff, Lock, Check } from 'lucide-react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div 
        className="fixed inset-0 bg-forest-950/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div className="flex min-h-full items-center justify-center p-4 sm:p-6 text-center">
        <div className="relative w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 sm:p-8 text-left shadow-2xl transition-all border border-stone-200">
          
          <div className="flex items-center justify-between pb-4 border-b border-stone-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-forest-50 text-forest-800">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-serif font-bold text-forest-950">
                  Privacy & Data Sovereignty
                </h2>
                <p className="text-xs text-stone-500">
                  Zero cloud telemetry • Local-first architecture
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-5 space-y-4 text-sm text-stone-700 leading-relaxed">
            <p>
              WildQuest AI is designed around a strict principle: <strong>Your nature reflections and personal thoughts belong exclusively to your local machine.</strong>
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              <div className="p-3.5 rounded-xl bg-cream-50 border border-stone-200/80">
                <div className="flex items-center gap-2 font-semibold text-forest-900 mb-1.5">
                  <HardDrive className="w-4 h-4 text-forest-700" />
                  <span>Local AI Inference</span>
                </div>
                <p className="text-xs text-stone-600">
                  All prompt processing is run locally via Ollama on your own CPU/GPU. No outdoor thoughts are sent to cloud AI providers.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-cream-50 border border-stone-200/80">
                <div className="flex items-center gap-2 font-semibold text-forest-900 mb-1.5">
                  <Database className="w-4 h-4 text-forest-700" />
                  <span>Local SQLite Storage</span>
                </div>
                <p className="text-xs text-stone-600">
                  Your quest history, field notes, and reflections are stored in a local SQLite file (<code>wildquest.db</code>) on your computer.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-cream-50 border border-stone-200/80">
                <div className="flex items-center gap-2 font-semibold text-forest-900 mb-1.5">
                  <MapPinOff className="w-4 h-4 text-forest-700" />
                  <span>Zero GPS Tracking</span>
                </div>
                <p className="text-xs text-stone-600">
                  We never request geolocation, GPS coordinates, camera permissions, or background location sensors.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-cream-50 border border-stone-200/80">
                <div className="flex items-center gap-2 font-semibold text-forest-900 mb-1.5">
                  <EyeOff className="w-4 h-4 text-forest-700" />
                  <span>Zero Telemetry</span>
                </div>
                <p className="text-xs text-stone-600">
                  No Google Analytics, tracking pixels, ad networks, or external error trackers are embedded in this codebase.
                </p>
              </div>
            </div>

            <div className="bg-forest-50/70 border border-forest-100 rounded-xl p-4 mt-2">
              <h4 className="font-semibold text-forest-900 text-xs flex items-center gap-1.5 mb-2">
                <Lock className="w-3.5 h-3.5 text-forest-700" />
                Guaranteed Local Network Boundary:
              </h4>
              <ul className="text-xs space-y-1.5 text-forest-800">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-forest-600 shrink-0" />
                  <span>UI talks only to <code>http://127.0.0.1:8000/api</code></span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-forest-600 shrink-0" />
                  <span>Backend talks only to local Ollama on <code>http://127.0.0.1:11434</code></span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-forest-600 shrink-0" />
                  <span>Full data portability: Export anytime as JSON or individual Markdown files</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-forest-800 text-cream-50 font-medium text-xs hover:bg-forest-900 transition-colors shadow-sm"
            >
              Understood & Close
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
