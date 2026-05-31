/**
 * InfiniteGallery3D
 * Adapted from 21st.dev: vaib215/3d-gallery-photography
 * Original: TypeScript + Tailwind. Adapted to plain JSX + inline styles
 * for the RS Kech project (Vite + React, no Tailwind / no TS / no shadcn).
 * Shader and gallery logic preserved verbatim.
 */

import { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

const DEFAULT_DEPTH_RANGE = 50;
const MAX_HORIZONTAL_OFFSET = 8;
const MAX_VERTICAL_OFFSET = 8;

function createClothMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    uniforms: {
      map: { value: null },
      opacity: { value: 1.0 },
      blurAmount: { value: 0.0 },
      scrollForce: { value: 0.0 },
      time: { value: 0.0 },
      isHovered: { value: 0.0 },
    },
    vertexShader: `
      uniform float scrollForce;
      uniform float time;
      uniform float isHovered;
      varying vec2 vUv;
      varying vec3 vNormal;

      void main() {
        vUv = uv;
        vNormal = normal;

        vec3 pos = position;

        float curveIntensity = scrollForce * 0.3;
        float distanceFromCenter = length(pos.xy);
        float curve = distanceFromCenter * distanceFromCenter * curveIntensity;

        float ripple1 = sin(pos.x * 2.0 + scrollForce * 3.0) * 0.02;
        float ripple2 = sin(pos.y * 2.5 + scrollForce * 2.0) * 0.015;
        float clothEffect = (ripple1 + ripple2) * abs(curveIntensity) * 2.0;

        float flagWave = 0.0;
        if (isHovered > 0.5) {
          float wavePhase = pos.x * 3.0 + time * 8.0;
          float waveAmplitude = sin(wavePhase) * 0.1;
          float dampening = smoothstep(-0.5, 0.5, pos.x);
          flagWave = waveAmplitude * dampening;
          float secondaryWave = sin(pos.x * 5.0 + time * 12.0) * 0.03 * dampening;
          flagWave += secondaryWave;
        }

        pos.z -= (curve + clothEffect + flagWave);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D map;
      uniform float opacity;
      uniform float blurAmount;
      uniform float scrollForce;
      varying vec2 vUv;
      varying vec3 vNormal;

      void main() {
        vec4 color = texture2D(map, vUv);

        if (blurAmount > 0.0) {
          vec2 texelSize = 1.0 / vec2(textureSize(map, 0));
          vec4 blurred = vec4(0.0);
          float total = 0.0;
          for (float x = -2.0; x <= 2.0; x += 1.0) {
            for (float y = -2.0; y <= 2.0; y += 1.0) {
              vec2 offset = vec2(x, y) * texelSize * blurAmount;
              float weight = 1.0 / (1.0 + length(vec2(x, y)));
              blurred += texture2D(map, vUv + offset) * weight;
              total += weight;
            }
          }
          color = blurred / total;
        }

        float curveHighlight = abs(scrollForce) * 0.05;
        color.rgb += vec3(curveHighlight * 0.1);

        gl_FragColor = vec4(color.rgb, color.a * opacity);
      }
    `,
  });
}

function ImagePlane({ texture, position, scale, material, meshRef }) {
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (material && texture) {
      material.uniforms.map.value = texture;
    }
  }, [material, texture]);

  useEffect(() => {
    if (material && material.uniforms) {
      material.uniforms.isHovered.value = isHovered ? 1.0 : 0.0;
    }
  }, [material, isHovered]);

  return (
    <mesh
      ref={meshRef}
      position={position}
      scale={scale}
      material={material}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
    >
      <planeGeometry args={[1, 1, 32, 32]} />
    </mesh>
  );
}

