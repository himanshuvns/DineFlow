# Graphify Codebase Knowledge Graph Guidelines

When working in this repository:
1. **Always Check Knowledge Graph**: Check `graphify-out/GRAPH_REPORT.md` before making broad architectural assumptions or asking exploratory questions about the codebase structure.
2. **God Nodes**: Respect the high-degree hubs identified in the graph report. Modifications to these nodes have wide blast radii.
3. **Graph Synchronization**: Whenever significant structural changes or refactors are made (new routes, domain services, or models), run `graphify update .` to keep `graphify-out/` synchronized.
4. **Token Conservation**: Use the pre-computed graph to inspect caller-callee relations and community clusters instead of running expensive full-repo searches.
