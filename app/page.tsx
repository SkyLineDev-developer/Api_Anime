"use client";

import { useState, useEffect } from "react";
import Loading from "./components/Loading";
import HeroSection from "./components/HeroSection";
import AnimeGrid from "./pages/AnimeGrid";

export default function Page() {

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 4000);
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <HeroSection />
      <main className="p-10 mt-20">
        <AnimeGrid />
      </main>
    </>
  );
}