// --- Gallery speed / inertia tuning -------------------------------------
// Scroll stays locked to the page position. Velocity only adds a tiny live
// response and shader bend, so the gallery cannot finish long before the
// pinned section ends.
const WHEEL_IMPULSE_MULTIPLIER = 18;   // bigger = a wheel flick feels sharper
const INERTIA_DECAY = 0.84;            // closer to 1 = glides longer
const MAX_VELOCITY = 0.28;             // safety cap for a huge wheel flick
const MIN_VELOCITY = 0.0005;           // below this, snap velocity to 0 (stop)
const SCROLL_DIRECT_GAIN = 1;          // direct scroll-locked travel multiplier
const PROGRESS_SMOOTHING = 0.14;       // lower = smoother, slower visual catch-up
const VELOCITY_TRAVEL_GAIN = 0.6;      // small, non-accumulating depth response

function GalleryScene({
  images,
  visibleCount = 8,
  scrollMV,
  scrollTravel = DEFAULT_DEPTH_RANGE,
  fadeSettings = {
    fadeIn: { start: 0.05, end: 0.15 },
    fadeOut: { start: 0.85, end: 0.95 },
  },
  blurSettings = {
    blurIn: { start: 0.0, end: 0.1 },
    blurOut: { start: 0.9, end: 1.0 },
    maxBlur: 3.0,
  },
}) {
  // Page scroll is now the only source of progression. The same depth,
  // fade, blur, image order and shader math stay in place.
  // velocity damping and plane.z math are still handled inside the gallery.
  // Autoplay/timers no longer feed the gallery.
  const lastProgressRef = useRef(scrollMV ? scrollMV.get() : 0);
  const velocityRef = useRef(0);        // current inertial speed
  const smoothedProgressRef = useRef(scrollMV ? scrollMV.get() : 0);
  const meshRefs = useRef([]);

  const normalizedImages = useMemo(
    () => images.map((img) => (typeof img === "string" ? { src: img, alt: "" } : img)),
    [images]
  );

  const textures = useTexture(normalizedImages.map((img) => img.src));

  const materials = useMemo(
    () => Array.from({ length: visibleCount }, () => createClothMaterial()),
    [visibleCount]
  );

  const spatialPositions = useMemo(() => {
    const positions = [];
    const maxHorizontalOffset = MAX_HORIZONTAL_OFFSET;
    const maxVerticalOffset = MAX_VERTICAL_OFFSET;
    for (let i = 0; i < visibleCount; i++) {
      const horizontalAngle = (i * 2.618) % (Math.PI * 2);
      const verticalAngle = (i * 1.618 + Math.PI / 3) % (Math.PI * 2);
      const horizontalRadius = (i % 3) * 1.2;
      const verticalRadius = ((i + 1) % 4) * 0.8;
      const x = (Math.sin(horizontalAngle) * horizontalRadius * maxHorizontalOffset) / 3;
      const y = (Math.cos(verticalAngle) * verticalRadius * maxVerticalOffset) / 4;
      positions.push({ x, y });
    }
    return positions;
  }, [visibleCount]);

  const totalImages = normalizedImages.length;
  const depthRange = DEFAULT_DEPTH_RANGE;

  const planesData = useRef(
    Array.from({ length: visibleCount }, (_, i) => {
      const baseZ = visibleCount > 0 ? ((depthRange / visibleCount) * i) % depthRange : 0;
      const baseImageIndex = totalImages > 0 ? i % totalImages : 0;
      return {
        index: i,
        baseZ,
        z: baseZ,
        baseImageIndex,
        imageIndex: baseImageIndex,
        x: spatialPositions[i]?.x ?? 0,
        y: spatialPositions[i]?.y ?? 0,
      };
    })
  );

  useEffect(() => {
    planesData.current = Array.from({ length: visibleCount }, (_, i) => {
      const baseZ = visibleCount > 0 ? ((depthRange / Math.max(visibleCount, 1)) * i) % depthRange : 0;
      const baseImageIndex = totalImages > 0 ? i % totalImages : 0;
      return {
        index: i,
        baseZ,
        z: baseZ,
        baseImageIndex,
        imageIndex: baseImageIndex,
        x: spatialPositions[i]?.x ?? 0,
        y: spatialPositions[i]?.y ?? 0,
      };
    });
  }, [depthRange, spatialPositions, totalImages, visibleCount]);

  useFrame((state, delta) => {
    const rawProgress = scrollMV ? scrollMV.get() : 0;
    const progress = Math.max(0, Math.min(1, rawProgress));

    // Real scroll feeds a soft velocity, but visible travel remains tied to
    // scroll progress so there is no long dead zone after the final frame.
    const progressDelta = progress - lastProgressRef.current;
    lastProgressRef.current = progress;

    velocityRef.current += progressDelta * WHEEL_IMPULSE_MULTIPLIER;
    velocityRef.current *= INERTIA_DECAY;
    // Clamp so a huge wheel flick can't explode the motion.
    velocityRef.current = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, velocityRef.current));
    // Below threshold, stop completely to prevent autoplay drift.
    if (Math.abs(velocityRef.current) < MIN_VELOCITY) velocityRef.current = 0;

    // Shader force now reflects the lively inertial velocity, not raw delta.
    const scrollForce = Math.max(-2.5, Math.min(2.5, velocityRef.current * 1.2));

    const time = state.clock.getElapsedTime();
    const imageAdvance = totalImages > 0 ? visibleCount % totalImages || totalImages : 0;
    const totalRange = depthRange;
    const halfRange = totalRange / 2;
    const smoothing = 1 - Math.pow(1 - PROGRESS_SMOOTHING, Math.max(delta, 0) * 60);
    if (progress <= 0.002 || progress >= 0.998) {
      smoothedProgressRef.current = progress;
    } else {
      smoothedProgressRef.current += (progress - smoothedProgressRef.current) * smoothing;
    }

    // Scroll-locked travel + a very small live velocity offset. The offset is
    // not accumulated, which keeps the last visible step aligned with the
    // section end.
    const directTravel = smoothedProgressRef.current * scrollTravel * SCROLL_DIRECT_GAIN;
    const inertialTravel = velocityRef.current * VELOCITY_TRAVEL_GAIN;
    // Clamp the total to a single depth cycle so the gallery is seen exactly
    // once and the page resumes right after the animation is done.
    const travel = Math.max(0, Math.min(totalRange, directTravel + inertialTravel));

    planesData.current.forEach((plane, i) => {
      const newZ = plane.baseZ + travel;
      const wraps = Math.floor(newZ / totalRange);

      plane.z = ((newZ % totalRange) + totalRange) % totalRange;
      plane.x = spatialPositions[i]?.x ?? 0;
      plane.y = spatialPositions[i]?.y ?? 0;

      if (imageAdvance > 0 && totalImages > 0) {
        const nextImageIndex = plane.baseImageIndex + wraps * imageAdvance;
        plane.imageIndex = ((nextImageIndex % totalImages) + totalImages) % totalImages;
      }

      const normalizedPosition = plane.z / totalRange;
      let opacity = 1;

      if (
        normalizedPosition >= fadeSettings.fadeIn.start &&
        normalizedPosition <= fadeSettings.fadeIn.end
      ) {
        opacity = (normalizedPosition - fadeSettings.fadeIn.start) /
          (fadeSettings.fadeIn.end - fadeSettings.fadeIn.start);
      } else if (normalizedPosition < fadeSettings.fadeIn.start) {
        opacity = 0;
      } else if (
        normalizedPosition >= fadeSettings.fadeOut.start &&
        normalizedPosition <= fadeSettings.fadeOut.end
      ) {
        const fadeOutProgress = (normalizedPosition - fadeSettings.fadeOut.start) /
          (fadeSettings.fadeOut.end - fadeSettings.fadeOut.start);
        opacity = 1 - fadeOutProgress;
      } else if (normalizedPosition > fadeSettings.fadeOut.end) {
        opacity = 0;
      }
      opacity = Math.max(0, Math.min(1, opacity));

      let blur = 0;
      if (
        normalizedPosition >= blurSettings.blurIn.start &&
        normalizedPosition <= blurSettings.blurIn.end
      ) {
        const blurInProgress = (normalizedPosition - blurSettings.blurIn.start) /
          (blurSettings.blurIn.end - blurSettings.blurIn.start);
        blur = blurSettings.maxBlur * (1 - blurInProgress);
      } else if (normalizedPosition < blurSettings.blurIn.start) {
        blur = blurSettings.maxBlur;
      } else if (
        normalizedPosition >= blurSettings.blurOut.start &&
        normalizedPosition <= blurSettings.blurOut.end
      ) {
        const blurOutProgress = (normalizedPosition - blurSettings.blurOut.start) /
          (blurSettings.blurOut.end - blurSettings.blurOut.start);
        blur = blurSettings.maxBlur * blurOutProgress;
      } else if (normalizedPosition > blurSettings.blurOut.end) {
        blur = blurSettings.maxBlur;
      }
      blur = Math.max(0, Math.min(blurSettings.maxBlur, blur));

      const texture = textures[plane.imageIndex];
      const material = materials[i];
      if (material && material.uniforms) {
        material.uniforms.time.value = time;
        material.uniforms.scrollForce.value = scrollForce;
        material.uniforms.opacity.value = opacity;
        material.uniforms.blurAmount.value = blur;
        if (texture) {
          material.uniforms.map.value = texture;
        }
      }

      const mesh = meshRefs.current[i];
      if (mesh) {
        const worldZ = plane.z - halfRange;
        mesh.position.set(plane.x, plane.y, worldZ);

        if (texture) {
          const aspect = texture.image ? texture.image.width / texture.image.height : 1;
          const scale = aspect > 1 ? [2 * aspect, 2, 1] : [2, 2 / aspect, 1];
          mesh.scale.set(scale[0], scale[1], scale[2]);
        }
      }
    });
  });

  if (normalizedImages.length === 0) return null;

  return (
    <>
      {planesData.current.map((plane, i) => {
        const texture = textures[plane.imageIndex];
        const material = materials[i];
        if (!texture || !material) return null;

        const worldZ = plane.z - depthRange / 2;

        const aspect = texture.image ? texture.image.width / texture.image.height : 1;
        const scale = aspect > 1 ? [2 * aspect, 2, 1] : [2, 2 / aspect, 1];

        return (
          <ImagePlane
            key={plane.index}
            texture={texture}
            position={[plane.x, plane.y, worldZ]}
            scale={scale}
            material={material}
            meshRef={(node) => {
              meshRefs.current[i] = node;
            }}
          />
        );
      })}
    </>
  );
}

