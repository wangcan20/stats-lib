"use client";

import katex from "katex";
import type { Format, NoteSource, SectionSelector, TopicPart } from "./library-data";

export type LibrarySection = {
  id: string;
  title: string;
  body: string;
  format: Format;
  group?: string;
};

const macros = {
  "\\hl": "#1",
  "\\E": "\\mathbb{E}",
  "\\df": "\\xrightarrow{d}",
  "\\Bar": "\\overline",
  "\\Conditioned": "\\mid",
  "\\where": "\\text{where}",
  "\\Eg": "\\text{E.g.}",
  "\\Specificity": "\\operatorname{Specificity}",
  "\\Prove": "\\text{Prove}",
  "\\If": "\\text{If}",
};

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/\\[a-z]+/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 72);
}

function stripBalancedCommand(input: string, command: string) {
  const needle = `\\${command}{`;
  let output = input;
  let start = output.indexOf(needle);
  while (start >= 0) {
    let depth = 1;
    let index = start + needle.length;
    while (index < output.length && depth > 0) {
      if (output[index] === "{") depth += 1;
      if (output[index] === "}") depth -= 1;
      index += 1;
    }
    if (depth !== 0) break;
    output = output.slice(0, start) + output.slice(start + needle.length, index - 1) + output.slice(index);
    start = output.indexOf(needle);
  }
  return output;
}

export function plainText(raw: string) {
  let value = raw;
  ["textbf", "textit", "emph", "hl", "text", "mathbf", "bm", "operatorname", "mathrm", "mathcal", "mathbb"].forEach(
    (command) => (value = stripBalancedCommand(value, command)),
  );
  return value
    .replace(/^---[\s\S]*?---/, "")
    .replace(/%.*$/gm, "")
    .replace(/\\(documentclass|usepackage|renewcommand|sethlcolor|setlength|title|author|date)[^\n]*/g, "")
    .replace(/\\(begin|end)\{[^}]+\}(?:\{[^}]*\})?/g, " ")
    .replace(/\\(section|subsection|subsubsection|paragraph)\*?\{([^}]*)\}/g, "$2 ")
    .replace(/\\item(?:\[[^\]]*\])?/g, " ")
    .replace(/\\[a-zA-Z]+/g, " ")
    .replace(/[{}$&#^_~]/g, " ")
    .replace(/^#+/gm, "")
    .replace(/^\s*-\s*/gm, " ")
    .replace(/\b(Definition|Def\.?|Theorem|Lemma|Proposition|Corollary)\s+\d+(?:\.\d+)+\.?/gi, "$1")
    .replace(/\bDef\.?\s*:/gi, "Definition:")
    .replace(/\s+/g, " ")
    .trim();
}

function uniqueSectionIds(sections: LibrarySection[]) {
  const seen = new Map<string, number>();
  return sections.map((section) => {
    const base = section.id || "section";
    const count = (seen.get(base) ?? 0) + 1;
    seen.set(base, count);
    return count === 1 ? section : { ...section, id: `${base}-${count}` };
  });
}

type TexTopSection = { title: string; body: string };

function texTopSections(rawInput: string): TexTopSection[] {
  const raw = rawInput.replace(/%.*$/gm, "");
  const matches = [...raw.matchAll(/\\section\*?\{([^}]*)\}/g)];
  return matches.map((match, index) => ({
    title: plainText(match[1]),
    body: raw.slice((match.index ?? 0) + match[0].length, matches[index + 1]?.index ?? raw.length),
  }));
}

function itemLead(item: string) {
  return plainText(item.replace(/^\\item(?:\[[^\]]*\])?/, "")).toLowerCase();
}

function filterItems(body: string, selector: SectionSelector) {
  if (!selector.includeItems?.length && !selector.excludeItems?.length) return body;
  const firstItem = body.search(/\\item(?:\[[^\]]*\])?/);
  const prefix = firstItem >= 0 ? body.slice(0, firstItem) : "";
  const itemBody = firstItem >= 0 ? body.slice(firstItem) : body;
  const items = itemBody.split(/(?=\\item(?:\[[^\]]*\])?)/g).filter((item) => item.trim());
  const includes = selector.includeItems?.map((item) => item.toLowerCase());
  const excludes = selector.excludeItems?.map((item) => item.toLowerCase());
  const kept = items.filter((item) => {
    const lead = itemLead(item);
    if (includes?.length && !includes.some((term) => lead.startsWith(term))) return false;
    if (excludes?.some((term) => lead.startsWith(term))) return false;
    return true;
  });
  return prefix + kept.join("\n");
}

