import probability from "../content/Probability_2024.tex?raw";
import inference from "../content/Statistical_Inference_2025.tex?raw";
import analysis from "../content/Real_Analysis_2025.tex?raw";
import methods from "../content/Methods_2024.tex?raw";
import other from "../content/notes-other.tex?raw";
import survival from "../content/survival.md?raw";
import conformal from "../content/conformal-prediction.md?raw";
import ppi from "../content/prediction-powered-inference.tex?raw";

export type CollectionId = "mathematical-foundations" | "statistical-inference" | "statistical-models" | "semiparametric-causal" | "computational-statistics" | "specialized-topics";
export type Format = "tex" | "markdown";
export type PageType = "Concept" | "Derivation" | "Formula Sheet" | "Example" | "Algorithm" | "Reference";
export type Maturity = "Stub" | "Notes" | "Developed" | "Reference";

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

export type NoteSource = {
  id: string;
  title: string;
  collection: CollectionId;
  group: string;
  pageType: PageType;
  maturity: Maturity;
  updated: string;
  tags: string[];
  related?: string[];
  parts: TopicPart[];
  combineSections?: string;
};

export const collections = [
  { id: "mathematical-foundations" as const, index: "I", title: "Mathematical Foundations" },
  { id: "statistical-inference" as const, index: "II", title: "Statistical Inference" },
  { id: "statistical-models" as const, index: "III", title: "Statistical Models" },
  { id: "semiparametric-causal" as const, index: "IV", title: "Semiparametric & Causal Inference" },
  { id: "computational-statistics" as const, index: "V", title: "Computational Statistics" },
  { id: "specialized-topics" as const, index: "VI", title: "Specialized Topics" },
];

export const groups = [
  { id: "real-analysis", collection: "mathematical-foundations" as const, title: "Real Analysis" },
  { id: "linear-algebra", collection: "mathematical-foundations" as const, title: "Linear Algebra & Matrix Calculus" },
  { id: "probability", collection: "mathematical-foundations" as const, title: "Probability" },
  { id: "distributions", collection: "mathematical-foundations" as const, title: "Common Distributions" },
  { id: "models-likelihood", collection: "statistical-inference" as const, title: "Statistical Models & Likelihood" },
  { id: "point-estimation", collection: "statistical-inference" as const, title: "Point Estimation" },
  { id: "asymptotic-theory", collection: "statistical-inference" as const, title: "Asymptotic Theory" },
  { id: "confidence-testing", collection: "statistical-inference" as const, title: "Confidence Intervals & Hypothesis Testing" },
  { id: "resampling", collection: "statistical-inference" as const, title: "Resampling" },
  { id: "regression-models", collection: "statistical-models" as const, title: "Regression Models" },
  { id: "generalized-linear-models", collection: "statistical-models" as const, title: "Generalized Linear Models" },
  { id: "nonparametric-models", collection: "statistical-models" as const, title: "Nonparametric Models" },
  { id: "hierarchical-latent-models", collection: "statistical-models" as const, title: "Hierarchical / Latent Variable Models" },
  { id: "semiparametric-theory", collection: "semiparametric-causal" as const, title: "Semiparametric Theory" },
  { id: "missing-data-weighting", collection: "semiparametric-causal" as const, title: "Missing Data & Weighting" },
  { id: "doubly-robust", collection: "semiparametric-causal" as const, title: "Doubly Robust Estimation" },
  { id: "causal-inference", collection: "semiparametric-causal" as const, title: "Causal Inference" },
  { id: "optimization", collection: "computational-statistics" as const, title: "Optimization" },
  { id: "em", collection: "computational-statistics" as const, title: "Expectation–Maximization" },
  { id: "monte-carlo", collection: "computational-statistics" as const, title: "Monte Carlo" },
  { id: "mcmc", collection: "computational-statistics" as const, title: "MCMC" },
  { id: "approximate-inference", collection: "computational-statistics" as const, title: "Approximate Inference" },
  { id: "categorical-data", collection: "specialized-topics" as const, title: "Categorical Data" },
  { id: "study-design", collection: "specialized-topics" as const, title: "Study Design" },
  { id: "survival-analysis", collection: "specialized-topics" as const, title: "Survival Analysis" },
  { id: "conformal-prediction", collection: "specialized-topics" as const, title: "Conformal Prediction" },
  { id: "prediction-powered-inference", collection: "specialized-topics" as const, title: "Prediction-Powered Inference" },
];

