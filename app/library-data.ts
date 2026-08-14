import probability from "../content/Probability_2024.tex?raw";
import inference from "../content/Statistical_Inference_2025.tex?raw";
import analysis from "../content/Real_Analysis_2025.tex?raw";
import methods from "../content/Methods_2024.tex?raw";
import other from "../content/notes-other.tex?raw";
import survival from "../content/survival.md?raw";
import conformal from "../content/conformal-prediction.md?raw";

export type CollectionId = "foundations" | "inference" | "models" | "prediction";
export type Format = "tex" | "markdown";

export type TopicSource = {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  collection: CollectionId;
  format: Format;
  raw: string;
  year?: string;
  sectionFilter?: string;
  featured?: boolean;
};

export const collections = [
  {
    id: "foundations" as const,
    index: "01",
    title: "Foundations",
    description: "The mathematical language beneath statistical reasoning.",
    color: "#2f6feb",
  },
  {
    id: "inference" as const,
    index: "02",
    title: "Inference & study design",
    description: "From likelihood and estimation to tests and epidemiologic designs.",
    color: "#7c5cff",
  },
  {
    id: "models" as const,
    index: "03",
    title: "Models & computation",
    description: "Regression, latent-variable methods, causal estimation, and tools.",
    color: "#00a878",
  },
  {
    id: "prediction" as const,
    index: "04",
    title: "Modern prediction",
    description: "Structured notes on uncertainty for time-to-event and predictive tasks.",
    color: "#e56b38",
  },
];

export const topics: TopicSource[] = [
  {
    id: "probability",
    title: "Probability",
    shortTitle: "Probability",
    description: "Events, distributions, moments, transformations, survival, and convergence.",
    collection: "foundations",
    format: "tex",
    raw: probability,
    year: "2024",
  },
  {
    id: "real-analysis",
    title: "Real Analysis",
    shortTitle: "Real analysis",
    description: "Sets, real numbers, sequences, continuity, differentiation, and integration.",
    collection: "foundations",
    format: "tex",
    raw: analysis,
    year: "2025",
  },
  {
    id: "statistical-inference",
    title: "Statistical Inference",
    shortTitle: "Statistical inference",
    description: "Convergence, maximum likelihood, sufficiency, and unbiased estimation.",
    collection: "inference",
    format: "tex",
    raw: inference,
    year: "2025",
  },
  {
    id: "biostatistical-methods",
    title: "Biostatistical Methods",
    shortTitle: "Biostat methods",
    description: "A compact field sheet spanning inference, tables, designs, and person-time.",
    collection: "inference",
    format: "tex",
    raw: methods,
    year: "2024",
  },
  {
    id: "linear-regression",
    title: "Linear Regression",
    shortTitle: "Linear regression",
    description: "OLS geometry, assumptions, inference, diagnostics, and prediction.",
    collection: "models",
    format: "tex",
    raw: other,
    sectionFilter: "Linear Regression: Important Concepts and Conclusions",
  },
  {
    id: "logistic-regression",
    title: "Logistic Regression",
    shortTitle: "Logistic regression",
    description: "The logit model, likelihood, estimation, interpretation, and regularization.",
    collection: "models",
    format: "tex",
    raw: other,
    sectionFilter: "Logistic Regression",
  },
  {
    id: "kernel-regression",
    title: "Kernel Regression",
    shortTitle: "Kernel regression",
    description: "Local averaging, bandwidth, bias–variance tradeoffs, and boundary effects.",
    collection: "models",
    format: "tex",
    raw: other,
    sectionFilter: "Kernel Regression",
  },
  {
    id: "em-algorithm",
    title: "EM Algorithm",
    shortTitle: "EM algorithm",
    description: "Likelihood with latent data and the Gaussian-mixture E/M updates.",
    collection: "models",
    format: "tex",
    raw: other,
    sectionFilter: "EM Algorithm for MLE with Missing Data",
  },
  {
    id: "causal-aipw",
    title: "AIPW & Double Robustness",
    shortTitle: "AIPW / causal",
    description: "Potential outcomes, identification, IPW, augmentation, and influence functions.",
    collection: "models",
    format: "tex",
    raw: other,
    sectionFilter: "Augmented Inverse Probability Weighting (AIPW) / Doubly Robust Estimation",
  },
  {
    id: "linear-algebra",
    title: "Linear Algebra Toolkit",
    shortTitle: "Linear algebra",
    description: "Matrix derivatives, covariance transformations, and trace identities.",
    collection: "models",
    format: "tex",
    raw: other,
    sectionFilter: "Linear Algebra",
  },
  {
    id: "distributions",
    title: "Distribution Notes",
    shortTitle: "Distributions",
    description: "Focused distribution results collected outside the probability sheet.",
    collection: "models",
    format: "tex",
    raw: other,
    sectionFilter: "Distribution",
  },
  {
    id: "survival-analysis",
    title: "Survival Analysis",
    shortTitle: "Survival analysis",
    description: "Censoring, Kaplan–Meier, Cox models, risk prediction, and log-rank tests.",
    collection: "prediction",
    format: "markdown",
    raw: survival,
    featured: true,
  },
  {
    id: "conformal-prediction",
    title: "Conformal Prediction",
    shortTitle: "Conformal prediction",
    description: "Coverage, conditionality, weighted and online variants, risk, and multiplicity.",
    collection: "prediction",
    format: "markdown",
    raw: conformal,
    featured: true,
  },
];

export const quickRelations = [
  ["Probability", "Inference", "Models", "Prediction"],
  ["Exchangeability", "Conformal prediction"],
  ["Likelihood", "MLE", "EM algorithm"],
  ["Censoring", "Kaplan–Meier", "Cox model"],
];
