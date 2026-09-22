"use client";

import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";

export default function Mermaid({ chart }: { chart: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    mermaid.initialize({ startOnLoad: false, theme: "neutral", securityLevel: "strict" });
    const id = `mermaid-${Math.random().toString(36).slice(2)}`;
    mermaid.render(id, chart).then(({ svg }) => {
      if (ref.current) ref.current.innerHTML = svg;
    }).catch(() => setError(true));
  }, [chart]);

  if (error) return <pre>{chart}</pre>;
  return <div ref={ref} style={{overflowX:"auto",padding:"16px 0"}} />;
}
