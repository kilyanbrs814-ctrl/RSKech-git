#!/usr/bin/env node
/**
 * fix-hero-transition.mjs
 *
 * Goal: make the cut between public/videos/intro-hero.mp4 and
 * public/videos/hero-scroll.mp4 invisible by re-encoding both clips
 * with matching resolution / fps / pix_fmt / colorspace, and a mild
 * colour tweak on the intro so it lines up with hero-scroll.
 *
 * Outputs:
 *   public/videos/check-intro-last.png
 *   public/videos/check-hero-first.png
 *   public/videos/intro-hero-matched.mp4
 *   public/videos/hero-scroll-fixed.mp4
 *
 * Usage: npm run fix:hero-video
 */

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");
const videoDir = resolve(projectRoot, "public", "videos");

const intro = resolve(videoDir, "intro-hero.mp4");
const main = resolve(videoDir, "hero-scroll.mp4");

const introMatched = resolve(videoDir, "intro-hero-matched.mp4");
const mainFixed = resolve(videoDir, "hero-scroll-fixed.mp4");
const checkIntroLast = resolve(videoDir, "check-intro-last.png");
const checkHeroFirst = resolve(videoDir, "check-hero-first.png");

// Tunable colour-grade applied to the intro so it matches hero-scroll.
// Increase saturation / contrast / brightness if intro still looks dull.
const INTRO_EQ = "eq=saturation=1.15:contrast=1.06:brightness=0.015";

// Target encoding (both clips end up identical here).
const TARGET_FPS = 60;
const TARGET_W = 1920;
const TARGET_H = 1080;
const CRF = 18;
const PRESET = "veryfast";

function log(label, msg) {
  process.stdout.write(`[fix-hero] ${label.padEnd(10)} ${msg}\n`);
}

function fail(msg) {
  process.stderr.write(`[fix-hero] ERROR     ${msg}\n`);
  process.exit(1);
}

function ensureBinary(bin) {
  const r = spawnSync(bin, ["-version"], { encoding: "utf8" });
  if (r.error || r.status !== 0) {
    fail(
      `'${bin}' not found on PATH. Install FFmpeg (https://www.gyan.dev/ffmpeg/builds/ on Windows, ` +
        `'brew install ffmpeg' on macOS, 'apt install ffmpeg' on Debian/Ubuntu) and re-run.`
    );
  }
  const firstLine = (r.stdout || "").split(/\r?\n/)[0] || "(version unknown)";
  log("check", `${bin}: ${firstLine}`);
}

function ensureFile(path) {
  if (!existsSync(path)) fail(`Source video missing: ${path}`);
}

function probe(path) {
  const r = spawnSync(
    "ffprobe",
    [
      "-v",
      "error",
      "-select_streams",
      "v:0",
      "-show_entries",
      "stream=width,height,r_frame_rate,avg_frame_rate,codec_name,pix_fmt,color_space,color_transfer,color_primaries,bit_rate,duration",
      "-show_entries",
      "format=duration,bit_rate",
      "-of",
      "default=noprint_wrappers=1",
      path,
    ],
    { encoding: "utf8" }
  );
  if (r.status !== 0) fail(`ffprobe failed for ${path}: ${r.stderr}`);
  return r.stdout.trim();
}

function runFfmpeg(args, label) {
  log("ffmpeg", `${label}`);
  log("cmd", `ffmpeg ${args.join(" ")}`);
  const r = spawnSync("ffmpeg", args, { stdio: "inherit" });
  if (r.status !== 0) fail(`ffmpeg failed on step: ${label}`);
}

function sizeMB(path) {
  try {
    return (statSync(path).size / (1024 * 1024)).toFixed(2) + " MB";
  } catch {
    return "?";
  }
}

function main_() {
  log("start", `project root: ${projectRoot}`);
  if (!existsSync(videoDir)) mkdirSync(videoDir, { recursive: true });

  ensureBinary("ffmpeg");
  ensureBinary("ffprobe");
  ensureFile(intro);
  ensureFile(main);

  log("probe", `--- ${intro} ---`);
  process.stdout.write(probe(intro) + "\n");
  log("probe", `--- ${main} ---`);
  process.stdout.write(probe(main) + "\n");

  // Step 3 — control frames
  runFfmpeg(
    [
      "-y",
      "-sseof",
      "-0.05",
      "-i",
      intro,
      "-frames:v",
      "1",
      "-update",
      "1",
      checkIntroLast,
    ],
    "extract last frame of intro"
  );
  runFfmpeg(
    [
      "-y",
      "-ss",
      "0.05",
      "-i",
      main,
      "-frames:v",
      "1",
      "-update",
      "1",
      checkHeroFirst,
    ],
    "extract first frame of hero-scroll"
  );

  // Shared video filter so resolution / fps / pix_fmt match exactly.
  const baseScale = `scale=${TARGET_W}:${TARGET_H}:force_original_aspect_ratio=increase,crop=${TARGET_W}:${TARGET_H}`;
  const introVF = `fps=${TARGET_FPS},${baseScale},${INTRO_EQ},format=yuv420p`;
  const mainVF = `fps=${TARGET_FPS},${baseScale},format=yuv420p`;

  // Step 4 — re-encode intro with colour match
  runFfmpeg(
    [
      "-y",
      "-i",
      intro,
      "-an",
      "-vf",
      introVF,
      "-c:v",
      "libx264",
      "-preset",
      PRESET,
      "-crf",
      String(CRF),
      "-pix_fmt",
      "yuv420p",
      "-colorspace",
      "bt709",
      "-color_primaries",
      "bt709",
      "-color_trc",
      "bt709",
      "-movflags",
      "+faststart",
      introMatched,
    ],
    "encode intro-hero-matched.mp4"
  );

  // Step 5 — re-encode hero-scroll, every frame keyframed for scroll seeking
  runFfmpeg(
    [
      "-y",
      "-i",
      main,
      "-an",
      "-vf",
      mainVF,
      "-c:v",
      "libx264",
      "-preset",
      PRESET,
      "-crf",
      String(CRF),
      "-pix_fmt",
      "yuv420p",
      "-colorspace",
      "bt709",
      "-color_primaries",
      "bt709",
      "-color_trc",
      "bt709",
      "-g",
      "1",
      "-keyint_min",
      "1",
      "-sc_threshold",
      "0",
      "-movflags",
      "+faststart",
      mainFixed,
    ],
    "encode hero-scroll-fixed.mp4"
  );

  log("done", "outputs:");
  for (const f of [checkIntroLast, checkHeroFirst, introMatched, mainFixed]) {
    log("file", `${f}  (${sizeMB(f)})`);
  }
  log("next", "open the two PNGs side by side to inspect the seam, then run 'npm run dev'.");
  log(
    "tune",
    `if intro still looks dull/too vivid, edit INTRO_EQ in this script (eq=saturation=X:contrast=Y:brightness=Z) and re-run 'npm run fix:hero-video'.`
  );
}

main_();
