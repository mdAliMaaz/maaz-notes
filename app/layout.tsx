import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { Inter, JetBrains_Mono } from "next/font/google";
import ThemeToggle from "@/components/theme-toggle";
import CommandPalette from "@/components/command-palette";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: "Maaz — Notes on Math, CS & Systems",
  description: "A personal notebook for mathematics, computer science, low-level systems, and observability."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="dark" data-scroll-behavior="smooth" className={`${inter.variable} ${mono.variable}`}>
      <body>
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem("theme")||"dark";document.documentElement.setAttribute("data-theme",t);})();`
          }}
        />
        <CommandPalette />
        <div className="site-shell">
          <header className="nav">
            <div className="container nav-inner">
              <Link href="/" className="brand">
                <span className="brand-mark">M</span>
                <span className="brand-text">maaz<span className="brand-dot">.</span>dev</span>
              </Link>
              <nav className="nav-links">
                <Link href="/blog"       className="nav-link">Writing</Link>
                <Link href="/projects"   className="nav-link">Projects</Link>
                <Link href="/about"      className="nav-link">About</Link>
                <Link href="/vocabulary" className="nav-link">Vocabulary</Link>
                <Link href="/studio"     className="nav-link">Studio</Link>
              </nav>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <kbd className="nav-kbd" title="Open command palette">⌘K</kbd>
                <ThemeToggle />
              </div>
            </div>
          </header>
          {children}
          <footer className="footer">
            <div className="container footer-inner">
              <span className="footer-brand">
                <span className="mono">maaz.dev</span> — Engineer at Dynatrace
              </span>
              <span className="footer-tags">
                <span className="footer-tag">Mathematics</span>
                <span className="footer-tag">Computer Science</span>
                <span className="footer-tag">Low-Level Systems</span>
                <span className="footer-tag">Observability</span>
              </span>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
