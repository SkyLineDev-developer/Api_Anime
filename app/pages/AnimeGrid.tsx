// AnimeGrid.tsx — Animes "Currently Airing" con paginación local desde Jikan API
// Requiere Google Fonts en tu layout:
// <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700;900&family=Bangers&family=Dela+Gothic+One&display=swap" rel="stylesheet">

"use client";

import { useEffect, useRef, useState } from "react";

const PER_PAGE  = 24;
const MAX_PAGES = 6;

// ── Types ─────────────────────────────────────────────────────────────────────
interface Anime {
  mal_id: number;
  title: string;
  type?: string;
  status?: string;
  score?: number;
  episodes?: number;
  genres?: { mal_id: number; name: string }[];
  images?: {
    webp?: { large_image_url?: string };
    jpg?:  { large_image_url?: string };
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function sleep(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

function getPageNumbers(current: number, total: number): (number | string)[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | string)[] = [1];
  if (current > 3) pages.push("...");
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i);
  if (current < total - 2) pages.push("...");
  pages.push(total);
  return pages;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function AnimeGrid() {
  const [all,      setAll]      = useState<Anime[]>([]);
  const [page,     setPage]     = useState(1);
  const [loading,  setLoading]  = useState(true);
  const [fetching, setFetching] = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const sectionRef              = useRef<HTMLElement>(null);

  // ── Fetch páginas de Jikan ────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res  = await fetch(
          "https://api.jikan.moe/v4/anime?status=airing&order_by=score&sort=desc&limit=25&page=1"
        );
        if (!res.ok) throw new Error(`API error ${res.status}`);
        const json       = await res.json();
        const firstBatch: Anime[] = (json.data ?? []).filter((a: Anime) => a.status === "Currently Airing");
        const lastApiPage: number = json.pagination?.last_visible_page ?? 1;

        if (!cancelled) { setAll(firstBatch); setLoading(false); }

        const limit = Math.min(lastApiPage, MAX_PAGES);
        if (limit > 1) {
          if (!cancelled) setFetching(true);
          for (let p = 2; p <= limit; p++) {
            await sleep(360);
            if (cancelled) break;
            const r2  = await fetch(
              `https://api.jikan.moe/v4/anime?status=airing&order_by=score&sort=desc&limit=25&page=${p}`
            );
            if (!r2.ok) break;
            const j2  = await r2.json();
            const more: Anime[] = (j2.data ?? []).filter((a: Anime) => a.status === "Currently Airing");
            if (!cancelled) setAll(prev => [...prev, ...more]);
          }
          if (!cancelled) setFetching(false);
        }
      } catch {
        if (!cancelled) { setError("No se pudo conectar con Jikan API"); setLoading(false); }
      }
    })();

    return () => { cancelled = true; };
  }, []);

  // ── Derived ───────────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(all.length / PER_PAGE));
  const items      = all.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const pageNums   = getPageNumbers(page, totalPages);

  function goTo(p: number) {
    if (p < 1 || p > totalPages) return;
    setPage(p);
    sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700;900&family=Bangers&family=Dela+Gothic+One&display=swap');

        .ag-bg-grid{position:absolute;inset:0;pointer-events:none;background-image:linear-gradient(rgba(220,30,60,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(220,30,60,0.04) 1px,transparent 1px);background-size:48px 48px;}
        .ag-scanlines{position:absolute;inset:0;pointer-events:none;background:repeating-linear-gradient(to bottom,transparent 0,transparent 3px,rgba(0,0,0,0.05) 3px,rgba(0,0,0,0.05) 4px);}

        .ag-badge-live{font-family:'Bangers',cursive;font-size:13px;letter-spacing:3px;background:rgba(220,30,60,0.15);border:1px solid rgba(220,30,60,0.4);color:#dc1e3c;padding:5px 14px;border-radius:3px;animation:ag-badge-pulse 2s ease-in-out infinite;display:flex;align-items:center;gap:6px;}
        @keyframes ag-badge-pulse{0%,100%{border-color:rgba(220,30,60,0.4);}50%{border-color:rgba(220,30,60,0.9);}}
        .ag-live-dot{width:7px;height:7px;border-radius:50%;background:#dc1e3c;animation:ag-dot-blink 1.2s ease-in-out infinite;}
        @keyframes ag-dot-blink{0%,100%{opacity:1;}50%{opacity:0.2;}}

        .ag-card{position:relative;border-radius:8px;overflow:hidden;cursor:pointer;background:#111120;border:1px solid rgba(255,255,255,0.06);transition:border-color 0.25s,transform 0.25s;animation:ag-card-in 0.35s ease both;}
        @keyframes ag-card-in{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);}}
        .ag-card:hover{border-color:rgba(220,30,60,0.35);transform:translateY(-4px);}
        .ag-card::after{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,#dc1e3c,transparent);opacity:0;transition:opacity 0.25s;}
        .ag-card:hover::after{opacity:1;}
        .ag-card:hover .ag-cimg{transform:scale(1.07);}
        .ag-card:hover .ag-play{opacity:1;transform:translate(-50%,-50%) scale(1);}
        .ag-card:hover .ag-ndot{opacity:0;}

        .ag-cimg{width:100%;height:100%;object-fit:cover;display:block;transition:transform 0.4s ease;}
        .ag-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(7,7,15,0.95) 0%,rgba(7,7,15,0.3) 50%,transparent 100%);opacity:0.85;}
        .ag-play{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) scale(0.8);z-index:5;width:36px;height:36px;border-radius:50%;background:rgba(220,30,60,0.85);border:1px solid rgba(255,255,255,0.3);display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity 0.2s,transform 0.2s;}
        .ag-ndot{position:absolute;top:10px;right:10px;z-index:5;width:8px;height:8px;border-radius:50%;background:#dc1e3c;box-shadow:0 0 6px rgba(220,30,60,0.8);animation:ag-dot-blink 1.5s ease-in-out infinite;transition:opacity 0.2s;}
        .ag-spin{width:40px;height:40px;border-radius:50%;border:3px solid rgba(220,30,60,0.2);border-top-color:#dc1e3c;animation:ag-spin 1s linear infinite;}
        @keyframes ag-spin{to{transform:rotate(360deg);}}

        .ag-pg-btn{width:36px;height:36px;border-radius:4px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.04);color:rgba(255,255,255,0.45);font-family:'Bangers',cursive;font-size:14px;letter-spacing:1px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.2s;}
        .ag-pg-btn:hover:not(:disabled){border-color:rgba(220,30,60,0.4);color:#fff;background:rgba(220,30,60,0.1);}
        .ag-pg-btn:disabled{opacity:0.25;cursor:not-allowed;}
        .ag-pg-num{min-width:36px;height:36px;border-radius:4px;border:1px solid rgba(255,255,255,0.08);background:transparent;color:rgba(255,255,255,0.35);font-family:'Bangers',cursive;font-size:14px;letter-spacing:1px;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0 8px;transition:all 0.2s;}
        .ag-pg-num:hover{border-color:rgba(220,30,60,0.3);color:rgba(255,255,255,0.7);}
        .ag-pg-num.active{background:rgba(220,30,60,0.15);border-color:rgba(220,30,60,0.5);color:#dc1e3c;}
      `}</style>

      <section ref={sectionRef} style={{ background:"#07070f", padding:"56px 40px 64px", fontFamily:"'Noto Sans JP',sans-serif", position:"relative", overflow:"hidden", minHeight:500 }}>
        <div className="ag-bg-grid"/>
        <div className="ag-scanlines"/>

        {/* ── Header ── */}
        <div style={{ position:"relative", zIndex:10, display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:32 }}>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <div style={{ width:4, height:36, background:"#dc1e3c", borderRadius:2, flexShrink:0 }}/>
            <div>
              <div style={{ fontFamily:"'Dela Gothic One',cursive", fontSize:26, color:"#fff", lineHeight:1 }}>En emisión ahora</div>
              <div style={{ fontSize:11, color:"rgba(255,255,255,0.25)", letterSpacing:5, marginTop:4 }}>現在放送中 ・ Currently Airing</div>
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <span className="ag-badge-live"><span className="ag-live-dot"/>EN VIVO</span>
            {all.length > 0 && (
              <span style={{ fontFamily:"'Bangers',cursive", fontSize:13, letterSpacing:2, color:"rgba(255,255,255,0.3)" }}>
                {all.length}{fetching ? "+" : ""} SERIES
              </span>
            )}
          </div>
        </div>

        {/* ── Loading ── */}
        {loading && (
          <div style={{ position:"relative", zIndex:10, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:300, gap:16 }}>
            <div className="ag-spin"/>
            <div style={{ fontFamily:"'Bangers',cursive", fontSize:14, letterSpacing:4, color:"rgba(255,255,255,0.35)" }}>読み込み中 ・ CARGANDO...</div>
          </div>
        )}

        {/* ── Error ── */}
        {error && !loading && (
          <div style={{ position:"relative", zIndex:10, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:300, gap:8 }}>
            <div style={{ fontFamily:"'Bangers',cursive", fontSize:16, letterSpacing:3, color:"rgba(220,30,60,0.7)" }}>エラー ・ ERROR</div>
            <div style={{ fontSize:12, color:"rgba(255,255,255,0.3)", letterSpacing:2 }}>{error}</div>
          </div>
        )}

        {/* ── Grid ── */}
        {!loading && !error && (
          <>
            <div style={{ position:"relative", zIndex:10, display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(155px, 1fr))", gap:14 }}>
              {items.map((anime, i) => {
                const img   = anime.images?.webp?.large_image_url ?? anime.images?.jpg?.large_image_url ?? "";
                const score = anime.score ? `★ ${anime.score.toFixed(1)}` : null;
                const eps   = anime.episodes ? `${anime.episodes} eps` : "? eps";
                const genre = anime.genres?.[0]?.name ?? null;

                return (
                  <div key={anime.mal_id} className="ag-card" style={{ animationDelay:`${(i * 0.03).toFixed(2)}s` }}>
                    <div style={{ width:"100%", aspectRatio:"3/4", overflow:"hidden", position:"relative", background:"#1a1a2e" }}>
                      <img src={img} alt={anime.title} className="ag-cimg" loading="lazy"
                        onError={e => { (e.currentTarget as HTMLImageElement).style.opacity = "0"; }}/>
                      <div className="ag-overlay"/>
                      <span style={{ position:"absolute", top:10, left:10, zIndex:5, fontFamily:"'Bangers',cursive", fontSize:11, letterSpacing:2, background:"#dc1e3c", color:"#fff", padding:"3px 8px", borderRadius:3 }}>
                        {anime.type || "TV"}
                      </span>
                      {score && (
                        <span style={{ position:"absolute", bottom:44, right:8, zIndex:5, fontFamily:"'Bangers',cursive", fontSize:12, letterSpacing:1, color:"#f0c040", background:"rgba(7,7,15,0.8)", border:"1px solid rgba(240,192,64,0.3)", padding:"2px 7px", borderRadius:3 }}>
                          {score}
                        </span>
                      )}
                      <div className="ag-ndot"/>
                      <div className="ag-play">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="white"><polygon points="2,1 10,6 2,11"/></svg>
                      </div>
                    </div>
                    <div style={{ padding:"10px 10px 12px", background:"#0d0d1e", borderTop:"1px solid rgba(255,255,255,0.05)" }}>
                      <div style={{ fontSize:12, fontWeight:700, color:"rgba(255,255,255,0.88)", lineHeight:1.35, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>
                        {anime.title}
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:5, marginTop:6, flexWrap:"wrap" }}>
                        {genre && (
                          <span style={{ fontFamily:"'Bangers',cursive", fontSize:10, letterSpacing:1, padding:"2px 6px", borderRadius:2, background:"rgba(220,30,60,0.15)", color:"rgba(220,30,60,0.8)", border:"1px solid rgba(220,30,60,0.2)" }}>{genre}</span>
                        )}
                        {genre && <div style={{ width:2, height:2, borderRadius:"50%", background:"rgba(255,255,255,0.15)", flexShrink:0 }}/>}
                        <span style={{ fontFamily:"'Bangers',cursive", fontSize:10, letterSpacing:1, padding:"2px 6px", borderRadius:2, background:"rgba(255,255,255,0.05)", color:"rgba(255,255,255,0.3)", border:"1px solid rgba(255,255,255,0.07)" }}>{eps}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── Pagination ── */}
            {totalPages > 1 && (
              <div style={{ position:"relative", zIndex:10, display:"flex", alignItems:"center", justifyContent:"center", gap:6, marginTop:40, paddingTop:32, borderTop:"1px solid rgba(255,255,255,0.06)", flexWrap:"wrap" }}>
                <button className="ag-pg-btn" onClick={() => goTo(page - 1)} disabled={page === 1}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="9,2 4,7 9,12"/></svg>
                </button>

                <span style={{ fontFamily:"'Noto Sans JP',sans-serif", fontSize:11, color:"rgba(255,255,255,0.22)", letterSpacing:3, margin:"0 8px", whiteSpace:"nowrap" }}>
                  {page} / {totalPages}
                </span>

                {pageNums.map((n, i) =>
                  n === "..." ? (
                    <span key={`e${i}`} style={{ color:"rgba(255,255,255,0.2)", fontFamily:"'Bangers',cursive", fontSize:14, padding:"0 4px" }}>···</span>
                  ) : (
                    <button key={n} className={`ag-pg-num${n === page ? " active" : ""}`} onClick={() => goTo(Number(n))}>{n}</button>
                  )
                )}

                <span style={{ fontFamily:"'Noto Sans JP',sans-serif", fontSize:11, color:"rgba(255,255,255,0.22)", letterSpacing:3, margin:"0 8px", whiteSpace:"nowrap" }}>
                  {all.length}{fetching ? "+" : ""} series
                </span>

                <button className="ag-pg-btn" onClick={() => goTo(page + 1)} disabled={page === totalPages}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="5,2 10,7 5,12"/></svg>
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </>
  );
}