# Built-in AI APIs in Chrome: Overview for AI Agent

This document provides comprehensive information about Chrome's built-in AI APIs, designed to assist an AI agent in understanding and generating code examples for various use cases.

## 1. Introduction to Built-in AI

**Built-in AI** refers to web platform APIs and browser features that utilise AI models, expert models, and Large Language Models (LLMs) directly within the browser. This allows websites and web applications to perform AI-powered tasks **without needing to deploy, manage, or self-host AI models** . Chrome implements these APIs with **Gemini Nano** and expert models .

### 1.1 Benefits of Built-in AI (Client-Side AI)

Running AI models client-side offers significant advantages :
*   **Privacy and Security**: Data processing occurs locally on the user's device, meaning **sensitive data never needs to leave the user's browser**. This enables AI features with end-to-end encryption .
*   **Snappy User Experience**: Eliminating server round trips can provide **near-instant results** and fast response times, independent of network conditions .
*   **Cost Savings**: The browser distributes and manages the models, removing the responsibility and associated costs for developers related to downloading, updating, storage eviction, runtime memory, and serving costs . APIs are often **free to use** .
*   **Hardware Acceleration**: The browser's AI runtime is optimised for available hardware (GPU, NPU, CPU), ensuring **best performance on each device** .
*   **Offline AI Usage**: Users can access AI features even **without an internet connection** once the model is downloaded .
*   **Ease of Development**: Built-in AI simplifies development by providing **readily available JavaScript APIs**, requiring no specific machine learning expertise .

## 2. General API Usage and Requirements

### 2.1 Underlying Model: Gemini Nano

Many built-in AI APIs in Chrome, including the Prompt, Summarizer, Writer, and Rewriter APIs, utilise **Gemini Nano** for inference . Gemini Nano is a generative AI model .

### 2.2 Hardware Requirements

To use built-in AI APIs that leverage Gemini Nano (Prompt, Summarizer, Writer, Rewriter), the following conditions must be met :
*   **Operating System**: Windows 10 or 11, macOS 13+ (Ventura and onwards), or Linux. **Chrome for Android, iOS, and ChromeOS are currently not supported** .
*   **Storage**: At least **22 GB of free space** on the volume containing your Chrome profile. The model is removed if free space falls below 10 GB .
*   **GPU**: Strictly **more than 4 GB of VRAM** .
*   **Network**: Unlimited data or an unmetered connection for initial model download .

The Translator and Language Detector APIs work on Chrome for desktop and **do not work on mobile devices** .

### 2.3 Model Download and Availability

*   **On-demand download**: APIs are built into Chrome, but the models (like Gemini Nano or expert models) are **downloaded separately the first time a user or origin interacts with the API** .
*   **Availability check**: Use `API.availability()` (e.g., `LanguageModel.availability()`, `Summarizer.availability()`) to check if an API is ready. It returns:
    *   `"unavailable"`: Device/options not supported .
    *   `"downloadable"`: Download needed to create a session; user activation may be required .
    *   `"downloading"`: Download is in progress .
    *   `"available"`: Session can be created immediately .
*   **User activation**: A **transient user interaction** (e.g., click, tap, key press) is required to trigger model download and start a session with `create()` if it's the user's first encounter with the API .
*   **Creating a session**: Call `API.create()` (e.g., `LanguageModel.create()`, `Summarizer.create()`) to instantiate the API and potentially trigger a download .
*   **Monitoring download progress**: It's best practice to **listen for `downloadprogress` events** to inform the user, as the download can take time .

### 2.4 Debugging

*   For debugging built-in AI APIs using Gemini Nano, visit `chrome://on-device-internals` in Chrome .
*   Check the **"Event Logs"** tab for debug information and potential error messages .

## 3. Specific Built-in AI APIs and Use Cases

### 3.1 Prompt API

The **Prompt API** (exposed as `LanguageModel`) allows developers to send **natural language requests to Gemini Nano** in Chrome . It offers **free-form LLM access** .

