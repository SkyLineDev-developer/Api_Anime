// Loading.jsx — Componente de carga con temática anime/Japón
// Requiere: Tailwind CSS + Google Fonts (Noto Sans JP + Bangers)
// Añade esto en tu index.html o layout:
// <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700;900&family=Bangers&display=swap" rel="stylesheet">

import { useEffect, useState } from "react";

const sakuraPetals = [
  { left: "8%",  size: 12, dur: 6,   delay: 0,   color: "#fcd5e3" },
  { left: "18%", size: 16, dur: 8,   delay: 1.5, color: "#f8b4c8" },
  { left: "30%", size: 10, dur: 5,   delay: 0.8, color: "#fce4ec" },
  { left: "45%", size: 14, dur: 7,   delay: 2.2, color: "#f48fb1" },
  { left: "60%", size: 18, dur: 9,   delay: 0.3, color: "#fcd5e3" },
  { left: "72%", size: 11, dur: 6.5, delay: 3,   color: "#f8b4c8" },
  { left: "83%", size: 15, dur: 7.5, delay: 1,   color: "#fce4ec" },
  { left: "92%", size: 9,  dur: 5.5, delay: 4,   color: "#f48fb1" },
];

const KANJI_SEQUENCE = ["力", "心", "夢", "炎", "魂"];

