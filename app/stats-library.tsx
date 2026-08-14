"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { collections, topics, type TopicSource } from "./library-data";
import { MarkdownBody, parseTopic, plainText, TexBody, type LibrarySection } from "./content";

type SearchItem = { topic: TopicSource; section: LibrarySection; haystack: string };

function topicFromLocation() {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get("topic");
}

export function StatsLibrary() {
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [navOpen, setNavOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const parsed = useMemo(() => new Map(topics.map((topic) => [topic.id, parseTopic(topic)])), []);
  const activeTopic = topics.find((topic) => topic.id === activeTopicId) ?? null;
  const sections = activeTopic ? parsed.get(activeTopic.id) ?? [] : [];
  const collection = activeTopic ? collections.find((item) => item.id === activeTopic.collection) : null;

  const searchIndex = useMemo<SearchItem[]>(() => topics.flatMap((topic) => (parsed.get(topic.id) ?? []).map((section) => ({
    topic, section, haystack: `${topic.title} ${section.group ?? ""} ${section.title} ${plainText(section.body)}`.toLowerCase(),
  }))), [parsed]);
  const results = useMemo(() => {
    const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
    if (!terms.length) return searchIndex.slice(0, 10);
    return searchIndex.filter((item) => terms.every((term) => item.haystack.includes(term))).slice(0, 24);
  }, [query, searchIndex]);

  const navigate = (topicId: string | null, sectionId?: string) => {
    setActiveTopicId(topicId); setSearchOpen(false); setNavOpen(false); setQuery("");
    const url = topicId ? `?topic=${topicId}${sectionId ? `#${sectionId}` : ""}` : window.location.pathname;
    window.history.pushState({}, "", url);
    if (!sectionId) window.scrollTo({ top: 0, behavior: "instant" });
    if (sectionId) requestAnimationFrame(() => requestAnimationFrame(() => document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" })));
  };

  useEffect(() => {
    setActiveTopicId(topicFromLocation());
    const onPopState = () => setActiveTopicId(topicFromLocation());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); setSearchOpen(true); }
      if (event.key === "Escape") { setSearchOpen(false); setNavOpen(false); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => { if (searchOpen) window.setTimeout(() => searchRef.current?.focus(), 10); }, [searchOpen]);
  useEffect(() => {
    if (!activeTopic || !sections.length) return;
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible[0]) setActiveSection(visible[0].target.id);
    }, { rootMargin: "-14% 0px -72% 0px" });
    sections.forEach((section) => { const element = document.getElementById(section.id); if (element) observer.observe(element); });
    return () => observer.disconnect();
  }, [activeTopic, sections]);

  return <div className="library-shell">
    <header className="topbar">
      <button className="brand" onClick={() => navigate(null)}>STAT ATLAS</button>
      <button className="search-trigger" onClick={() => setSearchOpen(true)}>Search <kbd>⌘K</kbd></button>
      <button className="catalog-trigger" onClick={() => activeTopic ? setNavOpen(true) : navigate(null)}>{activeTopic ? "Contents" : "Catalog"}</button>
    </header>

    {!activeTopic ? <LibraryCatalog parsed={parsed} onOpen={navigate} /> : <div className="reader-grid">
      <LibraryNav active={activeTopic.id} open={navOpen} onOpen={navigate} onClose={() => setNavOpen(false)} />
      <main className="reader-main">
        <nav className="breadcrumbs" aria-label="Breadcrumb"><button onClick={() => navigate(null)}>Catalog</button><span>/</span><span>{collection?.title}</span></nav>
        <header className="topic-header"><h1>{activeTopic.title}</h1></header>
        <div className="section-stack">{sections.map((section, index) => {
          const previousGroup = index ? sections[index - 1].group : undefined;
          return <Fragment key={section.id}>
            {section.group && section.group !== previousGroup ? <h2 className="section-group">{section.group}</h2> : null}
            <section id={section.id} className="library-section"><h2>{section.title}</h2>{section.format === "markdown" ? <MarkdownBody body={section.body} /> : <TexBody body={section.body} />}</section>
          </Fragment>;
        })}</div>
      </main>
      <aside className="outline-panel"><div className="outline-title">On this page</div><nav>{sections.map((section) => <a key={section.id} className={activeSection === section.id ? "active" : ""} href={`#${section.id}`}>{section.group ? <small>{section.group}</small> : null}{section.title}</a>)}</nav></aside>
    </div>}

    {searchOpen ? <div className="search-layer" role="dialog" aria-modal="true" aria-label="Search library" onMouseDown={(event) => event.currentTarget === event.target && setSearchOpen(false)}>
      <div className="search-panel"><div className="search-input-row"><input ref={searchRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search concepts, formulas, methods" /><button onClick={() => setSearchOpen(false)} aria-label="Close search">Close</button></div>
        <div className="search-results">{results.map((result) => <button key={`${result.topic.id}-${result.section.id}`} onClick={() => navigate(result.topic.id, result.section.id)}><strong>{result.section.title}</strong><span>{result.topic.title}{result.section.group ? ` / ${result.section.group}` : ""}</span></button>)}{!results.length ? <p>No matching section.</p> : null}</div>
      </div>
    </div> : null}
  </div>;
}

function LibraryCatalog({ parsed, onOpen }: { parsed: Map<string, LibrarySection[]>; onOpen: (id: string, section?: string) => void }) {
  return <main className="catalog-main"><h1>Statistics Library</h1>{collections.map((collection) => <section className="catalog-section" key={collection.id}>
    <h2><span>{collection.index}</span>{collection.title}</h2><div className="catalog-topics">{topics.filter((topic) => topic.collection === collection.id).map((topic) => <div className="catalog-row" key={topic.id}>
      <button className="catalog-topic" onClick={() => onOpen(topic.id)}>{topic.title}</button><div className="catalog-links">{(parsed.get(topic.id) ?? []).map((section) => <button key={section.id} onClick={() => onOpen(topic.id, section.id)}>{section.group ? `${section.group}: ` : ""}{section.title}</button>)}</div>
    </div>)}</div>
  </section>)}</main>;
}

function LibraryNav({ active, open, onOpen, onClose }: { active: string; open: boolean; onOpen: (id: string | null) => void; onClose: () => void }) {
  return <aside className={`library-nav ${open ? "open" : ""}`}><div className="mobile-nav-head"><strong>Contents</strong><button onClick={onClose}>Close</button></div><button className="back-catalog" onClick={() => onOpen(null)}>← Catalog</button>{collections.map((collection) => <section key={collection.id}>
    <h2><span>{collection.index}</span>{collection.title}</h2>{topics.filter((topic) => topic.collection === collection.id).map((topic) => <button key={topic.id} className={active === topic.id ? "active" : ""} onClick={() => onOpen(topic.id)}>{topic.title}</button>)}
  </section>)}</aside>;
}
