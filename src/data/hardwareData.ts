export interface HardwareTip {
  title: string;
  commandOrSetting: string;
  category: 'Profiling' | 'Lumen & Lighting' | 'TSR & Upscaling' | 'Nanite & Shadows' | 'Storage & RAM';
  description: string;
  rtx3050Recommendation: string;
}

export const HARDWARE_TIPS: HardwareTip[] = [
  {
    title: 'Frame Time & Bottleneck Diagnostic',
    commandOrSetting: 'stat unit',
    category: 'Profiling',
    description: 'Displays Frametime (ms), Game Thread time (CPU game logic), Draw Thread time (CPU rendering submission), and GPU time (graphics rendering).',
    rtx3050Recommendation: 'For 60 FPS, all values must stay below 16.6 ms. For 30 FPS target, below 33.3 ms. If GPU > Game, you are graphics bound; adjust TSR or Lumen. If Game > GPU, you have too many Blueprint Ticks or unpooled actors.'
  },
  {
    title: 'Video Memory & RHI Resource Monitor',
    commandOrSetting: 'stat rhi',
    category: 'Profiling',
    description: 'Shows exact VRAM consumption, Draw Primitive calls, vertex counts, and Render Target memory.',
    rtx3050Recommendation: 'The RTX 3050 has 8GB VRAM (or 4GB on laptop). Keep total allocated VRAM under 6.8 GB to prevent Windows D3D12 device hung crashes.'
  },
  {
    title: 'Instant In-Depth GPU Pass Inspector',
    commandOrSetting: 'profilegpu (or Ctrl+Shift+,)',
    category: 'Profiling',
    description: 'Freezes the exact frame and opens a detailed tree breakdown of every millisecond spent on Shadows, Lumen, BasePass, and Post-Processing.',
    rtx3050Recommendation: 'Run this in heavy areas. If "LumenScreenProbeGather" is taking > 7ms, lower Lumen Scene Lighting Update Speed.'
  },
  {
    title: 'TSR (Temporal Super Resolution) 70% Scale',
    commandOrSetting: 'r.ScreenPercentage 70',
    category: 'TSR & Upscaling',
    description: 'Renders the internal 3D scene at 70% resolution (e.g. 1344x756 for 1080p, or 2688x1512 for 4K) and uses temporal reconstruction to output crisp 1080p / 4K.',
    rtx3050Recommendation: 'Mandatory on RTX 3050. Yields a 35-45% frame rate boost with virtually zero blur or artifacting.'
  },
  {
    title: 'Lumen Software Tracing vs Hardware Ray Tracing',
    commandOrSetting: 'r.Lumen.HardwareRayTracing 0',
    category: 'Lumen & Lighting',
    description: 'Forces Lumen to use Mesh Distance Fields and Surface Cache (Software Ray Tracing) instead of hardware BVH ray tracing.',
    rtx3050Recommendation: 'Keep Hardware RT OFF on the RTX 3050! Software ray tracing runs smoothly within the RTX 3050 RT core budget.'
  },
  {
    title: 'Virtual Shadow Maps Resolution Bias',
    commandOrSetting: 'r.Shadow.Virtual.ResolutionLodBiasDirectional 1.0',
    category: 'Nanite & Shadows',
    description: 'Controls the virtual shadow map page resolution for the Directional Sun light.',
    rtx3050Recommendation: 'Setting to 1.0 saves ~2-3 ms of GPU shadow projection time without noticeable visual degradation in open wilderness foliage.'
  },
  {
    title: 'SSD Active Project vs HDD Archive Strategy',
    commandOrSetting: 'Project Location: C:\\UE_Projects\\Wildlands',
    category: 'Storage & RAM',
    description: 'Keep the active .uproject, Source, and Content folders on your high-speed SSD. UE5 shader compiles and DDC (Derived Data Cache) write gigabytes of temporary data.',
    rtx3050Recommendation: 'Keep 80GB free on SSD. Move large uncooked Quixel Megascans, raw Blender .fbx source files, and backup .zip archives to the secondary HDD.'
  }
];

export const DEFAULT_ENGINE_INI_CONFIG = `; ==============================================================
; WILDLANDS: THE LOST KINGDOM - RTX 3050 / 16GB RAM OPTIMIZED
; File: [ProjectFolder]/Config/DefaultEngine.ini
; ==============================================================

[/Script/Engine.RendererSettings]
; Enable Temporal Super Resolution (TSR)
r.AntiAliasingMethod=4
r.TSR.History.ScreenPercentage=70
r.DynamicGlobalIlluminationMethod=1
r.ReflectionMethod=1

; Optimize Lumen for 8GB VRAM (Software Tracing)
r.Lumen.HardwareRayTracing=0
r.Lumen.DiffuseIndirect.Allow=1
r.LumenScene.SurfaceCache.CardResolution=128
r.Lumen.ScreenProbeGather.DownsampleFactor=16

; Virtual Shadow Maps Tuning
r.Shadow.Virtual.Enable=1
r.Shadow.Virtual.ResolutionLodBiasDirectional=1.0

; Nanite Geometry Settings
r.Nanite=1
r.Nanite.MaxPixelsPerEdge=1.5

; Volumetric Fog Step Size (Prevents GPU Choke)
r.VolumetricFog.GridPixelSize=16
r.VolumetricFog.GridSizeZ=64

; Texture Streaming Pool for 8GB VRAM
r.Streaming.PoolSize=3500
`;

export const DEFAULT_SCALABILITY_INI_CONFIG = `; ==============================================================
; DefaultScalability.ini - Optimized for High/Medium on RTX 3050
; File: [ProjectFolder]/Config/DefaultScalability.ini
; ==============================================================

[ShadowQuality@2]
r.Shadow.Virtual.ResolutionLodBiasDirectional=1.0
r.Shadow.Virtual.MaxPhysicalPages=2048

[GlobalIlluminationQuality@2]
r.Lumen.DiffuseIndirect.Allow=1
r.Lumen.ScreenProbeGather.ScreenTraces=1
r.LumenScene.SurfaceCache.CardResolution=128

[FoliageQuality@2]
foliage.DensityScale=0.75
grass.DensityScale=0.75
`;
