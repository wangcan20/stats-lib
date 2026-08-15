import probability from "../content/Probability_2024.tex?raw";
import inference from "../content/Statistical_Inference_2025.tex?raw";
import analysis from "../content/Real_Analysis_2025.tex?raw";
import methods from "../content/Methods_2024.tex?raw";
import other from "../content/notes-other.tex?raw";
import survival from "../content/survival.md?raw";
import conformal from "../content/conformal-prediction.md?raw";

export type CollectionId = "foundations" | "inference" | "models" | "applied";
export type Format = "tex" | "markdown";

export type SectionSelector = {
  title: string;
  occurrence?: number;
  rename?: string;
  group?: string;
  expandSubsections?: boolean;
  hideSubsections?: boolean;
  includeItems?: string[];
  excludeItems?: string[];
};

export type TopicPart = {
  format: Format;
  raw: string;
  selectors?: SectionSelector[];
};

export type TopicSource = {
  id: string;
  title: string;
  collection: CollectionId;
  parts: TopicPart[];
  combineSections?: string;
};

export const collections = [
  { id: "foundations" as const, index: "I", title: "Foundations" },
  { id: "inference" as const, index: "II", title: "Inference" },
  { id: "models" as const, index: "III", title: "Models" },
  { id: "applied" as const, index: "IV", title: "Applied topics" },
];

