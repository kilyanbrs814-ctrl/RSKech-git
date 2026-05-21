import React, { useEffect, useRef, useState } from "react";
import { RevealOnScroll } from "./RevealOnScroll.jsx";
import { Tilt3D } from "./Tilt3D.jsx";
import { NeonCard } from "./NeonCard.jsx";

const FLEET = [
  { model: "Clio · 208",         cat: "urbain",   price: 50,   tags: ["Citadine"],                      img: "/images/fleet/clio.jpg",            focus: "50% 60%" },
  { model: "Seat Ibiza",         cat: "urbain",   price: 70,   tags: ["Citadine"],                      img: "/images/fleet/ibiza.jpg",           focus: "50% 60%" },
  { model: "T-Roc",              cat: "suv",      price: 100,  tags: ["SUV compact"],                   img: "/images/fleet/t-roc.jpg",           focus: "50% 60%" },
  { model: "Golf 8",             cat: "urbain",   price: 150,  tags: ["Compacte"],                      img: "/images/fleet/golf-8.jpg",          focus: "50% 60%" },
  { model: "Classe A",           cat: "prestige", price: 150,  tags: ["Premium"],                       img: "/images/fleet/classe-a.jpg",        focus: "50% 55%" },
  { model: "Audi A3",            cat: "prestige", price: 150,  tags: ["Premium"],                       img: "/images/fleet/a3.jpg",              focus: "50% 55%" },
  { model: "Cupra Formentor",    cat: "sport",    price: 150,  tags: ["Sport"],                         img: "/images/fleet/cupra-formentor.jpg", focus: "50% 60%" },
  { model: "Range Évoque",       cat: "suv",      price: 150,  tags: ["SUV premium"],                   img: "/images/fleet/range-evoque.jpg",    focus: "50% 60%" },
  { model: "Touareg 2025",       cat: "suv",      price: 160,  tags: ["SUV", "Édition 2025"],           img: "/images/fleet/tiguan.jpg",          focus: "50% 60%" },
  { model: "Audi Q3 normal",     cat: "suv",      price: 140,  tags: ["SUV premium"],                   img: "/images/fleet/q3.jpg",              focus: "50% 60%" },
  { model: "Audi Q3 S-Line",     cat: "suv",      price: 150,  tags: ["S-Line"],                        img: "/images/fleet/q3-sline.jpg",        focus: "50% 60%" },
  { model: "Audi Q8 S-Line",     cat: "suv",      price: 250,  tags: ["Grand SUV", "S-Line"],           img: "/images/fleet/q8.jpg",              focus: "50% 60%" },
  { model: "BMW Série 4",        cat: "sport",    price: 300,  tags: ["Coupé sport"],                   img: "/images/fleet/serie-4.jpg",         focus: "50% 60%" },
  { model: "Porsche Macan",      cat: "prestige", price: 250,  tags: ["SUV sport"],                     img: "/images/fleet/porsche-macan.jpg",   focus: "50% 60%" },
  { model: "Porsche Macan T",    cat: "prestige", price: 280,  tags: ["Édition T"],                     img: "/images/fleet/porsche-macan.jpg",   focus: "50% 60%" },
  { model: "Porsche Cayenne",    cat: "prestige", price: 450,  tags: ["Grand SUV"],                     img: "/images/fleet/porsche-cayenne.jpg", focus: "50% 60%" },
  { model: "Range Sport",        cat: "prestige", price: 400,  tags: ["Grand SUV"],                     img: "/images/fleet/range-sport.jpg",     focus: "50% 55%" },
  { model: "A 35 AMG",           cat: "sport",    price: 280,  tags: ["Sport", "3 jours min."],         img: "/images/fleet/a35.jpg",             focus: "50% 60%" },
  { model: "Audi RS3 2024",      cat: "rs",       price: 350,  tags: ["RS", "48h min."],                img: "/images/fleet/rs3.jpg",             focus: "50% 60%" },
  { model: "Audi RS3 2025",      cat: "rs",       price: 450,  tags: ["RS", "48h min.", "Édition 2025"], img: "/images/fleet/rs3-2025.jpg",       focus: "50% 60%" },
  { model: "C63 SE Performance", cat: "rs",       price: 500,  tags: ["Full", "Limitée"],               img: "/images/fleet/c63s.jpg",            focus: "50% 60%" },
  { model: "Classe G",           cat: "icon",     price: 1300, tags: ["Icône", "24h possible"],         img: "/images/fleet/classe-g.jpg",        focus: "50% 60%" },
];

const FILTERS = [
  { id: "all",      label: "Toute la flotte" },
  { id: "urbain",   label: "Urbain" },
  { id: "suv",      label: "SUV" },
  { id: "prestige", label: "Prestige" },
  { id: "sport",    label: "Sport" },
  { id: "rs",       label: "RS / Performance" },
  { id: "icon",     label: "Icônes" },
];

const PACKS = [
  {
    name: "L'Essentiel",
    eyebrow: "Pack 03 jours",
    desc: "L'arrivée à Marrakech, sobre et efficace. Idéal pour un city-break premium.",
    price: 690,
    items: [
      { label: "Véhicule", value: "Audi A3 ou Classe A" },
      { label: "Logement", value: "Appartement 2 ch — Hivernage" },
      { label: "Activité", value: "Buggy 1h offerte" },
      { label: "Livraison", value: "Aéroport ou hôtel" },
    ],
    featured: false,
  },
  {
    name: "Signature",
    eyebrow: "Pack 05 jours",
    desc: "La formule de référence. Une voiture qui en impose, une villa avec piscine, une journée dans l'Atlas.",
    price: 1950,
    items: [
      { label: "Véhicule", value: "Audi Q3 S-Line + scooter T-Max" },
      { label: "Logement", value: "Villa 3 ch — piscine privée" },
      { label: "Activité", value: "Buggy demi-journée · −30%" },
      { label: "Livraison", value: "Aéroport · plein offert" },
    ],
    featured: true,
  },
  {
    name: "Concierge",
    eyebrow: "Pack 07 jours",
    desc: "Le séjour à la carte. RS, villa de réception, chef, chauffeur, accès clubs.",
    price: 4900,
    items: [
      { label: "Véhicule", value: "Audi RS3 2025 ou Classe G" },
      { label: "Logement", value: "Villa 4 ch · Palmeraie · chef" },
      { label: "Activité", value: "Buggy + quad + cross · journée" },
      { label: "Extras", value: "Chauffeur · sécurité · table" },
    ],
    featured: false,
  },
];

const VILLAS = [
  { name: "Villa Najma",   loc: "Palmeraie", ch: 4, capacity: 8,  price: 1800 },
  { name: "Riad El Bahia", loc: "Médina",    ch: 3, capacity: 6,  price: 1100 },
  { name: "Villa Yasmina", loc: "Agdal",     ch: 5, capacity: 10, price: 2400 },
];

const CONTACTS = [
  { role: "ROULEZ",      title: "Voitures & Motos de Prestige",                phone: "+212 712 993 940", note: "Livraison aéroport · réservation 48h",       icon: "wheel" },
  { role: "HABITEZ",     title: "Villas & Appartements d'Exception",           phone: "+212 699 156 024", note: "Médina · Palmeraie · Hivernage · Agdal",     icon: "door"  },
  { role: "ÉVADEZ-VOUS", title: "Activités Premium · Buggy / Quad / Cross",    phone: "+212 640 801 056", note: "Atlas Buggy Quad · ouvert 7j/7 · 10h–21h",   icon: "compass" },
];

