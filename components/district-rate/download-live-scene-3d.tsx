"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

const POLL_MS = 4000;
const IDLE_BEFORE_BREAK_MS = 20000; // real trigger; bubble text still says "5 min"
const BREAK_DURATION_MS = 10000;
const CLIMB_MS = 3200;
const HIT_GAP_MS = 450;
const BUBBLE_MS = 1400;

type Phase = "building" | "delivering" | "break" | "checkin" | "reporting";

interface BubbleState {
  who: "engineer" | "worker";
  text: string;
  key: number;
}

type Ref<T> = { current: T };

/* ---------- static geometry ---------- */

function Ladder({ baseY = 0.55, topY = 3.35, rungs = 7 }: { baseY?: number; topY?: number; rungs?: number }) {
  const height = topY - baseY;
  const spacing = height / (rungs + 1);
  return (
    <group position={[0, 0, 0.9]}>
      <mesh position={[-0.28, baseY + height / 2, 0]}>
        <boxGeometry args={[0.06, height, 0.06]} />
        <meshStandardMaterial color="#6b4a2b" />
      </mesh>
      <mesh position={[0.28, baseY + height / 2, 0]}>
        <boxGeometry args={[0.06, height, 0.06]} />
        <meshStandardMaterial color="#8a6d3b" />
      </mesh>
      {Array.from({ length: rungs }).map((_, i) => (
        <mesh key={i} position={[0, baseY + spacing * (i + 1), 0]}>
          <boxGeometry args={[0.62, 0.07, 0.07]} />
          <meshStandardMaterial color="#9c6b3e" />
        </mesh>
      ))}
    </group>
  );
}

function WorkerRoom() {
  return (
    <group position={[-2.1, 0, 0]}>
      <mesh receiveShadow position={[0, 0.15, 0]}>
        <boxGeometry args={[1.6, 0.3, 1.6]} />
        <meshStandardMaterial color="#47b03b" />
      </mesh>
      <mesh position={[0, 0.9, -0.75]}>
        <boxGeometry args={[1.6, 1.9, 0.08]} />
        <meshStandardMaterial color="#43c41f" />
      </mesh>
      <mesh position={[0, 0.45, 0.2]}>
        <boxGeometry args={[0.9, 0.1, 0.4]} />
        <meshStandardMaterial color="#095ddc" />
      </mesh>
    </group>
  );
}

function EngineerCabin() {
  return (
    <group position={[2.1, 1.5, 0]}>
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[1.8, 0.3, 1.6]} />
        <meshStandardMaterial color="#1dd513" />
      </mesh>
      <mesh position={[0, 1.0, -0.75]}>
        <boxGeometry args={[1.8, 1.7, 0.08]} />
        <meshStandardMaterial color="#55d614" />
      </mesh>
      <mesh position={[0, 1.95, -0.2]}>
        <boxGeometry args={[2.0, 0.1, 1.9]} />
        <meshStandardMaterial color="#c8a84b" />
      </mesh>
      <mesh position={[0.55, 0.5, 0.15]}>
        <boxGeometry args={[0.6, 0.08, 0.45]} />
        <meshStandardMaterial color="#f50ab2" />
      </mesh>
    </group>
  );
}

/** The scoreboard the worker climbs up to and hits — shows the real total, lagging while pending */
function NumberBoard({ value, shake }: { value: number; shake: boolean }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.position.x = 0.95 + (shake ? Math.sin(clock.elapsedTime * 45) * 0.035 : 0);
  });
  return (
    <group ref={ref} position={[0.95, 3.55, 0.9]}>
      <mesh>
        <boxGeometry args={[1.25, 0.38, 0.07]} />
        <meshStandardMaterial color="#222325" />
      </mesh>
      <Html center position={[0, 0, 0.03]} style={{ pointerEvents: "none" }}>
        <div className="text-accent font-bold text-sm tabular-nums">{value.toLocaleString()}</div>
      </Html>
    </group>
  );
}

/* ---------- characters ---------- */

