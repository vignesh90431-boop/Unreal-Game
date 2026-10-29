import { BlueprintGraphData } from '../types/game';

export const BLUEPRINT_GRAPHS: BlueprintGraphData[] = [
  {
    id: 'char-movement',
    name: 'Player Locomotion & Enhanced Input',
    systemName: 'Core Character',
    blueprintClass: 'BP_WildlandsCharacter',
    parentClass: 'ACharacter (ThirdPersonCharacter)',
    description: 'Handles 8-way directional movement, sprint stamina drain, crouch toggle, and responsive camera boom rotation via Unreal Engine 5 Enhanced Input System.',
    ue5ClipboardText: `Begin Object Class=/Script/BlueprintGraph.K2Node_EnhancedInputAction Name="K2Node_EnhancedInputAction_0"
   InputAction=InputAction'"/Game/Input/Actions/IA_Move.IA_Move"'
   NodePosX=100
   NodePosY=200
   NodeGuid=A1B2C3D4E5F67890
End Object
Begin Object Class=/Script/BlueprintGraph.K2Node_CallFunction Name="K2Node_CallFunction_AddMovement"
   FunctionReference=(MemberParent=Class'"/Script/Engine.Character"',MemberName="AddMovementInput")
   NodePosX=480
   NodePosY=200
   NodeGuid=B2C3D4E5F67890A1
End Object
Begin Object Class=/Script/BlueprintGraph.K2Node_EnhancedInputAction Name="K2Node_EnhancedInputAction_Sprint"
   InputAction=InputAction'"/Game/Input/Actions/IA_Sprint.IA_Sprint"'
   NodePosX=100
   NodePosY=500
   NodeGuid=C3D4E5F67890A1B2
End Object
Begin Object Class=/Script/BlueprintGraph.K2Node_CallFunction Name="K2Node_CallFunction_SetMaxWalkSpeed"
   FunctionReference=(MemberParent=Class'"/Script/Engine.CharacterMovementComponent"',MemberName="SetMaxWalkSpeed")
   NodePosX=500
   NodePosY=500
   NodeGuid=D4E5F67890A1B2C3
End Object`,
    nodes: [
      {
        id: 'node-ia-move',
        title: 'EnhancedInputAction IA_Move',
        category: 'Event',
        description: 'Fired when W/A/S/D or Left Stick is deflected.',
        subtext: 'ActionValue: Vector2D',
        x: 60,
        y: 120,
        ue5Equivalent: 'K2Node_EnhancedInputAction (IA_Move)',
        tips: 'Ensure IMC_Default is added via Add Mapping Context in BeginPlay!',
        inputs: [],
        outputs: [
          { id: 'ia-move-exec', name: 'Triggered', type: 'exec', isInput: false },
          { id: 'ia-move-ongoing', name: 'Ongoing', type: 'exec', isInput: false },
          { id: 'ia-move-val', name: 'Action Value', type: 'vector', isInput: false },
          { id: 'ia-move-val-x', name: 'Action Value X', type: 'float', isInput: false },
          { id: 'ia-move-val-y', name: 'Action Value Y', type: 'float', isInput: false }
        ]
      },
      {
        id: 'node-get-ctrl-rot',
        title: 'Get Control Rotation',
        category: 'Pure',
        description: 'Returns the current camera/controller look rotation.',
        x: 60,
        y: 340,
        ue5Equivalent: 'APawn::GetControlRotation',
        inputs: [],
        outputs: [
          { id: 'ctrl-rot-out', name: 'Return Value', type: 'rotator', isInput: false }
        ]
      },
      {
        id: 'node-break-rot',
        title: 'Break Rotator (Yaw Only)',
        category: 'Pure',
        description: 'Zeroes out Pitch and Roll so movement remains flat along the ground.',
        x: 280,
        y: 340,
        ue5Equivalent: 'Make Rotator(0, Yaw, 0)',
        inputs: [
          { id: 'break-rot-in', name: 'In Rot', type: 'rotator', isInput: true }
        ],
        outputs: [
          { id: 'yaw-rot-out', name: 'Yaw Rotator', type: 'rotator', isInput: false }
        ]
      },
      {
        id: 'node-get-fwd-vec',
        title: 'Get Forward Vector',
        category: 'Pure',
        description: 'Calculates the forward direction based on camera yaw.',
        x: 480,
        y: 300,
        ue5Equivalent: 'UKismetMathLibrary::GetForwardVector',
        inputs: [
          { id: 'fwd-in-rot', name: 'In Rot', type: 'rotator', isInput: true }
        ],
        outputs: [
          { id: 'fwd-vec-out', name: 'Direction', type: 'vector', isInput: false }
        ]
      },
      {
        id: 'node-get-right-vec',
        title: 'Get Right Vector',
        category: 'Pure',
        description: 'Calculates the strafe right direction based on camera yaw.',
        x: 480,
        y: 430,
        ue5Equivalent: 'UKismetMathLibrary::GetRightVector',
        inputs: [
          { id: 'right-in-rot', name: 'In Rot', type: 'rotator', isInput: true }
        ],
        outputs: [
          { id: 'right-vec-out', name: 'Direction', type: 'vector', isInput: false }
        ]
      },
      {
        id: 'node-add-fwd-move',
        title: 'Add Movement Input (Forward)',
        category: 'Function',
        description: 'Applies forward/backward velocity into CharacterMovementComponent.',
        x: 720,
        y: 120,
        ue5Equivalent: 'APawn::AddMovementInput',
        inputs: [
          { id: 'add-fwd-exec', name: 'Exec', type: 'exec', isInput: true },
          { id: 'add-fwd-dir', name: 'World Direction', type: 'vector', isInput: true },
          { id: 'add-fwd-scale', name: 'Scale Value', type: 'float', isInput: true, value: 1.0 }
        ],
        outputs: [
          { id: 'add-fwd-out-exec', name: 'Then', type: 'exec', isInput: false }
        ]
      },
      {
        id: 'node-add-right-move',
        title: 'Add Movement Input (Right)',
        category: 'Function',
        description: 'Applies lateral strafe velocity into CharacterMovementComponent.',
        x: 980,
        y: 120,
        ue5Equivalent: 'APawn::AddMovementInput',
        inputs: [
          { id: 'add-right-exec', name: 'Exec', type: 'exec', isInput: true },
          { id: 'add-right-dir', name: 'World Direction', type: 'vector', isInput: true },
          { id: 'add-right-scale', name: 'Scale Value', type: 'float', isInput: true, value: 1.0 }
        ],
        outputs: [
          { id: 'add-right-out-exec', name: 'Then', type: 'exec', isInput: false }
        ]
      },
      {
        id: 'node-ia-sprint',
        title: 'EnhancedInputAction IA_Sprint',
        category: 'Event',
        description: 'Triggered when Shift is pressed / released.',
        x: 60,
        y: 580,
        ue5Equivalent: 'K2Node_EnhancedInputAction (IA_Sprint)',
        inputs: [],
        outputs: [
          { id: 'sprint-started', name: 'Started', type: 'exec', isInput: false },
          { id: 'sprint-completed', name: 'Completed', type: 'exec', isInput: false }
        ]
      },
      {
        id: 'node-set-sprint-speed',
        title: 'Set Max Walk Speed (750.0)',
        category: 'Function',
        description: 'Increases locomotion speed for sprint mode.',
        x: 420,
        y: 560,
        ue5Equivalent: 'UCharacterMovementComponent::SetMaxWalkSpeed',
        inputs: [
          { id: 'set-sprint-exec', name: 'Exec', type: 'exec', isInput: true },
          { id: 'sprint-speed-val', name: 'Max Walk Speed', type: 'float', isInput: true, value: 750.0 }
        ],
        outputs: [
          { id: 'sprint-out-exec', name: 'Then', type: 'exec', isInput: false }
        ]
      },
      {
        id: 'node-set-walk-speed',
        title: 'Set Max Walk Speed (450.0)',
        category: 'Function',
        description: 'Returns locomotion speed back to jog / standard walk.',
        x: 420,
        y: 690,
        ue5Equivalent: 'UCharacterMovementComponent::SetMaxWalkSpeed',
        inputs: [
          { id: 'set-walk-exec', name: 'Exec', type: 'exec', isInput: true },
          { id: 'walk-speed-val', name: 'Max Walk Speed', type: 'float', isInput: true, value: 450.0 }
        ],
        outputs: [
          { id: 'walk-out-exec', name: 'Then', type: 'exec', isInput: false }
        ]
      }
    ],
    connections: [
      { fromNodeId: 'node-ia-move', fromPinId: 'ia-move-exec', toNodeId: 'node-add-fwd-move', toPinId: 'add-fwd-exec', type: 'exec' },
      { fromNodeId: 'node-add-fwd-move', fromPinId: 'add-fwd-out-exec', toNodeId: 'node-add-right-move', toPinId: 'add-right-exec', type: 'exec' },
      { fromNodeId: 'node-get-ctrl-rot', fromPinId: 'ctrl-rot-out', toNodeId: 'node-break-rot', toPinId: 'break-rot-in', type: 'rotator' },
      { fromNodeId: 'node-break-rot', fromPinId: 'yaw-rot-out', toNodeId: 'node-get-fwd-vec', toPinId: 'fwd-in-rot', type: 'rotator' },
      { fromNodeId: 'node-break-rot', fromPinId: 'yaw-rot-out', toNodeId: 'node-get-right-vec', toPinId: 'right-in-rot', type: 'rotator' },
      { fromNodeId: 'node-get-fwd-vec', fromPinId: 'fwd-vec-out', toNodeId: 'node-add-fwd-move', toPinId: 'add-fwd-dir', type: 'vector' },
      { fromNodeId: 'node-get-right-vec', fromPinId: 'right-vec-out', toNodeId: 'node-add-right-move', toPinId: 'add-right-dir', type: 'vector' },
      { fromNodeId: 'node-ia-move', fromPinId: 'ia-move-val-y', toNodeId: 'node-add-fwd-move', toPinId: 'add-fwd-scale', type: 'float' },
      { fromNodeId: 'node-ia-move', fromPinId: 'ia-move-val-x', toNodeId: 'node-add-right-move', toPinId: 'add-right-scale', type: 'float' },
      { fromNodeId: 'node-ia-sprint', fromPinId: 'sprint-started', toNodeId: 'node-set-sprint-speed', toPinId: 'set-sprint-exec', type: 'exec' },
      { fromNodeId: 'node-ia-sprint', fromPinId: 'sprint-completed', toNodeId: 'node-set-walk-speed', toPinId: 'set-walk-exec', type: 'exec' }
    ],
    walkthrough: [
      {
        stepNumber: 1,
        title: 'Add Input Mapping Context in Event BeginPlay',
        action: 'In BP_WildlandsCharacter BeginPlay, get Player Controller -> Get Enhanced Input Local Player Subsystem -> call Add Mapping Context with IMC_Default (Priority 0).',
        nodesInvolved: ['Event BeginPlay', 'Get Subsystem', 'Add Mapping Context'],
        commonMistake: 'Beginners forget Add Mapping Context, so IA_Move and IA_Look never trigger at runtime.'
      },
      {
        stepNumber: 2,
        title: 'Isolate Camera Yaw for Flat Movement',
        action: 'Extract only Yaw from Get Control Rotation so looking down at the ground doesn\'t cause the character to try to burrow into the terrain.',
        nodesInvolved: ['Get Control Rotation', 'Make Rotator', 'Get Forward Vector'],
        commonMistake: 'Passing raw Pitch/Roll directly into Forward Vector causes slow or angled movement when looking up or down.'
      },
      {
        stepNumber: 3,
        title: 'Configure Sprint Speeds in CharacterMovement',
        action: 'Set default Max Walk Speed = 450 in the Details panel. On Sprint Started, set to 750. On Sprint Completed, restore to 450.',
        nodesInvolved: ['IA_Sprint', 'Set Max Walk Speed'],
        commonMistake: 'Not pulling Character Movement pin into target causes compile failure (Add Movement Input target is Pawn; Set Max Walk Speed target is Character Movement).'
      }
    ]
  },
  {
    id: 'interaction-system',
    name: 'Universal Interaction System (System A)',
    systemName: 'System A: Interaction',
    blueprintClass: 'BP_WildlandsCharacter & BPI_Interactable',
    parentClass: 'Blueprint Interface',
    description: 'Improves exploration through an interaction interface: sphere traces from player camera, highlights target actors, shows UI widget prompts, and handles pickups & door toggles.',
    ue5ClipboardText: `Begin Object Class=/Script/BlueprintGraph.K2Node_EnhancedInputAction Name="K2Node_EnhancedInputAction_Interact"
   InputAction=InputAction'"/Game/Input/Actions/IA_Interact.IA_Interact"'
   NodePosX=100
   NodePosY=150
End Object
Begin Object Class=/Script/BlueprintGraph.K2Node_CallFunction Name="K2Node_CallFunction_SphereTrace"
   FunctionReference=(MemberParent=Class'"/Script/Engine.KismetSystemLibrary"',MemberName="SphereTraceSingle")
   NodePosX=420
   NodePosY=150
End Object
Begin Object Class=/Script/BlueprintGraph.K2Node_CallFunction Name="K2Node_CallFunction_InteractMsg"
   FunctionReference=(MemberParent=Class'"/Game/Blueprints/Interfaces/BPI_Interactable.BPI_Interactable_C"',MemberName="Interact")
   NodePosX=850
   NodePosY=150
End Object`,
    nodes: [
      {
        id: 'node-ia-interact',
        title: 'EnhancedInputAction IA_Interact (E)',
        category: 'Event',
        description: 'Fired when the player presses E or Gamepad South.',
        x: 60,
        y: 120,
        ue5Equivalent: 'K2Node_EnhancedInputAction (IA_Interact)',
        inputs: [],
        outputs: [
          { id: 'ia-int-started', name: 'Started', type: 'exec', isInput: false }
        ]
      },
      {
        id: 'node-get-cam-loc',
        title: 'FollowCamera: Get World Location',
        category: 'Pure',
        description: 'Start point for the interaction trace ray.',
        x: 60,
        y: 280,
        ue5Equivalent: 'UCameraComponent::K2_GetComponentLocation',
        inputs: [],
        outputs: [
          { id: 'cam-loc-out', name: 'Start Vector', type: 'vector', isInput: false }
        ]
      },
      {
        id: 'node-calc-trace-end',
        title: 'Vector + (Forward * 250.0)',
        category: 'Pure',
        description: 'Calculates the reach point 2.5 meters in front of the camera view.',
        x: 280,
        y: 350,
        ue5Equivalent: 'Start + (GetForwardVector * 250.0)',
        inputs: [
          { id: 'calc-start-in', name: 'Start', type: 'vector', isInput: true },
          { id: 'calc-dist-in', name: 'Distance', type: 'float', isInput: true, value: 250.0 }
        ],
        outputs: [
          { id: 'calc-end-out', name: 'End Vector', type: 'vector', isInput: false }
        ]
      },
      {
        id: 'node-sphere-trace',
        title: 'Sphere Trace By Channel (Visibility)',
        category: 'Function',
        description: 'Performs a 35cm radius sphere trace to find interactable actors without requiring pinpoint crosshair accuracy.',
        x: 520,
        y: 120,
        ue5Equivalent: 'UKismetSystemLibrary::SphereTraceSingle',
        tips: 'Radius = 35.0 prevents awkward missing of small artifacts.',
        inputs: [
          { id: 'trace-exec-in', name: 'Exec', type: 'exec', isInput: true },
          { id: 'trace-start', name: 'Start', type: 'vector', isInput: true },
          { id: 'trace-end', name: 'End', type: 'vector', isInput: true },
          { id: 'trace-radius', name: 'Radius', type: 'float', isInput: true, value: 35.0 }
        ],
        outputs: [
          { id: 'trace-exec-out', name: 'Then', type: 'exec', isInput: false },
          { id: 'trace-hit-result', name: 'Out Hit', type: 'struct', isInput: false },
          { id: 'trace-return-val', name: 'Return Value (Hit)', type: 'bool', isInput: false }
        ]
      },
      {
        id: 'node-break-hit',
        title: 'Break Hit Result',
        category: 'Pure',
        description: 'Extracts the Hit Actor from the trace result.',
        x: 780,
        y: 280,
        ue5Equivalent: 'Break HitResult',
        inputs: [
          { id: 'hit-in', name: 'Hit Result', type: 'struct', isInput: true }
        ],
        outputs: [
          { id: 'hit-actor-out', name: 'Hit Actor', type: 'object', isInput: false },
          { id: 'hit-loc-out', name: 'Location', type: 'vector', isInput: false }
        ]
      },
      {
        id: 'node-does-impl-interface',
        title: 'Does Implement Interface (BPI_Interactable)',
        category: 'Pure',
        description: 'Verifies whether the target actor responds to the interaction protocol.',
        x: 980,
        y: 280,
        ue5Equivalent: 'UKismetSystemLibrary::DoesImplementInterface',
        inputs: [
          { id: 'impl-actor-in', name: 'Target Actor', type: 'object', isInput: true }
        ],
        outputs: [
          { id: 'impl-result-out', name: 'Return Value', type: 'bool', isInput: false }
        ]
      },
      {
        id: 'node-branch-valid',
        title: 'Branch (If Valid Interactable)',
        category: 'FlowControl',
        description: 'Routes execution only if a valid interactable object is struck.',
        x: 820,
        y: 120,
        ue5Equivalent: 'K2Node_IfThenElse',
        inputs: [
          { id: 'branch-exec-in', name: 'Exec', type: 'exec', isInput: true },
          { id: 'branch-condition', name: 'Condition', type: 'bool', isInput: true }
        ],
        outputs: [
          { id: 'branch-true', name: 'True', type: 'exec', isInput: false },
          { id: 'branch-false', name: 'False', type: 'exec', isInput: false }
        ]
      },
      {
        id: 'node-call-interact',
        title: 'Interact (Message)',
        category: 'Interface',
        description: 'Dispatches the universal Interact event to the target object (chest, relic, door, NPC).',
        x: 1060,
        y: 120,
        ue5Equivalent: 'IBPI_Interactable::Execute_Interact',
        inputs: [
          { id: 'msg-exec-in', name: 'Exec', type: 'exec', isInput: true },
          { id: 'msg-target-in', name: 'Target', type: 'object', isInput: true },
          { id: 'msg-instigator-in', name: 'Instigator', type: 'object', isInput: true }
        ],
        outputs: [
          { id: 'msg-exec-out', name: 'Then', type: 'exec', isInput: false }
        ]
      }
    ],
    connections: [
      { fromNodeId: 'node-ia-interact', fromPinId: 'ia-int-started', toNodeId: 'node-sphere-trace', toPinId: 'trace-exec-in', type: 'exec' },
      { fromNodeId: 'node-get-cam-loc', fromPinId: 'cam-loc-out', toNodeId: 'node-sphere-trace', toPinId: 'trace-start', type: 'vector' },
      { fromNodeId: 'node-get-cam-loc', fromPinId: 'cam-loc-out', toNodeId: 'node-calc-trace-end', toPinId: 'calc-start-in', type: 'vector' },
      { fromNodeId: 'node-calc-trace-end', fromPinId: 'calc-end-out', toNodeId: 'node-sphere-trace', toPinId: 'trace-end', type: 'vector' },
      { fromNodeId: 'node-sphere-trace', fromPinId: 'trace-exec-out', toNodeId: 'node-branch-valid', toPinId: 'branch-exec-in', type: 'exec' },
      { fromNodeId: 'node-sphere-trace', fromPinId: 'trace-hit-result', toNodeId: 'node-break-hit', toPinId: 'hit-in', type: 'struct' },
      { fromNodeId: 'node-break-hit', fromPinId: 'hit-actor-out', toNodeId: 'node-does-impl-interface', toPinId: 'impl-actor-in', type: 'object' },
      { fromNodeId: 'node-does-impl-interface', fromPinId: 'impl-result-out', toNodeId: 'node-branch-valid', toPinId: 'branch-condition', type: 'bool' },
      { fromNodeId: 'node-branch-valid', fromPinId: 'branch-true', toNodeId: 'node-call-interact', toPinId: 'msg-exec-in', type: 'exec' },
      { fromNodeId: 'node-break-hit', fromPinId: 'hit-actor-out', toNodeId: 'node-call-interact', toPinId: 'msg-target-in', type: 'object' }
    ],
    walkthrough: [
      {
        stepNumber: 1,
        title: 'Create the Blueprint Interface BPI_Interactable',
        action: 'In Content Browser -> Right click -> Blueprints -> Blueprint Interface. Name it BPI_Interactable. Add function "Interact(Instigator: AActor)".',
        nodesInvolved: ['BPI_Interactable'],
        commonMistake: 'Direct casting (e.g. Cast to BP_Chest, Cast to BP_Relic) creates spaghetti dependencies. Always use an Interface for interactions.'
      },
      {
        stepNumber: 2,
        title: 'Use Sphere Trace Instead of Line Trace',
        action: 'A thin Line Trace requires pixel-perfect aiming. A Sphere Trace with radius ~35 units makes selecting pickups feel smooth and forgiving on console/gamepad.',
        nodesInvolved: ['Sphere Trace Single By Channel'],
        commonMistake: 'Setting Trace Channel to Camera without checking collision presets on the pickup mesh.'
      },
      {
        stepNumber: 3,
        title: 'Implement Interface in Target Actors',
        action: 'In BP_AncientRelic and BP_CryptDoor, go to Class Settings -> Interfaces -> Add BPI_Interactable. In Event Graph, implement Event Interact.',
        nodesInvolved: ['Event Interact', 'DestroyActor', 'Timeline Play'],
        commonMistake: 'Forgetting to check "Does Implement Interface" before calling Execute_Interact causes runtime log warnings.'
      }
    ]
  },
  {
    id: 'quest-manager',
    name: 'Objectives & Quest Progression (System B)',
    systemName: 'System B: Objectives & Quests',
    blueprintClass: 'BP_QuestManager',
    parentClass: 'GameStateBase or GameInstanceSubsystem',
    description: 'Manages quest states (Available, Active, Completed), updates HUD objective markers, handles objective triggers, and gives EXP/rewards upon completion.',
    ue5ClipboardText: `Begin Object Class=/Script/BlueprintGraph.K2Node_CustomEvent Name="K2Node_CustomEvent_CompleteObjective"
   CustomFunctionName="CompleteObjective"
   NodePosX=100
   NodePosY=200
End Object
Begin Object Class=/Script/BlueprintGraph.K2Node_CallFunction Name="K2Node_CallFunction_UpdateHUD"
   FunctionReference=(MemberParent=Class'"/Game/UI/WBP_HUD.WBP_HUD_C"',MemberName="UpdateObjectiveDisplay")
   NodePosX=460
   NodePosY=200
End Object`,
    nodes: [
      {
        id: 'node-event-start-quest',
        title: 'Custom Event: StartQuest',
        category: 'Event',
        description: 'Activated by NPC dialogue or finding a quest scroll.',
        x: 60,
        y: 120,
        ue5Equivalent: 'Custom Event (QuestID: FName)',
        inputs: [],
        outputs: [
          { id: 'start-q-exec', name: 'Exec', type: 'exec', isInput: false },
          { id: 'start-q-id', name: 'QuestID', type: 'string', isInput: false }
        ]
      },
      {
        id: 'node-get-quest-dt',
        title: 'GetDataTableRow (DT_Quests)',
        category: 'Pure',
        description: 'Looks up quest title, objectives, and rewards in Data Table.',
        x: 320,
        y: 200,
        ue5Equivalent: 'GetDataTableRow<FQuestData>',
        inputs: [
          { id: 'dt-row-name', name: 'Row Name', type: 'string', isInput: true }
        ],
        outputs: [
          { id: 'dt-found', name: 'Row Found', type: 'bool', isInput: false },
          { id: 'dt-out-struct', name: 'Out Row', type: 'struct', isInput: false }
        ]
      },
      {
        id: 'node-set-active-quest',
        title: 'Set ActiveQuestStruct',
        category: 'Variable',
        description: 'Stores current quest data in local QuestManager state.',
        x: 580,
        y: 120,
        ue5Equivalent: 'Set ActiveQuest',
        inputs: [
          { id: 'set-q-exec', name: 'Exec', type: 'exec', isInput: true },
          { id: 'set-q-val', name: 'Value', type: 'struct', isInput: true }
        ],
        outputs: [
          { id: 'set-q-out-exec', name: 'Then', type: 'exec', isInput: false }
        ]
      },
      {
        id: 'node-update-hud-widget',
        title: 'WBP_HUD: Display Objective Banner',
        category: 'Function',
        description: 'Triggers cinematic screen banner animation: "NEW OBJECTIVE: Find the Sunstone".',
        x: 840,
        y: 120,
        ue5Equivalent: 'UWBP_HUD::ShowNewObjectiveBanner',
        inputs: [
          { id: 'hud-exec-in', name: 'Exec', type: 'exec', isInput: true },
          { id: 'hud-title-in', name: 'Objective Text', type: 'string', isInput: true }
        ],
        outputs: [
          { id: 'hud-exec-out', name: 'Then', type: 'exec', isInput: false }
        ]
      },
      {
        id: 'node-play-chime',
        title: 'Play Sound 2D (QuestFanfare_Cue)',
        category: 'Function',
        description: 'Plays triumphant musical cue for quest notification.',
        x: 1100,
        y: 120,
        ue5Equivalent: 'UGameplayStatics::PlaySound2D',
        inputs: [
          { id: 'sound-exec-in', name: 'Exec', type: 'exec', isInput: true },
          { id: 'sound-cue-in', name: 'Sound', type: 'object', isInput: true }
        ],
        outputs: [
          { id: 'sound-exec-out', name: 'Then', type: 'exec', isInput: false }
        ]
      }
    ],
    connections: [
      { fromNodeId: 'node-event-start-quest', fromPinId: 'start-q-exec', toNodeId: 'node-set-active-quest', toPinId: 'set-q-exec', type: 'exec' },
      { fromNodeId: 'node-event-start-quest', fromPinId: 'start-q-id', toNodeId: 'node-get-quest-dt', toPinId: 'dt-row-name', type: 'string' },
      { fromNodeId: 'node-get-quest-dt', fromPinId: 'dt-out-struct', toNodeId: 'node-set-active-quest', toPinId: 'set-q-val', type: 'struct' },
      { fromNodeId: 'node-set-active-quest', fromPinId: 'set-q-out-exec', toNodeId: 'node-update-hud-widget', toPinId: 'hud-exec-in', type: 'exec' },
      { fromNodeId: 'node-update-hud-widget', fromPinId: 'hud-exec-out', toNodeId: 'node-play-chime', toPinId: 'sound-exec-in', type: 'exec' }
    ],
    walkthrough: [
      {
        stepNumber: 1,
        title: 'Use Data Tables (DT_Quests) for Easy Editing',
        action: 'Create a Structure FQuestData with fields: Title (Text), Summary (Text), RewardEXP (Integer), TargetActorClass (Class). Create DataTable from it.',
        nodesInvolved: ['GetDataTableRow'],
        commonMistake: 'Hardcoding quest titles into individual blueprint nodes. Data Tables let you balance 50+ quests in one spreadsheet.'
      },
      {
        stepNumber: 2,
        title: 'Host Quest Manager in GameState or GameInstance',
        action: 'If hosting in GameState, quest progress persists across level streaming. For world partition maps, GameInstance persists through full level reloads.',
        nodesInvolved: ['BP_QuestManager', 'GameStateBase'],
        commonMistake: 'Putting quest tracking inside the Character Blueprint causes quests to reset if the player dies and respawns.'
      }
    ]
  },
  {
    id: 'inventory-system',
    name: 'Grid Inventory & 3D Artifact Inspector (System C)',
    systemName: 'System C: Inventory',
    blueprintClass: 'BP_InventoryComponent & WBP_ItemInspector',
    parentClass: 'UActorComponent & UUserWidget',
    description: 'Component-based inventory with item data structures, stack count management, weight limits, and 3D mesh inspection using a Scene Capture Component.',
    ue5ClipboardText: `Begin Object Class=/Script/BlueprintGraph.K2Node_CustomEvent Name="K2Node_CustomEvent_AddItem"
   CustomFunctionName="AddItem"
   NodePosX=100
   NodePosY=150
End Object
Begin Object Class=/Script/BlueprintGraph.K2Node_CallFunction Name="K2Node_CallFunction_AddToArray"
   FunctionReference=(MemberParent=Class'"/Script/Engine.KismetArrayLibrary"',MemberName="Array_Add")
   NodePosX=460
   NodePosY=150
End Object`,
    nodes: [
      {
        id: 'node-event-add-item',
        title: 'Custom Event: TryAddItem',
        category: 'Event',
        description: 'Attempts to add an item to the player inventory array.',
        x: 60,
        y: 120,
        ue5Equivalent: 'Custom Event (ItemData: FInventoryItem)',
        inputs: [],
        outputs: [
          { id: 'add-exec-out', name: 'Exec', type: 'exec', isInput: false },
          { id: 'add-item-data', name: 'Item Data', type: 'struct', isInput: false }
        ]
      },
      {
        id: 'node-check-weight',
        title: 'CurrentWeight + ItemWeight <= MaxWeight',
        category: 'Pure',
        description: 'Verifies survival-lite encumbrance limit before picking up.',
        x: 320,
        y: 260,
        ue5Equivalent: 'Float <= Float',
        inputs: [
          { id: 'item-wt-in', name: 'Item Weight', type: 'float', isInput: true },
          { id: 'max-wt-in', name: 'Max Weight', type: 'float', isInput: true, value: 40.0 }
        ],
        outputs: [
          { id: 'can-carry-out', name: 'Can Carry', type: 'bool', isInput: false }
        ]
      },
      {
        id: 'node-branch-weight',
        title: 'Branch (Under Weight Limit?)',
        category: 'FlowControl',
        description: 'Rejects pickup if player backpack is full.',
        x: 540,
        y: 120,
        ue5Equivalent: 'K2Node_IfThenElse',
        inputs: [
          { id: 'branch-wt-exec', name: 'Exec', type: 'exec', isInput: true },
          { id: 'branch-wt-cond', name: 'Condition', type: 'bool', isInput: true }
        ],
        outputs: [
          { id: 'branch-wt-true', name: 'True', type: 'exec', isInput: false },
          { id: 'branch-wt-false', name: 'False (Overburdened)', type: 'exec', isInput: false }
        ]
      },
      {
        id: 'node-array-add',
        title: 'Array Add (InventoryItems)',
        category: 'Function',
        description: 'Appends item to the inventory array.',
        x: 780,
        y: 120,
        ue5Equivalent: 'KismetArrayLibrary::Array_Add',
        inputs: [
          { id: 'arr-exec-in', name: 'Exec', type: 'exec', isInput: true },
          { id: 'arr-target-item', name: 'Item', type: 'struct', isInput: true }
        ],
        outputs: [
          { id: 'arr-exec-out', name: 'Then', type: 'exec', isInput: false },
          { id: 'arr-idx-out', name: 'Index', type: 'int', isInput: false }
        ]
      },
      {
        id: 'node-refresh-inv-ui',
        title: 'OnInventoryUpdated (Event Dispatcher)',
        category: 'Event',
        description: 'Broadcasts update to WBP_Inventory grid and hotbar.',
        x: 1040,
        y: 120,
        ue5Equivalent: 'Call OnInventoryUpdated',
        inputs: [
          { id: 'disp-exec-in', name: 'Exec', type: 'exec', isInput: true }
        ],
        outputs: [
          { id: 'disp-exec-out', name: 'Then', type: 'exec', isInput: false }
        ]
      }
    ],
    connections: [
      { fromNodeId: 'node-event-add-item', fromPinId: 'add-exec-out', toNodeId: 'node-branch-weight', toPinId: 'branch-wt-exec', type: 'exec' },
      { fromNodeId: 'node-check-weight', fromPinId: 'can-carry-out', toNodeId: 'node-branch-weight', toPinId: 'branch-wt-cond', type: 'bool' },
      { fromNodeId: 'node-branch-weight', fromPinId: 'branch-wt-true', toNodeId: 'node-array-add', toPinId: 'arr-exec-in', type: 'exec' },
      { fromNodeId: 'node-event-add-item', fromPinId: 'add-item-data', toNodeId: 'node-array-add', toPinId: 'arr-target-item', type: 'struct' },
      { fromNodeId: 'node-array-add', fromPinId: 'arr-exec-out', toNodeId: 'node-refresh-inv-ui', toPinId: 'disp-exec-in', type: 'exec' }
    ],
    walkthrough: [
      {
        stepNumber: 1,
        title: 'Use Actor Components for Modularity',
        action: 'Build BP_InventoryComponent as an ActorComponent instead of putting inventory variables directly into the character. That way NPCs or storage chests can share the exact same component.',
        nodesInvolved: ['UActorComponent'],
        commonMistake: 'Duplicating inventory code between player backpack and treasure chests.'
      },
      {
        stepNumber: 2,
        title: 'Setup 3D Item Inspection via Scene Capture 2D',
        action: 'Create a small isolated room (Studio Map) with a Render Target texture, a rotating pedestal actor, and a SceneCaptureComponent2D. Draw the Render Target in your UMG widget.',
        nodesInvolved: ['SceneCaptureComponent2D', 'CanvasRenderTarget2D'],
        commonMistake: 'Leaving SceneCapture set to "Capture Every Frame" on RTX 3050. Set to "Capture on Demand" and update only during mouse drag rotation!'
      }
    ]
  },
  {
    id: 'npc-dialogue',
    name: 'NPC Dialogue & Quest Giver (System D)',
    systemName: 'System D: NPCs & Dialogue',
    blueprintClass: 'BP_NPC_Base & WBP_DialogueBox',
    parentClass: 'ACharacter & UUserWidget',
    description: 'Implements cinematic NPC camera focus, typing typewriter dialogue text, multi-choice branching decisions, and triggers quest progression.',
    ue5ClipboardText: `Begin Object Class=/Script/BlueprintGraph.K2Node_Event Name="K2Node_Event_Interact"
   EventReference=(MemberParent=Class'"/Game/Blueprints/Interfaces/BPI_Interactable.BPI_Interactable_C"',MemberName="Interact")
   NodePosX=100
   NodePosY=150
End Object
Begin Object Class=/Script/BlueprintGraph.K2Node_CallFunction Name="K2Node_CallFunction_CreateWidget"
   FunctionReference=(MemberParent=Class'"/Script/UMG.WidgetBlueprintLibrary"',MemberName="Create")
   NodePosX=440
   NodePosY=150
End Object`,
    nodes: [
      {
        id: 'node-event-npc-interact',
        title: 'Event Interact (from BPI_Interactable)',
        category: 'Event',
        description: 'Called when player presses [E] while facing the NPC.',
        x: 60,
        y: 120,
        ue5Equivalent: 'Event Interact (Instigator: AActor)',
        inputs: [],
        outputs: [
          { id: 'npc-int-exec', name: 'Exec', type: 'exec', isInput: false },
          { id: 'npc-instigator', name: 'Instigator', type: 'object', isInput: false }
        ]
      },
      {
        id: 'node-set-cinematic-cam',
        title: 'Set View Target with Blend (Dialogue Camera)',
        category: 'Function',
        description: 'Smoothly pans camera over the NPC shoulder for cinematic dialogue.',
        x: 360,
        y: 120,
        ue5Equivalent: 'APlayerController::SetViewTargetWithBlend',
        inputs: [
          { id: 'cam-blend-exec', name: 'Exec', type: 'exec', isInput: true },
          { id: 'cam-blend-target', name: 'New View Target', type: 'object', isInput: true },
          { id: 'cam-blend-time', name: 'Blend Time', type: 'float', isInput: true, value: 0.75 }
        ],
        outputs: [
          { id: 'cam-blend-out', name: 'Then', type: 'exec', isInput: false }
        ]
      },
      {
        id: 'node-create-dialogue-widget',
        title: 'Create Widget (WBP_Dialogue)',
        category: 'Function',
        description: 'Instantiates dialogue UI overlay.',
        x: 680,
        y: 120,
        ue5Equivalent: 'CreateWidget<UWBP_Dialogue>',
        inputs: [
          { id: 'widg-exec-in', name: 'Exec', type: 'exec', isInput: true }
        ],
        outputs: [
          { id: 'widg-exec-out', name: 'Then', type: 'exec', isInput: false },
          { id: 'widg-obj-out', name: 'Return Value', type: 'object', isInput: false }
        ]
      },
      {
        id: 'node-add-to-viewport',
        title: 'Add To Viewport & Set Input Mode UI',
        category: 'Function',
        description: 'Displays the dialogue options and unlocks mouse cursor.',
        x: 960,
        y: 120,
        ue5Equivalent: 'UUserWidget::AddToViewport',
        inputs: [
          { id: 'vp-exec-in', name: 'Exec', type: 'exec', isInput: true },
          { id: 'vp-target-in', name: 'Target', type: 'object', isInput: true }
        ],
        outputs: [
          { id: 'vp-exec-out', name: 'Then', type: 'exec', isInput: false }
        ]
      }
    ],
    connections: [
      { fromNodeId: 'node-event-npc-interact', fromPinId: 'npc-int-exec', toNodeId: 'node-set-cinematic-cam', toPinId: 'cam-blend-exec', type: 'exec' },
      { fromNodeId: 'node-set-cinematic-cam', fromPinId: 'cam-blend-out', toNodeId: 'node-create-dialogue-widget', toPinId: 'widg-exec-in', type: 'exec' },
      { fromNodeId: 'node-create-dialogue-widget', fromPinId: 'widg-exec-out', toNodeId: 'node-add-to-viewport', toPinId: 'vp-exec-in', type: 'exec' },
      { fromNodeId: 'node-create-dialogue-widget', fromPinId: 'widg-obj-out', toNodeId: 'node-add-to-viewport', toPinId: 'vp-target-in', type: 'object' }
    ],
    walkthrough: [
      {
        stepNumber: 1,
        title: 'Use Set Input Mode Game and UI during Dialogue',
        action: 'Call Set Input Mode Game and UI and Show Mouse Cursor = True when opening dialogue. When dialogue ends, call Set Input Mode Game Only and Show Mouse Cursor = False.',
        nodesInvolved: ['Set Input Mode Game and UI', 'Set Show Mouse Cursor'],
        commonMistake: 'Forgetting to restore Input Mode Game Only leaves the camera locked even after dialogue window is destroyed.'
      }
    ]
  },
  {
    id: 'landmark-discovery',
    name: 'Landmarks, Journal & World Discovery (System E)',
    systemName: 'System E: Exploration & Journal',
    blueprintClass: 'BP_LandmarkTrigger & WBP_Journal',
    parentClass: 'ATriggerBox & UUserWidget',
    description: 'Triggers cinematic location splash ("Discovered: Sunken Valley of Eldoria"), records the journal entry, grants exploration EXP, and uncovers fog of war on the map.',
    ue5ClipboardText: `Begin Object Class=/Script/BlueprintGraph.K2Node_ActorBoundEvent Name="K2Node_ActorBoundEvent_Overlap"
   DelegatePropertyName="OnActorBeginOverlap"
   NodePosX=100
   NodePosY=150
End Object
Begin Object Class=/Script/BlueprintGraph.K2Node_CallFunction Name="K2Node_CallFunction_DoOnce"
   FunctionReference=(MemberParent=Class'"/Script/Engine.KismetSystemLibrary"',MemberName="DoOnce")
   NodePosX=420
   NodePosY=150
End Object`,
    nodes: [
      {
        id: 'node-event-overlap',
        title: 'OnComponentBeginOverlap (Box Collision)',
        category: 'Event',
        description: 'Fired when the player character steps into the landmark boundary.',
        x: 60,
        y: 120,
        ue5Equivalent: 'UPrimitiveComponent::OnComponentBeginOverlap',
        inputs: [],
        outputs: [
          { id: 'ovlp-exec-out', name: 'Exec', type: 'exec', isInput: false },
          { id: 'ovlp-other-actor', name: 'Other Actor', type: 'object', isInput: false }
        ]
      },
      {
        id: 'node-do-once',
        title: 'DoOnce',
        category: 'FlowControl',
        description: 'Ensures the landmark discovery XP and banner only fire once per playthrough.',
        x: 360,
        y: 120,
        ue5Equivalent: 'UKismetSystemLibrary::DoOnce',
        inputs: [
          { id: 'do-once-exec', name: 'Exec', type: 'exec', isInput: true },
          { id: 'do-once-reset', name: 'Reset', type: 'exec', isInput: true }
        ],
        outputs: [
          { id: 'do-once-out', name: 'Completed', type: 'exec', isInput: false }
        ]
      },
      {
        id: 'node-show-discovery-banner',
        title: 'Show Discovery Banner UI',
        category: 'Function',
        description: 'Presents the gold ancient title banner on screen with soft fade-in/out.',
        x: 600,
        y: 120,
        ue5Equivalent: 'UWBP_HUD::ShowLandmarkBanner',
        inputs: [
          { id: 'banner-exec-in', name: 'Exec', type: 'exec', isInput: true },
          { id: 'banner-text-in', name: 'Landmark Name', type: 'string', isInput: true }
        ],
        outputs: [
          { id: 'banner-exec-out', name: 'Then', type: 'exec', isInput: false }
        ]
      },
      {
        id: 'node-add-journal-entry',
        title: 'Add To Explorer Journal',
        category: 'Function',
        description: 'Saves the sketch, description, and coordinates to the player journal.',
        x: 880,
        y: 120,
        ue5Equivalent: 'UBP_JournalComponent::UnlockLandmarkEntry',
        inputs: [
          { id: 'journal-exec-in', name: 'Exec', type: 'exec', isInput: true },
          { id: 'journal-landmark-id', name: 'Landmark ID', type: 'string', isInput: true }
        ],
        outputs: [
          { id: 'journal-exec-out', name: 'Then', type: 'exec', isInput: false }
        ]
      }
    ],
    connections: [
      { fromNodeId: 'node-event-overlap', fromPinId: 'ovlp-exec-out', toNodeId: 'node-do-once', toPinId: 'do-once-exec', type: 'exec' },
      { fromNodeId: 'node-do-once', fromPinId: 'do-once-out', toNodeId: 'node-show-discovery-banner', toPinId: 'banner-exec-in', type: 'exec' },
      { fromNodeId: 'node-show-discovery-banner', fromPinId: 'banner-exec-out', toNodeId: 'node-add-journal-entry', toPinId: 'journal-exec-in', type: 'exec' }
    ],
    walkthrough: [
      {
        stepNumber: 1,
        title: 'Use DoOnce and SaveGame Integration',
        action: 'Wrap discovery triggers with DoOnce, and store the landmark ID in an Array of Names in your SaveGame object so discovered locations remain found across game restarts.',
        nodesInvolved: ['DoOnce', 'SaveGame'],
        commonMistake: 'Without DoOnce, walking back and forth through a doorway repeatedly gives duplicate XP and spam-plays the audio fanfare.'
      }
    ]
  },
  {
    id: 'footstep-physmat',
    name: 'AnimNotify Footsteps & Physical Materials',
    systemName: 'Audio & Animation',
    blueprintClass: 'BP_WildlandsCharacter & AN_Footstep',
    parentClass: 'ACharacter & UAnimNotify',
    description: 'Animation notify-triggered footstep system in the Character Blueprint. Performs a downward line trace beneath foot sockets, queries the underlying Physical Material, and plays randomized surface-specific sound cues (Grass, Stone, Water, Wood) with pitch modulation and surface particles.',
    ue5ClipboardText: `Begin Object Class=/Script/BlueprintGraph.K2Node_CustomEvent Name="K2Node_CustomEvent_PlayFootstep"
   CustomFunctionName="PlayFootstepSound"
   NodePosX=60
   NodePosY=120
   NodeGuid=F1E2D3C4B5A67890
End Object
Begin Object Class=/Script/BlueprintGraph.K2Node_CallFunction Name="K2Node_CallFunction_GetSocketLoc"
   FunctionReference=(MemberParent=Class'"/Script/Engine.SceneComponent"',MemberName="GetSocketLocation")
   NodePosX=320
   NodePosY=240
   NodeGuid=A2B3C4D5E6F70123
End Object
Begin Object Class=/Script/BlueprintGraph.K2Node_CallFunction Name="K2Node_CallFunction_LineTrace"
   FunctionReference=(MemberParent=Class'"/Script/Engine.KismetSystemLibrary"',MemberName="LineTraceSingle")
   bReturnPhysicalMaterial=True
   NodePosX=620
   NodePosY=120
   NodeGuid=B3C4D5E6F70123A4
End Object
Begin Object Class=/Script/BlueprintGraph.K2Node_CallFunction Name="K2Node_CallFunction_GetSurfaceType"
   FunctionReference=(MemberParent=Class'"/Script/Engine.GameplayStatics"',MemberName="GetSurfaceType")
   NodePosX=1060
   NodePosY=280
   NodeGuid=C4D5E6F70123A4B5
End Object
Begin Object Class=/Script/BlueprintGraph.K2Node_SwitchEnum Name="K2Node_SwitchEnum_Surface"
   Enum=Enum'"/Script/PhysicsCore.EPhysicalSurface"'
   NodePosX=1340
   NodePosY=120
   NodeGuid=D5E6F70123A4B5C6
End Object
Begin Object Class=/Script/BlueprintGraph.K2Node_CallFunction Name="K2Node_CallFunction_PlaySoundAtLoc"
   FunctionReference=(MemberParent=Class'"/Script/Engine.GameplayStatics"',MemberName="PlaySoundAtLocation")
   NodePosX=1700
   NodePosY=120
   NodeGuid=E6F70123A4B5C6D7
End Object`,
    nodes: [
      {
        id: 'node-event-footstep',
        title: 'Custom Event: PlayFootstepSound',
        category: 'Event',
        description: 'Dispatched by AnimNotify_Footstep in the Explorer Run/Walk animations.',
        subtext: 'Input: FootSocketName (foot_l / foot_r)',
        x: 60,
        y: 120,
        ue5Equivalent: 'Custom Event (FootSocketName: FName)',
        tips: 'Call this directly from AN_Footstep::Received_Notify in your AnimNotify Blueprint class.',
        inputs: [],
        outputs: [
          { id: 'foot-exec-out', name: 'Exec', type: 'exec', isInput: false },
          { id: 'foot-socket-name', name: 'FootSocketName', type: 'string', isInput: false, value: 'foot_l' }
        ]
      },
      {
        id: 'node-get-mesh',
        title: 'Get Mesh (CharacterMesh)',
        category: 'Pure',
        description: 'Returns the SkeletalMeshComponent holding the foot sockets.',
        x: 60,
        y: 300,
        ue5Equivalent: 'ACharacter::GetMesh',
        inputs: [],
        outputs: [
          { id: 'mesh-out', name: 'Mesh Component', type: 'object', isInput: false }
        ]
      },
      {
        id: 'node-get-socket-loc',
        title: 'Get Socket Location',
        category: 'Pure',
        description: 'Extracts exact world coordinates of foot_l or foot_r bones at impact.',
        x: 320,
        y: 240,
        ue5Equivalent: 'USceneComponent::GetSocketLocation',
        inputs: [
          { id: 'sock-mesh-in', name: 'Target', type: 'object', isInput: true },
          { id: 'sock-name-in', name: 'Socket Name', type: 'string', isInput: true }
        ],
        outputs: [
          { id: 'sock-loc-out', name: 'Return Value', type: 'vector', isInput: false }
        ]
      },
      {
        id: 'node-calc-trace-range',
        title: 'Start = Loc + 20Z, End = Loc - 50Z',
        category: 'Pure',
        description: 'Offsets downwards from the foot bone through the capsule floor to strike terrain.',
        x: 320,
        y: 420,
        ue5Equivalent: 'Start = Loc + (0,0,20) | End = Loc - (0,0,50)',
        inputs: [
          { id: 'range-loc-in', name: 'Socket Loc', type: 'vector', isInput: true }
        ],
        outputs: [
          { id: 'range-start-out', name: 'Trace Start', type: 'vector', isInput: false },
          { id: 'range-end-out', name: 'Trace End', type: 'vector', isInput: false }
        ]
      },
      {
        id: 'node-line-trace-physmat',
        title: 'Line Trace By Channel (bReturnPhysMat = TRUE)',
        category: 'Function',
        description: 'Traces down to ground collision with bReturnPhysicalMaterial enabled to identify surface type.',
        x: 620,
        y: 120,
        ue5Equivalent: 'UKismetSystemLibrary::LineTraceSingle (bTraceComplex=False, bReturnPhysicalMaterial=True)',
        tips: 'CRITICAL: bReturnPhysicalMaterial MUST be checked, or Phys Mat will return NULL!',
        inputs: [
          { id: 'trace-exec-in', name: 'Exec', type: 'exec', isInput: true },
          { id: 'trace-start-in', name: 'Start', type: 'vector', isInput: true },
          { id: 'trace-end-in', name: 'End', type: 'vector', isInput: true }
        ],
        outputs: [
          { id: 'trace-exec-out', name: 'Then', type: 'exec', isInput: false },
          { id: 'trace-hit-out', name: 'Out Hit', type: 'struct', isInput: false },
          { id: 'trace-hit-bool', name: 'Blocking Hit', type: 'bool', isInput: false }
        ]
      },
      {
        id: 'node-break-hit-physmat',
        title: 'Break Hit Result (Extract PhysMat)',
        category: 'Pure',
        description: 'Unpacks the hit actor, impact point, impact normal, and Physical Material reference.',
        x: 880,
        y: 240,
        ue5Equivalent: 'Break HitResult (PhysMat, Location, Normal)',
        inputs: [
          { id: 'break-hit-in', name: 'Hit Result', type: 'struct', isInput: true }
        ],
        outputs: [
          { id: 'hit-physmat-out', name: 'Phys Mat', type: 'object', isInput: false },
          { id: 'hit-impact-loc', name: 'Impact Point', type: 'vector', isInput: false },
          { id: 'hit-impact-norm', name: 'Impact Normal', type: 'vector', isInput: false }
        ]
      },
      {
        id: 'node-get-surface-type',
        title: 'Get Surface Type',
        category: 'Pure',
        description: 'Converts UPhysicalMaterial into the project EPhysicalSurface enum.',
        x: 1080,
        y: 280,
        ue5Equivalent: 'UGameplayStatics::GetSurfaceType',
        inputs: [
          { id: 'surf-physmat-in', name: 'Physical Material', type: 'object', isInput: true }
        ],
        outputs: [
          { id: 'surf-type-out', name: 'Surface Type', type: 'string', isInput: false }
        ]
      },
      {
        id: 'node-switch-surface',
        title: 'Switch on EPhysicalSurface',
        category: 'FlowControl',
        description: 'Branches execution to play distinct sound cues based on the ground struck.',
        x: 1320,
        y: 120,
        ue5Equivalent: 'Switch on EPhysicalSurface',
        inputs: [
          { id: 'switch-exec-in', name: 'Exec', type: 'exec', isInput: true },
          { id: 'switch-selection', name: 'Selection', type: 'string', isInput: true }
        ],
        outputs: [
          { id: 'switch-grass', name: 'SurfaceType_Grass', type: 'exec', isInput: false },
          { id: 'switch-stone', name: 'SurfaceType_Stone', type: 'exec', isInput: false },
          { id: 'switch-water', name: 'SurfaceType_Water', type: 'exec', isInput: false },
          { id: 'switch-wood', name: 'SurfaceType_Wood', type: 'exec', isInput: false },
          { id: 'switch-default', name: 'Default', type: 'exec', isInput: false }
        ]
      },
      {
        id: 'node-random-pitch',
        title: 'Random Float in Range (0.92, 1.08)',
        category: 'Pure',
        description: 'Prevents repetitive audio fatigue by applying subtle natural pitch modulation per step.',
        x: 1320,
        y: 380,
        ue5Equivalent: 'UKismetMathLibrary::RandomFloatInRange(0.92, 1.08)',
        inputs: [],
        outputs: [
          { id: 'rand-pitch-out', name: 'Return Value', type: 'float', isInput: false, value: 0.98 }
        ]
      },
      {
        id: 'node-play-sound-at-loc',
        title: 'Play Sound at Location',
        category: 'Function',
        description: 'Plays 3D spatialized footstep audio cue with pitch jitter at the foot impact point.',
        x: 1680,
        y: 120,
        ue5Equivalent: 'UGameplayStatics::PlaySoundAtLocation',
        tips: 'Attenuation settings ensure footsteps diminish realistically with camera distance.',
        inputs: [
          { id: 'play-exec-in', name: 'Exec', type: 'exec', isInput: true },
          { id: 'play-sound-in', name: 'Sound Cue', type: 'object', isInput: true },
          { id: 'play-loc-in', name: 'Location', type: 'vector', isInput: true },
          { id: 'play-pitch-in', name: 'Pitch Multiplier', type: 'float', isInput: true, value: 1.0 }
        ],
        outputs: [
          { id: 'play-exec-out', name: 'Then', type: 'exec', isInput: false }
        ]
      },
      {
        id: 'node-spawn-particle',
        title: 'Spawn System at Location (Surface Dust/Splash)',
        category: 'Function',
        description: 'Spawns a small Niagara impact burst (grass debris, stone dust puff, water splash ripple).',
        x: 1960,
        y: 120,
        ue5Equivalent: 'UNiagaraFunctionLibrary::SpawnSystemAtLocation',
        inputs: [
          { id: 'spawn-exec-in', name: 'Exec', type: 'exec', isInput: true },
          { id: 'spawn-loc-in', name: 'Location', type: 'vector', isInput: true },
          { id: 'spawn-rot-in', name: 'Rotation (from Hit Normal)', type: 'rotator', isInput: true }
        ],
        outputs: [
          { id: 'spawn-exec-out', name: 'Then', type: 'exec', isInput: false }
        ]
      }
    ],
    connections: [
      { fromNodeId: 'node-event-footstep', fromPinId: 'foot-exec-out', toNodeId: 'node-line-trace-physmat', toPinId: 'trace-exec-in', type: 'exec' },
      { fromNodeId: 'node-get-mesh', fromPinId: 'mesh-out', toNodeId: 'node-get-socket-loc', toPinId: 'sock-mesh-in', type: 'object' },
      { fromNodeId: 'node-event-footstep', fromPinId: 'foot-socket-name', toNodeId: 'node-get-socket-loc', toPinId: 'sock-name-in', type: 'string' },
      { fromNodeId: 'node-get-socket-loc', fromPinId: 'sock-loc-out', toNodeId: 'node-calc-trace-range', toPinId: 'range-loc-in', type: 'vector' },
      { fromNodeId: 'node-calc-trace-range', fromPinId: 'range-start-out', toNodeId: 'node-line-trace-physmat', toPinId: 'trace-start-in', type: 'vector' },
      { fromNodeId: 'node-calc-trace-range', fromPinId: 'range-end-out', toNodeId: 'node-line-trace-physmat', toPinId: 'trace-end-in', type: 'vector' },
      { fromNodeId: 'node-line-trace-physmat', fromPinId: 'trace-exec-out', toNodeId: 'node-switch-surface', toPinId: 'switch-exec-in', type: 'exec' },
      { fromNodeId: 'node-line-trace-physmat', fromPinId: 'trace-hit-out', toNodeId: 'node-break-hit-physmat', toPinId: 'break-hit-in', type: 'struct' },
      { fromNodeId: 'node-break-hit-physmat', fromPinId: 'hit-physmat-out', toNodeId: 'node-get-surface-type', toPinId: 'surf-physmat-in', type: 'object' },
      { fromNodeId: 'node-get-surface-type', fromPinId: 'surf-type-out', toNodeId: 'node-switch-surface', toPinId: 'switch-selection', type: 'string' },
      { fromNodeId: 'node-switch-surface', fromPinId: 'switch-grass', toNodeId: 'node-play-sound-at-loc', toPinId: 'play-exec-in', type: 'exec' },
      { fromNodeId: 'node-switch-surface', fromPinId: 'switch-stone', toNodeId: 'node-play-sound-at-loc', toPinId: 'play-exec-in', type: 'exec' },
      { fromNodeId: 'node-switch-surface', fromPinId: 'switch-water', toNodeId: 'node-play-sound-at-loc', toPinId: 'play-exec-in', type: 'exec' },
      { fromNodeId: 'node-break-hit-physmat', fromPinId: 'hit-impact-loc', toNodeId: 'node-play-sound-at-loc', toPinId: 'play-loc-in', type: 'vector' },
      { fromNodeId: 'node-random-pitch', fromPinId: 'rand-pitch-out', toNodeId: 'node-play-sound-at-loc', toPinId: 'play-pitch-in', type: 'float' },
      { fromNodeId: 'node-play-sound-at-loc', fromPinId: 'play-exec-out', toNodeId: 'node-spawn-particle', toPinId: 'spawn-exec-in', type: 'exec' },
      { fromNodeId: 'node-break-hit-physmat', fromPinId: 'hit-impact-loc', toNodeId: 'node-spawn-particle', toPinId: 'spawn-loc-in', type: 'vector' }
    ],
    walkthrough: [
      {
        stepNumber: 1,
        title: 'Define Physical Surface Types in Project Settings',
        action: 'Go to Edit > Project Settings > Engine > Physics > Physical Surface. Name SurfaceType1: Grass, SurfaceType2: Stone, SurfaceType3: Water, SurfaceType4: Wood.',
        nodesInvolved: ['EPhysicalSurface', 'Get Surface Type'],
        commonMistake: 'Leaving surface names blank in Project Settings causes Switch on EPhysicalSurface to only show Default.'
      },
      {
        stepNumber: 2,
        title: 'Create Physical Material Assets & Assign to Materials',
        action: 'In Content Browser, Right Click > Physics > Physical Material. Create PM_Grass, PM_Stone, PM_Water, PM_Wood. In each asset, assign its corresponding Surface Type. Then open your terrain and ruin materials, and set the Phys Material slot in the Details panel.',
        nodesInvolved: ['UPhysicalMaterial', 'Landscape Layer Info'],
        commonMistake: 'Forgetting to set Physical Material on Landscape Layer Infos (e.g. Grass_LayerInfo) causes terrain hits to always return Default instead of Grass.'
      },
      {
        stepNumber: 3,
        title: 'Create AN_Footstep AnimNotify Blueprint',
        action: 'Right click in Content Browser > Blueprints > Blueprint Class > search "AnimNotify". Name it AN_Footstep. Add a public variable FootSocketName (Name, default "foot_l"). Override Received_Notify: Cast MeshOwner to BP_WildlandsCharacter and call PlayFootstepSound(FootSocketName).',
        nodesInvolved: ['UAnimNotify', 'Received_Notify'],
        commonMistake: 'Hardcoding left foot only. Using a FootSocketName parameter allows one notify class to service both foot_l and foot_r.'
      },
      {
        stepNumber: 4,
        title: 'Add Notifies to Animation Sequences at Heel Strikes',
        action: 'Open MF_Walk_Fwd, MF_Run_Fwd, and MF_Sprint_Fwd animation sequences. Scrub the timeline to the exact frame where the character\'s heel contacts the floor. Right-click the Notifies track > Add Notify > AN_Footstep. Set FootSocketName to foot_l or foot_r.',
        nodesInvolved: ['Animation Sequence Track', 'Notifies'],
        commonMistake: 'Placing notifies at arbitrary time intervals rather than the exact visual contact frame, causing audio sync slippage.'
      },
      {
        stepNumber: 5,
        title: 'Configure Line Trace with bReturnPhysicalMaterial',
        action: 'In BP_WildlandsCharacter, place LineTraceByChannel. Connect Start and End vectors. In the Details panel, expand Advanced Pins and ensure bReturnPhysicalMaterial is TRUE.',
        nodesInvolved: ['LineTraceByChannel', 'Break HitResult'],
        commonMistake: 'bReturnPhysicalMaterial defaults to FALSE in Unreal Engine. If left false, Hit.PhysMaterial is always empty!'
      }
    ]
  }
];
