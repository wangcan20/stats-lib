---
title: survival analysis
markmap:
  colorFreezeLevel: 3
---
# Setup
## Survival time
- $T \ge 0$: time-to-event random variable
- Examples: time to death, relapse, device failure, etc.

## Functions
- CDF: $F(t) = P(T \le t)$
- Survival: $S(t) = P(T > t) = 1 - F(t)$ (for continuous $T$, also $P(T\ge t)$)
- PDF: $f(t) = dF(t)/dt = -dS(t)/dt$
- Hazard: $\lambda(t) = \lim_{\Delta \to 0^+} \dfrac{P(t \le T < t+\Delta \mid T \ge t)}{\Delta} = \dfrac{f(t)}{S(t)}$
- Cum. hazard: $\Lambda(t) = \int_0^t \lambda(u)\,du$
- Key relationship: $S(t) = \exp(-\Lambda(t))$


## Censoring
### Right censoring
- Observed: $Y = \min(T, C)$, $\Delta = I(T \le C)$


### Other types
- Left censoring: event occurred before first observation
- Interval censoring: event known to occur between two visits
- Type I censoring: fixed study end time
- Type II censoring: stop when r-th event occurs




# modeling and estimation
## one-sample
### parametric
#### modeling

- Common distributions 
  - Exponential: $f(t)=\theta e^{-\theta t}, S(t)=e^{-\theta t}, \lambda(t)=\theta$
    - Constant hazard
    - $E[T]=1/\theta$
  - Weibull: $S(t)=e^{-(\theta t)^\gamma}, \lambda(t)=\gamma\theta(\theta t)^{\gamma-1}$
    - $\gamma=1$: reduces to exponential
    - $\gamma>1$: increasing hazard
    - $\gamma<1$: decreasing hazard
  - Log-normal: $\log T \sim N(\mu,\sigma^2)$
    - useful in regression
  - Gamma, Log-logistic, Pareto..
- Note: modeling hazard $\lambda(t)$, pdf $f(t)$, or survival $S(t)$ are equivalent ways of specifying distribution

#### estimation
- MLE
  - Complete data: 
    $
    L(\theta) = \prod_{i=1}^n f(t_i;\theta), \quad 
    \hat\theta = \arg\max L(\theta)
    $
    Asymptotic normality: $\hat\theta \sim N(\theta, I^{-1}(\theta))$
  - With censoring: observed $(y_i,\delta_i)$ with $y_i=\min(t_i,c_i), \delta_i=I(t_i<c_i)$
    $
    L(\theta) = \prod_{i=1}^n f(y_i;\theta)^{\delta_i} S(y_i;\theta)^{1-\delta_i}
    $
    Requires independent censoring ($T \perp C$)

  - Eg. Exponential model: $\hat\theta = \dfrac{\sum_i \delta_i}{\sum_i y_i}$
 
- Extension: regression parameterization possible (e.g. exponential regression with $\lambda_i = \beta^\top x_i$)

  
### non-parametric
#### Empirical survival (complete data)
- $\hat S(t) = \frac{1}{n}\sum I(T_i \ge t)$
- CLT: $\hat S(t) \sim N(S(t), S(t)(1-S(t))/n)$


#### Kaplan–Meier estimator (with censoring)
- Assumption: independent censoring
- 
  $
  \hat S(t) = \prod_{y(j) < t} \left(1 - \frac{d(j)}{N(j)}\right)
  $
  - $y(j)$: ordered distinct uncensored event times
  - $d(j)$: # failures at $y(j)$
  - $N(j)$: risk set size at $y(j)$



- Greenwood’s formula: $
  \widehat{\text{Var}}(\hat S(t)) = [\hat S(t)]^2 \sum_{y(j)<t} \frac{d(j)}{N(j)(N(j)-d(j))}
  $
- Asymptotic normality: $\hat S(t) \approx N(S(t), \widehat{\text{Var}}(\hat S(t)))$



  
## regression (with covariates X)
### Accelerated Failure Time Model (AFTM)
- Formulation:
  - $\log T_i = \alpha + \beta^\top X_i + \epsilon_i$
  - Equivalently: $T_i = T_{0i}\exp(\beta^\top X_i)$
  - Covariates accelerate/decelerate the survival time scale