function Person({
  hatColor,
  shirtColor,
  standing,
  onClick,
}: {
  hatColor: string;
  shirtColor: string;
  standing: boolean;
  onClick?: (e: any) => void;
}) {
  const scaleY = standing ? 1 : 0.86;
  return (
    <group scale={[1, scaleY, 1]} onClick={onClick}>
      <mesh position={[0, 0.55, 0]} onClick={onClick}>
  <boxGeometry args={[0.55, 1.3, 0.55]} />
  <meshBasicMaterial transparent opacity={0} depthWrite={false} />
</mesh>
      <mesh castShadow position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.11, 0.13, 0.4, 8]} />
        <meshStandardMaterial color="#2a3547" />
      </mesh>
      <mesh castShadow position={[0, 0.55, 0]}>
        <cylinderGeometry args={[0.15, 0.16, 0.42, 8]} />
        <meshStandardMaterial color={shirtColor} />
      </mesh>
      <mesh castShadow position={[0, 0.86, 0]}>
        <sphereGeometry args={[0.14, 12, 12]} />
        <meshStandardMaterial color="#e8b88a" />
      </mesh>
      <mesh castShadow position={[0, 0.97, 0]}>
        <sphereGeometry args={[0.155, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={hatColor} />
      </mesh>
    </group>
  );
}

function Hammer({ striking }: { striking: boolean }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.z = striking ? Math.sin(clock.elapsedTime * 22) * 0.9 - 0.4 : -0.1;
  });
  return (
    <group ref={ref} position={[0.2, 0.62, 0.1]}>
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.28, 6]} />
        <meshStandardMaterial color="#f50e0e" />
      </mesh>
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[0.12, 0.06, 0.06]} />
        <meshStandardMaterial color="#bcc9c9fb" />
      </mesh>
    </group>
  );
}

/** 0 = sitting in the room · 1 = standing at the board, next to the cabin */
function workerPath(t: number): [number, number, number] {
  const roomX = -2.1, roomY = 0.55, roomZ = 0.2;
  const ladderBaseY = 0.55, ladderTopY = 3.35;
  const boardX = 0.6, boardY = 3.55, boardZ = 0.9;

  if (t <= 0.18) {
    const p = t / 0.18;
    return [THREE.MathUtils.lerp(roomX, 0, p), roomY, THREE.MathUtils.lerp(roomZ, 0.9, p)];
  }
  if (t <= 0.85) {
    const p = (t - 0.18) / 0.67;
    const sway = Math.sin(p * Math.PI * 7) * 0.05;
    return [sway, THREE.MathUtils.lerp(ladderBaseY, ladderTopY, p), 0.9];
  }
  const p = (t - 0.85) / 0.15;
  return [
    THREE.MathUtils.lerp(0, boardX, p),
    THREE.MathUtils.lerp(ladderTopY, boardY, p),
    boardZ,
  ];
}

function WorkerRig({
  progressRef,
  striking,
  bubble,
  onClick,
}: {
  progressRef: Ref<number>;
  striking: boolean;
  bubble: BubbleState | null;
  onClick: (e: any) => void;
}) {
  const group = useRef<THREE.Group>(null);
  useFrame(() => {
    if (!group.current) return;
    const [x, y, z] = workerPath(progressRef.current);
    group.current.position.set(x, y, z);
  });
  return (
    <group ref={group}>
      <Person hatColor="#f5c905"
      shirtColor="#1abc32"
      standing onClick={onClick} />
      <Hammer striking={striking} />
      {bubble?.who === "worker" && (
        <Html center position={[0, 1.25, 0]} style={{ pointerEvents: "none" }}>
          <div className="bg-white text-navy-900 text-[11px] font-semibold px-2 py-1 rounded-full shadow-md whitespace-nowrap max-w-[160px] text-center">
            {bubble.text}
          </div>
        </Html>
      )}
    </group>
  );
}

function EngineerRig({
  standing,
  bubble,
  onClick,
}: {
  standing: boolean;
  bubble: BubbleState | null;
  onClick: (e: any) => void;
}) {
  return (
    <group position={[1.75, 2.05, 0.15]}>
      <Person hatColor="#f4f4f4"
      shirtColor="#2563eb"
      standing={standing} onClick={onClick} />
      <mesh
  rotation={[-Math.PI / 2, 0, 0]}
  position={[0, -0.02, 0]}
>
  <circleGeometry args={[0.22, 24]} />
  <meshBasicMaterial
    color="black"
    transparent
    opacity={0.25}
  />
</mesh>
      {bubble?.who === "engineer" && (
        <Html center position={[0, 1.25, 0]} style={{ pointerEvents: "none" }}>
          <div className="bg-accent text-navy-950 text-[11px] font-bold px-2 py-1 rounded-full shadow-md whitespace-nowrap max-w-[160px] text-center">
            {bubble.text}
          </div>
        </Html>
      )}
    </group>
  );
}