*   **Availability**: In origin trial for Chrome Extensions and testable behind a flag for the web . Available from Chrome 138 stable for Chrome Extensions .
*   **Input Types**: Supports **text, audio, and image inputs** (multimodal capabilities available for local prototyping for EPP participants, or Chrome 138 Canary for audio/image) . Returns text output .
*   **Core Functions**:
    *   `LanguageModel.create()`: Creates a session with the LLM .
    *   `session.prompt()`: Sends a prompt and waits for the full response .
    *   `session.promptStreaming()`: Sends a prompt and receives response in chunks (ReadableStream) .
*   **Session Customisation**:
    *   **Initial Prompts**: Provide context about previous interactions (e.g., system roles, user/assistant dialogue) to resume stored sessions or set behaviour .
    *   **Parameters**: `topK` and `temperature` can be customised at session creation for creative control. Default values can be retrieved via `LanguageModel.params()` .
    *   **Response Constraints (Structured Output)**: Specify a **JSON Schema** to ensure the model's response is valid JSON, making outputs predictable . Available from Chrome 137 .
*   **Session Management**:
    *   **Cloning Sessions**: Create new independent conversations that inherit parameters and history from a main session, useful for "what if" scenarios .
    *   **Restoring Past Sessions**: Store session history (e.g., in local storage) and use `initialPrompts` to restore conversations after browser restarts .
    *   **Preserving Quota**: Monitor `inputQuota` and `inputUsage`. Allow users to stop prompts with `AbortController` to preserve context window limits .
    *   **Removing Unused Sessions**: Call `session.destroy()` to free memory. Keeping one empty session alive uses limited memory and keeps the model ready .
    *   **Appending Messages**: Use `session.append()` to add contextual prompts after session creation, especially for multimodal inputs, to populate the session in advance .
*   **Use Cases**:
    *   **Enhance blogging**: Generate titles, headings, subsequent paragraphs, and improve text .
    *   **AI-powered search**: Answer questions based on web page content .
    *   **Personalised news feeds**: Dynamically classify articles with categories .
    *   **Chatbots**: Build classic chatbots or customer relationship management systems .
    *   **Image description/Alt text**: Describe image contents for captions or alt text .
    *   **Audio transcription**: Transcribe audio messages in chat applications or podcasts .
    *   **Data extraction**: Extract information from images (e.g., handwritten recipes) .
    *   **Character sheets**: Generate structured output like TOML character sheets .

### 3.2 Summarizer API

The **Summarizer API** helps generate summaries of information in various lengths and formats .

*   **Availability**: Available from Chrome 138 stable .
*   **Core Functions**:
    *   `Summarizer.create()`: Creates a summarizer instance .
    *   `summarizer.summarize()`: Generates a batch (non-streaming) summary .
    *   `summarizer.summarizeStreaming()`: Generates a streaming summary .
*   **Customisation**:
    *   `type`: `key-points` (default), `tldr`, `teaser`, `headline` .
    *   `format`: `markdown` (default), `plain-text` .
    *   `length`: `short`, `medium` (default), `long` .
    *   `sharedContext`: Additional context for the summarizer .
*   **Handling Large Texts (Summary of Summaries technique)**:
    *   For content exceeding the context window, split the input content into smaller chunks (e.g., using `Recursive Text Splitter` from LangChain.js) .
    *   Summarise each part independently, concatenate the outputs, and then summarise the concatenated text into a final summary . This can be recursive for very long texts .
    *   Note: Recursive summarisation can lead to less accurate summaries and slower performance with many repetitions .
*   **Use Cases**:
    *   **Article summaries**: Distill lengthy articles, generate titles/headings for articles, create teasers .
    *   **Meeting/support transcript overviews**: Summarise key points .
    *   **Product review summaries**: Condense multiple reviews, highlight pros/cons, personalise summaries based on user preferences .
    *   **Forum question summaries**: Help experts find relevant questions .

### 3.3 Translator API

The **Translator API** translates text between languages using AI models provided in the browser .

*   **Availability**: Available from Chrome 138 stable .
*   **Core Functions**:
    *   `Translator.create()`: Creates a translator instance for a `sourceLanguage` and `targetLanguage` . Uses BCP 47 language short codes .
    *   `translator.translate()`: Translates text .
    *   `translator.translateStreaming()`: Translates text in a streaming fashion for longer texts .