function cleanChapterTitle(title: string) {
  return title.replace(/^Chapter\s*\d+\s*[:.]?\s*/i, "");
}

function expandTexSection(top: TexTopSection, selector: SectionSelector): LibrarySection[] {
  const filteredBody = filterItems(top.body, selector);
  const body = selector.hideSubsections
    ? filteredBody.replace(/\\subsection\*?\{[^}]*\}/g, "")
    : filteredBody;
  const title = selector.rename ?? cleanChapterTitle(top.title);
  if (!selector.expandSubsections) {
    return [{ id: slugify(`${selector.group ?? ""}-${title}`), title, body, format: "tex", group: selector.group }];
  }

  const matches = [...body.matchAll(/\\subsection\*?\{([^}]*)\}/g)];
  if (!matches.length) {
    return [{ id: slugify(`${selector.group ?? ""}-${title}`), title, body, format: "tex", group: selector.group }];
  }
  const group = selector.group ?? title;
  const sections: LibrarySection[] = [];
  const intro = body.slice(0, matches[0].index).trim();
  if (plainText(intro)) sections.push({ id: slugify(`${group}-overview`), title: "Overview", body: intro, format: "tex", group });
  matches.forEach((match, index) => {
    const rawSubsectionTitle = plainText(match[1]);
    const subsectionTitle = ({
      "Derivation": "Matrix Derivatives",
      "Covariance matrix": "Covariance Matrices",
      "Trace": "Trace Identities",
    } as Record<string, string>)[rawSubsectionTitle] ?? rawSubsectionTitle;
    sections.push({
      id: slugify(`${group}-${subsectionTitle}`),
      title: subsectionTitle,
      body: body.slice((match.index ?? 0) + match[0].length, matches[index + 1]?.index ?? body.length),
      format: "tex",
      group,
    });
  });
  return sections;
}

function texPartSections(part: TopicPart): LibrarySection[] {
  const top = texTopSections(part.raw);
  if (!part.selectors) {
    return top.map((section) => ({
      id: slugify(cleanChapterTitle(section.title)),
      title: cleanChapterTitle(section.title),
      body: section.body,
      format: "tex" as const,
    }));
  }

  const titleCounts = new Map<string, number>();
  const indexed = top.map((section) => {
    const count = (titleCounts.get(section.title) ?? 0) + 1;
    titleCounts.set(section.title, count);
    return { ...section, occurrence: count };
  });
  return part.selectors.flatMap((selector) => {
    const occurrence = selector.occurrence ?? 1;
    const match = indexed.find((section) => section.title === plainText(selector.title) && section.occurrence === occurrence);
    return match ? expandTexSection(match, selector) : [];
  });
}

