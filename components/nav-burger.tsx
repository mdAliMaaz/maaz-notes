"use client";

import Link from "next/link";
import { useState } from "react";

const links = [
  { href: "/blog", label: "Writing" },
  { href: "/projects", label: "Projects" },
  { href: "/about", label: "About" },
  { href: "/vocabulary", label: "Vocabulary" },
  { href: "/studio", label: "Studio" },
];

export default function NavBurger() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        className={`nav-burger${open ? " nav-burger--open" : ""}`}
        onClick={() => setOpen((o) => !o)}
        aria-label="Toggle navigation"
        aria-expanded={open}
      >
        <span />
        <span />
        <span />
      </button>
      {open && (
        <>
          <div className="nav-mobile-backdrop" onClick={() => setOpen(false)} />
          <nav className="nav-mobile-menu">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="nav-mobile-link"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </>
      )}
    </>
  );
}