export const topics: TopicSource[] = [
  {
    id: "real-analysis",
    title: "Real Analysis",
    collection: "foundations",
    parts: [
      { format: "tex", raw: analysis, selectors: [
        { title: "Set Theory", rename: "Sets & Relations" },
        { title: "Real Numbers", rename: "The Real Number System" },
        { title: "Sequences and Series", rename: "Sequences & Series" },
        { title: "Continuous Functions", rename: "Continuity" },
        { title: "Derivative", rename: "Differentiation" },
        { title: "Riemann Integral", rename: "Riemann Integration" },
      ] },
      { format: "tex", raw: methods, selectors: [{ title: "Notes", rename: "Calculus, Series & Special Functions" }] },
    ],
  },
  {
    id: "linear-algebra",
    title: "Linear Algebra & Matrix Calculus",
    collection: "foundations",
    parts: [{
      format: "tex",
      raw: other,
      selectors: [{ title: "Linear Algebra", expandSubsections: true }],
    }],
  },
  {
    id: "probability",
    title: "Probability",
    collection: "foundations",
    parts: [
      {
        format: "tex",
        raw: probability,
        selectors: [
          { title: "Chapter 1: Introduction to Probability", rename: "Probability Spaces & Events" },
          { title: "Chapter 2: Conditional Probability and Independence", rename: "Conditioning & Independence" },
          { title: "Chapter 3: Random variables and Probability Distributions", rename: "Random Variables", excludeItems: ["Examples of distribution"] },
          { title: "Chapter 4: Bivariate and Multivariate Distributions", rename: "Multivariate Random Variables" },
          { title: "Chapter 5: Expectation and Moments", rename: "Expectation & Moments" },
          { title: "Chapter 6: Transformation of Random Variables", rename: "Transformations of Random Variables" },
          { title: "Chapter 8: Convergence of Random Variables", rename: "Modes of Convergence" },
          { title: "Notes", rename: "Combinatorial Identity" },
        ],
      },
      {
        format: "tex",
        raw: methods,
        selectors: [
          { title: "Set and Probability", rename: "Core Probability Identities" },
          { title: "Random variables/vectors", rename: "Densities, Quantiles & Joint Laws", excludeItems: ["Survival Function", "Hazard Function"] },
          { title: "Expectation", rename: "Expectation Rules" },
          { title: "Variance \\& Covariance", rename: "Variance & Covariance" },
          { title: "Independence", rename: "Independence Criteria" },
          { title: "Condition", rename: "Conditioning Identities" },
        ],
      },
    ],
  },
  {
    id: "distributions",
    title: "Common Distributions",
    collection: "foundations",
    parts: [
      { format: "tex", raw: methods, selectors: [{ title: "Distribution Examples", rename: "Distribution Reference" }] },
      { format: "tex", raw: probability, selectors: [{ title: "Chapter 3: Random variables and Probability Distributions", rename: "Distribution Reference", includeItems: ["Examples of distribution"] }] },
      { format: "tex", raw: other, selectors: [{ title: "Distribution", rename: "Distribution Reference", hideSubsections: true }] },
    ],
    combineSections: "Distribution Reference",
  },
  {
    id: "estimation",
    title: "Likelihood & Estimation",
    collection: "inference",
    parts: [
      { format: "tex", raw: methods, selectors: [{ title: "Likelihood", rename: "Likelihood Basics" }] },
      {
        format: "tex",
        raw: inference,
        selectors: [
          { title: "Chapter 1: Convergence properties", rename: "Large-Sample Properties" },
          { title: "Chapter 2. MLE", rename: "Maximum Likelihood" },
          { title: "Chapter3: Sufficient Statistics", rename: "Sufficient Statistics" },
          { title: "Chapter4: Unbiased Estimation", rename: "Unbiased Estimation" },
        ],
      },
    ],
  },
  {
    id: "testing",
    title: "Confidence Intervals & Hypothesis Tests",
    collection: "inference",
    parts: [{
      format: "tex",
      raw: methods,
      selectors: [
        { title: "Confidence Interval", rename: "Confidence Intervals" },
        { title: "Test", occurrence: 1, rename: "Hypothesis Testing" },
        { title: "Test", occurrence: 2, rename: "Nonparametric Tests" },
      ],
    }],
  },
  {
    id: "regression-models",
    title: "Regression Models",
    collection: "models",
    parts: [{
      format: "tex",
      raw: other,
      selectors: [
        { title: "Linear Regression: Important Concepts and Conclusions", rename: "Linear Regression", hideSubsections: true },
        { title: "Logistic Regression", rename: "Logistic Regression", hideSubsections: true },
        { title: "Kernel Regression", rename: "Kernel Regression", hideSubsections: true },
      ],
    }],
  },
  {
    id: "em-algorithm",
    title: "Expectation–Maximization (EM)",
    collection: "models",
    parts: [{
      format: "tex",
      raw: other,
      selectors: [{ title: "EM Algorithm for MLE with Missing Data", rename: "Expectation–Maximization", hideSubsections: true }],
    }],
  },
  {
    id: "causal-inference",
    title: "AIPW & Doubly Robust Estimation",
    collection: "models",
    parts: [{
      format: "tex",
      raw: other,
      selectors: [{ title: "Augmented Inverse Probability Weighting (AIPW) / Doubly Robust Estimation", rename: "AIPW & Doubly Robust Estimation", hideSubsections: true }],
    }],
  },
  {
    id: "categorical-study-design",
    title: "Categorical Data & Study Design",
    collection: "applied",
    parts: [{
      format: "tex",
      raw: methods,
      selectors: [
        { title: "Association of 2*2 Table", rename: "Measures for 2×2 Tables" },
        { title: "Stratification" },
        { title: "Matching" },
        { title: "Contingency Table", rename: "Contingency Tables" },
        { title: "Person-time analysis", rename: "Person-Time Analysis" },
      ],
    }],
  },
  {
    id: "survival-analysis",
    title: "Survival Analysis",
    collection: "applied",
    parts: [
      { format: "markdown", raw: survival },
      { format: "tex", raw: methods, selectors: [{ title: "Survival", rename: "Core Formulas & Kaplan–Meier" }] },
      {
        format: "tex",
        raw: probability,
        selectors: [{
          title: "Chapter 7: Failure Time, Survival Function and Hazard Function",
          rename: "Cure Models",
          includeItems: ["Cure models"],
        }],
      },
    ],
  },
  {
    id: "conformal-prediction",
    title: "Conformal Prediction",
    collection: "applied",
    parts: [{ format: "markdown", raw: conformal }],
  },
];