function FallbackGallery({ images }) {
  const normalizedImages = useMemo(
    () => images.map((img) => (typeof img === "string" ? { src: img, alt: "" } : img)),
    [images]
  );

  return (
    <div className="rs-gallery-fallback">
      <p className="rs-gallery-fallback__notice">
        WebGL non disponible — affichage en grille.
      </p>
      <div className="rs-gallery-fallback__grid">
        {normalizedImages.map((img, i) => (
          <img key={i} src={img.src} alt={img.alt} className="rs-gallery-fallback__img" loading="lazy" />
        ))}
      </div>
    </div>
  );
}

export default function InfiniteGallery3D({
  images,
  className,
  style,
  fadeSettings = {
    fadeIn: { start: 0.05, end: 0.25 },
    fadeOut: { start: 0.4, end: 0.43 },
  },
  blurSettings = {
    blurIn: { start: 0.0, end: 0.1 },
    blurOut: { start: 0.4, end: 0.43 },
    maxBlur: 8.0,
  },
  visibleCount = 8,
  scrollMV,
  scrollTravel = DEFAULT_DEPTH_RANGE,
}) {
  const [webglSupported, setWebglSupported] = useState(true);

  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (!gl) setWebglSupported(false);
    } catch (e) {
      setWebglSupported(false);
    }
  }, []);

  if (!webglSupported) {
    return (
      <div className={className} style={style}>
        <FallbackGallery images={images} />
      </div>
    );
  }

  return (
    <div className={className} style={style}>
      <Canvas
        className="rs-gallery-canvas"
        camera={{ position: [0, 0, 0], fov: 55 }}
        gl={{ antialias: true, alpha: true }}
      >
        <GalleryScene
          images={images}
          fadeSettings={fadeSettings}
          blurSettings={blurSettings}
          visibleCount={visibleCount}
          scrollMV={scrollMV}
          scrollTravel={scrollTravel}
        />
      </Canvas>
    </div>
  );
}
