---
- use AbortController for fetches

# Styling Rules

Use Tailwind utilities.

Avoid:
- inline styles
- magic spacing values
- duplicated utility chains

# Accessibility Rules

Every interactive element must:
- have aria labels
- support keyboard usage
- preserve focus visibility

# File Rules

Keep files:
- focused
- short
- composable

# Query Rules

Queries must:
- be isolated
- typed
- reusable
- indexed-aware

# Search Rules

Search utilities must:
- normalize Arabic text
- normalize diacritics
- support transliteration
- preserve ranking consistency

# AI Rules

AI utilities must:
- enforce citations
- separate prompts from business logic
- support provider abstraction

# Logging Rules

Log:
- meaningful events
- AI failures
- search latency
- retrieval mismatches

Never log:
- sensitive data
- private prompts
- raw credentials

# Import Rules

Prefer:
- absolute imports
- explicit exports
- barrel exports only when justified

# Performance Rules

Avoid:
- unnecessary hydration
- oversized dependencies
- runtime-heavy utilities

# Refactoring Rules

Refactor when:
- duplication appears
- component grows too large
- query logic repeats
- readability declines