---
name: ponytail
description: Configure Ponytail enforcement intensity (lite, full, ultra) and display current anti-overengineering guardrails.
---

# Ponytail Configuration & Status

Controls the active enforcement profile for Ponytail anti-overengineering rules.

## Available Profiles

- `lite`: Advisory warnings only. Ideal when exploring rapid prototypes or spike experiments.
- `full`: Standard strict YAGNI enforcement. Rejects speculative wrappers and requires standard library preference. (Default)
- `ultra`: Ruthless minimalism. Rejects any non-essential file creation, requires inline implementations for single-use logic, strict zero-tolerance on unused props or arguments.

## Usage

Specify the desired intensity level:
- `/ponytail lite`
- `/ponytail full`
- `/ponytail ultra`
