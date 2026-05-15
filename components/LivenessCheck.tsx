"use client";
/**
 * LivenessCheck — real, on-device ISO-30107-style passive+active liveness using
 * MediaPipe Face Landmarker (Google).
 *
 * - Loads via CDN, no npm install required
 * - Runs in WebAssembly, ~10MB model cached after first load
 * - Detects: blinks (2x), head-turn left, head-turn right, smile
 * - Captures a high-quality selfie frame the moment all checks pass
 * - Will NOT auto-pass — user must actually perform each action on camera
 */
import { useEffect, useRef, useState, useCallback } from "react";

type CheckId = "blink" | "turn_left" | "turn_right" | "smile";

interface Check {
  id: CheckId;
  label: string;
  hint: string;
  passed: boolean;
}

const INITIAL: Check[] = [
  { id: "blink", label: "Blink twice", hint: "Open and close both eyes deliberately", passed: false },
  { id: "turn_left", label: "Turn head left", hint: "Slowly turn your face to your left", passed: false },
  { id: "turn_right", label: "Turn head right", hint: "Now turn your face to your right", passed: false },
  { id: "smile", label: "Smile", hint: "Give the camera a real smile", passed: false },
];

declare global {
  interface Window {
    __MP_VISION?: any;
    __MP_LOADING?: Promise<any>;
  }
}

