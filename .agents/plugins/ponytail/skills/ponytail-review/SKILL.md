---
name: ponytail-review
description: Review uncommitted git changes, staged diffs, or proposed code for over-engineering, premature abstractions, speculative features, or dead code against the Ponytail YAGNI Decision Ladder.
---

# Ponytail Code Review: Anti-Overengineering & YAGNI

Use this skill to evaluate code changes against the **YAGNI Decision Ladder**.

## Review Procedure

1. **Inspect Git Diff**:
   - Run `git status` and `git diff` (or `git diff --cached`) to inspect all staged/unstaged changes.
2. **Apply the 7-Rung Ladder**:
   - Check if any new abstractions, utility files, or generic interfaces were created where concrete code was sufficient.
   - Flag any "speculative" code (unused helper parameters, premature generic types, unused methods).
   - Check for unnecessary dependencies or npm/go modules introduced for simple logic.
3. **Generate the Ponytail Review Report**:
   - **Verdict**: PASS / NEEDS SIMPLIFICATION / BLOCKED (Over-engineered)
   - **Speculative Code Detected**: List files, lines, and rationale.
   - **Simplification Recommendations**: Concrete diff or replacement showing direct inline or standard library solutions.
   - **Lines of Code (LOC) Saved**: Estimated LOC reduction by applying Ponytail recommendations.
