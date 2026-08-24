import { copyFile, mkdir } from "node:fs/promises";

const sourceRoot = new URL("../../source/", import.meta.url);
const contentRoot = new URL("../content/", import.meta.url);
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

await mkdir(contentRoot, { recursive: true });
await Promise.all(files.map((file) => copyFile(new URL(file, sourceRoot), new URL(file, contentRoot))));
console.log(`Synced ${files.length} note files into the library.`);
