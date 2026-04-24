// AnimeDirectory.jsx
// Requiere Google Fonts en tu layout:
// <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700;900&family=Bangers&family=Dela+Gothic+One&display=swap" rel="stylesheet">

"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

// Generos se cargan dinamicamente desde Jikan (incluye explicit genres: Hentai, Yaoi, Yuri, etc.)

const STATUS_OPTIONS = [
  { val: "airing",   label: "En emision",    jp: "放送中" },
  { val: "complete", label: "Finalizado",     jp: "完了"   },
  { val: "upcoming", label: "Proximamente",   jp: "予定"   },
];

const TYPE_OPTIONS = [
  { val: "tv",      label: "Serie (TV)", jp: "TVシリーズ" },
  { val: "movie",   label: "Pelicula",   jp: "映画"       },
  { val: "ova",     label: "OVA",        jp: "OVA"        },
  { val: "ona",     label: "ONA",        jp: "ONA"        },
  { val: "special", label: "Especial",   jp: "スペシャル" },
];

const ORDER_OPTIONS = [
  { val: "score",      label: "Mayor puntuacion" },
  { val: "popularity", label: "Mas populares"    },
  { val: "members",    label: "Mas miembros"     },
  { val: "favorites",  label: "Mas favoritos"    },
  { val: "start_date", label: "Mas recientes"    },
  { val: "title",      label: "Titulo A-Z"       },
];

function statusToJikan(val) {
  if (val === "airing")   return "Currently Airing";
  if (val === "complete") return "Finished Airing";
  if (val === "upcoming") return "Not yet aired";
  return val;
}

function getPageNums(cur, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const p = [1];
  if (cur > 3) p.push("...");
  for (let i = Math.max(2, cur - 1); i <= Math.min(total - 1, cur + 1); i++) p.push(i);
  if (cur < total - 2) p.push("...");
  p.push(total);
  return p;
}

