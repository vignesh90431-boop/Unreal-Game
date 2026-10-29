import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { soundManager } from '../../utils/audio';
import { createGrassTexture, createAncientStoneTexture, createRuneEmissiveTexture } from './textures';
import { InventoryItem, Quest, Landmark } from '../../types/game';
import { 
  Maximize2, 
  Volume2, 
  VolumeX, 
  Sun, 
  Moon, 
  Compass, 
  Eye, 
  ChevronUp, 
  ChevronDown, 
  Sparkles,
  Info
} from 'lucide-react';

interface GameCanvasProps {
  onInteractRelic: (item: InventoryItem) => void;
  onOpenChest: (item: InventoryItem) => void;
  onTalkNpc: () => void;
  onDiscoverLandmark: (landmark: Landmark) => void;
  onOpenInventory: () => void;
  onOpenJournal: () => void;
  inventoryCount: number;
  activeQuest: Quest | null;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  onInteractRelic,
  onOpenChest,
  onTalkNpc,
  onDiscoverLandmark,
  onOpenInventory,
  onOpenJournal,
  inventoryCount,
  activeQuest,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  
  // HUD states
  const [promptText, setPromptText] = useState<string | null>(null);
  const [discoveryBanner, setDiscoveryBanner] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [hudCollapsed, setHudCollapsed] = useState(false);
  const [timeOfDay, setTimeOfDay] = useState<number>(14); // 14:00 (Afternoon)
  const [currentFps, setCurrentFps] = useState<number>(60);
  const [graphicsPreset, setGraphicsPreset] = useState<'rtx3050' | 'cinematic' | 'low'>('rtx3050');
  const [playerMovementState, setPlayerMovementState] = useState<string>('Idle');
  const [isPointerLocked, setIsPointerLocked] = useState<boolean>(false);
  const [activeKeys, setActiveKeys] = useState<{ [key: string]: boolean }>({});
  const [footstepTelemetry, setFootstepTelemetry] = useState<{
    surface: 'Grass' | 'Stone' | 'Water' | 'Wood';
    physMat: string;
    foot: 'Left' | 'Right';
    pitch: number;
  } | null>(null);

  // Relic and chest state tracking
  const relicCollectedRef = useRef(false);
  const chestOpenedRef = useRef(false);
  const doorOpenedRef = useRef(false);
  const discoveredLandmarksRef = useRef<Set<string>>(new Set());

  // Interactive prompt action callback ref
  const currentActionRef = useRef<(() => void) | null>(null);

  // Keyboard state
  const keysRef = useRef<{ [key: string]: boolean }>({});

  const setVirtualKey = (code: string, isDown: boolean) => {
    keysRef.current[code] = isDown;
    setActiveKeys((prev) => ({ ...prev, [code]: isDown }));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent browser scrolling on arrow keys and spacebar
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }

      keysRef.current[e.code] = true;
      setActiveKeys((prev) => ({ ...prev, [e.code]: true }));