*   **Language Packs**: Translation is managed with **language packs, downloaded on demand** . `Translator.availability()` reports all language pairs as `downloadable` until a translator is created for a given pair .
*   **Use Cases**:
    *   **Multilingual customer support**: Translate user requests and agent responses in real-time in chat systems .
    *   **Social network applications**: On-demand translation of posts .
    *   **Article translation**: Translate articles for market insights .
    *   **Dynamic subtitle translation**: Translate subtitles for streaming platforms .

### 3.4 Language Detector API

The **Language Detector API** identifies the language of input text .

*   **Availability**: Available from Chrome 138 stable .
*   **Core Functions**:
    *   `LanguageDetector.create()`: Creates a language detector instance .
    *   `detector.detect()`: Detects the language of a given text, returning a ranked list of `{detectedLanguage, confidence}` objects .
*   **Ranking Model**: Uses a ranking model to determine language probability .
*   **Use Cases**:
    *   **Identify source language for translation**: Often paired with the Translator API .
    *   **Load correct models**: For language-specific tasks like toxicity detection .
    *   **Labeling texts**: Improve screen reader pronunciation in social networks .
    *   **Adjust app interface**: Based on user's language .

### 3.5 Writer API

The **Writer API** helps generate new content that conforms to a specified writing task .

*   **Availability**: In origin trial (Chrome 137 to 142) .
*   **Core Functions**:
    *   `Writer.create()`: Configures a new writer object .
    *   `writer.write()`: Generates non-streaming output .
    *   `writer.writeStreaming()`: Generates streaming output .
*   **Customisation**:
    *   `tone`: `formal`, `neutral` (default), `casual` .
    *   `format`: `markdown` (default), `plain-text` .
    *   `length`: `short`, `medium` (default), `long` .
    *   `sharedContext`: Context for multiple writing tasks .
*   **Use Cases**:
    *   **Drafting content**: Reviews, blog posts, emails, support requests, introductions for work samples .
    *   **Blogging assistance**: Drafting subsequent paragraphs for blog posts .

### 3.6 Rewriter API

The **Rewriter API** helps revise and restructure existing text .

*   **Availability**: In origin trial (Chrome 137 to 142) .
*   **Core Functions**:
    *   `Rewriter.create()`: Configures a new rewriter object .
    *   `rewriter.rewrite()`: Generates non-streaming output .
    *   `rewriter.rewriteStreaming()`: Generates streaming output .
*   **Customisation**:
    *   `tone`: `more-formal`, `as-is` (default), `more-casual` .
    *   `format`: `as-is` (default), `markdown`, `plain-text` .
    *   `length`: `shorter`, `as-is` (default), `longer` .
    *   `sharedContext`: Context for multiple rewriting tasks .
*   **Use Cases**:
    *   **Refine existing text**: Make it longer/shorter, change tone (e.g., from short to polite/formal email) .
    *   **Improve customer reviews**: Suggest edits to remove toxicity or clarify feedback .
    *   **Format content**: Adapt content for specific audiences .

### 3.7 Proofreader API (Experimental)

The **Proofreader API** provides interactive proofreading for spelling, punctuation, capitalization, prepositions, missing words, and general grammar issues .
*   **Availability**: Available from Chrome 139 Canary for Early Preview Program participants . Testable behind a flag in Chrome 139 or 140 .

## 4. Hybrid AI Approach

A **hybrid AI approach** combines client-side (built-in) AI with server-side AI .
*   **Rationale**: The built-in Prompt API has limited support (Windows, macOS, Linux, Chrome Extensions only) and hardware requirements may not always be met . A hybrid approach ensures a seamless experience for all users regardless of platform or hardware .
*   **Implementation**: Use client-side AI when available and **fall back to cloud-based solutions** (e.g., Firebase AI Logic, Gemini API) when client-side is not supported or accessible .
*   **Considerations**:
    *   **Privacy**: Inform users about data processing location when falling back to the cloud .
    *   **Complexity**: Specific use cases are easier on-device; complex ones may require server-side .
    *   **Resiliency**: Use server-side by default, on-device when offline or spotty connection .
    *   **Graceful Fallback**: Offer server-side AI for users with older/less powerful devices or unsupported browsers/OS .

