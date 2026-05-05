// AnimeDetail.tsx — Página de detalle de anime usando Jikan API
// Cada tab carga su data de forma lazy para evitar el rate limit de Jikan (3 req/s)

"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

// ── Types ─────────────────────────────────────────────────────────────────────
interface AnimeDetail {
  mal_id: number;
  title: string;
  title_japanese?: string;
  title_english?: string;
  type?: string;
  status?: string;
  score?: number;
  scored_by?: number;
  rank?: number;
  popularity?: number;
  episodes?: number;
  duration?: string;
  rating?: string;
  season?: string;
  year?: number;
  synopsis?: string;
  background?: string;
  genres?: { mal_id: number; name: string }[];
  themes?: { mal_id: number; name: string }[];
  demographics?: { mal_id: number; name: string }[];
  studios?: { mal_id: number; name: string }[];
  producers?: { mal_id: number; name: string }[];
  source?: string;
  aired?: { string: string };
  trailer?: { youtube_id?: string | null };
  images?: {
    webp?: { large_image_url?: string };
    jpg?: { large_image_url?: string };
  };
  relations?: {
    relation: string;
    entry: { mal_id: number; name: string; type: string }[];
  }[];
  theme?: {
    openings?: string[];
    endings?: string[];
  };
  streaming?: { name: string; url: string }[];
  broadcast?: { string?: string };
  members?: number;
  favorites?: number;
}

interface Character {
  character: {
    mal_id: number;
    name: string;
    images?: { webp?: { image_url?: string }; jpg?: { image_url?: string } };
  };
  role: string;
  voice_actors?: {
    person: { name: string; images?: { jpg?: { image_url?: string } } };
    language: string;
  }[];
}

interface Episode {
  mal_id: number;
  title: string;
  title_japanese?: string;
  aired?: string;
  score?: number;
  filler?: boolean;
  recap?: boolean;
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  malId: number;
}

// ── Small components ──────────────────────────────────────────────────────────
function StatBox({ label, value }: { label: string; value?: string | number }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 6, padding: "12px 16px", display: "flex", flexDirection: "column", gap: 4, minWidth: 80 }}>
      <span style={{ fontFamily: "'Bangers',cursive", fontSize: 10, letterSpacing: 3, color: "rgba(220,30,60,0.7)" }}>{label}</span>
      <span style={{ fontFamily: "'Dela Gothic One',cursive", fontSize: 16, color: "#fff", lineHeight: 1 }}>{value ?? "—"}</span>
    </div>
  );
}

function Tag({ text, accent }: { text: string; accent?: boolean }) {
  return (
    <span style={{ fontFamily: "'Bangers',cursive", fontSize: 11, letterSpacing: 2, padding: "4px 10px", borderRadius: 3, background: accent ? "rgba(220,30,60,0.15)" : "rgba(255,255,255,0.05)", color: accent ? "rgba(220,30,60,0.9)" : "rgba(255,255,255,0.45)", border: `1px solid ${accent ? "rgba(220,30,60,0.3)" : "rgba(255,255,255,0.08)"}`, whiteSpace: "nowrap" as const }}>
      {text}
    </span>
  );
}

