/**
 * Data structures for WILDLANDS: The Lost Kingdom
 * UE5 Game Director & Blueprint Companion
 */

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'Relic' | 'Tool' | 'Key' | 'Lore';
  rarity: 'Common' | 'Rare' | 'Ancient' | 'Mythic';
  description: string;
  lore: string;
  iconName: string;
  quantity: number;
  weight: number; // in kg
  modelType: 'sunstone' | 'compass' | 'tablet' | 'chalice' | 'key';
  discoveredAt: string;
}

export interface QuestObjective {
  id: string;
  description: string;
  isCompleted: boolean;
  targetCount?: number;
  currentCount?: number;
  targetLocation?: string;
}

export interface Quest {
  id: string;
  title: string;
  giver: string;
  summary: string;
  status: 'Available' | 'Active' | 'Completed';
  objectives: QuestObjective[];
  rewards: {
    exp: number;
    itemName?: string;
  };
}

export interface DialogueNode {
  id: string;
  speaker: string;
  speakerTitle: string;
  text: string;
  choices: {
    text: string;
    nextNodeId: string | null;
    action?: 'accept_quest' | 'complete_quest' | 'give_item' | 'close';
    requiredQuestId?: string;
  }[];
}

export interface Landmark {
  id: string;
  name: string;
  region: string;
  discovered: boolean;
  discoveryTime?: string;
  description: string;
  coordinates: { x: number; z: number };
}

export interface BlueprintPin {
  id: string;
  name: string;
  type: 'exec' | 'bool' | 'float' | 'int' | 'vector' | 'rotator' | 'object' | 'string' | 'struct';
  isInput: boolean;
  value?: string | number | boolean;
  connectedTo?: string; // Pin ID
}

export interface BlueprintNode {
  id: string;
  title: string;
  category: 'Event' | 'Function' | 'Pure' | 'FlowControl' | 'Interface' | 'Variable' | 'Macro';
  description: string;
  subtext?: string;
  x: number;
  y: number;
  inputs: BlueprintPin[];
  outputs: BlueprintPin[];
  ue5Equivalent: string;
  tips?: string;
}

export interface BlueprintConnection {
  fromNodeId: string;
  fromPinId: string;
  toNodeId: string;
  toPinId: string;
  type: 'exec' | 'bool' | 'float' | 'int' | 'vector' | 'rotator' | 'object' | 'string' | 'struct';
}

export interface BlueprintGraphData {
  id: string;
  name: string;
  systemName: string;
  blueprintClass: string;
  parentClass: string;
  description: string;
  ue5ClipboardText: string;
  nodes: BlueprintNode[];
  connections: BlueprintConnection[];
  walkthrough: {
    stepNumber: number;
    title: string;
    action: string;
    nodesInvolved: string[];
    commonMistake: string;
  }[];
}

export interface HardwareScalabilityPreset {
  name: string;
  targetFps: number;
  resolution: string;
  renderScale: number; // e.g. 70 for TSR 70%
  lumenGI: 'Off' | 'Low' | 'Medium' | 'High';
  lumenReflections: 'Off' | 'ScreenSpace' | 'LumenLow' | 'LumenHigh';
  nanite: boolean;
  virtualShadowMaps: boolean;
  foliageDensity: number; // 0 - 100%
  viewDistance: 'Near' | 'Medium' | 'Far' | 'Epic';
  postProcessQuality: 'Low' | 'Medium' | 'High' | 'Cinematic';
  estimatedVramGB: number;
  estimatedGpuMs: number;
}
