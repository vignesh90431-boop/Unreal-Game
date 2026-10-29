import React, { useState } from 'react';
import { HARDWARE_TIPS, DEFAULT_ENGINE_INI_CONFIG, DEFAULT_SCALABILITY_INI_CONFIG } from '../../data/hardwareData';
import { 
  Cpu, 
  HardDrive, 
  Gauge, 
  Terminal, 
  Copy, 
  Check, 
  AlertTriangle, 
  CheckCircle2, 
  Sliders, 
  Sparkles,
  Zap,
  Info
} from 'lucide-react';
import { soundManager } from '../../utils/audio';

export const HardwareProfiler: React.FC = () => {
  // Interactive Scalability Simulator state
  const [screenPercentage, setScreenPercentage] = useState<number>(70);
  const [lumenQuality, setLumenQuality] = useState<'Off' | 'Low' | 'Medium' | 'High'>('Medium');
  const [vsmEnabled, setVsmEnabled] = useState<boolean>(true);
  const [foliageDensity, setFoliageDensity] = useState<number>(75);
  const [targetResolution, setTargetResolution] = useState<'1080p' | '1440p' | '4K'>('1080p');

  // Copy states
  const [copiedIni, setCopiedIni] = useState<'engine' | 'scalability' | null>(null);
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);

  // Compute estimated performance metrics for RTX 3050
  // Base render time at native 1080p: ~24ms
  let resMultiplier = 1.0;
  if (targetResolution === '1440p') resMultiplier = 1.7;
  if (targetResolution === '4K') resMultiplier = 3.6;

  // TSR screen scale factor: e.g. 70% scale means (0.7)^2 = 0.49 internal pixel fill cost + 1.2ms TSR reconstruction
  const fillScale = Math.pow(screenPercentage / 100, 2);

  let lumenCostMs = 2.0;
  if (lumenQuality === 'Low') lumenCostMs = 4.5;
  if (lumenQuality === 'Medium') lumenCostMs = 7.0;
  if (lumenQuality === 'High') lumenCostMs = 12.5;

  const vsmCostMs = vsmEnabled ? 3.2 : 1.8;
  const foliageCostMs = (foliageDensity / 100) * 4.5;

  // Base pass + post processing
  const basePassMs = 6.0 * fillScale * resMultiplier;
  const totalGpuMs = Math.round((basePassMs + lumenCostMs + vsmCostMs + foliageCostMs + 1.2) * 10) / 10;
  const estimatedFps = Math.min(120, Math.max(15, Math.round(1000 / totalGpuMs)));

  // Estimate VRAM usage (out of 8.0 GB on RTX 3050)
  let vramBase = 3.4; // OS + UE5 Editor overhead + textures
  if (targetResolution === '1440p') vramBase += 0.8;
  if (targetResolution === '4K') vramBase += 1.8;
  if (lumenQuality === 'High') vramBase += 0.7;
  if (vsmEnabled) vramBase += 0.5;
  const estimatedVramGB = Math.round((vramBase + (foliageDensity / 100) * 0.4) * 10) / 10;

  const handleCopy = (text: string, type: 'engine' | 'scalability' | string) => {
    soundManager.playUiClick();
    navigator.clipboard.writeText(text);
    if (type === 'engine' || type === 'scalability') {
      setCopiedIni(type);
      setTimeout(() => setCopiedIni(null), 2000);
    } else {
      setCopiedCommand(type);
      setTimeout(() => setCopiedCommand(null), 2000);
    }
  };

  return (
    <div className="flex-1 h-full overflow-y-auto bg-zinc-950 text-zinc-100 p-4 md:p-6 select-none font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-amber-950/20 border border-zinc-800 rounded-xl p-5 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs font-semibold uppercase tracking-wider">
                  Target Rig Profile
                </span>
                <span className="text-zinc-500 text-xs font-mono">• Unreal Engine 5.4+</span>
              </div>
              <h2 className="text-2xl font-cinzel font-bold text-zinc-100">
                NVIDIA GeForce RTX 3050 (8GB) & 16GB RAM Studio
              </h2>
              <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
                Hardware scalability, frame-rate budgeting, and real-time simulator engineered to maximize visual fidelity at 1080p, 1440p, and cinematic 4K output using TSR upscaling.
              </p>
            </div>

            {/* Spec Cards */}
            <div className="flex items-center gap-3">
              <div className="px-3 py-2 bg-zinc-950/80 border border-zinc-800 rounded-lg text-center">
                <div className="text-[10px] font-mono text-zinc-500 uppercase">GPU VRAM</div>
                <div className="text-sm font-bold text-emerald-400 font-mono">8.0 GB</div>
              </div>
              <div className="px-3 py-2 bg-zinc-950/80 border border-zinc-800 rounded-lg text-center">
                <div className="text-[10px] font-mono text-zinc-500 uppercase">System RAM</div>
                <div className="text-sm font-bold text-sky-400 font-mono">16.0 GB</div>
              </div>
              <div className="px-3 py-2 bg-zinc-950/80 border border-zinc-800 rounded-lg text-center">
                <div className="text-[10px] font-mono text-zinc-500 uppercase">Upscaler</div>
                <div className="text-sm font-bold text-amber-400 font-mono">TSR 70%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Scalability Simulator Panel */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-amber-400" />
              <h3 className="font-cinzel font-bold text-base text-zinc-100">
                Live RTX 3050 Scalability & Bottleneck Simulator
              </h3>
            </div>
            <span className="text-xs font-mono text-zinc-400">Calculated for Wildlands Open World</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Control Sliders & Radios (2 Cols) */}
            <div className="lg:col-span-2 space-y-4">
              {/* Target Display Resolution */}
              <div>
                <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider block mb-1.5">
                  Output Target Resolution:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['1080p', '1440p', '4K'] as const).map((res) => (
                    <button
                      key={res}
                      onClick={() => setTargetResolution(res)}
                      className={`py-2 px-3 rounded-lg text-xs font-semibold cursor-pointer border transition-all ${
                        targetResolution === res
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {res} {res === '4K' ? '(Cinematic)' : res === '1080p' ? '(Standard Dev)' : '(QHD)'}
                    </button>
                  ))}
                </div>
              </div>

              {/* TSR Screen Percentage Slider */}
              <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                <div className="flex justify-between items-center mb-1 text-xs font-mono">
                  <span className="text-zinc-300">TSR Screen Percentage:</span>
                  <span className="text-amber-400 font-bold">{screenPercentage}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="100"
                  step="5"
                  value={screenPercentage}
                  onChange={(e) => setScreenPercentage(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-zinc-500 font-mono mt-1">
                  <span>50% (Performance)</span>
                  <span className="text-amber-400 font-semibold">70% (RTX 3050 Recommended Sweetspot)</span>
                  <span>100% (Native Heavy)</span>
                </div>
              </div>

              {/* Lumen Global Illumination */}
              <div>
                <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider block mb-1.5">
                  Lumen Global Illumination Method:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['Off', 'Low', 'Medium', 'High'] as const).map((q) => (
                    <button
                      key={q}
                      onClick={() => setLumenQuality(q)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-medium cursor-pointer border transition-all ${
                        lumenQuality === q
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {q} {q === 'Medium' ? '★' : ''}
                    </button>
                  ))}
                </div>
              </div>

              {/* Shadows & Foliage */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-medium text-zinc-200">Virtual Shadow Maps</div>
                    <div className="text-[10px] text-zinc-500 font-mono">Nanite Soft Shadows</div>
                  </div>
                  <button
                    onClick={() => setVsmEnabled(!vsmEnabled)}
                    className={`px-3 py-1 rounded text-xs font-mono font-semibold cursor-pointer ${
                      vsmEnabled ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {vsmEnabled ? 'ENABLED' : 'OFF'}
                  </button>
                </div>

                <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                  <div className="flex justify-between items-center text-xs font-mono mb-1">
                    <span className="text-zinc-300">Foliage Density:</span>
                    <span className="text-sky-400 font-bold">{foliageDensity}%</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="100"
                    step="5"
                    value={foliageDensity}
                    onChange={(e) => setFoliageDensity(Number(e.target.value))}
                    className="w-full accent-sky-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Simulated Live Output Diagnostics (1 Col) */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="text-xs uppercase tracking-wider font-mono text-zinc-400 font-semibold mb-3 flex items-center gap-1.5">
                  <Gauge className="w-4 h-4 text-amber-400" />
                  Estimated Performance
                </div>

                {/* Primary Metric: Framerate */}
                <div className="text-center py-4 bg-zinc-900/60 rounded-xl border border-zinc-800 mb-4">
                  <div className={`text-4xl font-black font-mono tracking-tight ${
                    estimatedFps >= 55 ? 'text-emerald-400' : estimatedFps >= 30 ? 'text-amber-400' : 'text-rose-400'
                  }`}>
                    {estimatedFps} <span className="text-lg font-sans font-medium text-zinc-400">FPS</span>
                  </div>
                  <div className="text-xs font-mono text-zinc-400 mt-1">
                    Frame Time: <span className="text-zinc-200 font-bold">{totalGpuMs} ms</span>
                  </div>
                </div>

                {/* VRAM Gauge */}
                <div className="space-y-1.5 mb-4">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-zinc-400">VRAM Budget:</span>
                    <span className={estimatedVramGB > 6.8 ? 'text-rose-400 font-bold' : 'text-zinc-200'}>
                      {estimatedVramGB} / 8.0 GB
                    </span>
                  </div>
                  <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden border border-zinc-800">
                    <div
                      className={`h-full transition-all duration-300 ${
                        estimatedVramGB > 7.0 ? 'bg-rose-500' : estimatedVramGB > 5.5 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${(estimatedVramGB / 8.0) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Director Verdict */}
                <div className="p-2.5 rounded-lg border text-xs leading-relaxed bg-zinc-900/80 border-zinc-800">
                  {estimatedFps >= 55 && estimatedVramGB <= 6.5 ? (
                    <div className="flex items-start gap-2 text-emerald-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>
                        <strong>Optimal 60 FPS Target!</strong> Smooth input latency, responsive camera controls, and sufficient VRAM headroom on the RTX 3050.
                      </span>
                    </div>
                  ) : estimatedFps >= 30 && estimatedVramGB <= 7.2 ? (
                    <div className="flex items-start gap-2 text-amber-300">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>
                        <strong>Stable 30 FPS Cinematic Target.</strong> Suitable for scenic exploration. For snappy combat, consider dropping screen scale to 70%.
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2 text-rose-300">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <span>
                        <strong>VRAM / GPU Bottleneck Warning.</strong> At native 4K or Epic Lumen, frame drops and D3D12 device hung crashes can occur on 8GB VRAM.
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="text-[10px] text-zinc-500 font-mono mt-3 text-center">
                Uses UE5 TSR temporal reconstruction to output clean 4K frames.
              </div>
            </div>
          </div>
        </div>

        {/* UE5 Console Commands Cheat Sheet */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-amber-400" />
              <h3 className="font-cinzel font-bold text-base text-zinc-100">
                Essential UE5 Diagnostic Console Commands (~ Key)
              </h3>
            </div>
            <span className="text-xs font-mono text-zinc-400">Click to copy command</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {HARDWARE_TIPS.map((tip) => (
              <div
                key={tip.commandOrSetting}
                onClick={() => handleCopy(tip.commandOrSetting, tip.commandOrSetting)}
                className="p-3 bg-zinc-950/70 border border-zinc-800/80 hover:border-amber-500/40 rounded-lg cursor-pointer transition-all group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-zinc-200 group-hover:text-amber-300 transition-colors">
                    {tip.title}
                  </span>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-zinc-900 rounded text-zinc-400">
                    {tip.category}
                  </span>
                </div>
                <div className="flex items-center justify-between bg-zinc-900 px-2 py-1 rounded border border-zinc-800 font-mono text-xs text-emerald-400 my-1.5">
                  <span className="truncate">{tip.commandOrSetting}</span>
                  {copiedCommand === tip.commandOrSetting ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-2" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300 shrink-0 ml-2" />
                  )}
                </div>
                <p className="text-[11px] text-zinc-400 leading-snug">{tip.description}</p>
                <div className="mt-1.5 text-[10px] text-amber-300/90 leading-tight">
                  <strong>RTX 3050 Note:</strong> {tip.rtx3050Recommendation}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Configuration Files Exporter (DefaultEngine.ini & DefaultScalability.ini) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* DefaultEngine.ini */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 shadow-xl flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-sky-400" />
                <h4 className="font-semibold text-sm text-zinc-200">DefaultEngine.ini Preset</h4>
              </div>
              <button
                onClick={() => handleCopy(DEFAULT_ENGINE_INI_CONFIG, 'engine')}
                className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-xs font-mono rounded flex items-center gap-1.5 cursor-pointer text-zinc-300"
              >
                {copiedIni === 'engine' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedIni === 'engine' ? 'Copied!' : 'Copy INI'}</span>
              </button>
            </div>
            <p className="text-xs text-zinc-400 mb-2">
              Place in <code className="text-amber-300">[ProjectDirectory]/Config/DefaultEngine.ini</code> to configure TSR 70%, Software Lumen, and 3500MB streaming pool.
            </p>
            <pre className="flex-1 bg-zinc-950 p-3 rounded-lg border border-zinc-800 font-mono text-[11px] text-zinc-300 overflow-x-auto leading-relaxed max-h-56">
              {DEFAULT_ENGINE_INI_CONFIG}
            </pre>
          </div>

          {/* DefaultScalability.ini */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 shadow-xl flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <h4 className="font-semibold text-sm text-zinc-200">DefaultScalability.ini Preset</h4>
              </div>
              <button
                onClick={() => handleCopy(DEFAULT_SCALABILITY_INI_CONFIG, 'scalability')}
                className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-xs font-mono rounded flex items-center gap-1.5 cursor-pointer text-zinc-300"
              >
                {copiedIni === 'scalability' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedIni === 'scalability' ? 'Copied!' : 'Copy INI'}</span>
              </button>
            </div>
            <p className="text-xs text-zinc-400 mb-2">
              Configures High Scalability Tier (Quality@2) to protect the 8GB VRAM envelope while keeping crisp Nanite visuals.
            </p>
            <pre className="flex-1 bg-zinc-950 p-3 rounded-lg border border-zinc-800 font-mono text-[11px] text-zinc-300 overflow-x-auto leading-relaxed max-h-56">
              {DEFAULT_SCALABILITY_INI_CONFIG}
            </pre>
          </div>
        </div>

        {/* Storage & SSD Workflow Strategy */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 shadow-xl">
          <div className="flex items-center gap-2 mb-3">
            <HardDrive className="w-5 h-5 text-emerald-400" />
            <h3 className="font-cinzel font-bold text-base text-zinc-100">
              Storage Architecture: SSD Active Project vs HDD Backup Strategy
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed text-zinc-300">
            <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800">
              <div className="font-bold text-amber-400 mb-1">High-Speed SSD (100–250 GB Free)</div>
              <ul className="list-disc list-inside space-y-1 text-zinc-400 text-[11px]">
                <li><strong className="text-zinc-200">Active .uproject directory:</strong> Fast level loading, immediate blueprint compilation.</li>
                <li><strong className="text-zinc-200">Derived Data Cache (DDC):</strong> UE5 writes gigabytes of compiled shader binaries here. Keeping on SSD prevents 30-minute freeze freezes.</li>
                <li><strong className="text-zinc-200">Working Content:</strong> Character animations, core materials, audio, test maps.</li>
              </ul>
            </div>

            <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800">
              <div className="font-bold text-sky-400 mb-1">Secondary HDD (Mass Storage & Archives)</div>
              <ul className="list-disc list-inside space-y-1 text-zinc-400 text-[11px]">
                <li><strong className="text-zinc-200">Full Project Backups:</strong> Nightly .zip archives of the project folder (excluding Intermediate / Saved).</li>
                <li><strong className="text-zinc-200">Raw Source Assets:</strong> High-poly 3D scans, Blender .blend files, uncompressed WAV foley files.</li>
                <li><strong className="text-zinc-200">Megascans Vault:</strong> Keep unused Quixel Megascans textures on HDD; import only needed items into SSD.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
