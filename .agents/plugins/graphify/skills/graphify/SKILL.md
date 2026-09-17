---
name: graphify
description: Build, inspect, or visualize the codebase knowledge graph, generating graph.html, graph.json, and GRAPH_REPORT.md in graphify-out/.
---

# Graphify Knowledge Graph Generation

Use this skill to extract and analyze structural relationships across the project.

## Workflow

1. **Extract Code Structure**:
   - Run `graphify extract . --code-only` to extract AST nodes and dependency edges locally.
2. **Cluster & Summarize**:
   - Run `graphify cluster-only .` to detect Leiden communities, calculate degree centralities, identify "god nodes", and write `graphify-out/GRAPH_REPORT.md`.
3. **Generate Visualizations**:
   - Run `graphify export html --graph graphify-out/graph.json` to produce `graphify-out/graph.html`.
4. **Review Report**:
   - Inspect `graphify-out/GRAPH_REPORT.md` for architectural community clusters, call hierarchies, and suggested inquiry vectors.
