import { useEffect, useRef, useState } from "react";
import {
  getMobileGyroState,
  subscribeMobileGyro,
  initMobileGyro,
  requestGyroPermission,
} from "./mobileGyro.js";

const DESKTOP_MAX = 9;
const MOBILE_MAX = 12;
const MOBILE_LERP = 0.16;
const GAMMA_GAIN = 0.65;
const BETA_GAIN = -0.55;
const DEBUG_MOBILE = true;

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const lerp = (a, b, t) => a + (b - a) * t;

export function Tilt3D({ children, max, perspective = 1000 }) {
  const wrapRef = useRef(null);
  const innerRef = useRef(null);
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const rafRef = useRef(0);
  const modeRef = useRef("waiting");
  const permRequestedRef = useRef(false);

  const [isHovering, setIsHovering] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [debugInfo, setDebugInfo] = useState({
    mode: "waiting",
    permission: "waiting",
    orientationEventCount: 0,
    beta: null,
    gamma: null,
    touchFallbackActive: false,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    initMobileGyro();
    const initial = getMobileGyroState();
    if (!initial.isMobile) return;
    setIsMobile(true);

    const inner = innerRef.current;
    const wrap = wrapRef.current;
    if (!inner || !wrap) return;

    const mMax = max ?? MOBILE_MAX;
    let active = true;

    const tick = () => {
      if (!active) return;
      current.current.x = lerp(current.current.x, target.current.x, MOBILE_LERP);
      current.current.y = lerp(current.current.y, target.current.y, MOBILE_LERP);
      inner.style.transform =
        `rotateX(${current.current.x.toFixed(3)}deg) rotateY(${current.current.y.toFixed(3)}deg)`;
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    const unsubscribe = subscribeMobileGyro((s) => {
      const prevMode = modeRef.current;
      modeRef.current = s.mode;
      if (s.mode === "gyro") {
        target.current.y = clamp(s.deltaGamma * GAMMA_GAIN, -mMax, mMax);
        target.current.x = clamp(s.deltaBeta * BETA_GAIN, -mMax, mMax);
      } else if (prevMode === "gyro" && s.mode !== "gyro") {
        // gyro lost → recenter
        target.current.x = 0;
        target.current.y = 0;
      }
      // recenter when entering touch-fallback to avoid sudden jump from prior mode
      if (prevMode !== "touch-fallback" && s.mode === "touch-fallback") {
        target.current.x = 0;
        target.current.y = 0;
      }
      if (DEBUG_MOBILE) {
        setDebugInfo({
          mode: s.mode,
          permission: s.permission,
          orientationEventCount: s.orientationEventCount,
          beta: s.beta,
          gamma: s.gamma,
          touchFallbackActive: s.mode === "touch-fallback",
        });
      }
    });

    const onTouchStart = () => {
      const s = getMobileGyroState();
      if (
        !permRequestedRef.current &&
        s.requestPermAvailable &&
        s.permission === "waiting"
      ) {
        permRequestedRef.current = true;
        requestGyroPermission();
      }
    };
    const onTouchMove = (ev) => {
      if (modeRef.current !== "touch-fallback") return;
      const t = ev.touches && ev.touches[0];
      if (!t) return;
      const rect = wrap.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const dx = (t.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
      const dy = (t.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
      target.current.y = clamp(dx * mMax, -mMax, mMax);
      target.current.x = clamp(-dy * mMax, -mMax, mMax);
    };
    const onTouchEnd = () => {
      if (modeRef.current !== "touch-fallback") return;
      target.current.x = 0;
      target.current.y = 0;
    };
    wrap.addEventListener("touchstart", onTouchStart, { passive: true });
    wrap.addEventListener("touchmove", onTouchMove, { passive: true });
    wrap.addEventListener("touchend", onTouchEnd);
    wrap.addEventListener("touchcancel", onTouchEnd);

    return () => {
      active = false;
      cancelAnimationFrame(rafRef.current);
      unsubscribe();
      wrap.removeEventListener("touchstart", onTouchStart);
      wrap.removeEventListener("touchmove", onTouchMove);
      wrap.removeEventListener("touchend", onTouchEnd);
      wrap.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [max]);

  const handlePointerEnter = () => {
    if (isMobile) return;
    setIsHovering(true);
  };
  const handlePointerMove = (e) => {
    if (isMobile) return;
    const inner = innerRef.current;
    const wrap = wrapRef.current;
    if (!inner || !wrap) return;
    const rect = wrap.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const m = max ?? DESKTOP_MAX;
    const dx = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const dy = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
    const rotY = clamp(dx * m, -m, m);
    const rotX = clamp(-dy * m, -m, m);
    inner.style.transform = `rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg)`;
  };
  const handlePointerLeave = () => {
    if (isMobile) return;
    setIsHovering(false);
    const inner = innerRef.current;
    if (inner) inner.style.transform = "rotateX(0deg) rotateY(0deg)";
  };

  return (
    <div
      ref={wrapRef}
      data-tilt-active="true"
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{
        position: "relative",
        perspective: `${perspective}px`,
        transformStyle: "preserve-3d",
        height: "100%",
      }}
    >
      <div
        ref={innerRef}
        style={{
          transformStyle: "preserve-3d",
          transition: isMobile
            ? "none"
            : isHovering
              ? "transform 75ms cubic-bezier(0.2, 0, 0.2, 1)"
              : "transform 500ms cubic-bezier(0.22, 1, 0.36, 1)",
          willChange: "transform",
          height: "100%",
        }}
      >
        {children}
      </div>
      {DEBUG_MOBILE && isMobile && (
        <div
          style={{
            position: "absolute",
            top: 6,
            left: 6,
            zIndex: 26,
            padding: "3px 6px",
            fontFamily: "monospace",
            fontSize: 9,
            lineHeight: 1.35,
            color: "#0f0",
            background: "rgba(0,0,0,0.7)",
            border: "1px solid #0f0",
            pointerEvents: "none",
            borderRadius: 2,
          }}
        >
          <div>mode: {debugInfo.mode}</div>
          <div>perm: {debugInfo.permission}</div>
          <div>evt: {debugInfo.orientationEventCount}</div>
          <div>β:{debugInfo.beta === null ? "—" : Math.round(debugInfo.beta)} γ:{debugInfo.gamma === null ? "—" : Math.round(debugInfo.gamma)}</div>
          <div>touch: {String(debugInfo.touchFallbackActive)}</div>
        </div>
      )}
    </div>
  );
}
