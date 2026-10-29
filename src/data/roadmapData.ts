export interface RoadmapPhase {
  id: string;
  number: number;
  title: string;
  category: 'Foundation' | 'Controls & Anim' | 'Gameplay Systems' | 'Environment & 4K Polish';
  durationEst: string;
  summary: string;
  actionItems: {
    id: string;
    text: string;
    completedByDefault?: boolean;
    technicalDetails: string;
    ue5PathOrMenu: string;
  }[];
  directorTip: string;
}

export const PRODUCTION_ROADMAP: RoadmapPhase[] = [
  {
    id: 'phase-1',
    number: 1,
    title: 'UE5 Clean Project Creation & RTX 3050 Scalability',
    category: 'Foundation',
    durationEst: 'Day 1',
    summary: 'Initialize Unreal Engine 5 using the Third Person Blueprint template, configure project structure on SSD, and set baseline scalability.',
    directorTip: 'Never start from a Blank template if you are a beginner. The Third Person Template gives you a tested character skeleton, camera boom, and collision setup immediately.',
    actionItems: [
      {
        id: 'p1-1',
        text: 'Create New Project with Third Person Template (Blueprint Only)',
        completedByDefault: true,
        technicalDetails: 'Select Blueprint > Desktop > Quality Preset: Scalable/High > Starter Content: OFF (saves 2GB SSD). Name project: WildlandsLostKingdom.',
        ue5PathOrMenu: 'Unreal Project Browser > Games > Third Person'
      },
      {
        id: 'p1-2',
        text: 'Structure SSD Folders Cleanly',
        completedByDefault: true,
        technicalDetails: 'Create Content/Wildlands/ with subfolders: Core, Blueprints, Environment, UI, Audio, Data. Never dump assets in Content root.',
        ue5PathOrMenu: 'Content Browser > Content/Wildlands'
      },
      {
        id: 'p1-3',
        text: 'Set Editor Scalability to High / Medium for RTX 3050',
        completedByDefault: true,
        technicalDetails: 'In Editor Settings, set Viewport Resolution to 1080p, Anti-Aliasing to TSR (70%), Global Illumination to Medium Lumen.',
        ue5PathOrMenu: 'Settings (Top Right) > Engine Scalability Settings'
      }
    ]
  },
  {
    id: 'phase-2',
    number: 2,
    title: 'Enhanced Input Setup (Move, Look, Sprint, Crouch, Interact)',
    category: 'Controls & Anim',
    durationEst: 'Day 2',
    summary: 'Replace legacy axis inputs with UE5 Enhanced Input Actions and Input Mapping Context (IMC_Default).',
    directorTip: 'Input Actions decouple input hardware from character code. Whether your player uses Keyboard or an Xbox controller, the character only sees the IA_Move Vector2D.',
    actionItems: [
      {
        id: 'p2-1',
        text: 'Create Input Actions (IA_Move, IA_Look, IA_Sprint, IA_Interact, IA_Crouch)',
        technicalDetails: 'Set IA_Move to Value Type: Axis2D (Vector2D). Set IA_Look to Axis2D. Set IA_Sprint and IA_Interact to Digital (bool).',
        ue5PathOrMenu: 'Right Click > Input > Input Action'
      },
      {
        id: 'p2-2',
        text: 'Configure IMC_Default (Input Mapping Context)',
        technicalDetails: 'Map W (Swizzle Y), S (Swizzle Y, Negate), D (None), A (Negate). Map Mouse XY to IA_Look (Negate Y for standard invert look).',
        ue5PathOrMenu: 'Right Click > Input > Input Mapping Context'
      },
      {
        id: 'p2-3',
        text: 'Bind Actions in BP_WildlandsCharacter',
        technicalDetails: 'In Event BeginPlay, add IMC_Default to EnhancedInputLocalPlayerSubsystem. Connect IA_Move to AddMovementInput using Camera Yaw.',
        ue5PathOrMenu: 'BP_WildlandsCharacter > Event Graph'
      }
    ]
  },
  {
    id: 'phase-3',
    number: 3,
    title: 'Animation Blueprint & Smooth Locomotion State Machine',
    category: 'Controls & Anim',
    durationEst: 'Day 3–4',
    summary: 'Build ABP_Explorer with Locomotion State Machine, BlendSpace 1D (Walk/Jog/Sprint), and Jump Start/Loop/End states.',
    directorTip: 'Do not attempt complex root motion or custom IK rigs until your in-place BlendSpace 1D feels 100% snappy with smooth acceleration/deceleration.',
    actionItems: [
      {
        id: 'p3-1',
        text: 'Create BS_Locomotion (BlendSpace 1D)',
        technicalDetails: 'Horizontal Axis: Speed (0 to 750). Keyframe Idle (0), Walk (200), Jog (450), Sprint (750). Enable smoothing interpolation (time: 0.15s).',
        ue5PathOrMenu: 'Right Click > Animation > Blend Space 1D'
      },
      {
        id: 'p3-2',
        text: 'Create ABP_Explorer Animation Blueprint',
        technicalDetails: 'Assign SK_Mannequin. In EventBlueprintUpdateAnimation, extract Ground Speed and IsFalling from TryGetPawnOwner.',
        ue5PathOrMenu: 'Right Click > Animation > Animation Blueprint'
      },
      {
        id: 'p3-3',
        text: 'Build State Machine (Locomotion -> JumpStart -> JumpLoop -> JumpEnd)',
        technicalDetails: 'Transition to JumpStart when IsFalling = True. Transition to JumpEnd when IsFalling = False. Return to Locomotion on Time Remaining Ratio < 0.1.',
        ue5PathOrMenu: 'ABP_Explorer > AnimGraph > State Machine'
      },
      {
        id: 'p3-4',
        text: 'Implement AnimNotify Footstep System & Physical Materials',
        technicalDetails: 'Create AN_Footstep AnimNotify class. Add notify to Walk/Run animation timelines at heel strikes with FootSocketName (foot_l, foot_r). In Character BP, perform downward LineTrace with bReturnPhysicalMaterial=True, switch on EPhysicalSurface (Grass, Stone, Water, Wood), and play pitch-randomized sound cues.',
        ue5PathOrMenu: 'Animation Sequences > Notifies Track & BP_WildlandsCharacter'
      }
    ]
  },
  {
    id: 'phase-4',
    number: 4,
    title: 'System A: Universal Interaction Interface & Pickups',
    category: 'Gameplay Systems',
    durationEst: 'Day 5',
    summary: 'Create BPI_Interactable interface, camera sphere trace, HUD "Press E to Interact" prompt, and interactable chest / relic actors.',
    directorTip: 'Always use a Blueprint Interface instead of Casting. With an interface, you can make doors, chests, artifacts, and NPCs all respond to the exact same [E] press with zero tight coupling.',
    actionItems: [
      {
        id: 'p4-1',
        text: 'Create BPI_Interactable Blueprint Interface',
        technicalDetails: 'Add functions: Interact(Instigator: Actor), GetInteractionPrompt(OutText: Text, CanInteract: Bool).',
        ue5PathOrMenu: 'Content/Wildlands/Blueprints/Interfaces/BPI_Interactable'
      },
      {
        id: 'p4-2',
        text: 'Implement Sphere Trace in BP_WildlandsCharacter',
        technicalDetails: 'Trace 250 units from FollowCamera forward vector. Call DoesImplementInterface. Show WBP_InteractionPrompt when actor is valid.',
        ue5PathOrMenu: 'BP_WildlandsCharacter > Function: CheckForInteractable'
      },
      {
        id: 'p4-3',
        text: 'Build BP_AncientRelic and BP_CryptDoor',
        technicalDetails: 'In Class Settings add BPI_Interactable. Implement Event Interact. For door, play Timeline Lerping Yaw 0 to 90 degrees.',
        ue5PathOrMenu: 'Content/Wildlands/Blueprints/Props/BP_CryptDoor'
      }
    ]
  },
  {
    id: 'phase-5',
    number: 5,
    title: 'System B & C: Objectives, Quests & 3D Item Inspection',
    category: 'Gameplay Systems',
    durationEst: 'Day 6–7',
    summary: 'Build quest data table, objective HUD tracker, component-based inventory, and 3D rotatable artifact inspector.',
    directorTip: 'Inspection makes artifacts feel precious. In Wildlands, discovering an ancient relic should feel like finding a historical treasure you can turn around and examine in your hands.',
    actionItems: [
      {
        id: 'p5-1',
        text: 'Create FQuestData and FInventoryItem Structs',
        technicalDetails: 'Create Structs with ID, Name, Lore, 3D Mesh Class, Weight, and Value. Create DT_Quests data table.',
        ue5PathOrMenu: 'Content/Wildlands/Data/Structures'
      },
      {
        id: 'p5-2',
        text: 'Create BP_InventoryComponent (Actor Component)',
        technicalDetails: 'Add Items Array (Array of FInventoryItem). Create functions: TryAddItem, RemoveItem, GetTotalWeight.',
        ue5PathOrMenu: 'Content/Wildlands/Blueprints/Components/BP_InventoryComponent'
      },
      {
        id: 'p5-3',
        text: 'Build WBP_ItemInspector with Scene Capture 2D',
        technicalDetails: 'Setup isolated inspection room, Render Target 2D, and mouse drag rotation logic on the preview mesh.',
        ue5PathOrMenu: 'Content/Wildlands/UI/WBP_ItemInspector'
      }
    ]
  },
  {
    id: 'phase-6',
    number: 6,
    title: 'System D & E: NPCs, Dialogue & Landmark Discovery',
    category: 'Gameplay Systems',
    durationEst: 'Day 8–9',
    summary: 'Add Elder Thorne NPC with branching dialogue, cinematic camera blend, discovery trigger volumes, and explorer journal.',
    directorTip: 'Keep dialogue concise and atmospheric. Elder Thorne introduces the ancient fall of Eldoria without lengthy exposition walls.',
    actionItems: [
      {
        id: 'p6-1',
        text: 'Create BP_NPC_Elder with BPI_Interactable',
        technicalDetails: 'On interact, call SetViewTargetWithBlend to pan to over-the-shoulder dialogue camera angle and spawn WBP_DialogueBox.',
        ue5PathOrMenu: 'Content/Wildlands/Blueprints/NPCs/BP_NPC_Elder'
      },
      {
        id: 'p6-2',
        text: 'Create BP_LandmarkVolume (Trigger Box)',
        technicalDetails: 'Add Box Collision, Landmark ID variable, and DoOnce node. Fire Event OnDiscovered to show screen banner and award XP.',
        ue5PathOrMenu: 'Content/Wildlands/Blueprints/World/BP_LandmarkVolume'
      },
      {
        id: 'p6-3',
        text: 'Create WBP_ExplorerJournal',
        technicalDetails: 'Tabs: Quests, Discovered Landmarks, Artifact Lore. Press [J] or [M] to toggle.',
        ue5PathOrMenu: 'Content/Wildlands/UI/WBP_ExplorerJournal'
      }
    ]
  },
  {
    id: 'phase-7',
    number: 7,
    title: 'Environment Art, Landscape Material & River Water',
    category: 'Environment & 4K Polish',
    durationEst: 'Day 10–12',
    summary: 'Create the Valley of Whispers prototype level: auto-slope landscape rock/grass material, Quixel foliage, riverbed, and ancient ruins.',
    directorTip: 'Use slope-based auto-texturing! When the terrain angle is > 45 degrees, automatically blend to cliff rock. This saves hundreds of hours of manual terrain painting.',
    actionItems: [
      {
        id: 'p7-1',
        text: 'Create Auto-Slope Landscape Material (M_WildlandsTerrain)',
        technicalDetails: 'Use WorldNormal dot Product with Up Vector (0,0,1). Slope > 45° blends to Cliff Rock. Slope < 45° blends to Forest Grass with Distance Blending.',
        ue5PathOrMenu: 'Content/Wildlands/Environment/Materials/M_WildlandsTerrain'
      },
      {
        id: 'p7-2',
        text: 'Place Water Body River & Underwater Post Process',
        technicalDetails: 'Enable UE5 Water Plugin. Drag Water Body River spline. Adjust depth Murkiness and Shoreline foam opacity.',
        ue5PathOrMenu: 'Plugins > Water > Water Body River'
      },
      {
        id: 'p7-3',
        text: 'Scatter Foliage with Strict Cull Distances',
        technicalDetails: 'Set Foliage Start Cull Distance = 3500, End Cull Distance = 7000 units on RTX 3050. This maintains 60 FPS in dense forests.',
        ue5PathOrMenu: 'Foliage Mode (Shift+3) > Foliage Type Details'
      }
    ]
  },
  {
    id: 'phase-8',
    number: 8,
    title: 'RTX 3050 Optimization & 4K Output (TSR Upscaling)',
    category: 'Environment & 4K Polish',
    durationEst: 'Day 13–14',
    summary: 'Performance profiling pass, Virtual Shadow Maps tuning, VRAM budgeting, and configuring 4K output upscaling with TSR.',
    directorTip: 'Never try native 4K on an RTX 3050—it will drop to 12 FPS. Use TSR 70% screen percentage with 4K output. It renders at 1512p internally and outputs a pristine 4K image at 45–60 FPS!',
    actionItems: [
      {
        id: 'p8-1',
        text: 'Profile GPU with stat unit & profilegpu',
        technicalDetails: 'Confirm GPU frame time < 16.6ms for 60 FPS or < 33.3ms for 30 FPS target. Check Lumen and Shadow costs.',
        ue5PathOrMenu: 'Tilde (~) Console: stat unit'
      },
      {
        id: 'p8-2',
        text: 'Apply DefaultEngine.ini Scalability Block',
        technicalDetails: 'Set Software Ray Tracing (r.Lumen.HardwareRayTracing 0), PoolSize 3500MB, and Virtual Shadow Map bias.',
        ue5PathOrMenu: 'ProjectDirectory/Config/DefaultEngine.ini'
      },
      {
        id: 'p8-3',
        text: 'Package and Test Standalone Build',
        technicalDetails: 'Go to Platforms > Windows > Package Project. Test shipping build to ensure no editor overhead impacts frame rate.',
        ue5PathOrMenu: 'Platforms > Windows > Package Project'
      }
    ]
  }
];