export default function Loading() {
  const [kanjiIndex, setKanjiIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const kanjiTimer = setInterval(() => {
      setKanjiIndex((i) => (i + 1) % KANJI_SEQUENCE.length);
    }, 2400);
    return () => clearInterval(kanjiTimer);
  }, []);

  useEffect(() => {
    let raf;
    let start = null;
    const duration = 3000;

    const animate = (timestamp) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const t = Math.min(elapsed / duration, 1);
      const eased = t < 0.6
        ? (t / 0.6) * 85
        : t < 0.8
          ? 85 + ((t - 0.6) / 0.2) * 7
          : 92 - ((t - 0.8) / 0.2) * 92;
      setProgress(Math.max(0, eased));
      if (t < 1) raf = requestAnimationFrame(animate);
      else {
        setProgress(0);
        start = null;
        raf = requestAnimationFrame(animate);
      }
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      className="relative flex items-center justify-center w-full overflow-hidden"
      style={{
        minHeight: "100vh",
        background: "#0a0a14",
        fontFamily: "'Noto Sans JP', sans-serif",
      }}
    >
      {/* CSS personalizado inyectado */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700;900&family=Bangers&display=swap');

        .anime-bg-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(220,30,60,0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(220,30,60,0.08) 1px, transparent 1px);
          background-size: 40px 40px;
          animation: gridMove 6s linear infinite;
        }
        @keyframes gridMove {
          0%   { transform: perspective(500px) rotateX(20deg) translateY(0); }
          100% { transform: perspective(500px) rotateX(20deg) translateY(40px); }
        }

        .anime-scanlines {
          position: absolute; inset: 0; pointer-events: none;
          background: repeating-linear-gradient(
            to bottom, transparent 0px, transparent 3px,
            rgba(0,0,0,0.08) 3px, rgba(0,0,0,0.08) 4px
          );
        }

        .sakura-petal {
          position: absolute;
          border-radius: 0 100% 0 100%;
          opacity: 0.7;
          animation: sakuraFall linear infinite;
        }
        @keyframes sakuraFall {
          0%   { top: -20px;  transform: rotate(0deg)   translateX(0px);  opacity: 0;   }
          10%  {              opacity: 0.7; }
          80%  {              opacity: 0.5; }
          100% { top: 110%;   transform: rotate(720deg) translateX(80px); opacity: 0;   }
        }

        .ring-outer {
          position: absolute; inset: 0; border-radius: 50%;
          border: 3px solid transparent;
          border-top-color: #dc1e3c; border-right-color: #dc1e3c;
          animation: spinCW 1.2s linear infinite;
        }
        .ring-mid {
          position: absolute; inset: 10px; border-radius: 50%;
          border: 2px solid transparent;
          border-top-color: #ffffff; border-left-color: #ffffff;
          animation: spinCCW 1.8s linear infinite;
        }
        .ring-inner {
          position: absolute; inset: 22px; border-radius: 50%;
          border: 2px solid transparent;
          border-bottom-color: #f0c040; border-right-color: #f0c040;
          animation: spinCW 0.9s linear infinite;
        }
        @keyframes spinCW  { to { transform: rotate(360deg);  } }
        @keyframes spinCCW { to { transform: rotate(-360deg); } }

        .kanji-center {
          font-size: 42px; font-weight: 900; color: #fff;
          text-shadow: 0 0 20px rgba(220,30,60,0.8), 0 0 40px rgba(220,30,60,0.4);
          animation: kanjiPulse 2.4s ease-in-out infinite;
          position: relative; z-index: 2;
          font-family: 'Noto Sans JP', sans-serif;
          transition: opacity 0.3s;
        }
        @keyframes kanjiPulse {
          0%,100% { transform: scale(1);    color: #fff;    text-shadow: 0 0 20px rgba(220,30,60,0.8); }
          50%     { transform: scale(1.12); color: #ff4466; text-shadow: 0 0 32px rgba(220,30,60,1), 0 0 60px rgba(220,30,60,0.6); }
        }

        .anime-dot {
          width: 10px; height: 10px; border-radius: 50%;
          animation: dotBounce 1.2s ease-in-out infinite;
        }
        @keyframes dotBounce {
          0%,80%,100% { transform: translateY(0);    opacity: 0.4; }
          40%         { transform: translateY(-10px); opacity: 1;   }
        }

        .anime-main-title {
          font-family: 'Bangers', cursive;
          font-size: 32px; color: #fff; letter-spacing: 6px;
          text-transform: uppercase;
          animation: titleGlow 2s ease-in-out infinite;
        }
        @keyframes titleGlow {
          0%,100% { text-shadow: 0 0 10px rgba(220,30,60,0.6); }
          50%     { text-shadow: 0 0 20px rgba(220,30,60,1), 0 0 40px rgba(220,30,60,0.5); }
        }

        .progress-fill-inner {
          height: 100%; border-radius: 3px;
          background: linear-gradient(90deg, #dc1e3c, #ff6688, #f0c040);
          position: relative; transition: width 0.05s linear;
        }
        .progress-fill-inner::after {
          content: ''; position: absolute; right: 0; top: 0;
          height: 100%; width: 20px;
          background: rgba(255,255,255,0.5);
          filter: blur(4px);
        }

        .anime-tag {
          padding: 3px 10px;
          border-radius: 2px; font-size: 11px;
          font-family: 'Noto Sans JP', sans-serif;
          letter-spacing: 1px;
          animation: tagFade 2s ease-in-out infinite;
        }
        @keyframes tagFade {
          0%,100% { opacity: 0.5; }
          50%     { opacity: 1;   }
        }
      `}</style>

      {/* Fondo grid perspectiva */}
      <div className="anime-bg-grid" />
      <div className="anime-scanlines" />

      {/* Pétalos de sakura */}
      {sakuraPetals.map((p, i) => (
        <div
          key={i}
          className="sakura-petal"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            background: p.color,
            animationDuration: `${p.dur}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}

      {/* Torii fantasma de fondo */}
      <svg
        className="absolute bottom-0 left-1/2 -translate-x-1/2 opacity-[0.06]"
        viewBox="0 0 340 200"
        width="340"
        height="200"
        fill="white"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="20"  y="40" width="300" height="18" rx="4" />
        <rect x="40"  y="55" width="260" height="12" rx="3" />
        <rect x="100" y="70" width="16"  height="130" rx="3" />
        <rect x="224" y="70" width="16"  height="130" rx="3" />
        <rect x="60"  y="90" width="220" height="14"  rx="3" />
      </svg>

      {/* Esquinas con texto japonés */}
      {[
        { cls: "top-4 left-4 text-left",  text: "日本アニメ\nローディング" },
        { cls: "top-4 right-4 text-right", text: "読み込み中\nアニメ" },
        { cls: "bottom-4 left-4",          text: "©2025 ANIME STUDIO" },
        { cls: "bottom-4 right-4 text-right", text: "エピソード01\n第一話" },
      ].map(({ cls, text }, i) => (
        <span
          key={i}
          className={`absolute text-[11px] tracking-widest whitespace-pre-line ${cls}`}
          style={{ color: "rgba(255,255,255,0.12)", fontFamily: "'Noto Sans JP', sans-serif" }}
        >
          {text}
        </span>
      ))}

      {/* Contenido principal */}
      <div className="relative z-10 flex flex-col items-center gap-7">
        {/* Spinner kanji */}
        <div className="relative w-36 h-36 flex items-center justify-center">
          <div className="ring-outer" />
          <div className="ring-mid" />
          <div className="ring-inner" />
          <span className="kanji-center">{KANJI_SEQUENCE[kanjiIndex]}</span>
        </div>

        {/* Título */}
        <div className="flex flex-col items-center gap-1">
          <div className="anime-main-title">CARGANDO</div>
          <div
            className="text-sm tracking-[0.5em]"
            style={{ color: "rgba(255,255,255,0.45)", fontFamily: "'Noto Sans JP', sans-serif" }}
          >
            読み込み中 ・ お待ちください
          </div>
        </div>

        {/* Dots */}
        <div className="flex gap-2 items-center">
          {[
            { color: "#dc1e3c", delay: "0s" },
            { color: "#ffffff", delay: "0.15s" },
            { color: "#f0c040", delay: "0.3s" },
            { color: "#ffffff", delay: "0.45s" },
            { color: "#dc1e3c", delay: "0.6s" },
          ].map((d, i) => (
            <div
              key={i}
              className="anime-dot"
              style={{ background: d.color, animationDelay: d.delay }}
            />
          ))}
        </div>

        {/* Barra de progreso */}
        <div className="w-60 flex flex-col gap-1">
          <div className="flex justify-between"
            style={{
              fontFamily: "'Bangers', cursive",
              fontSize: 11,
              color: "rgba(255,255,255,0.45)",
              letterSpacing: "3px",
              textTransform: "uppercase",
            }}
          >
            <span>CARGANDO ANIMES...</span>
            <span>力</span>
          </div>
          <div
            className="w-full h-1.5 rounded-full overflow-hidden"
            style={{ background: "rgba(255,255,255,0.08)" }}
          >
            <div
              className="progress-fill-inner"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Tags japoneses */}
        <div className="flex gap-2 flex-wrap justify-center max-w-xs">
          {[
            { label: "アニメ", red: true,    delay: "0s" },
            { label: "桜",     red: false,   delay: "0.4s" },
            { label: "侍",     red: true,    delay: "0.8s" },
            { label: "日本",   red: false,   delay: "1.2s" },
          ].map(({ label, red, delay }) => (
            <span
              key={label}
              className="anime-tag"
              style={{
                border: `1px solid ${red ? "rgba(220,30,60,0.4)" : "rgba(240,192,64,0.4)"}`,
                color: red ? "rgba(220,30,60,0.8)" : "rgba(240,192,64,0.8)",
                animationDelay: delay,
              }}
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}