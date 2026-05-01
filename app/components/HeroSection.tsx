// HeroSection.jsx — Responsive: mobile, tablet, desktop
// <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700;900&family=Bangers&family=Dela+Gothic+One&display=swap" rel="stylesheet">

"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const NAV_LINKS = [
  { label: "Inicio",           href: "/"           },
  { label: "Directorio",       href: "../pages/Directorio" }
];

const GENRES = ["Todos", "Acción", "Romance", "Shonen", "Isekai", "Terror", "Slice of Life"];

const STRIP_ITEMS = [
  { label: "鬼滅の刃",        hl: true  },
  { label: "進撃の巨人",      hl: false },
  { label: "呪術廻戦",        hl: true  },
  { label: "僕のヒーロー",    hl: false },
  { label: "ONE PIECE",       hl: false },
  { label: "ドラゴンボール",  hl: true  },
  { label: "NARUTO",          hl: false },
  { label: "BLEACH",          hl: false },
  { label: "Re:Zero",         hl: true  },
  { label: "新世紀エヴァ",    hl: false },
  { label: "SWORD ART",       hl: true  },
  { label: "Hunter x Hunter", hl: false },
];

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);

  return debounced;
}

export default function HeroSection() {
  const [search, setSearch]           = useState("");
  const [activeGenre, setActiveGenre] = useState("Todos");
  const [results, setResults]         = useState<any[]>([]);
  const [searching, setSearching]     = useState(false);
  const [dropOpen, setDropOpen]       = useState(false);
  const [menuOpen, setMenuOpen]       = useState(false);
  // ✅ FIX: typed ref so TypeScript knows .contains() exists
  const searchRef                     = useRef<HTMLDivElement>(null);
  const debouncedSearch               = useDebounce(search, 400);

  useEffect(() => {
    const query = debouncedSearch.trim();
    if (!query) { setResults([]); setDropOpen(false); return; }
    let cancelled = false;
    setSearching(true);
    (async () => {
      try {
        const res  = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=20&order_by=score&sort=desc`);
        if (!res.ok) throw new Error();
        const json = await res.json();
        if (!cancelled) { setResults(json.data ?? []); setDropOpen(true); }
      } catch {
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) setSearching(false);
      }
    })();
    return () => { cancelled = true; };
  }, [debouncedSearch]);

  useEffect(() => {
    function h(e: MouseEvent) {
      if (
        searchRef.current &&
        e.target instanceof Node &&
        !searchRef.current.contains(e.target)
      ) {
        setDropOpen(false);
      }
    }

    document.addEventListener("mousedown", h);

    return () => {
      document.removeEventListener("mousedown", h);
    };
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700;900&family=Bangers&family=Dela+Gothic+One&display=swap');

        /* ── ROOT ── */
        .hs-root {
          background: #07070f;
          font-family: 'Noto Sans JP', sans-serif;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          /* Desktop: 100vh fijo. Mobile: auto para que el contenido respire */
          min-height: 100svh;
        }
        @media (min-width: 1024px) {
          .hs-root { height: 100svh; overflow: hidden; }
        }

        /* ── BG ── */
        .hs-bg-grid   { position:absolute;inset:0;pointer-events:none;background-image:linear-gradient(rgba(220,30,60,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(220,30,60,0.05) 1px,transparent 1px);background-size:48px 48px; }
        .hs-bg-radial { position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse 70% 50% at 50% 55%,rgba(220,30,60,0.11) 0%,transparent 70%); }
        .hs-scanlines { position:absolute;inset:0;pointer-events:none;background:repeating-linear-gradient(to bottom,transparent 0,transparent 3px,rgba(0,0,0,0.06) 3px,rgba(0,0,0,0.06) 4px); }
        .hs-sakura    { position:absolute;border-radius:0 100% 0 100%;opacity:0;animation:hs-sakura linear infinite; }
        @keyframes hs-sakura { 0%{top:-20px;opacity:0;transform:rotate(0deg) translateX(0);}8%{opacity:0.6;}85%{opacity:0.4;}100%{top:108%;opacity:0;transform:rotate(660deg) translateX(60px);} }

        /* ── NAVBAR ── */
        .hs-navbar {
          flex-shrink: 0;
          position: relative; z-index: 100;
          height: 60px;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 20px;
          border-bottom: 1px solid rgba(220,30,60,0.18);
          background: rgba(7,7,15,0.9);
          backdrop-filter: blur(12px);
        }
        @media (min-width: 768px) { .hs-navbar { padding: 0 36px; } }

        .hs-logo-icon { width:32px;height:32px;background:#dc1e3c;border-radius:5px;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:900;color:#fff;animation:hs-logo-pulse 3s ease-in-out infinite;flex-shrink:0;font-family:'Noto Sans JP',sans-serif; }
        @keyframes hs-logo-pulse { 0%,100%{box-shadow:0 0 0 0 rgba(220,30,60,0.4);}50%{box-shadow:0 0 0 7px rgba(220,30,60,0);} }

        /* Nav links: ocultos en mobile, visibles en desktop */
        .hs-nav-links { display:none; align-items:center; gap:26px; }
        @media (min-width:1024px) { .hs-nav-links { display:flex; } }

        .hs-nav-link { font-size:12px;color:rgba(255,255,255,0.55);cursor:pointer;letter-spacing:1px;position:relative;padding-bottom:3px;transition:color .2s;text-decoration:none; }
        .hs-nav-link::after { content:'';position:absolute;bottom:0;left:0;height:1px;width:0;background:#dc1e3c;transition:width .25s; }
        .hs-nav-link:hover, .hs-nav-link.active { color:#fff !important; }
        .hs-nav-link:hover::after, .hs-nav-link.active::after { width:100%; }

        /* Acciones navbar */
        .hs-nav-actions { display:flex; align-items:center; gap:8px; }

        /* Búsqueda: colapsada en mobile, expandida en md+ */
        .hs-search-wrap { position:relative; }
        .hs-search-box  { display:flex;align-items:center;gap:7px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:999px;padding:5px 12px;transition:border-color .2s,background .2s; }
        .hs-search-box:focus-within { border-color:rgba(220,30,60,0.55);background:rgba(220,30,60,0.07); }
        .hs-search-box input { background:none;border:none;outline:none;color:#fff;font-size:12px;font-family:'Noto Sans JP',sans-serif;width:120px; }
        @media (min-width:768px) { .hs-search-box input { width:170px; } }
        .hs-search-box input::placeholder { color:rgba(255,255,255,0.3); }
        .hs-search-spin { width:12px;height:12px;border-radius:50%;border:1.5px solid rgba(220,30,60,0.3);border-top-color:#dc1e3c;animation:hs-spin .7s linear infinite;flex-shrink:0; }
        @keyframes hs-spin { to{transform:rotate(360deg);} }

        /* Botones navbar: ocultar algunos en mobile */
        .hs-nav-bell  { display:none; }
        @media (min-width:640px) { .hs-nav-bell { display:flex; } }
        .hs-nav-login { display:none; }
        @media (min-width:768px) { .hs-nav-login { display:block; } }

        /* Hamburger: solo mobile */
        .hs-hamburger { display:flex;flex-direction:column;gap:4px;cursor:pointer;padding:4px; }
        @media (min-width:1024px) { .hs-hamburger { display:none; } }
        .hs-hamburger span { width:20px;height:2px;background:rgba(255,255,255,0.7);border-radius:2px;transition:all .2s; }

        /* Mobile menu drawer */
        .hs-mobile-menu {
          position:absolute;top:60px;left:0;right:0;z-index:99;
          background:rgba(7,7,15,0.97);border-bottom:1px solid rgba(220,30,60,0.18);
          padding:16px 20px 20px;display:flex;flex-direction:column;gap:4px;
          backdrop-filter:blur(12px);
          animation:hs-menu-in .2s ease both;
        }
        @keyframes hs-menu-in { from{opacity:0;transform:translateY(-8px);}to{opacity:1;transform:translateY(0);} }
        .hs-mobile-menu a { font-size:14px;color:rgba(255,255,255,0.65);text-decoration:none;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.05);letter-spacing:1px; }
        .hs-mobile-menu a:last-child { border-bottom:none; }
        .hs-mobile-menu a.active { color:#dc1e3c; }

        /* Dropdown búsqueda */
        .hs-dropdown { position:absolute;top:calc(100% + 8px);left:50%;transform:translateX(-50%);width:300px;background:#0d0d1e;border:1px solid rgba(220,30,60,0.25);border-radius:10px;overflow:hidden;box-shadow:0 16px 40px rgba(0,0,0,0.6);animation:hs-drop-in .18s ease both;z-index:200; }
        @media (min-width:640px) { .hs-dropdown { width:320px; } }
        /* En mobile que no se salga por la izquierda */
        @media (max-width:480px) { .hs-dropdown { left:auto;right:0;transform:none; } }
        @keyframes hs-drop-in { from{opacity:0;transform:translateX(-50%) translateY(-6px);}to{opacity:1;transform:translateX(-50%) translateY(0);} }
        @media (max-width:480px) { @keyframes hs-drop-in { from{opacity:0;transform:translateY(-6px);}to{opacity:1;transform:translateY(0);} } }

        .hs-drop-list { max-height:240px;overflow-y:auto;scrollbar-width:thin;scrollbar-color:rgba(220,30,60,0.3) transparent; }
        .hs-drop-list::-webkit-scrollbar { width:4px; }
        .hs-drop-list::-webkit-scrollbar-thumb { background:rgba(220,30,60,0.3);border-radius:2px; }
        .hs-drop-item { display:flex;align-items:center;gap:10px;padding:8px 14px;cursor:pointer;transition:background .15s;border-bottom:1px solid rgba(255,255,255,0.04); }
        .hs-drop-item:last-child { border-bottom:none; }
        .hs-drop-item:hover { background:rgba(220,30,60,0.08); }
        .hs-drop-img  { width:36px;height:50px;object-fit:cover;border-radius:4px;background:#1a1a2e;flex-shrink:0;border:1px solid rgba(255,255,255,0.07); }
        .hs-drop-more { padding:6px 14px;text-align:center;font-family:'Bangers',cursive;font-size:10px;letter-spacing:2px;color:rgba(220,30,60,0.45);border-top:1px solid rgba(255,255,255,0.05); }
        .hs-drop-empty{ padding:20px 14px;text-align:center;font-family:'Bangers',cursive;font-size:13px;letter-spacing:3px;color:rgba(255,255,255,0.2); }

        /* ── HERO ── */
        .hs-hero {
          flex: 1;
          min-height: 0;
          position: relative; z-index: 10;
          display: flex;
          flex-direction: column;        /* mobile: columna */
          align-items: center;
          padding: 32px 20px 24px;
          gap: 32px;
          overflow: hidden;
        }
        @media (min-width:1024px) {
          .hs-hero {
            flex-direction: row;         /* desktop: fila */
            align-items: center;
            padding: 0 36px;
            gap: 0;
          }
        }

        /* Left content */
        .hs-hero-left {
          width: 100%;
          text-align: center;           /* mobile: centrado */
        }
        @media (min-width:1024px) {
          .hs-hero-left {
            flex: 1;
            min-width: 0;
            padding-right: 24px;
            text-align: left;
          }
        }

        /* Eyebrow */
        .hs-eyebrow {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 12px;
          justify-content: center;      /* mobile: centrado */
        }
        @media (min-width:1024px) { .hs-eyebrow { justify-content: flex-start; } }

        /* H1 */
        .hs-h1 {
          font-family: 'Dela Gothic One', cursive;
          font-size: clamp(30px, 7vw, 54px);
          line-height: 1.07; color: #fff; margin-bottom: 6px;
          animation: hs-fadeUp .6s ease both;
        }
        .hs-accent { color:#dc1e3c;position:relative;display:inline-block; }
        .hs-accent::after { content:'';position:absolute;left:0;bottom:-2px;width:100%;height:2px;background:#dc1e3c;opacity:.4;border-radius:2px; }

        .hs-h1-jp {
          display:block;
          font-size: clamp(10px,2.5vw,13px);
          color:rgba(255,255,255,0.2);letter-spacing:5px;margin-top:8px;margin-bottom:12px;
          animation:hs-fadeUp .6s .1s ease both;
        }

        .hs-desc {
          font-size: clamp(12px,1.8vw,14px);
          line-height:1.75;color:rgba(255,255,255,0.48);
          margin-bottom:16px;
          animation:hs-fadeUp .6s .18s ease both;
          max-width:440px;
        }
        /* mobile: desc centrado con auto margin */
        @media (max-width:1023px) { .hs-desc { margin-left:auto; margin-right:auto; } }

        @keyframes hs-fadeUp { from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);} }

        /* Pills */
        .hs-pills {
          display:flex;gap:7px;flex-wrap:wrap;margin-bottom:18px;
          animation:hs-fadeUp .6s .22s ease both;
          justify-content: center;      /* mobile */
        }
        @media (min-width:1024px) { .hs-pills { justify-content: flex-start; } }
        .hs-pill { padding:4px 12px;border-radius:999px;font-size:11px;cursor:pointer;border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.42);background:rgba(255,255,255,0.04);transition:all .2s;font-family:'Noto Sans JP',sans-serif; }
        .hs-pill:hover  { border-color:rgba(220,30,60,0.4);color:rgba(255,255,255,0.8); }
        .hs-pill.active { background:rgba(220,30,60,0.15);border-color:rgba(220,30,60,0.5);color:#dc1e3c; }

        /* Buttons */
        .hs-btns {
          display:flex;align-items:center;gap:12px;flex-wrap:wrap;
          animation:hs-fadeUp .6s .28s ease both;
          justify-content: center;
        }
        @media (min-width:1024px) { .hs-btns { justify-content: flex-start; } }

        .hs-btn-primary { display:flex;align-items:center;gap:7px;background:#dc1e3c;color:#fff;border:none;border-radius:4px;padding:11px 22px;font-family:'Bangers',cursive;font-size:14px;letter-spacing:3px;cursor:pointer;position:relative;overflow:hidden;transition:transform .15s;white-space:nowrap; }
        .hs-btn-primary::before { content:'';position:absolute;inset:0;background:linear-gradient(120deg,transparent 30%,rgba(255,255,255,.15) 50%,transparent 70%);transform:translateX(-100%);transition:transform .4s; }
        .hs-btn-primary:hover { transform:translateY(-2px); }
        .hs-btn-primary:hover::before { transform:translateX(100%); }

        /* Stats */
        .hs-stats {
          display:flex;gap:20px;flex-wrap:wrap;margin-top:20px;padding-top:18px;
          border-top:1px solid rgba(255,255,255,0.06);
          animation:hs-fadeUp .6s .38s ease both;
          justify-content: center;
        }
        @media (min-width:1024px) { .hs-stats { justify-content: flex-start; gap:24px; } }

        /* Right: featured card — hidden on mobile, shown on lg+ */
        .hs-hero-right {
          display: none;
        }
        /* Tablet: show smaller card */
        @media (min-width:768px) {
          .hs-hero-right {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 220px;
            flex-shrink: 0;
            animation: hs-fadeUp .7s .18s ease both;
            position: relative; z-index: 10;
          }
        }
        @media (min-width:1024px) {
          .hs-hero-right {
            width: clamp(200px,26vw,300px);
            height: 100%;
          }
        }

        .hs-featured-card { position:relative;border-radius:10px;overflow:hidden;border:1px solid rgba(220,30,60,0.22);background:linear-gradient(160deg,rgba(220,30,60,0.08) 0%,rgba(7,7,15,0.7) 60%);display:flex;flex-direction:column;align-items:center;justify-content:flex-end;aspect-ratio:3/4; }
        .hs-featured-card::before { content:'';position:absolute;top:-1px;left:16px;right:16px;height:1px;background:linear-gradient(90deg,transparent,rgba(220,30,60,.6),transparent); }
        .hs-poster-float { animation:hs-poster-float 4s ease-in-out infinite; }
        @keyframes hs-poster-float { 0%,100%{transform:translateX(-50%) translateY(0);}50%{transform:translateX(-50%) translateY(-8px);} }
        .hs-glow-breathe { animation:hs-glow-breathe 3s ease-in-out infinite; }
        @keyframes hs-glow-breathe { 0%,100%{opacity:.6;transform:translateX(-50%) scaleX(1);}50%{opacity:1;transform:translateX(-50%) scaleX(1.2);} }

        /* Floating tags: solo desktop */
        .hs-ftag { position:absolute;padding:4px 10px;border-radius:999px;font-size:10px;font-family:'Noto Sans JP',sans-serif;letter-spacing:2px;background:rgba(7,7,15,0.75);backdrop-filter:blur(4px);animation:hs-ftag 5s ease-in-out infinite;white-space:nowrap;display:none; }
        @media (min-width:1200px) { .hs-ftag { display:block; } }
        @keyframes hs-ftag { 0%,100%{transform:translateY(0);}50%{transform:translateY(-5px);} }

        /* Strip */
        .hs-strip { flex-shrink:0;position:relative;z-index:10;height:40px;border-top:1px solid rgba(255,255,255,0.05);display:flex;align-items:center;padding:0 20px;overflow:hidden;background:rgba(7,7,15,0.6); }
        @media (min-width:768px) { .hs-strip { padding:0 36px; } }
        .hs-strip-scroll { display:flex;gap:24px;overflow:hidden;mask-image:linear-gradient(90deg,transparent,black 5%,black 95%,transparent); }
      `}</style>

      <div className="hs-root">
        <div className="hs-bg-grid"/><div className="hs-bg-radial"/><div className="hs-scanlines"/>

        {/* City skyline */}
        <svg style={{ position:"absolute",bottom:0,left:0,right:0,width:"100%",height:"45%",opacity:0.1,pointerEvents:"none" }}
          viewBox="0 0 1200 400" fill="white" preserveAspectRatio="xMidYMax slice">
          {[[0,200,60,200],[20,160,20,40],[70,240,80,160],[160,180,50,220],[175,155,20,25],[220,220,70,180],
            [300,170,40,230],[310,140,20,30],[350,200,90,200],[450,150,55,250],[515,210,70,190],
            [595,180,45,220],[650,230,80,170],[740,190,50,210],[800,220,65,180],[875,170,45,230],
            [930,200,75,200],[1015,180,50,220],[1075,210,60,190],[1145,190,55,210]
          ].map(([x,y,w,h],i)=><rect key={i} x={x} y={y} width={w} height={h}/>)}
          <rect x="550" y="250" width="100" height="10" rx="3"/>
          <rect x="545" y="265" width="110" height="8" rx="2"/>
          <rect x="565" y="275" width="10" height="125"/>
          <rect x="625" y="275" width="10" height="125"/>
          <rect x="575" y="285" width="50" height="6" rx="2"/>
        </svg>

        {/* Sakura */}
        {[{l:"5%",s:11,d:7,del:0,c:"#fcd5e3"},{l:"18%",s:8,d:9,del:2,c:"#f8b4c8"},
          {l:"33%",s:12,d:6,del:.5,c:"#fce4ec"},{l:"50%",s:9,d:8,del:3,c:"#f48fb1"},
          {l:"65%",s:14,d:7.5,del:1,c:"#fcd5e3"},{l:"80%",s:10,d:6.5,del:4,c:"#f8b4c8"},
          {l:"91%",s:12,d:8.5,del:.8,c:"#fce4ec"}
        ].map((p,i)=>(
          <div key={i} className="hs-sakura" style={{left:p.l,width:p.s,height:p.s,background:p.c,animationDuration:`${p.d}s`,animationDelay:`${p.del}s`}}/>
        ))}

        {/* ── NAVBAR ── */}
        <nav className="hs-navbar">
          {/* Logo */}
          <div style={{ display:"flex",alignItems:"center",gap:9,cursor:"pointer",flexShrink:0 }}>
            <div className="hs-logo-icon">炎</div>
            <div style={{ display:"flex",flexDirection:"column",lineHeight:1 }}>
              <span style={{ fontFamily:"'Bangers',cursive",fontSize:18,letterSpacing:3,color:"#fff" }}>ANIMESTREAM</span>
              <span style={{ fontSize:9,color:"rgba(220,30,60,0.7)",letterSpacing:4,marginTop:1 }}>アニメストリーム</span>
            </div>
          </div>

          {/* Desktop nav links */}
          <div className="hs-nav-links">
            {NAV_LINKS.map(({label,href},i)=>(
              <Link key={label} href={href} className={`hs-nav-link${i===0?" active":""}`}
                style={{ color:i===0?"#fff":"rgba(255,255,255,0.55)" }}>
                {label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="hs-nav-actions">
            {/* Search */}
            <div className="hs-search-wrap" ref={searchRef}>
              <div className="hs-search-box">
                {searching ? (
                  <div className="hs-search-spin"/>
                ) : (
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="1.5" opacity="0.4">
                    <circle cx="6.5" cy="6.5" r="5"/><line x1="10.5" y1="10.5" x2="14.5" y2="14.5"/>
                  </svg>
                )}
                <input type="text" placeholder="Buscar anime..."
                  value={search}
                  onChange={e => { setSearch(e.target.value); if (!e.target.value.trim()) setDropOpen(false); }}
                  onFocus={() => { if (results.length > 0) setDropOpen(true); }}
                />
                {search && (
                  <button onClick={()=>{ setSearch(""); setResults([]); setDropOpen(false); }}
                    style={{ background:"none",border:"none",cursor:"pointer",color:"rgba(255,255,255,0.3)",fontSize:14,lineHeight:1,padding:0,flexShrink:0 }}>×</button>
                )}
              </div>

              {/* Dropdown */}
              {dropOpen && (
                <div className="hs-dropdown">
                  <div style={{ padding:"8px 14px 6px",borderBottom:"1px solid rgba(255,255,255,0.05)",display:"flex",alignItems:"center",justifyContent:"space-between" }}>
                    <span style={{ fontFamily:"'Bangers',cursive",fontSize:11,letterSpacing:3,color:"rgba(255,255,255,0.25)" }}>RESULTADOS</span>
                    {results.length > 0 && <span style={{ fontFamily:"'Bangers',cursive",fontSize:11,letterSpacing:2,color:"rgba(220,30,60,0.6)" }}>{results.length} encontrados</span>}
                  </div>
                  {results.length === 0 && !searching ? (
                    <div className="hs-drop-empty">Sin resultados · 結果なし</div>
                  ) : (
                    <>
                      <div className="hs-drop-list">
                        {results.map((anime: any) => {
                          const img   = anime.images?.webp?.image_url ?? anime.images?.jpg?.image_url ?? "";
                          const score = anime.score ? `★ ${anime.score.toFixed(1)}` : null;
                          const genre = anime.genres?.[0]?.name ?? null;
                          return (
                            <div key={anime.mal_id} className="hs-drop-item">
                              <img src={img} alt={anime.title} className="hs-drop-img" onError={(e)=>{ (e.currentTarget as HTMLImageElement).style.opacity="0"; }}/>
                              <div style={{ flex:1,minWidth:0 }}>
                                <div style={{ fontSize:12,fontWeight:700,color:"rgba(255,255,255,0.88)",lineHeight:1.3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{anime.title}</div>
                                {anime.title_japanese && <div style={{ fontSize:10,color:"rgba(255,255,255,0.28)",letterSpacing:2,marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{anime.title_japanese}</div>}
                                <div style={{ display:"flex",alignItems:"center",gap:5,marginTop:4,flexWrap:"wrap" }}>
                                  {genre && <span style={{ fontFamily:"'Bangers',cursive",fontSize:9,letterSpacing:1,padding:"1px 5px",borderRadius:2,background:"rgba(220,30,60,0.15)",color:"rgba(220,30,60,0.8)",border:"1px solid rgba(220,30,60,0.2)" }}>{genre}</span>}
                                  <span style={{ fontFamily:"'Bangers',cursive",fontSize:9,letterSpacing:1,padding:"1px 5px",borderRadius:2,background:"rgba(255,255,255,0.05)",color:"rgba(255,255,255,0.3)",border:"1px solid rgba(255,255,255,0.07)" }}>{anime.type||"TV"}</span>
                                  {score && <span style={{ fontFamily:"'Bangers',cursive",fontSize:10,color:"#f0c040",letterSpacing:1 }}>{score}</span>}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      {results.length > 5 && <div className="hs-drop-more">↕ {results.length - 5} más · scroll para ver</div>}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Bell — hidden on very small screens */}
            <div className="hs-nav-bell" style={{ position:"relative",width:32,height:32,borderRadius:7,border:"1px solid rgba(255,255,255,0.1)",background:"rgba(255,255,255,0.04)",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"rgba(255,255,255,0.55)" }}>
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M8 1a5 5 0 0 1 5 5c0 3 1.5 4 2 5H1c.5-1 2-2 2-5a5 5 0 0 1 5-5z"/><line x1="8" y1="15" x2="8" y2="13"/>
              </svg>
              <div style={{ position:"absolute",top:-3,right:-3,width:14,height:14,background:"#dc1e3c",borderRadius:"50%",fontSize:8,fontFamily:"'Bangers',cursive",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center" }}>5</div>
            </div>

            {/* Login button — hidden on mobile */}
            <button className="hs-nav-login" style={{ background:"#dc1e3c",color:"#fff",border:"none",borderRadius:5,padding:"7px 14px",fontFamily:"'Bangers',cursive",fontSize:11,letterSpacing:2,cursor:"pointer" }}>
              INICIAR SESIÓN
            </button>

            {/* Hamburger — mobile only */}
            <button className="hs-hamburger" onClick={()=>setMenuOpen(v=>!v)}
              style={{ background:"none",border:"none",cursor:"pointer",padding:4,display:"flex",flexDirection:"column",gap:4 }}>
              <span style={{ width:20,height:2,background:menuOpen?"#dc1e3c":"rgba(255,255,255,0.7)",borderRadius:2,transition:"all .2s",transform:menuOpen?"rotate(45deg) translate(4px,4px)":"none" }}/>
              <span style={{ width:20,height:2,background:menuOpen?"transparent":"rgba(255,255,255,0.7)",borderRadius:2,transition:"all .2s" }}/>
              <span style={{ width:20,height:2,background:menuOpen?"#dc1e3c":"rgba(255,255,255,0.7)",borderRadius:2,transition:"all .2s",transform:menuOpen?"rotate(-45deg) translate(4px,-4px)":"none" }}/>
            </button>
          </div>
        </nav>

        {/* Mobile menu drawer */}
        {menuOpen && (
          <div className="hs-mobile-menu">
            {NAV_LINKS.map(({label,href},i)=>(
              <Link key={label} href={href} className={i===0?"active":""} onClick={()=>setMenuOpen(false)}>
                {label}
              </Link>
            ))}
            <button style={{ marginTop:12,background:"#dc1e3c",color:"#fff",border:"none",borderRadius:5,padding:"10px",fontFamily:"'Bangers',cursive",fontSize:12,letterSpacing:2,cursor:"pointer",width:"100%" }}>
              INICIAR SESIÓN
            </button>
          </div>
        )}

        {/* ── HERO ── */}
        <div className="hs-hero">

          {/* LEFT */}
          <div className="hs-hero-left">
            <div className="hs-eyebrow">
              <div style={{ width:28,height:2,background:"#dc1e3c",flexShrink:0 }}/>
              <span style={{ fontFamily:"'Bangers',cursive",fontSize:12,letterSpacing:4,color:"#dc1e3c" }}>TEMPORADA OTOÑO 2025</span>
              <span style={{ fontSize:10,color:"rgba(255,255,255,0.28)",letterSpacing:3 }}>・ 秋アニメ最新情報</span>
            </div>

            <h1 className="hs-h1">
              Mira y descubre<br/>
              <span className="hs-accent">miles de animes</span>
              <br/>gratis
            </h1>

            <span className="hs-h1-jp">無料でアニメを見てください ・ 完全無料</span>

            <p className="hs-desc">
              Explora nuestro directorio completo de series, películas y OVAs.
              Subtítulos en español, actualización diaria y sin registrarte.
            </p>

            <div className="hs-pills">
              {GENRES.map(g=>(
                <button key={g} className={`hs-pill${activeGenre===g?" active":""}`} onClick={()=>setActiveGenre(g)}>{g}</button>
              ))}
            </div>

            <div className="hs-btns">
              <Link href="../pages/Directorio" className="hs-btn-primary">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="1.5"><polygon points="4,2 14,8 4,14"/></svg>
                VER DIRECTORIO
              </Link>
              <button style={{ display:"flex",alignItems:"center",gap:7,background:"transparent",color:"rgba(255,255,255,0.65)",border:"1px solid rgba(255,255,255,0.14)",borderRadius:4,padding:"10px 18px",fontSize:12,cursor:"pointer",fontFamily:"'Noto Sans JP',sans-serif",whiteSpace:"nowrap" }}>
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="2" y="2" width="10" height="10" rx="2"/><line x1="5" y1="5" x2="5" y2="9"/><line x1="9" y1="5" x2="9" y2="9"/></svg>
                Novedades hoy
              </button>
            </div>

            <div className="hs-stats">
              {[{n:"12",s:"K",l:"Series"},{n:"HD",s:"+",l:"Calidad"},{n:"Sub",s:"/Dub",l:"Español"},{n:"0",s:"$",l:"Costo"}].map(({n,s,l})=>(
                <div key={l}>
                  <div style={{ fontFamily:"'Bangers',cursive",fontSize:22,color:"#fff",letterSpacing:2,lineHeight:1 }}>
                    {n}<span style={{ color:"#dc1e3c" }}>{s}</span>
                  </div>
                  <div style={{ fontSize:10,color:"rgba(255,255,255,0.28)",letterSpacing:2,textTransform:"uppercase",marginTop:2 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: featured card — tablet+ */}
          <div className="hs-hero-right">
            <div style={{ position:"relative",width:"100%",maxWidth:270 }}>
              <div className="hs-glow-breathe" style={{ position:"absolute",bottom:-14,left:"50%",width:150,height:55,background:"radial-gradient(ellipse,rgba(220,30,60,0.5) 0%,transparent 70%)",filter:"blur(16px)" }}/>
              <div className="hs-featured-card">
                <div style={{ position:"absolute",inset:0,background:"radial-gradient(ellipse 80% 55% at 50% 28%,rgba(80,20,100,0.35) 0%,transparent 70%),linear-gradient(180deg,rgba(220,30,60,0.07) 0%,#07070f 100%)" }}/>
                <div style={{ position:"absolute",top:10,right:10,background:"#dc1e3c",borderRadius:3,padding:"3px 8px",fontFamily:"'Bangers',cursive",fontSize:10,letterSpacing:2,color:"#fff",zIndex:5 }}>TENDENCIA #1</div>
                <div style={{ position:"absolute",top:10,left:10,background:"rgba(0,0,0,0.65)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:3,padding:"3px 8px",fontFamily:"'Bangers',cursive",fontSize:10,letterSpacing:2,color:"rgba(255,255,255,0.65)",zIndex:5 }}>EP 24/24</div>
                <div className="hs-poster-float" style={{ position:"absolute",top:10,left:"50%" }}>
                  <svg viewBox="0 0 180 260" width="140" height="202" fill="none">
                    <circle cx="90" cy="120" r="85" fill="rgba(220,30,60,0.05)"/>
                    <path d="M62 230 Q60 198 62 178 Q64 158 90 148 Q116 158 118 178 Q120 198 118 230Z" fill="#1c1c2e"/>
                    <path d="M62 178 Q50 192 46 212 Q43 223 52 226 Q62 226 64 216 Q62 196 62 178Z" fill="#1a1a3e"/>
                    <path d="M118 178 Q130 192 134 212 Q137 223 128 226 Q118 226 116 216 Q118 196 118 178Z" fill="#1a1a3e"/>
                    <rect x="62" y="166" width="56" height="7" rx="2" fill="#f0c040" opacity="0.6"/>
                    <ellipse cx="90" cy="132" rx="22" ry="25" fill="#f5c5a0"/>
                    <path d="M68 126 Q70 102 90 99 Q110 102 112 126 Q108 112 90 109 Q72 112 68 126Z" fill="#1a0a2e"/>
                    <path d="M68 126 Q62 134 64 143 Q68 148 71 143 Q70 134 70 127Z" fill="#1a0a2e"/>
                    <path d="M112 126 Q118 134 116 143 Q112 148 109 143 Q110 134 110 127Z" fill="#1a0a2e"/>
                    <path d="M82 110 Q90 106 98 110 Q94 100 90 98 Q86 100 82 110Z" fill="#1a0a2e"/>
                    <line x1="96" y1="125" x2="100" y2="135" stroke="#cc4444" strokeWidth="1.2" opacity="0.7"/>
                    <ellipse cx="82" cy="135" rx="5.5" ry="6.5" fill="#0d0d1e"/>
                    <ellipse cx="98" cy="135" rx="5.5" ry="6.5" fill="#0d0d1e"/>
                    <ellipse cx="82" cy="134" rx="3.5" ry="4.5" fill="#dc1e3c"/>
                    <ellipse cx="98" cy="134" rx="3.5" ry="4.5" fill="#dc1e3c"/>
                    <circle cx="83" cy="133" r="1.2" fill="white" opacity="0.9"/>
                    <circle cx="99" cy="133" r="1.2" fill="white" opacity="0.9"/>
                    <path d="M76 126 Q82 123 88 126" stroke="#1a0a2e" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M92 126 Q98 123 104 126" stroke="#1a0a2e" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M112 148 Q124 136 142 100 Q146 92 143 88 Q140 85 136 90 Q118 130 108 146Z" fill="#888" opacity="0.75"/>
                    <rect x="135" y="82" width="3" height="24" rx="1" fill="#f0c040" opacity="0.9" transform="rotate(-42 135 82)"/>
                    <path d="M72 228 Q70 208 71 192 Q75 190 79 192 Q79 210 76 228Z" fill="#1a1a2e"/>
                    <path d="M108 228 Q110 208 109 192 Q105 190 101 192 Q101 210 104 228Z" fill="#1a1a2e"/>
                    <rect x="66" y="225" width="13" height="7" rx="2" fill="#111"/>
                    <rect x="101" y="225" width="13" height="7" rx="2" fill="#111"/>
                    <ellipse cx="90" cy="192" rx="58" ry="72" stroke="#dc1e3c" strokeWidth="0.8" opacity="0.1" strokeDasharray="4 6"/>
                  </svg>
                </div>
                <div style={{ position:"relative",zIndex:5,width:"100%",background:"rgba(7,7,15,0.92)",borderTop:"1px solid rgba(255,255,255,0.05)",padding:"10px 12px 12px" }}>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start" }}>
                    <div>
                      <div style={{ fontFamily:"'Bangers',cursive",fontSize:15,letterSpacing:2,color:"#fff" }}>DEMON SLAYER</div>
                      <div style={{ fontSize:9,color:"rgba(255,255,255,0.28)",letterSpacing:3,marginTop:1,fontFamily:"'Noto Sans JP',sans-serif" }}>鬼滅の刃 ・ 完全版</div>
                    </div>
                    <div style={{ fontFamily:"'Bangers',cursive",fontSize:11,color:"rgba(255,255,255,0.28)",letterSpacing:1 }}>SUB / DUB</div>
                  </div>
                  <div style={{ display:"flex",alignItems:"center",gap:5,marginTop:6,flexWrap:"wrap" }}>
                    {[["Acción","r"],["Sobrenatural","r"],["2023","g"],["44 eps","y"]].map(([t,tp])=>(
                      <span key={t} style={{ padding:"2px 6px",borderRadius:2,fontSize:9,letterSpacing:1,fontFamily:"'Bangers',cursive",
                        background:tp==="r"?"rgba(220,30,60,0.15)":tp==="y"?"rgba(240,192,64,0.1)":"rgba(255,255,255,0.05)",
                        color:tp==="r"?"rgba(220,30,60,0.8)":tp==="y"?"rgba(240,192,64,0.7)":"rgba(255,255,255,0.35)",
                        border:tp==="r"?"1px solid rgba(220,30,60,0.2)":tp==="y"?"1px solid rgba(240,192,64,0.2)":"1px solid rgba(255,255,255,0.07)",
                      }}>{t}</span>
                    ))}
                  </div>
                  <div style={{ display:"flex",alignItems:"center",gap:4,marginTop:5 }}>
                    <span style={{ color:"#f0c040",fontSize:11 }}>★★★★★</span>
                    <span style={{ fontFamily:"'Bangers',cursive",fontSize:13,color:"#f0c040",letterSpacing:1 }}>9.8</span>
                    <span style={{ fontSize:9,color:"rgba(255,255,255,0.28)",fontFamily:"'Noto Sans JP',sans-serif" }}>/ 10 · 284K votos</span>
                  </div>
                  <button style={{ width:"100%",marginTop:8,background:"#dc1e3c",color:"#fff",border:"none",borderRadius:5,padding:8,fontFamily:"'Bangers',cursive",fontSize:12,letterSpacing:3,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:7 }}>
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="white"><polygon points="4,2 14,8 4,14"/></svg>
                    VER AHORA · EP 1
                  </button>
                </div>
              </div>

              {/* Floating tags — solo en pantallas grandes */}
              {[
                {label:"アニメ 2023",pos:{top:20,  left:-62},  red:false,gold:false},
                {label:"鬼滅の刃",  pos:{top:90,  left:-60},  red:true, gold:false},
                {label:"HD 1080p",  pos:{top:30,  right:-62}, red:false,gold:false},
                {label:"Sub Español",pos:{top:110,right:-62}, red:false,gold:true },
              ].map(({label,pos,red,gold})=>(
                <div key={label} className="hs-ftag" style={{
                  ...pos,
                  border:`1px solid ${red?"rgba(220,30,60,0.3)":gold?"rgba(240,192,64,0.3)":"rgba(255,255,255,0.1)"}`,
                  color:red?"rgba(220,30,60,0.65)":gold?"rgba(240,192,64,0.65)":"rgba(255,255,255,0.3)",
                }}>{label}</div>
              ))}
            </div>
          </div>
        </div>

        {/* ── STRIP ── */}
        <div className="hs-strip">
          <span style={{ flexShrink:0,fontSize:9,letterSpacing:4,color:"rgba(255,255,255,0.2)",textTransform:"uppercase",marginRight:18,fontFamily:"'Bangers',cursive",whiteSpace:"nowrap" }}>GÉNEROS</span>
          <div style={{ width:1,height:16,background:"rgba(255,255,255,0.1)",marginRight:18,flexShrink:0 }}/>
          <div className="hs-strip-scroll">
            {STRIP_ITEMS.map(({label,hl})=>(
              <span key={label} style={{ whiteSpace:"nowrap",fontSize:10,letterSpacing:3,fontFamily:"'Noto Sans JP',sans-serif",cursor:"pointer",color:hl?"rgba(220,30,60,0.55)":"rgba(255,255,255,0.2)",flexShrink:0,transition:"color .2s" }}>
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}