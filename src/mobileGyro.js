// Shared mobile gyro singleton — strict mode separation: waiting | gyro | blocked | touch-fallback.

const GYRO_CONFIRM_EVENTS = 2;
const GYRO_TIMEOUT_MS = 1500;

let state = {
  isMobile: false,
  isSecureContext: false,
  doeAvailable: false,
  requestPermAvailable: false,
  permission: "waiting",
  beta: null,
  gamma: null,
  baseBeta: null,
  baseGamma: null,
  deltaBeta: 0,
  deltaGamma: 0,
  orientationEventCount: 0,
  validEventCount: 0,
  mode: "waiting",
  timeoutFired: false,
};

const listeners = new Set();
let initialized = false;
let orientHandler = null;
let timeoutId = null;
let listenerAttached = false;

function notify() {
  for (const l of listeners) l(state);
}

function setState(partial) {
  state = { ...state, ...partial };
  notify();
}

export function getMobileGyroState() {
  return state;
}

export function subscribeMobileGyro(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function attachOrientListeners() {
  if (!orientHandler || listenerAttached) return;
  window.addEventListener("deviceorientation", orientHandler);
  window.addEventListener("deviceorientationabsolute", orientHandler);
  listenerAttached = true;
}

function startTimeoutCheck() {
  if (timeoutId) clearTimeout(timeoutId);
  timeoutId = setTimeout(() => {
    if (state.validEventCount === 0) {
      console.warn("[GYRO] No valid events after " + GYRO_TIMEOUT_MS + "ms, falling back to touch");
      setState({ timeoutFired: true, mode: "touch-fallback" });
    }
  }, GYRO_TIMEOUT_MS);
}

function fallbackToTouch(reason) {
  console.warn("[GYRO] fallback to touch:", reason);
  setState({ mode: "blocked" });
  setTimeout(() => {
    if (state.mode === "blocked") {
      setState({ mode: "touch-fallback" });
    }
  }, 80);
}

export function initMobileGyro() {
  if (initialized) return;
  if (typeof window === "undefined") return;
  initialized = true;

  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const Doe = window.DeviceOrientationEvent;
  const reqPerm = !!(Doe && typeof Doe.requestPermission === "function");

  setState({
    isMobile: coarse,
    isSecureContext: !!window.isSecureContext,
    doeAvailable: !!Doe,
    requestPermAvailable: reqPerm,
    permission: reqPerm ? "waiting" : Doe ? "not-needed" : "unavailable",
    mode: "waiting",
  });

  console.log("[GYRO] init", {
    isMobile: coarse,
    isSecureContext: window.isSecureContext,
    doe: !!Doe,
    reqPerm,
    protocol: window.location.protocol,
  });

  if (!coarse) return;

  if (!Doe) {
    setState({ mode: "touch-fallback" });
    return;
  }

  orientHandler = (e) => {
    const b = typeof e.beta === "number" && Number.isFinite(e.beta) ? e.beta : null;
    const g = typeof e.gamma === "number" && Number.isFinite(e.gamma) ? e.gamma : null;
    const count = state.orientationEventCount + 1;
    if (b === null && g === null) {
      setState({ orientationEventCount: count });
      return;
    }
    let { baseBeta, baseGamma, validEventCount } = state;
    if (baseBeta === null) {
      baseBeta = b ?? 0;
      baseGamma = g ?? 0;
    }
    validEventCount += 1;
    const deltaBeta = (b ?? baseBeta) - baseBeta;
    const deltaGamma = (g ?? baseGamma) - baseGamma;
    const nextMode = validEventCount >= GYRO_CONFIRM_EVENTS ? "gyro" : state.mode;
    setState({
      beta: b,
      gamma: g,
      baseBeta,
      baseGamma,
      deltaBeta,
      deltaGamma,
      orientationEventCount: count,
      validEventCount,
      mode: nextMode,
    });
    if (count <= 3) console.log("[GYRO ORIENT]", { beta: b, gamma: g });
  };

  if (!reqPerm) {
    attachOrientListeners();
    startTimeoutCheck();
  }
}

export function requestGyroPermission() {
  const Doe = window.DeviceOrientationEvent;
  if (!Doe) {
    setState({ permission: "unavailable" });
    fallbackToTouch("no DeviceOrientationEvent");
    return;
  }
  if (typeof Doe.requestPermission !== "function") {
    setState({ permission: "not-needed" });
    if (orientHandler) {
      attachOrientListeners();
      startTimeoutCheck();
    }
    return;
  }
  console.log("[GYRO] requestPermission called");
  Doe.requestPermission()
    .then((res) => {
      console.log("[GYRO] requestPermission resolved:", res);
      if (res === "granted") {
        setState({ permission: "granted" });
        attachOrientListeners();
        startTimeoutCheck();
      } else {
        setState({ permission: "denied" });
        fallbackToTouch("permission denied");
      }
    })
    .catch((err) => {
      console.warn("[GYRO] permission error", err);
      setState({ permission: "denied" });
      fallbackToTouch("permission error");
    });
}