const UNIVERSES = [
  {
    num: "I",
    tag: "Roulez",
    title: "Voitures & motos\nde prestige",
    copy: "De la citadine urbaine au SUV de chasse, en passant par la RS et la Classe G. Livraison à votre porte, kilométrage généreux, assistance 24/7.",
    cta: "Voir la flotte",
    href: "#fleet",
    img: "/images/univers-roulez.png",
    imageClassName: "universe-image--roulez",
    imagePosition: "center 85%",
    tall: false,
  },
  {
    num: "II",
    tag: "Séjournez",
    title: "Villas & appartements\nd'exception",
    copy: "Médina, Palmeraie, Hivernage. Piscines privées, chefs sur demande, conciergerie résidente. Une adresse, pas un séjour.",
    cta: "Voir les adresses",
    href: "#villas",
    img: "/images/univers-habitez.jpg",
    tall: true,
  },
  {
    num: "III",
    tag: "Profitez",
    title: "Buggy, quad\n& cross 2026",
    copy: "Modèles débridés, dérapage autorisé. Excursions encadrées dans l'Atlas et les pistes ocre du Sud. Édition limitée 2026.",
    cta: "Activités hors-piste",
    href: "#offroad",
    img: "/images/univers-profitez.jpg",
    tall: false,
  },
];

const MACHINES = [
  { name: "Can-Am Maverick R", year: "2026", kind: "Buggy 4 places", power: "240 ch", tag: "Édition limitée" },
  { name: "700 Raptor",        year: "2026", kind: "Quad sport",     power: "686 cc", tag: "Débridé" },
  { name: "Yamaha YZ 125",     year: "2026", kind: "Moto cross",     power: "125 cc", tag: "Pro" },
];

const MARQUEE_ITEMS = [
  "Édition 2026",
  "22 véhicules",
  "Livraison aéroport",
  "Conciergerie 7j/7",
  "Activité offerte sur les packs",
  "Modèles débridés · accès libre",
  "WhatsApp · réponse < 8 min",
  "Atlas · Palmeraie · Médina",
];

// ── Scenes ──────────────────────────────────────────────

function PalmSilhouette({ style = {}, mirror = false }) {
  return (
    <svg viewBox="0 0 200 400" style={{ ...style, transform: mirror ? `scaleX(-1) ${style.transform || ""}` : style.transform }}>
      <rect x="96" y="120" width="8" height="280" fill="#0A0805" />
      <path d="M100 120 Q 95 250, 102 400" stroke="#0A0805" strokeWidth="6" fill="none" />
      {[
        { rot: -90, len: 90 }, { rot: -65, len: 100 }, { rot: -40, len: 95 },
        { rot: -15, len: 105 }, { rot: 15, len: 100 }, { rot: 40, len: 95 },
        { rot: 65, len: 100 }, { rot: 90, len: 90 },
      ].map((f, i) => (
        <g key={i} transform={`translate(100 120) rotate(${f.rot})`}>
          <path d={`M0 0 Q ${f.len * 0.5} -10, ${f.len} -30 L${f.len + 4} -28 Q ${f.len * 0.5} -6, 0 4 Z`} fill="#0A0805" />
          {[0.3, 0.5, 0.7, 0.85].map((p, j) => (
            <line key={j} x1={f.len * p} y1={-10 * p - 4} x2={f.len * p + 14} y2={-10 * p - 18} stroke="#0A0805" strokeWidth="2" />
          ))}
        </g>
      ))}
    </svg>
  );
}

