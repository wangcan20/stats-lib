"use client";

import katex from "katex";
import type { TopicSource } from "./library-data";

export type LibrarySection = {
  id: string;
  title: string;
  body: string;
  depth?: number;
};

function uniqueSectionIds(sections: LibrarySection[]) {
  const seen = new Map<string, number>();
  return sections.map((section) => {
    const count = (seen.get(section.id) ?? 0) + 1;
    seen.set(section.id, count);
    return count === 1 ? section : { ...section, id: `${section.id}-${count}` };
  });
}

const corrections: Array<[RegExp, string]> = [
  [/\\cup_\{k=1\}\^\\infty A_j/g, "\\cup_{k=1}^\\infty A_k"],
  [/f\(x\)=\\lambda e\^\{-\\lambda\}(?=\$)/g, "f(x)=\\lambda e^{-\\lambda x}"],
  [/Y=\\sum_\{i=1\}\^n\\psi_X\(t\)/g, "Y=\\sum_{i=1}^n X_i"],
  [/x_2f_\{X_1\|X_2\}\(x_1\|x_2\)/g, "x_2f_{X_2|X_1}(x_2|x_1)"],
  [/r\(x_1,x_2\)f_\{X_1\|X_2\}\(x_1\|x_2\)/g, "r(x_1,x_2)f_{X_2|X_1}(x_2|x_1)"],
  [/S\(t\) = P\(T \\ge t\) = 1 - F\(t\)/g, "S(t) = P(T > t) = 1 - F(t)"],
  [/S\(t\)=Pr\(T\\ge t\) or S\(t\)=1-F\(t\)=Pr\(T>t\)/g, "S(t)=P(T>t)=1-F(t) (and P(T\\ge t) for continuous T)"],
];

export function normalizeSource(raw: string) {
  return corrections.reduce((value, [pattern, replacement]) => value.replace(pattern, replacement), raw);
}

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
    const inner = output.slice(start + needle.length, index - 1);
    output = output.slice(0, start) + inner + output.slice(index);
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
    .replace(/\s+/g, " ")
    .trim();
}

function texSections(rawInput: string, sectionFilter?: string): LibrarySection[] {
  const raw = normalizeSource(rawInput).replace(/%.*$/gm, "");
  const sectionPattern = /\\section\*?\{([^}]*)\}/g;
  const matches = [...raw.matchAll(sectionPattern)];
  const topSections = matches.map((match, index) => ({
    title: plainText(match[1]),
    body: raw.slice((match.index ?? 0) + match[0].length, matches[index + 1]?.index ?? raw.length),
  }));
  const selected = sectionFilter
    ? topSections.filter((section) => section.title === plainText(sectionFilter))
    : topSections;

  if (!sectionFilter) {
    return uniqueSectionIds(selected.map((section, index) => ({
      id: slugify(section.title) || `section-${index + 1}`,
      title: section.title.replace(/^Chapter\s*\d+\s*[:.]?\s*/i, ""),
      body: section.body,
    })));
  }

  const section = selected[0];
  if (!section) return [];
  const subPattern = /\\subsection\*?\{([^}]*)\}/g;
  const subs = [...section.body.matchAll(subPattern)];
  if (!subs.length) {
    return [{ id: slugify(section.title), title: section.title, body: section.body }];
  }
  const intro = section.body.slice(0, subs[0].index).trim();
  const parsed = subs.map((match, index) => ({
    id: slugify(plainText(match[1])) || `section-${index + 1}`,
    title: plainText(match[1]),
    body: section.body.slice((match.index ?? 0) + match[0].length, subs[index + 1]?.index ?? section.body.length),
  }));
  if (intro) parsed.unshift({ id: "overview", title: "Overview", body: intro });
  return uniqueSectionIds(parsed);
}

function markdownSections(rawInput: string): LibrarySection[] {
  const raw = normalizeSource(rawInput).replace(/^---[\s\S]*?---\s*/, "");
  const pattern = /^#\s+(.+)$/gm;
  const matches = [...raw.matchAll(pattern)];
  return uniqueSectionIds(matches.map((match, index) => ({
    id: slugify(match[1]) || `section-${index + 1}`,
    title: plainText(match[1]),
    body: raw.slice((match.index ?? 0) + match[0].length, matches[index + 1]?.index ?? raw.length),
  })));
}

export function parseTopic(topic: TopicSource) {
  return topic.format === "markdown"
    ? markdownSections(topic.raw)
    : texSections(topic.raw, topic.sectionFilter);
}

const mathPattern = /(\$\$[\s\S]*?\$\$|(?<!\\)\\\[[\s\S]*?\\\]|(?<!\\)\\\([\s\S]*?\\\)|(?<!\\)\$(?:\\.|[^$\n])*?\$)/g;

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
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s+/g, "\n")
    .trim();
}

