import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Volume2, VolumeX, RotateCcw, Play, Pause, Trophy, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface RunwayRunnerGameProps {
  onExitGame: () => void;
}

export const RunwayRunnerGame: React.FC<RunwayRunnerGameProps> = ({ onExitGame }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // Game Lifecycle States
  const [gameState, setGameState] = useState<'title' | 'playing' | 'paused' | 'gameover' | 'victory'>('title');
  const [score, setScore] = useState(0);
  const [distance, setDistance] = useState(0);
  const [fitMultiplier, setFitMultiplier] = useState(1.0);
  const [tailoringCollected, setTailoringCollected] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  // Refs for loop & controls
  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;
  const isMutedRef = useRef(isMuted);
  isMutedRef.current = isMuted;

  // Audio Synth context
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Play procedural Web Audio sounds
  const playSynthSound = (type: 'collect' | 'jump' | 'hit' | 'victory') => {
    if (isMutedRef.current) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      if (type === 'collect') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.exponentialRampToValueAtTime(1174.66, now + 0.12); // D6
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.16);
      } else if (type === 'jump') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.18);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.22);
      } else if (type === 'hit') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.25);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === 'victory') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(554.37, now + 0.1);
        osc.frequency.setValueAtTime(659.25, now + 0.2);
        osc.frequency.setValueAtTime(880, now + 0.3);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.55);
      }
    } catch (e) {
      // Audio not permitted or sandbox block
    }
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth || 800;
    const height = container.clientHeight || (window.innerHeight - 80) || 500;

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

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0c10);
    scene.fog = new THREE.Fog(0x0a0c10, 10, 45);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 2.5, 6.5);

    const renderer = new THREE.WebGLRenderer({ antialias: !isSoftwareGl, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.shadowMap.enabled = !isSoftwareGl;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 2. Lighting (Milan Catwalk Spotlights)
    const hemiLight = new THREE.HemisphereLight(0xecf2fa, 0x181a24, 0.9);
    scene.add(hemiLight);

    const runwaySpot = new THREE.SpotLight(0xfff5ea, 3.5, 50, Math.PI / 4, 0.4);
    runwaySpot.position.set(0, 12, 5);
    scene.add(runwaySpot);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // 3. Runway Architecture
    const runwayGeo = new THREE.PlaneGeometry(5.5, 120);
    const runwayMat = new THREE.MeshStandardMaterial({ color: 0x12141c, roughness: 0.3, metalness: 0.4 });
    const runway = new THREE.Mesh(runwayGeo, runwayMat);
    runway.rotation.x = -Math.PI / 2;
    runway.position.set(0, 0, -40);
    scene.add(runway);

    // Catwalk Gold Side Rails
    const railMat = new THREE.MeshStandardMaterial({ color: 0xc8a97e, metalness: 0.8, roughness: 0.2 });
    const leftRailGeo = new THREE.BoxGeometry(0.12, 0.15, 120);
    const leftRail = new THREE.Mesh(leftRailGeo, railMat);
    leftRail.position.set(-2.8, 0.08, -40);
    scene.add(leftRail);

    const rightRail = new THREE.Mesh(leftRailGeo, railMat);
    rightRail.position.set(2.8, 0.08, -40);
    scene.add(rightRail);

    // Catwalk Strobe Runway Beacons (Pillars)
    const beaconsGroup = new THREE.Group();
    for (let z = 5; z > -90; z -= 8) {
      const beaconGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.2, 12);
      const beaconLeft = new THREE.Mesh(beaconGeo, railMat);
      beaconLeft.position.set(-2.8, 0.6, z);
      beaconsGroup.add(beaconLeft);

      const beaconRight = new THREE.Mesh(beaconGeo, railMat);
      beaconRight.position.set(2.8, 0.6, z);
      beaconsGroup.add(beaconRight);
    }
    scene.add(beaconsGroup);

    // 4. Hero Player: The Tailored Mannequin Avatar (Procedural 5-part Group)
    const playerGroup = new THREE.Group();
    const woolMat = new THREE.MeshStandardMaterial({ color: 0x222633, roughness: 0.8 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xc8a97e, metalness: 0.85, roughness: 0.2 });

    // Torso
    const playerTorso = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.2, 0.68, 16), woolMat);
    playerTorso.position.y = 0.85;
    playerGroup.add(playerTorso);

    // Head
    const playerHead = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 16), woolMat);
    playerHead.position.y = 1.35;
    playerGroup.add(playerHead);

    // Golden Lapel Pin / Accents
    const lapelAccent = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.35, 0.04), goldMat);
    lapelAccent.position.set(0.12, 0.9, 0.18);
    lapelAccent.rotation.z = -0.2;
    playerGroup.add(lapelAccent);

    // Legs
    const leftLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.06, 0.6, 12), woolMat);
    leftLeg.position.set(-0.12, 0.3, 0);
    playerGroup.add(leftLeg);

    const rightLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.06, 0.6, 12), woolMat);
    rightLeg.position.set(0.12, 0.3, 0);
    playerGroup.add(rightLeg);

    playerGroup.position.set(0, 0, 2);
    scene.add(playerGroup);

    // 5. Game Obstacles & Tailoring Collectibles Pool
    const collectibles: Array<{ mesh: THREE.Mesh; type: 'shears' | 'scanRing' | 'silk' }> = [];
    const obstacles: Array<{ mesh: THREE.Mesh }> = [];

    const lanes = [-1.7, 0, 1.7];

    // Spawn Collectibles
    const ringGeo = new THREE.TorusGeometry(0.24, 0.05, 12, 24);
    for (let i = 0; i < 18; i++) {
      const mesh = new THREE.Mesh(ringGeo, goldMat);
      mesh.position.set(lanes[Math.floor(Math.random() * lanes.length)], 0.7, -10 - i * 6);
      scene.add(mesh);
      collectibles.push({ mesh, type: 'scanRing' });
    }

    // Spawn Obstacles (Sizing Errors / Fast-Fashion Waste Blocks)
    const obsGeo = new THREE.BoxGeometry(0.7, 0.7, 0.7);
    const obsMat = new THREE.MeshStandardMaterial({ color: 0x8b2532, roughness: 0.6 });
    for (let i = 0; i < 10; i++) {
      const mesh = new THREE.Mesh(obsGeo, obsMat);
      mesh.position.set(lanes[Math.floor(Math.random() * lanes.length)], 0.35, -16 - i * 9.5);
      scene.add(mesh);
      obstacles.push({ mesh });
    }

    // 6. Responsive Input Handling
    let targetLane = 1; // 0 = left (-1.7), 1 = mid (0), 2 = right (1.7)
    let playerYVel = 0;
    let isJumping = false;
    let cameraShake = 0;

    const onKeyDown = (e: KeyboardEvent) => {
      if (gameStateRef.current === 'title') {
        if (e.code === 'Space' || e.code === 'Enter') {
          setGameState('playing');
        }
        return;
      }

      if (e.code === 'KeyP' || e.code === 'Escape') {
        setGameState((prev) => (prev === 'playing' ? 'paused' : prev === 'paused' ? 'playing' : prev));
        return;
      }

      if (gameStateRef.current !== 'playing') return;

      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        targetLane = Math.max(0, targetLane - 1);
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        targetLane = Math.min(2, targetLane + 1);
      } else if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        if (!isJumping) {
          playerYVel = 0.22;
          isJumping = true;
          playSynthSound('jump');
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);

    // 7. Lossless 60fps Game Simulation Loop
    const clock = new THREE.Clock();
    let frameId = 0;
    let localScore = 0;
    let localDistance = 0;

    const gameTick = () => {
      frameId = requestAnimationFrame(gameTick);
      const delta = Math.min(clock.getDelta(), 0.05);

      if (gameStateRef.current === 'title') {
        // Idle turntable preview on title screen
        playerGroup.rotation.y += 0.01;
        camera.position.x = Math.sin(clock.getElapsedTime() * 0.4) * 0.8;
        camera.lookAt(playerGroup.position.x, 0.8, playerGroup.position.z);
        renderer.render(scene, camera);
        return;
      }

      if (gameStateRef.current !== 'playing') {
        renderer.render(scene, camera);
        return;
      }

      // Progress Distance & Speed
      const speed = 14 * delta;
      localDistance += speed * 2;
      setDistance(Math.round(localDistance));

      // Player Lane Smoothing (Exponential Damping)
      const targetX = lanes[targetLane];
      playerGroup.position.x = THREE.MathUtils.damp(playerGroup.position.x, targetX, 14, delta);

      // Jump Physics
      if (isJumping) {
        playerGroup.position.y += playerYVel;
        playerYVel -= 0.65 * delta;
        if (playerGroup.position.y <= 0) {
          playerGroup.position.y = 0;
          isJumping = false;
        }
      }

      // Catwalk Strut Leg Animation
      const runCycle = Math.sin(clock.getElapsedTime() * 14);
      leftLeg.rotation.x = runCycle * 0.4;
      rightLeg.rotation.x = -runCycle * 0.4;

      // Move runway environment & items toward player
      collectibles.forEach((c) => {
        c.mesh.position.z += speed;
        c.mesh.rotation.y += 0.04;

        // Collision Check
        const distXZ = Math.hypot(c.mesh.position.x - playerGroup.position.x, c.mesh.position.z - playerGroup.position.z);
        if (distXZ < 0.85 && Math.abs(c.mesh.position.y - playerGroup.position.y) < 1.0) {
          playSynthSound('collect');
          localScore += 100;
          setScore(localScore);
          setTailoringCollected((prev) => prev + 1);
          setFitMultiplier((prev) => Math.min(4.0, prev + 0.1));
          c.mesh.position.z = -100 - Math.random() * 20;
          c.mesh.position.x = lanes[Math.floor(Math.random() * lanes.length)];
        } else if (c.mesh.position.z > 8) {
          c.mesh.position.z = -80 - Math.random() * 20;
          c.mesh.position.x = lanes[Math.floor(Math.random() * lanes.length)];
        }
      });

      obstacles.forEach((obs) => {
        obs.mesh.position.z += speed;
        obs.mesh.rotation.y += 0.02;

        // Obstacle Collision Check
        const distXZ = Math.hypot(obs.mesh.position.x - playerGroup.position.x, obs.mesh.position.z - playerGroup.position.z);
        if (distXZ < 0.8 && playerGroup.position.y < 0.5) {
          playSynthSound('hit');
          cameraShake = 0.4;
          setFitMultiplier(1.0);
          setGameState('gameover');
        } else if (obs.mesh.position.z > 8) {
          obs.mesh.position.z = -90 - Math.random() * 30;
          obs.mesh.position.x = lanes[Math.floor(Math.random() * lanes.length)];
        }
      });

      // Victory Condition: Reaching 500m along Milan Catwalk!
      if (localDistance >= 500 && gameStateRef.current === 'playing') {
        playSynthSound('victory');
        setGameState('victory');
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#c8a97e', '#ffffff', '#22c55e'],
        });
      }

      // Camera Damping + Shake decay
      if (cameraShake > 0) {
        camera.position.x = (Math.random() - 0.5) * cameraShake;
        camera.position.y = 2.5 + (Math.random() - 0.5) * cameraShake;
        cameraShake *= 0.88;
      } else {
        camera.position.x = THREE.MathUtils.damp(camera.position.x, playerGroup.position.x * 0.4, 6, delta);
        camera.position.y = 2.5;
      }
      camera.lookAt(playerGroup.position.x * 0.3, 0.9, playerGroup.position.z - 3);

      renderer.render(scene, camera);
    };
    gameTick();

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth || window.innerWidth || 800;
      const h = container.clientHeight || (window.innerHeight - 80) || 500;
      camera.aspect = w / (h || 1);
      camera.updateProjectionMatrix();
      renderer.setSize(w, h || 1);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      audioCtxRef.current?.close();
    };
  }, []);

  const handleRestart = () => {
    setScore(0);
    setDistance(0);
    setFitMultiplier(1.0);
    setTailoringCollected(0);
    setGameState('playing');
  };

  return (
    <div className="relative w-full h-[88vh] min-h-[640px] bg-[#07090c] overflow-hidden rounded-2xl border border-[#232737] select-none">
      {/* 3D WebGL Canvas Viewport (>= 85% Unobstructed) */}
      <div ref={mountRef} className="w-full h-full" />

      {/* World-Matched Low-Occlusion HUD Overlay (pointer-events: none on container) */}
      <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between">
        {/* Top Status Cluster (styled in world's palette) */}
        <div className="flex items-center justify-between">
          <div className="pointer-events-auto flex items-center gap-4 bg-[#11131c] px-4 py-2.5 rounded-xl border border-[#242838]">
            <div>
              <span className="text-[10px] uppercase font-semibold text-[#8b92a4] tracking-wider block">
                Catwalk Score
              </span>
              <span className="text-xl font-bold font-mono text-white tabular-nums">
                {score}
              </span>
            </div>
            <div className="h-6 w-px bg-[#262b3b]" />
            <div>
              <span className="text-[10px] uppercase font-semibold text-[#8b92a4] tracking-wider block">
                Fit Multiplier
              </span>
              <span className="text-sm font-bold font-mono text-[#c8a97e]">
                {fitMultiplier.toFixed(1)}x
              </span>
            </div>
            <div className="h-6 w-px bg-[#262b3b]" />
            <div>
              <span className="text-[10px] uppercase font-semibold text-[#8b92a4] tracking-wider block">
                Catwalk Progress
              </span>
              <span className="text-sm font-bold font-mono text-cyan-400 tabular-nums">
                {distance}m / 500m
              </span>
            </div>
          </div>

          {/* Sound & Exit Controls */}
          <div className="pointer-events-auto flex items-center gap-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2.5 bg-[#12141c] hover:bg-[#1c1f2c] text-[#8e95a7] hover:text-white rounded-xl border border-[#252938] transition-colors"
              title={isMuted ? 'Unmute Synth' : 'Mute Sound'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onExitGame}
              className="px-3 py-2 text-xs font-semibold bg-[#12141c] hover:bg-[#1c1f2c] text-[#8e95a7] hover:text-white rounded-xl border border-[#252938] transition-colors"
            >
              Exit Runway
            </button>
          </div>
        </div>

        {/* Minimal Bottom Control Hint Line */}
        <div className="text-center text-xs text-[#6e7688] font-mono">
          A / D or Arrow Keys: Steer · Space: Stride Jump · Esc / P: Pause
        </div>
      </div>

      {/* Title Screen Overlay */}
      {gameState === 'title' && (
        <div className="absolute inset-0 z-30 bg-black/75 flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md space-y-4">
            <span className="text-xs uppercase tracking-[0.3em] font-semibold text-[#c8a97e]">
              ALASHO 3D Interactive Experience
            </span>
            <h2 className="text-4xl lg:text-5xl font-serif-luxury font-bold text-white tracking-tight">
              Milan Runway Runner
            </h2>
            <p className="text-xs text-[#959cb0] leading-relaxed max-w-sm mx-auto">
              Strut the Milan Fashion Week catwalk. Collect optical scan rings and gold shears to achieve 100% bespoke fit while avoiding sizing pitfalls.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => setGameState('playing')}
                className="w-full sm:w-auto px-8 py-3.5 bg-[#c8a97e] hover:bg-[#dbbe95] text-black font-semibold text-xs uppercase tracking-widest rounded-xl shadow-xl transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4" />
                <span>Start Runway (Enter / Space)</span>
              </button>
            </div>
            <div className="text-[11px] text-[#71788a]">
              Press Space or Enter to begin
            </div>
          </div>
        </div>
      )}

      {/* Pause Modal */}
      {gameState === 'paused' && (
        <div className="absolute inset-0 z-30 bg-black/70 flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-[#12141c] border border-[#272b3b] rounded-2xl p-8 max-w-xs w-full space-y-4 shadow-2xl">
            <h3 className="text-xl font-serif-luxury text-white">Catwalk Paused</h3>
            <button
              onClick={() => setGameState('playing')}
              className="w-full py-2.5 bg-[#c8a97e] text-black font-semibold text-xs uppercase tracking-wider rounded-lg"
            >
              Resume
            </button>
            <button
              onClick={handleRestart}
              className="w-full py-2.5 bg-[#1b1f2b] text-[#cad0de] hover:text-white font-semibold text-xs uppercase tracking-wider rounded-lg border border-[#292e3e]"
            >
              Restart
            </button>
          </div>
        </div>
      )}

      {/* Game Over Modal */}
      {gameState === 'gameover' && (
        <div className="absolute inset-0 z-30 bg-black/80 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
          <div className="bg-[#12141c] border border-rose-500/30 rounded-2xl p-8 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-serif-luxury text-white">Sizing Stumble</h3>
            <p className="text-xs text-[#8c94a5]">
              You hit a fast-fashion sizing error block at {distance} meters!
            </p>
            <div className="p-3 bg-[#181a25] rounded-xl border border-[#262a39] text-xs">
              <span className="text-[#848c9e] block">Final Runway Score</span>
              <strong className="text-xl font-bold font-mono text-[#c8a97e]">{score}</strong>
            </div>
            <button
              onClick={handleRestart}
              className="w-full py-3 bg-[#c8a97e] text-black font-semibold text-xs uppercase tracking-wider rounded-lg shadow-md"
            >
              Retry Runway Catwalk
            </button>
          </div>
        </div>
      )}

      {/* Victory Modal */}
      {gameState === 'victory' && (
        <div className="absolute inset-0 z-30 bg-black/85 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
          <div className="bg-[#12141c] border border-[#c8a97e]/40 rounded-2xl p-8 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-[#c8a97e]/20 text-[#c8a97e] flex items-center justify-center mx-auto">
              <Trophy className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-serif-luxury text-white">Milan Catwalk Grand Finale</h3>
            <p className="text-xs text-[#8c94a5]">
              You completed the 500-meter runway with impeccable sartorial harmony!
            </p>
            <div className="p-3 bg-[#181a25] rounded-xl border border-[#262a39] text-xs space-y-1">
              <div className="flex justify-between text-[#8c94a5]">
                <span>Total Score:</span>
                <strong className="text-white font-mono">{score}</strong>
              </div>
              <div className="flex justify-between text-[#8c94a5]">
                <span>Landmarks Collected:</span>
                <strong className="text-[#c8a97e] font-mono">{tailoringCollected}</strong>
              </div>
            </div>
            <button
              onClick={handleRestart}
              className="w-full py-3 bg-[#c8a97e] text-black font-semibold text-xs uppercase tracking-wider rounded-lg shadow-md"
            >
              Walk Catwalk Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