function VillaScene({ caption = "VILLA" }) {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <div style={{
        position: "absolute", inset: 0,
        background: `radial-gradient(80% 60% at 50% 100%, rgba(232, 166, 72, 0.35), transparent 70%), linear-gradient(180deg, #0E0B08 0%, #1A100A 60%, #2A1810 100%)`,
      }} />
      <svg viewBox="0 0 400 80" preserveAspectRatio="none" style={{ position: "absolute", left: 0, right: 0, bottom: "50%", width: "100%", height: 30, opacity: 0.5 }}>
        <path d="M0,80 L0,50 L40,50 L40,30 L80,30 L80,55 L120,55 L120,40 L180,40 L180,60 L240,60 L240,35 L300,35 L300,55 L360,55 L360,45 L400,45 L400,80 Z" fill="#0A0805" />
      </svg>
      <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMax meet" style={{ position: "absolute", left: 0, right: 0, bottom: 0, width: "100%", height: "70%" }}>
        <defs>
          <linearGradient id="wallG" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#2A1810" />
            <stop offset="100%" stopColor="#150F0B" />
          </linearGradient>
          <radialGradient id="archGlow" cx="0.5" cy="0.85" r="0.7">
            <stop offset="0%" stopColor="#E8A648" stopOpacity="1" />
            <stop offset="60%" stopColor="#B8703C" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#3A1F12" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect x="0" y="80" width="400" height="220" fill="url(#wallG)" />
        <path d="M 160 280 L 160 180 Q 160 130, 200 130 Q 240 130, 240 180 L 240 280 Z" fill="url(#archGlow)" />
        <path d="M 160 280 L 160 180 Q 160 130, 200 130 Q 240 130, 240 180 L 240 280" stroke="#5A3820" strokeWidth="2" fill="none" />
        <rect x="60"  y="170" width="40" height="50" fill="rgba(232, 166, 72, 0.7)" />
        <rect x="60"  y="170" width="40" height="50" fill="none" stroke="#5A3820" strokeWidth="1.5" />
        <rect x="300" y="170" width="40" height="50" fill="rgba(232, 166, 72, 0.7)" />
        <rect x="300" y="170" width="40" height="50" fill="none" stroke="#5A3820" strokeWidth="1.5" />
        <rect x="0"   y="270" width="400" height="30" fill="rgba(80, 140, 150, 0.4)" />
      </svg>
      <PalmSilhouette style={{ position: "absolute", left: -20, bottom: 8, height: 180, opacity: 0.7 }} />
      <div style={{ position: "absolute", top: 14, left: 14, fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.18em", color: "rgba(232, 217, 193, 0.5)", textTransform: "uppercase" }}>
        {caption}
      </div>
    </div>
  );
}

function DesertScene({ caption = "ATLAS" }) {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <div style={{
        position: "absolute", inset: 0,
        background: `radial-gradient(35% 25% at 78% 55%, rgba(255, 200, 100, 0.9), rgba(255, 120, 60, 0.5) 30%, transparent 70%), linear-gradient(180deg, #2A1810 0%, #5A2A14 30%, #B85C2A 55%, #D87838 65%, #2A1810 100%)`,
      }} />
      <div style={{
        position: "absolute", top: "48%", right: "20%",
        width: 60, height: 60, borderRadius: "50%",
        background: "radial-gradient(circle, #FFE0A0, #FF9A40 70%, transparent 100%)",
        filter: "blur(1px)",
      }} />
      <svg viewBox="0 0 800 120" preserveAspectRatio="none" style={{ position: "absolute", left: 0, right: 0, bottom: "40%", width: "100%", height: 60 }}>
        <polygon points="0,120 0,80 80,40 160,60 240,30 320,55 400,25 480,50 560,35 640,55 720,40 800,60 800,120" fill="#3A1810" opacity="0.85" />
      </svg>
      <svg viewBox="0 0 800 100" preserveAspectRatio="none" style={{ position: "absolute", left: 0, right: 0, bottom: "32%", width: "100%", height: 50 }}>
        <polygon points="0,100 0,60 100,40 200,65 300,50 400,70 500,55 600,75 700,55 800,70 800,100" fill="#2A1006" opacity="0.95" />
      </svg>
      <svg viewBox="0 0 800 200" preserveAspectRatio="none" style={{ position: "absolute", left: 0, right: 0, bottom: 0, width: "100%", height: "40%" }}>
        <defs>
          <linearGradient id="duneG" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%"   stopColor="#9A4820" />
            <stop offset="100%" stopColor="#3A1A0A" />
          </linearGradient>
        </defs>
        <path d="M0,200 L0,80 Q 200,30 400,90 Q 600,150 800,60 L800,200 Z" fill="url(#duneG)" />
      </svg>
      <div style={{
        position: "absolute", left: "-10%", right: "-10%", bottom: "5%", height: 20,
        background: "repeating-linear-gradient(95deg, transparent 0 12px, rgba(40, 18, 10, 0.7) 12px 18px)",
        transform: "rotate(-2deg)", opacity: 0.6,
      }} />
      <div style={{
        position: "absolute", left: "-10%", right: "-10%", bottom: "12%", height: 16,
        background: "repeating-linear-gradient(95deg, transparent 0 10px, rgba(40, 18, 10, 0.5) 10px 16px)",
        transform: "rotate(-3deg)", opacity: 0.5,
      }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(70% 50% at 50% 80%, rgba(180, 110, 60, 0.3), transparent 70%)" }} />
      <div style={{ position: "absolute", top: 14, left: 14, fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.18em", color: "rgba(255, 230, 200, 0.7)", textTransform: "uppercase" }}>
        ▌ {caption}
      </div>
    </div>
  );
}

function PoolScene() {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <div style={{
        position: "absolute", inset: 0, height: "50%",
        background: `radial-gradient(60% 50% at 70% 100%, rgba(232, 166, 72, 0.45), transparent 70%), linear-gradient(180deg, #0E0B08, #1F140C)`,
      }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: "40%", bottom: "40%", background: `linear-gradient(180deg, #2A1810, #150F0B)` }} />
      <div style={{
        position: "absolute", left: "20%", right: "20%", top: "45%", bottom: "46%",
        background: "radial-gradient(50% 100% at 50% 50%, rgba(232, 166, 72, 0.6), transparent 70%)",
      }} />
      <div style={{
        position: "absolute", left: 0, right: 0, bottom: 0, height: "40%",
        background: `linear-gradient(180deg, rgba(60, 120, 130, 0.7) 0%, rgba(20, 50, 60, 0.95) 100%), repeating-linear-gradient(0deg, transparent 0 8px, rgba(232, 166, 72, 0.06) 8px 9px)`,
      }} />
      {[0.55, 0.65, 0.75, 0.85].map((p) => (
        <div key={p} style={{
          position: "absolute", left: "10%", right: "10%", top: `${p * 100}%`, height: 1,
          background: "linear-gradient(90deg, transparent, rgba(232, 217, 193, 0.25) 50%, transparent)",
        }} />
      ))}
      <PalmSilhouette style={{ position: "absolute", left: -30, bottom: "30%", height: 220, opacity: 0.85 }} />
      <PalmSilhouette mirror style={{ position: "absolute", right: -20, bottom: "32%", height: 200, opacity: 0.8 }} />
    </div>
  );
}

// ── Sections ────────────────────────────────────────────

function AmbientLayer() {
  return (
    <div className="ambient" aria-hidden="true">
      <div className="halo halo--warm-1"></div>
      <div className="halo halo--warm-2"></div>
      <div className="halo halo--red"></div>
      <div className="halo halo--gold"></div>
      <div className="halo halo--warm-3"></div>
    </div>
  );
}

function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const heroWrap = document.getElementById("top");
      if (heroWrap) {
        const rect = heroWrap.getBoundingClientRect();
        // Show nav only when hero is fully past the viewport (sticky released)
        setScrolled(rect.bottom <= 0);
      } else {
        setScrolled(window.scrollY > 30);
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const links = [
    { id: "fleet",     label: "Flotte" },
    { id: "packs",     label: "Packs" },
    { id: "offroad",   label: "Off-road" },
    { id: "villas",    label: "Villas" },
    { id: "concierge", label: "Conciergerie" },
  ];

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      transition: "opacity .35s ease, background .35s ease, height .35s ease",
      background: scrolled ? "rgba(14, 11, 8, 0.78)" : "transparent",
      backdropFilter: scrolled ? "blur(14px) saturate(140%)" : "none",
      WebkitBackdropFilter: scrolled ? "blur(14px) saturate(140%)" : "none",
      borderBottom: scrolled ? "1px solid rgba(201, 168, 106, 0.1)" : "1px solid transparent",
      opacity: scrolled ? 1 : 0,
      pointerEvents: scrolled ? "auto" : "none",
      visibility: scrolled ? "visible" : "hidden",
    }}>
      <div className="wrap" style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: scrolled ? 64 : 80, transition: "height .35s ease",
      }}>
        <a href="#top" style={{ display: "flex", alignItems: "baseline", gap: 8, fontFamily: "var(--font-display)", fontStyle: "italic" }}>
          <span style={{ fontSize: 26, color: "var(--rs-red)", letterSpacing: "-0.02em", fontWeight: 600, fontStyle: "normal", fontFamily: "var(--font-mono)" }}>RS</span>
          <span style={{ fontSize: 22, color: "var(--fg-sand)", fontStyle: "italic" }}>kech</span>
          <span className="hide-sm" style={{
            marginLeft: 14, paddingLeft: 14, borderLeft: "1px solid var(--line-soft)",
            fontFamily: "var(--font-mono)", fontStyle: "normal",
            fontSize: 10, letterSpacing: "0.22em", color: "var(--fg-linen)", textTransform: "uppercase",
          }}>Marrakech · 26'</span>
        </a>

        <div className="hide-sm" style={{ display: "flex", alignItems: "center", gap: 36 }}>
          {links.map((l) => (
            <a key={l.id} href={`#${l.id}`} style={{
              fontFamily: "var(--font-mono)", fontSize: 11,
              letterSpacing: "0.18em", textTransform: "uppercase",
              color: "var(--fg-linen)", transition: "color .2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--fg-sand)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--fg-linen)")}>
              {l.label}
            </a>
          ))}
        </div>

        <a href="#concierge" className="btn btn--ghost" style={{ padding: "10px 16px" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#3DBE5F", boxShadow: "0 0 10px #3DBE5F" }} />
          Concierge 7/7
        </a>
      </div>
    </nav>
  );
}