// ── Searchable multi-select ────────────────────────────────────────────────────
function MultiSelect({ label, labelJp, placeholder, options, selected, onToggle, single = false, loading = false }) {
  const [open,  setOpen]  = useState(false);
  const [query, setQuery] = useState("");
  const inputRef          = useRef(null);
  const wrapRef           = useRef(null);

  useEffect(() => {
    function handler(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  const filtered = options.filter(o =>
    (o.name ?? o.label).toLowerCase().includes(query.toLowerCase())
  );

  const selectedLabels = options
    .filter(o => selected.includes(single ? o.val : (o.id ?? o.val)))
    .map(o => o.name ?? o.label);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1, minWidth: 130 }} ref={wrapRef}>
      <div style={{ fontFamily: "'Bangers',cursive", fontSize: 10, letterSpacing: 3, color: "rgba(255,255,255,0.3)" }}>
        {label}{labelJp && <span style={{ opacity: .5, marginLeft: 4 }}>· {labelJp}</span>}
      </div>
      <div style={{ position: "relative" }}>

        {/* Trigger */}
        <div
          onClick={() => { if (!loading) { setOpen(v => !v); setQuery(""); } }}
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
            padding: "8px 12px", borderRadius: 6,
            cursor: loading ? "not-allowed" : "pointer",
            background: open ? "rgba(220,30,60,0.08)" : "rgba(255,255,255,0.05)",
            border: `1px solid ${open ? "rgba(220,30,60,0.5)" : "rgba(255,255,255,0.1)"}`,
            color: "rgba(255,255,255,0.7)", fontSize: 12,
            fontFamily: "'Noto Sans JP',sans-serif", transition: "all .2s", userSelect: "none",
            opacity: loading ? .5 : 1,
          }}
        >
          <div style={{ display: "flex", gap: 4, flexWrap: "nowrap", overflow: "hidden", flex: 1, minWidth: 0 }}>
            {loading ? (
              <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 11 }}>Cargando...</span>
            ) : selectedLabels.length === 0 ? (
              <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}>{placeholder}</span>
            ) : (
              <>
                {selectedLabels.slice(0, 3).map(n => (
                  <span key={n} style={{ fontFamily: "'Bangers',cursive", fontSize: 9, letterSpacing: 1, background: "rgba(220,30,60,0.2)", color: "#dc1e3c", border: "1px solid rgba(220,30,60,0.3)", padding: "1px 6px", borderRadius: 2, whiteSpace: "nowrap" }}>
                    {n}
                  </span>
                ))}
                {selectedLabels.length > 3 && (
                  <span style={{ fontFamily: "'Bangers',cursive", fontSize: 9, background: "rgba(220,30,60,0.2)", color: "#dc1e3c", border: "1px solid rgba(220,30,60,0.3)", padding: "1px 6px", borderRadius: 2 }}>
                    +{selectedLabels.length - 3}
                  </span>
                )}
              </>
            )}
          </div>
          <svg style={{ width: 14, height: 14, flexShrink: 0, opacity: .5, transition: "transform .2s", transform: open ? "rotate(180deg)" : "none" }}
            viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <polyline points="2,4 7,10 12,4" />
          </svg>
        </div>

        {/* Dropdown */}
        {open && !loading && (
          <div style={{
            position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, zIndex: 50,
            background: "#0d0d1e", border: "1px solid rgba(220,30,60,0.25)",
            borderRadius: 8, overflow: "hidden", boxShadow: "0 12px 32px rgba(0,0,0,0.6)",
            animation: "dir-drop-in .15s ease both",
          }}>
            {/* Search input */}
            <div style={{ padding: "8px 10px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 7, background: "rgba(255,255,255,0.02)" }}>
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="1.5" style={{ opacity: .35, flexShrink: 0 }}>
                <circle cx="6.5" cy="6.5" r="5" /><line x1="10.5" y1="10.5" x2="14.5" y2="14.5" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Buscar..."
                onClick={e => e.stopPropagation()}
                style={{ background: "none", border: "none", outline: "none", color: "#fff", fontSize: 12, width: "100%", fontFamily: "'Noto Sans JP',sans-serif" }}
              />
              {query && (
                <button
                  onClick={e => { e.stopPropagation(); setQuery(""); }}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)", fontSize: 14, lineHeight: 1, padding: 0, flexShrink: 0 }}>
                  x
                </button>
              )}
            </div>

            {/* Options */}
            <div style={{ maxHeight: 220, overflowY: "auto", scrollbarWidth: "thin", scrollbarColor: "rgba(220,30,60,0.3) transparent" }}>
              {filtered.length === 0 ? (
                <div style={{ padding: "14px 12px", textAlign: "center", fontFamily: "'Bangers',cursive", fontSize: 11, letterSpacing: 2, color: "rgba(255,255,255,0.2)" }}>
                  Sin resultados
                </div>
              ) : (
                filtered.map(opt => {
                  const key        = opt.id ?? opt.val;
                  const isSelected = selected.includes(key);
                  return (
                    <div
                      key={key}
                      onClick={() => { onToggle(key); if (single) { setOpen(false); setQuery(""); } }}
                      style={{
                        display: "flex", alignItems: "center", gap: 8,
                        padding: "9px 12px", cursor: "pointer", fontSize: 12,
                        color: isSelected ? "#dc1e3c" : "rgba(255,255,255,0.6)",
                        background: isSelected ? "rgba(220,30,60,0.07)" : "transparent",
                        borderBottom: "1px solid rgba(255,255,255,0.04)", transition: "background .15s",
                        fontFamily: "'Noto Sans JP',sans-serif",
                      }}
                    >
                      <div style={{
                        width: 14, height: 14, borderRadius: 3, flexShrink: 0,
                        border: `1px solid ${isSelected ? "#dc1e3c" : "rgba(255,255,255,0.2)"}`,
                        background: isSelected ? "#dc1e3c" : "transparent",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        {isSelected && (
                          <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="white" strokeWidth="1.5">
                            <polyline points="1,4 3,6 7,2" />
                          </svg>
                        )}
                      </div>
                      <span>{opt.name ?? opt.label}</span>
                      {opt.jp && <span style={{ fontSize: 9, opacity: .4, marginLeft: 2 }}>{opt.jp}</span>}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function AnimeDirectory() {
  // Generos cargados desde la API
  const [genreOptions,  setGenreOptions]  = useState([]);
  const [genresLoading, setGenresLoading] = useState(true);

  // Filtros
  const [selGenres, setSelGenres] = useState([]);
  const [selStatus, setSelStatus] = useState([]);
  const [selTypes,  setSelTypes]  = useState([]);
  const [order,     setOrder]     = useState("score");

  // Data
  const [animes,   setAnimes]   = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);
  const [page,     setPage]     = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total,    setTotal]    = useState(null);

  const sectionRef = useRef(null);

  // ── Cargar TODOS los generos desde Jikan (un solo endpoint) ─────────────────
  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch("https://api.jikan.moe/v4/genres/anime");
        if (!res.ok) throw new Error();
        const json = await res.json();

        const genres = (json.data ?? [])
          .map(g => ({ id: g.mal_id, name: g.name }))
          .sort((a, b) => a.name.localeCompare(b.name));

        setGenreOptions(genres);
      } catch {
        // Fallback a lista basica si falla
        setGenreOptions([
          { id: 1,  name: "Action"       }, { id: 2,  name: "Adventure"    },
          { id: 4,  name: "Comedy"       }, { id: 8,  name: "Drama"        },
          { id: 10, name: "Fantasy"      }, { id: 14, name: "Horror"       },
          { id: 22, name: "Romance"      }, { id: 24, name: "Sci-Fi"       },
          { id: 36, name: "Slice of Life"}, { id: 37, name: "Supernatural" },
          { id: 62, name: "Isekai"       }, { id: 27, name: "Shounen"      },
          { id: 25, name: "Shoujo"       }, { id: 42, name: "Seinen"       },
          { id: 49, name: "Hentai"       }, { id: 26, name: "Yaoi"         },
          { id: 74, name: "Yuri"         },
        ]);
      } finally {
        setGenresLoading(false);
      }
    })();
  }, []);

  // ── Fetch animes ─────────────────────────────────────────────────────────────
  const fetchAnimes = useCallback(async (pg) => {
    setLoading(true); setError(null);
    try {
      const params = new URLSearchParams();
      params.set("limit",    "24");
      params.set("page",     pg);
      params.set("order_by", order);
      params.set("sort",     order === "title" ? "asc" : "desc");

      if (selStatus.length === 1) params.set("status", selStatus[0]);
      if (selTypes.length  === 1) params.set("type",   selTypes[0]);
      if (selGenres.length >= 1)  params.set("genres", selGenres.join(","));

      const res  = await fetch(`https://api.jikan.moe/v4/anime?${params}`);
      if (!res.ok) throw new Error();
      const json = await res.json();
      let data   = json.data ?? [];

      // Client-side multi-filter para status y type cuando son varios
      if (selStatus.length > 1) {
        const set = new Set(selStatus.map(statusToJikan));
        data = data.filter(a => set.has(a.status));
      }
      if (selTypes.length > 1) {
        const set = new Set(selTypes.map(v => v.toUpperCase()));
        data = data.filter(a => set.has((a.type ?? "").toUpperCase()));
      }

      setAnimes(data);
      setLastPage(json.pagination?.last_visible_page ?? 1);
      setTotal(json.pagination?.items?.total ?? null);
      setPage(pg);
    } catch {
      setError("No se pudo conectar con Jikan API");
    } finally {
      setLoading(false);
    }
  }, [selGenres, selStatus, selTypes, order]);

  useEffect(() => { fetchAnimes(1); }, [selGenres, selStatus, selTypes, order]);

  function goTo(p) {
    fetchAnimes(p);
    sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function toggleItem(setter, key) {
    setter(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  }

  const activePills = [
    ...selGenres.map(id => ({ key: "genre",  val: id, label: genreOptions.find(g => g.id === id)?.name ?? id })),
    ...selStatus.map(v  => ({ key: "status", val: v,  label: STATUS_OPTIONS.find(s => s.val === v)?.label ?? v })),
    ...selTypes.map(v   => ({ key: "type",   val: v,  label: TYPE_OPTIONS.find(t => t.val === v)?.label ?? v })),
  ];

  function removeFilter(key, val) {
    if (key === "genre")  setSelGenres(p => p.filter(k => k !== val));
    if (key === "status") setSelStatus(p => p.filter(k => k !== val));
    if (key === "type")   setSelTypes(p  => p.filter(k => k !== val));
  }

  const pageNums = getPageNums(page, lastPage);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700;900&family=Bangers&family=Dela+Gothic+One&display=swap');
        @keyframes dir-drop-in { from{opacity:0;transform:translateY(-6px);}to{opacity:1;transform:translateY(0);} }
        @keyframes dir-card-in { from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);} }
        @keyframes dir-spin    { to{transform:rotate(360deg);} }
        @keyframes dir-dot-blink{ 0%,100%{opacity:1;}50%{opacity:.3;} }

        .dir-bg-grid   { position:fixed;inset:0;pointer-events:none;z-index:0;background-image:linear-gradient(rgba(220,30,60,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(220,30,60,0.03) 1px,transparent 1px);background-size:48px 48px; }
        .dir-scanlines { position:fixed;inset:0;pointer-events:none;z-index:0;background:repeating-linear-gradient(to bottom,transparent 0,transparent 3px,rgba(0,0,0,0.04) 3px,rgba(0,0,0,0.04) 4px); }

        .dir-card { position:relative;border-radius:8px;overflow:hidden;cursor:pointer;background:#111120;border:1px solid rgba(255,255,255,0.06);transition:border-color .25s,transform .25s;animation:dir-card-in .35s ease both; }
        .dir-card::after { content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,#dc1e3c,transparent);opacity:0;transition:opacity .25s; }
        .dir-card:hover { border-color:rgba(220,30,60,0.35);transform:translateY(-4px); }
        .dir-card:hover::after { opacity:1; }
        .dir-card:hover .dir-cimg  { transform:scale(1.07); }
        .dir-card:hover .dir-play  { opacity:1;transform:translate(-50%,-50%) scale(1); }
        .dir-card:hover .dir-sdot  { opacity:0; }

        .dir-cimg    { width:100%;height:100%;object-fit:cover;display:block;transition:transform .4s ease; }
        .dir-overlay { position:absolute;inset:0;background:linear-gradient(to top,rgba(7,7,15,.95) 0%,rgba(7,7,15,.3) 50%,transparent 100%);opacity:.85; }
        .dir-play    { position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) scale(.8);z-index:5;width:34px;height:34px;border-radius:50%;background:rgba(220,30,60,.85);border:1px solid rgba(255,255,255,.3);display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .2s,transform .2s; }
        .dir-sdot    { position:absolute;top:9px;right:9px;z-index:5;width:8px;height:8px;border-radius:50%;transition:opacity .2s; }
        .dir-sdot.airing   { background:#22cc66;box-shadow:0 0 6px rgba(34,204,102,.8);animation:dir-dot-blink 1.5s ease-in-out infinite; }
        .dir-sdot.finished { background:#555;border:1px solid rgba(255,255,255,.15); }

        .dir-spin { width:38px;height:38px;border-radius:50%;border:3px solid rgba(220,30,60,.2);border-top-color:#dc1e3c;animation:dir-spin 1s linear infinite; }

        .dir-pg-btn { width:34px;height:34px;border-radius:4px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);color:rgba(255,255,255,.45);font-family:'Bangers',cursive;font-size:13px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s; }
        .dir-pg-btn:hover:not(:disabled) { border-color:rgba(220,30,60,.4);color:#fff;background:rgba(220,30,60,.1); }
        .dir-pg-btn:disabled { opacity:.25;cursor:not-allowed; }
        .dir-pg-num { min-width:34px;height:34px;border-radius:4px;border:1px solid rgba(255,255,255,.08);background:transparent;color:rgba(255,255,255,.35);font-family:'Bangers',cursive;font-size:13px;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0 8px;transition:all .2s; }
        .dir-pg-num:hover { border-color:rgba(220,30,60,.3);color:rgba(255,255,255,.7); }
        .dir-pg-num.active { background:rgba(220,30,60,.15);border-color:rgba(220,30,60,.5);color:#dc1e3c; }

        .dir-back-btn { display:flex;align-items:center;gap:7px;padding:8px 14px;border-radius:6px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.04);color:rgba(255,255,255,0.5);font-size:12px;font-family:'Bangers',cursive;letter-spacing:2px;text-decoration:none;transition:all .2s;flex-shrink:0; }
        .dir-back-btn:hover { border-color:rgba(220,30,60,0.4);color:#fff;background:rgba(220,30,60,0.08); }
      `}</style>

      <section ref={sectionRef} style={{ background: "#07070f", minHeight: "100vh", padding: "40px 36px 60px", fontFamily: "'Noto Sans JP',sans-serif", position: "relative", overflowX: "hidden" }}>
        <div className="dir-bg-grid" />
        <div className="dir-scanlines" />

        {/* Header */}
        <div style={{ position: "relative", zIndex: 10, display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>

            {/* Boton volver */}
            <Link href="/" className="dir-back-btn">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                <polyline points="9,2 4,7 9,12" />
              </svg>
              VOLVER
            </Link>

            <div style={{ width: 1, height: 32, background: "rgba(255,255,255,0.07)", flexShrink: 0 }} />

            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 4, height: 42, background: "#dc1e3c", borderRadius: 2, flexShrink: 0 }} />
              <div>
                <div style={{ fontFamily: "'Dela Gothic One',cursive", fontSize: 28, color: "#fff", lineHeight: 1 }}>Directorio de Anime</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.22)", letterSpacing: 5, marginTop: 4 }}>アニメディレクトリ ・ 完全版</div>
              </div>
            </div>
          </div>

          {total !== null && (
            <div style={{ fontFamily: "'Bangers',cursive", fontSize: 13, letterSpacing: 3, color: "rgba(255,255,255,0.25)" }}>
              {animes.length} de {total.toLocaleString()} resultados
            </div>
          )}
        </div>

        {/* Filters bar */}
        <div style={{ position: "relative", zIndex: 20, background: "rgba(13,13,30,0.9)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "18px 20px 16px", marginBottom: 28, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
            <MultiSelect
              label="GENERO" labelJp="ジャンル"
              placeholder="Todos los generos"
              options={genreOptions}
              selected={selGenres}
              onToggle={key => toggleItem(setSelGenres, key)}
              loading={genresLoading}
            />
            <MultiSelect
              label="ESTADO" labelJp="放送状態"
              placeholder="Todos los estados"
              options={STATUS_OPTIONS}
              selected={selStatus}
              onToggle={key => toggleItem(setSelStatus, key)}
            />
            <MultiSelect
              label="TIPO" labelJp="タイプ"
              placeholder="Todos los tipos"
              options={TYPE_OPTIONS}
              selected={selTypes}
              onToggle={key => toggleItem(setSelTypes, key)}
            />
            <MultiSelect
              label="ORDENAR" labelJp="並び替え"
              placeholder="Ordenar por..."
              options={ORDER_OPTIONS.map(o => ({ ...o, id: o.val }))}
              selected={[order]}
              onToggle={key => setOrder(key)}
              single
            />
          </div>

          {/* Active filter pills */}
          {activePills.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              {activePills.map(f => (
                <div
                  key={`${f.key}-${f.val}`}
                  onClick={() => removeFilter(f.key, f.val)}
                  style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 3, background: "rgba(220,30,60,0.12)", border: "1px solid rgba(220,30,60,0.3)", fontFamily: "'Bangers',cursive", fontSize: 10, letterSpacing: 1, color: "#dc1e3c", cursor: "pointer", transition: "all .15s" }}
                >
                  <span>{f.label}</span>
                  <span style={{ fontSize: 13, lineHeight: 1, opacity: .7 }}>x</span>
                </div>
              ))}
              <button
                onClick={() => { setSelGenres([]); setSelStatus([]); setSelTypes([]); }}
                style={{ marginLeft: "auto", fontFamily: "'Bangers',cursive", fontSize: 10, letterSpacing: 2, color: "rgba(255,255,255,0.25)", background: "none", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 3, padding: "4px 10px", cursor: "pointer", transition: "all .15s" }}>
                LIMPIAR TODO x
              </button>
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 280, gap: 14 }}>
            <div className="dir-spin" />
            <div style={{ fontFamily: "'Bangers',cursive", fontSize: 13, letterSpacing: 4, color: "rgba(255,255,255,0.3)" }}>読み込み中 ・ CARGANDO...</div>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 280, gap: 8 }}>
            <div style={{ fontFamily: "'Bangers',cursive", fontSize: 16, letterSpacing: 3, color: "rgba(220,30,60,0.7)" }}>エラー ・ ERROR</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", letterSpacing: 2 }}>{error}</div>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && animes.length === 0 && (
          <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 280, gap: 8 }}>
            <div style={{ fontFamily: "'Bangers',cursive", fontSize: 16, letterSpacing: 3, color: "rgba(220,30,60,0.6)" }}>Sin resultados · 結果なし</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", letterSpacing: 2 }}>Intenta con otros filtros</div>
          </div>
        )}

        {/* Grid */}
        {!loading && !error && animes.length > 0 && (
          <>
            <div style={{ position: "relative", zIndex: 10, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(155px, 1fr))", gap: 14 }}>
              {animes.map((anime, i) => {
                const img   = anime.images?.webp?.large_image_url ?? anime.images?.jpg?.large_image_url ?? "";
                const score = anime.score ? `★ ${anime.score.toFixed(1)}` : null;
                const genre = anime.genres?.[0]?.name ?? null;
                const isAir = anime.status === "Currently Airing";

                return (
                  <div key={anime.mal_id} className="dir-card" style={{ animationDelay: `${(i * 0.03).toFixed(2)}s` }}>
                    <div style={{ width: "100%", aspectRatio: "3/4", overflow: "hidden", position: "relative", background: "#1a1a2e" }}>
                      <img src={img} alt={anime.title} className="dir-cimg" loading="lazy"
                        onError={e => { e.currentTarget.style.opacity = "0"; }} />
                      <div className="dir-overlay" />
                      <span style={{ position: "absolute", top: 9, left: 9, zIndex: 5, fontFamily: "'Bangers',cursive", fontSize: 10, letterSpacing: 2, background: "#dc1e3c", color: "#fff", padding: "2px 7px", borderRadius: 3 }}>
                        {anime.type || "TV"}
                      </span>
                      {score && (
                        <span style={{ position: "absolute", bottom: 42, right: 7, zIndex: 5, fontFamily: "'Bangers',cursive", fontSize: 11, color: "#f0c040", background: "rgba(7,7,15,.8)", border: "1px solid rgba(240,192,64,.3)", padding: "2px 6px", borderRadius: 3 }}>
                          {score}
                        </span>
                      )}
                      <div className={`dir-sdot ${isAir ? "airing" : "finished"}`} title={anime.status} />
                      <div className="dir-play">
                        <svg width="11" height="11" viewBox="0 0 12 12" fill="white"><polygon points="2,1 10,6 2,11" /></svg>
                      </div>
                    </div>
                    <div style={{ padding: "9px 9px 11px", background: "#0d0d1e", borderTop: "1px solid rgba(255,255,255,.05)" }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,.88)", lineHeight: 1.35, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {anime.title}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 5, flexWrap: "wrap" }}>
                        {genre && (
                          <span style={{ fontFamily: "'Bangers',cursive", fontSize: 9, letterSpacing: 1, padding: "1px 5px", borderRadius: 2, background: "rgba(220,30,60,.15)", color: "rgba(220,30,60,.8)", border: "1px solid rgba(220,30,60,.2)" }}>{genre}</span>
                        )}
                        {genre && <div style={{ width: 2, height: 2, borderRadius: "50%", background: "rgba(255,255,255,.15)", flexShrink: 0 }} />}
                        <span style={{ fontFamily: "'Bangers',cursive", fontSize: 9, letterSpacing: 1, padding: "1px 5px", borderRadius: 2, background: "rgba(255,255,255,.05)", color: "rgba(255,255,255,.3)", border: "1px solid rgba(255,255,255,.07)" }}>
                          {anime.episodes ? `${anime.episodes} eps` : "? eps"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {lastPage > 1 && (
              <div style={{ position: "relative", zIndex: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 36, paddingTop: 28, borderTop: "1px solid rgba(255,255,255,.06)", flexWrap: "wrap" }}>
                <button className="dir-pg-btn" onClick={() => goTo(page - 1)} disabled={page === 1}>
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="9,2 4,7 9,12" /></svg>
                </button>
                <span style={{ fontFamily: "'Noto Sans JP',sans-serif", fontSize: 10, color: "rgba(255,255,255,.2)", letterSpacing: 3, margin: "0 8px", whiteSpace: "nowrap" }}>{page} / {lastPage}</span>
                {pageNums.map((n, i) =>
                  n === "..." ? (
                    <span key={`e${i}`} style={{ color: "rgba(255,255,255,.2)", fontFamily: "'Bangers',cursive", fontSize: 13, padding: "0 4px" }}>...</span>
                  ) : (
                    <button key={n} className={`dir-pg-num${n === page ? " active" : ""}`} onClick={() => goTo(n)}>{n}</button>
                  )
                )}
                <span style={{ fontFamily: "'Noto Sans JP',sans-serif", fontSize: 10, color: "rgba(255,255,255,.2)", letterSpacing: 3, margin: "0 8px", whiteSpace: "nowrap" }}>pag {page}</span>
                <button className="dir-pg-btn" onClick={() => goTo(page + 1)} disabled={page === lastPage}>
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="5,2 10,7 5,12" /></svg>
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </>
  );
}