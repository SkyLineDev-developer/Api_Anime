"use client";

import AnimeDirectory from "../AnimeDirectory";
import Loading from "../../components/Loading";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function DirectorioPage() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(t);
  }, [pathname]); // se re-ejecuta cada vez que cambia la ruta

  return (
    <div key={pathname}> {/* key fuerza remount completo */}
      <div style={{ display: loading ? "block" : "none" }}>
        <Loading />
      </div>
      <div style={{ display: loading ? "none" : "block" }}>
        <AnimeDirectory />
      </div>
    </div>
  );
}