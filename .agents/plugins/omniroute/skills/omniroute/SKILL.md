---
name: omniroute
description: Manage the OmniRoute AI gateway, inspect server status, provider connections, health, and latency benchmarks.
---

# OmniRoute AI Gateway Management

Use this skill to inspect, configure, and operate the OmniRoute AI gateway.

## Diagnostic & Status Procedures

1. **Verify Health & Environment**:
   - Check status: `omniroute status`
   - Run system diagnostic: `omniroute doctor`
   - Check server health: `omniroute health`
2. **Inspect Providers & Models**:
   - List connected providers: `omniroute providers`
   - List active models: `omniroute models`
3. **Simulate Routing**:
   - Dry-run a prompt: `omniroute simulate "Your prompt here"`