- Parametric AFTM
  - Assume distribution for $\epsilon$ (e.g. normal, extreme value, logistic)
  - Estimation: Maximum Likelihood (assumes independent censoring)



### Proportional Hazards Model (PHM / Cox model)
- Model:
  - $\lambda(t|X) = \lambda_0(t)\exp(\beta^\top X)$
  - Baseline hazard $\lambda_0(t)$ unspecified ⇒ semiparametric
- Interpretation:
  - Hazard ratio: $\lambda(t|X_1)/\lambda(t|X_2) = \exp(\beta^\top(X_1 - X_2))$
  - Time-invariant hazard ratio (proportionality assumption)
- Equivalent expression:
  - $S(t|X) = S_0(t)^{\exp(\beta^\top X)}$ (Lehmann’s alternatives family)
- Estimation:
  - Partial likelihood (Cox 1972/1975) $
    L_p(\beta) = \prod_{i:\delta_i=1} \frac{\exp(\beta^\top X_i)}{\sum_{j\in R(y_i)} \exp(\beta^\top X_j)}
    $
 
  - Assumption: independent censoring given $X$
- Extensions:
  - Time-dependent covariates: $X(t)$ allowed in $\lambda(t|X(t))$
  - Tied survival data:
  
  - Discrete-time survival data:
    - Discrete PHM (hazard probabilities bounded in [0,1])
    - Pooled logistic regression (approximate PHM as intervals shrink)
  - Landmark models: use covariates measured at fixed time points for prediction
- Baseline hazard estimation:
  - Breslow estimator: $
    \hat \Lambda_0(t) = \sum_{i:y_i\le t} \frac{1}{\sum_{j\in R(y_i)} \exp(\hat\beta^\top X_j)}
    $
  - Then $\hat S(t|X) = \exp\{-\hat \Lambda_0(t)\exp(\hat\beta^\top X)\}$
  - Can smooth $\hat \lambda_0(t)$ (kernel, spline)
- Model checking:
  - Goodness-of-fit: compare KM curves stratified by $X$
  - Schoenfeld residuals, Martingale residuals for proportionality checks
- Risk prediction:
  - Use $\hat S(t|X)$ for absolute survival probability
  - Landmark models for dynamic prediction



## hypothesis testing (two-sample)


### Complete survival time

- Null: for fixed t, $p_A = p_B$ or $S_A(t)=S_B(t)$
- 2x2 contingency table, $\chi^2$ test based on hypergeometric distribution


### Right-censored data: pointwise test
- $H_0:S_A(t)=S_B(t)$
- Test statistics: $
  T = \frac{\hat S_A(t) - \hat S_B(t)}{\sqrt{\widehat{Var}(\hat S_A(t)) + \widehat{Var}(\hat S_B(t))}}
  \sim N(0,1)
  $
- Kaplan–Meier estimates $\hat S_A(t), \hat S_B(t)$; Greenwood’s formula used for variance
- Limitation: only tests survival difference at a single time point

### Log-rank test (overall difference)
- Null: $\lambda_A(t) = \lambda_B(t)$ for all $t$
- Alternatives
  - One-sided (hazard A < hazard B, or opposite)
  - Two-sided (hazards unequal)
- Assumption: hazards do not cross
- Construct 2×2 table at each event time $y(i)$; Test statistic: $Z = \frac{\sum_i (O_A(i) - E_A(i))}{\sqrt{\sum_i Var_0(O_A(i))}} \sim N(0,1)$
- Equivalent to score test from two-sample PHM when $H_0:\beta=0$ (most powerful)



### Generalized / weighted log-rank tests
- Weighted statistic: $
  Z = \frac{\sum_i w(i)(O_A(i)-E_A(i))}{\sqrt{\sum_i w(i)^2 Var_0(O_A(i))}}
  $
- Choices of weight $w(i)$:
  - $w(i)=1$: standard log-rank
  - $w(i)=N(i)$: Gehan’s test (Wilcoxon-type)
  - $w(i)=\sqrt{N(i)}$: Tarone–Ware test
- Efficiency:
  - Log-rank: most powerful under PH assumption
  - Gehan / Tarone–Ware: more sensitive to early differences
- Gehan’s test = extension of Mann–Whitney–Wilcoxon to censored data
