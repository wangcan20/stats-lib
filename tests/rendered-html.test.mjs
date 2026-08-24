import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request("https://stat-atlas.test/", {
      headers: {
        accept: "text/html",
        "x-forwarded-host": "stat-atlas.test",
        "x-forwarded-proto": "https",
      },
    }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("renders the refactored library taxonomy and social metadata", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /<title>Stat Atlas — Statistics Library<\/title>/i);
  assert.match(html, />Statistics Library</i);
  assert.match(html, />Mathematical Foundations</i);
  assert.match(html, />Statistical Inference</i);
  assert.match(html, />Statistical Models</i);
  assert.match(html, />Semiparametric &amp; Causal Inference</i);
  assert.match(html, />Computational Statistics</i);
  assert.match(html, />Specialized Topics</i);
  assert.match(html, />Prediction-Powered Inference</i);
  assert.match(html, />Common Distributions</i);
  assert.match(html, />Regression Models</i);
  assert.match(html, />Expectation–Maximization</i);
  assert.match(html, />Recently updated</i);
  assert.match(html, />Search\s*</i);
  assert.match(html, /property="og:image"/i);
  assert.match(html, /https:\/\/stat-atlas\.test\/og\.png/i);
  assert.match(html, /name="twitter:card" content="summary_large_image"/i);
  assert.doesNotMatch(html, /codex-preview|SkeletonPreview|Your site is taking shape|Starter Project/i);
  assert.doesNotMatch(html, /topic-card|evolving library|mindmap source|living notes/i);
  await access(new URL("../public/og.png", import.meta.url));
});

test("keeps every canonical note synchronized with the deployable content layer", async () => {
  const files = [
    "Probability_2024.tex",
    "Statistical_Inference_2025.tex",
    "Real_Analysis_2025.tex",
    "Methods_2024.tex",
    "notes-other.tex",
    "survival.md",
    "conformal-prediction.md",
    "prediction-powered-inference.tex",
  ];
  for (const file of files) {
    const [source, bundled] = await Promise.all([
      readFile(new URL(`../../source/${file}`, import.meta.url), "utf8"),
      readFile(new URL(`../content/${file}`, import.meta.url), "utf8"),
    ]);
    assert.equal(bundled, source, `${file} should be synchronized`);
  }

  const data = await readFile(new URL("../app/library-data.ts", import.meta.url), "utf8");
  assert.equal((data.match(/\bpage\(\{ id:\s*"[^"]+"/g) ?? []).length >= 30, true);
  assert.match(data, /id:\s*"conformal-prediction"/);
  assert.match(data, /id:\s*"survival-analysis"/);
  assert.match(data, /id:\s*"prediction-powered-inference"/);
  assert.match(data, /group:\s*"prediction-powered-inference"/);
  assert.match(data, /id:\s*"common-distributions"/);
  assert.match(data, /type PageType = "Concept" \| "Derivation" \| "Formula Sheet" \| "Example" \| "Algorithm" \| "Reference"/);
  assert.match(data, /type Maturity = "Stub" \| "Notes" \| "Developed" \| "Reference"/);
  assert.match(data, /tags:\s*string\[\]/);
  assert.match(data, /related\?:\s*string\[\]/);
  assert.match(data, /id: "aipw"[^\n]+collection: "semiparametric-causal"[^\n]+group: "doubly-robust"/);
  assert.match(data, /id: "em-algorithm"[^\n]+collection: "computational-statistics"[^\n]+group: "em"/);
  assert.match(data, /id: "categorical-data"[^\n]+title: "Categorical Data"/);
  assert.match(data, /id: "study-design"[^\n]+title: "Study Design"/);
  assert.match(data, /id: "resampling"[^\n]+title: "Resampling"/);
  assert.doesNotMatch(data, /related:\s*\[[^\]]*"(?:covariance-matrices|monte-carlo-integration|categorical-tables)"/);

  const interfaceSource = await readFile(new URL("../app/stats-library.tsx", import.meta.url), "utf8");
  const stylesheet = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(interfaceSource, /searchOpen/);
  assert.match(interfaceSource, /Search topics, formulas, tags/);
  assert.match(interfaceSource, /activeTag/);
  assert.match(interfaceSource, /Related topics/);
  assert.match(interfaceSource, /note\.related\?\.includes\(activeNote\.id\)/);
  assert.match(interfaceSource, /Recently updated/);
  assert.match(stylesheet, /--paper:\s*#080808/);
  assert.match(stylesheet, /body\s*\{[^}]*font-size:\s*16px/);
  assert.match(stylesheet, /\.math-inline\s*\{[^}]*vertical-align:\s*baseline/);
  assert.doesNotMatch(stylesheet, /\.math-inline\s*\{[^}]*vertical-align:\s*-/);
  assert.match(stylesheet, /\.math-table \.katex\s*\{\s*font-size:\s*1\.16em/);
  assert.match(interfaceSource, /<details id=\{section\.id\} open/);
  assert.match(interfaceSource, />Expand all<\/button>/);
  assert.match(interfaceSource, />Collapse all<\/button>/);
  assert.match(stylesheet, /\.library-section:not\(\[open\]\)/);
  assert.match(stylesheet, /\.search-layer/);
  assert.match(stylesheet, /\.note-meta/);
  assert.match(stylesheet, /\.related-topics/);

  const contentParser = await readFile(new URL("../app/content.tsx", import.meta.url), "utf8");
  assert.match(contentParser, /<details open className=\{`md-fold/);
});
