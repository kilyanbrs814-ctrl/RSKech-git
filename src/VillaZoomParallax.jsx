import { motion, useScroll, useTransform, useSpring, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

function useViewport() {
  const [size, setSize] = useState(() => ({
    w: typeof window !== "undefined" ? window.innerWidth : 1440,
    h: typeof window !== "undefined" ? window.innerHeight : 900,
  }));
  useEffect(() => {
    const onResize = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return size;
}

export function VillaZoomParallax({
  imgSrc,
  alt,
  sectionTitle,
  sectionIntro,
  eyebrow,
  title,
  infoLabel,
  infoMain,
  infoSub,
}) {
  const sectionRef = useRef(null);
  const { w: vw, h: vh } = useViewport();
  const isMobile = vw < 768;
  const prefersReducedMotion = useReducedMotion();

  const baseWidthVw = isMobile ? 70 : 62;
  const baseMaxPx = isMobile ? Infinity : 900;
  const aspect = isMobile ? 16 / 10 : 21 / 9;
  const baseW = Math.min((baseWidthVw / 100) * vw, baseMaxPx);
  const baseH = baseW / aspect;

  const insetXStart = Math.max(0, (vw - baseW) / 2);
  const insetYStart = Math.max(0, (vh - baseH) / 2);
  const initialRadius = 30;

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // Smooth the raw scroll progress with a spring so the reveal continues
  // briefly after the user stops scrolling instead of freezing instantly.
  // Tuning: low-ish stiffness + moderate damping = a short, cinematic
  // overshoot-free settle (≈250–350ms). All derived transforms below read
  // from this smoothed value, so the clip-path, filter and text fade-in
  // all inherit the inertia automatically.
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 22,
    mass: 0.8,
  });

  // Reveal phase: 0 → 0.30
  const insetX = useTransform(smoothProgress, [0, 0.3], [insetXStart, 0]);
  const insetY = useTransform(smoothProgress, [0, 0.3], [insetYStart, 0]);
  const radiusPx = useTransform(smoothProgress, [0, 0.3], [initialRadius, 0]);
  const clipPath = useTransform(
    [insetY, insetX, radiusPx],
    ([y, x, r]) => `inset(${y}px ${x}px ${y}px ${x}px round ${r}px)`,
  );

  // Drop-shadow only during the reveal — disabled after, so it does not
  // create a permanent filter stacking context that can clobber the sibling text layer.
  const filter = useTransform(smoothProgress, (p) => {
    if (p >= 0.3) return "none";
    const o = 1 - p / 0.3;
    return `drop-shadow(0 30px 60px rgba(0,0,0,${0.45 * o}))`;
  });

  // Text fades in 0.42 → 0.55. THREE keyframes with explicit hold at 1
  // for progress 0.55 → 1.0 so opacity can never drop back to 0 while pinned.
  const textOpacity = useTransform(smoothProgress, [0.42, 0.55, 1], [0, 1, 1]);
  const textY = useTransform(smoothProgress, [0.42, 0.55, 1], [28, 0, 0]);

  if (prefersReducedMotion) {
    return (
      <div style={{ padding: "0 24px", marginBottom: 64, display: "flex", justifyContent: "center" }}>
        <div
          style={{
            position: "relative",
            width: "100%",
            maxWidth: 1180,
            aspectRatio: "21 / 9",
            overflow: "hidden",
            borderRadius: initialRadius,
            border: "1px solid var(--line-faint)",
          }}
        >
          <img
            src={imgSrc}
            alt={alt}
            loading="lazy"
            style={{
              position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
              width: "100%", height: "100%",
              objectFit: "cover", objectPosition: "center",
            }}
          />
          <ImageGradient />
          <InsideImageOverlay
            sectionTitle={sectionTitle}
            sectionIntro={sectionIntro}
            eyebrow={eyebrow}
            title={title}
            infoLabel={infoLabel}
            infoMain={infoMain}
            infoSub={infoSub}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      ref={sectionRef}
      style={{
        position: "relative",
        /* 200vh container with a 100vh sticky child means the user has only
           ~100vh of scroll inside the pin. Image reveal happens in 0→0.30,
           text fades in 0.42→0.55, leaving ~45vh of natural "hold" before
           the section releases — short enough to never feel stuck. */
        height: "200vh",
        marginBottom: 64,
      }}
    >
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          width: "100%",
          overflow: "hidden",
          isolation: "isolate",
        }}
      >
        {/* IMAGE LAYER — clipped */}
        <motion.div
          style={{
            position: "absolute",
            top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 1,
            clipPath,
            WebkitClipPath: clipPath,
            filter,
            willChange: "clip-path",
          }}
        >
          <img
            src={imgSrc}
            alt={alt}
            loading="lazy"
            style={{
              position: "absolute",
              top: 0, left: 0, right: 0, bottom: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
            }}
          />
          <ImageGradient />
        </motion.div>

        {/* TEXT LAYER — separate stacking, opacity OUTSIDE, slide-up INSIDE.
            Kept independent of the image layer so no clip-path / filter on the
            sibling can ever hide it while pinned. */}
        <motion.div
          style={{
            position: "absolute",
            top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 5,
            opacity: textOpacity,
            pointerEvents: "none",
          }}
        >
          <motion.div
            style={{
              position: "absolute",
              top: 0, left: 0, right: 0, bottom: 0,
              y: textY,
            }}
          >
            <InsideImageOverlay
              sectionTitle={sectionTitle}
              sectionIntro={sectionIntro}
              eyebrow={eyebrow}
              title={title}
              infoLabel={infoLabel}
              infoMain={infoMain}
              infoSub={infoSub}
            />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

function ImageGradient() {
  return (
    <div
      style={{
        position: "absolute",
        top: 0, left: 0, right: 0, bottom: 0,
        background:
          "linear-gradient(180deg, rgba(14,11,8,0.62) 0%, rgba(14,11,8,0.25) 22%, transparent 42%, transparent 58%, rgba(14,11,8,0.55) 80%, rgba(14,11,8,0.92) 100%)",
        pointerEvents: "none",
      }}
    />
  );
}

function InsideImageOverlay({
  sectionTitle,
  sectionIntro,
  eyebrow,
  title,
  infoLabel,
  infoMain,
  infoSub,
}) {
  return (
    <>
      <div
        style={{
          position: "absolute",
          top: "clamp(96px, 16vh, 180px)",
          left: "clamp(24px, 5vw, 64px)",
          right: "clamp(24px, 5vw, 64px)",
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)",
          gap: "clamp(20px, 4vw, 56px)",
          alignItems: "start",
        }}
        className="villa-parallax-top"
      >
        <h2
          className="display"
          style={{
            fontFamily: "var(--font-display)",
            fontStyle: "italic",
            fontSize: "clamp(40px, 2.4vw + 26px, 84px)",
            lineHeight: 0.95,
            letterSpacing: "-0.02em",
            color: "var(--fg-sand)",
            margin: 0,
          }}
        >
          {sectionTitle}
        </h2>
        <p
          style={{
            color: "var(--fg-linen)",
            fontSize: "clamp(14px, 0.3vw + 12.5px, 17px)",
            lineHeight: 1.55,
            maxWidth: "44ch",
            margin: 0,
            marginTop: 8,
          }}
        >
          {sectionIntro}
        </p>
      </div>

      <div
        className="header-2col"
        style={{
          position: "absolute",
          left: "clamp(24px, 5vw, 64px)",
          right: "clamp(24px, 5vw, 64px)",
          bottom: "clamp(24px, 5vh, 48px)",
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          alignItems: "end",
          gap: 32,
        }}
      >
        <div>
          <div className="eyebrow" style={{ color: "var(--gold-bright)" }}>
            {eyebrow}
          </div>
          <h3
            className="display"
            style={{
              fontSize: "clamp(26px, 1.4vw + 18px, 48px)",
              lineHeight: 1.08,
              marginTop: 12,
            }}
          >
            {title}
          </h3>
        </div>
        <div
          style={{
            padding: 20,
            background: "rgba(14, 11, 8, 0.6)",
            backdropFilter: "blur(10px)",
            border: "1px solid var(--line-soft)",
          }}
        >
          <div className="eyebrow-linen">{infoLabel}</div>
          <div className="display" style={{ fontSize: 28, marginTop: 4 }}>
            {infoMain}
          </div>
          <div className="body-sm" style={{ marginTop: 12 }}>
            {infoSub}
          </div>
        </div>
      </div>
    </>
  );
}
