import { useEffect, useState } from "react";
import {
  getMobileGyroState,
  subscribeMobileGyro,
  initMobileGyro,
  requestGyroPermission,
} from "./mobileGyro.js";

export function MobileGyroDebug() {
  const [s, setS] = useState(getMobileGyroState());
  useEffect(() => {
    initMobileGyro();
    setS(getMobileGyroState());
    return subscribeMobileGyro(setS);
  }, []);

  if (!s.isMobile) return null;

  const fmt = (v) => (typeof v === "number" ? v.toFixed(1) : String(v));

  return (
    <div
      style={{
        position: "fixed",
        bottom: 10,
        left: 10,
        right: 10,
        zIndex: 99999,
        padding: 10,
        fontFamily: "monospace",
        fontSize: 11,
        lineHeight: 1.45,
        color: "#0f0",
        background: "rgba(0,0,0,0.85)",
        border: "1px solid #0f0",
        borderRadius: 4,
        pointerEvents: "auto",
      }}
    >
      <div>isMobile: {String(s.isMobile)}</div>
      <div>isSecureContext: {String(s.isSecureContext)}</div>
      <div>DeviceOrientationEvent: {s.doeAvailable ? "available" : "unavailable"}</div>
      <div>requestPermission: {s.requestPermAvailable ? "available" : "unavailable"}</div>
      <div>permission: {s.permission}</div>
      <div>beta: {fmt(s.beta)}</div>
      <div>gamma: {fmt(s.gamma)}</div>
      <div>gyroEvents: {s.gyroEvents}</div>
      <div>mode: {s.mode}</div>
      {!s.isSecureContext && (
        <div style={{ color: "#ff0", marginTop: 6 }}>
          Gyroscope probablement bloqué car le site est en HTTP local. Tester en HTTPS ou utiliser fallback touch.
        </div>
      )}
      {s.timeoutFired && (
        <div style={{ color: "#ff0", marginTop: 4 }}>
          Aucun event gyroscope reçu — fallback touch actif
        </div>
      )}
      <button
        type="button"
        onClick={requestGyroPermission}
        style={{
          marginTop: 8,
          padding: "10px 12px",
          background: "#0f0",
          color: "#000",
          border: "none",
          fontFamily: "monospace",
          fontSize: 12,
          fontWeight: 700,
          width: "100%",
          cursor: "pointer",
          borderRadius: 3,
        }}
      >
        Activer gyroscope
      </button>
    </div>
  );
}
