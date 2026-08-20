# Stat Atlas

A compact, searchable knowledge library built from personal statistics notes.

Live site: <https://wangcan20.github.io/stats-lib/>

## Content model

The library has three browsing layers:

1. collection — mathematical foundations, statistical inference, statistical models, semiparametric and causal inference, computational statistics, and specialized topics;
2. topic group — a coherent family such as probability, point estimation, or regression models;
3. note — a concept, derivation, formula sheet, example, algorithm, or reference page.

Each note has one primary location plus optional tags and related-note links. TeX and Markdown are parsed into one visual system, and formulas are rendered with KaTeX.

## Updating the library

The deployable note snapshots live in `content/`. When working from the original local workspace, edit the canonical notes in the sibling `source/` directory and refresh the snapshots with:

```bash
npm run sync-content
```

Run the local library with `npm run dev`. Verify the full application with `npm test`, or build the static GitHub Pages version with `npm run build:pages`.

The taxonomy and note metadata live in `app/library-data.ts`. Add a note there after adding its source file to the sync list in `scripts/sync-content.mjs`.

## Deployment

Pushes to `main` are deployed automatically by `.github/workflows/pages.yml`. The workflow validates the formulas and builds the static site before publishing it to GitHub Pages.
