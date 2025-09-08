
import { checkAvailability } from "@built-in-ai/utils";

export type PromptSessionOptions = Partial<{
  initialPrompts: { role: string; content: string }[];
  temperature: number;
  topK: number;
  signal: AbortSignal;
}>;
export type PromptResult = string;

const cachedPrompt: Record<string, typeof LanguageModel> = {};
async function createPromptInstance(options: PromptSessionOptions = {}): Promise<void> {
  const status = await checkAvailability("LanguageModel");
  if (!status.available) {
    throw new Error(status.message);
  }
  const modelKey = JSON.stringify(options);
  if (!cachedPrompt[modelKey]) {
    cachedPrompt[modelKey] = await LanguageModel.create({
      ...options,
      monitor(m: EventTarget) {
        m.addEventListener("downloadprogress", (event) => {
          const progressEvent = event as ProgressEvent;
          console.log(`Download progress: ${progressEvent.loaded * 100}% of ${modelKey}`);
        });
      },
    });
  }
}

export async function promptText(input: string, options: PromptSessionOptions, signal?: AbortSignal): Promise<PromptResult> {
  await createPromptInstance(options);

  return await cachedPrompt[JSON.stringify(options)].prompt(input, { signal });
}

export async function* streamingPromptText(input: string, options: PromptSessionOptions, signal?: AbortSignal) {
  await createPromptInstance(options);

  const stream = cachedPrompt[JSON.stringify(options)].promptStreaming(input, { signal });
  for await (const chunk of stream) {
    yield chunk;
  }
}

// -------------
// @ToDo: 1. Add structured prompt support (responseConstraint), 2. Multimodal capabilities, 3. Clone a session, 4. Terminate a session
// -------------