const page = (note: NoteSource) => note;

export const notes: NoteSource[] = [
  page({ id: "sets-relations", title: "Sets & Relations", collection: "mathematical-foundations", group: "real-analysis", pageType: "Concept", maturity: "Developed", updated: "2025", tags: ["Real Analysis", "Sets"], related: ["real-number-system", "probability-spaces"], parts: [{ format: "tex", raw: analysis, selectors: [{ title: "Set Theory", rename: "Sets & Relations" }] }] }),
  page({ id: "real-number-system", title: "The Real Number System", collection: "mathematical-foundations", group: "real-analysis", pageType: "Concept", maturity: "Developed", updated: "2025", tags: ["Real Analysis", "Foundations"], related: ["sets-relations", "sequences-series"], parts: [{ format: "tex", raw: analysis, selectors: [{ title: "Real Numbers", rename: "The Real Number System" }] }] }),
  page({ id: "sequences-series", title: "Sequences & Series", collection: "mathematical-foundations", group: "real-analysis", pageType: "Concept", maturity: "Developed", updated: "2025", tags: ["Real Analysis", "Convergence"], related: ["real-number-system", "modes-convergence"], parts: [{ format: "tex", raw: analysis, selectors: [{ title: "Sequences and Series", rename: "Sequences & Series" }] }] }),
  page({ id: "continuity", title: "Continuity", collection: "mathematical-foundations", group: "real-analysis", pageType: "Concept", maturity: "Developed", updated: "2025", tags: ["Real Analysis", "Continuity"], related: ["differentiation", "asymptotic-theory"], parts: [{ format: "tex", raw: analysis, selectors: [{ title: "Continuous Functions", rename: "Continuity" }] }] }),
  page({ id: "differentiation", title: "Differentiation", collection: "mathematical-foundations", group: "real-analysis", pageType: "Concept", maturity: "Developed", updated: "2025", tags: ["Real Analysis", "Derivatives"], related: ["continuity", "matrix-calculus"], parts: [{ format: "tex", raw: analysis, selectors: [{ title: "Derivative", rename: "Differentiation" }] }] }),
  page({ id: "riemann-integration", title: "Riemann Integration", collection: "mathematical-foundations", group: "real-analysis", pageType: "Concept", maturity: "Developed", updated: "2025", tags: ["Real Analysis", "Integration"], related: ["expectation-moments"], parts: [{ format: "tex", raw: analysis, selectors: [{ title: "Riemann Integral", rename: "Riemann Integration" }] }] }),
  page({ id: "calculus-formulas", title: "Calculus & Special Functions", collection: "mathematical-foundations", group: "real-analysis", pageType: "Formula Sheet", maturity: "Reference", updated: "2024", tags: ["Calculus", "Special Functions", "Identities"], related: ["differentiation", "riemann-integration"], parts: [{ format: "tex", raw: methods, selectors: [{ title: "Notes", rename: "Calculus & Special Functions" }] }] }),

  page({ id: "matrix-calculus", title: "Matrix Calculus & Identities", collection: "mathematical-foundations", group: "linear-algebra", pageType: "Formula Sheet", maturity: "Notes", updated: "2026", tags: ["Linear Algebra", "Matrix Calculus", "Covariance", "Trace"], related: ["linear-regression", "differentiation"], parts: [{ format: "tex", raw: other, selectors: [{ title: "Linear Algebra", expandSubsections: true }] }] }),

  page({ id: "probability-spaces", title: "Probability Spaces", collection: "mathematical-foundations", group: "probability", pageType: "Concept", maturity: "Developed", updated: "2024", tags: ["Probability", "Events", "Measures"], related: ["sets-relations", "conditioning-independence"], parts: [{ format: "tex", raw: probability, selectors: [{ title: "Chapter 1: Introduction to Probability", rename: "Probability Spaces & Events" }] }] }),
  page({ id: "conditioning-independence", title: "Conditioning & Independence", collection: "mathematical-foundations", group: "probability", pageType: "Concept", maturity: "Developed", updated: "2024", tags: ["Probability", "Conditioning", "Independence", "Bayes"], related: ["probability-spaces", "joint-distributions", "aipw"], parts: [{ format: "tex", raw: probability, selectors: [{ title: "Chapter 2: Conditional Probability and Independence", rename: "Conditioning & Independence" }] }] }),
  page({ id: "random-variables", title: "Random Variables", collection: "mathematical-foundations", group: "probability", pageType: "Concept", maturity: "Developed", updated: "2024", tags: ["Probability", "Random Variables", "CDF", "Density"], related: ["common-distributions", "joint-distributions"], parts: [{ format: "tex", raw: probability, selectors: [{ title: "Chapter 3: Random variables and Probability Distributions", rename: "Random Variables", excludeItems: ["Examples of distribution"] }] }] }),
  page({ id: "joint-distributions", title: "Joint Distributions", collection: "mathematical-foundations", group: "probability", pageType: "Concept", maturity: "Developed", updated: "2024", tags: ["Probability", "Multivariate", "Conditional Distribution"], related: ["random-variables", "conditioning-independence", "matrix-calculus"], parts: [{ format: "tex", raw: probability, selectors: [{ title: "Chapter 4: Bivariate and Multivariate Distributions", rename: "Joint & Multivariate Distributions" }] }] }),
  page({ id: "expectation-moments", title: "Expectation & Moments", collection: "mathematical-foundations", group: "probability", pageType: "Concept", maturity: "Developed", updated: "2024", tags: ["Probability", "Expectation", "Moments", "Variance"], related: ["probability-formula-sheet", "modes-convergence"], parts: [{ format: "tex", raw: probability, selectors: [{ title: "Chapter 5: Expectation and Moments", rename: "Expectation & Moments" }] }] }),
  page({ id: "random-variable-transformations", title: "Transformations", collection: "mathematical-foundations", group: "probability", pageType: "Derivation", maturity: "Developed", updated: "2024", tags: ["Probability", "Transformations", "Jacobian", "Order Statistics"], related: ["random-variables", "joint-distributions"], parts: [{ format: "tex", raw: probability, selectors: [{ title: "Chapter 6: Transformation of Random Variables", rename: "Transformations of Random Variables" }] }] }),
  page({ id: "modes-convergence", title: "Modes of Convergence & Limit Theorems", collection: "mathematical-foundations", group: "probability", pageType: "Concept", maturity: "Developed", updated: "2024", tags: ["Probability", "Convergence", "LLN", "CLT", "Delta Method"], related: ["sequences-series", "asymptotic-theory"], parts: [{ format: "tex", raw: probability, selectors: [{ title: "Chapter 8: Convergence of Random Variables", rename: "Modes of Convergence & Limit Theorems" }] }] }),
  page({ id: "probability-formula-sheet", title: "Probability Formula Sheet", collection: "mathematical-foundations", group: "probability", pageType: "Formula Sheet", maturity: "Reference", updated: "2024", tags: ["Probability", "Identities", "Expectation", "Variance", "Conditioning"], related: ["expectation-moments", "conditioning-independence"], combineSections: "Probability Identities", parts: [{ format: "tex", raw: methods, selectors: [
    { title: "Set and Probability", rename: "Core Probability Identities" },
    { title: "Random variables/vectors", rename: "Densities, Quantiles & Joint Laws", excludeItems: ["Survival Function", "Hazard Function"] },
    { title: "Expectation", rename: "Expectation Identities" },
    { title: "Variance \\& Covariance", rename: "Variance & Covariance Identities" },
    { title: "Independence", rename: "Independence Criteria" },
    { title: "Condition", rename: "Conditional Expectation Identities" },
  ] }] }),
  page({ id: "common-distributions", title: "Distribution Reference", collection: "mathematical-foundations", group: "distributions", pageType: "Reference", maturity: "Reference", updated: "2026", tags: ["Probability", "Distributions", "PMF", "PDF"], related: ["random-variables", "expectation-moments"], combineSections: "Distribution Reference", parts: [
    { format: "tex", raw: methods, selectors: [{ title: "Distribution Examples", rename: "Distribution Reference" }] },
    { format: "tex", raw: probability, selectors: [{ title: "Chapter 3: Random variables and Probability Distributions", rename: "Distribution Reference", includeItems: ["Examples of distribution"] }] },
    { format: "tex", raw: other, selectors: [{ title: "Distribution", rename: "Distribution Reference", hideSubsections: true }] },
  ] }),

  page({ id: "likelihood-basics", title: "Likelihood, Score & Fisher Information", collection: "statistical-inference", group: "models-likelihood", pageType: "Concept", maturity: "Notes", updated: "2025", tags: ["Inference", "Likelihood", "Score", "Fisher Information"], related: ["maximum-likelihood", "asymptotic-theory", "em-algorithm"], parts: [
    { format: "tex", raw: methods, selectors: [{ title: "Likelihood", rename: "Likelihood & Log-Likelihood" }] },
    { format: "tex", raw: inference, selectors: [{ title: "Chapter 2. MLE", rename: "Score & Fisher Information", includeItems: ["Score Function"] }] },
  ] }),
  page({ id: "sufficiency-exponential-families", title: "Sufficiency & Exponential Families", collection: "statistical-inference", group: "models-likelihood", pageType: "Concept", maturity: "Developed", updated: "2025", tags: ["Inference", "Sufficiency", "Exponential Family", "Completeness"], related: ["maximum-likelihood", "unbiased-estimation"], parts: [{ format: "tex", raw: inference, selectors: [{ title: "Chapter3: Sufficient Statistics", rename: "Sufficiency, Completeness & Exponential Families" }] }] }),
  page({ id: "maximum-likelihood", title: "Maximum Likelihood", collection: "statistical-inference", group: "point-estimation", pageType: "Concept", maturity: "Developed", updated: "2025", tags: ["Inference", "MLE", "Estimation"], related: ["likelihood-basics", "asymptotic-theory", "em-algorithm"], parts: [{ format: "tex", raw: inference, selectors: [{ title: "Chapter 2. MLE", rename: "Maximum Likelihood", excludeItems: ["Score Function", "EM algorithm"] }] }] }),
  page({ id: "unbiased-estimation", title: "Unbiased Estimation", collection: "statistical-inference", group: "point-estimation", pageType: "Concept", maturity: "Developed", updated: "2025", tags: ["Inference", "Unbiasedness", "MVUE", "CRLB"], related: ["sufficiency-exponential-families", "maximum-likelihood"], parts: [{ format: "tex", raw: inference, selectors: [{ title: "Chapter4: Unbiased Estimation", rename: "Unbiased Estimation & Efficiency" }] }] }),
  page({ id: "asymptotic-theory", title: "Large-Sample Theory", collection: "statistical-inference", group: "asymptotic-theory", pageType: "Concept", maturity: "Developed", updated: "2025", tags: ["Inference", "Asymptotics", "Consistency", "Delta Method"], related: ["modes-convergence", "maximum-likelihood", "likelihood-basics"], parts: [{ format: "tex", raw: inference, selectors: [{ title: "Chapter 1: Convergence properties", rename: "Consistency & Asymptotic Normality" }] }] }),
  page({ id: "confidence-intervals", title: "Confidence Intervals", collection: "statistical-inference", group: "confidence-testing", pageType: "Reference", maturity: "Notes", updated: "2024", tags: ["Inference", "Confidence Intervals", "Wald"], related: ["hypothesis-testing", "asymptotic-theory"], parts: [{ format: "tex", raw: methods, selectors: [{ title: "Confidence Interval", rename: "Confidence Intervals" }] }] }),
  page({ id: "hypothesis-testing", title: "Hypothesis Testing", collection: "statistical-inference", group: "confidence-testing", pageType: "Reference", maturity: "Notes", updated: "2024", tags: ["Inference", "Hypothesis Tests", "p-values", "Likelihood Ratio"], related: ["confidence-intervals", "contingency-tables", "nonparametric-tests"], parts: [{ format: "tex", raw: methods, selectors: [{ title: "Test", occurrence: 1, rename: "Hypothesis Testing" }] }] }),
  page({ id: "nonparametric-tests", title: "Nonparametric Tests", collection: "statistical-inference", group: "confidence-testing", pageType: "Reference", maturity: "Notes", updated: "2024", tags: ["Inference", "Nonparametric", "Permutation", "Rank Tests"], related: ["hypothesis-testing"], parts: [{ format: "tex", raw: methods, selectors: [{ title: "Test", occurrence: 2, rename: "Nonparametric Tests" }] }] }),

  page({ id: "linear-regression", title: "Linear Regression", collection: "statistical-models", group: "regression-models", pageType: "Concept", maturity: "Developed", updated: "2026", tags: ["Regression", "OLS", "Prediction", "Linear Models"], related: ["matrix-calculus", "asymptotic-theory", "aipw"], parts: [{ format: "tex", raw: other, selectors: [{ title: "Linear Regression: Important Concepts and Conclusions", rename: "Linear Regression", expandSubsections: true }] }] }),
  page({ id: "logistic-regression", title: "Logistic Regression", collection: "statistical-models", group: "generalized-linear-models", pageType: "Concept", maturity: "Notes", updated: "2026", tags: ["Regression", "GLM", "Classification", "Likelihood"], related: ["likelihood-basics", "contingency-tables", "aipw"], parts: [{ format: "tex", raw: other, selectors: [{ title: "Logistic Regression", rename: "Logistic Regression", expandSubsections: true }] }] }),
  page({ id: "kernel-regression", title: "Kernel Regression", collection: "statistical-models", group: "nonparametric-models", pageType: "Concept", maturity: "Notes", updated: "2026", tags: ["Nonparametric", "Regression", "Kernel", "Bandwidth"], related: ["linear-regression", "conformal-prediction"], parts: [{ format: "tex", raw: other, selectors: [{ title: "Kernel Regression", rename: "Kernel Regression", expandSubsections: true }] }] }),

  page({ id: "aipw", title: "AIPW & Doubly Robust Estimation", collection: "semiparametric-causal", group: "doubly-robust", pageType: "Concept", maturity: "Notes", updated: "2026", tags: ["Semiparametric", "Causal Inference", "Missing Data", "Influence Function", "Doubly Robust"], related: ["conditioning-independence", "linear-regression", "logistic-regression", "asymptotic-theory"], parts: [{ format: "tex", raw: other, selectors: [{ title: "Augmented Inverse Probability Weighting (AIPW) / Doubly Robust Estimation", rename: "AIPW & Doubly Robust Estimation", expandSubsections: true }] }] }),

  page({ id: "em-algorithm", title: "Expectation–Maximization", collection: "computational-statistics", group: "em", pageType: "Algorithm", maturity: "Notes", updated: "2026", tags: ["Computation", "EM", "Latent Variables", "Missing Data", "Mixture Models"], related: ["maximum-likelihood", "likelihood-basics"], parts: [
    { format: "tex", raw: other, selectors: [{ title: "EM Algorithm for MLE with Missing Data", rename: "Expectation–Maximization", expandSubsections: true }] },
    { format: "tex", raw: inference, selectors: [{ title: "Chapter 2. MLE", rename: "EM for Maximum Likelihood", includeItems: ["EM algorithm"] }] },
  ] }),

  page({ id: "two-by-two-tables", title: "2×2 Tables & Association Measures", collection: "specialized-topics", group: "categorical-data", pageType: "Reference", maturity: "Notes", updated: "2024", tags: ["Categorical Data", "Risk Ratio", "Odds Ratio", "2×2 Tables"], related: ["contingency-tables", "stratified-analysis", "hypothesis-testing"], parts: [{ format: "tex", raw: methods, selectors: [{ title: "Association of 2*2 Table", rename: "Risk Difference, Risk Ratio & Odds Ratio" }] }] }),
  page({ id: "stratified-analysis", title: "Stratified Analysis", collection: "specialized-topics", group: "categorical-data", pageType: "Reference", maturity: "Notes", updated: "2024", tags: ["Categorical Data", "Stratification", "Mantel–Haenszel", "Confounding"], related: ["two-by-two-tables", "matching-study-design"], parts: [{ format: "tex", raw: methods, selectors: [{ title: "Stratification", rename: "Stratification & Mantel–Haenszel" }] }] }),
  page({ id: "contingency-tables", title: "Contingency Tables", collection: "specialized-topics", group: "categorical-data", pageType: "Reference", maturity: "Notes", updated: "2024", tags: ["Categorical Data", "Contingency Tables", "Chi-Square"], related: ["two-by-two-tables", "hypothesis-testing"], parts: [{ format: "tex", raw: methods, selectors: [{ title: "Contingency Table", rename: "Contingency Tables" }] }] }),
  page({ id: "matching-study-design", title: "Matching", collection: "specialized-topics", group: "study-design", pageType: "Concept", maturity: "Notes", updated: "2024", tags: ["Study Design", "Matching", "Case-Control", "Paired Data"], related: ["stratified-analysis", "aipw"], parts: [{ format: "tex", raw: methods, selectors: [{ title: "Matching", rename: "Matching & Paired Designs" }] }] }),
  page({ id: "person-time-analysis", title: "Person-Time Analysis", collection: "specialized-topics", group: "study-design", pageType: "Example", maturity: "Notes", updated: "2024", tags: ["Study Design", "Person-Time", "Rates", "Poisson"], related: ["survival-analysis", "hypothesis-testing"], parts: [{ format: "tex", raw: methods, selectors: [{ title: "Person-time analysis", rename: "Person-Time Analysis" }] }] }),
  page({ id: "survival-analysis", title: "Survival Analysis", collection: "specialized-topics", group: "survival-analysis", pageType: "Reference", maturity: "Developed", updated: "2026", tags: ["Survival", "Censoring", "Kaplan–Meier", "Cox Model", "Hazard"], related: ["common-distributions", "likelihood-basics", "person-time-analysis"], parts: [
    { format: "markdown", raw: survival },
    { format: "tex", raw: methods, selectors: [{ title: "Survival", rename: "Core Formulas & Kaplan–Meier" }] },
    { format: "tex", raw: probability, selectors: [{ title: "Chapter 7: Failure Time, Survival Function and Hazard Function", rename: "Cure Models", includeItems: ["Cure models"] }] },
  ] }),
  page({ id: "conformal-prediction", title: "Conformal Prediction", collection: "specialized-topics", group: "conformal-prediction", pageType: "Concept", maturity: "Developed", updated: "2026", tags: ["Prediction", "Uncertainty", "Coverage", "Conformal"], related: ["linear-regression", "kernel-regression", "survival-analysis"], parts: [{ format: "markdown", raw: conformal }] }),
  page({ id: "prediction-powered-inference", title: "Prediction-Powered Inference", collection: "specialized-topics", group: "prediction-powered-inference", pageType: "Concept", maturity: "Developed", updated: "2026-08-24", tags: ["Prediction-Powered Inference", "Prediction-Assisted Inference", "M-Estimation", "Machine Learning", "Inference"], related: ["expectation-moments", "linear-regression", "logistic-regression", "asymptotic-theory", "confidence-intervals"], parts: [{ format: "tex", raw: ppi, selectors: [
    { title: "Setup" },
    { title: "Base Assumptions", rename: "Assumptions" },
    { title: "Mean Estimation" },
    { title: "General Estimation" },
    { title: "Examples and Algorithms", rename: "Examples & Algorithms" },
  ] }] }),
];
