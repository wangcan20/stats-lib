---
title: Conformal Prediction
markmap:
  colorFreezeLevel: 3
---
# Basic Conformal Prediction
## Set up
### Target
- Use observed $((X_1,Y_1), \ldots, (X_n,Y_n))$ and the test feature $X_{n+1}$, construct a prediction set $C(X_{n+1}) \subseteq \mathcal{Y}$  s.t. $\mathbb{P}(Y_{n+1} \in C(X_{n+1})) \ge 1-\alpha$.
### Assumptions
- $(X_1, Y_1),...,(X_{n+1},Y_{n+1})$ exchangeable.
## Full conformal prediction
- Inputs: training data $((X_1,Y_1), \ldots, (X_n,Y_n))$, test point $X_{n+1}$, target coverage $1 - \alpha$, and a conformity / nonconformity score function $s$.
- Candidate-label procedure: for each $y \in \mathcal{Y}$, form the augmented dataset $D_{n+1}^y = \{(X_1,Y_1), \ldots, (X_n,Y_n), (X_{n+1}, y)\}$, compute the scores $S_i^y = s((X_i,Y_i); D_{n+1}^y)$ for all training points and $S_{n+1}^y = s((X_{n+1}, y); D_{n+1}^y)$ for the hypothesized test point, then compute the threshold $\hat q^y = \mathrm{Quantile}(S_1^y, \ldots, S_n^y; (1-\alpha)(1+1/n))$.
- Output: include $y$ in the prediction set whenever the test score is not unusually large relative to the augmented sample, i.e. $C(X_{n+1}) = \{y \in \mathcal{Y} : S_{n+1}^y \le \hat q^y\}$.

## Split conformal prediction
- Inputs and score construction: pretraining dataset $D_{\mathrm{pre}}$, calibration data $((X_1,Y_1), \ldots, (X_n,Y_n))$, test point $X_{n+1}$, and target coverage $1 - \alpha$; use $D_{\mathrm{pre}}$ to construct a score function $s : \mathcal{X} \times \mathcal{Y} \to \mathbb{R}$.
- Calibration step: compute the calibration scores $S_i = s(X_i,Y_i)$ for $i \in [n]$, then compute the conformal quantile $\hat q = \mathrm{Quantile}(S_1, \ldots, S_n; (1-\alpha)(1+1/n))$.
- Output: return the prediction set $C(X_{n+1}) = \{y \in \mathcal{Y} : s(X_{n+1}, y) \le \hat q\}$.

## Example: Regression
- Minimal set size
  - Target: marginal coverage, minimal expected length
  - Score: high-density score $s(x,y)=-\hat f(y\mid x)$
  - Set: high-density region $\{y:\hat f(y\mid x)\ge t\}$
  - Property: asymptotically optimal if $\hat f \to f$
- Equal-tailed intervals
  - Target: equal-tailed conditional coverage, minimal expected interval length
  - Score: CQR score $s(x,y)=\max\{\hat q_{\alpha/2}(x)-y,\; y-\hat q_{1-\alpha/2}(x)\}$
  - Set: $[\hat q_{\alpha/2}(x)-\hat c,\; \hat q_{1-\alpha/2}(x)+\hat c]$
  - Property: asymptotically optimal if endpoint quantiles are consistent

## Example: Classification
- Minimal set size
  - Target: marginal coverage, minimal average set size
  - Score: high-probability score $s(x,y)=-\hat p(y\mid x)$
  - Set: keep labels with sufficiently large $\hat p(y\mid x)$
  - Property: asymptotically optimal if $\hat p \to p$
