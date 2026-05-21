import { useEffect, useRef, useState } from "react";

export function GyroRawTest() {
  const [isMobile, setIsMobile] = useState(false);
  const [d, setD] = useState({
    isSecureContext: false,
    protocol: "",
    inIframe: false,
    // orientation
    doeAvailable: false,
    doeReqPerm: false,
    orientationPermission: "waiting",
    orientationEventCount: 0,
    beta: null,
    gamma: null,
    alpha: null,
    // motion
    dmeAvailable: false,
    dmeReqPerm: false,
    motionPermission: "waiting",
    motionEventCount: 0,
    accX: null,
    accY: null,
    accZ: null,
    rotA: null,
    rotB: null,
    rotG: null,
    error: "",
  });
  const orientHandlerRef = useRef(null);
  const motionHandlerRef = useRef(null);
  const orientCountRef = useRef(0);
  const motionCountRef = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    setIsMobile(coarse);
    if (!coarse) return;
    const Doe = window.DeviceOrientationEvent;
    const Dme = window.DeviceMotionEvent;
    setD((p) => ({
      ...p,
      isSecureContext: !!window.isSecureContext,
      protocol: window.location.protocol,
      inIframe: window.self !== window.top,
      doeAvailable: !!Doe,
      doeReqPerm: !!(Doe && typeof Doe.requestPermission === "function"),
      dmeAvailable: !!Dme,
      dmeReqPerm: !!(Dme && typeof Dme.requestPermission === "function"),
    }));
  }, []);

  const handleOrientation = (event) => {
    orientCountRef.current += 1;
    const b = typeof event.beta === "number" ? event.beta : null;
    const g = typeof event.gamma === "number" ? event.gamma : null;
    const a = typeof event.alpha === "number" ? event.alpha : null;
    console.log("[GYRO ORIENT]", b, g, a);
    setD((p) => ({
      ...p,
      orientationEventCount: orientCountRef.current,
      beta: b,
      gamma: g,
      alpha: a,
    }));
  };

  const handleMotion = (event) => {
    motionCountRef.current += 1;
    const ag = event.accelerationIncludingGravity;
    const rr = event.rotationRate;
    console.log("[GYRO MOTION]", ag, rr);
    setD((p) => ({
      ...p,
      motionEventCount: motionCountRef.current,
      accX: ag && typeof ag.x === "number" ? ag.x : null,
      accY: ag && typeof ag.y === "number" ? ag.y : null,
      accZ: ag && typeof ag.z === "number" ? ag.z : null,
      rotA: rr && typeof rr.alpha === "number" ? rr.alpha : null,
      rotB: rr && typeof rr.beta === "number" ? rr.beta : null,
      rotG: rr && typeof rr.gamma === "number" ? rr.gamma : null,
    }));
  };

  const handleClick = () => {
    console.log("[GYRO TEST] button clicked");
    const Doe = window.DeviceOrientationEvent;
    const Dme = window.DeviceMotionEvent;

    const attachOrient = () => {
      if (orientHandlerRef.current) {
        window.removeEventListener("deviceorientation", orientHandlerRef.current);
        window.removeEventListener("deviceorientationabsolute", orientHandlerRef.current);
      }
      orientHandlerRef.current = handleOrientation;
      window.addEventListener("deviceorientation", orientHandlerRef.current);
      window.addEventListener("deviceorientationabsolute", orientHandlerRef.current);
    };
    const attachMotion = () => {
      if (motionHandlerRef.current) {
        window.removeEventListener("devicemotion", motionHandlerRef.current);
      }
      motionHandlerRef.current = handleMotion;
      window.addEventListener("devicemotion", motionHandlerRef.current);
    };

    // Orientation
    if (!Doe) {
      setD((p) => ({ ...p, error: (p.error + " | DeviceOrientation absent").trim() }));
    } else if (typeof Doe.requestPermission === "function") {
      Doe.requestPermission()
        .then((res) => {
          console.log("[GYRO TEST] orient perm:", res);
          setD((p) => ({ ...p, orientationPermission: res }));
          if (res === "granted") attachOrient();
        })
        .catch((err) => {
          console.warn("[GYRO TEST] orient perm error", err);
          setD((p) => ({ ...p, orientationPermission: "denied", error: String(err) }));
        });
    } else {
      setD((p) => ({ ...p, orientationPermission: "not-needed" }));
      attachOrient();
    }

    // Motion (same gesture)
    if (!Dme) {
      setD((p) => ({ ...p, error: (p.error + " | DeviceMotion absent").trim() }));
    } else if (typeof Dme.requestPermission === "function") {
      Dme.requestPermission()
        .then((res) => {
          console.log("[GYRO TEST] motion perm:", res);
          setD((p) => ({ ...p, motionPermission: res }));
          if (res === "granted") attachMotion();
        })
        .catch((err) => {
          console.warn("[GYRO TEST] motion perm error", err);
          setD((p) => ({ ...p, motionPermission: "denied", error: String(err) }));
        });
    } else {
      setD((p) => ({ ...p, motionPermission: "not-needed" }));
      attachMotion();
    }
  };

  if (!isMobile) return null;

  const fmt = (v) => (typeof v === "number" ? v.toFixed(2) : String(v));

  const rotX = typeof d.beta === "number" ? Math.max(-30, Math.min(30, d.beta - 35)) : 0;
  const rotY = typeof d.gamma === "number" ? Math.max(-30, Math.min(30, d.gamma)) : 0;

  return (
    <div
      style={{
        position: "relative",
        zIndex: 99999,
        padding: 14,
        background: "#000",
        color: "#0f0",
        fontFamily: "monospace",
        fontSize: 12,
        lineHeight: 1.45,
        borderBottom: "2px solid #0f0",
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 8 }}>TEST GYROSCOPE BRUT</div>
      <div>isSecureContext: {String(d.isSecureContext)}</div>
      <div>protocol: {d.protocol}</div>
      <div>inIframe: {String(d.inIframe)}</div>
      <div style={{ marginTop: 8, borderTop: "1px dashed #0f0", paddingTop: 6 }}>
        — DeviceOrientationEvent —
      </div>
      <div>available: {d.doeAvailable ? "yes" : "no"}</div>
      <div>requestPermission: {d.doeReqPerm ? "available" : "unavailable"}</div>
      <div>orientationPermission: {d.orientationPermission}</div>
      <div>orientationEventCount: {d.orientationEventCount}</div>
      <div>beta: {fmt(d.beta)}</div>
      <div>gamma: {fmt(d.gamma)}</div>
      <div>alpha: {fmt(d.alpha)}</div>
      <div style={{ marginTop: 8, borderTop: "1px dashed #0f0", paddingTop: 6 }}>
        — DeviceMotionEvent —
      </div>
      <div>available: {d.dmeAvailable ? "yes" : "no"}</div>
      <div>requestPermission: {d.dmeReqPerm ? "available" : "unavailable"}</div>
      <div>motionPermission: {d.motionPermission}</div>
      <div>motionEventCount: {d.motionEventCount}</div>
      <div>accIncGrav x/y/z: {fmt(d.accX)} / {fmt(d.accY)} / {fmt(d.accZ)}</div>
      <div>rotationRate a/b/g: {fmt(d.rotA)} / {fmt(d.rotB)} / {fmt(d.rotG)}</div>
      {d.error && <div style={{ color: "#f55", marginTop: 6 }}>error: {d.error}</div>}
      {!d.isSecureContext && (
        <div style={{ color: "#ff0", marginTop: 6 }}>
          PAS EN CONTEXTE SÉCURISÉ — gyroscope probablement bloqué
        </div>
      )}
      {d.inIframe && (
        <div style={{ color: "#ff0", marginTop: 6 }}>
          Site ouvert en iframe — ouvrir directement dans le navigateur
        </div>
      )}
      <button
        type="button"
        onClick={handleClick}
        style={{
          marginTop: 10,
          padding: "12px 14px",
          width: "100%",
          background: "#0f0",
          color: "#000",
          border: "none",
          fontFamily: "monospace",
          fontSize: 13,
          fontWeight: 700,
          cursor: "pointer",
          borderRadius: 4,
        }}
      >
        Tester gyroscope (orient + motion)
      </button>
      <div
        style={{
          marginTop: 14,
          height: 140,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          perspective: 600,
        }}
      >
        <div
          style={{
            width: 120,
            height: 120,
            background: "#f00",
            border: "2px solid #fff",
            transform: `rotateX(${-rotX}deg) rotateY(${rotY}deg)`,
            transformStyle: "preserve-3d",
            transition: "transform 80ms linear",
          }}
        />
      </div>
    </div>
  );
}
