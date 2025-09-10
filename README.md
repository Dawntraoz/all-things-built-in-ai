# All Things Built-in AI

> **WIP**: This project is a Work In Progress, created for the talk **"IA en el navegador"** at [MiduConf](https://miduconf.com) as a playground to showcase and explain Chrome's built-in AI APIs directly in the browser.

## Overview

This monorepo demonstrates the use of Chrome's on-device AI APIs, including:

- **Prompt API**: Generate text from prompts, with support for streaming and structured output.
- **Summarizer API**: Summarize text with options for type, length, format, and language.
- **Writer API**: Generate long-form content with customizable tone, format, and length.
- **Rewriter API**: Rewrite text to improve clarity, style, or tone.
- **Translator API**: Detect and translate text between languages.
- **Language Detector API**: Detect the language of a given text.
- **Proofreader API**: Check and correct grammar, spelling, and punctuation, with explanations.

All APIs are wrapped in TypeScript packages and showcased in a Vue 3 demo app.

## Demo App

The `apps/demo` folder contains a Vue 3 + Vite web app that provides interactive playgrounds for each API. Each demo includes:

- Live input/output for each AI API
- Options for streaming, structured output, and customization
- Session history and error handling

## Getting Started

### Prerequisites

- **Chrome Canary** (or a version supporting built-in AI APIs)
- Enable required Chrome flags: open `chrome://flags` and enable all built-in AI API flags
- [pnpm](https://pnpm.io/) installed

### Install & Run

```bash
pnpm install        # Install dependencies
pnpm lint           # Lint all packages
pnpm build          # Build all packages
pnpm --filter demo dev  # Run the demo app
```

### Scripts

```bash
pnpm --filter <package> dev   # Develop a specific package (watch mode)
pnpm build                    # Build all packages
pnpm type-check               # Type check all packages
pnpm lint                     # Lint all packages
pnpm lint:fix                 # Lint and fix all packages
```

## Monorepo Structure

- `apps/demo` — Vue 3 playground for all APIs
- `packages/prompt-api` — Prompt API wrapper
- `packages/summarizer-api` — Summarizer API wrapper
- `packages/writer-api` — Writer API wrapper
- `packages/rewriter-api` — Rewriter API wrapper
- `packages/translator-api` — Translator API wrapper
- `packages/language-detector-api` — Language Detector API wrapper
- `packages/proofreader-api` — Proofreader API wrapper
- `packages/utils` — Shared utilities

## Contributing

PRs and issues are welcome! This project is experimental and evolving. Feel free to open discussions, suggest improvements, or report bugs.

## Resources

- **Official documentation & demos**:

  - [Chrome Built-in AI APIs Documentation](https://developer.chrome.com/docs/ai/built-in)
  - [Chrome Web AI Demos](https://chrome.dev/web-ai-demos)

- **Early Preview Program (EPP)**:

  - [Register for Chrome AI Dev Preview](https://goo.gle/chrome-ai-dev-preview-join)

- **Debugging tools**:

  - `chrome://on-device-internals` — Inspect on-device AI internals
  - `chrome://flags` — Enable/disable experimental features

- **Community & best practices**:
  - [Web Machine Learning Community Group](https://github.com/webmachinelearning)
  - [People + AI Guidebook](https://pair.withgoogle.com/guidebook)

---

Developed and designed by [Alba Silvente (@dawntraoz)](https://dawntraoz.com) for MiduConf 2025.
