---
name: graphify-update
description: Incrementally update the graphify knowledge graph after editing or creating code files.
---

# Graphify Incremental Update

Use this skill to update only modified files in the knowledge graph without rebuilding from scratch.

## Procedure

- Run `graphify update .`
- Verify updated counts in `graphify-out/manifest.json` and `graphify-out/GRAPH_REPORT.md`.
