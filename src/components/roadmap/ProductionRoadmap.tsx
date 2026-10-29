import React, { useState } from 'react';
import { PRODUCTION_ROADMAP, RoadmapPhase } from '../../data/roadmapData';
import { 
  CheckCircle2, 
  Circle, 
  Compass, 
  Layers, 
  AlertTriangle, 
  Sparkles, 
  Clock, 
  ChevronRight,
  FolderGit2,
  Check,
  Search
} from 'lucide-react';
import { soundManager } from '../../utils/audio';

interface ProductionRoadmapProps {
  onNavigateToBlueprint?: (blueprintId: string) => void;
}

export const ProductionRoadmap: React.FC<ProductionRoadmapProps> = ({ onNavigateToBlueprint }) => {
  const [selectedPhaseId, setSelectedPhaseId] = useState<string>('phase-1');
  const [completedItems, setCompletedItems] = useState<{ [id: string]: boolean }>({
    'p1-1': true,
    'p1-2': true,
    'p1-3': true,
  });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const activePhase = PRODUCTION_ROADMAP.find((p) => p.id === selectedPhaseId) || PRODUCTION_ROADMAP[0];

  const toggleItem = (itemId: string) => {
    soundManager.playUiClick();
    setCompletedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  // Filtered phases
  const filteredPhases = PRODUCTION_ROADMAP.filter((phase) => {
    const matchesCat = selectedCategory === 'All' || phase.category === selectedCategory;
    const matchesSearch =
      phase.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      phase.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      phase.actionItems.some((item) => item.text.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  // Calculate overall progress percentage
  const totalItemsCount = PRODUCTION_ROADMAP.reduce((acc, p) => acc + p.actionItems.length, 0);
  const totalCompletedCount = Object.values(completedItems).filter(Boolean).length;
  const progressPercent = Math.round((totalCompletedCount / totalItemsCount) * 100);

  return (
    <div className="flex-1 h-full overflow-y-auto bg-zinc-950 text-zinc-100 p-4 md:p-6 select-none font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header & Overall Game Director Progress */}
        <div className="bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-amber-950/20 border border-zinc-800 rounded-xl p-5 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs font-semibold uppercase tracking-wider">
                  AAA Game Director Roadmap
                </span>
                <span className="text-zinc-500 text-xs font-mono">• Practical Beginner-Friendly Order</span>
              </div>
              <h2 className="text-2xl font-cinzel font-bold text-zinc-100">
                WILDLANDS: The Lost Kingdom Production Pipeline
              </h2>
              <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
                Step-by-step master plan taking you from initial Unreal Engine 5 project creation to a polished, playable 4K prototype on your PC.
              </p>
            </div>

            {/* Overall Progress Tracker */}
            <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-3 min-w-[220px]">
              <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                <span className="text-zinc-400">Total Completion:</span>
                <span className="text-amber-400 font-bold">{progressPercent}%</span>
              </div>
              <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden border border-zinc-800 mb-1.5">
                <div
                  className="h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="text-[10px] text-zinc-500 font-mono text-right">
                {totalCompletedCount} of {totalItemsCount} Milestones Done
              </div>
            </div>
          </div>

          {/* Category Filter Pills & Search */}
          <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-zinc-800/80">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {['All', 'Foundation', 'Controls & Anim', 'Gameplay Systems', 'Environment & 4K Polish'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                    selectedCategory === cat
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-zinc-950 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search milestones..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-8 pr-3 py-1 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Two-Column Master View: Phase List & Active Phase Deep Dive */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Phase Navigation List (4 cols) */}
          <div className="lg:col-span-4 space-y-2.5">
            {filteredPhases.map((phase) => {
              const isSelected = phase.id === selectedPhaseId;
              const phaseCompleted = phase.actionItems.every((item) => completedItems[item.id]);
              const completedInPhase = phase.actionItems.filter((item) => completedItems[item.id]).length;

              return (
                <div
                  key={phase.id}
                  onClick={() => {
                    soundManager.playUiClick();
                    setSelectedPhaseId(phase.id);
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                    isSelected
                      ? 'bg-zinc-900 border-amber-500/60 shadow-lg'
                      : 'bg-zinc-900/50 border-zinc-800/80 hover:bg-zinc-900/80 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-mono font-bold text-amber-400 uppercase">
                      Phase {phase.number} • {phase.durationEst}
                    </span>
                    {phaseCompleted && (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-mono flex items-center gap-1">
                        <Check className="w-3 h-3" /> Done
                      </span>
                    )}
                  </div>

                  <h3 className="font-semibold text-xs text-zinc-200 leading-snug">{phase.title}</h3>

                  <div className="flex items-center justify-between text-[11px] text-zinc-500 mt-2 font-mono">
                    <span className="truncate">{phase.category}</span>
                    <span>
                      {completedInPhase}/{phase.actionItems.length}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Phase Implementation Details & Action Items (8 cols) */}
          <div className="lg:col-span-8 bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 shadow-xl flex flex-col justify-between">
            <div>
              {/* Active Phase Header */}
              <div className="border-b border-zinc-800 pb-4 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                    Phase {activePhase.number} • {activePhase.category}
                  </span>
                  <span className="text-xs text-zinc-400 font-mono flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Target: {activePhase.durationEst}
                  </span>
                </div>
                <h3 className="text-xl font-cinzel font-bold text-zinc-100 mt-1">{activePhase.title}</h3>
                <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">{activePhase.summary}</p>

                {/* Game Director Note */}
                <div className="mt-3 bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-xs flex items-start gap-2 text-amber-200">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-amber-300 font-semibold">Game Director's Rule:</strong>{' '}
                    {activePhase.directorTip}
                  </div>
                </div>
              </div>

              {/* Action Checklist */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider font-mono text-zinc-300 mb-3 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-amber-400" />
                  Implementation Tasks & UE5 Navigation
                </h4>

                <div className="space-y-3">
                  {activePhase.actionItems.map((item) => {
                    const isDone = !!completedItems[item.id];
                    return (
                      <div
                        key={item.id}
                        onClick={() => toggleItem(item.id)}
                        className={`p-3 rounded-lg border transition-all cursor-pointer ${
                          isDone
                            ? 'bg-zinc-950/70 border-emerald-500/40 opacity-90'
                            : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <button
                            type="button"
                            className="mt-0.5 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                          >
                            {isDone ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                            ) : (
                              <Circle className="w-5 h-5 text-zinc-600 hover:text-zinc-400" />
                            )}
                          </button>
                          <div className="flex-1">
                            <div
                              className={`text-xs font-semibold ${
                                isDone ? 'text-zinc-400 line-through' : 'text-zinc-200'
                              }`}
                            >
                              {item.text}
                            </div>
                            <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                              {item.technicalDetails}
                            </p>

                            <div className="mt-2 flex items-center gap-1.5 text-[10px] font-mono text-zinc-500 bg-zinc-900/90 px-2 py-1 rounded border border-zinc-800/80 w-fit">
                              <FolderGit2 className="w-3 h-3 text-sky-400" />
                              <span>{item.ue5PathOrMenu}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Quick Action Link to Blueprint Editor if relevant */}
            <div className="mt-6 pt-4 border-t border-zinc-800 flex items-center justify-between text-xs">
              <span className="text-zinc-500 font-mono text-[11px]">
                Ready to wire Blueprint nodes for this phase?
              </span>
              {onNavigateToBlueprint && (
                <button
                  onClick={() => onNavigateToBlueprint('char-movement')}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
                >
                  <span>Open Blueprint Studio</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
