"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { collections, groups, notes, type NoteSource } from "./library-data";
import { MarkdownBody, parseNote, plainText, TexBody } from "./content";

type SearchItem = { note: NoteSource; haystack: string };

function noteFromLocation() {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  return params.get("note") ?? params.get("topic");
}

export function StatsLibrary() {
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [navOpen, setNavOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const parsed = useMemo(() => new Map(notes.map((note) => [note.id, parseNote(note)])), []);
  const activeNote = notes.find((note) => note.id === activeNoteId) ?? null;
  const sections = useMemo(() => activeNote ? parsed.get(activeNote.id) ?? [] : [], [activeNote, parsed]);
  const collection = activeNote ? collections.find((item) => item.id === activeNote.collection) : null;
  const group = activeNote ? groups.find((item) => item.id === activeNote.group) : null;
  const allTags = useMemo(() => [...new Set(notes.flatMap((note) => note.tags))].sort(), []);

  const searchIndex = useMemo<SearchItem[]>(() => notes.map((note) => {
    const noteGroup = groups.find((item) => item.id === note.group);
    const noteCollection = collections.find((item) => item.id === note.collection);
    const content = (parsed.get(note.id) ?? []).map((section) => `${section.title} ${plainText(section.body)}`).join(" ");
    return { note, haystack: `${note.title} ${noteGroup?.title ?? ""} ${noteCollection?.title ?? ""} ${note.tags.join(" ")} ${content}`.toLowerCase() };
  }), [parsed]);

  const searchResults = useMemo(() => {
    const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
    return searchIndex.filter(({ note, haystack }) => {
      if (activeTag && !note.tags.includes(activeTag)) return false;
      return terms.every((term) => haystack.includes(term));
    }).slice(0, 30);
  }, [activeTag, query, searchIndex]);

  const relatedNotes = useMemo(() => {
    if (!activeNote) return [];
    const ids = new Set(activeNote.related ?? []);
    notes.forEach((note) => {
      if (note.related?.includes(activeNote.id)) ids.add(note.id);
    });
    return [...ids].map((id) => notes.find((note) => note.id === id)).filter((note): note is NoteSource => Boolean(note));
  }, [activeNote]);

  const navigate = (noteId: string | null, sectionId?: string) => {
    setActiveNoteId(noteId);
    setNavOpen(false);
    setSearchOpen(false);
    setQuery("");
    setActiveTag(null);
    const url = noteId ? `?note=${noteId}${sectionId ? `#${sectionId}` : ""}` : window.location.pathname;
    window.history.pushState({}, "", url);
    if (!sectionId) window.scrollTo({ top: 0, behavior: "instant" });
    if (sectionId) requestAnimationFrame(() => requestAnimationFrame(() => document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" })));
  };

  const openSearch = (tag?: string) => {
    setActiveTag(tag ?? null);
    setQuery("");
    setSearchOpen(true);
  };

  const setAllSections = (open: boolean) => {
    document.querySelectorAll<HTMLDetailsElement>(".reader-main details").forEach((detail) => { detail.open = open; });
  };

  useEffect(() => {
    const initialSync = window.setTimeout(() => setActiveNoteId(noteFromLocation()), 0);
    const onPopState = () => setActiveNoteId(noteFromLocation());
    window.addEventListener("popstate", onPopState);
    return () => {
      window.clearTimeout(initialSync);
      window.removeEventListener("popstate", onPopState);
    };
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        openSearch();
      }
      if (event.key === "/" && !["INPUT", "TEXTAREA"].includes((event.target as HTMLElement).tagName)) {
        event.preventDefault();
        openSearch();
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
    if (searchOpen) window.setTimeout(() => searchRef.current?.focus(), 10);
  }, [searchOpen]);

  useEffect(() => {
    if (!activeNote || sections.length < 2) return;
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible[0]) setActiveSection(visible[0].target.id);
    }, { rootMargin: "-14% 0px -72% 0px" });
    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, [activeNote, sections]);

  return <div className="library-shell">
    <header className="topbar">
      <button className="brand" onClick={() => navigate(null)}>STAT ATLAS</button>
      <button className="search-trigger" onClick={() => openSearch()}>Search <kbd>⌘K</kbd></button>
      {activeNote ? <button className="contents-trigger" onClick={() => setNavOpen(true)}>Contents</button> : <span />}
    </header>

    {!activeNote ? <LibraryCatalog onOpen={navigate} /> : <div className={`reader-grid ${sections.length < 2 ? "single-section" : ""}`}>
      <LibraryNav active={activeNote.id} open={navOpen} onOpen={navigate} onClose={() => setNavOpen(false)} />
      <main className="reader-main">
        <nav className="breadcrumbs" aria-label="Breadcrumb"><button onClick={() => navigate(null)}>Catalog</button><span>/</span><span>{collection?.title}</span><span>/</span><span>{group?.title}</span></nav>
        <header className="topic-header">
          <h1>{activeNote.title}</h1>
          <div className="note-meta"><span>{activeNote.pageType}</span><span>{activeNote.maturity}</span><span>Updated {activeNote.updated}</span></div>
          <div className="note-tags">{activeNote.tags.map((tag) => <button key={tag} onClick={() => openSearch(tag)}>#{tag}</button>)}</div>
        </header>
        <div className="fold-controls" aria-label="Section display controls"><button onClick={() => setAllSections(true)}>Expand all</button><span>/</span><button onClick={() => setAllSections(false)}>Collapse all</button></div>
        <div className="section-stack">{sections.map((section) => <details id={section.id} open className={`library-section ${sections.length === 1 ? "without-title" : ""}`} key={section.id}>
          <summary className="section-summary"><span role="heading" aria-level={2}>{sections.length > 1 ? section.title : "Contents"}</span></summary>
          <div className="section-body">{section.format === "markdown" ? <MarkdownBody body={section.body} /> : <TexBody body={section.body} />}</div>
        </details>)}</div>
        {relatedNotes.length ? <nav className="related-topics" aria-label="Related topics"><h2>Related topics</h2><div>{relatedNotes.map((note) => <button key={note.id} onClick={() => navigate(note.id)}>{note.title}</button>)}</div></nav> : null}
      </main>
      {sections.length > 1 ? <aside className="outline-panel"><div className="outline-title">On this page</div><nav>{sections.map((section) => <a key={section.id} className={activeSection === section.id ? "active" : ""} href={`#${section.id}`} onClick={() => document.getElementById(section.id)?.setAttribute("open", "")}>{section.title}</a>)}</nav></aside> : null}
    </div>}

    {searchOpen ? <SearchPalette query={query} setQuery={setQuery} activeTag={activeTag} setActiveTag={setActiveTag} tags={allTags} results={searchResults} searchRef={searchRef} onOpen={navigate} onClose={() => setSearchOpen(false)} /> : null}
  </div>;
}

function LibraryCatalog({ onOpen }: { onOpen: (id: string, section?: string) => void }) {
  const recent = [...notes].sort((a, b) => b.updated.localeCompare(a.updated)).slice(0, 5);
  return <main className="catalog-main">
    <h1>Statistics Library</h1>
    <section className="recently-updated"><h2>Recently updated</h2><div>{recent.map((note) => <button key={note.id} onClick={() => onOpen(note.id)}><span>{note.title}</span><small>{note.updated}</small></button>)}</div></section>
    {collections.map((collection) => {
      const visibleGroups = groups.filter((group) => group.collection === collection.id && notes.some((note) => note.group === group.id));
      return <section className="catalog-section" key={collection.id}>
        <h2><span>{collection.index}</span>{collection.title}</h2>
        <div className="catalog-topics">{visibleGroups.map((group) => {
          const groupNotes = notes.filter((note) => note.group === group.id);
          return <div className="catalog-row" key={group.id}>
            <div className="catalog-topic">{group.title}</div>
            <div className="catalog-links">{groupNotes.map((note) => <button key={note.id} onClick={() => onOpen(note.id)}>{note.title}</button>)}</div>
          </div>;
        })}</div>
      </section>;
    })}
  </main>;
}

function LibraryNav({ active, open, onOpen, onClose }: { active: string; open: boolean; onOpen: (id: string | null) => void; onClose: () => void }) {
  return <aside className={`library-nav ${open ? "open" : ""}`}>
    <div className="mobile-nav-head"><strong>Contents</strong><button onClick={onClose}>Close</button></div>
    <button className="back-catalog" onClick={() => onOpen(null)}>← Catalog</button>
    {collections.map((collection) => {
      const visibleGroups = groups.filter((group) => group.collection === collection.id && notes.some((note) => note.group === group.id));
      if (!visibleGroups.length) return null;
      return <section key={collection.id}><h2><span>{collection.index}</span>{collection.title}</h2>{visibleGroups.map((group) => <div className="nav-group" key={group.id}>
        <h3>{group.title}</h3>{notes.filter((note) => note.group === group.id).map((note) => <button key={note.id} className={active === note.id ? "active" : ""} onClick={() => onOpen(note.id)}>{note.title}</button>)}
      </div>)}</section>;
    })}
  </aside>;
}

function SearchPalette({ query, setQuery, activeTag, setActiveTag, tags, results, searchRef, onOpen, onClose }: {
  query: string;
  setQuery: (value: string) => void;
  activeTag: string | null;
  setActiveTag: (value: string | null) => void;
  tags: string[];
  results: SearchItem[];
  searchRef: RefObject<HTMLInputElement | null>;
  onOpen: (id: string) => void;
  onClose: () => void;
}) {
  return <div className="search-layer">
    <button className="search-backdrop" aria-label="Close search" onClick={onClose} />
    <div className="search-panel" role="dialog" aria-modal="true" aria-label="Search the library">
      <div className="search-input-row"><input ref={searchRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search topics, formulas, tags…" /><button onClick={onClose}>Close</button></div>
      <div className="tag-filter"><button className={!activeTag ? "active" : ""} onClick={() => setActiveTag(null)}>All</button>{tags.map((tag) => <button key={tag} className={activeTag === tag ? "active" : ""} onClick={() => setActiveTag(activeTag === tag ? null : tag)}>#{tag}</button>)}</div>
      <div className="search-results">{results.map(({ note }) => {
        const noteGroup = groups.find((item) => item.id === note.group);
        return <button key={note.id} onClick={() => onOpen(note.id)}><strong>{note.title}</strong><span>{noteGroup?.title} · {note.pageType} · {note.maturity}</span></button>;
      })}{!results.length ? <p>No matching notes.</p> : null}</div>
    </div>
  </div>;
}
