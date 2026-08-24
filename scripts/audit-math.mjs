import { readFile, readdir } from "node:fs/promises";
import katex from "katex";

const contentDirectory = new URL("../content/", import.meta.url);
const macros = {
  "\\hl": "#1", "\\E": "\\mathbb{E}", "\\df": "\\xrightarrow{d}", "\\Bar": "\\overline",
  "\\Conditioned": "\\mid", "\\where": "\\text{where}", "\\Eg": "\\text{E.g.}",
  "\\Specificity": "\\operatorname{Specificity}", "\\Prove": "\\text{Prove}", "\\If": "\\text{If}",
  "\\Var": "\\operatorname{Var}", "\\argmin": "\\operatorname*{arg\\,min}",
  "\\PP": "\\mathrm{PP}", "\\class": "\\mathrm{class}",
  "\\toprule": "\\hline", "\\midrule": "\\hline", "\\bottomrule": "\\hline",
};

function escapedAt(input, index) {
  let slashes = 0;
  for (let cursor = index - 1; cursor >= 0 && input[cursor] === "\\"; cursor -= 1) slashes += 1;
  return slashes % 2 === 1;
}

function formulas(input) {
  const found = [];
  let cursor = 0;
  while (cursor < input.length) {
    if (input.startsWith("\\begin{tabular}", cursor)) {
      const close = "\\end{tabular}";
      const end = input.indexOf(close, cursor + 15);
      if (end >= 0) {
        found.push({ value: input.slice(cursor, end + close.length), start: cursor });
        cursor = end + close.length;
        continue;
      }
    }
    let open = "";
    let close = "";
    if (input.startsWith("$$", cursor) && !escapedAt(input, cursor)) open = close = "$$";
    else if (input.startsWith("\\[", cursor) && !escapedAt(input, cursor)) { open = "\\["; close = "\\]"; }
    else if (input.startsWith("\\(", cursor) && !escapedAt(input, cursor)) { open = "\\("; close = "\\)"; }
    else if (input[cursor] === "$" && !escapedAt(input, cursor)) open = close = "$";
    if (!open) { cursor += 1; continue; }
    let end = input.indexOf(close, cursor + open.length);
    while (end >= 0 && escapedAt(input, end)) end = input.indexOf(close, end + close.length);
    if (end < 0) { cursor += open.length; continue; }
    found.push({ value: input.slice(cursor + open.length, end), start: cursor });
    cursor = end + close.length;
  }
  return found;
}

const files = (await readdir(contentDirectory)).filter((file) => /\.(?:md|tex)$/.test(file));
let total = 0;
const failures = [];
function sanitize(formula) {
  if (!formula.includes("\\begin{tabular}")) return formula.replace(/\$/g, "");
  return formula
    .replace(/\\renewcommand\{\\arraystretch\}\{[^}]*\}/g, "")
    .replace(/\\setlength\{\\tabcolsep\}\{[^}]*\}/g, "")
    .replace(/\\text\{\\small\s*/g, "")
    .replace(/\\begin\{tabular\}/g, "\\begin{array}")
    .replace(/\\end\{tabular\}\s*\}?/g, "\\end{array}")
    .replace(/\$/g, "");
}
for (const file of files) {
  const raw = await readFile(new URL(file, contentDirectory), "utf8");
  for (const { value: formula, start } of formulas(raw)) {
    total += 1;
    const html = katex.renderToString(sanitize(formula), { throwOnError: false, strict: false, macros });
    if (html.includes("katex-error")) {
      const line = raw.slice(0, start).split("\n").length;
      failures.push(`${file}:${line}: ${formula.trim().replace(/\s+/g, " ").slice(0, 120)}`);
    }
  }
}

if (failures.length) {
  console.error(`Math audit found ${failures.length} formula errors out of ${total}:`);
  console.error(failures.slice(0, 30).join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Math audit passed: ${total} formulas parsed across ${files.length} note files.`);
}
