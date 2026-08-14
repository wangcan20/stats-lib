# Stat Atlas

A compact, searchable knowledge library built from the notes in `../source`.

## Content model

The library has three navigation layers:

1. collection — foundations, inference/study design, models/computation, modern prediction;
2. topic — a coherent note set such as probability, AIPW, or survival analysis;
3. section — the original chapter or mindmap branch.

The mixed `notes-other.tex` source is presented as separate focused topics without discarding its source structure. TeX and Markdown are parsed into one visual system, and formulas are rendered with KaTeX.

## Updating the library

Edit the canonical notes in `../source`, then refresh the site copy:

```bash
npm run sync-content
```

Run the local library with `npm run dev`, and verify a production build with `npm test`.

The source-to-topic classification lives in `app/library-data.ts`. Add a new topic there after adding its file to the sync list in `scripts/sync-content.mjs`.