function Hero() {
  const videoRef = useRef(null);
  const [stage, setStage] = useState(0);

  // Lock body scroll until intro done
  useEffect(() => {
    const htmlPrev = document.documentElement.style.overflow;
    const bodyPrev = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = htmlPrev;
      document.body.style.overflow = bodyPrev;
    };
  }, []);

  // Unlock when stage reaches 5
  useEffect(() => {
    if (stage >= 5) {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    }
  }, [stage]);

  // Autoplay video as soon as possible
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const start = () => {
      const p = video.play();
      if (p && typeof p.then === "function") p.catch(() => {});
    };
    if (video.readyState >= 2) start();
    else video.addEventListener("canplay", start, { once: true });
    return () => video.removeEventListener("canplay", start);
  }, []);

  // Speed up the intro until the final 20%, then finish at normal speed.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const INTRO_FAST_RATE = 1.25;
    const fastUntil = 0.8;
    let frameId = null;
    let isWatching = false;

    const syncPlaybackRate = () => {
      const { currentTime, duration } = video;
      if (!Number.isFinite(duration) || duration <= 0) return;

      const progress = currentTime / duration;
      const nextRate = progress < fastUntil ? INTRO_FAST_RATE : 1;
      if (video.playbackRate !== nextRate) {
        video.playbackRate = nextRate;
      }
    };

    const stopWatching = () => {
      isWatching = false;
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
        frameId = null;
      }
    };

    const watchProgress = () => {
      syncPlaybackRate();

      if (video.paused || video.ended) {
        stopWatching();
        return;
      }

      frameId = requestAnimationFrame(watchProgress);
    };

    const startWatching = () => {
      syncPlaybackRate();
      if (isWatching || video.paused || video.ended) return;

      isWatching = true;
      frameId = requestAnimationFrame(watchProgress);
    };

    const finishAtNormalSpeed = () => {
      video.playbackRate = 1;
      stopWatching();
    };

    video.addEventListener("loadedmetadata", syncPlaybackRate);
    video.addEventListener("durationchange", syncPlaybackRate);
    video.addEventListener("play", startWatching);
    video.addEventListener("playing", startWatching);
    video.addEventListener("pause", stopWatching);
    video.addEventListener("ended", finishAtNormalSpeed);

    syncPlaybackRate();
    startWatching();

    return () => {
      stopWatching();
      video.removeEventListener("loadedmetadata", syncPlaybackRate);
      video.removeEventListener("durationchange", syncPlaybackRate);
      video.removeEventListener("play", startWatching);
      video.removeEventListener("playing", startWatching);
      video.removeEventListener("pause", stopWatching);
      video.removeEventListener("ended", finishAtNormalSpeed);
    };
  }, []);

  // Chained stagger after video ends
  const handleEnded = () => {
    if (stage > 0) return;
    setStage(1);
    const timers = [
      setTimeout(() => setStage(2), 500),   // title + rails
      setTimeout(() => setStage(3), 1000),  // description
      setTimeout(() => setStage(4), 1500),  // buttons
      setTimeout(() => setStage(5), 2300),  // unlock scroll
    ];
    handleEnded.timers = timers;
  };

  useEffect(() => () => {
    if (handleEnded.timers) handleEnded.timers.forEach(clearTimeout);
  }, []);

  const cls = (level) => stage >= level ? " is-visible" : "";

  return (
    <div id="top" className="hero-wrap">
    <section className="hero-section">
      <div style={{
        position: "absolute", inset: 0, zIndex: 0, overflow: "hidden",
        transform: "translateZ(0)",
        backfaceVisibility: "hidden",
        willChange: "transform",
      }}>
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
          tabIndex={-1}
          disablePictureInPicture
          onEnded={handleEnded}
          style={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%",
            objectFit: "cover",
            objectPosition: "center center",
            transform: "translate3d(0, 0, 0) scale(1.01)",
            transformOrigin: "center top",
            backfaceVisibility: "hidden",
            willChange: "transform",
            pointerEvents: "none",
          }}
        >
          <source src="/videos/hero-scroll.mp4" type="video/mp4" />
        </video>
        <div className={`hero-stage-overlay${cls(1)}`} style={{
          position: "absolute", inset: 0,
          background: `
            linear-gradient(90deg, rgba(14,11,8,0.78) 0%, rgba(14,11,8,0.55) 30%, rgba(14,11,8,0.18) 55%, transparent 80%),
            linear-gradient(180deg, rgba(14,11,8,0.12) 0%, transparent 25%, transparent 55%, rgba(14,11,8,0.88) 92%, var(--bg-deep) 100%)
          `,
        }} />
        <div className={`hero-stage-overlay${cls(1)}`} style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(140% 110% at 40% 50%, transparent 40%, rgba(14,11,8,0.45) 100%)",
          pointerEvents: "none",
        }} />
      </div>

      <div className={`hide-sm hero-stage-rail${cls(2)}`} style={{
        position: "absolute", left: 32, top: "50%", transform: "translateY(-50%) rotate(-90deg)",
        transformOrigin: "left center",
        fontFamily: "var(--font-mono)", fontSize: 10,
        letterSpacing: "0.32em", textTransform: "uppercase",
        color: "var(--fg-dim)", zIndex: 2, whiteSpace: "nowrap",
      }}>
        31.6295° N — 7.9811° W · ATLAS / PALMERAIE
      </div>
      <div className={`hide-sm hero-stage-rail${cls(2)}`} style={{
        position: "absolute", right: 32, top: "50%", transform: "translateY(-50%) rotate(90deg)",
        transformOrigin: "right center",
        fontFamily: "var(--font-mono)", fontSize: 10,
        letterSpacing: "0.32em", textTransform: "uppercase",
        color: "var(--gold)", zIndex: 2, whiteSpace: "nowrap",
      }}>
        CHAPTER 01 · L'ARRIVÉE
      </div>

      <div className="wrap hero-content">
        <div className={`hero-stage-eyebrow${cls(1)}`} style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ width: 32, height: 1, background: "var(--gold)" }} />
          <span className="eyebrow">RS KECH · ÉDITION 2026 · LOCATION DE PRESTIGE</span>
        </div>

        <div className="hero-content__headline">
          <h1 className={`display h1 hero-stage-title${cls(2)}`} style={{ letterSpacing: "-0.02em" }}>
            <span style={{ display: "block" }}>
              <span style={{ color: "var(--fg-sand)" }}>Évadez-vous </span>
              <span style={{ color: "var(--gold)" }}>à Marrakech.</span>
            </span>
          </h1>

          <p className={`body-lg hero-stage-desc${cls(3)}`} style={{ marginTop: 32, fontSize: 19, maxWidth: "52ch", color: "var(--fg-sand)" }}>
            Une conciergerie privée pour combiner{" "}
            <em style={{ color: "var(--gold)", fontStyle: "italic", fontFamily: "var(--font-display)" }}>voitures de prestige</em>,
            villas d'exception et excursions tout-terrain — un seul interlocuteur, du premier message à la clé.
          </p>

          <div className={`hero-stage-btn${cls(4)}`} style={{ marginTop: 44, display: "flex", gap: 14, flexWrap: "wrap" }}>
            <a href="#fleet" className="btn btn--primary" style={{ backgroundColor: "var(--gold)", color: "#1A140B" }}>
              Voir les véhicules
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </a>
            <a href="#packs" className="btn btn--ghost">Créer mon pack sur mesure</a>
          </div>
        </div>

      </div>
    </section>
    </div>
  );
}