function markdownPartSections(part: TopicPart): LibrarySection[] {
  const raw = part.raw.replace(/^---[\s\S]*?---\s*/, "");
  const matches = [...raw.matchAll(/^#\s+(.+)$/gm)];
  return matches.map((match, index) => {
    const originalTitle = plainText(match[1]);
    const isReference = originalTitle.startsWith("Reference:");
    const publicTitle = ({
      "Setup": "Core Concepts",
      "modeling and estimation": "Models, Estimation & Tests",
      "Basic Conformal Prediction": "Core Methods",
    } as Record<string, string>)[originalTitle] ?? originalTitle;
    return {
      id: slugify(isReference ? "references" : publicTitle),
      title: isReference ? "References" : publicTitle,
      body: `${isReference ? originalTitle.replace(/^Reference:\s*/, "") : ""}\n${raw.slice((match.index ?? 0) + match[0].length, matches[index + 1]?.index ?? raw.length)}`.trim(),
      format: "markdown" as const,
    };
  });
}

export function parseNote(note: NoteSource) {
  const sections = uniqueSectionIds(note.parts.flatMap((part) => part.format === "markdown" ? markdownPartSections(part) : texPartSections(part)));
  if (!note.combineSections || !sections.length) return sections;
  return [{
    id: slugify(note.combineSections),
    title: note.combineSections,
    body: sections.map((section) => section.body).join("\n"),
    format: sections[0].format,
  }];
}

type RichToken = { type: "text" | "math"; value: string; display?: boolean; table?: boolean };

function escapedAt(input: string, index: number) {
  let slashes = 0;
  for (let cursor = index - 1; cursor >= 0 && input[cursor] === "\\"; cursor -= 1) slashes += 1;
  return slashes % 2 === 1;
}

function findClosing(input: string, marker: string, start: number) {
  let index = input.indexOf(marker, start);
  while (index >= 0 && escapedAt(input, index)) index = input.indexOf(marker, index + marker.length);
  return index;
}

export function tokenizeRichText(input: string): RichToken[] {
  const tokens: RichToken[] = [];
  let textStart = 0;
  let cursor = 0;
  const pushText = (end: number) => {
    if (end > textStart) tokens.push({ type: "text", value: input.slice(textStart, end) });
  };

  while (cursor < input.length) {
    if (input.startsWith("\\begin{tabular}", cursor)) {
      const tableClose = "\\end{tabular}";
      const closing = input.indexOf(tableClose, cursor + 15);
      if (closing >= 0) {
        pushText(cursor);
        const end = closing + tableClose.length;
        tokens.push({ type: "math", value: input.slice(cursor, end), display: true, table: true });
        cursor = end;
        textStart = cursor;
        continue;
      }
    }
    let open = "";
    let close = "";
    let display = false;
    if (input.startsWith("$$", cursor) && !escapedAt(input, cursor)) {
      open = close = "$$";
      display = true;
    } else if (input.startsWith("\\[", cursor) && !escapedAt(input, cursor)) {
      open = "\\[";
      close = "\\]";
      display = true;
    } else if (input.startsWith("\\(", cursor) && !escapedAt(input, cursor)) {
      open = "\\(";
      close = "\\)";
    } else if (input[cursor] === "$" && !escapedAt(input, cursor)) {
      open = close = "$";
    }

    if (!open) {
      cursor += 1;
      continue;
    }
    const closing = findClosing(input, close, cursor + open.length);
    if (closing < 0) {
      cursor += open.length;
      continue;
    }
    pushText(cursor);
    const value = input.slice(cursor + open.length, closing);
    const table = /\\begin\{(?:tabular|array)\}/.test(value);
    tokens.push({ type: "math", value, display: display || value.includes("\n") || shouldDisplayFormula(value), table });
    cursor = closing + close.length;
    textStart = cursor;
  }
  pushText(input.length);
  return tokens;
}

function shouldDisplayFormula(formula: string) {
  const compact = formula.replace(/\s+/g, " ").trim();
  const fractions = compact.match(/\\(?:d?frac)\b/g)?.length ?? 0;
  return compact.length >= 105
    || /\\begin\{(?:aligned|cases|array|matrix|pmatrix|bmatrix)\}/.test(compact)
    || fractions >= 2
    || (compact.length >= 72 && /\\(?:sum|prod|int|lim)\b/.test(compact));
}

function cleanTextSegment(input: string) {
  let value = input;
  ["textbf", "textit", "emph", "hl", "text", "mathbf", "bm", "operatorname", "mathrm", "mathcal", "mathbb"].forEach(
    (command) => (value = stripBalancedCommand(value, command)),
  );
  return value
    .replace(/\\begin\{(?:aligned|cases|array|tabular)\}(?:\{[^}]*\})?/g, "")
    .replace(/\\end\{(?:aligned|cases|array|tabular)\}/g, "")
    .replace(/\\(?:hline|cline\{[^}]*\}|small|scriptsize|maketitle)/g, "")
    .replace(/\\(?:quad|qquad|hspace\{[^}]*\})/g, " ")
    .replace(/\\(Specificity|If|where|Eg|Prove)\b/g, "$1")
    .replace(/\\&/g, "&")
    .replace(/&/g, " · ")
    .replace(/\\\\/g, "\n")
    .replace(/\\([#$%&_{}])/g, "$1")
    .replace(/\\([A-Za-z]+)\b/g, "$1")
    .replace(/[{}]/g, "")
    .replace(/~+/g, " ")
    .replace(/\b(Definition|Def\.?|Theorem|Lemma|Proposition|Corollary)\s+\d+(?:\.\d+)+\.?/gi, "$1")
    .replace(/\bDef\.?\s*:/gi, "Definition:")
    .replace(/\bEg\.?\s*:/gi, "Example:")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s+/g, "\n")
    .trim();
}

function sanitizeFormula(formula: string) {
  if (!formula.includes("\\begin{tabular}")) return formula;
  return formula
    .replace(/\\renewcommand\{\\arraystretch\}\{[^}]*\}/g, "")
    .replace(/\\setlength\{\\tabcolsep\}\{[^}]*\}/g, "")
    .replace(/\\text\{\\small\s*/g, "")
    .replace(/\\begin\{tabular\}/g, "\\begin{array}")
    .replace(/\\end\{tabular\}\s*\}?/g, "\\end{array}")
    .replace(/\$/g, "");
}

