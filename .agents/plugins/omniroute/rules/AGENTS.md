# OmniRoute AI Gateway & Model Routing Rules

When configuring, routing, or dispatching AI requests through OmniRoute:
1. **Model Specialization Matching**:
   - **Architecture & System Design**: Prefer high-reasoning models (Claude 3.7 Sonnet / Opus, GPT-4o, Gemini 2.5 Pro).
   - **Fast Edits & Quick Lookups**: Route to high-throughput flash models (Gemini 2.5 Flash, Claude 3.5 Haiku, GPT-4o-mini).
   - **Local / Sensitive Data**: Route to local endpoints (Ollama, LM Studio, vLLM) when offline or privacy-mandated.
2. **Auto-Fallback Chains**:
   - Always verify fallback paths when primary providers experience rate-limiting (429) or outages (5xx).
   - Fallback order: Primary Provider -> Secondary Fast Provider -> Local Failover.
3. **Context Optimization**:
   - Leverage Caveman and RTK token compression for large contexts.
   - Use `omniroute simulate` to preview routing decisions before dispatching production loads.