## 5. Caching AI Models

Explicitly caching model data on-device is crucial for faster future launches and improved user experience .
*   **Recommended Method**: **Cache API** provides persistent storage for Request and Response objects and is generally recommended for optimal performance .
*   **Alternative Methods**:
    *   **Origin Private File System (OPFS) API**: Provides highly optimised, private storage for files .
    *   **IndexedDB API**: Well-established for storing arbitrary persistent data .
*   **Performance Note**: OPFS and IndexedDB require data serialization, and IndexedDB also requires deserialization, making them less performant for large models than the Cache API .
*   **Persistence**: Use `navigator.storage.persist()` to request persistent storage, preventing the browser from clearing models under storage pressure . The Storage Buckets API can also be used for this .
*   **Security**: Once stored on the client, models are trivial to extract (e.g., via DevTools). Storing encrypted versions is only slightly harder as the key must reach the client .
*   **HTTP Cache Headers**: Configure `Cache-Control: public, max-age=31536000, immutable` for static model resources for long-term caching .

## 6. General Best Practices for Built-in AI

*   **Graceful Fallbacks**: Design features with fallbacks to server-side AI for unsupported devices or browsers . Benchmark on target devices .
*   **Specific Use Cases**: Client-side AI works best for targeted use cases, as models are smaller than server-side counterparts. Use pre/post-processing to enhance results from smaller models .
*   **Strategic Downloads**: Models can be large. Ensure the feature is useful and have a responsible serving and caching strategy .
*   **Friendly UI**:
    *   Implement a **progress bar or spinner** for model downloads and response delays .
    *   Provide **transparency and consent** for model downloads and data processing, especially when using hybrid approaches .
    *   Allow users to **edit AI-generated content** or ratings, and make it clear when content is automated .
*   **Content Preparation**: Remove unnecessary data (e.g., HTML markup) from input text for summarisation .
*   **Token Limits**: Be aware of API token limits (`inputQuota`, `inputUsage`, `measureInputUsage()`). Implement strategies like "summary of summaries" or use smaller input samples if limits are exceeded .
*   **Security for Markdown Rendering**: When rendering streamed Markdown, use a **DOM sanitizer** (e.g., DOMPurify) and a **streaming Markdown parser** (e.g., streaming-markdown) to prevent XSS attacks and improve performance .
*   **Permission Policy**: APIs are generally available to top-level windows and same-origin iframes. Access can be delegated to cross-origin iframes using the `allow` attribute in Permission Policy (e.g., `allow="language-model"`, `allow="summarizer"`, `allow="translator"`, `allow="rewriter"`, `allow="writer"`) .
*   **Web Workers**: Currently, most built-in AI APIs are **not available in Web Workers** .

## 7. Specific API Documentation & Resources:
*   **Prompt API**:
    *   The Prompt API: `https://developer.chrome.com/docs/ai/prompt-api`
    *   Best practices for session management with the Prompt API: `https://developer.chrome.com/docs/ai/session-management`
    *   Structured output support for the Prompt API: `https://developer.chrome.com/docs/ai/structured-output-for-prompt-api`
    *   Debug Gemini Nano: `https://developer.chrome.com/docs/ai/debug-gemini-nano`
*   **Summarizer API**:
    *   Summarize with built-in AI: `https://developer.chrome.com/docs/ai/summarizer-api`
    *   Scale client-side summarization in small context windows: `https://developer.chrome.com/docs/ai/scale-summarization`
*   **Writer API**:
    *   Writer API: `https://developer.chrome.com/docs/ai/writer-api`
*   **Rewriter API**:
    *   Rewriter API: `https://developer.chrome.com/docs/ai/rewriter-api`
*   **Translator API**:
    *   Client-side translation with AI: `https://developer.chrome.com/docs/ai/translate-on-device`
    *   Translation with built-in AI: `https://developer.chrome.com/docs/ai/translator-api`
*   **Language Detector API**:
    *   Language detection with built-in AI: `https://developer.chrome.com/docs/ai/language-detection`
*   **Proofreader API**:
    *   Proofreader API is available from Chrome 139 Canary for local experimentation: `https://developer.chrome.com/docs/ai/built-in-apis#proofreader_api`