function Marquee() {
  const row = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
  return (
    <div className="marquee-rail">
      <div className="marquee-track">
        {row.map((t, i) => (
          <span key={i} className={`marquee-item ${i % 4 === 0 ? "is-gold" : ""}`}>
            {t}
            <span className="star">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function Universes() {
  return (
    <section id="universes" className="section">
      <div className="wrap">
        <div className="sec-header">
          <div className="sec-header__meta">
            <span className="eyebrow">— 02 · Nos univers</span>
            <h2 className="sec-header__title">
              Trois mondes,<br />
              <span style={{ color: "var(--gold)" }}>une seule signature.</span>
            </h2>
          </div>
          <p className="sec-header__intro">
            RS KECH n'est ni un loueur, ni une agence : c'est une conciergerie privée qui orchestre votre séjour à Marrakech, de la clé du véhicule à la table du soir.
          </p>
        </div>

        <div className="grid-3" style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 22,
          alignItems: "stretch",
          maxWidth: 1180,
          margin: "0 auto",
        }}>
          {UNIVERSES.map((it, i) => (
            <RevealOnScroll key={i} delay={i * 0.1} direction={["left", "up", "right"][i % 3]}>
            <Tilt3D>
            <NeonCard>
            <article className="card" style={{
              padding: 20,
              height: "100%",
              display: "flex", flexDirection: "column",
              minHeight: 560,
              background: "var(--bg-leather)",
              borderColor: "var(--line-soft)",
            }}>
              <div style={{
                position: "absolute", top: -28, left: 24,
                fontFamily: "var(--font-display)", fontStyle: "italic",
                fontSize: 96, lineHeight: 1, color: "var(--gold)",
                pointerEvents: "none",
              }}>{it.num}</div>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <span className="eyebrow">{it.tag}</span>
              </div>

              <div className={it.imageClassName} style={{
                position: "relative",
                marginTop: 22,
                width: "100%",
                height: 260,
                overflow: "hidden",
                border: "1px solid var(--line-faint)",
                backgroundImage: `url("${it.img}")`,
                backgroundSize: "cover",
                backgroundPosition: it.imagePosition || "center",
              }}>
                <div style={{
                  position: "absolute", left: 0, right: 0, bottom: 0, height: "40%",
                  background: "linear-gradient(180deg, transparent, rgba(14, 11, 8, 0.55))",
                  pointerEvents: "none",
                }} />
                <div style={{ position: "absolute", left: 14, bottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 16, height: 1, background: "var(--gold)" }} />
                  <span className="eyebrow" style={{ color: "var(--gold-bright)" }}>{it.tag}</span>
                </div>
              </div>

              <h3 className="display" style={{ marginTop: 22, fontSize: 32, lineHeight: 1.05, whiteSpace: "pre-line" }}>
                {it.title}
              </h3>

              <p className="body" style={{ marginTop: 14, color: "var(--fg-linen)" }}>{it.copy}</p>

              <div style={{ marginTop: "auto", paddingTop: 20 }}>
                <a href={it.href} className="link-arrow">{it.cta} →</a>
              </div>
            </article>
            </NeonCard>
            </Tilt3D>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}

function Spec({ label, value }) {
  return (
    <div>
      <div style={{ opacity: 0.55, fontSize: 9 }}>{label}</div>
      <div style={{ color: "var(--fg-linen)", marginTop: 4 }}>{value}</div>
    </div>
  );
}

function VehicleCard({ v, currency, index }) {
  const display = currency === "MAD" ? Math.round(v.price * 11) : v.price;
  const symbol = currency === "MAD" ? "MAD" : "€";
  const accent = v.cat === "rs" || v.cat === "icon";

  return (
    <NeonCard>
    <article className="card" style={{
      padding: 0, display: "flex", flexDirection: "column",
      borderColor: accent ? "var(--line-soft)" : "var(--line-faint)",
    }}>
      <div style={{ position: "relative", height: 220, overflow: "hidden", background: "#0a0a0a" }}>
        <img
          src={v.img}
          alt={v.model}
          loading="lazy"
          style={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%",
            objectFit: "cover",
            objectPosition: v.focus || "50% 55%",
            filter: "saturate(0.92) contrast(1.02)",
          }}
        />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 35%, rgba(0,0,0,0) 65%, rgba(0,0,0,0.45) 100%)",
          pointerEvents: "none",
        }} />
        <div style={{ position: "absolute", top: 14, left: 14, display: "flex", gap: 6, flexWrap: "wrap" }}>
          {v.tags.map((t, i) => (
            <span key={i} className={`tag ${v.cat === "rs" && t === "RS" ? "tag--red" : ""}`}>{t}</span>
          ))}
        </div>
        <div style={{
          position: "absolute", top: 14, right: 14,
          fontFamily: "var(--font-mono)", fontSize: 10,
          letterSpacing: "0.18em", color: "var(--fg-dim)",
        }}>
          № {String(index + 1).padStart(2, "0")}
        </div>
      </div>

      <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
        <h4 className="display" style={{ fontSize: 28, lineHeight: 1 }}>{v.model}</h4>

        <div style={{
          display: "flex", gap: 16,
          paddingTop: 12, borderTop: "1px solid var(--line-faint)",
          fontFamily: "var(--font-mono)", fontSize: 10,
          letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--fg-dim)",
        }}>
          <Spec label="Boîte" value="Auto" />
          <Spec label="Pl." value="5" />
          <Spec label="Carb." value={v.cat === "rs" || v.cat === "sport" ? "95" : "Diesel"} />
        </div>

        <div style={{ marginTop: 4, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <div className="eyebrow-linen" style={{ fontSize: 9 }}>À partir de</div>
            <div className="price" style={{ fontSize: 30, marginTop: 2 }}>
              {display}<span style={{ fontSize: 14, marginLeft: 4 }}>{symbol}/j</span>
            </div>
          </div>
          <a href="#concierge" className="link-arrow" style={{ fontSize: 10, paddingBottom: 2 }}>Réserver →</a>
        </div>
      </div>
    </article>
    </NeonCard>
  );
}

function Fleet() {
  const [filter, setFilter] = useState("all");
  const [currency, setCurrency] = useState("EUR");
  const list = filter === "all" ? FLEET : FLEET.filter((v) => v.cat === filter);

  return (
    <section id="fleet" className="section section--leather">
      <div className="wrap">
        <div className="sec-header">
          <div className="sec-header__meta">
            <span className="eyebrow">— 03 · La flotte</span>
            <h2 className="sec-header__title">
              Vingt-deux clés.<br />
              <span style={{ color: "var(--gold)", fontStyle: "italic" }}>Une seule</span> qui vous attend.
            </h2>
          </div>
          <p className="sec-header__intro">
            Citadine pour la médina, SUV pour l'Atlas, RS pour la route d'Ouarzazate. Toute la flotte est entretenue en interne, livrée propre, pleine et prête.
          </p>
        </div>

        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          marginBottom: 36, flexWrap: "wrap", gap: 16,
          paddingBottom: 18, borderBottom: "1px solid var(--line-faint)",
        }}>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {FILTERS.map((f) => {
              const active = f.id === filter;
              return (
                <button key={f.id} onClick={() => setFilter(f.id)} style={{
                  padding: "10px 16px",
                  fontFamily: "var(--font-mono)", fontSize: 11,
                  letterSpacing: "0.16em", textTransform: "uppercase",
                  color: active ? "var(--bg-deep)" : "var(--fg-linen)",
                  background: active ? "var(--gold)" : "transparent",
                  border: "1px solid",
                  borderColor: active ? "var(--gold)" : "var(--line-faint)",
                  transition: "all .2s",
                }}>
                  {f.label}
                </button>
              );
            })}
          </div>

          <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--line-faint)" }}>
            {["EUR", "MAD"].map((c) => (
              <button key={c} onClick={() => setCurrency(c)} style={{
                padding: "10px 14px",
                fontFamily: "var(--font-mono)", fontSize: 11,
                letterSpacing: "0.18em",
                color: currency === c ? "var(--bg-deep)" : "var(--fg-linen)",
                background: currency === c ? "var(--gold)" : "transparent",
              }}>{c}</button>
            ))}
          </div>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 18,
        }}>
          {list.map((v, i) => (
            <RevealOnScroll key={v.model} delay={(i % 6) * 0.06}>
              <VehicleCard v={v} currency={currency} index={FLEET.indexOf(v)} />
            </RevealOnScroll>
          ))}
        </div>

        <div style={{
          marginTop: 48, padding: 28,
          border: "1px solid var(--line-faint)",
          display: "flex", justifyContent: "space-between", alignItems: "center", gap: 24, flexWrap: "wrap",
        }}>
          <div>
            <div className="eyebrow">Vous ne trouvez pas votre modèle ?</div>
            <p className="body" style={{ marginTop: 8, maxWidth: "60ch" }}>
              Nous sourçons sur demande. Précisez le modèle, les dates, le kilométrage et l'usage — réponse sous 2 heures.
            </p>
          </div>
          <a href="#concierge" className="btn btn--ghost">Demander un modèle</a>
        </div>
      </div>
    </section>
  );
}