function SceneContent({
  engineerStanding,
  striking,
  boardShake,
  boardValue,
  progressRef,
  bubble,
  onWorkerClick,
  onEngineerClick,
}: {
  engineerStanding: boolean;
  striking: boolean;
  boardShake: boolean;
  boardValue: number;
  progressRef: Ref<number>;
  bubble: BubbleState | null;
  onWorkerClick: (e: any) => void;
  onEngineerClick: (e: any) => void;
}) {
  return (
    <group position={[0, -2.2, 0]}>
      <ambientLight intensity={0.75} />
      <directionalLight
        castShadow
      position={[3, 5, 4]} intensity={0.9} />
      <directionalLight
        castShadow
      position={[-3, 2, -2]} intensity={0.3} />
      <WorkerRoom />
      <EngineerCabin />
      <Ladder />
      <NumberBoard value={boardValue} shake={boardShake} />
      <WorkerRig progressRef={progressRef} striking={striking} bubble={bubble} onClick={onWorkerClick} />
      <EngineerRig standing={engineerStanding} bubble={bubble} onClick={onEngineerClick} />
    </group>
  );
}

/* ---------- top-level component ---------- */

export function DownloadLiveScene3D({ initialDownloads }: { initialDownloads: number }) {
  const [bubble, setBubble] = useState<BubbleState | null>(null);
  const [displayed, setDisplayed] = useState(Math.max(0, initialDownloads - 1));
  const [engineerStanding, setEngineerStanding] = useState(false);
  const [striking, setStriking] = useState(false);
  const [boardShake, setBoardShake] = useState(false);
  const [phase, setPhase] = useState<Phase>("building");

  const progressRef = useRef(0);
  const animRafRef = useRef<number | null>(null);

  const actualRef = useRef(initialDownloads);
  const pendingRef = useRef(1); // starts lagging by 1, per spec
  const busyRef = useRef(false);
  const bubbleKeyRef = useRef(0);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const breakTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const visibleRef = useRef(true);

  const workerClicksRef = useRef(0);
  const workerClickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const engineerClicksRef = useRef(0);
  const engineerClickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function say(who: BubbleState["who"], text: string, holdMs = BUBBLE_MS) {
    bubbleKeyRef.current += 1;
    const key = bubbleKeyRef.current;
    setBubble({ who, text, key });
    return new Promise<void>((resolve) => {
      window.setTimeout(() => {
        setBubble((b) => (b?.key === key ? null : b));
        resolve();
      }, holdMs);
    });
  }
  function wait(ms: number) {
    return new Promise<void>((resolve) => window.setTimeout(resolve, ms));
  }
  function animateProgress(to: number, ms: number) {
    return new Promise<void>((resolve) => {
      const from = progressRef.current;
      const start = performance.now();
      function step(now: number) {
        const t = Math.min(1, (now - start) / ms);
        progressRef.current = from + (to - from) * t;
        if (t < 1) animRafRef.current = requestAnimationFrame(step);
        else resolve();
      }
      animRafRef.current = requestAnimationFrame(step);
    });
  }

  function armIdleTimer() {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(startBreak, IDLE_BEFORE_BREAK_MS);
  }

  async function startBreak() {
    if (busyRef.current) return;
    busyRef.current = true;
    setPhase("break");
    setEngineerStanding(true);
    await say("engineer", "5 min", 1600);
    setEngineerStanding(false);
    if (breakTimerRef.current) clearTimeout(breakTimerRef.current);
    breakTimerRef.current = setTimeout(checkIn, BREAK_DURATION_MS);
    busyRef.current = false;
  }

  async function checkIn() {
    busyRef.current = true;
    setPhase("checkin");
    setEngineerStanding(true);
    await say("engineer", "Any update?", 1600);

    const amount = pendingRef.current;
    if (amount <= 0) {
      await say("worker", "Not yet", 1300);
      await say("worker", "Okay sir", 1200);
      setEngineerStanding(false);
      busyRef.current = false;
      setPhase("building");
      armIdleTimer();
      return;
    }

    setPhase("reporting");
    await say("worker", `+${amount}`, 1300);
    await say("worker", "Okay sir", 1100);
    await runDelivery(amount);
    setEngineerStanding(false);
    busyRef.current = false;
    setPhase("building");
    armIdleTimer();
  }

  async function runDelivery(amount: number) {
    setPhase("delivering");
    await animateProgress(1, CLIMB_MS);

    for (let hit = 1; hit <= 3; hit++) {
      setStriking(true);
      setBoardShake(true);
      await wait(HIT_GAP_MS);
      setStriking(false);
      setBoardShake(false);
      if (hit === 3) {
        pendingRef.current = Math.max(0, pendingRef.current - amount);
        setDisplayed(actualRef.current - pendingRef.current);
      }
      await wait(120);
    }

    await animateProgress(0, CLIMB_MS);
    await say("engineer", "Thanks", 1300);
    await say("worker", "❤️", 1300);
  }

  function handleWorkerClick(e: any) {
    console.log("worker clicked!"); 
    e.stopPropagation?.();
    workerClicksRef.current += 1;
    if (workerClickTimerRef.current) clearTimeout(workerClickTimerRef.current);
    workerClickTimerRef.current = setTimeout(() => (workerClicksRef.current = 0), 1200);
    const c = workerClicksRef.current;
    if (c === 1) say("worker", "Worker", 1000);
    else if (c === 2) say("worker", "Download district rates", 2600);
    else if (c >= 4) say("worker", "Let me do my work 😅", 1600);
  }

  function handleEngineerClick(e: any) {
    e.stopPropagation?.();
    engineerClicksRef.current += 1;
    if (engineerClickTimerRef.current) clearTimeout(engineerClickTimerRef.current);
    engineerClickTimerRef.current = setTimeout(() => (engineerClicksRef.current = 0), 1200);
    const c = engineerClicksRef.current;
    if (c === 1) say("engineer", "Engineer", 1000);
    else if (c === 2) say("engineer", "Okay?", 1400);
    else if (c >= 4) say("engineer", "Let me Focus 🙏", 1600);
  }

  useEffect(() => {
    armIdleTimer();
    const onVis = () => { visibleRef.current = document.visibilityState === "visible"; };
    document.addEventListener("visibilitychange", onVis);

    const introTimer = setTimeout(async () => {
      if (busyRef.current || pendingRef.current <= 0) return;
      busyRef.current = true;
      const amount = pendingRef.current;
      await say("engineer", `+${amount}`, 1100);
      await say("worker", "Okay sir", 1000);
      setEngineerStanding(true);
      await runDelivery(amount);
      setEngineerStanding(false);
      busyRef.current = false;
      armIdleTimer();
    }, 5000);

    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (breakTimerRef.current) clearTimeout(breakTimerRef.current);
      if (animRafRef.current) cancelAnimationFrame(animRafRef.current);
      clearTimeout(introTimer);
      document.removeEventListener("visibilitychange", onVis);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function poll() {
      if (!visibleRef.current) return;
      try {
        const res = await fetch("/api/district-rate/live-stats", { cache: "no-store" });
        const data = await res.json();
        if (cancelled) return;
        const diff = data.downloads - actualRef.current;
        if (diff > 0) {
          actualRef.current = data.downloads;
          pendingRef.current += diff;
          if (phase === "building" && !busyRef.current) {
            busyRef.current = true;
            const amount = pendingRef.current;
            await say("engineer", `+${amount}`, 1100);
            await say("worker", "Okay sir", 1000);
            setEngineerStanding(true);
            await runDelivery(amount);
            setEngineerStanding(false);
            busyRef.current = false;
            setPhase("building");
            armIdleTimer();
          }
        }
      } catch {
        // decorative only
      }
    }
    const id = window.setInterval(poll, POLL_MS);
    return () => { cancelled = true; window.clearInterval(id); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  return (
    <div className="flex items-center gap-3">
      <div style={{ width: 300, height: 160 }}>
        <Canvas
         shadows
  camera={{ position: [4.6, 1.0, 6.4], fov: 30 }}
  dpr={[1, 1.5]}
  gl={{ alpha: true, antialias: true }}
  onPointerMissed={() => console.log("canvas got a click, but missed everything")}
>
          <SceneContent
            engineerStanding={engineerStanding}
            striking={striking}
            boardShake={boardShake}
            boardValue={displayed}
            progressRef={progressRef}
            bubble={bubble}
            onWorkerClick={handleWorkerClick}
            onEngineerClick={handleEngineerClick}
          />
        </Canvas>
      </div>
    </div>
  );
}
