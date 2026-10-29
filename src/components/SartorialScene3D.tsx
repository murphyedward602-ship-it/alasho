import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { Eye, ChevronDown, ChevronUp, Sliders, Layers, Sun, Camera, RotateCcw } from 'lucide-react';

interface SartorialScene3DProps {
  onBackToApp?: () => void;
}

export const SartorialScene3D: React.FC<SartorialScene3DProps> = ({ onBackToApp }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isDockCollapsed, setIsDockCollapsed] = useState(false);
  const [explodedAmount, setExplodedAmount] = useState(0); // 0 to 1
  const [activeFinish, setActiveFinish] = useState<'casentino' | 'silk' | 'fresco'>('casentino');
  const [lightingPreset, setLightingPreset] = useState<'runway' | 'daylight' | 'lounge'>('runway');
  const [cameraPreset, setCameraPreset] = useState<'front' | 'threeQuarter' | 'macro'>('threeQuarter');

  // Three.js object references for lossless per-frame updates
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const mannequinPartsRef = useRef<{
    torso: THREE.Mesh;
    canvasPiece: THREE.Mesh;
    lapels: THREE.Group;
    collar: THREE.Mesh;
    shoulders: THREE.Group;
    buckles: THREE.Group;
  } | null>(null);
  const explodedTargetRef = useRef(0);
  const cameraTargetPos = useRef(new THREE.Vector3(0, 1.2, 3.8));
  const isDraggingRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const mannequinGroupRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth || 800;
    const height = container.clientHeight || (window.innerHeight - 80) || 600;

    // Detect software WebGL safely
    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return false;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch (e) {
        return false;
      }
    })();

    // 1. Scene, Fog, Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0c10);
    scene.fog = new THREE.Fog(0x0a0c10, 4, 14);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 3.8);
    cameraRef.current = camera;

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 3. Studio Environment Reflection via RoomEnvironment & PMREMGenerator
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 4. Studio Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0xe5ecf6, 0x1a1e28, 0.8);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff3e0, 2.4);
    keyLight.position.set(3.5, 4.5, 3.5);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xc8a97e, 1.8);
    rimLight.position.set(-3.5, 3, -3);
    scene.add(rimLight);

    // Ground Plane with contact shadow
    const floorGeo = new THREE.PlaneGeometry(16, 16);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0c0e14,
      roughness: 0.85,
      metalness: 0.1,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.95;
    floor.receiveShadow = !isSoftwareGl;
    scene.add(floor);

    // Contact shadow radial disk
    const shadowGeo = new THREE.RingGeometry(0.01, 0.75, 32);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide,
    });
    const contactShadow = new THREE.Mesh(shadowGeo, shadowMat);
    contactShadow.rotation.x = -Math.PI / 2;
    contactShadow.position.y = -0.94;
    scene.add(contactShadow);

    // 5. Composite 8-Part Procedural Model (THREE.Group)
    const mannequinGroup = new THREE.Group();
    mannequinGroupRef.current = mannequinGroup;
    scene.add(mannequinGroup);

    // Shared Materials
    const darkWoolMat = new THREE.MeshPhysicalMaterial({
      color: 0x181a22,
      roughness: 0.85,
      metalness: 0.05,
      clearcoat: 0.1,
    });

    const canvasHorsehairMat = new THREE.MeshStandardMaterial({
      color: 0x8a7b64,
      roughness: 0.9,
      metalness: 0.1,
      wireframe: false,
    });

    const brassMat = new THREE.MeshPhysicalMaterial({
      color: 0xd4af37,
      roughness: 0.25,
      metalness: 0.9,
      anisotropy: 0.8,
    });

    const marbleMat = new THREE.MeshStandardMaterial({
      color: 0x12141c,
      roughness: 0.4,
      metalness: 0.2,
    });

    // Part 1: Plinth Pedestal
    const pedestalGeo = new THREE.CylinderGeometry(0.5, 0.55, 0.12, 36);
    const pedestal = new THREE.Mesh(pedestalGeo, marbleMat);
    pedestal.position.y = -0.88;
    pedestal.castShadow = !isSoftwareGl;
    pedestal.receiveShadow = !isSoftwareGl;
    mannequinGroup.add(pedestal);

    // Part 2: Primary Anatomical Torso Core
    const torsoGeo = new THREE.CylinderGeometry(0.32, 0.23, 0.9, 32);
    torsoGeo.scale(1.18, 1.0, 0.72);
    const torso = new THREE.Mesh(torsoGeo, darkWoolMat);
    torso.position.y = 0.25;
    torso.castShadow = !isSoftwareGl;
    mannequinGroup.add(torso);

    // Part 3: Floating Horsehair Chest Canvas (Explodable Layer)
    const canvasGeo = new THREE.CylinderGeometry(0.335, 0.245, 0.7, 32, 8, true, -Math.PI * 0.45, Math.PI * 0.9);
    canvasGeo.scale(1.2, 1.0, 0.76);
    const canvasPiece = new THREE.Mesh(canvasGeo, canvasHorsehairMat);
    canvasPiece.position.set(0, 0.35, 0.02);
    mannequinGroup.add(canvasPiece);

    // Part 4: Lapel Structure Group (Left & Right Neapolitan Peak Rolls)
    const lapelsGroup = new THREE.Group();
    const lapelGeo = new THREE.BoxGeometry(0.12, 0.5, 0.02);
    const leftLapel = new THREE.Mesh(lapelGeo, darkWoolMat);
    leftLapel.position.set(-0.16, 0.38, 0.19);
    leftLapel.rotation.set(0.1, 0.2, -0.22);
    lapelsGroup.add(leftLapel);

    const rightLapel = new THREE.Mesh(lapelGeo, darkWoolMat);
    rightLapel.position.set(0.16, 0.38, 0.19);
    rightLapel.rotation.set(0.1, -0.2, 0.22);
    lapelsGroup.add(rightLapel);
    mannequinGroup.add(lapelsGroup);

    // Part 5: Collar Band Assembly
    const collarGeo = new THREE.TorusGeometry(0.13, 0.025, 16, 32, Math.PI * 1.5);
    collarGeo.scale(0.85, 1.0, 1.0);
    const collar = new THREE.Mesh(collarGeo, darkWoolMat);
    collar.position.set(0, 0.72, 0.02);
    collar.rotation.x = Math.PI / 2 + 0.15;
    mannequinGroup.add(collar);

    // Part 6: Articulated Spalla Camicia Shoulder Rigs
    const shouldersGroup = new THREE.Group();
    const shoulderGeo = new THREE.SphereGeometry(0.1, 16, 16);
    shoulderGeo.scale(1.2, 0.8, 0.9);
    const leftSh = new THREE.Mesh(shoulderGeo, darkWoolMat);
    leftSh.position.set(-0.38, 0.62, 0);
    shouldersGroup.add(leftSh);

    const rightSh = new THREE.Mesh(shoulderGeo, darkWoolMat);
    rightSh.position.set(0.38, 0.62, 0);
    shouldersGroup.add(rightSh);
    mannequinGroup.add(shouldersGroup);

    // Part 7: Brass Side-Buckle Hardware Adjusters
    const bucklesGroup = new THREE.Group();
    const buckleGeo = new THREE.TorusGeometry(0.03, 0.008, 12, 24);
    const leftBuckle = new THREE.Mesh(buckleGeo, brassMat);
    leftBuckle.position.set(-0.25, -0.05, 0.05);
    leftBuckle.rotation.y = Math.PI / 2;
    bucklesGroup.add(leftBuckle);

    const rightBuckle = new THREE.Mesh(buckleGeo, brassMat);
    rightBuckle.position.set(0.25, -0.05, 0.05);
    rightBuckle.rotation.y = -Math.PI / 2;
    bucklesGroup.add(rightBuckle);
    mannequinGroup.add(bucklesGroup);

    // Store parts ref for exploded view animation
    mannequinPartsRef.current = {
      torso,
      canvasPiece,
      lapels: lapelsGroup,
      collar,
      shoulders: shouldersGroup,
      buckles: bucklesGroup,
    };

    // 6. Interactive Mouse & Touch Drag Rotation
    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      prevMouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !mannequinGroupRef.current) return;
      const dx = e.clientX - prevMouseRef.current.x;
      mannequinGroupRef.current.rotation.y += dx * 0.006;
      prevMouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // 7. Lossless 60fps Loop with Exponential Damping
    const clock = new THREE.Clock();
    let frameId = 0;

    const tick = () => {
      frameId = requestAnimationFrame(tick);
      const delta = Math.min(clock.getDelta(), 0.05);

      // Smooth camera position damping
      if (cameraRef.current) {
        cameraRef.current.position.lerp(cameraTargetPos.current, 0.06);
        cameraRef.current.lookAt(0, 0.35, 0);
      }

      // Smooth exploded view damping
      const parts = mannequinPartsRef.current;
      if (parts) {
        const target = explodedTargetRef.current;
        const currentExplode = parts.canvasPiece.position.z - 0.02;
        const newExplode = THREE.MathUtils.damp(currentExplode, target * 0.28, 4.0, delta);

        parts.canvasPiece.position.z = 0.02 + newExplode;
        parts.lapels.position.z = newExplode * 1.5;
        parts.lapels.position.y = newExplode * 0.3;
        parts.collar.position.y = 0.72 + newExplode * 0.6;
        parts.shoulders.position.x = newExplode * 0.4;
      }

      // Gentle idle turntable if not dragging
      if (!isDraggingRef.current && mannequinGroupRef.current) {
        mannequinGroupRef.current.rotation.y += 0.002;
      }

      renderer.render(scene, camera);
    };
    tick();

    // Resize Handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth || window.innerWidth || 800;
      const h = container.clientHeight || (window.innerHeight - 80) || 600;
      camera.aspect = w / (h || 1);
      camera.updateProjectionMatrix();
      renderer.setSize(w, h || 1);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      renderer.dispose();
    };
  }, []);

  // Update Exploded Target when slider moves
  useEffect(() => {
    explodedTargetRef.current = explodedAmount;
  }, [explodedAmount]);

  // Update Camera Target Preset
  useEffect(() => {
    if (cameraPreset === 'front') {
      cameraTargetPos.current.set(0, 0.6, 3.4);
    } else if (cameraPreset === 'macro') {
      cameraTargetPos.current.set(-0.4, 0.75, 1.6);
    } else {
      cameraTargetPos.current.set(1.5, 1.2, 3.2);
    }
  }, [cameraPreset]);

  // Update Fabric Finish Swatch
  useEffect(() => {
    const parts = mannequinPartsRef.current;
    if (!parts) return;

    if (activeFinish === 'casentino') {
      (parts.torso.material as THREE.MeshPhysicalMaterial).color.set(0x191a22);
      (parts.torso.material as THREE.MeshPhysicalMaterial).roughness = 0.88;
    } else if (activeFinish === 'silk') {
      (parts.torso.material as THREE.MeshPhysicalMaterial).color.set(0x131826);
      (parts.torso.material as THREE.MeshPhysicalMaterial).roughness = 0.35;
      (parts.torso.material as THREE.MeshPhysicalMaterial).metalness = 0.3;
    } else {
      (parts.torso.material as THREE.MeshPhysicalMaterial).color.set(0x272b22);
      (parts.torso.material as THREE.MeshPhysicalMaterial).roughness = 0.65;
    }
  }, [activeFinish]);

  return (
    <div className="relative w-full h-[88vh] min-h-[640px] bg-[#090b0f] overflow-hidden rounded-2xl border border-[#212433]">
      {/* 3D WebGL Canvas Viewport (100% Unobstructed) */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Spec & Nav Overlay */}
      <div className="absolute top-5 left-5 right-5 flex items-center justify-between pointer-events-none z-20">
        <div className="pointer-events-auto bg-[#10121a] px-4 py-2 rounded-xl border border-[#232736] flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-[#c8a97e]" />
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-white">
              Sartorial 3D Atelier Scene
            </div>
            <div className="text-[10px] text-[#7d8496]">
              Studio PBR · RoomEnvironment Reflection · 60fps
            </div>
          </div>
        </div>

        {onBackToApp && (
          <button
            onClick={onBackToApp}
            className="pointer-events-auto px-4 py-2 text-xs font-semibold bg-[#1a1d28] hover:bg-[#25293a] text-white border border-[#2d3244] rounded-lg transition-colors"
          >
            ← Return to Collection
          </button>
        )}
      </div>

      {/* Viewport-First Collapsible Bottom Dock (<= 15% footprint) */}
      <div
        className={`absolute bottom-5 left-1/2 -translate-x-1/2 w-[92%] max-w-4xl transition-transform duration-300 z-30 ${
          isDockCollapsed ? 'translate-y-[calc(100%-42px)]' : 'translate-y-0'
        }`}
      >
        <div className="flex justify-center mb-1">
          <button
            onClick={() => setIsDockCollapsed(!isDockCollapsed)}
            className="px-4 py-1.5 text-[11px] font-semibold bg-[#13151f] hover:bg-[#1c1f2d] text-[#c8a97e] border border-[#272b3c] rounded-t-lg transition-colors flex items-center gap-1.5 shadow-lg"
          >
            {isDockCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            <span>{isDockCollapsed ? 'Show Atelier Controls' : 'Hide Controls (Zen Mode)'}</span>
          </button>
        </div>

        {/* The Solid Dock Container */}
        <div className="bg-[#12141c] border border-[#282d3e] rounded-xl p-4 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            {/* 1. Exploded View Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-[#a3abbd]">
                <span className="flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-[#c8a97e]" />
                  <span>Exploded Tailoring</span>
                </span>
                <span className="font-mono text-white text-[11px]">
                  {Math.round(explodedAmount * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={explodedAmount}
                onChange={(e) => setExplodedAmount(parseFloat(e.target.value))}
                className="w-full accent-[#c8a97e] h-1.5 bg-[#232738] rounded-lg cursor-pointer"
              />
              <div className="text-[10px] text-[#6d7486]">
                Reveals floating horsehair canvas
              </div>
            </div>

            {/* 2. Fabric Swatch Finishes */}
            <div className="space-y-1.5">
              <span className="text-[11px] uppercase tracking-wider text-[#8b92a4] font-semibold block">
                Milled Fabric Finish
              </span>
              <div className="flex items-center gap-1.5">
                {[
                  { id: 'casentino', label: 'Casentino', color: '#191a22' },
                  { id: 'silk', label: 'Raw Silk', color: '#131826' },
                  { id: 'fresco', label: 'Fresco', color: '#272b22' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setActiveFinish(s.id as any)}
                    className={`flex-1 py-1.5 px-2 text-[11px] font-medium rounded border transition-colors ${
                      activeFinish === s.id
                        ? 'bg-[#c8a97e] text-black border-[#c8a97e]'
                        : 'bg-[#181a24] text-[#8e95a8] border-[#292d3c] hover:text-white'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Camera Presets */}
            <div className="space-y-1.5">
              <span className="text-[11px] uppercase tracking-wider text-[#8b92a4] font-semibold block">
                Camera Angle
              </span>
              <div className="flex items-center gap-1.5">
                {[
                  { id: 'threeQuarter', label: '3/4 Roll' },
                  { id: 'front', label: 'Silhouette' },
                  { id: 'macro', label: 'Macro' },
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setCameraPreset(c.id as any)}
                    className={`flex-1 py-1.5 px-2 text-[11px] font-medium rounded border transition-colors ${
                      cameraPreset === c.id
                        ? 'bg-[#25293a] text-white border-[#c8a97e]'
                        : 'bg-[#181a24] text-[#8e95a8] border-[#292d3c] hover:text-white'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Lighting & Reset */}
            <div className="flex items-center justify-between gap-2 pt-2 md:pt-0">
              <div className="text-xs text-[#8991a3]">
                <div className="text-[10px] text-[#6d7486]">Lighting</div>
                <div className="font-semibold text-white">Milan Studio Key</div>
              </div>
              <button
                onClick={() => {
                  setExplodedAmount(0);
                  setCameraPreset('threeQuarter');
                  if (mannequinGroupRef.current) mannequinGroupRef.current.rotation.y = 0;
                }}
                className="p-2 text-xs font-semibold bg-[#1a1c28] hover:bg-[#252939] text-[#c8a97e] rounded-lg border border-[#2b3040] transition-colors"
                title="Reset Stage"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