function SpecVilla({ label, v }) {
  return (
    <div>
      <div className="eyebrow-linen" style={{ fontSize: 9 }}>{label}</div>
      <div style={{ marginTop: 4, color: "var(--fg-sand)", fontSize: 13 }}>{v}</div>
    </div>
  );
}

function Villas() {
  return (
    <section id="villas" className="section section--leather">
      <div className="wrap">
        <div className="sec-header">
          <div className="sec-header__meta">
            <span className="eyebrow">— 06 · Logements d'exception</span>
            <h2 className="sec-header__title">
              Une adresse,<br />
              <span style={{ color: "var(--gold)" }}>pas un séjour.</span>
            </h2>
          </div>
          <p className="sec-header__intro">
            Trois quartiers, une exigence : conciergerie résidente, piscine, chef sur demande, transfert aéroport. Les villas peuvent être combinées à n'importe quel pack.
          </p>
        </div>

        <div style={{
          position: "relative",
          aspectRatio: "21 / 9",
          marginBottom: 64,
          overflow: "hidden",
          border: "1px solid var(--line-faint)",
        }}>
          <PoolScene />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 50%, rgba(14, 11, 8, 0.85) 100%)", pointerEvents: "none" }} />
          <div className="header-2col" style={{
            position: "absolute", left: 32, bottom: 32, right: 32,
            display: "grid", gridTemplateColumns: "2fr 1fr", alignItems: "end", gap: 32,
          }}>
            <div>
              <div className="eyebrow" style={{ color: "var(--gold-bright)" }}>Villa de la nuit · Palmeraie</div>
              <h3 className="display" style={{ fontSize: "clamp(36px, 5vw, 72px)", lineHeight: 1, marginTop: 12 }}>
                « La piscine se rallume à 21h, <br />les palmiers, à 21h02. »
              </h3>
            </div>
            <div style={{
              padding: 20,
              background: "rgba(14, 11, 8, 0.6)",
              backdropFilter: "blur(10px)",
              border: "1px solid var(--line-soft)",
            }}>
              <div className="eyebrow-linen">Disponible</div>
              <div className="display" style={{ fontSize: 28, marginTop: 4 }}>Juin → Septembre</div>
              <div className="body-sm" style={{ marginTop: 12 }}>4 ch · 8 voy. · chef · piscine privée</div>
            </div>
          </div>
        </div>

        <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {VILLAS.map((v, i) => (
            <RevealOnScroll key={i} delay={i * 0.1}>
            <NeonCard>
            <article className="card" style={{ padding: 0 }}>
              <div style={{ height: 320, position: "relative" }}>
                <VillaScene caption={`${v.name} · ${v.loc}`} />
                <div style={{ position: "absolute", top: 14, left: 14 }}>
                  <span className="tag">{v.loc}</span>
                </div>
              </div>
              <div style={{ padding: 24 }}>
                <h4 className="display" style={{ fontSize: 32, lineHeight: 1 }}>{v.name}</h4>
                <div style={{
                  marginTop: 18, paddingTop: 16, borderTop: "1px solid var(--line-faint)",
                  display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12,
                }}>
                  <SpecVilla label="Chambres" v={`${v.ch} ch`} />
                  <SpecVilla label="Voyageurs" v={`${v.capacity} pers.`} />
                  <SpecVilla label="Piscine" v="Privée" />
                </div>
                <div style={{ marginTop: 22, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                  <div>
                    <div className="eyebrow-linen" style={{ fontSize: 9 }}>À partir de</div>
                    <div className="price" style={{ fontSize: 28, marginTop: 2 }}>
                      {v.price}<span style={{ fontSize: 13, marginLeft: 4 }}>€/nuit</span>
                    </div>
                  </div>
                  <a href="#concierge" className="link-arrow" style={{ fontSize: 10 }}>Visiter →</a>
                </div>
              </div>
            </article>
            </NeonCard>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}

function Stat({ label, v }) {
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "80px 1fr", gap: 16,
      padding: "8px 0", borderBottom: "1px solid var(--line-faint)",
    }}>
      <span className="eyebrow-linen" style={{ fontSize: 10 }}>{label}</span>
      <span style={{ color: "var(--fg-sand)", fontSize: 14 }}>{v}</span>
    </div>
  );
}

function Offroad() {
  return (
    <section id="offroad" className="section--fade-edges" style={{
      position: "relative",
      padding: "140px 0 120px",
      background: `radial-gradient(80% 60% at 100% 0%, rgba(224, 80, 32, 0.18), transparent 60%),
        linear-gradient(180deg, var(--bg-deep) 0%, #1A0E0A 14%, #160A06 60%, #110906 86%, var(--bg-deep) 100%)`,
      overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: 80, right: 0, width: "40%", height: 4,
        background: "linear-gradient(90deg, transparent, var(--rs-red) 30%, var(--rs-red))",
        opacity: 0.4,
      }} />

      <div className="wrap" style={{ position: "relative" }}>
        <div className="header-2col" style={{
          display: "grid", gridTemplateColumns: "2fr 1fr",
          gap: 48, marginBottom: 56, alignItems: "end",
        }}>
          <div>
            <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <span className="eyebrow" style={{ color: "var(--rs-red)" }}>— 05 · Off-road</span>
              <span className="tag tag--red">Modèles 2026</span>
              <span className="tag">Accès libre · 7j/7</span>
            </div>
            <h2 className="display" style={{
              marginTop: 20,
              fontSize: "clamp(56px, 8vw, 132px)",
              lineHeight: 0.9, letterSpacing: "-0.02em",
            }}>
              <span style={{ display: "block", color: "var(--fg-sand)" }}>Véhicules</span>
              <span style={{ display: "block", color: "var(--rs-red)" }}>débridés.</span>
              <span style={{ display: "block", color: "var(--fg-linen)", fontSize: "0.42em", fontStyle: "italic", marginTop: 16 }}>
                Dérapage autorisé.
              </span>
            </h2>
          </div>
          <div>
            <p className="body" style={{ color: "var(--fg-sand)", fontSize: 17, maxWidth: "32ch" }}>
              Excursions encadrées dans l'Atlas et les pistes ocre du Sud. Briefing, équipement et radio inclus.
            </p>
            <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 6 }}>
              <Stat label="Pistes"   v="Atlas · Agafay · Désert" />
              <Stat label="Durée"    v="1h · 2h · Journée" />
              <Stat label="Horaires" v="10:00 — 21:00" />
              <Stat label="Base"     v="Waze : Atlas Buggy Quad" />
            </div>
          </div>
        </div>

        <div style={{
          position: "relative",
          height: 380,
          marginBottom: 64,
          overflow: "hidden",
          border: "1px solid var(--line-faint)",
        }}>
          <DesertScene caption="Atlas · 18:42" />
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(90deg, rgba(20, 10, 6, 0.55) 0%, transparent 50%, rgba(20, 10, 6, 0.55) 100%)",
            pointerEvents: "none",
          }} />
          <div style={{ position: "absolute", left: 24, bottom: 20, display: "flex", gap: 14, alignItems: "baseline", flexWrap: "wrap" }}>
            <div className="eyebrow" style={{ color: "var(--gold)" }}>Atlas · 18:42</div>
            <div className="body-sm" style={{ color: "var(--fg-sand)" }}>« Le moment où la piste devient orange. »</div>
          </div>
        </div>

        <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {MACHINES.map((m, i) => (
            <RevealOnScroll key={i} delay={i * 0.1}>
            <NeonCard style={{ transform: i === 1 ? "rotate(0.5deg)" : i === 2 ? "rotate(-0.4deg)" : "rotate(-0.2deg)" }}>
            <article className="card" style={{
              padding: 0,
              background: "rgba(0,0,0,0.35)",
              borderColor: "rgba(200, 40, 28, 0.18)",
              display: "flex", flexDirection: "column",
            }}>
              <div style={{ height: 200, position: "relative" }}>
                <DesertScene caption={`${m.kind} · ${m.year}`} />
                <div style={{ position: "absolute", top: 14, right: 14 }}>
                  <span className="tag tag--red">{m.tag}</span>
                </div>
              </div>
              <div style={{ padding: 22 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <div>
                    <h4 className="display" style={{ fontSize: 28, lineHeight: 1 }}>{m.name}</h4>
                    <div className="body-sm" style={{ marginTop: 6 }}>{m.kind}</div>
                  </div>
                  <div className="eyebrow" style={{ color: "var(--rs-red)" }}>{m.year}</div>
                </div>
                <div style={{
                  marginTop: 20, paddingTop: 16,
                  borderTop: "1px solid rgba(200,40,28,0.18)",
                  display: "flex", justifyContent: "space-between",
                  fontFamily: "var(--font-mono)", fontSize: 11,
                  letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--fg-linen)",
                }}>
                  <span>{m.power}</span>
                  <a href="#concierge" style={{ color: "var(--rs-red)" }}>Réserver →</a>
                </div>
              </div>
            </article>
            </NeonCard>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}

function PackCard({ p, index }) {
  return (
    <NeonCard style={{
      transform: p.featured ? "translateY(-16px)" : "none",
      boxShadow: p.featured ? "0 30px 60px -30px rgba(201, 168, 106, 0.25)" : "none",
    }}>
    <article style={{
      position: "relative",
      padding: 32,
      background: p.featured ? "var(--bg-tobacco)" : "var(--bg-leather)",
      border: "1px solid",
      borderColor: p.featured ? "var(--gold)" : "var(--line-faint)",
      display: "flex", flexDirection: "column",
      minHeight: 560,
    }}>
      <div style={{
        position: "absolute", top: -14, right: 24,
        padding: "8px 14px",
        background: p.featured ? "var(--rs-red)" : "var(--bg-deep)",
        color: "#fff",
        border: p.featured ? "none" : "1px solid var(--line-soft)",
        fontFamily: "var(--font-mono)", fontSize: 10,
        letterSpacing: "0.2em", textTransform: "uppercase",
      }}>
        Activité offerte
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div className="eyebrow" style={{ color: p.featured ? "var(--gold-bright)" : "var(--gold)" }}>
          {p.eyebrow}
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.18em", color: "var(--fg-dim)" }}>
          N° 0{index}
        </div>
      </div>

      <h3 className="display" style={{ marginTop: 12, fontSize: 56, lineHeight: 0.95 }}>
        {p.name}
      </h3>

      <p className="body" style={{ marginTop: 16, color: "var(--fg-linen)", maxWidth: "38ch" }}>
        {p.desc}
      </p>

      <ul style={{
        marginTop: 28, paddingTop: 24, listStyle: "none",
        borderTop: "1px solid var(--line-faint)",
        display: "flex", flexDirection: "column", gap: 16,
      }}>
        {p.items.map((it, i) => (
          <li key={i} style={{ display: "grid", gridTemplateColumns: "14px 90px 1fr", gap: 12, alignItems: "baseline" }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ marginTop: 4 }}>
              <path d="M2 7l3.5 3.5L12 3" stroke="var(--gold)" strokeWidth="1.5" />
            </svg>
            <span className="eyebrow-linen" style={{ fontSize: 9 }}>{it.label}</span>
            <span style={{ color: "var(--fg-sand)", fontSize: 14 }}>{it.value}</span>
          </li>
        ))}
      </ul>

      <div style={{ marginTop: "auto", paddingTop: 32 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
          <span className="eyebrow-linen" style={{ fontSize: 10 }}>À partir de</span>
        </div>
        <div className="price" style={{
          fontSize: 56, marginTop: 4, lineHeight: 1,
          color: p.featured ? "var(--gold-bright)" : "var(--gold)",
        }}>
          {p.price}<span style={{ fontSize: 18, marginLeft: 6 }}>€</span>
        </div>
        <div className="body-sm" style={{ marginTop: 4 }}>tout compris · livraison incluse</div>

        <a href="#concierge" className={`btn ${p.featured ? "btn--gold" : "btn--ghost"}`} style={{
          marginTop: 24, width: "100%", justifyContent: "center",
        }}>
          Demander ce pack
        </a>
      </div>
    </article>
    </NeonCard>
  );
}

function Packs() {
  return (
    <section id="packs" className="section" style={{ position: "relative" }}>
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(60% 50% at 50% 0%, rgba(224, 138, 60, 0.08), transparent 70%)",
        pointerEvents: "none",
      }} />

      <div className="wrap" style={{ position: "relative" }}>
        <div className="sec-header">
          <div className="sec-header__meta">
            <span className="eyebrow">— 04 · Packs sur mesure</span>
            <h2 className="sec-header__title">
              Trois formules.<br />
              <span style={{ color: "var(--gold)" }}>Mille combinaisons.</span>
            </h2>
          </div>
          <p className="sec-header__intro">
            Choisissez une base, on ajuste les modèles, les nuits, les chefs et les pistes. Une activité est toujours offerte.
          </p>
        </div>

        <div className="grid-3" style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 20,
          alignItems: "stretch",
        }}>
          {PACKS.map((p, i) => (
            <RevealOnScroll key={i} delay={i * 0.12}>
              <PackCard p={p} index={i + 1} />
            </RevealOnScroll>
          ))}
        </div>

        <div style={{ marginTop: 96 }}>
          <div className="eyebrow" style={{ color: "var(--fg-linen)" }}>— Comment ça marche</div>
          <div className="grid-4" style={{
            marginTop: 28,
            display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0,
            borderTop: "1px solid var(--line-faint)",
            borderBottom: "1px solid var(--line-faint)",
          }}>
            {[
              { num: "01", t: "Vous nous dites", d: "Dates, voyageurs, envies. Un message WhatsApp suffit." },
              { num: "02", t: "On propose",      d: "Trois combinaisons véhicule + logement + activité, sous 2h." },
              { num: "03", t: "On affine",       d: "Vous validez, on ajuste, on bloque tout en interne." },
              { num: "04", t: "On livre",        d: "Clés à l'aéroport, plein offert, briefing 10 min." },
            ].map((s, i) => (
              <div key={i} style={{ padding: 28, borderLeft: i === 0 ? "none" : "1px solid var(--line-faint)" }}>
                <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 56, color: "var(--gold)", lineHeight: 1 }}>{s.num}</div>
                <div style={{ marginTop: 16, color: "var(--fg-sand)", fontSize: 17 }}>{s.t}</div>
                <div className="body-sm" style={{ marginTop: 8 }}>{s.d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Icon({ name }) {
  const s = { width: 22, height: 22, stroke: "var(--gold)", strokeWidth: 1.2, fill: "none" };
  if (name === "wheel") return (
    <svg viewBox="0 0 24 24" {...s}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v6M12 15v6M3 12h6M15 12h6" />
    </svg>
  );
  if (name === "door") return (
    <svg viewBox="0 0 24 24" {...s}>
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18" />
      <path d="M4 22h16" />
      <circle cx="14.5" cy="12.5" r="0.8" fill="currentColor" />
    </svg>
  );
  return (
    <svg viewBox="0 0 24 24" {...s}>
      <circle cx="12" cy="12" r="9" />
      <path d="M16 8l-2.5 6.5L7 17l2.5-6.5L16 8z" />
    </svg>
  );
}

function Concierge() {
  return (
    <section id="concierge" className="section" style={{ position: "relative" }}>
      <div className="wrap">
        <div style={{
          padding: 64,
          background: `radial-gradient(80% 100% at 0% 0%, rgba(224,138,60,0.10), transparent 50%), var(--bg-tobacco)`,
          border: "1px solid var(--line-soft)",
          position: "relative",
          overflow: "hidden",
        }}>
          <div className="header-2col" style={{
            display: "grid", gridTemplateColumns: "1fr auto",
            justifyContent: "space-between", alignItems: "flex-start", gap: 24,
            paddingBottom: 32, borderBottom: "1px dashed var(--line-faint)",
          }}>
            <div>
              <div className="eyebrow">— 07 · Conciergerie privée</div>
              <h2 className="display" style={{ marginTop: 16, fontSize: "clamp(48px, 6vw, 88px)", lineHeight: 0.95 }}>
                Un conseiller,<br />
                <span style={{ color: "var(--gold)" }}>pas un standard.</span>
              </h2>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="eyebrow-linen">Édition</div>
              <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 48, color: "var(--fg-sand)", lineHeight: 1, marginTop: 4 }}>2026</div>
              <div className="eyebrow-linen" style={{ marginTop: 8 }}>Marrakech · Maroc</div>
            </div>
          </div>

          <p style={{
            marginTop: 32, fontSize: 19, color: "var(--fg-sand)", maxWidth: "60ch",
            fontFamily: "var(--font-display)", fontStyle: "italic",
          }}>
            « Un conseiller vous accompagne du premier message à la clé du véhicule —<br />
            sept jours sur sept, en français, arabe et anglais. »
          </p>

          <div style={{ marginTop: 48 }}>
            {CONTACTS.map((c, i) => (
              <RevealOnScroll key={i} delay={i * 0.08} amount={0.3}>
              <a href={`tel:${c.phone.replace(/\s/g, "")}`}
                className="concierge-row"
                style={{
                  display: "grid",
                  gridTemplateColumns: "40px 120px 1fr auto",
                  gap: 28, alignItems: "center",
                  padding: "28px 0",
                  borderTop: "1px solid var(--line-faint)",
                  transition: "background .25s ease, padding .25s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(201, 168, 106, 0.04)";
                  e.currentTarget.style.paddingLeft = "12px";
                  e.currentTarget.style.paddingRight = "12px";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.paddingLeft = "0";
                  e.currentTarget.style.paddingRight = "0";
                }}
              >
                <Icon name={c.icon} />
                <span className="eyebrow concierge-role" style={{ color: "var(--rs-red)" }}>{c.role}</span>
                <div>
                  <div style={{ color: "var(--fg-sand)", fontSize: 18 }}>{c.title}</div>
                  <div className="body-sm" style={{ marginTop: 4 }}>{c.note}</div>
                </div>
                <div className="concierge-phone" style={{
                  fontFamily: "var(--font-display)", fontStyle: "italic",
                  fontSize: 28, color: "var(--gold)", whiteSpace: "nowrap",
                }}>
                  {c.phone}
                </div>
              </a>
              </RevealOnScroll>
            ))}
            <div style={{ borderTop: "1px solid var(--line-faint)" }} />
          </div>

          <div style={{
            marginTop: 48,
            display: "flex", justifyContent: "space-between", alignItems: "center",
            gap: 24, flexWrap: "wrap",
          }}>
            <div>
              <div className="eyebrow-linen">Réponse moyenne · WhatsApp</div>
              <div style={{ marginTop: 6 }}>
                <span className="display" style={{ fontSize: 36, color: "var(--fg-sand)" }}>‹ 8 min</span>
                <span className="body-sm" style={{ marginLeft: 12 }}>sur les heures ouvrées</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <a href="#" className="btn btn--primary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.5 14c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.8.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.4-2.3-1.4-.8-.7-1.4-1.7-1.6-1.9-.2-.3 0-.4.1-.5.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.1-.7-1.6-.9-2.2-.2-.5-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.3 5.1 4.6.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 2-1.4.3-.7.3-1.2.2-1.4 0-.2-.3-.2-.6-.4zM12 2C6.5 2 2 6.5 2 12c0 1.7.5 3.4 1.3 4.9L2 22l5.3-1.3c1.4.8 3 1.2 4.7 1.2 5.5 0 10-4.5 10-10S17.5 2 12 2z" />
                </svg>
                Démarrer sur WhatsApp
              </a>
              <a href="#packs" className="btn btn--ghost">Voir les packs</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FootCol({ title, links }) {
  return (
    <div>
      <div className="eyebrow">{title}</div>
      <ul style={{ listStyle: "none", marginTop: 18, display: "flex", flexDirection: "column", gap: 10 }}>
        {links.map(([l, h], i) => (
          <li key={i}>
            <a href={h} style={{ color: "var(--fg-linen)", fontSize: 14, transition: "color .2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--fg-sand)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--fg-linen)")}>
              {l}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Footer() {
  return (
    <footer style={{
      background: "#08060450",
      borderTop: "1px solid var(--line-faint)",
      padding: "72px 0 32px",
    }}>
      <div className="wrap">
        <div className="grid-4" style={{
          display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 48,
          paddingBottom: 56, borderBottom: "1px solid var(--line-faint)",
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 28, fontWeight: 600, color: "var(--rs-red)" }}>RS</span>
              <span className="display" style={{ fontSize: 26 }}>kech</span>
            </div>
            <p className="body" style={{ marginTop: 20, maxWidth: "38ch" }}>
              Conciergerie privée à Marrakech.<br />
              Voitures, villas et excursions tout-terrain — orchestrés en un seul interlocuteur.
            </p>
            <div className="eyebrow-linen" style={{ marginTop: 24 }}>
              Édition 2026 · Marrakech, Maroc
            </div>
          </div>

          <FootCol title="Univers" links={[
            ["Flotte complète", "#fleet"],
            ["Packs sur mesure", "#packs"],
            ["Off-road", "#offroad"],
            ["Villas", "#villas"],
          ]} />
          <FootCol title="Service" links={[
            ["Conciergerie", "#concierge"],
            ["Livraison aéroport", "#concierge"],
            ["Chef privé", "#concierge"],
            ["Transferts", "#concierge"],
          ]} />
          <FootCol title="Contact" links={[
            ["+212 712 993 940", "tel:+212712993940"],
            ["+212 699 156 024", "tel:+212699156024"],
            ["+212 640 801 056", "tel:+212640801056"],
            ["WhatsApp", "#"],
          ]} />
        </div>

        <div style={{
          marginTop: 32,
          display: "flex", justifyContent: "space-between", alignItems: "center",
          flexWrap: "wrap", gap: 16,
        }}>
          <div className="eyebrow-linen">© 2026 RS Kech · Tous droits réservés</div>
          <div className="eyebrow-linen">Crafted in Marrakech · 31.6295° N — 7.9811° W</div>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <>
      <Nav />
      <AmbientLayer />
      <main>
        <Hero />
        <Marquee />
        <Universes />
        <Fleet />
        <Villas />
        <Offroad />
        <Packs />
        <Concierge />
      </main>
      <Footer />
    </>
  );
}