export function RichText({ raw, display = false }: { raw: string; display?: boolean }) {
  const parts = raw.split(mathPattern).filter(Boolean);
  return (
    <span className={display ? "rich-text display-rich" : "rich-text"}>
      {parts.map((part, index) => {
        const isMath =
          (part.startsWith("$$") && part.endsWith("$$")) ||
          (part.startsWith("\\[") && part.endsWith("\\]")) ||
          (part.startsWith("\\(") && part.endsWith("\\)")) ||
          (part.startsWith("$") && part.endsWith("$"));
        if (isMath) {
          const isDisplay = part.startsWith("$$") || part.startsWith("\\[");
          let formula = part.replace(/^\$\$|\$\$$/g, "").replace(/^\\\[|\\\]$/g, "").replace(/^\\\(|\\\)$/g, "");
          if (formula.includes("\\begin{tabular}")) {
            formula = formula
              .replace(/\\renewcommand\{\\arraystretch\}\{[^}]*\}/g, "")
              .replace(/\\setlength\{\\tabcolsep\}\{[^}]*\}/g, "")
              .replace(/\\text\{\\small\s*/g, "")
              .replace(/\\begin\{tabular\}/g, "\\begin{array}")
              .replace(/\\end\{tabular\}\s*\}/g, "\\end{array}")
              .replace(/\$/g, "");
          }
          const html = katex.renderToString(formula, {
            displayMode: isDisplay,
            throwOnError: false,
            strict: false,
            trust: false,
            macros: {
              "\\E": "\\mathbb{E}",
              "\\df": "\\xrightarrow{d}",
              "\\Bar": "\\overline",
              "\\Conditioned": "\\mid",
              "\\where": "\\text{where}",
              "\\Eg": "\\text{E.g.}",
              "\\Specificity": "\\operatorname{Specificity}",
              "\\Prove": "\\text{Prove}",
              "\\If": "\\text{If}",
            },
          });
          return <span key={index} className={isDisplay ? "math-display" : "math-inline"} dangerouslySetInnerHTML={{ __html: html }} />;
        }
        const cleaned = cleanTextSegment(part);
        return cleaned.split("\n").map((line, lineIndex) => (
          <span key={`${index}-${lineIndex}`}>
            {line}
            {lineIndex < cleaned.split("\n").length - 1 ? <br /> : null}
          </span>
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
    .replace(/\\begin\{itemize\}/g, "")
    .replace(/\\end\{itemize\}/g, "")
    .replace(/\\paragraph\*?\{([^}]*)\}/g, "\\item \\textbf{$1}")
    .trim();
  const parts = prepared.split(/\\item(?:\[[^\]]*\])?/g).map((part) => part.trim()).filter(Boolean);

  if (parts.length <= 1) {
    return <div className="prose-block"><RichText raw={prepared} display /></div>;
  }
  return (
    <ul className="note-list">
      {parts.map((part, index) => {
        const label = extractItemLabel(part);
        const itemBody = label
          ? part.replace(/^\s*(?:\\hl\{)?\\textbf\{[^}]*\}\}?\s*/, "")
          : part;
        return (
          <li key={index} className={label ? "has-label" : undefined}>
            {label ? <span className="item-label">{label}</span> : null}
            <RichText raw={itemBody} display />
          </li>
        );
      })}
    </ul>
  );
}

type MdNode = { text: string; indent: number };

export function MarkdownBody({ body }: { body: string }) {
  const lines = body.split("\n");
  const blocks: React.ReactNode[] = [];
  let list: MdNode[] = [];
  const flushList = () => {
    if (!list.length) return;
    const current = list;
    list = [];
    blocks.push(
      <ul className="mind-list" key={`list-${blocks.length}`}>
        {current.map((node, index) => (
          <li key={index} style={{ "--indent": Math.min(node.indent, 4) } as React.CSSProperties}>
            <span className="mind-rail" aria-hidden="true" />
            <RichText raw={node.text} />
          </li>
        ))}
      </ul>,
    );
  };

  lines.forEach((line) => {
    const heading = line.match(/^(#{2,4})\s+(.+)/);
    const bullet = line.match(/^(\s*)-\s+(.*)/);
    if (heading) {
      flushList();
      const level = heading[1].length;
      blocks.push(
        <h3 className={`md-heading level-${level}`} key={`heading-${blocks.length}`}>
          {heading[2]}
        </h3>,
      );
    } else if (bullet) {
      list.push({ text: bullet[2], indent: Math.floor(bullet[1].length / 2) });
    } else if (line.trim()) {
      flushList();
      blocks.push(<p key={`p-${blocks.length}`}><RichText raw={line} /></p>);
    }
  });
  flushList();
  return <div className="markdown-body">{blocks}</div>;
}
