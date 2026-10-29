import React, { useState } from 'react';
import { GameCanvas } from './components/game3d/GameCanvas';
import { BlueprintEditor } from './components/blueprints/BlueprintEditor';
import { HardwareProfiler } from './components/hardware/HardwareProfiler';
import { ProductionRoadmap } from './components/roadmap/ProductionRoadmap';
import { ItemInspectorModal } from './components/inventory/ItemInspectorModal';
import { DialogueModal } from './components/dialogue/DialogueModal';
import { JournalModal } from './components/journal/JournalModal';
import { InventoryItem, Quest, Landmark } from './types/game';
import { 
  Gamepad2, 
  Code2, 
  Cpu, 
  Map, 
  Compass, 
  Sparkles, 
  BookOpen, 
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { soundManager } from './utils/audio';

export default function App() {
  const [activeTab, setActiveTab] = useState<'game' | 'blueprint' | 'hardware' | 'roadmap'>('game');

  // Interactive Game State
  const [inventory, setInventory] = useState<InventoryItem[]>([
    {
      id: 'item-grapple',
      name: "Field Grappling Hook",
      category: 'Tool',
      rarity: 'Common',
      description: 'Reinforced hemp rope attached to a hardened forged steel anchor.',
      lore: 'Standard issue explorer gear for navigating rocky cliffs and steep valley gullies.',
      iconName: 'Shield',
      quantity: 1,
      weight: 2.5,
      modelType: 'key',
      discoveredAt: 'Starting Equipment',
    },
  ]);

  const [selectedInspectItem, setSelectedInspectItem] = useState<InventoryItem | null>(null);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isDialogueOpen, setIsDialogueOpen] = useState(false);
  const [isJournalOpen, setIsJournalOpen] = useState(false);

  // Quests
  const [quests, setQuests] = useState<Quest[]>([
    {
      id: 'quest-sunstone',
      title: 'The Sunken Sun Temple',
      giver: 'Elder Thorne',
      summary: 'Explore the ancient ruins across the riverbed, recover the Sunstone relic from the altar, and unlock the crypt gateway.',
      status: 'Active',
      rewards: { exp: 350, itemName: 'Ancient Explorer Seal' },
      objectives: [
        {
          id: 'obj-talk',
          description: 'Consult with Elder Thorne at his camp',
          isCompleted: true,
        },
        {
          id: 'obj-sunstone',
          description: 'Retrieve the Sunstone of Eldoria from the Temple Altar',
          isCompleted: false,
        },
        {
          id: 'obj-chest',
          description: 'Search the ruined outpost chest for the Wayfarer’s Compass',
          isCompleted: false,
        },
      ],
    },
  ]);

  // Landmarks
  const [landmarks, setLandmarks] = useState<Landmark[]>([
    {
      id: 'landmark-valley',
      name: 'Valley of Whispers',
      region: 'Central Wildlands',
      discovered: true,
      description: 'A sprawling natural basin carved by ancient glacial melt, bounded by mossy cliffs.',
      coordinates: { x: 0, z: 0 },
    },
    {
      id: 'landmark-temple',
      name: 'The Sunken Sun Temple',
      region: 'Valley of Whispers',
      discovered: false,
      description: 'An ancient ceremonial courtyard surrounded by fluted stone pillars and an arcane solar altar.',
      coordinates: { x: 18, z: -12 },
    },
    {
      id: 'landmark-camp',
      name: "Elder Thorne's Encampment",
      region: 'Wildlands Border',
      discovered: false,
      description: 'A modest surveyor camp with a warm campfire, field research journals, and supplies.',
      coordinates: { x: -14, z: 10 },
    },
  ]);

  const activeQuest = quests.find((q) => q.status === 'Active') || null;

  // Handlers for 3D Game Events
  const handleInteractRelic = (relicItem: InventoryItem) => {
    setInventory((prev) => {
      if (prev.some((i) => i.id === relicItem.id)) return prev;
      return [relicItem, ...prev];
    });

    // Mark quest objective completed
    setQuests((prev) =>
      prev.map((q) => {
        if (q.id === 'quest-sunstone') {
          return {
            ...q,
            objectives: q.objectives.map((obj) =>
              obj.id === 'obj-sunstone' ? { ...obj, isCompleted: true } : obj
            ),
          };
        }
        return q;
      })
    );
  };

  const handleOpenChest = (chestItem: InventoryItem) => {
    setInventory((prev) => {
      if (prev.some((i) => i.id === chestItem.id)) return prev;
      return [chestItem, ...prev];
    });

    setQuests((prev) =>
      prev.map((q) => {
        if (q.id === 'quest-sunstone') {
          return {
            ...q,
            objectives: q.objectives.map((obj) =>
              obj.id === 'obj-chest' ? { ...obj, isCompleted: true } : obj
            ),
          };
        }
        return q;
      })
    );
  };

  const handleDiscoverLandmark = (landmark: Landmark) => {
    setLandmarks((prev) => {
      const existing = prev.find((l) => l.id === landmark.id);
      if (existing) {
        return prev.map((l) => (l.id === landmark.id ? { ...l, discovered: true } : l));
      }
      return [...prev, landmark];
    });
  };

  const handleAcceptQuest = (questId: string) => {
    setQuests((prev) =>
      prev.map((q) => {
        if (q.id === questId) {
          return { ...q, status: 'Active' };
        }
        return q;
      })
    );
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-zinc-950 text-zinc-100 font-sans">
      {/* Top Application Header Bar */}
      <header className="h-14 border-b border-zinc-800 bg-zinc-900/90 px-4 md:px-6 flex items-center justify-between gap-4 z-40">
        {/* Left: Branding & Game Title */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 text-zinc-950 font-cinzel font-black text-base">
            W
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-cinzel font-bold text-sm md:text-base text-zinc-100 tracking-wide uppercase">
                Wildlands: The Lost Kingdom
              </h1>
              <span className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-mono font-semibold">
                UE5 Studio Companion
              </span>
            </div>
            <div className="text-[11px] text-zinc-400 font-mono hidden md:block">
              AAA 4K Open-World Game Director & Blueprint Visual Scripting Studio
            </div>
          </div>
        </div>

        {/* Center: Main Mode Switcher */}
        <nav className="flex items-center gap-1 bg-zinc-950 border border-zinc-800 rounded-xl p-1 shadow-inner">
          <button
            onClick={() => {
              soundManager.playUiClick();
              setActiveTab('game');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
              activeTab === 'game'
                ? 'bg-amber-500 text-zinc-950 shadow-md font-bold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            <span>Playable Prototype</span>
          </button>

          <button
            onClick={() => {
              soundManager.playUiClick();
              setActiveTab('blueprint');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
              activeTab === 'blueprint'
                ? 'bg-amber-500 text-zinc-950 shadow-md font-bold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>UE5 Blueprint Studio</span>
          </button>

          <button
            onClick={() => {
              soundManager.playUiClick();
              setActiveTab('hardware');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
              activeTab === 'hardware'
                ? 'bg-amber-500 text-zinc-950 shadow-md font-bold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>RTX 3050 & 4K Setup</span>
          </button>

          <button
            onClick={() => {
              soundManager.playUiClick();
              setActiveTab('roadmap');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
              activeTab === 'roadmap'
                ? 'bg-amber-500 text-zinc-950 shadow-md font-bold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Production Roadmap</span>
          </button>
        </nav>

        {/* Right: Quick Links */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundManager.playUiClick();
              setIsJournalOpen(true);
            }}
            className="p-2 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white cursor-pointer border border-zinc-700/60"
            title="Open Field Journal & Map (J / M)"
          >
            <Compass className="w-4 h-4 text-cyan-400" />
          </button>
          <button
            onClick={() => {
              soundManager.playUiClick();
              setIsInventoryOpen(true);
            }}
            className="px-2.5 py-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white cursor-pointer border border-zinc-700/60 text-xs font-mono flex items-center gap-1.5"
            title="Open Backpack (I)"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{inventory.length}</span>
          </button>
        </div>
      </header>

      {/* Main Content Workspace */}
      <main className="flex-1 overflow-hidden relative">
        {activeTab === 'game' && (
          <GameCanvas
            onInteractRelic={handleInteractRelic}
            onOpenChest={handleOpenChest}
            onTalkNpc={() => setIsDialogueOpen(true)}
            onDiscoverLandmark={handleDiscoverLandmark}
            onOpenInventory={() => setIsInventoryOpen(true)}
            onOpenJournal={() => setIsJournalOpen(true)}
            inventoryCount={inventory.length}
            activeQuest={activeQuest}
          />
        )}

        {activeTab === 'blueprint' && <BlueprintEditor />}

        {activeTab === 'hardware' && <HardwareProfiler />}

        {activeTab === 'roadmap' && (
          <ProductionRoadmap
            onNavigateToBlueprint={() => setActiveTab('blueprint')}
          />
        )}
      </main>

      {/* Modals */}
      {isInventoryOpen && (
        <ItemInspectorModal
          items={inventory}
          selectedItem={selectedInspectItem}
          onSelectItem={(item) => setSelectedInspectItem(item)}
          onClose={() => setIsInventoryOpen(false)}
        />
      )}

      {isDialogueOpen && (
        <DialogueModal
          onClose={() => setIsDialogueOpen(false)}
          onAcceptQuest={handleAcceptQuest}
        />
      )}

      {isJournalOpen && (
        <JournalModal
          landmarks={landmarks}
          quests={quests}
          onClose={() => setIsJournalOpen(false)}
        />
      )}
    </div>
  );
}