      if (e.code === 'KeyE' && currentActionRef.current) {
        currentActionRef.current();
      }
      if (e.code === 'KeyI') {
        onOpenInventory();
      }
      if (e.code === 'KeyJ' || e.code === 'KeyM') {
        onOpenJournal();
      }
      if (e.code === 'KeyH') {
        setHudCollapsed((prev) => !prev);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.code] = false;
      setActiveKeys((prev) => ({ ...prev, [e.code]: false }));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onOpenInventory, onOpenJournal]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Detect Software WebGL
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 2. Setup Three.js Renderer
    const width = container.clientWidth;
    const height = container.clientHeight;
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // 3. Scene & Fog
    const scene = new THREE.Scene();
    const fogColor = new THREE.Color(0xa7c2d1);
    scene.background = fogColor;
    scene.fog = new THREE.FogExp2(fogColor, 0.012);

    // 4. Camera Setup
    const camera = new THREE.PerspectiveCamera(55, width / height, 0.2, 500);

    // 5. Studio Environment Map (PMREM)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 6. Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0xddeeff, 0x334422, 0.7);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfffaed, 2.4);
    sunLight.position.set(45, 80, 30);
    sunLight.castShadow = !isSoftwareGl;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 160;
    const shadowD = 35;
    sunLight.shadow.camera.left = -shadowD;
    sunLight.shadow.camera.right = shadowD;
    sunLight.shadow.camera.top = shadowD;
    sunLight.shadow.camera.bottom = -shadowD;
    sunLight.shadow.bias = -0.0004;
    sunLight.shadow.normalBias = 0.02;
    scene.add(sunLight);

    // 7. Terrain Heightmap Math
    function getGroundHeight(x: number, z: number): number {
      // Valley river bed in center (z ~ 0 to 12)
      const riverBed = Math.exp(-Math.pow(z / 14, 2)) * -2.2;
      // Gentle rolling hills
      const hills = Math.sin(x * 0.05) * 1.5 + Math.cos(z * 0.04) * 1.8;
      // Mountain ridge barrier on the north (z < -35)
      const northCliffs = Math.max(0, -z - 35) * 0.45;
      // South forest hills (z > 35)
      const southCliffs = Math.max(0, z - 35) * 0.4;
      return riverBed + hills + northCliffs + southCliffs;
    }

    // 8. Generate Procedural Terrain Mesh
    const terrainGeo = new THREE.PlaneGeometry(160, 160, 96, 96);
    terrainGeo.rotateX(-Math.PI / 2);
    const posAttr = terrainGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const vx = posAttr.getX(i);
      const vz = posAttr.getZ(i);
      const vy = getGroundHeight(vx, vz);
      posAttr.setY(i, vy);
    }
    terrainGeo.computeVertexNormals();

    const grassTex = createGrassTexture();
    const terrainMat = new THREE.MeshStandardMaterial({
      map: grassTex,
      roughness: 0.85,
      metalness: 0.05,
    });
    const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
    terrainMesh.receiveShadow = !isSoftwareGl;
    scene.add(terrainMesh);

    // 9. Water Feature (River in the valley)
    const waterGeo = new THREE.PlaneGeometry(150, 14, 32, 16);
    waterGeo.rotateX(-Math.PI / 2);
    const waterMat = new THREE.MeshPhysicalMaterial({
      color: 0x226677,
      transmission: isSoftwareGl ? 0 : 0.88,
      transparent: true,
      opacity: isSoftwareGl ? 0.6 : 0.9,
      roughness: 0.08,
      metalness: 0.1,
      ior: 1.333,
    });
    const waterMesh = new THREE.Mesh(waterGeo, waterMat);
    waterMesh.position.set(0, -1.2, 0);
    scene.add(waterMesh);

    // 10. Procedural Ancient Temple Plaza & Crypt (Ruins)
    const stoneTex = createAncientStoneTexture();
    const stoneMat = new THREE.MeshStandardMaterial({
      map: stoneTex,
      roughness: 0.9,
      metalness: 0.05,
    });
    const templeGroup = new THREE.Group();
    templeGroup.position.set(18, getGroundHeight(18, -12), -12);

    // Sunken stone floor platform
    const platformGeo = new THREE.BoxGeometry(18, 0.8, 18);
    const platform = new THREE.Mesh(platformGeo, stoneMat);
    platform.position.y = 0.4;
    platform.receiveShadow = !isSoftwareGl;
    platform.castShadow = !isSoftwareGl;
    templeGroup.add(platform);

    // 4 Ancient Fluted Stone Pillars
    const pillarPositions = [
      [-6, 0, -6],
      [6, 0, -6],
      [-6, 0, 6],
      [6, 0, 6],
    ];
    pillarPositions.forEach(([px, , pz]) => {
      const pGroup = new THREE.Group();
      pGroup.position.set(px, 0.8, pz);

      const base = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.6, 1.6), stoneMat);
      base.castShadow = !isSoftwareGl;
      pGroup.add(base);

      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.6, 6.2, 12), stoneMat);
      shaft.position.y = 3.4;
      shaft.castShadow = !isSoftwareGl;
      pGroup.add(shaft);

      const capital = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.5, 1.5), stoneMat);
      capital.position.y = 6.6;
      capital.castShadow = !isSoftwareGl;
      pGroup.add(capital);

      templeGroup.add(pGroup);
    });

    // Temple Arch Lintel
    const archLintel = new THREE.Mesh(new THREE.BoxGeometry(14, 0.8, 2), stoneMat);
    archLintel.position.set(0, 7.8, -6);
    archLintel.castShadow = !isSoftwareGl;
    templeGroup.add(archLintel);

    // Ancient Carved Altar Pedestal
    const altarGeo = new THREE.CylinderGeometry(1.2, 1.4, 1.3, 8);
    const altar = new THREE.Mesh(altarGeo, stoneMat);
    altar.position.set(0, 1.4, 0);
    altar.castShadow = !isSoftwareGl;
    templeGroup.add(altar);

    // Crypt Stone Door (Interactive)
    const cryptDoorGroup = new THREE.Group();
    cryptDoorGroup.position.set(0, 0.8, -8.2);
    const cryptDoorSlab = new THREE.Mesh(new THREE.BoxGeometry(4.2, 5.5, 0.8), stoneMat);
    cryptDoorSlab.position.y = 2.75;
    cryptDoorSlab.castShadow = !isSoftwareGl;
    cryptDoorGroup.add(cryptDoorSlab);
    templeGroup.add(cryptDoorGroup);

    scene.add(templeGroup);

    // 11. Hero Prop: "The Sunstone of Eldoria" (Interactive Relic)
    const sunstoneGroup = new THREE.Group();
    sunstoneGroup.position.set(18, getGroundHeight(18, -12) + 2.7, -12);

    // Glowing Golden Dodecahedron Core
    const relicCoreGeo = new THREE.DodecahedronGeometry(0.42, 0);
    const runeTex = createRuneEmissiveTexture();
    const relicMat = new THREE.MeshStandardMaterial({
      color: 0xffaa22,
      emissive: 0xff8800,
      emissiveIntensity: 1.6,
      emissiveMap: runeTex,
      metalness: 0.9,
      roughness: 0.15,
    });
    const relicMesh = new THREE.Mesh(relicCoreGeo, relicMat);
    sunstoneGroup.add(relicMesh);

    // Orbiting Golden Energy Rings
    const ringGeo = new THREE.TorusGeometry(0.7, 0.035, 8, 24);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xffdd66,
      metalness: 0.95,
      roughness: 0.2,
    });
    const ring1 = new THREE.Mesh(ringGeo, ringMat);
    ring1.rotation.x = Math.PI / 3;
    sunstoneGroup.add(ring1);

    const ring2 = new THREE.Mesh(ringGeo, ringMat);
    ring2.rotation.y = Math.PI / 4;
    sunstoneGroup.add(ring2);

    // Relic Point Light
    const relicLight = new THREE.PointLight(0xffaa22, 2.5, 8);
    relicLight.position.y = 0.2;
    sunstoneGroup.add(relicLight);

    scene.add(sunstoneGroup);

    // 12. Ancient Ruined Chest (Interactive Prop)
    const chestGroup = new THREE.Group();
    chestGroup.position.set(-8, getGroundHeight(-8, -14), -14);
    chestGroup.rotation.y = Math.PI / 4;

    const chestBase = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 0.9, 1.1),
      new THREE.MeshStandardMaterial({ color: 0x4a3c2c, roughness: 0.7, metalness: 0.2 })
    );
    chestBase.position.y = 0.45;
    chestBase.castShadow = !isSoftwareGl;
    chestGroup.add(chestBase);

    // Chest Lid with hinge pivot at back
    const chestLidPivot = new THREE.Group();
    chestLidPivot.position.set(0, 0.9, -0.55);
    const chestLid = new THREE.Mesh(
      new THREE.CylinderGeometry(0.55, 0.55, 1.6, 12, 1, false, 0, Math.PI),
      new THREE.MeshStandardMaterial({ color: 0x5a4835, roughness: 0.7, metalness: 0.25 })
    );
    chestLid.rotation.z = Math.PI / 2;
    chestLid.position.set(0, 0, 0.55);
    chestLid.castShadow = !isSoftwareGl;
    chestLidPivot.add(chestLid);
    chestGroup.add(chestLidPivot);

    scene.add(chestGroup);

    // 13. Elder Thorne NPC & Campfire
    const npcGroup = new THREE.Group();
    npcGroup.position.set(-14, getGroundHeight(-14, 10), 10);
    npcGroup.rotation.y = Math.PI * 0.7;

    // NPC Body & Robes
    const npcBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.55, 1.5, 8),
      new THREE.MeshStandardMaterial({ color: 0x3d4a3e, roughness: 0.85 })
    );
    npcBody.position.y = 0.75;
    npcBody.castShadow = !isSoftwareGl;
    npcGroup.add(npcBody);

    // NPC Hooded Head
    const npcHead = new THREE.Mesh(
      new THREE.SphereGeometry(0.28, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0xd8c2aa, roughness: 0.6 })
    );
    npcHead.position.y = 1.65;
    npcGroup.add(npcHead);

    const npcHood = new THREE.Mesh(
      new THREE.ConeGeometry(0.38, 0.5, 8),
      new THREE.MeshStandardMaterial({ color: 0x2e382f, roughness: 0.85 })
    );
    npcHood.position.y = 1.82;
    npcGroup.add(npcHood);

    // Wooden Walking Staff
    const staff = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.05, 2.1, 6),
      new THREE.MeshStandardMaterial({ color: 0x523824, roughness: 0.9 })
    );
    staff.position.set(0.48, 1.05, 0.2);
    staff.rotation.z = -0.1;
    staff.castShadow = !isSoftwareGl;
    npcGroup.add(staff);

    // Campfire Stones & Glow
    const campfire = new THREE.Group();
    campfire.position.set(-12, getGroundHeight(-12, 10), 9);
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      const rock = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.2, 0),
        new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.9 })
      );
      rock.position.set(Math.cos(angle) * 0.6, 0.1, Math.sin(angle) * 0.6);
      campfire.add(rock);
    }
    const fireLight = new THREE.PointLight(0xff6611, 2.8, 7);
    fireLight.position.y = 0.4;
    campfire.add(fireLight);
    scene.add(campfire);
    scene.add(npcGroup);

    // 14. Procedural Pine Trees & Rocks (Instanced for high FPS)
    const treeTrunkGeo = new THREE.CylinderGeometry(0.3, 0.5, 3.5, 6);
    const treeCanopyGeo = new THREE.ConeGeometry(2.2, 4.5, 6);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x3d2817, roughness: 0.9 });
    const canopyMat = new THREE.MeshStandardMaterial({ color: 0x1f3b20, roughness: 0.8 });

    const treePositions = [
      [-22, 18], [-28, 6], [-18, -25], [-26, -18],
      [5, 24], [16, 28], [-4, 32], [-14, -32],
      [28, -20], [32, 5], [26, 22], [35, -12],
      [-32, -4], [-38, 14], [8, -32], [22, -35]
    ];
    treePositions.forEach(([tx, tz]) => {
      const tree = new THREE.Group();
      const ty = getGroundHeight(tx, tz);
      tree.position.set(tx, ty, tz);

      const trunk = new THREE.Mesh(treeTrunkGeo, trunkMat);
      trunk.position.y = 1.75;
      trunk.castShadow = !isSoftwareGl;
      tree.add(trunk);

      const canopy1 = new THREE.Mesh(treeCanopyGeo, canopyMat);
      canopy1.position.y = 4.2;
      canopy1.castShadow = !isSoftwareGl;
      tree.add(canopy1);

      const canopy2 = new THREE.Mesh(treeCanopyGeo, canopyMat);
      canopy2.position.y = 6.0;
      canopy2.scale.set(0.75, 0.75, 0.75);
      canopy2.castShadow = !isSoftwareGl;
      tree.add(canopy2);

      scene.add(tree);
    });

    // 15. Hero Character Model (Composite 7-part Explorer Mesh, grounded pivot)
    const playerGroup = new THREE.Group();
    playerGroup.position.set(0, getGroundHeight(0, 15), 15);

    // Torso / Explorer Field Jacket
    const jacketMat = new THREE.MeshStandardMaterial({ color: 0x5c4a35, roughness: 0.7, metalness: 0.1 });
    const torsoMesh = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.75, 0.38), jacketMat);
    torsoMesh.position.y = 1.35;
    torsoMesh.castShadow = !isSoftwareGl;
    playerGroup.add(torsoMesh);

    // Explorer Head & Leather Brim Hat
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xdfba98, roughness: 0.5 });
    const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 10), skinMat);
    headMesh.position.y = 1.95;
    playerGroup.add(headMesh);

    const hatMat = new THREE.MeshStandardMaterial({ color: 0x3d3023, roughness: 0.8 });
    const hatBrim = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.05, 12), hatMat);
    hatBrim.position.y = 2.05;
    playerGroup.add(hatBrim);
    const hatCrown = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 0.22, 10), hatMat);
    hatCrown.position.y = 2.18;
    playerGroup.add(hatCrown);

    // Explorer Backpack with Bedroll
    const packMat = new THREE.MeshStandardMaterial({ color: 0x34291e, roughness: 0.85 });
    const packMesh = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.55, 0.32), packMat);
    packMesh.position.set(0, 1.4, -0.32);
    packMesh.castShadow = !isSoftwareGl;
    playerGroup.add(packMesh);

    const bedrollMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.12, 0.65, 8),
      new THREE.MeshStandardMaterial({ color: 0x6b7754, roughness: 0.8 })
    );
    bedrollMesh.rotation.z = Math.PI / 2;
    bedrollMesh.position.set(0, 1.72, -0.35);
    playerGroup.add(bedrollMesh);

    // Shoulder Brass Talisman / Lantern (Accent)
    const lanternMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.18, 0.12),
      new THREE.MeshStandardMaterial({ color: 0xdda833, emissive: 0x885511, emissiveIntensity: 1.2, metalness: 0.9 })
    );
    lanternMesh.position.set(0.36, 1.5, 0.12);
    playerGroup.add(lanternMesh);

    // Left and Right Legs & Hiking Boots
    const pantsMat = new THREE.MeshStandardMaterial({ color: 0x384236, roughness: 0.85 });
    const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.85, 0.24), pantsMat);
    leftLeg.position.set(-0.18, 0.55, 0);
    leftLeg.castShadow = !isSoftwareGl;
    playerGroup.add(leftLeg);

    const rightLeg = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.85, 0.24), pantsMat);
    rightLeg.position.set(0.18, 0.55, 0);
    rightLeg.castShadow = !isSoftwareGl;
    playerGroup.add(rightLeg);

    scene.add(playerGroup);

    // Kinematics & Physics State
    const playerVelocity = new THREE.Vector3();
    let playerYaw = 0;
    let cameraYaw = 0;
    let cameraPitch = 0.25;
    let cameraDistance = 5.2;
    let isGrounded = true;
    let verticalVelocity = 0;
    let walkPhase = 0;
    let leftFootNotifyFired = false;
    let rightFootNotifyFired = false;

    // Surface impact dust/splash particle system (Niagara simulation)
    const particleGeo = new THREE.RingGeometry(0.04, 0.22, 12);
    particleGeo.rotateX(-Math.PI / 2);
    const particlePool: { mesh: THREE.Mesh; life: number; maxLife: number; surface: string }[] = [];
    const particleMat = new THREE.MeshBasicMaterial({
      color: 0x88aa66,
      transparent: true,
      opacity: 0.6,
      depthWrite: false,
      side: THREE.DoubleSide,
    });

    for (let i = 0; i < 10; i++) {
      const pMesh = new THREE.Mesh(particleGeo, particleMat.clone());
      pMesh.visible = false;
      scene.add(pMesh);
      particlePool.push({ mesh: pMesh, life: 0, maxLife: 0.35, surface: 'Grass' });
    }

    let particleIdx = 0;
    function spawnFootstepParticle(x: number, y: number, z: number, surface: 'Grass' | 'Stone' | 'Water' | 'Wood') {
      const p = particlePool[particleIdx];
      particleIdx = (particleIdx + 1) % particlePool.length;
      p.mesh.position.set(x, y + 0.04, z);
      p.mesh.scale.set(0.6, 0.6, 0.6);
      p.life = p.maxLife;
      p.surface = surface;
      p.mesh.visible = true;

      const mat = p.mesh.material as THREE.MeshBasicMaterial;
      if (surface === 'Stone') mat.color.setHex(0xcccccc);
      else if (surface === 'Water') mat.color.setHex(0x55ccff);
      else if (surface === 'Wood') mat.color.setHex(0xaa7744);
      else mat.color.setHex(0x77aa55);
    }

    // Mouse look and camera orbit controls
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const onMouseDown = (e: MouseEvent) => {
      // Don't drag if clicking UI buttons
      if ((e.target as HTMLElement).closest('button, input, select, textarea')) return;
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      // 1. If Pointer is locked (Seamless PC Game Free Mouse Look while running)
      if (document.pointerLockElement === canvasElem) {
        cameraYaw -= e.movementX * 0.0032;
        cameraPitch = Math.max(-0.25, Math.min(1.15, cameraPitch + e.movementY * 0.0032));
        return;
      }

      // 2. Click & drag rotation
      if (!isDragging) return;
      const dx = e.clientX - prevMouseX;
      const dy = e.clientY - prevMouseY;
      cameraYaw -= dx * 0.0055;
      cameraPitch = Math.max(-0.25, Math.min(1.15, cameraPitch + dy * 0.0055));
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      cameraDistance = Math.max(2.8, Math.min(9.0, cameraDistance + e.deltaY * 0.005));
    };

    const onPointerLockChange = () => {
      setIsPointerLocked(document.pointerLockElement === canvasElem);
    };

    document.addEventListener('pointerlockchange', onPointerLockChange);

    const canvasElem = renderer.domElement;
    canvasElem.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    canvasElem.addEventListener('wheel', onWheel, { passive: true });

    // Handle Resize
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // Animation Loop
    const clock = new THREE.Clock();
    let frameId = 0;
    let lastFpsUpdate = 0;
    let frameCount = 0;

    function animate() {
      frameId = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.08);

      // FPS Calculation
      frameCount++;
      const now = performance.now();
      if (now - lastFpsUpdate > 600) {
        setCurrentFps(Math.round((frameCount * 1000) / (now - lastFpsUpdate)));
        frameCount = 0;
        lastFpsUpdate = now;
      }

      // 1. Process Input Locomotion (Forward/Backward and Side Strafe)
      const forwardInput = (keysRef.current['KeyW'] || keysRef.current['ArrowUp'] ? 1 : 0) -
                           (keysRef.current['KeyS'] || keysRef.current['ArrowDown'] ? 1 : 0);
      const rightInput = (keysRef.current['KeyD'] || keysRef.current['ArrowRight'] ? 1 : 0) -
                         (keysRef.current['KeyA'] || keysRef.current['ArrowLeft'] ? 1 : 0);

      // Keyboard camera turn (Q / E or on-screen camera buttons)
      if (keysRef.current['KeyQ'] || keysRef.current['CamLeft']) {
        cameraYaw += delta * 2.2;
      }
      if (keysRef.current['KeyE_Cam'] || keysRef.current['CamRight']) {
        cameraYaw -= delta * 2.2;
      }

      const isSprinting = !!keysRef.current['ShiftLeft'] || !!keysRef.current['ShiftRight'] || !!keysRef.current['SprintBtn'];
      const isCrouching = !!keysRef.current['KeyC'] || !!keysRef.current['CrouchBtn'];
      const wantsJump = !!keysRef.current['Space'] || !!keysRef.current['JumpBtn'];

      let moveSpeed = 4.8;
      if (isSprinting) moveSpeed = 8.5;
      if (isCrouching) moveSpeed = 2.4;

      const isMoving = forwardInput !== 0 || rightInput !== 0;
      const moveDir = new THREE.Vector3();

      if (isMoving) {
        // Normalize diagonal inputs so moving at an angle is smooth and not faster
        const len = Math.hypot(forwardInput, rightInput);
        const normFwd = forwardInput / len;
        const normRight = rightInput / len;

        // UE5 Camera-Relative Basis Vectors (flat along ground plane)
        // Camera is placed at (+sin(yaw)*dist, +cos(yaw)*dist), pointing toward player target
        // Therefore, Forward direction pointing away from camera is (-sin(yaw), -cos(yaw))
        // And Right direction is (+cos(yaw), -sin(yaw))
        const fwdX = -Math.sin(cameraYaw);
        const fwdZ = -Math.cos(cameraYaw);
        const rgtX = Math.cos(cameraYaw);
        const rgtZ = -Math.sin(cameraYaw);

        moveDir.x = fwdX * normFwd + rgtX * normRight;
        moveDir.z = fwdZ * normFwd + rgtZ * normRight;

        // Smoothly rotate character to face travel direction
        const targetYaw = Math.atan2(moveDir.x, moveDir.z);
        playerYaw = THREE.MathUtils.damp(playerYaw, targetYaw, 12, delta);
        playerGroup.rotation.y = playerYaw;

        // Physical Material query beneath player collision capsule
        const px = playerGroup.position.x;
        const pz = playerGroup.position.z;
        const py = playerGroup.position.y;

        let currentSurface: 'Grass' | 'Stone' | 'Water' | 'Wood' = 'Grass';
        let physMatName = 'PM_Grass (SurfaceType1)';
        // Check if within Ancient Temple Stone platform (templeGroup at x: 18, z: -12, 18x18 platform)
        if (Math.abs(px - 18) <= 9.2 && Math.abs(pz - (-12)) <= 9.2) {
          currentSurface = 'Stone';
          physMatName = 'PM_GraniteRuin (SurfaceType2)';
        } else if (py <= -0.9 || (Math.abs(pz) <= 5.5 && Math.abs(px) <= 65)) {
          currentSurface = 'Water';
          physMatName = 'PM_RiverWater (SurfaceType3)';
        } else if (Math.hypot(px - (-14), pz - 10) <= 4.2) {
          currentSurface = 'Wood';
          physMatName = 'PM_CampPlanks (SurfaceType4)';
        }

        // Leg walking cycle swing (Locomotion Animation Track)
        walkPhase += delta * (isSprinting ? 14 : 9);
        const walkCycle = Math.sin(walkPhase);
        leftLeg.rotation.x = walkCycle * 0.45;
        rightLeg.rotation.x = -walkCycle * 0.45;

        // Animation Notify Event Triggers (AN_Footstep_L / AN_Footstep_R at heel contact)
        if (isGrounded) {
          if (walkCycle > 0.45) {
            if (!leftFootNotifyFired) {
              leftFootNotifyFired = true;
              rightFootNotifyFired = false;
              soundManager.playSurfaceFootstep(currentSurface, isSprinting, 'Left');
              const pitchVal = Math.round((0.92 + Math.random() * 0.16) * 100) / 100;
              setFootstepTelemetry({
                surface: currentSurface,
                physMat: physMatName,
                foot: 'Left',
                pitch: pitchVal,
              });
              spawnFootstepParticle(px - 0.22, py, pz, currentSurface);
            }
          } else if (walkCycle < -0.45) {
            if (!rightFootNotifyFired) {
              rightFootNotifyFired = true;
              leftFootNotifyFired = false;
              soundManager.playSurfaceFootstep(currentSurface, isSprinting, 'Right');
              const pitchVal = Math.round((0.92 + Math.random() * 0.16) * 100) / 100;
              setFootstepTelemetry({
                surface: currentSurface,
                physMat: physMatName,
                foot: 'Right',
                pitch: pitchVal,
              });
              spawnFootstepParticle(px + 0.22, py, pz, currentSurface);
            }
          }
        }

        setPlayerMovementState(isSprinting ? 'Sprinting' : isCrouching ? 'Crouching' : 'Jogging');
      } else {
        leftLeg.rotation.x = THREE.MathUtils.damp(leftLeg.rotation.x, 0, 8, delta);
        rightLeg.rotation.x = THREE.MathUtils.damp(rightLeg.rotation.x, 0, 8, delta);
        setPlayerMovementState(isCrouching ? 'Crouched' : 'Idle');
        leftFootNotifyFired = false;
        rightFootNotifyFired = false;
      }

      // Update active surface particle rings
      for (const p of particlePool) {
        if (p.life > 0) {
          p.life -= delta;
          const progress = 1 - p.life / p.maxLife;
          const s = 0.6 + progress * 1.5;
          p.mesh.scale.set(s, s, s);
          (p.mesh.material as THREE.MeshBasicMaterial).opacity = (1 - progress) * 0.6;
          if (p.life <= 0) p.mesh.visible = false;
        }
      }

      // Apply horizontal velocity with smooth acceleration
      playerVelocity.x = THREE.MathUtils.damp(playerVelocity.x, moveDir.x * moveSpeed, 12, delta);
      playerVelocity.z = THREE.MathUtils.damp(playerVelocity.z, moveDir.z * moveSpeed, 12, delta);

      playerGroup.position.x += playerVelocity.x * delta;
      playerGroup.position.z += playerVelocity.z * delta;

      // Jump & Gravity physics
      const currentGroundY = getGroundHeight(playerGroup.position.x, playerGroup.position.z);
      if (isGrounded) {
        if (wantsJump) {
          verticalVelocity = 6.2;
          isGrounded = false;
          setPlayerMovementState('Jumping');
        } else {
          verticalVelocity = 0;
          playerGroup.position.y = currentGroundY;
        }
      } else {
        verticalVelocity -= 18.0 * delta; // Gravity
        playerGroup.position.y += verticalVelocity * delta;

        if (playerGroup.position.y <= currentGroundY) {
          playerGroup.position.y = currentGroundY;
          verticalVelocity = 0;
          isGrounded = true;
        }
      }

      // 2. Third-Person Spring-Arm Camera Follow
      const targetCamPos = new THREE.Vector3(
        playerGroup.position.x + Math.sin(cameraYaw) * Math.cos(cameraPitch) * cameraDistance,
        playerGroup.position.y + 1.6 + Math.sin(cameraPitch) * cameraDistance,
        playerGroup.position.z + Math.cos(cameraYaw) * Math.cos(cameraPitch) * cameraDistance
      );

      // Prevent camera from clipping through terrain
      const camGroundY = getGroundHeight(targetCamPos.x, targetCamPos.z) + 0.6;
      if (targetCamPos.y < camGroundY) {
        targetCamPos.y = camGroundY;
      }

      camera.position.lerp(targetCamPos, 0.15);
      const lookTarget = new THREE.Vector3(
        playerGroup.position.x,
        playerGroup.position.y + 1.4,
        playerGroup.position.z
      );
      camera.lookAt(lookTarget);

      // 3. Relic Rotation & Sparkle
      if (!relicCollectedRef.current) {
        relicMesh.rotation.y += delta * 1.5;
        relicMesh.rotation.x += delta * 0.7;
        ring1.rotation.z += delta * 2.0;
        ring2.rotation.x += delta * 1.8;
        sunstoneGroup.position.y = getGroundHeight(18, -12) + 2.7 + Math.sin(clock.getElapsedTime() * 2) * 0.12;
      }

      // Campfire flicker
      fireLight.intensity = 2.4 + Math.sin(clock.getElapsedTime() * 10) * 0.4 + Math.cos(clock.getElapsedTime() * 15) * 0.2;

      // 4. Interactive Object Distance Proximity Checks
      const pPos = playerGroup.position;
      let activePrompt: string | null = null;
      let activeCallback: (() => void) | null = null;

      // Check Relic (Sunstone)
      const distRelic = pPos.distanceTo(sunstoneGroup.position);
      if (distRelic < 3.2 && !relicCollectedRef.current) {
        activePrompt = 'Press [E] to Take Ancient Sunstone of Eldoria';
        activeCallback = () => {
          relicCollectedRef.current = true;
          sunstoneGroup.visible = false;
          soundManager.playRelicPickup();
          onInteractRelic({
            id: 'item-sunstone',
            name: 'Sunstone of Eldoria',
            category: 'Relic',
            rarity: 'Ancient',
            description: 'A radiant golden relic humming with concentrated solar essence from the first kingdom.',
            lore: 'Inscribed with high solar glyphs: "He who holds the Dawn shall illuminate the lost subterranean paths."',
            iconName: 'Sparkles',
            quantity: 1,
            weight: 1.2,
            modelType: 'sunstone',
            discoveredAt: 'Sunken Temple Altar',
          });
        };
      }

      // Check Crypt Door
      const cryptDoorWorldPos = new THREE.Vector3(18, getGroundHeight(18, -12), -12 - 8.2);
      const distDoor = pPos.distanceTo(cryptDoorWorldPos);
      if (distDoor < 4.0 && !doorOpenedRef.current) {
        activePrompt = 'Press [E] to Activate Rune Switch & Open Crypt Door';
        activeCallback = () => {
          doorOpenedRef.current = true;
          soundManager.playStoneDoorOpen();
          // Animate door upward
          let t = 0;
          const openInterval = setInterval(() => {
            t += 0.05;
            cryptDoorGroup.position.y += 0.12;
            if (t >= 1.5) clearInterval(openInterval);
          }, 30);
        };
      }

      // Check Chest
      const distChest = pPos.distanceTo(chestGroup.position);
      if (distChest < 3.0 && !chestOpenedRef.current) {
        activePrompt = 'Press [E] to Open Weathered Explorer Chest';
        activeCallback = () => {
          chestOpenedRef.current = true;
          soundManager.playChestOpen();
          // Animate chest lid opening
          let t = 0;
          const lidInterval = setInterval(() => {
            t += 0.08;
            chestLidPivot.rotation.x = -Math.min(Math.PI * 0.65, t * 1.5);
            if (t >= 1.2) clearInterval(lidInterval);
          }, 30);
          onOpenChest({
            id: 'item-compass',
            name: "Wayfarer's Celestial Compass",
            category: 'Tool',
            rarity: 'Rare',
            description: 'A brass navigator featuring three gyro-stabilized rings aligned to magnetic ley lines.',
            lore: 'Forged in the Royal Observatory. Needle always points toward hidden arcane sanctuaries.',
            iconName: 'Compass',
            quantity: 1,
            weight: 0.8,
            modelType: 'compass',
            discoveredAt: 'Ruined Outpost Chest',
          });
        };
      }

      // Check Elder Thorne NPC
      const distNpc = pPos.distanceTo(npcGroup.position);
      if (distNpc < 3.5) {
        activePrompt = 'Press [E] to Speak with Elder Thorne';
        activeCallback = () => {
          soundManager.playUiClick();
          onTalkNpc();
        };
      }

      setPromptText(activePrompt);
      currentActionRef.current = activeCallback;

      // 5. Landmark Trigger Zones
      const checkLandmark = (id: string, name: string, region: string, x: number, z: number, radius: number, desc: string) => {
        if (!discoveredLandmarksRef.current.has(id)) {
          const dist = Math.hypot(pPos.x - x, pPos.z - z);
          if (dist < radius) {
            discoveredLandmarksRef.current.add(id);
            setDiscoveryBanner(name);
            soundManager.playQuestComplete();
            onDiscoverLandmark({
              id,
              name,
              region,
              discovered: true,
              description: desc,
              coordinates: { x: Math.round(x), z: Math.round(z) },
              discoveryTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            });
            setTimeout(() => setDiscoveryBanner(null), 4500);
          }
        }
      };

      checkLandmark(
        'landmark-temple',
        'The Sunken Sun Temple',
        'Valley of Whispers',
        18,
        -12,
        9.0,
        'A cyclopean stone sanctuary reclaimed by mountain moss. Ancient priests gathered here during equinoxes.'
      );
      checkLandmark(
        'landmark-camp',
        "Thorne's Encampment",
        'Wildlands Border',
        -14,
        10,
        7.0,
        'A modest campfire shelter set up by the veteran scholar researching the kingdom’s disappearance.'
      );
      checkLandmark(
        'landmark-river',
        'Whispering Brook Crossing',
        'Valley of Whispers',
        0,
        0,
        8.0,
        'A crystal mountain river carrying glacial meltwater through the heart of the ancient ruins.'
      );

      // Render
      renderer.render(scene, camera);
    }

    animate();

    return () => {
      cancelAnimationFrame(frameId);
      document.removeEventListener('pointerlockchange', onPointerLockChange);
      canvasElem.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      canvasElem.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [onInteractRelic, onOpenChest, onTalkNpc, onDiscoverLandmark]);

  const togglePointerLock = () => {
    const canvas = mountRef.current?.querySelector('canvas');
    if (!canvas) return;
    if (document.pointerLockElement === canvas) {
      document.exitPointerLock?.();
    } else {
      try {
        canvas.requestPointerLock?.();
      } catch {
        // ignore
      }
    }
  };

  return (
    <div className="relative w-full h-full select-none overflow-hidden bg-zinc-950 font-sans">
      {/* 3D WebGL Canvas Container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top HUD: Title & Quick Spec Badge */}
      <div className="absolute top-4 left-4 z-20 pointer-events-none flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 rounded text-amber-400 font-cinzel font-bold text-xs uppercase tracking-widest flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            WILDLANDS: THE LOST KINGDOM
          </div>
          <div className="px-2 py-0.5 bg-zinc-900/80 border border-zinc-700/60 rounded text-[11px] font-mono text-zinc-300">
            UE5 Prototype Engine
          </div>
        </div>

        {/* Active Objective Tracker Card */}
        {activeQuest && (
          <div className="pointer-events-auto mt-1 max-w-xs bg-zinc-900/90 border border-zinc-800 rounded-lg p-2.5 shadow-xl text-xs">
            <div className="flex items-center justify-between text-zinc-400 mb-1">
              <span className="font-semibold text-amber-400 uppercase tracking-wider text-[10px]">Active Objective</span>
              <span className="text-[10px] text-zinc-500 font-mono">{activeQuest.status}</span>
            </div>
            <div className="font-medium text-zinc-100">{activeQuest.title}</div>
            <div className="text-zinc-400 text-[11px] mt-1 leading-snug">
              {activeQuest.objectives.find((o) => !o.isCompleted)?.description || 'All objectives completed! Return to Thorne.'}
            </div>
          </div>
        )}
      </div>

      {/* Top Right: Hardware & AnimNotify Audio Telemetry */}
      <div className="absolute top-4 right-4 z-20 pointer-events-none flex flex-col items-end gap-1.5">
        <div className="px-2.5 py-1 bg-zinc-900/85 border border-zinc-800 rounded text-xs font-mono text-emerald-400 flex items-center gap-2">
          <span>FPS: {currentFps}</span>
          <span className="text-zinc-600">|</span>
          <span className="text-zinc-400">RTX 3050 (TSR 70%)</span>
          <span className="text-zinc-600">|</span>
          <span className="text-amber-300 capitalize">{playerMovementState}</span>
        </div>

        {/* Live Physical Material & AnimNotify Badge */}
        {footstepTelemetry && (
          <div className="px-2.5 py-1 bg-zinc-900/90 border border-amber-500/40 rounded text-[11px] font-mono text-zinc-300 flex items-center gap-2 shadow-lg">
            <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px]">
              AN_Footstep_{footstepTelemetry.foot[0]}
            </span>
            <span className="text-zinc-300 font-medium">{footstepTelemetry.physMat}</span>
            <span className="text-zinc-600">|</span>
            <span className="text-emerald-400">{footstepTelemetry.pitch}x pitch</span>
          </div>
        )}
      </div>

      {/* Center Cinematic Landmark Discovery Banner */}
      {discoveryBanner && (
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 z-30 pointer-events-none text-center animate-bounce duration-1000">
          <div className="text-xs uppercase tracking-[0.3em] font-cinzel text-amber-400 font-bold mb-1 drop-shadow-md">
            ✦ Location Discovered ✦
          </div>
          <div className="text-2xl md:text-3xl font-cinzel font-black text-amber-100 tracking-wide drop-shadow-lg px-6 py-2 bg-gradient-to-r from-transparent via-zinc-900/90 to-transparent border-y border-amber-500/40">
            {discoveryBanner}
          </div>
          <div className="text-xs text-zinc-400 font-mono mt-1">Logged to Explorer Journal (+150 XP)</div>
        </div>
      )}

        {/* Center Screen Interaction Prompt */}
        {promptText && (
          <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
            <div className="px-4 py-2 bg-zinc-900/95 border border-amber-500/70 rounded-full shadow-2xl flex items-center gap-2.5 animate-pulse">
              <span className="w-5 h-5 rounded-full bg-amber-500 text-zinc-950 font-bold text-xs flex items-center justify-center font-mono">
                E
              </span>
              <span className="text-xs md:text-sm font-semibold text-zinc-100 tracking-wide">{promptText}</span>
            </div>
          </div>
        )}

      {/* Pointer Lock Notification / Free Look Status Banner */}
      {isPointerLocked && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
          <div className="px-4 py-1.5 bg-zinc-950/90 border border-emerald-500/60 rounded-full shadow-2xl flex items-center gap-2 text-xs font-mono text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>🎯 Free Mouse Look Active • Move mouse to aim • Press ESC or click Lock button to release</span>
          </div>
        </div>
      )}

      {/* On-Screen Arrow Buttons (D-Pad & Movement Controls) */}
      <div className="absolute bottom-24 left-4 z-20 flex flex-col items-center gap-2 select-none pointer-events-auto">
        <div className="p-2.5 bg-zinc-900/90 border border-zinc-800/90 rounded-2xl shadow-2xl flex flex-col items-center gap-1.5">
          <div className="flex items-center justify-between w-full px-1 text-[9px] font-mono uppercase text-zinc-400 font-bold tracking-wider mb-0.5">
            <span>Arrow Controls</span>
            <span className="text-amber-400">{activeKeys['ArrowUp'] || activeKeys['ArrowDown'] || activeKeys['ArrowLeft'] || activeKeys['ArrowRight'] || activeKeys['KeyW'] || activeKeys['KeyS'] || activeKeys['KeyA'] || activeKeys['KeyD'] ? 'Moving' : 'Ready'}</span>
          </div>

          {/* Up Button (Forward) */}
          <button
            onPointerDown={() => setVirtualKey('ArrowUp', true)}
            onPointerUp={() => setVirtualKey('ArrowUp', false)}
            onPointerLeave={() => setVirtualKey('ArrowUp', false)}
            className={`w-11 h-11 rounded-xl border flex flex-col items-center justify-center font-bold text-xs transition-all shadow-md cursor-pointer ${
              activeKeys['ArrowUp'] || activeKeys['KeyW']
                ? 'bg-amber-500 text-zinc-950 border-amber-300 scale-95 shadow-amber-500/30'
                : 'bg-zinc-800/90 text-zinc-200 border-zinc-700 hover:bg-zinc-700'
            }`}
            title="Move Forward (Up Arrow / W)"
          >
            <span className="text-base leading-none">▲</span>
            <span className="text-[8px] font-mono opacity-70">FWD</span>
          </button>

          {/* Left, Jump, Right Row */}
          <div className="flex items-center gap-1.5">
            {/* Left Button */}
            <button
              onPointerDown={() => setVirtualKey('ArrowLeft', true)}
              onPointerUp={() => setVirtualKey('ArrowLeft', false)}
              onPointerLeave={() => setVirtualKey('ArrowLeft', false)}
              className={`w-11 h-11 rounded-xl border flex flex-col items-center justify-center font-bold text-xs transition-all shadow-md cursor-pointer ${
                activeKeys['ArrowLeft'] || activeKeys['KeyA']
                  ? 'bg-amber-500 text-zinc-950 border-amber-300 scale-95 shadow-amber-500/30'
                  : 'bg-zinc-800/90 text-zinc-200 border-zinc-700 hover:bg-zinc-700'
              }`}
              title="Move Left (Left Arrow / A)"
            >
              <span className="text-base leading-none">◀</span>
              <span className="text-[8px] font-mono opacity-70">LEFT</span>
            </button>

            {/* Jump Button (Center) */}
            <button
              onPointerDown={() => setVirtualKey('Space', true)}
              onPointerUp={() => setVirtualKey('Space', false)}
              onPointerLeave={() => setVirtualKey('Space', false)}
              className={`w-11 h-11 rounded-xl border flex flex-col items-center justify-center font-mono text-[9px] font-bold transition-all shadow-md cursor-pointer ${
                activeKeys['Space']
                  ? 'bg-emerald-500 text-zinc-950 border-emerald-300 scale-95 shadow-emerald-500/30'
                  : 'bg-zinc-950 text-zinc-300 border-zinc-700 hover:bg-zinc-800'
              }`}
              title="Jump (Spacebar)"
            >
              <span className="text-xs">⏫</span>
              <span className="text-[8px] opacity-80">JUMP</span>
            </button>

            {/* Right Button */}
            <button
              onPointerDown={() => setVirtualKey('ArrowRight', true)}
              onPointerUp={() => setVirtualKey('ArrowRight', false)}
              onPointerLeave={() => setVirtualKey('ArrowRight', false)}
              className={`w-11 h-11 rounded-xl border flex flex-col items-center justify-center font-bold text-xs transition-all shadow-md cursor-pointer ${
                activeKeys['ArrowRight'] || activeKeys['KeyD']
                  ? 'bg-amber-500 text-zinc-950 border-amber-300 scale-95 shadow-amber-500/30'
                  : 'bg-zinc-800/90 text-zinc-200 border-zinc-700 hover:bg-zinc-700'
              }`}
              title="Move Right (Right Arrow / D)"
            >
              <span className="text-base leading-none">▶</span>
              <span className="text-[8px] font-mono opacity-70">RIGHT</span>
            </button>
          </div>

          {/* Down Button (Backward) */}
          <button
            onPointerDown={() => setVirtualKey('ArrowDown', true)}
            onPointerUp={() => setVirtualKey('ArrowDown', false)}
            onPointerLeave={() => setVirtualKey('ArrowDown', false)}
            className={`w-11 h-11 rounded-xl border flex flex-col items-center justify-center font-bold text-xs transition-all shadow-md cursor-pointer ${
              activeKeys['ArrowDown'] || activeKeys['KeyS']
                ? 'bg-amber-500 text-zinc-950 border-amber-300 scale-95 shadow-amber-500/30'
                : 'bg-zinc-800/90 text-zinc-200 border-zinc-700 hover:bg-zinc-700'
            }`}
            title="Move Backward (Down Arrow / S)"
          >
            <span className="text-base leading-none">▼</span>
            <span className="text-[8px] font-mono opacity-70">BACK</span>
          </button>
        </div>

        {/* Quick Action Badges: Sprint & Mouse Look */}
        <div className="flex items-center gap-1.5 w-full">
          <button
            onPointerDown={() => setVirtualKey('ShiftLeft', true)}
            onPointerUp={() => setVirtualKey('ShiftLeft', false)}
            onPointerLeave={() => setVirtualKey('ShiftLeft', false)}
            className={`flex-1 py-1 px-2 rounded-lg border text-[11px] font-mono font-semibold transition-all cursor-pointer shadow text-center ${
              activeKeys['ShiftLeft'] || activeKeys['ShiftRight']
                ? 'bg-amber-500 text-zinc-950 border-amber-300'
                : 'bg-zinc-900/90 text-zinc-300 border-zinc-800 hover:bg-zinc-800'
            }`}
          >
            ⚡ Sprint
          </button>

          <button
            onClick={togglePointerLock}
            className={`flex-1 py-1 px-2 rounded-lg border text-[11px] font-mono font-semibold transition-all cursor-pointer shadow text-center flex items-center justify-center gap-1 ${
              isPointerLocked
                ? 'bg-emerald-600 text-white border-emerald-400'
                : 'bg-zinc-900/90 text-zinc-300 border-zinc-800 hover:bg-zinc-800'
            }`}
            title="Toggle Seamless Mouse Look (or Click Canvas)"
          >
            <span>{isPointerLocked ? '🎯 Locked' : '🎯 Free Look'}</span>
          </button>
        </div>
      </div>

      {/* Camera Rotate Buttons on bottom right */}
      <div className="absolute bottom-24 right-4 z-20 flex flex-col items-end gap-1.5 pointer-events-auto">
        <div className="flex items-center gap-1.5 p-1.5 bg-zinc-900/90 border border-zinc-800 rounded-xl shadow-lg">
          <button
            onPointerDown={() => setVirtualKey('CamLeft', true)}
            onPointerUp={() => setVirtualKey('CamLeft', false)}
            onPointerLeave={() => setVirtualKey('CamLeft', false)}
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono font-medium transition-all cursor-pointer flex items-center gap-1 ${
              activeKeys['CamLeft'] || activeKeys['KeyQ']
                ? 'bg-amber-500 text-zinc-950 border-amber-400'
                : 'bg-zinc-800 text-zinc-200 border-zinc-700 hover:bg-zinc-700'
            }`}
            title="Orbit Camera Left (Q)"
          >
            <span>↺ Cam Left (Q)</span>
          </button>
          <button
            onPointerDown={() => setVirtualKey('CamRight', true)}
            onPointerUp={() => setVirtualKey('CamRight', false)}
            onPointerLeave={() => setVirtualKey('CamRight', false)}
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono font-medium transition-all cursor-pointer flex items-center gap-1 ${
              activeKeys['CamRight'] || activeKeys['KeyE_Cam']
                ? 'bg-amber-500 text-zinc-950 border-amber-400'
                : 'bg-zinc-800 text-zinc-200 border-zinc-700 hover:bg-zinc-700'
            }`}
            title="Orbit Camera Right (E)"
          >
            <span>Cam Right (E) ↻</span>
          </button>
        </div>
      </div>

      {/* Three.js Skill Mandated: Unified Collapsible Bottom Dock (Zero Viewport Occlusion) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-[94%] max-w-4xl transition-all duration-300">
        {/* Toggle Collapse Pill */}
        <div className="flex justify-center -mb-2">
          <button
            onClick={() => setHudCollapsed(!hudCollapsed)}
            className="px-3 py-1 bg-zinc-900/95 border border-zinc-700/80 rounded-t-lg text-[11px] font-mono text-zinc-300 hover:text-white flex items-center gap-1.5 shadow-lg cursor-pointer"
          >
            {hudCollapsed ? <ChevronUp className="w-3.5 h-3.5 text-amber-400" /> : <ChevronDown className="w-3.5 h-3.5 text-amber-400" />}
            <span>{hudCollapsed ? 'Show Director Dock' : 'Hide Director Dock (H)'}</span>
          </button>
        </div>

        {!hudCollapsed && (
          <div className="bg-zinc-900/95 border border-zinc-800 rounded-xl p-3 shadow-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Left: Quick Controls Guide */}
            <div className="flex items-center gap-3 text-zinc-400">
              <div className="flex items-center gap-1">
                <span className="px-1.5 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-[10px] font-mono text-amber-400 font-semibold">WASD / Arrows</span>
                <span className="text-[11px]">Move (Fwd/Back/Side)</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="px-1.5 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-[10px] font-mono text-zinc-200">Shift</span>
                <span className="text-[11px]">Sprint</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="px-1.5 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-[10px] font-mono text-zinc-200">Space</span>
                <span className="text-[11px]">Jump</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="px-1.5 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-[10px] font-mono text-emerald-400">Mouse Look</span>
                <span className="text-[11px]">{isPointerLocked ? 'Free Aim' : 'Drag / Click 🎯'}</span>
              </div>
            </div>

            {/* Middle: Actions (Inventory [I], Journal [J], Sound) */}
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenInventory}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-zinc-200 font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <span>Backpack [I]</span>
                <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-400 rounded-full font-mono text-[10px]">
                  {inventoryCount}
                </span>
              </button>

              <button
                onClick={onOpenJournal}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-zinc-200 font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                <span>Journal [J/M]</span>
              </button>

              <button
                onClick={() => {
                  const muted = soundManager.toggleMute();
                  setIsMuted(muted);
                }}
                className="p-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-zinc-300 cursor-pointer"
                title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
              </button>
            </div>

            {/* Right: Scalability & Time Preset */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-zinc-950/80 p-1 rounded-lg border border-zinc-800 text-[11px]">
                <span className="text-zinc-500 px-1 font-mono">TSR:</span>
                <button
                  onClick={() => setGraphicsPreset('rtx3050')}
                  className={`px-2 py-0.5 rounded cursor-pointer ${
                    graphicsPreset === 'rtx3050' ? 'bg-amber-500/20 text-amber-300 font-semibold' : 'text-zinc-400'
                  }`}
                >
                  70% (3050)
                </button>
                <button
                  onClick={() => setGraphicsPreset('cinematic')}
                  className={`px-2 py-0.5 rounded cursor-pointer ${
                    graphicsPreset === 'cinematic' ? 'bg-amber-500/20 text-amber-300 font-semibold' : 'text-zinc-400'
                  }`}
                >
                  4K (100%)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
