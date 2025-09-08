import { checkAvailability } from '@built-in-ai/utils';

/**
 * Summarizer API detailed options and response types
 */
export type SummarizerOptionType = 'key-points' | 'tldr' | 'teaser' | 'headline';
export type SummarizerOptionFormat = 'markdown' | 'plain-text';
export type SummarizerOptionLength = 'short' | 'medium' | 'long';
export type SummarizerOptions = Partial<{
  sharedContext: string;
  type: SummarizerOptionType;
  format: SummarizerOptionFormat;
  length: SummarizerOptionLength;
}>;
export type SummarizerResult = string;

/**
 * Summarizer API Options defaults
 */
export const SUMMARIZER_TYPES: SummarizerOptionType[] = ['key-points', 'tldr', 'teaser', 'headline'];
export const SUMMARIZER_FORMATS: SummarizerOptionFormat[] = ['markdown', 'plain-text'];
export const SUMMARIZER_LENGTHS: SummarizerOptionLength[] = ['short', 'medium', 'long'];
export const SUMMARIZER_DEFAULT_OPTIONS = {
  type: 'tldr' as SummarizerOptionType,
  format: 'plain-text' as SummarizerOptionFormat,
  length: 'short' as SummarizerOptionLength,
};

const cachedSummarizer: Record<string, typeof Summarizer> = {};
async function createSummarizerInstance(options: SummarizerOptions) {
  const status = await checkAvailability('Summarizer');
  if (!status.available) {
    throw new Error(status.message);
  }

  const modelKey = JSON.stringify(options)
  if (!cachedSummarizer[modelKey]) {
    cachedSummarizer[modelKey] = await Summarizer.create({
      ...options,
      monitor(m: EventTarget) {
        m.addEventListener('downloadprogress', (event) => {
          const progressEvent = event as ProgressEvent;
          console.log(`Download progress: ${progressEvent.loaded * 100}% of ${modelKey}`);
        });
      }
    });
  }
}

/**
 * Summarizes the provided text using the Summarizer API (Batch mode).
 */
export async function summarizeText(text: string, options: SummarizerOptions, context?: string): Promise<SummarizerResult> {
  await createSummarizerInstance(options);

  return await cachedSummarizer[JSON.stringify(options)].summarize(text, { context });
}

/**
 * Summarizes the provided text using the Summarizer API (Streaming mode).
 * Returns an async generator that yields chunks of the summary result.
 */
export async function* streamingSummarizeText(
  text: string,
  options: SummarizerOptions,
  context?: string) {
  await createSummarizerInstance(options);

  const stream = cachedSummarizer[JSON.stringify(options)].summarizeStreaming(text, { context });
  for await (const chunk of stream) {
    yield chunk;
  }
}