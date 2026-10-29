import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { InventoryItem } from '../../types/game';
import { X, Sparkles, Compass, Shield, Scroll, RotateCcw, Weight, Award } from 'lucide-react';
import { soundManager } from '../../utils/audio';

interface ItemInspectorModalProps {
  items: InventoryItem[];
  selectedItem: InventoryItem | null;
  onSelectItem: (item: InventoryItem) => void;
  onClose: () => void;
}

export const ItemInspectorModal: React.FC<ItemInspectorModalProps> = ({
  items,
  selectedItem,
  onSelectItem,
  onClose,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const activeItem = selectedItem || items[0] || null;

  // 3D Inspector Viewport for active artifact
  useEffect(() => {
    const container = mountRef.current;
    if (!container || !activeItem) return;

    const width = container.clientWidth || 300;
    const height = container.clientHeight || 300;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0e0e12);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 4.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // Studio Lighting
    const keyLight = new THREE.DirectionalLight(0xfffaed, 2.5);
    keyLight.position.set(3, 4, 3);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x7799bb, 1.2);
    fillLight.position.set(-3, -2, -2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffaa44, 2.0);
    rimLight.position.set(0, 3, -4);
    scene.add(rimLight);

    // Generate 3D Artifact Mesh based on modelType
    const itemGroup = new THREE.Group();

    if (activeItem.modelType === 'sunstone') {
      const coreGeo = new THREE.DodecahedronGeometry(0.9, 0);
      const coreMat = new THREE.MeshStandardMaterial({
        color: 0xffaa22,
        emissive: 0xff7700,
        emissiveIntensity: 1.2,
        metalness: 0.95,
        roughness: 0.15,
      });
      const core = new THREE.Mesh(coreGeo, coreMat);
      itemGroup.add(core);

      const ringGeo = new THREE.TorusGeometry(1.4, 0.06, 12, 32);
      const ringMat = new THREE.MeshStandardMaterial({ color: 0xffdd66, metalness: 0.9, roughness: 0.2 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 3;
      itemGroup.add(ring);
    } else if (activeItem.modelType === 'compass') {
      // Brass navigator compass body
      const bodyGeo = new THREE.CylinderGeometry(1.1, 1.1, 0.35, 24);
      const brassMat = new THREE.MeshStandardMaterial({ color: 0xc8963e, metalness: 0.88, roughness: 0.25 });
      const body = new THREE.Mesh(bodyGeo, brassMat);
      body.rotation.x = Math.PI / 4;
      itemGroup.add(body);

      // Glass cover
      const glassGeo = new THREE.CylinderGeometry(1.0, 1.0, 0.08, 24);
      const glassMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.45,
        roughness: 0.05,
      });
      const glass = new THREE.Mesh(glassGeo, glassMat);
      glass.rotation.x = Math.PI / 4;
      glass.position.set(0, 0.1, 0.1);
      itemGroup.add(glass);

      // Needle
      const needleGeo = new THREE.ConeGeometry(0.18, 1.3, 4);
      const needleMat = new THREE.MeshStandardMaterial({ color: 0xcc2222, metalness: 0.7, roughness: 0.3 });
      const needle = new THREE.Mesh(needleGeo, needleMat);
      needle.position.set(0, 0.1, 0.15);
      needle.rotation.x = Math.PI / 4;
      needle.rotation.z = Math.PI / 6;
      itemGroup.add(needle);
    } else {
      // Ancient stone tablet / generic relic
      const tabletGeo = new THREE.BoxGeometry(1.2, 1.7, 0.25);
      const stoneMat = new THREE.MeshStandardMaterial({ color: 0x5a5a60, roughness: 0.85, metalness: 0.1 });
      const tablet = new THREE.Mesh(tabletGeo, stoneMat);
      itemGroup.add(tablet);
    }

    scene.add(itemGroup);

    // Mouse drag rotation for 3D inspection
    let isDragging = false;
    let prevX = 0;
    let prevY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevX = e.clientX;
      prevY = e.clientY;
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevX;
      const dy = e.clientY - prevY;
      itemGroup.rotation.y += dx * 0.015;
      itemGroup.rotation.x += dy * 0.015;
      prevX = e.clientX;
      prevY = e.clientY;
    };
    const onMouseUp = () => {
      isDragging = false;
    };

    const canvasElem = renderer.domElement;
    canvasElem.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    let frameId = 0;
    function animate() {
      frameId = requestAnimationFrame(animate);
      if (!isDragging) {
        itemGroup.rotation.y += 0.008;
      }
      renderer.render(scene, camera);
    }
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      canvasElem.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [activeItem]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none font-sans">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/80">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-cinzel font-bold text-zinc-100">Explorer's Backpack & 3D Relic Inspector</h2>
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

        {/* Modal Body: Two Columns */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12 gap-0 divide-y md:divide-y-0 md:divide-x divide-zinc-800">
          {/* Left Column: Inventory Grid (5 cols) */}
          <div className="md:col-span-5 p-5 space-y-4 bg-zinc-950/40">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-400 uppercase tracking-wider font-semibold">Collected Artifacts</span>
              <span className="text-amber-400 font-bold">{items.length} Items</span>
            </div>

            {items.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 text-xs italic border border-dashed border-zinc-800 rounded-xl">
                No artifacts collected yet. Explore the valley ruins and open ancient chests!
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2.5">
                {items.map((item) => {
                  const isSelected = item.id === activeItem?.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        soundManager.playUiClick();
                        onSelectItem(item);
                      }}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-amber-500/10 border-amber-500/60 shadow-md'
                          : 'bg-zinc-900/60 border-zinc-800/80 hover:bg-zinc-900 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center text-amber-400">
                          {item.modelType === 'compass' ? <Compass className="w-5 h-5 text-cyan-400" /> : <Sparkles className="w-5 h-5 text-amber-400" />}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-zinc-200">{item.name}</div>
                          <div className="text-[10px] text-zinc-400 font-mono">
                            {item.category} • <span className="text-amber-400">{item.rarity}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right text-[11px] font-mono text-zinc-400">
                        <div>{item.weight} kg</div>
                        <div className="text-[9px] text-zinc-500">x{item.quantity}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Encumbrance bar */}
            <div className="pt-3 border-t border-zinc-800 text-xs font-mono">
              <div className="flex justify-between text-zinc-400 mb-1">
                <span>Total Weight:</span>
                <span className="text-zinc-200 font-bold">
                  {items.reduce((acc, i) => acc + i.weight * i.quantity, 0).toFixed(1)} / 40.0 kg
                </span>
              </div>
              <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden border border-zinc-800">
                <div
                  className="bg-amber-500 h-full transition-all"
                  style={{
                    width: `${Math.min(100, (items.reduce((acc, i) => acc + i.weight * i.quantity, 0) / 40) * 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Right Column: 3D Artifact Inspection Viewport & Lore Details (7 cols) */}
          <div className="md:col-span-7 p-6 flex flex-col justify-between bg-zinc-900/80">
            {activeItem ? (
              <div className="space-y-4">
                {/* 3D Viewport */}
                <div className="relative w-full h-64 rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 shadow-inner">
                  <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
                  <div className="absolute bottom-2 left-3 pointer-events-none text-[10px] font-mono text-zinc-500 flex items-center gap-1.5">
                    <RotateCcw className="w-3 h-3 text-amber-400" /> Drag to inspect 3D artifact
                  </div>
                </div>

                {/* Lore & Details */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-mono uppercase font-bold">
                      {activeItem.rarity} {activeItem.category}
                    </span>
                    <span className="text-[11px] font-mono text-zinc-400">Found: {activeItem.discoveredAt}</span>
                  </div>
                  <h3 className="text-xl font-cinzel font-bold text-zinc-100">{activeItem.name}</h3>
                  <p className="text-xs text-zinc-300 mt-2 leading-relaxed">{activeItem.description}</p>

                  <div className="mt-3 p-3 rounded-lg bg-zinc-950 border border-amber-500/30 text-xs italic text-amber-200/90 leading-relaxed">
                    "{activeItem.lore}"
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-zinc-500 text-xs italic">
                Select an artifact to examine in 3D.
              </div>
            )}

            <div className="pt-4 border-t border-zinc-800/80 text-[11px] text-zinc-500 font-mono flex items-center justify-between">
              <span>UE5 Architecture: SceneCaptureComponent2D</span>
              <span className="text-amber-400">PBR Metallic Workflow</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
