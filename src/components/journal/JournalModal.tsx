import React, { useState } from 'react';
import { Landmark, Quest } from '../../types/game';
import { X, BookOpen, MapPin, Compass, CheckCircle2, Circle, Sparkles, Feather } from 'lucide-react';
import { soundManager } from '../../utils/audio';

interface JournalModalProps {
  landmarks: Landmark[];
  quests: Quest[];
  onClose: () => void;
}

export const JournalModal: React.FC<JournalModalProps> = ({
  landmarks,
  quests,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'map' | 'landmarks' | 'quests' | 'lore'>('map');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none font-sans">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/80">
          <div className="flex items-center gap-2.5">
            <Feather className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-cinzel font-bold text-zinc-100">Explorer's Field Journal & Map</h2>
          </div>

          <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 text-xs font-mono">
            {(['map', 'landmarks', 'quests', 'lore'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  soundManager.playUiClick();
                  setActiveTab(tab);
                }}
                className={`px-3 py-1 rounded capitalize cursor-pointer transition-all ${
                  activeTab === tab
                    ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              soundManager.playUiClick();
              onClose();
            }}
            className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-zinc-950/40">
          {activeTab === 'map' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-400 uppercase tracking-wider font-semibold">
                  Valley of Whispers — Topographical Survey
                </span>
                <span className="text-amber-400">Coordinates: [X: 0, Z: 0]</span>
              </div>

              {/* Stylized Topographic Map Grid */}
              <div className="relative w-full h-80 rounded-xl bg-[#1a1b18] border border-amber-900/40 overflow-hidden p-4 shadow-inner">
                {/* Ancient Parchment & Contour Lines Pattern */}
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: `
                      radial-gradient(circle at 60% 40%, rgba(245, 158, 11, 0.3) 0%, transparent 60%),
                      radial-gradient(circle at 20% 70%, rgba(56, 189, 248, 0.25) 0%, transparent 40%),
                      linear-gradient(#4a3820 1px, transparent 1px),
                      linear-gradient(90deg, #4a3820 1px, transparent 1px)
                    `,
                    backgroundSize: '100% 100%, 100% 100%, 30px 30px, 30px 30px',
                  }}
                />

                {/* River Spline Path SVG */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
                  <path
                    d="M 0 160 Q 200 130 400 160 T 800 170"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="16"
                    strokeLinecap="round"
                  />
                  <text x="250" y="150" fill="#7dd3fc" fontSize="10" fontFamily="monospace" opacity="0.8">
                    ~ Whispering Riverbed ~
                  </text>
                </svg>

                {/* Landmark Pins on Map */}
                {landmarks.map((l) => {
                  // Normalize map coordinates: -40 to 40 -> 10% to 90%
                  const leftPercent = ((l.coordinates.x + 40) / 80) * 100;
                  const topPercent = ((l.coordinates.z + 40) / 80) * 100;

                  return (
                    <div
                      key={l.id}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer"
                      style={{ left: `${leftPercent}%`, top: `${topPercent}%` }}
                    >
                      <div className="w-6 h-6 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-amber-300 shadow-lg group-hover:scale-125 transition-transform">
                        <MapPin className="w-3.5 h-3.5" />
                      </div>
                      <span className="mt-1 px-1.5 py-0.5 rounded bg-zinc-950/90 border border-zinc-800 text-[10px] font-cinzel font-bold text-amber-200 whitespace-nowrap shadow">
                        {l.name}
                      </span>
                    </div>
                  );
                })}

                <div className="absolute bottom-3 right-3 text-[10px] font-mono text-zinc-500 bg-zinc-950/80 px-2 py-1 rounded border border-zinc-800">
                  Unreal Engine 5 Map Subsystem (Fog of War)
                </div>
              </div>
            </div>
          )}

          {activeTab === 'landmarks' && (
            <div className="space-y-4">
              <div className="text-xs font-mono text-zinc-400 uppercase tracking-wider font-semibold">
                Discovered Archaeological Sites ({landmarks.filter((l) => l.discovered).length} of {landmarks.length})
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {landmarks.map((l) => (
                  <div
                    key={l.id}
                    className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-mono text-amber-400 mb-1">
                        <span>{l.region}</span>
                        <span>
                          [{l.coordinates.x}, {l.coordinates.z}]
                        </span>
                      </div>
                      <h4 className="text-sm font-cinzel font-bold text-zinc-100">{l.name}</h4>
                      <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">{l.description}</p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[10px] font-mono text-zinc-500">
                      <span>Status: Discovered</span>
                      <span className="text-emerald-400 font-bold">+150 Exploration XP</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'quests' && (
            <div className="space-y-4">
              <div className="text-xs font-mono text-zinc-400 uppercase tracking-wider font-semibold">
                Quest Log & Mission Directives
              </div>

              <div className="space-y-3">
                {quests.map((q) => (
                  <div key={q.id} className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                        {q.status}
                      </span>
                      <span className="text-xs text-zinc-500 font-mono">Giver: {q.giver}</span>
                    </div>

                    <div>
                      <h4 className="text-base font-cinzel font-bold text-zinc-100">{q.title}</h4>
                      <p className="text-xs text-zinc-400 mt-1">{q.summary}</p>
                    </div>

                    {/* Objectives Checklist */}
                    <div className="space-y-1.5 pt-2 border-t border-zinc-800">
                      <div className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider">Objectives:</div>
                      {q.objectives.map((obj) => (
                        <div key={obj.id} className="flex items-center gap-2 text-xs">
                          {obj.isCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 text-zinc-600 shrink-0" />
                          )}
                          <span className={obj.isCompleted ? 'text-zinc-400 line-through' : 'text-zinc-200'}>
                            {obj.description}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'lore' && (
            <div className="space-y-4 max-w-2xl mx-auto">
              <div className="text-xs font-mono text-zinc-400 uppercase tracking-wider font-semibold text-center">
                Chronicles of the Sunken Kingdom
              </div>

              <div className="p-6 rounded-xl bg-zinc-900/60 border border-zinc-800 font-serif space-y-4 text-xs md:text-sm text-zinc-300 leading-relaxed italic">
                <p>
                  "In the epoch before the forest swallowed the towers, the people of Eldoria understood the harmony of stone, solar light, and running water. Their architects crafted temples not with mortar, but by resonating raw granite with harmonic frequencies."
                </p>
                <p>
                  "The Sunstone was never merely a jewel; it was the primary ignition lens for the subterranean reservoir. Without it, the water gates locked and the civilization starved for energy."
                </p>
                <div className="text-right text-xs font-mono text-amber-400 not-italic">
                  — Excerpt from Thorne's Field Transcriptions, Year 42
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
