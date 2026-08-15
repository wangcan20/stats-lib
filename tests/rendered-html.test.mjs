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

test("renders the finished Stat Atlas shell and social metadata", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /<title>Stat Atlas — Statistics Library<\/title>/i);
  assert.match(html, />Statistics Library</i);
  assert.match(html, />Common Distributions</i);
  assert.match(html, />Regression Models</i);
  assert.match(html, />Expectation–Maximization \(EM\)</i);
  assert.match(html, /property="og:image"/i);
  assert.match(html, /https:\/\/stat-atlas\.test\/og\.png/i);
  assert.match(html, /name="twitter:card" content="summary_large_image"/i);
  assert.doesNotMatch(html, /codex-preview|SkeletonPreview|Your site is taking shape|Starter Project/i);
  assert.doesNotMatch(html, /topic-card|evolving library|mindmap source|living notes/i);
  assert.doesNotMatch(html, />Search</i);
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
  ];
  for (const file of files) {
    const [source, bundled] = await Promise.all([
      readFile(new URL(`../../source/${file}`, import.meta.url), "utf8"),
      readFile(new URL(`../content/${file}`, import.meta.url), "utf8"),
    ]);
    assert.equal(bundled, source, `${file} should be synchronized`);
  }

  const data = await readFile(new URL("../app/library-data.ts", import.meta.url), "utf8");
  assert.equal((data.match(/\bid:\s*"[^"]+"/g) ?? []).length >= 12, true);
  assert.match(data, /id:\s*"conformal-prediction"/);
  assert.match(data, /id:\s*"survival-analysis"/);
  assert.match(data, /id:\s*"distributions"/);
  assert.match(data, /title:\s*"Linear Algebra"/);
  assert.match(data, /title:\s*"Linear Regression: Important Concepts and Conclusions"/);
  assert.match(data, /title:\s*"Logistic Regression"/);
  assert.match(data, /title:\s*"Kernel Regression"/);
  assert.match(data, /rename:\s*"Linear Regression",\s*hideSubsections:\s*true/);
  assert.match(data, /rename:\s*"Expectation–Maximization",\s*hideSubsections:\s*true/);

  const interfaceSource = await readFile(new URL("../app/stats-library.tsx", import.meta.url), "utf8");
  const stylesheet = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.doesNotMatch(interfaceSource, /searchOpen|search-trigger|Search library/);
  assert.match(stylesheet, /--paper:\s*#080808/);
  assert.match(stylesheet, /font-size:\s*14px/);
});