function TabLoader() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 0", gap: 12 }}>
      <div style={{ width: 28, height: 28, borderRadius: "50%", border: "3px solid rgba(220,30,60,0.2)", borderTopColor: "#dc1e3c", animation: "ad-spin 1s linear infinite" }} />
      <span style={{ fontFamily: "'Bangers',cursive", fontSize: 13, letterSpacing: 3, color: "rgba(255,255,255,0.3)" }}>CARGANDO...</span>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function AnimeDetail({ malId }: Props) {
  const router = useRouter();

  // Data states
  const [detail,     setDetail]     = useState<AnimeDetail | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [episodes,   setEpisodes]   = useState<Episode[]>([]);

  // Loading states por sección
  const [loadingDetail, setLoadingDetail] = useState(true);
  const [loadingChars,  setLoadingChars]  = useState(false);
  const [loadingEps,    setLoadingEps]    = useState(false);

  // Control qué tabs ya se cargaron
  const loadedTabs = useRef<Set<string>>(new Set());

  const [activeTab, setActiveTab] = useState<"info" | "chars" | "eps" | "related" | "themes">("info");
  const [error, setError] = useState<string | null>(null);
  const [showFullSynopsis, setShowFullSynopsis] = useState(false);
  const [epPage, setEpPage] = useState(1);
  const EPS_PER_PAGE = 25;

  // ── Fetch detalle principal (siempre al montar) ───────────────────────────
  useEffect(() => {
    let cancelled = false;
    setLoadingDetail(true);

    fetch(`https://api.jikan.moe/v4/anime/${malId}/full`)
      .then(r => {
        if (!r.ok) throw new Error(`${r.status}`);
        return r.json();
      })
      .then(j => { if (!cancelled) { setDetail(j.data); setLoadingDetail(false); } })
      .catch(() => { if (!cancelled) { setError("No se pudo cargar el anime"); setLoadingDetail(false); } });

    return () => { cancelled = true; };
  }, [malId]);

  // ── Lazy fetch por tab ────────────────────────────────────────────────────
  const fetchCharacters = useCallback(async () => {
    if (loadedTabs.current.has("chars")) return;
    loadedTabs.current.add("chars");
    setLoadingChars(true);
    try {
      const r = await fetch(`https://api.jikan.moe/v4/anime/${malId}/characters`);
      if (r.ok) {
        const j = await r.json();
        // Ordenar: Main primero, luego Supporting
        const sorted = (j.data ?? []).sort((a: Character, b: Character) => {
          if (a.role === "Main" && b.role !== "Main") return -1;
          if (b.role === "Main" && a.role !== "Main") return 1;
          return 0;
        });
        setCharacters(sorted.slice(0, 30));
      }
    } catch { /* silencioso */ }
    setLoadingChars(false);
  }, [malId]);

  const fetchEpisodes = useCallback(async () => {
    if (loadedTabs.current.has("eps")) return;
    loadedTabs.current.add("eps");
    setLoadingEps(true);
    try {
      const r = await fetch(`https://api.jikan.moe/v4/anime/${malId}/episodes?page=1`);
      if (r.ok) {
        const j = await r.json();
        setEpisodes(j.data ?? []);
      }
    } catch { /* silencioso */ }
    setLoadingEps(false);
  }, [malId]);

  // Disparar fetch según tab activo
  useEffect(() => {
    if (activeTab === "chars")  fetchCharacters();
    if (activeTab === "eps")    fetchEpisodes();
  }, [activeTab, fetchCharacters, fetchEpisodes]);

  // ── Derived ───────────────────────────────────────────────────────────────
  const img      = detail?.images?.webp?.large_image_url ?? detail?.images?.jpg?.large_image_url ?? "";
  const synopsis = detail?.synopsis ?? "";
  const short    = synopsis.length > 450 ? synopsis.slice(0, 450) + "…" : synopsis;
  const epSlice  = episodes.slice((epPage - 1) * EPS_PER_PAGE, epPage * EPS_PER_PAGE);
  const epTotal  = Math.max(1, Math.ceil(episodes.length / EPS_PER_PAGE));

  const tabs = [
    { key: "info"    as const, label: "INFO"       },
    { key: "chars"   as const, label: "PERSONAJES" },
    { key: "eps"     as const, label: "EPISODIOS"  },
    { key: "related" as const, label: "RELACIONADOS"},
    { key: "themes"  as const, label: "MÚSICAS"    },
  ];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700;900&family=Bangers&family=Dela+Gothic+One&display=swap');

        .ad-bg{position:absolute;inset:0;pointer-events:none;background-image:linear-gradient(rgba(220,30,60,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(220,30,60,0.03) 1px,transparent 1px);background-size:48px 48px;}
        .ad-scan{position:absolute;inset:0;pointer-events:none;background:repeating-linear-gradient(to bottom,transparent 0,transparent 3px,rgba(0,0,0,0.04) 3px,rgba(0,0,0,0.04) 4px);}

        .ad-back{display:inline-flex;align-items:center;gap:8px;font-family:'Bangers',cursive;font-size:13px;letter-spacing:3px;color:rgba(255,255,255,0.4);background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.09);border-radius:4px;padding:8px 16px;cursor:pointer;transition:all 0.2s;}
        .ad-back:hover{color:#fff;border-color:rgba(220,30,60,0.4);background:rgba(220,30,60,0.08);}

        .ad-tab{font-family:'Bangers',cursive;font-size:12px;letter-spacing:3px;padding:10px 16px;border:none;background:transparent;color:rgba(255,255,255,0.3);cursor:pointer;border-bottom:2px solid transparent;transition:all 0.2s;white-space:nowrap;}
        .ad-tab:hover{color:rgba(255,255,255,0.6);}
        .ad-tab.on{color:#dc1e3c;border-bottom-color:#dc1e3c;}

        .ad-char{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:8px;overflow:hidden;transition:border-color 0.2s,transform 0.2s;animation:ad-in 0.3s ease both;}
        .ad-char:hover{border-color:rgba(220,30,60,0.3);transform:translateY(-3px);}
        @keyframes ad-in{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
        @keyframes ad-spin{to{transform:rotate(360deg);}}

        .ad-ep{display:grid;grid-template-columns:44px 1fr auto;align-items:center;gap:12px;padding:10px 14px;border-radius:6px;border:1px solid rgba(255,255,255,0.05);background:rgba(255,255,255,0.02);transition:all 0.15s;}
        .ad-ep:hover{border-color:rgba(220,30,60,0.25);background:rgba(220,30,60,0.04);}
        .ad-ep.fil{opacity:0.4;}

        .ad-pg{width:32px;height:32px;border-radius:4px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.04);color:rgba(255,255,255,0.45);font-family:'Bangers',cursive;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.2s;}
        .ad-pg:hover:not(:disabled){border-color:rgba(220,30,60,0.4);color:#fff;background:rgba(220,30,60,0.1);}
        .ad-pg:disabled{opacity:0.25;cursor:not-allowed;}

        .ad-section-title{font-family:'Bangers',cursive;font-size:11px;letter-spacing:4px;color:rgba(220,30,60,0.6);margin-bottom:10px;}

        @media(max-width:640px){
          .ad-hero{flex-direction:column!important;}
          .ad-poster{width:160px!important;margin:0 auto!important;}
          .ad-stats{flex-wrap:wrap!important;}
        }
      `}</style>

      <section style={{ background: "#07070f", minHeight: "100vh", fontFamily: "'Noto Sans JP',sans-serif", position: "relative", overflow: "hidden" }}>
        <div className="ad-bg" />
        <div className="ad-scan" />

        <div style={{ position: "relative", zIndex: 10, maxWidth: 1100, margin: "0 auto", padding: "36px 20px 80px" }}>

          {/* Back */}
          <button className="ad-back" onClick={() => router.back()} style={{ marginBottom: 28 }}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="8,2 3,6.5 8,11"/></svg>
            VOLVER
          </button>

          {/* ── Loading principal ── */}
          {loadingDetail && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 400, gap: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", border: "3px solid rgba(220,30,60,0.15)", borderTopColor: "#dc1e3c", animation: "ad-spin 1s linear infinite" }} />
              <span style={{ fontFamily: "'Bangers',cursive", fontSize: 13, letterSpacing: 4, color: "rgba(255,255,255,0.3)" }}>読み込み中 ・ CARGANDO...</span>
            </div>
          )}

          {/* ── Error ── */}
          {error && !loadingDetail && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minHeight: 400, justifyContent: "center", gap: 8 }}>
              <span style={{ fontFamily: "'Bangers',cursive", fontSize: 15, letterSpacing: 3, color: "rgba(220,30,60,0.7)" }}>エラー ・ ERROR</span>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>{error}</span>
            </div>
          )}

          {/* ── Contenido ── */}
          {!loadingDetail && !error && detail && (
            <>
              {/* ── HERO ── */}
              <div className="ad-hero" style={{ display: "flex", gap: 28, marginBottom: 36, alignItems: "flex-start" }}>

                {/* Poster */}
                <div className="ad-poster" style={{ width: 190, flexShrink: 0, borderRadius: 10, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 0 40px rgba(220,30,60,0.1)" }}>
                  {img
                    ? <img src={img} alt={detail.title} style={{ width: "100%", display: "block", objectFit: "cover" }} />
                    : <div style={{ width: "100%", aspectRatio: "3/4", background: "#1a1a2e", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ color: "rgba(255,255,255,0.1)", fontSize: 28 }}>?</span></div>
                  }
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>

                  {/* Badges */}
                  <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
                    {detail.type    && <Tag text={detail.type} accent />}
                    {detail.status  && <Tag text={detail.status} />}
                    {detail.rating  && <Tag text={detail.rating} />}
                    {detail.season  && detail.year && <Tag text={`${detail.season.toUpperCase()} ${detail.year}`} />}
                  </div>

                  {/* Título */}
                  <h1 style={{ fontFamily: "'Dela Gothic One',cursive", fontSize: "clamp(20px, 4vw, 34px)", color: "#fff", lineHeight: 1.1, margin: "0 0 4px" }}>
                    {detail.title}
                  </h1>
                  {detail.title_english && detail.title_english !== detail.title && (
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginBottom: 3 }}>{detail.title_english}</div>
                  )}
                  {detail.title_japanese && (
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.2)", marginBottom: 14 }}>{detail.title_japanese}</div>
                  )}

                  {/* Score */}
                  <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 18 }}>
                    {detail.score && (
                      <div style={{ position: "relative", width: 68, height: 68, flexShrink: 0 }}>
                        <svg viewBox="0 0 68 68" width="68" height="68" style={{ position: "absolute", inset: 0 }}>
                          <circle cx="34" cy="34" r="28" fill="none" stroke="rgba(220,30,60,0.12)" strokeWidth="5" />
                          <circle cx="34" cy="34" r="28" fill="none" stroke="#dc1e3c" strokeWidth="5"
                            strokeDasharray={`${((detail.score / 10) * 175.9).toFixed(1)} 175.9`}
                            strokeLinecap="round" transform="rotate(-90 34 34)" />
                        </svg>
                        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                          <span style={{ fontFamily: "'Bangers',cursive", fontSize: 19, color: "#f0c040", lineHeight: 1 }}>{detail.score.toFixed(1)}</span>
                          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: 1 }}>/10</span>
                        </div>
                      </div>
                    )}
                    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                      {detail.rank       && <span style={{ fontFamily: "'Bangers',cursive", fontSize: 13, letterSpacing: 2, color: "rgba(255,255,255,0.4)" }}>RANK #{detail.rank}</span>}
                      {detail.popularity && <span style={{ fontFamily: "'Bangers',cursive", fontSize: 13, letterSpacing: 2, color: "rgba(255,255,255,0.25)" }}>POPULARIDAD #{detail.popularity}</span>}
                      {detail.scored_by  && <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>{detail.scored_by.toLocaleString()} votos</span>}
                      {detail.members    && <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>{detail.members.toLocaleString()} miembros</span>}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="ad-stats" style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
                    <StatBox label="Eps"      value={detail.episodes ?? "?"} />
                    <StatBox label="Duración" value={detail.duration?.replace(" per ep", "") ?? "?"} />
                    <StatBox label="Fuente"   value={detail.source ?? "?"} />
                    <StatBox label="Emisión"  value={detail.aired?.string ?? "?"} />
                    {detail.broadcast?.string && <StatBox label="Horario" value={detail.broadcast.string} />}
                  </div>

                  {/* Géneros / temas */}
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                    {detail.genres?.map(g => <Tag key={g.mal_id} text={g.name} accent />)}
                    {detail.themes?.map(t => <Tag key={t.mal_id} text={t.name} />)}
                    {detail.demographics?.map(d => <Tag key={d.mal_id} text={d.name} />)}
                  </div>

                  {/* Studio */}
                  {detail.studios?.length ? (
                    <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 8 }}>
                      <span style={{ fontFamily: "'Bangers',cursive", fontSize: 10, letterSpacing: 3, color: "rgba(255,255,255,0.2)" }}>STUDIO</span>
                      {detail.studios.map(s => (
                        <span key={s.mal_id} style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", padding: "3px 10px", borderRadius: 3 }}>{s.name}</span>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>

              {/* ── TABS ── */}
              <div style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", marginBottom: 26, display: "flex", gap: 0, overflowX: "auto" }}>
                {tabs.map(t => (
                  <button key={t.key} className={`ad-tab${activeTab === t.key ? " on" : ""}`} onClick={() => setActiveTab(t.key)}>
                    {t.label}
                  </button>
                ))}
              </div>

              {/* ── TAB INFO ── */}
              {activeTab === "info" && (
                <div style={{ display: "grid", gap: 28 }}>

                  {/* Sinopsis */}
                  {synopsis && (
                    <div>
                      <div className="ad-section-title">SINOPSIS</div>
                      <p style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", lineHeight: 1.85, margin: 0, whiteSpace: "pre-line" }}>
                        {showFullSynopsis ? synopsis : short}
                      </p>
                      {synopsis.length > 450 && (
                        <button onClick={() => setShowFullSynopsis(p => !p)} style={{ background: "none", border: "none", fontFamily: "'Bangers',cursive", fontSize: 11, letterSpacing: 2, color: "rgba(220,30,60,0.8)", cursor: "pointer", padding: "6px 0 0", display: "block" }}>
                          {showFullSynopsis ? "▲ VER MENOS" : "▼ VER MÁS"}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Background */}
                  {detail.background && (
                    <div>
                      <div className="ad-section-title">BACKGROUND</div>
                      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.8, margin: 0 }}>{detail.background}</p>
                    </div>
                  )}

                  {/* Trailer */}
                  {detail.trailer?.youtube_id && (
                    <div>
                      <div className="ad-section-title">TRAILER</div>
                      <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", borderRadius: 8, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)" }}>
                        <iframe src={`https://www.youtube-nocookie.com/embed/${detail.trailer.youtube_id}`} title="Trailer" allowFullScreen style={{ width: "100%", height: "100%", border: "none" }} />
                      </div>
                    </div>
                  )}

                  {/* Streaming */}
                  {detail.streaming?.length ? (
                    <div>
                      <div className="ad-section-title">DÓNDE VER</div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {detail.streaming.map(s => (
                          <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer"
                            style={{ fontFamily: "'Bangers',cursive", fontSize: 12, letterSpacing: 2, padding: "6px 14px", borderRadius: 4, background: "rgba(220,30,60,0.12)", border: "1px solid rgba(220,30,60,0.3)", color: "#dc1e3c", textDecoration: "none", transition: "all 0.2s" }}>
                            {s.name}
                          </a>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {/* Productores */}
                  {detail.producers?.length ? (
                    <div>
                      <div className="ad-section-title">PRODUCTORES</div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {detail.producers.map(p => <Tag key={p.mal_id} text={p.name} />)}
                      </div>
                    </div>
                  ) : null}
                </div>
              )}

              {/* ── TAB PERSONAJES ── */}
              {activeTab === "chars" && (
                <div>
                  {loadingChars ? <TabLoader /> : characters.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "60px 0", color: "rgba(255,255,255,0.2)", fontFamily: "'Bangers',cursive", letterSpacing: 3 }}>SIN DATOS</div>
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(150px, calc(50% - 7px)), 1fr))", gap: 12 }}>
                      {characters.map((c, i) => {
                        const cImg  = c.character.images?.webp?.image_url ?? c.character.images?.jpg?.image_url ?? "";
                        const jaVA  = c.voice_actors?.find(v => v.language === "Japanese");
                        const vaImg = jaVA?.person.images?.jpg?.image_url ?? "";
                        return (
                          <div key={c.character.mal_id} className="ad-char" style={{ animationDelay: `${(i * 0.025).toFixed(2)}s` }}>
                            <div style={{ position: "relative", aspectRatio: "3/4", background: "#1a1a2e", overflow: "hidden" }}>
                              {cImg && <img src={cImg} alt={c.character.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} loading="lazy" />}
                              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(7,7,15,0.92) 0%,transparent 55%)" }} />
                              {/* Rol badge */}
                              <span style={{ position: "absolute", top: 8, left: 8, fontFamily: "'Bangers',cursive", fontSize: 10, letterSpacing: 2, background: c.role === "Main" ? "#dc1e3c" : "rgba(0,0,0,0.6)", color: "#fff", padding: "2px 7px", borderRadius: 3 }}>
                                {c.role === "Main" ? "MAIN" : "SUP"}
                              </span>
                              {/* VA mini avatar */}
                              {vaImg && (
                                <div style={{ position: "absolute", top: 8, right: 8, width: 30, height: 30, borderRadius: "50%", overflow: "hidden", border: "2px solid rgba(220,30,60,0.5)" }}>
                                  <img src={vaImg} alt={jaVA?.person.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
                                </div>
                              )}
                              <div style={{ position: "absolute", bottom: 8, left: 8, right: 8 }}>
                                <div style={{ fontSize: 11, fontWeight: 700, color: "#fff", lineHeight: 1.3 }}>{c.character.name}</div>
                              </div>
                            </div>
                            {jaVA && (
                              <div style={{ padding: "7px 10px", background: "#0d0d1e", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", letterSpacing: 1, marginBottom: 2 }}>VA (JP)</div>
                                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", lineHeight: 1.3 }}>{jaVA.person.name}</div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ── TAB EPISODIOS ── */}
              {activeTab === "eps" && (
                <div>
                  {loadingEps ? <TabLoader /> : episodes.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "60px 0", color: "rgba(255,255,255,0.2)", fontFamily: "'Bangers',cursive", letterSpacing: 3 }}>SIN DATOS DE EPISODIOS</div>
                  ) : (
                    <>
                      <div style={{ marginBottom: 12, fontFamily: "'Bangers',cursive", fontSize: 11, letterSpacing: 3, color: "rgba(255,255,255,0.2)" }}>
                        {episodes.length} EPISODIOS (pág. {epPage}/{epTotal})
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {epSlice.map(ep => (
                          <div key={ep.mal_id} className={`ad-ep${ep.filler ? " fil" : ""}`}>
                            <div style={{ fontFamily: "'Bangers',cursive", fontSize: 15, color: ep.filler ? "rgba(255,255,255,0.2)" : "rgba(220,30,60,0.7)", letterSpacing: 1, textAlign: "center" }}>
                              {ep.mal_id}
                            </div>
                            <div>
                              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", lineHeight: 1.3 }}>{ep.title || "—"}</div>
                              {ep.title_japanese && <div style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", marginTop: 2 }}>{ep.title_japanese}</div>}
                              <div style={{ display: "flex", gap: 6, marginTop: 4, flexWrap: "wrap", alignItems: "center" }}>
                                {ep.filler && <Tag text="FILLER" />}
                                {ep.recap  && <Tag text="RECAP" />}
                                {ep.aired  && <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", letterSpacing: 1 }}>{ep.aired.slice(0, 10)}</span>}
                              </div>
                            </div>
                            <div style={{ fontFamily: "'Bangers',cursive", fontSize: 12, color: "#f0c040", whiteSpace: "nowrap" }}>
                              {ep.score ? `★ ${ep.score}` : ""}
                            </div>
                          </div>
                        ))}
                      </div>

                      {epTotal > 1 && (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 20, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                          <button className="ad-pg" onClick={() => setEpPage(p => p - 1)} disabled={epPage === 1}>
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="8,2 3,6 8,10"/></svg>
                          </button>
                          <span style={{ fontFamily: "'Bangers',cursive", fontSize: 13, letterSpacing: 2, color: "rgba(255,255,255,0.35)" }}>{epPage} / {epTotal}</span>
                          <button className="ad-pg" onClick={() => setEpPage(p => p + 1)} disabled={epPage === epTotal}>
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="4,2 9,6 4,10"/></svg>
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* ── TAB RELACIONADOS ── */}
              {activeTab === "related" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
                  {!detail.relations?.length ? (
                    <div style={{ textAlign: "center", padding: "60px 0", color: "rgba(255,255,255,0.2)", fontFamily: "'Bangers',cursive", letterSpacing: 3 }}>SIN RELACIONADOS</div>
                  ) : detail.relations.map(rel => (
                    <div key={rel.relation}>
                      <div className="ad-section-title">{rel.relation.toUpperCase()}</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {rel.entry.map(e => (
                          <div key={e.mal_id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 6, padding: "10px 14px" }}>
                            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>{e.name}</span>
                            <Tag text={e.type.toUpperCase()} />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ── TAB MÚSICAS ── */}
              {activeTab === "themes" && (
                <div style={{ display: "grid", gap: 28 }}>
                  {detail.theme?.openings?.length ? (
                    <div>
                      <div className="ad-section-title">OPENINGS</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {detail.theme.openings.map((op, i) => (
                          <div key={i} style={{ padding: "10px 14px", borderRadius: 6, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.4 }}>{op}</div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {detail.theme?.endings?.length ? (
                    <div>
                      <div className="ad-section-title">ENDINGS</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {detail.theme.endings.map((ed, i) => (
                          <div key={i} style={{ padding: "10px 14px", borderRadius: 6, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.4 }}>{ed}</div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {!detail.theme?.openings?.length && !detail.theme?.endings?.length && (
                    <div style={{ textAlign: "center", padding: "60px 0", color: "rgba(255,255,255,0.2)", fontFamily: "'Bangers',cursive", letterSpacing: 3 }}>SIN DATOS DE MÚSICAS</div>
                  )}
                </div>
              )}

            </>
          )}
        </div>
      </section>
    </>
  );
}