---
name: ponytail-debt
description: Track and catalog architectural technical debt created by over-engineering, speculative generalization, and dead abstractions across the project.
---

# Ponytail Technical Debt Analysis

Use this skill to identify, quantify, and prioritize technical debt rooted in over-engineering.

## Debt Detection Categories

1. **Speculative Generality**: Classes, interfaces, or functions designed for hypothesized future requirements that were never implemented.
2. **Indirection Inflation**: Code paths with excessive call depth where no real transformation or security boundary is enforced.
3. **Dead Weight**: Unreferenced export symbols, zombie configuration fields, and unused types.
4. **Dependency Bloat**: Third-party packages that increase supply chain surface area for marginal utility.

## Actionable Output

- Categorized debt ledger with file paths and line references.
- Estimated maintenance cost and cognitive load.
- Safe deprecation and removal steps.
