import { checkAvailability } from "@built-in-ai/utils";

/**
 * Writer API detailed options and response types
 */
export type WriterOptionTone = 'formal' | 'neutral' | 'casual';
export type WriterOptionFormat = 'markdown' | 'plain-text';
export type WriterOptionLength = 'short' | 'medium' | 'long';
export type WriterOptions = Partial<{
  sharedContext: string;
  tone: WriterOptionTone;
  format: WriterOptionFormat;
  length: WriterOptionLength;
}>;
export type WriterResult = string;

/**
 * Writer API Options defaults
 */
export const WRITER_TONES: WriterOptionTone[] = ['formal', 'neutral', 'casual'];
export const WRITER_FORMATS: WriterOptionFormat[] = ['markdown', 'plain-text'];
export const WRITER_LENGTHS: WriterOptionLength[] = ['short', 'medium', 'long'];
export const WRITER_DEFAULT_OPTIONS = {
  tone: 'neutral' as WriterOptionTone,
  format: 'plain-text' as WriterOptionFormat,
  length: 'short' as WriterOptionLength,
};

const cachedWriter: Record<string, typeof Writer> = {};
async function createWriterInstance(options: WriterOptions) {
  const status = await checkAvailability('Writer');
  if (!status.available) {
    throw new Error(status.message);
  }

  const modelKey = JSON.stringify(options)
  if (!cachedWriter[modelKey]) {
    cachedWriter[modelKey] = await Writer.create({
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
 * Writes a text based on the provided input using the Writer API (Batch mode).
 */
export async function writeText(text: string, options: WriterOptions, context?: string, signal?: AbortSignal): Promise<WriterResult> {
  await createWriterInstance(options);

  return await cachedWriter[JSON.stringify(options)].write(text, { context, signal });
}

/**
 * Writes a text based on the provided input using the Writer API (Streaming mode).
 * Returns an async generator that yields chunks of the write result.
 */
export async function* streamingWriteText(text: string, options: WriterOptions, context?: string, signal?: AbortSignal) {
  await createWriterInstance(options);

  const stream = cachedWriter[JSON.stringify(options)].writeStreaming(text, { context, signal });
  for await (const chunk of stream) {
    yield chunk;
  }
}
