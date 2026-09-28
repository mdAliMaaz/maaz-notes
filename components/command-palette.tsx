"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, FileText, Hash, ArrowRight, X } from "lucide-react";

interface Post {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  date: string;
}

const NAV_ITEMS = [
  { label: "Home",       href: "/",           icon: "home" },
  { label: "Writing",    href: "/blog",        icon: "writing" },
  { label: "Projects",   href: "/projects",    icon: "projects" },
  { label: "Vocabulary", href: "/vocabulary",  icon: "vocab" },
  { label: "About",      href: "/about",       icon: "about" },
  { label: "Studio",     href: "/studio",      icon: "studio" },
];

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const fetchPosts = useCallback(async () => {
    if (posts.length > 0) return;
    try {
      const res = await fetch("/api/search");
      const data = await res.json();
      setPosts(data);
    } catch {}
  }, [posts.length]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
        if (!open) fetchPosts();
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, fetchPosts]);

  useEffect(() => {
    if (open) {
      fetchPosts();
      setTimeout(() => inputRef.current?.focus(), 10);
      setActive(0);
    } else {
      setQuery("");
    }
  }, [open, fetchPosts]);

  const q = query.trim().toLowerCase();

  const filteredNav = q
    ? NAV_ITEMS.filter((n) => n.label.toLowerCase().includes(q))
    : NAV_ITEMS;

  const filteredPosts = q
    ? posts.filter((p) =>
        `${p.title} ${p.description} ${p.tags.join(" ")}`.toLowerCase().includes(q)
      ).slice(0, 6)
    : posts.slice(0, 4);

  const allItems: Array<{ href: string; label: string; sub?: string; isPost?: boolean }> = [
    ...filteredNav.map((n) => ({ href: n.href, label: n.label })),
    ...filteredPosts.map((p) => ({ href: `/blog/${p.slug}`, label: p.title, sub: p.description, isPost: true })),
  ];

  function navigate(href: string) {
    router.push(href);
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((v) => Math.min(v + 1, allItems.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((v) => Math.max(v - 1, 0));
    } else if (e.key === "Enter" && allItems[active]) {
      navigate(allItems[active].href);
    }
  }

  if (!open) return null;

  let navIdx = -1;
  let postIdx = filteredNav.length - 1;

  return (
    <div className="palette-overlay" onClick={() => setOpen(false)}>
      <div className="palette" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal>
        <div className="palette-search">
          <Search size={16} className="palette-icon" />
          <input
            ref={inputRef}
            className="palette-input"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActive(0); }}
            onKeyDown={onKeyDown}
            placeholder="Search pages and notes…"
            aria-label="Command palette search"
          />
          <button className="palette-esc" onClick={() => setOpen(false)} aria-label="Close">
            <X size={14} />
          </button>
        </div>

        <div className="palette-results">
          {filteredNav.length > 0 && (
            <div className="palette-group">
              <div className="palette-group-label">Navigation</div>
              {filteredNav.map((item) => {
                navIdx++;
                const idx = navIdx;
                return (
                  <button
                    key={item.href}
                    className={`palette-item${active === idx ? " active" : ""}`}
                    onClick={() => navigate(item.href)}
                    onMouseEnter={() => setActive(idx)}
                  >
                    <ArrowRight size={13} className="palette-item-icon" />
                    <span className="palette-item-label">{item.label}</span>
                    <span className="palette-item-hint mono">{item.href}</span>
                  </button>
                );
              })}
            </div>
          )}

          {filteredPosts.length > 0 && (
            <div className="palette-group">
              <div className="palette-group-label">Notes</div>
              {filteredPosts.map((post) => {
                postIdx++;
                const idx = postIdx;
                return (
                  <button
                    key={post.slug}
                    className={`palette-item${active === idx ? " active" : ""}`}
                    onClick={() => navigate(`/blog/${post.slug}`)}
                    onMouseEnter={() => setActive(idx)}
                  >
                    <FileText size={13} className="palette-item-icon" />
                    <span className="palette-item-label">{post.title}</span>
                    {post.tags[0] && (
                      <span className="palette-item-tag mono">
                        <Hash size={10} />{post.tags[0]}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {allItems.length === 0 && (
            <div className="palette-empty">No results for &ldquo;{query}&rdquo;</div>
          )}
        </div>

        <div className="palette-footer">
          <span className="mono">↑↓</span> navigate &nbsp;·&nbsp;
          <span className="mono">↵</span> open &nbsp;·&nbsp;
          <span className="mono">esc</span> close
        </div>
      </div>
    </div>
  );
}
