---
name: code-review
description: Rigorous Staff-level code review focusing on correctness, Go & TypeScript idioms, strict typing, error handling, race conditions, memory/goroutine leaks, and test coverage.
---

# Staff Engineer Code Review Runbook

Use this skill to conduct rigorous, production-grade code reviews across Go and TypeScript/React codebases.

## Code Quality Standards

### 1. TypeScript & React
- **Strict Typing**: No `any` types allowed. Use strict interfaces, explicit union types, and generics where appropriate.
- **Component Hygiene**: Functional components and hooks only.
- **Hook Dependencies**: Verify exhaustive dependencies in `useEffect`, `useCallback`, and `useMemo`. Prevent stale closures and infinite re-render loops.
- **State Management**: Keep state as local as possible. Leverage lightweight stores (Zustand) or server-state caching for cross-cutting data.

### 2. Go (Golang)
- **Idiomatic Error Handling**: Always check errors explicitly (`if err != nil`). Wrap errors with context (`fmt.Errorf("failed to fetch order: %w", err)`). Never discard errors silently (`_ = ...`).
- **Context Propagation**: Pass `ctx context.Context` as the first argument in all network, database, and long-running operations. Respect cancellation (`ctx.Done()`).
- **Concurrency Safety**: Protect shared mutable state with appropriate synchronization primitives (`sync.Mutex`, `sync.RWMutex`, atomic counters, or channels). Prevent goroutine leaks by ensuring worker goroutines have exit conditions.
- **Resource Management**: Always clean up resources using `defer` (e.g., `defer rows.Close()`, `defer resp.Body.Close()`).

### 3. API & Data Access Hygiene
- **Database Query Efficiency**: Avoid N+1 queries. Use batch lookups (`$in` or `WHERE id IN (...)`) and projection to fetch only needed fields.
- **HTTP Status Codes**: Return semantic status codes (`200 OK`, `201 Created`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `409 Conflict`, `500 Internal Error`).
- **Validation**: Validate all incoming payloads at the boundary using schema validators.

### 4. Code Review Output Format
- **Summary**: Overview of changes and overall architecture score (1-10).
- **Critical Defects**: Bugs, security issues, or race conditions that MUST be resolved before merge.
- **Improvements**: Performance, readability, typing, or styling enhancements.
- **Praise**: Well-architected patterns or clever simplifications.
