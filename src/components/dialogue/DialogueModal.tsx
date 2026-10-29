import React, { useState } from 'react';
import { DialogueNode } from '../../types/game';
import { MessageSquare, ArrowRight, User, Check, Sparkles } from 'lucide-react';
import { soundManager } from '../../utils/audio';

interface DialogueModalProps {
  onClose: () => void;
  onAcceptQuest: (questId: string) => void;
}

const DIALOGUE_NODES: { [key: string]: DialogueNode } = {
  start: {
    id: 'start',
    speaker: 'Elder Thorne',
    speakerTitle: 'Veteran Antiquarian & Royal Archivist',
    text: 'Greetings, traveler. You step upon the sacred soil of Eldoria—or what little remains after the cataclysm. Nature has reclaimed the stone, but the ancient mechanisms still hum beneath our feet.',
    choices: [
      {
        text: 'What was this kingdom, and why did it fall?',
        nextNodeId: 'lore',
      },
      {
        text: 'I am searching for lost artifacts. Can you guide me?',
        nextNodeId: 'quest_offer',
      },
      {
        text: 'Do you have any advice for surviving these wildlands?',
        nextNodeId: 'survival',
      },
      {
        text: 'Farewell for now, Thorne.',
        nextNodeId: null,
        action: 'close',
      },
    ],
  },
  lore: {
    id: 'lore',
    speaker: 'Elder Thorne',
    speakerTitle: 'Veteran Antiquarian & Royal Archivist',
    text: 'A thousand years ago, the Sun-Kings commanded arcane clockwork and crystal conduits. When their subterranean vault was breached, the mountains shook and the river split. The civilization vanished in a single solstice night.',
    choices: [
      {
        text: 'Tell me about the artifacts left behind.',
        nextNodeId: 'quest_offer',
      },
      {
        text: 'I must return to exploring.',
        nextNodeId: null,
        action: 'close',
      },
    ],
  },
  quest_offer: {
    id: 'quest_offer',
    speaker: 'Elder Thorne',
    speakerTitle: 'Veteran Antiquarian & Royal Archivist',
    text: 'Across the river sits the Sunken Sun Temple. Deep within its altar lies the Sunstone of Eldoria, a golden relic that powered their aqueducts. If you retrieve it and unlock the crypt gateway, we may uncover their lost maps.',
    choices: [
      {
        text: 'I will find the Sunstone and unlock the Crypt. [Accept Quest]',
        nextNodeId: 'quest_accepted',
        action: 'accept_quest',
      },
      {
        text: 'The ruins seem too dangerous right now.',
        nextNodeId: 'start',
      },
    ],
  },
  quest_accepted: {
    id: 'quest_accepted',
    speaker: 'Elder Thorne',
    speakerTitle: 'Veteran Antiquarian & Royal Archivist',
    text: 'May the dawn guide your footsteps. Cross the shallow riverbed and look for the fluted stone pillars. Press [E] when you are near the altar to secure the relic.',
    choices: [
      {
        text: 'I am on my way. [Begin Quest]',
        nextNodeId: null,
        action: 'close',
      },
    ],
  },
  survival: {
    id: 'survival',
    speaker: 'Elder Thorne',
    speakerTitle: 'Veteran Antiquarian & Royal Archivist',
    text: 'Conserve your stamina—sprinting through thick brush will exhaust you quickly. And keep your compass calibrated; magnetic interference from ancient ore veins can disorient even the most experienced explorer.',
    choices: [
      {
        text: 'Thank you, Elder. Let me ask something else.',
        nextNodeId: 'start',
      },
      {
        text: 'Understood. Goodbye.',
        nextNodeId: null,
        action: 'close',
      },
    ],
  },
};

export const DialogueModal: React.FC<DialogueModalProps> = ({ onClose, onAcceptQuest }) => {
  const [currentNodeId, setCurrentNodeId] = useState<string>('start');

  const currentNode = DIALOGUE_NODES[currentNodeId] || DIALOGUE_NODES.start;

  const handleChoice = (choice: (typeof currentNode.choices)[0]) => {
    soundManager.playUiClick();

    if (choice.action === 'accept_quest') {
      onAcceptQuest('quest-sunstone');
    }

    if (choice.action === 'close' || !choice.nextNodeId) {
      onClose();
    } else {
      setCurrentNodeId(choice.nextNodeId);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 md:p-8 bg-black/70 backdrop-blur-xs select-none font-sans">
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl p-6 space-y-4">
        {/* Speaker Nameplate */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="font-cinzel font-bold text-base text-zinc-100">{currentNode.speaker}</div>
              <div className="text-[11px] font-mono text-amber-400">{currentNode.speakerTitle}</div>
            </div>
          </div>
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
            Cinematic Dialogue (UE5 UMG)
          </span>
        </div>

        {/* Dialogue Text */}
        <div className="p-4 bg-zinc-950/70 rounded-xl border border-zinc-800/80">
          <p className="text-sm md:text-base text-zinc-200 leading-relaxed font-serif italic">
            "{currentNode.text}"
          </p>
        </div>

        {/* Dialogue Choices */}
        <div className="space-y-2 pt-1">
          <div className="text-[10px] uppercase font-mono text-zinc-500 tracking-wider">Select Response:</div>
          <div className="grid grid-cols-1 gap-2">
            {currentNode.choices.map((choice, idx) => (
              <button
                key={idx}
                onClick={() => handleChoice(choice)}
                className="w-full text-left p-3 rounded-xl border border-zinc-800 bg-zinc-950/60 hover:bg-amber-500/10 hover:border-amber-500/50 text-xs md:text-sm text-zinc-300 hover:text-amber-200 font-medium transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-md bg-zinc-900 border border-zinc-700 flex items-center justify-center text-[10px] font-mono text-zinc-400 group-hover:text-amber-300 group-hover:border-amber-500">
                    {idx + 1}
                  </span>
                  <span>{choice.text}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