- Approximate conditional coverage
  - Target: smallest sets with conditional coverage
  - Score: cumulative-probability / adaptive score $s(x,y)=\sum_{y':\,\hat p(y'\mid x)>\hat p(y\mid x)} \hat p(y'\mid x)$
  - Set: include labels from most likely downward until enough mass is covered
  - Property: asymptotically optimal; conditional and marginal levels may differ in discrete classification

## Important statistical properties
### CP as a permutation test
- Conformal p-value $p^y=\dfrac{1+\sum_{i=1}^n \mathbf{1}\{S_i^y\ge S_{n+1}^y\}}{n+1}$. Full conformal returns $C(X_{n+1})=\{y:p^y>\alpha\}$
- Full conformal tests whether $(X_{n+1},y)$ is exchangeable / not an outlier relative to the training data; coverage follows from permutation-test validity
### Conservativeness
- Overcoverage bound: $\mathbb{P}(Y_{n+1}\in C(X_{n+1}))\le \dfrac{\lceil(1-\alpha)(n+1)\rceil}{n+1}+\zeta_{\mathrm{tie}}\le 1-\alpha+\dfrac{1}{n+1}+\zeta_{\mathrm{tie}}$
- Excess conservativeness is only $O(1/n)$ plus the tie probability; randomized conformal can remove the tie issue
### Conditional Coverage
- Why
  - Marginal coverage can hide bad training draws or systematic undercoverage on subgroups / regions of $X$.
- Main targets
  - Training-conditional
    - Goal: $P(Y_{n+1}\in C(X_{n+1})\mid D_n)$
    - Positive
      - For split conformal with i.i.d. data, coverage concentrates near $1-\alpha$
      - High-probability guarantees are available via a slightly more conservative nominal level
    - Limits
      - Exchangeability alone is not enough
      - Full conformal does not universally guarantee training-conditional coverage
  - Test-conditional
    - Goal: $P(Y_{n+1}\in C(X_{n+1})\mid X_{n+1})$
    - Positive
      - If $X$ is discrete, use separate quantiles for each feature value / group
      - If $X$ is binned, use separate quantiles per bin
    - Limits
      - For nonatomic / continuous $X$, exact distribution-free test-conditional coverage is impossible except via trivial, uninformative sets (e.g. For $Y=\mathbb{R}$, this implies infinite-length intervals in the worst case)
      - Stronger relaxations like requiring coverage on every $X_0$ with $P(X\in X_0)\ge \delta$ are still hard
    - Note: Same hardness for distribution-free inference on the regression function $\mu_P(x)=E_P[Y|X=x]$, aim for a $C(x)$ s.t. $P(\mu_P(X_{n+1})\in C(X_{n+1}))\ge 1-\alpha$ 
  - Label-conditional
    - Goal: $P(Y_{n+1}\in C(X_{n+1})\mid Y_{n+1}=y)$
    - Positive
      - In classification, use class-specific quantiles with hypothesized test label $y$. Achieves exact coverage for each label
    - Note
      - Needs enough calibration points for each class
  - Group / Mondrian
    - Goal: condition on a finite partition $g(X_{n+1},Y_{n+1})=k$
    - Positive
      - Use group-specific quantiles. Achieves exact coverage for each group under exchangeability
    - Relation
      - Binned test-conditional and label-conditional methods are special cases
  - Selective coverage
    - For symmetric selection $I(D)$, use only selected calibration points and only labels making the test point selected; then $\mathbb{P}(Y_{n+1}\in C(X_{n+1})\mid n+1\in I(D_{n+1}))\ge 1-\alpha$
- Practical notes
  - Finer conditioning usually increases conservativeness or set size
  - Localization / weighted methods are motivated as more practical relaxations beyond fixed bins
### Asymptotic guarantees
- Unified framework
  - Oracle template: $s_n \to s^\star \Rightarrow \hat q_n \to q^\star$ and $C_n \to C^\star$, so $C_n$ inherits oracle optimality
- Robustness beyond exchangeability
  - Exchangeability not necessary: under model assumptions (e.g. $\beta$-mixing + consistent quantiles), $\big|P(Y_{n+1}\in C_n(X_{n+1})\mid X_{n+1})-(1-\alpha)\big|\to 0$

### Randomization
- Randomized scores remain valid if symmetric in distribution; randomized calibration / tie-breaking smooths conformal p-values so $p^{Y_{n+1}}\sim \mathrm{Unif}[0,1]$ and coverage is exactly $1-\alpha$
### Universality of CP
- Any symmetric distribution-free valid prediction method is equivalent to full conformal with some score $s$; improving performance means choosing a better score, not escaping the conformal framework

# Extensions
## CV methods
- Role
  - Middle ground between split and full conformal: reuse more data than split, avoid refitting for every candidate $y$ like full conformal
- Cross-conformal
  - Split data into $K$ folds; each fold acts as calibration while the other folds train the score. Aggregate fold-wise comparisons: include $y$ if the test point does not "win" too many score comparisons.
  - Coverage: $\mathbb{P}(Y_{n+1}\in C(X_{n+1}))\gtrsim 1-2\alpha$; the factor $2$ is generally unavoidable distribution-free
- CV+ / jackknife+
  - Regression residual-score version; use out-of-fold predictions at $X_{n+1}$ instead of the full-model prediction
  - Ordinary CV / jackknife can fail distribution-free; CV+ fixes this by comparing errors from the same fitted model
  - Relation: cross-conformal set $\subseteq$ CV+ interval; CV+ contains the median ensemble prediction
  - Coverage: same distribution-free guarantee as cross-conformal, roughly $1-2\alpha$
- Conditional / stability notes
  - $K$-fold cross-conformal / CV+ has training-conditional control when fold size $n/K$ is large: $\omega_P(D_n)\lesssim 2\alpha+\sqrt{2\log(K/\delta)/(n/K)}$
  - Leave-one-out / jackknife+ can fail training-conditionally without extra assumptions
  - With algorithmic stability, inflated jackknife recovers near-$1-\alpha$ coverage; stability is usually an assumption, not generally certifiable
## Weighted conformal
- Core idea
  - Replace the uniform conformal quantile by a weighted quantile; larger $w_i$ means calibration point $i$ has more influence
- Distribution shift
  - General known shift: for train $P$ and test $Q$, use $r=dQ/dP$ with weights $w_i^y\propto r(X_i,Y_i)$, $w_{n+1}^y\propto r(X_{n+1},y)$ to get $\mathbb{P}_Q(Y_{n+1}\in C(X_{n+1}))\ge 1-\alpha$
    - Covariate shift: $w_i\propto dQ_X/dP_X(X_i)$ when $P_{Y\mid X}$ is unchanged
    - Label shift: $w_i^y\propto dQ_Y/dP_Y(Y_i)$ and test weight depends on hypothesized label $y$
  - Conditional coverage is stronger than shift robustness; weighted CP targets a specific known shift, so sets can be smaller
- Localized conformal
  - Weight calibration points by similarity to $X_{n+1}$ using a kernel $H(X_i,X_{n+1})$
  - Recalibrated localized CP keeps marginal coverage and aims for better local / approximate conditional coverage
  - Randomly localized CP gives $\mathbb{P}(Y_{n+1}\in C(X_{n+1})\mid \widetilde X_{n+1})\ge 1-\alpha$
- Fixed weights / nonexchangeability
  - Use fixed relevance weights for trusted / recent data; coverage loss is bounded by weighted swap-TV distances, and exchangeable data remain valid if $w_{n+1}\ge w_i$
- General view
  - Weighted permutations unify ordinary CP, shift-robust CP, and nonexchangeable variants; practical only when the needed weights are computable
## Online conformal
- Exchangeable stream: online full conformal gives valid coverage at each time; with distinct scores, conformal p-values / errors are independent, so average coverage $\frac{1}{T}\sum_t \mathbf{1}\{Y_t\in C_t(X_t)\}\to 1-\alpha$.
- Testing exchangeability: online conformal p-values can be multiplied into a nonnegative supermartingale; crossing $1/\alpha$ gives a sequential test for distribution shift / changepoints.
- Adversarial stream: quantile tracking $q_{t+1}=q_t+\eta_t(\mathrm{err}_t-\alpha)$ gives long-run miscoverage $\frac{1}{T}\sum_t \mathrm{err}_t\approx \alpha$ without exchangeability.
## Conformal risk control
- Target
  - Replace miscoverage by bounded monotone loss $L(y,C)\in[0,1]$ and control $\mathbb{E}L(Y,C(X))\le\alpha$; standard CP is $L=\mathbf{1}\{Y\notin C(X)\}$
  - Useful for structured $Y$: coordinatewise error, hierarchical error, false negative rate, etc.
- Procedure
  - For nested $C_\lambda$, compute $\hat R(\lambda)=n^{-1}\sum_i L(Y_i,C_\lambda(X_i))$ and choose $\hat\lambda=\inf\{\lambda:\hat R(\lambda)\le\alpha-(1-\alpha)/n\}$
- Guarantee
  - Under exchangeability and monotone/right-continuous loss, $\mathbb{E}L(Y_{n+1},C_{\hat\lambda}(X_{n+1}))\le\alpha$
## Multiplicity
- FWER control
  - For $m$ test points, target $\mathbb{P}(\forall j:Y_j^\ast\in C(X_j^\ast))\ge 1-\alpha_{\mathrm{FWER}}$
  - Split CP at single-point error $\alpha$ gives joint coverage $\ge(1-\alpha)^m$ and $\to(1-\alpha)^m$; use $\alpha=1-(1-\alpha_{\mathrm{FWER}})^{1/m}\approx\alpha_{\mathrm{FWER}}/m$ (near-Bonferroni, asymptotically unavoidable)
- FDR control
  - For outlier tests $H_{0,j}:(X_j^\ast,Y_j^\ast)\sim P$, use $p_j=\dfrac{1+\sum_i\mathbf{1}\{S_i\ge S_j^\ast\}}{n+1}$ and apply Benjamini-Hochberg (BH)
  - Shared-calibration conformal $p$-values are dependent but PRDS (positive dependence), so BH controls FDR at the target level
## Conformal sets aggregation
- Majority vote: $C_{\mathrm{mv}}(x)=\{y:K^{-1}\sum_k\mathbf{1}\{y\in C_k(x)\}>1/2\}$; if each $C_k$ has coverage $\ge1-\alpha$, then $C_{\mathrm{mv}}$ has coverage $\ge1-2\alpha$
- Post-aggregation calibration: build $C_{\mathrm{mv}}(x;\theta)$ from base sets at level $\theta$, calibrate $\hat\theta$ on fresh data via CRC/miscoverage, and recover $\mathbb{P}(Y\in C_{\mathrm{mv}}(X;\hat\theta))\ge1-\alpha$
- CV link: cross-conformal, CV+, and jackknife+ can be viewed as structured aggregation of conformal sets / $p$-values

# Reference: Angelopoulos, A. N., Barber, R. F., & Bates, S. (2024). Theoretical foundations of conformal prediction. arXiv preprint arXiv:2411.11824.