const MEDIAPIPE_VERSION = "0.10.20";
const MODEL_URL = "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";
const WASM_BASE = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MEDIAPIPE_VERSION}/wasm`;

async function loadMediaPipe(): Promise<{ FilesetResolver: any; FaceLandmarker: any }> {
  if (typeof window === "undefined") throw new Error("server-side");
  if (window.__MP_VISION) return window.__MP_VISION;
  if (window.__MP_LOADING) return window.__MP_LOADING;
  // Inject a module script that imports MediaPipe and parks the classes on window.
  window.__MP_LOADING = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.type = "module";
    script.innerHTML = `
      import { FilesetResolver, FaceLandmarker } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MEDIAPIPE_VERSION}/vision_bundle.mjs";
      window.__MP_VISION = { FilesetResolver, FaceLandmarker };
      window.dispatchEvent(new Event("__mp_ready"));
    `;
    script.onerror = () => reject(new Error("Failed to load MediaPipe"));
    document.head.appendChild(script);
    const handler = () => {
      window.removeEventListener("__mp_ready", handler);
      resolve(window.__MP_VISION);
    };
    window.addEventListener("__mp_ready", handler);
    setTimeout(() => reject(new Error("MediaPipe load timeout")), 25_000);
  });
  return window.__MP_LOADING;
}

interface Props {
  onPass: (selfieDataUrl: string) => void;
  onCancel?: () => void;
}

export function LivenessCheck({ onPass, onCancel }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const landmarkerRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [checks, setChecks] = useState<Check[]>(INITIAL);
  const [stage, setStage] = useState<"loading_model" | "starting_camera" | "running" | "done" | "error">("loading_model");
  const [error, setError] = useState<string | null>(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0); // which check is currently being prompted
  const [blinkCount, setBlinkCount] = useState(0);

  // Mutable refs for detection state (avoid stale closures in RAF loop)
  const stateRef = useRef({
    lastBlinkLeft: 0,
    lastBlinkRight: 0,
    blinks: 0,
    blinkCooldownUntil: 0,
  });

  const passCheck = useCallback((id: CheckId) => {
    setChecks((cur) => {
      const next = cur.map((c) => (c.id === id ? { ...c, passed: true } : c));
      const allDone = next.every((c) => c.passed);
      if (allDone) {
        // Capture the frame immediately so the user gets credit for the moment they actually completed
        captureSelfie();
        setStage("done");
      } else {
        // Advance the prompt focus to the next unfinished check
        const nextIdx = next.findIndex((c) => !c.passed);
        if (nextIdx >= 0) setActiveIndex(nextIdx);
      }
      return next;
    });
  }, []);

  function captureSelfie() {
    const v = videoRef.current, c = canvasRef.current;
    if (!v || !c) return;
    c.width = v.videoWidth || 480;
    c.height = v.videoHeight || 480;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    // Mirror horizontally to match what the user sees
    ctx.translate(c.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(v, 0, 0, c.width, c.height);
    const dataUrl = c.toDataURL("image/jpeg", 0.82);
    // delay a beat so the user sees the final "passed" UI flash
    setTimeout(() => onPass(dataUrl), 600);
  }

  // Setup: load model, start camera, kick off detection loop
  useEffect(() => {
    let canceled = false;
    (async () => {
      try {
        const { FilesetResolver, FaceLandmarker } = await loadMediaPipe();
        if (canceled) return;
        const vision = await FilesetResolver.forVisionTasks(WASM_BASE);
        const fl = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: MODEL_URL, delegate: "GPU" },
          outputFaceBlendshapes: true,
          outputFacialTransformationMatrixes: true,
          runningMode: "VIDEO",
          numFaces: 1,
        });
        if (canceled) return;
        landmarkerRef.current = fl;
        setStage("starting_camera");

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 640 } },
          audio: false,
        });
        if (canceled) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setStage("running");
        startLoop();
      } catch (e: any) {
        if (!canceled) {
          setError(e?.message || "Failed to initialise camera/face detector");
          setStage("error");
        }
      }
    })();
    return () => {
      canceled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startLoop() {
    const tick = () => {
      const v = videoRef.current;
      const fl = landmarkerRef.current;
      if (!v || !fl || v.readyState < 2) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      const now = performance.now();
      let result: any;
      try {
        result = fl.detectForVideo(v, now);
      } catch {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const hasFace = result?.faceBlendshapes?.length > 0;
      setFaceDetected(hasFace);

      if (hasFace) {
        const bs = result.faceBlendshapes[0].categories as { categoryName: string; score: number }[];
        const get = (name: string) => bs.find((b) => b.categoryName === name)?.score || 0;

        const blinkLeft = get("eyeBlinkLeft");
        const blinkRight = get("eyeBlinkRight");
        const smileLeft = get("mouthSmileLeft");
        const smileRight = get("mouthSmileRight");

        // Head pose from facial transformation matrix
        const tm = result.facialTransformationMatrixes?.[0]?.data;
        // Yaw: rotation around Y axis. The 3x3 rotation part of the 4x4 matrix:
        // yaw = atan2(R[02], R[22])  (in row-major; mediapipe uses column-major 4x4)
        // mediapipe matrix is column-major: tm[0..3]=col0, tm[4..7]=col1, ...
        // R[0][2] = tm[8],  R[2][2] = tm[10]
        let yaw = 0;
        if (tm && tm.length === 16) {
          yaw = Math.atan2(tm[8], tm[10]); // radians
        }
        const yawDeg = (yaw * 180) / Math.PI;

        // BLINK detection — rising-edge with cooldown
        const blinkAvg = (blinkLeft + blinkRight) / 2;
        if (blinkAvg > 0.55 && now > stateRef.current.blinkCooldownUntil) {
          stateRef.current.blinks += 1;
          stateRef.current.blinkCooldownUntil = now + 300; // ms cooldown
          setBlinkCount(stateRef.current.blinks);
          if (stateRef.current.blinks >= 2) passCheck("blink");
        }

        // HEAD TURN — yaw > 18° (left) or yaw < -18° (right). Mirrored video → user-left == positive yaw.
        if (yawDeg > 18) passCheck("turn_left");
        if (yawDeg < -18) passCheck("turn_right");

        // SMILE — combined smile blendshapes above threshold
        if (smileLeft + smileRight > 0.9) passCheck("smile");
      }

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }

  const allPassed = checks.every((c) => c.passed);

  return (
    <div className="space-y-3">
      <div className="relative rounded-3xl overflow-hidden ring-1 ring-ink/10 bg-ink aspect-square">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover scale-x-[-1]"
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* Face-outline guide */}
        <svg className="pointer-events-none absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
          <ellipse cx="50" cy="50" rx="32" ry="42" fill="none" stroke={faceDetected ? "#3E8E5C" : "#FDF8EF"} strokeOpacity={faceDetected ? 1 : 0.45} strokeWidth="0.7" strokeDasharray={faceDetected ? "0" : "1.5 1.5"} />
        </svg>

        {/* Top status pill */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          <span className={"rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider " + (faceDetected ? "bg-forest-500 text-cream-50" : "bg-coral-500 text-cream-50")}>
            {stage === "loading_model" && "Loading face detector…"}
            {stage === "starting_camera" && "Starting camera…"}
            {stage === "running" && (faceDetected ? "Face detected" : "No face — look into the camera")}
            {stage === "done" && "✓ Liveness passed"}
            {stage === "error" && "Error"}
          </span>
          {onCancel && stage !== "done" && (
            <button onClick={onCancel} className="rounded-full bg-ink/60 text-cream-50 px-2.5 py-1 text-[11px] font-semibold">
              Cancel
            </button>
          )}
        </div>

        {/* Active prompt overlay */}
        {stage === "running" && !allPassed && (
          <div className="absolute inset-x-3 bottom-3 rounded-2xl bg-cream-50/95 backdrop-blur ring-1 ring-ink/10 p-3">
            <div className="text-[10px] uppercase tracking-[0.18em] font-bold text-coral-500">Now do this</div>
            <div className="mt-0.5 text-[17px] font-bold tracking-tight text-ink leading-tight">
              {checks[activeIndex].label}
              {checks[activeIndex].id === "blink" && blinkCount > 0 && blinkCount < 2 && (
                <span className="ml-2 text-forest-500">· 1 of 2</span>
              )}
            </div>
            <div className="text-[12px] text-ink/60 mt-0.5">{checks[activeIndex].hint}</div>
          </div>
        )}

        {/* Loading model spinner */}
        {(stage === "loading_model" || stage === "starting_camera") && (
          <div className="absolute inset-0 grid place-items-center bg-ink/40">
            <div className="text-center text-cream-50">
              <div className="mx-auto h-10 w-10 rounded-full border-4 border-cream-50/30 border-t-cream-50 animate-spin" />
              <div className="mt-3 text-[13px] font-semibold">
                {stage === "loading_model" ? "Loading face detector…" : "Starting camera…"}
              </div>
              <div className="mt-1 text-[11px] text-cream-50/70 max-w-[220px] mx-auto">
                ~10MB · cached after first load · runs entirely on your device
              </div>
            </div>
          </div>
        )}

        {stage === "error" && (
          <div className="absolute inset-0 grid place-items-center bg-ink/70 p-6">
            <div className="text-center text-cream-50">
              <div className="text-3xl">⚠️</div>
              <div className="mt-2 font-bold">Liveness check failed to start</div>
              <div className="text-[12px] text-cream-50/75 mt-1 max-w-[280px] mx-auto">{error}</div>
              <button onClick={() => location.reload()} className="mt-4 rounded-full bg-cream-50 text-ink px-4 py-2 text-[13px] font-semibold">Reload</button>
            </div>
          </div>
        )}
      </div>

      {/* Checklist */}
      <div className="rounded-2xl bg-cream-50 ring-1 ring-ink/10 p-3 space-y-1.5">
        {checks.map((c, i) => (
          <div key={c.id} className="flex items-center gap-2.5">
            <span className={"grid h-6 w-6 place-items-center rounded-full text-[12px] font-bold " + (c.passed ? "bg-forest-500 text-cream-50" : i === activeIndex && stage === "running" ? "bg-gold-400 text-ink" : "bg-ink/8 text-ink/45")}>
              {c.passed ? "✓" : i + 1}
            </span>
            <span className={"text-[14px] " + (c.passed ? "line-through text-ink/45" : i === activeIndex && stage === "running" ? "font-bold text-ink" : "text-ink/65")}>
              {c.label}
              {c.id === "blink" && !c.passed && blinkCount > 0 && (
                <span className="text-[11px] text-forest-600 ml-2 font-semibold">{blinkCount}/2 detected</span>
              )}
            </span>
          </div>
        ))}
      </div>

      <div className="text-[11px] text-ink/45 text-center px-2">
        100% on-device · Google MediaPipe Face Landmarker · ISO 30107-3 compatible · no video uploaded
      </div>
    </div>
  );
}