export function renderFormulaHtml(formula: string, displayMode: boolean) {
  return katex.renderToString(sanitizeFormula(formula), {
    displayMode,
    throwOnError: false,
    strict: false,
    trust: false,
    macros,
  });
}

export function RichText({ raw }: { raw: string }) {
  const tokens = tokenizeRichText(raw);
  return (
    <span className="rich-text">
      {tokens.map((token, index) => {
        if (token.type === "math") {
          const html = renderFormulaHtml(token.value, Boolean(token.display));
          const className = token.display ? `math-display${token.table ? " math-table" : ""}` : "math-inline";
          return <span key={index} className={className} dangerouslySetInnerHTML={{ __html: html }} />;
        }
        const cleaned = cleanTextSegment(token.value);
        const lines = cleaned.split("\n");
        return lines.map((line, lineIndex) => (
          <span key={`${index}-${lineIndex}`}>{line}{lineIndex < lines.length - 1 ? <br /> : null}</span>
        ));
      })}
    </span>
  );
}

function extractItemLabel(item: string) {
  const bold = item.match(/^\s*(?:\\hl\{)?\\textbf\{([^}]*)\}/);
  if (bold) return plainText(bold[1]);
  const label = item.match(/^\s*\[([^\]]+)\]/);
  return label ? plainText(label[1]) : "";
}

export function TexBody({ body }: { body: string }) {
  const prepared = body
    .replace(/\\begin\{document\}|\\end\{document\}|\\begin\{multicols\}\{\d+\}|\\end\{multicols\}/g, "")
    .replace(/\\begin\{itemize\}|\\end\{itemize\}/g, "")
    .replace(/\\paragraph\*?\{([^}]*)\}/g, "\\item \\textbf{$1}")
    .trim();
  const parts = prepared.split(/\\item(?:\[[^\]]*\])?/g).map((part) => part.trim()).filter(Boolean);
  if (parts.length <= 1) return <div className="prose-block"><RichText raw={prepared} /></div>;
  return (
    <ul className="note-list">
      {parts.map((part, index) => {
        const label = extractItemLabel(part);
        const itemBody = label ? part.replace(/^\s*(?:\\hl\{)?\\textbf\{[^}]*\}\}?\s*/, "") : part;
        return <li key={index}>{label ? <strong className="item-label">{label}</strong> : null}<RichText raw={itemBody} /></li>;
      })}
    </ul>
  );
}

type MdListNode = { text: string; indent: number };
type MdFoldNode = { title: string; level: number; lines: string[]; children: MdFoldNode[] };

