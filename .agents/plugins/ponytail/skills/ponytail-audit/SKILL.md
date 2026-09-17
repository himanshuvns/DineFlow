---
name: ponytail-audit
description: Perform a deep audit of the repository to identify bloated abstractions, single-use helper utilities, over-complicated architectures, and unnecessary dependencies.
---

# Ponytail Codebase Audit

Use this skill to systematically scan the codebase for structural over-engineering.

## Audit Workflow

1. **Scan Directory Structure**:
   - Look for bloated `utils/`, `helpers/`, `shared/` directories with single-use files.
   - Check for empty or near-empty interface declarations.
2. **Analyze Dependency Tree**:
   - Check `package.json` and `go.mod` for dependencies that duplicate native capabilities (e.g. `is-odd`, `left-pad`, trivial string mappers, excessive Lodash imports when ES6 methods exist).
3. **Assess Complexity**:
   - Identify multi-layered indirection (e.g. Controller -> Service -> Manager -> Helper -> Repository for a simple 1-table CRUD).
4. **Produce Findings & Action Plan**:
   - List high-value pruning targets.
   - Provide concrete refactoring steps to reduce cognitive overhead and build size.
