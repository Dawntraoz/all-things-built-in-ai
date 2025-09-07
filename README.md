# Built-in AI APIs

PNPM monorepo for Chrome's built-in AI APIs.

> Requirements: Ensure that the necessary Chrome flags for on-device AI are enabled. In a new tab, type `chrome://flags` and search for every built-in AI API name. Make sure it is set to "Enabled.".

## Quick Start

```bash
pnpm install
pnpm lint
pnpm build
```

## Packages

- `@built-in-ai/prompt-api` - Prompt API wrapper
- `@built-in-ai/summarizer-api` - Summarizer API wrapper
- `@built-in-ai/writer-api` - Writer API wrapper
- `@built-in-ai/rewriter-api` - Rewriter API wrapper
- `@built-in-ai/translator-api` - Translator API wrapper
- `@built-in-ai/language-detector-api` - Language Detector API wrapper
- `@built-in-ai/proofreader-api` - Proofreader API wrapper

### Scripts

```bash
pnpm --filter <PACKAGE_WORKING_ON> dev  # Build package while making changes (--watch)
pnpm build                              # Build all packages
pnpm type-check                         # Type check all packages
pnpm lint                               # Lint all packages
pnpm lint:fix                           # Lint and fix all packages
```

## Apps

- `demo` - A Vue web app to showcase all packages
