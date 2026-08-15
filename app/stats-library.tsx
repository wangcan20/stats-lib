"use client";

import { useEffect, useMemo, useState } from "react";
import { collections, topics } from "./library-data";
import { MarkdownBody, parseTopic, TexBody, type LibrarySection } from "./content";

function topicFromLocation() {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get("topic");
}

export function StatsLibrary() {
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);
  const [navOpen, setNavOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const parsed = useMemo(() => new Map(topics.map((topic) => [topic.id, parseTopic(topic)])), []);
  const activeTopic = topics.find((topic) => topic.id === activeTopicId) ?? null;
  const sections = activeTopic ? parsed.get(activeTopic.id) ?? [] : [];
  const collection = activeTopic ? collections.find((item) => item.id === activeTopic.collection) : null;

  const setAllSections = (open: boolean) => {
    document.querySelectorAll<HTMLDetailsElement>(".reader-main details").forEach((detail) => {
      detail.open = open;
    });
  };

  const navigate = (topicId: string | null, sectionId?: string) => {
    setActiveTopicId(topicId);
    setNavOpen(false);
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
      if (event.key === "Escape") setNavOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!activeTopic || sections.length < 2) return;
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible[0]) setActiveSection(visible[0].target.id);
    }, { rootMargin: "-14% 0px -72% 0px" });
    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, [activeTopic, sections]);

  return <div className="library-shell">
    <header className="topbar">
      <button className="brand" onClick={() => navigate(null)}>STAT ATLAS</button>
      {activeTopic ? <button className="contents-trigger" onClick={() => setNavOpen(true)}>Contents</button> : <span />}
    </header>

    {!activeTopic ? <LibraryCatalog parsed={parsed} onOpen={navigate} /> : <div className={`reader-grid ${sections.length < 2 ? "single-section" : ""}`}>
      <LibraryNav active={activeTopic.id} open={navOpen} onOpen={navigate} onClose={() => setNavOpen(false)} />
      <main className="reader-main">
        <nav className="breadcrumbs" aria-label="Breadcrumb"><button onClick={() => navigate(null)}>Catalog</button><span>/</span><span>{collection?.title}</span></nav>
        <header className="topic-header"><h1>{activeTopic.title}</h1></header>
        <div className="fold-controls" aria-label="Section display controls"><button onClick={() => setAllSections(true)}>Expand all</button><span>/</span><button onClick={() => setAllSections(false)}>Collapse all</button></div>
        <div className="section-stack">{sections.map((section) => <details id={section.id} open className={`library-section ${sections.length === 1 ? "without-title" : ""}`} key={section.id}>
          <summary className="section-summary"><span role="heading" aria-level={2}>{sections.length > 1 ? section.title : "Contents"}</span></summary>
          <div className="section-body">{section.format === "markdown" ? <MarkdownBody body={section.body} /> : <TexBody body={section.body} />}</div>
        </details>)}</div>
      </main>
      {sections.length > 1 ? <aside className="outline-panel"><div className="outline-title">On this page</div><nav>{sections.map((section) => <a key={section.id} className={activeSection === section.id ? "active" : ""} href={`#${section.id}`} onClick={() => document.getElementById(section.id)?.setAttribute("open", "")}>{section.title}</a>)}</nav></aside> : null}
    </div>}
  </div>;
}

function LibraryCatalog({ parsed, onOpen }: { parsed: Map<string, LibrarySection[]>; onOpen: (id: string, section?: string) => void }) {
  return <main className="catalog-main"><h1>Statistics Library</h1>{collections.map((collection) => <section className="catalog-section" key={collection.id}>
    <h2><span>{collection.index}</span>{collection.title}</h2><div className="catalog-topics">{topics.filter((topic) => topic.collection === collection.id).map((topic) => {
      const sections = parsed.get(topic.id) ?? [];
      return <div className="catalog-row" key={topic.id}>
        <button className="catalog-topic" onClick={() => onOpen(topic.id)}>{topic.title}</button>
        <div className="catalog-links">{sections.length > 1 ? sections.map((section) => <button key={section.id} onClick={() => onOpen(topic.id, section.id)}>{section.title}</button>) : null}</div>
      </div>;
    })}</div>
  </section>)}</main>;
}

function LibraryNav({ active, open, onOpen, onClose }: { active: string; open: boolean; onOpen: (id: string | null) => void; onClose: () => void }) {
  return <aside className={`library-nav ${open ? "open" : ""}`}><div className="mobile-nav-head"><strong>Contents</strong><button onClick={onClose}>Close</button></div><button className="back-catalog" onClick={() => onOpen(null)}>← Catalog</button>{collections.map((collection) => <section key={collection.id}>
    <h2><span>{collection.index}</span>{collection.title}</h2>{topics.filter((topic) => topic.collection === collection.id).map((topic) => <button key={topic.id} className={active === topic.id ? "active" : ""} onClick={() => onOpen(topic.id)}>{topic.title}</button>)}
  </section>)}</aside>;
}
