import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Maaz — Notes on Math, CS & Systems",
  description: "A personal notebook for mathematics, computer science, systems and vocabulary."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <div className="site-shell">
      <header className="nav">
        <div className="container" style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <Link href="/" className="brand"><span className="brand-mark">M</span><span>maaz.notes</span></Link>
          <nav className="nav-links">
            <Link href="/blog">Writing</Link>
            <Link href="/vocabulary">Vocabulary</Link>
            <Link href="/studio">Studio</Link>
          </nav>
        </div>
      </header>
      {children}
      <footer className="footer"><div className="container">Built as a learning notebook · Mathematics · Computer Science · Systems</div></footer>
        </div>
      </body>
    </html>
  );
}
