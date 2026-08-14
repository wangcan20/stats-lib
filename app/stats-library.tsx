"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  Command,
  Hash,
  Layers3,
  Menu,
  Moon,
  Search,
  Sun,
  X,
} from "lucide-react";
import { collections, quickRelations, topics, type TopicSource } from "./library-data";
import { MarkdownBody, parseTopic, plainText, TexBody, type LibrarySection } from "./content";

type SearchItem = { topic: TopicSource; section: LibrarySection; haystack: string };

function initialTopic() {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get("topic");
}

function useLibraryTheme() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  useEffect(() => {
    const stored = localStorage.getItem("stat-atlas-theme") as "light" | "dark" | null;
    const preferred = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    setTheme(stored ?? preferred);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("stat-atlas-theme", theme);
  }, [theme]);
  return { theme, setTheme };
}

export function StatsLibrary() {
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [navOpen, setNavOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [copied, setCopied] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const { theme, setTheme } = useLibraryTheme();

  const parsed = useMemo(() => new Map(topics.map((topic) => [topic.id, parseTopic(topic)])), []);
  const activeTopic = topics.find((topic) => topic.id === activeTopicId) ?? null;
  const sections = activeTopic ? parsed.get(activeTopic.id) ?? [] : [];

  const searchIndex = useMemo<SearchItem[]>(
    () => topics.flatMap((topic) => (parsed.get(topic.id) ?? []).map((section) => ({
      topic,
      section,
      haystack: `${topic.title} ${topic.description} ${section.title} ${plainText(section.body)}`.toLowerCase(),
    }))),
    [parsed],
  );
  const results = useMemo(() => {
    const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
    if (!terms.length) return searchIndex.slice(0, 8);
    return searchIndex.filter((item) => terms.every((term) => item.haystack.includes(term))).slice(0, 18);
  }, [query, searchIndex]);

  const navigate = (topicId: string | null, sectionId?: string) => {
    setActiveTopicId(topicId);
    setNavOpen(false);
    setSearchOpen(false);
    setQuery("");
    const url = topicId ? `?topic=${topicId}${sectionId ? `#${sectionId}` : ""}` : window.location.pathname;
    window.history.pushState({}, "", url);
    window.scrollTo({ top: 0, behavior: "instant" });
    if (sectionId) requestAnimationFrame(() => document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" }));
  };

  useEffect(() => {
    setActiveTopicId(initialTopic());
    const onPop = () => setActiveTopicId(initialTopic());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
      if (event.key === "/" && !["INPUT", "TEXTAREA"].includes((event.target as HTMLElement).tagName)) {
        event.preventDefault();
        setSearchOpen(true);
      }
      if (event.key === "Escape") {
        setSearchOpen(false);
        setNavOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchRef.current?.focus(), 20);
  }, [searchOpen]);

  useEffect(() => {
    if (!activeTopic || !sections.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveSection(visible[0].target.id);
      },
      { rootMargin: "-18% 0px -70% 0px" },
    );
    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, [activeTopic, sections]);

  const collection = activeTopic ? collections.find((item) => item.id === activeTopic.collection) : null;
  const topicIndex = activeTopic ? topics.findIndex((topic) => topic.id === activeTopic.id) : -1;

  return (
    <div className="library-shell">
      <header className="topbar">
        <button className="brand" onClick={() => navigate(null)} aria-label="Stat Atlas home">
          <span className="brand-mark"><span />ST</span>
          <span className="brand-name">STAT&nbsp; ATLAS</span>
          <span className="brand-edition">ED. 01</span>
        </button>
        <button className="search-trigger" onClick={() => setSearchOpen(true)}>
          <Search size={14} />
          <span>Search concepts, formulas, methods…</span>
          <kbd><Command size={11} />K</kbd>
        </button>
        <div className="top-actions">
          <span className="status-dot"><i /> evolving library</span>
          <button className="icon-button" onClick={() => setTheme(theme === "light" ? "dark" : "light")} aria-label="Toggle color theme">
            {theme === "light" ? <Moon size={15} /> : <Sun size={15} />}
          </button>
          <button className="icon-button mobile-only" onClick={() => setNavOpen(!navOpen)} aria-label="Open library navigation">
            <Menu size={17} />
          </button>
        </div>
      </header>

      {!activeTopic ? (
        <LibraryHome parsed={parsed} onOpen={navigate} />
      ) : (
        <div className="reader-grid">
          <LibraryNav active={activeTopic.id} open={navOpen} onOpen={navigate} onHome={() => navigate(null)} onClose={() => setNavOpen(false)} />
          <main className="reader-main" style={{ "--topic-color": collection?.color } as React.CSSProperties}>
            <div className="breadcrumbs">
              <button onClick={() => navigate(null)}>Library</button><span>/</span>
              <span>{collection?.title}</span><span>/</span><strong>{activeTopic.title}</strong>
            </div>
            <header className="topic-header" style={{ "--topic-color": collection?.color } as React.CSSProperties}>
              <div className="topic-kicker"><span>{collection?.index}</span>{collection?.title}</div>
              <h1>{activeTopic.title}</h1>
              <p>{activeTopic.description}</p>
              <div className="topic-meta">
                <span>{sections.length} sections</span>
                <span>{activeTopic.year ? `notes · ${activeTopic.year}` : "living notes"}</span>
                {activeTopic.featured ? <span className="map-badge"><Layers3 size={12} /> mindmap source</span> : null}
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(window.location.href);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1600);
                  }}
                >
                  {copied ? <Check size={12} /> : <Hash size={12} />}{copied ? "copied" : "copy link"}
                </button>
              </div>
            </header>

            <div className="section-stack">
              {sections.map((section, index) => (
                <section id={section.id} className="library-section" key={section.id}>
                  <div className="section-number">{String(index + 1).padStart(2, "0")}</div>
                  <div className="section-content">
                    <h2>{section.title}</h2>
                    {activeTopic.format === "markdown" ? <MarkdownBody body={section.body} /> : <TexBody body={section.body} />}
                  </div>
                </section>
              ))}
            </div>

            <nav className="topic-pagination" aria-label="Adjacent topics">
              {topicIndex > 0 ? (
                <button onClick={() => navigate(topics[topicIndex - 1].id)}><ArrowLeft size={14} /><span><small>Previous</small>{topics[topicIndex - 1].title}</span></button>
              ) : <span />}
              {topicIndex < topics.length - 1 ? (
                <button onClick={() => navigate(topics[topicIndex + 1].id)}><span><small>Next</small>{topics[topicIndex + 1].title}</span><ArrowRight size={14} /></button>
              ) : null}
            </nav>
          </main>
          <aside className="outline-panel">
            <div className="outline-label">On this page</div>
            <nav>
              {sections.map((section, index) => (
                <a key={section.id} className={activeSection === section.id ? "active" : ""} href={`#${section.id}`}>
                  <span>{String(index + 1).padStart(2, "0")}</span>{section.title}
                </a>
              ))}
            </nav>
            <div className="outline-foot"><span />{plainText(activeTopic.raw).split(/\s+/).length.toLocaleString()} words in source</div>
          </aside>
        </div>
      )}

      {searchOpen ? (
        <div className="search-layer" role="dialog" aria-modal="true" aria-label="Search the library" onMouseDown={(event) => event.currentTarget === event.target && setSearchOpen(false)}>
          <div className="search-palette">
            <div className="search-input-row">
              <Search size={17} />
              <input ref={searchRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search the atlas…" />
              <button onClick={() => setSearchOpen(false)}><X size={15} /></button>
            </div>
            <div className="search-caption">{query ? `${results.length} matching sections` : "Suggested entry points"}</div>
            <div className="search-results">
              {results.map((result) => (
                <button key={`${result.topic.id}-${result.section.id}`} onClick={() => navigate(result.topic.id, result.section.id)}>
                  <span className="result-icon"><BookOpen size={15} /></span>
                  <span><strong>{result.section.title}</strong><small>{result.topic.title} · {result.topic.description}</small></span>
                  <ArrowRight size={13} />
                </button>
              ))}
              {!results.length ? <div className="empty-search">No exact match. Try a shorter statistical term.</div> : null}
            </div>
            <div className="search-help"><span><kbd>↵</kbd> open</span><span><kbd>esc</kbd> close</span><span><kbd>⌘ K</kbd> search anywhere</span></div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function LibraryHome({ parsed, onOpen }: { parsed: Map<string, LibrarySection[]>; onOpen: (id: string) => void }) {
  const sectionCount = [...parsed.values()].reduce((sum, sections) => sum + sections.length, 0);
  return (
    <main className="home-main">
      <section className="home-intro">
        <div className="eyebrow"><span>KNOWLEDGE SYSTEM / 2026</span><i /></div>
        <div className="intro-grid">
          <div>
            <h1>A working atlas<br />of statistical ideas.</h1>
            <p>Compact notes, formulas, and connections—organized to stay useful while the library keeps growing.</p>
          </div>
          <div className="atlas-index">
            <div><strong>{String(topics.length).padStart(2, "0")}</strong><span>topics</span></div>
            <div><strong>{String(sectionCount).padStart(2, "0")}</strong><span>sections</span></div>
            <div><strong>04</strong><span>collections</span></div>
          </div>
        </div>
      </section>

      <section className="collection-list">
        {collections.map((collection) => {
          const collectionTopics = topics.filter((topic) => topic.collection === collection.id);
          return (
            <article className="collection-row" key={collection.id} style={{ "--collection-color": collection.color } as React.CSSProperties}>
              <div className="collection-copy">
                <span className="collection-index">{collection.index}</span>
                <div><h2>{collection.title}</h2><p>{collection.description}</p></div>
              </div>
              <div className="topic-cards">
                {collectionTopics.map((topic) => (
                  <button key={topic.id} className="topic-card" onClick={() => onOpen(topic.id)}>
                    <span className="topic-card-top"><i />{topic.year ?? (topic.featured ? "MAP" : "NOTE")}</span>
                    <strong>{topic.shortTitle}</strong>
                    <small>{parsed.get(topic.id)?.length ?? 0} sections</small>
                    <ArrowRight size={14} />
                  </button>
                ))}
              </div>
            </article>
          );
        })}
      </section>

      <section className="relations-panel">
        <div className="relations-heading"><span>CONNECTIONS / QUICK PATHS</span><p>Follow a concept across layers.</p></div>
        <div className="relation-lines">
          {quickRelations.map((relation, row) => (
            <div className="relation" key={row}>
              {relation.map((node, index) => <span key={node}>{node}{index < relation.length - 1 ? <ArrowRight size={12} /> : null}</span>)}
            </div>
          ))}
        </div>
      </section>

      <footer className="home-footer"><span>STAT ATLAS / EDITION 01</span><span>Built from accumulated notes · designed to evolve</span></footer>
    </main>
  );
}

function LibraryNav({ active, open, onOpen, onHome, onClose }: { active: string; open: boolean; onOpen: (id: string) => void; onHome: () => void; onClose: () => void }) {
  return (
    <aside className={`library-nav ${open ? "open" : ""}`}>
      <div className="mobile-nav-head"><span>Library index</span><button onClick={onClose}><X size={16} /></button></div>
      <button className="back-home" onClick={onHome}><ArrowLeft size={13} /> Atlas home</button>
      {collections.map((collection) => (
        <div className="nav-group" key={collection.id}>
          <div className="nav-group-title"><span>{collection.index}</span>{collection.title}</div>
          {topics.filter((topic) => topic.collection === collection.id).map((topic) => (
            <button className={active === topic.id ? "active" : ""} key={topic.id} onClick={() => onOpen(topic.id)}>
              <i style={{ background: collection.color }} />{topic.shortTitle}
            </button>
          ))}
        </div>
      ))}
    </aside>
  );
}
