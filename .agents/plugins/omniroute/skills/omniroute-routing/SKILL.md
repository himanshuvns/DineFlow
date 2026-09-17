---
name: omniroute-routing
description: Configure model routing policies, fallback chains, and token compression rules in OmniRoute.
---

# OmniRoute Model Routing & Fallback Chains

Use this skill to configure routing policies and resilience mechanisms.

## Procedures

1. **Configure Fallback Chains**:
   - Inspect resilience: `omniroute resilience`
   - Set fallback priority across providers (e.g., Anthropic -> Google -> OpenAI -> Local).
2. **Context Compression**:
   - Configure context engineering pipeline: `omniroute context-eng`
   - Inspect compression ratios: `omniroute compression`
3. **Cost & Usage Tracking**:
   - Generate cost summary: `omniroute cost`
   - Review token usage: `omniroute usage`
