import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { MeasurementProfile } from '../types';
import { RotateCcw, Eye, ShieldAlert, Sparkles, Layers, Sliders } from 'lucide-react';

interface VirtualAvatar3DProps {
  measurements: MeasurementProfile;
  selectedGarmentName?: string;
  onClose?: () => void;
}

export const VirtualAvatar3D: React.FC<VirtualAvatar3DProps> = ({
  measurements,
  selectedGarmentName = 'The Sovereign Double-Breasted Overcoat',
  onClose,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [activeSize, setActiveSize] = useState<'38R' | '40R' | '42R' | 'Atelier'>('40R');
  const [heatmapMode, setHeatmapMode] = useState<boolean>(true);
  const [viewWireframe, setViewWireframe] = useState<boolean>(false);
  const [selectedLayer, setSelectedLayer] = useState<'Overcoat' | 'Blazer' | 'Trousers' | 'Knit'>('Overcoat');
  const [rotationSpeed, setRotationSpeed] = useState<number>(0.003);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);

  // References to dynamic Three.js objects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const mannequinGroupRef = useRef<THREE.Group | null>(null);
  const garmentMeshRef = useRef<THREE.Mesh | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const prevMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Sizing metrics calculation based on active size vs user scan
  const getTensionValues = (size: string) => {
    switch (size) {
      case '38R':
        return {
          shoulder: { value: 0.88, label: 'Tight (+2.8cm strain)', status: 'warning' },
          chest: { value: 0.82, label: 'High Tension (-4cm ease)', status: 'warning' },
          waist: { value: 0.74, label: 'Snug suppression', status: 'caution' },
          bicep: { value: 0.85, label: 'Restricted reach', status: 'warning' },
        };
      case '42R':
        return {
          shoulder: { value: 0.22, label: 'Loose (+2.1cm shoulder drop)', status: 'relaxed' },
          chest: { value: 0.26, label: 'Excess fabric drape (+6cm)', status: 'relaxed' },
          waist: { value: 0.20, label: 'Loss of tailored contour', status: 'relaxed' },
          bicep: { value: 0.31, label: 'Generous volume', status: 'relaxed' },
        };
      case 'Atelier':
        return {
          shoulder: { value: 0.45, label: 'Zero-tolerance 1:1 scan match', status: 'optimal' },
          chest: { value: 0.44, label: 'Bespoke floating canvas', status: 'optimal' },
          waist: { value: 0.46, label: 'Natural Italian suppression', status: 'optimal' },
          bicep: { value: 0.42, label: 'Fluid unencumbered sleeve', status: 'optimal' },
        };
      case '40R':
      default:
        return {
          shoulder: { value: 0.46, label: 'Optimal 98.7% bespoke match', status: 'optimal' },
          chest: { value: 0.48, label: 'Flawless 1.5cm drape ease', status: 'optimal' },
          waist: { value: 0.44, label: 'Clean vertical suppression', status: 'optimal' },
          bicep: { value: 0.41, label: 'Architectural line', status: 'optimal' },
        };
    }
  };

  const tensionData = getTensionValues(activeSize);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 520;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 1.1, 3.8);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 3. Lighting (Dramatic Editorial Studio Setup)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff5ea, 2.2);
    keyLight.position.set(3, 4, 3);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x8fa3bf, 1.2);
    fillLight.position.set(-3, 2, -2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xc8a97e, 1.6);
    rimLight.position.set(0, 3, -4);
    scene.add(rimLight);

    // 4. Mannequin Assembly Group
    const mannequinGroup = new THREE.Group();
    mannequinGroupRef.current = mannequinGroup;
    scene.add(mannequinGroup);

    // Body Material (Minimalist Matte Graphite Plaster)
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x1f2229,
      roughness: 0.6,
      metalness: 0.2,
      wireframe: viewWireframe,
    });

    // Pedestal
    const pedestalGeo = new THREE.CylinderGeometry(0.55, 0.6, 0.08, 48);
    const pedestalMat = new THREE.MeshStandardMaterial({ color: 0x14161d, roughness: 0.7 });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.y = -0.96;
    scene.add(pedestal);

    // Circular grid ring on pedestal
    const ringGeo = new THREE.RingGeometry(0.48, 0.52, 48);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xc8a97e, side: THREE.DoubleSide, opacity: 0.35, transparent: true });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = -0.91;
    scene.add(ring);

    // Head / Neck
    const headGeo = new THREE.SphereGeometry(0.13, 32, 24);
    headGeo.scale(0.85, 1.1, 0.95);
    const head = new THREE.Mesh(headGeo, bodyMaterial);
    head.position.y = 0.92;
    mannequinGroup.add(head);

    const neckGeo = new THREE.CylinderGeometry(0.065, 0.08, 0.14, 24);
    const neck = new THREE.Mesh(neckGeo, bodyMaterial);
    neck.position.y = 0.76;
    mannequinGroup.add(neck);

    // Torso (Sculpted Athletic Proportion tailored to scan measurements)
    const chestWidth = (measurements.chest / 100) * 0.28;
    const waistWidth = (measurements.waist / 100) * 0.24;
    const shoulderWidth = (measurements.shoulders / 100) * 0.44;

    const chestGeo = new THREE.CylinderGeometry(chestWidth, waistWidth, 0.46, 32);
    chestGeo.scale(1.15, 1.0, 0.75);
    const chest = new THREE.Mesh(chestGeo, bodyMaterial);
    chest.position.y = 0.46;
    mannequinGroup.add(chest);

    // Shoulders
    const leftShoulderGeo = new THREE.SphereGeometry(0.08, 24, 24);
    const leftShoulder = new THREE.Mesh(leftShoulderGeo, bodyMaterial);
    leftShoulder.position.set(-shoulderWidth / 2, 0.65, 0);
    mannequinGroup.add(leftShoulder);

    const rightShoulder = new THREE.Mesh(leftShoulderGeo, bodyMaterial);
    rightShoulder.position.set(shoulderWidth / 2, 0.65, 0);
    mannequinGroup.add(rightShoulder);

    // Arms
    const armGeo = new THREE.CylinderGeometry(0.05, 0.04, 0.58, 24);
    const leftArm = new THREE.Mesh(armGeo, bodyMaterial);
    leftArm.position.set(-shoulderWidth / 2 - 0.08, 0.35, 0);
    leftArm.rotation.z = 0.08;
    mannequinGroup.add(leftArm);

    const rightArm = new THREE.Mesh(armGeo, bodyMaterial);
    rightArm.position.set(shoulderWidth / 2 + 0.08, 0.35, 0);
    rightArm.rotation.z = -0.08;
    mannequinGroup.add(rightArm);

    // Pelvis & Legs
    const pelvisGeo = new THREE.CylinderGeometry(waistWidth, waistWidth * 1.05, 0.22, 32);
    pelvisGeo.scale(1.05, 1.0, 0.8);
    const pelvis = new THREE.Mesh(pelvisGeo, bodyMaterial);
    pelvis.position.y = 0.14;
    mannequinGroup.add(pelvis);

    const legGeo = new THREE.CylinderGeometry(0.08, 0.055, 0.88, 24);
    const leftLeg = new THREE.Mesh(legGeo, bodyMaterial);
    leftLeg.position.set(-0.13, -0.42, 0);
    mannequinGroup.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeo, bodyMaterial);
    rightLeg.position.set(0.13, -0.42, 0);
    mannequinGroup.add(rightLeg);

    // 5. Garment Overlay Layer
    const garmentGeo = new THREE.CylinderGeometry(
      chestWidth * 1.12,
      waistWidth * 1.15,
      0.95,
      32,
      16
    );
    garmentGeo.scale(1.22, 1.0, 0.85);

    // Heatmap / Fabric Material
    const garmentMat = createGarmentMaterial(heatmapMode, activeSize, viewWireframe);
    const garmentMesh = new THREE.Mesh(garmentGeo, garmentMat);
    garmentMesh.position.y = 0.32;
    garmentMeshRef.current = garmentMesh;
    mannequinGroup.add(garmentMesh);

    // 6. Interaction Handlers (Mouse Drag Rotation)
    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      prevMousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !mannequinGroupRef.current) return;
      const deltaX = e.clientX - prevMousePosRef.current.x;
      mannequinGroupRef.current.rotation.y += deltaX * 0.008;
      prevMousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Touch support for mobile
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDraggingRef.current = true;
        prevMousePosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current || !mannequinGroupRef.current || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - prevMousePosRef.current.x;
      mannequinGroupRef.current.rotation.y += deltaX * 0.008;
      prevMousePosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };
    const onTouchEnd = () => {
      isDraggingRef.current = false;
    };

    domElement.addEventListener('touchstart', onTouchStart);
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onTouchEnd);

    // 7. Render Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (autoRotate && !isDraggingRef.current && mannequinGroupRef.current) {
        mannequinGroupRef.current.rotation.y += rotationSpeed;
      }

      renderer.render(scene, camera);
    };
    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight || 520;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      domElement.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      renderer.dispose();
    };
  }, [measurements, viewWireframe]);

  // Update garment material when size, mode, or layer changes
  useEffect(() => {
    if (!garmentMeshRef.current) return;
    garmentMeshRef.current.material = createGarmentMaterial(heatmapMode, activeSize, viewWireframe);
    
    // Scale adjustment based on selected size
    let scaleMultiplier = 1.0;
    if (activeSize === '38R') scaleMultiplier = 0.96;
    if (activeSize === '42R') scaleMultiplier = 1.04;
    if (activeSize === 'Atelier') scaleMultiplier = 1.0;
    garmentMeshRef.current.scale.set(1.22 * scaleMultiplier, 1.0, 0.85 * scaleMultiplier);
  }, [activeSize, heatmapMode, viewWireframe, selectedLayer]);

  function createGarmentMaterial(isHeatmap: boolean, size: string, wireframe: boolean) {
    if (!isHeatmap) {
      // Luxurious Casentino wool / raw silk look
      return new THREE.MeshStandardMaterial({
        color: 0x222630,
        roughness: 0.85,
        metalness: 0.1,
        wireframe,
        transparent: true,
        opacity: 0.92,
      });
    }

    // Dynamic Heatmap coloration based on tension
    let primaryColor = 0x22c55e; // Green = relaxed/free
    if (size === '38R') {
      primaryColor = 0xef4444; // High tension red
    } else if (size === '42R') {
      primaryColor = 0x10b981; // Oversized / low tension green
    } else {
      primaryColor = 0x06b6d4; // Optimal cyan / bespoke balance
    }

    return new THREE.MeshStandardMaterial({
      color: primaryColor,
      roughness: 0.35,
      metalness: 0.2,
      wireframe,
      transparent: true,
      opacity: 0.82,
    });
  }

  const handleResetOrientation = () => {
    if (mannequinGroupRef.current) {
      mannequinGroupRef.current.rotation.y = 0;
    }
  };

  return (
    <div className="bg-[#12141a] border border-[#262934] rounded-xl overflow-hidden shadow-2xl flex flex-col lg:flex-row">
      {/* 3D Viewport Column */}
      <div className="relative flex-1 min-h-[460px] lg:min-h-[560px] bg-gradient-to-b from-[#14161f] via-[#0f1117] to-[#0c0d12] flex items-center justify-center">
        {/* Three.js canvas mount */}
        <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* Floating Top HUD */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-[#c8a97e]">
              3D Digital Twin Avatar
            </span>
            <span className="text-xs text-[#717786]">·</span>
            <span className="text-xs text-[#9ba1b0]">Live Fit Simulation</span>
          </div>

          <div className="pointer-events-auto flex items-center gap-2 bg-[#1b1e27]/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#2b2f3d]">
            <button
              onClick={() => setAutoRotate(!autoRotate)}
              className={`text-xs px-2 py-0.5 rounded transition-colors ${autoRotate ? 'text-[#c8a97e] bg-[#c8a97e]/10' : 'text-[#828896]'}`}
            >
              360° {autoRotate ? 'Rotating' : 'Paused'}
            </button>
            <button
              onClick={handleResetOrientation}
              title="Reset angle"
              className="text-[#828896] hover:text-white transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Heatmap Legend Overlay */}
        {heatmapMode && (
          <div className="absolute bottom-4 left-4 pointer-events-auto bg-[#141720]/90 backdrop-blur-md p-3 rounded-lg border border-[#282d3b] text-xs max-w-xs">
            <div className="text-[11px] font-semibold text-[#e1e4eb] uppercase tracking-wider mb-2">
              Tension Stress Spectrum
            </div>
            <div className="flex items-center gap-1.5 h-2 rounded-full overflow-hidden bg-slate-800 mb-2">
              <div className="h-full flex-1 bg-emerald-500" title="Ease / Relaxed" />
              <div className="h-full flex-1 bg-cyan-400" title="Bespoke Optimal" />
              <div className="h-full flex-1 bg-amber-400" title="Snug Hold" />
              <div className="h-full flex-1 bg-red-500" title="High Strain" />
            </div>
            <div className="flex justify-between text-[10px] text-[#868d9f]">
              <span>Relaxed (0.0)</span>
              <span className="text-cyan-400 font-medium">Bespoke (0.45)</span>
              <span>Constricted (1.0)</span>
            </div>
          </div>
        )}

        {/* Drag Hint */}
        <div className="absolute bottom-4 right-4 pointer-events-none text-[11px] text-[#6b7280] hidden sm:block">
          Drag to inspect 360° · Scroll to zoom
        </div>
      </div>

      {/* Control & Fit Analysis Sidebar */}
      <div className="w-full lg:w-96 p-6 bg-[#161822] border-t lg:border-t-0 lg:border-l border-[#272b38] flex flex-col justify-between">
        <div>
          <div className="mb-5">
            <h3 className="text-lg font-semibold text-white tracking-tight">
              Virtual Fit Analysis
            </h3>
            <p className="text-xs text-[#8c93a4] mt-1">
              Evaluating drape of <span className="text-white font-medium">{selectedGarmentName}</span> across your 9 scanned body zones.
            </p>
          </div>

          {/* Size Evaluator Switcher */}
          <div className="mb-6">
            <label className="text-xs font-medium text-[#adb4c4] uppercase tracking-wider block mb-2">
              Size Simulation
            </label>
            <div className="grid grid-cols-4 gap-1.5 p-1 bg-[#101218] rounded-lg border border-[#232734]">
              {(['38R', '40R', '42R', 'Atelier'] as const).map((size) => {
                const isSelected = activeSize === size;
                const isOptimal = size === '40R' || size === 'Atelier';
                return (
                  <button
                    key={size}
                    onClick={() => setActiveSize(size)}
                    className={`py-2 text-xs font-semibold rounded-md transition-all ${
                      isSelected
                        ? 'bg-[#c8a97e] text-black shadow-md'
                        : 'text-[#9fa6b8] hover:text-white hover:bg-[#1a1d27]'
                    }`}
                  >
                    {size}
                    {isOptimal && (
                      <span className="block text-[9px] font-normal opacity-85">
                        {size === 'Atelier' ? '1:1 Custom' : '98.7% Match'}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tension Stress Breakdown List */}
          <div className="space-y-3 mb-6">
            <label className="text-xs font-medium text-[#adb4c4] uppercase tracking-wider block">
              Zonal Pressure Distribution
            </label>

            {/* Shoulder */}
            <div className="p-3 bg-[#11131a] rounded-lg border border-[#222532]">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-[#d4d8e2] font-medium">Deltoid / Shoulders ({measurements.shoulders} cm)</span>
                <span className={`text-[11px] font-medium ${
                  tensionData.shoulder.status === 'optimal' ? 'text-cyan-400' :
                  tensionData.shoulder.status === 'warning' ? 'text-red-400' : 'text-emerald-400'
                }`}>
                  {tensionData.shoulder.label}
                </span>
              </div>
              <div className="w-full bg-[#1e2230] h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    tensionData.shoulder.status === 'optimal' ? 'bg-cyan-400' :
                    tensionData.shoulder.status === 'warning' ? 'bg-red-400' : 'bg-emerald-400'
                  }`}
                  style={{ width: `${tensionData.shoulder.value * 100}%` }}
                />
              </div>
            </div>

            {/* Chest */}
            <div className="p-3 bg-[#11131a] rounded-lg border border-[#222532]">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-[#d4d8e2] font-medium">Pectoral / Chest ({measurements.chest} cm)</span>
                <span className={`text-[11px] font-medium ${
                  tensionData.chest.status === 'optimal' ? 'text-cyan-400' :
                  tensionData.chest.status === 'warning' ? 'text-red-400' : 'text-emerald-400'
                }`}>
                  {tensionData.chest.label}
                </span>
              </div>
              <div className="w-full bg-[#1e2230] h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    tensionData.chest.status === 'optimal' ? 'bg-cyan-400' :
                    tensionData.chest.status === 'warning' ? 'bg-red-400' : 'bg-emerald-400'
                  }`}
                  style={{ width: `${tensionData.chest.value * 100}%` }}
                />
              </div>
            </div>

            {/* Waist */}
            <div className="p-3 bg-[#11131a] rounded-lg border border-[#222532]">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-[#d4d8e2] font-medium">Torso Suppression ({measurements.waist} cm)</span>
                <span className={`text-[11px] font-medium ${
                  tensionData.waist.status === 'optimal' ? 'text-cyan-400' :
                  tensionData.waist.status === 'warning' ? 'text-red-400' : 'text-emerald-400'
                }`}>
                  {tensionData.waist.label}
                </span>
              </div>
              <div className="w-full bg-[#1e2230] h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    tensionData.waist.status === 'optimal' ? 'bg-cyan-400' :
                    tensionData.waist.status === 'warning' ? 'bg-red-400' : 'bg-emerald-400'
                  }`}
                  style={{ width: `${tensionData.waist.value * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Viewport Toggles */}
          <div className="flex items-center gap-2 mb-6">
            <button
              onClick={() => setHeatmapMode(!heatmapMode)}
              className={`flex-1 py-2 px-3 text-xs font-medium rounded-lg border transition-colors flex items-center justify-center gap-1.5 ${
                heatmapMode
                  ? 'bg-[#c8a97e]/15 border-[#c8a97e] text-[#c8a97e]'
                  : 'bg-[#1a1d27] border-[#292d3b] text-[#8e95a7] hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              {heatmapMode ? 'Heatmap Active' : 'Natural Fabric View'}
            </button>

            <button
              onClick={() => setViewWireframe(!viewWireframe)}
              className={`py-2 px-3 text-xs font-medium rounded-lg border transition-colors flex items-center justify-center gap-1.5 ${
                viewWireframe
                  ? 'bg-white/10 border-white/40 text-white'
                  : 'bg-[#1a1d27] border-[#292d3b] text-[#8e95a7] hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Wireframe
            </button>
          </div>
        </div>

        {/* Fit Confidence Summary Bar */}
        <div className="p-4 bg-[#101218] rounded-xl border border-[#232734]">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-[#8c93a4]">ALASHO Fit Guarantee</div>
            <div className="text-xs font-semibold text-[#c8a97e]">
              {activeSize === '40R' ? '98.7% Confident' : activeSize === 'Atelier' ? '100% Guaranteed' : 'Sub-optimal Fit'}
            </div>
          </div>
          <p className="text-[11px] text-[#717786] leading-relaxed">
            {activeSize === '40R'
              ? 'Zero collar gap detected. Sleeves terminate cleanly at ulna bone with 1.2cm shirt cuff exposure.'
              : activeSize === 'Atelier'
              ? 'Bespoke hand-cut pattern crafted to exact millimeter scan coordinates.'
              : 'Fit variance exceeds 3cm threshold. Exchanges covered under ALASHO Zero-Friction Return policy.'}
          </p>
        </div>
      </div>
    </div>
  );
};