function MarkdownChunk({ body }: { body: string }) {
  const lines = body.split("\n");
  const blocks: React.ReactNode[] = [];
  let list: MdListNode[] = [];
  let paragraph: string[] = [];
  const flushParagraph = () => {
    if (!paragraph.length) return;
    blocks.push(<p key={`p-${blocks.length}`}><RichText raw={paragraph.join("\n")} /></p>);
    paragraph = [];
  };
  const flushList = () => {
    if (!list.length) return;
    const current = list;
    list = [];
    blocks.push(<ul className="mind-list" key={`list-${blocks.length}`}>{current.map((node, index) => (
      <li key={index} className={`depth-${Math.min(node.indent, 4)}`}><RichText raw={node.text} /></li>
    ))}</ul>);
  };

  lines.forEach((line) => {
    const bullet = line.match(/^(\s*)-\s*(.*)/);
    if (bullet) {
      flushParagraph();
      list.push({ text: bullet[2], indent: Math.floor(bullet[1].length / 2) });
    } else if (list.length && line.trim()) {
      list[list.length - 1].text += `\n${line.trim()}`;
    } else if (line.trim()) {
      flushList();
      paragraph.push(line);
    } else if (paragraph.length) {
      flushParagraph();
    }
  });
  flushParagraph();
  flushList();
  return <div className="markdown-body">{blocks}</div>;
}

export function MarkdownBody({ body }: { body: string }) {
  const root: MdFoldNode = { title: "", level: 1, lines: [], children: [] };
  const stack = [root];
  body.split("\n").forEach((line) => {
    const heading = line.match(/^(#{2,4})\s+(.+)/);
    if (!heading) {
      stack[stack.length - 1].lines.push(line);
      return;
    }
    const level = heading[1].length;
    while (stack.length > 1 && stack[stack.length - 1].level >= level) stack.pop();
    const node: MdFoldNode = { title: editorialHeading(heading[2]), level, lines: [], children: [] };
    stack[stack.length - 1].children.push(node);
    stack.push(node);
  });

  return <div className="markdown-folds">
    {root.lines.some((line) => line.trim()) ? <MarkdownChunk body={root.lines.join("\n")} /> : null}
    {root.children.map((node, index) => <MarkdownFold key={`${node.level}-${node.title}-${index}`} node={node} />)}
  </div>;
}

function MarkdownFold({ node }: { node: MdFoldNode }) {
  return <details open className={`md-fold level-${node.level}`}>
    <summary><span className="md-fold-title" role="heading" aria-level={Math.min(node.level + 1, 6)}>{node.title}</span></summary>
    <div className="md-fold-body">
      {node.lines.some((line) => line.trim()) ? <MarkdownChunk body={node.lines.join("\n")} /> : null}
      {node.children.map((child, index) => <MarkdownFold key={`${child.level}-${child.title}-${index}`} node={child} />)}
    </div>
  </details>;
}

const headingAliases: Record<string, string> = {
  "Set up": "Setup",
  "Survival time": "Survival Time",
  "Functions": "Survival & Hazard Functions",
  "Right censoring": "Right Censoring",
  "Other types": "Other Censoring Types",
  "modeling": "Model Specification",
  "estimation": "Estimation",
  "one-sample": "One-Sample Methods",
  "parametric": "Parametric Models",
  "non-parametric": "Nonparametric Estimation",
  "Empirical survival (complete data)": "Empirical Survival (Complete Data)",
  "regression (with covariates X)": "Regression Models",
  "hypothesis testing (two-sample)": "Two-Sample Tests",
  "Complete survival time": "Complete Event Times",
  "Right-censored data: pointwise test": "Pointwise Tests with Right Censoring",
  "Generalized / weighted log-rank tests": "Weighted Log-Rank Tests",
  "Full conformal prediction": "Full Conformal Prediction",
  "Split conformal prediction": "Split Conformal Prediction",
  "Important statistical properties": "Statistical Properties",
  "CP as a permutation test": "Conformal Prediction as a Permutation Test",
  "Conditional Coverage": "Conditional Coverage",
  "Asymptotic guarantees": "Asymptotic Guarantees",
  "Randomization": "Randomization",
  "Universality of CP": "Universality",
  "CV methods": "Cross-Validation Methods",
  "Weighted conformal": "Weighted Conformal Prediction",
  "Online conformal": "Online Conformal Prediction",
  "Conformal risk control": "Conformal Risk Control",
  "Conformal sets aggregation": "Conformal Set Aggregation",
};

function editorialHeading(title: string) {
  return headingAliases[title.trim()] ?? title.trim();
}
