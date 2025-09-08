import { checkAvailability } from '@built-in-ai/utils';

/**
 * Rewriter API detailed options and response types
 */
export type RewriterOptionTone = 'more-formal' | 'as-is' | 'more-casual';
export type RewriterOptionFormat = 'as-is' | 'markdown' | 'plain-text';
export type RewriterOptionLength = 'shorter' | 'as-is' | 'longer';
export type RewriterOptions = Partial<{
  sharedContext: string;
  tone: RewriterOptionTone;
  format: RewriterOptionFormat;
  length: RewriterOptionLength;
}>;
export type RewriterResult = string;

/**
 * Rewriter API Options defaults
 */
export const REWRITER_TONES: RewriterOptionTone[] = ['more-formal', 'as-is', 'more-casual'];
export const REWRITER_FORMATS: RewriterOptionFormat[] = ['as-is', 'markdown', 'plain-text'];
export const REWRITER_LENGTHS: RewriterOptionLength[] = ['shorter', 'as-is', 'longer'];
export const REWRITER_DEFAULT_OPTIONS = {
  tone: 'as-is' as RewriterOptionTone,
  format: 'as-is' as RewriterOptionFormat,
  length: 'as-is' as RewriterOptionLength,
};

const cachedRewriter: Record<string, typeof Rewriter> = {};
async function createRewriterInstance(options: RewriterOptions) {
  const status = await checkAvailability('Rewriter');
  if (!status.available) {
    throw new Error(status.message);
  }

  const modelKey = JSON.stringify(options)
  if (!cachedRewriter[modelKey]) {
    cachedRewriter[modelKey] = await Rewriter.create({
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
 * Rewrites a text based on the provided input using the Rewriter API (Batch mode).
 */
export async function rewriteText(text: string, options: RewriterOptions, context?: string, signal?: AbortSignal): Promise<RewriterResult> {
  await createRewriterInstance(options);

  return await cachedRewriter[JSON.stringify(options)].rewrite(text, { context, signal });
}

/**
 * Rewrites a text based on the provided input using the Rewriter API (Streaming mode).
 * Returns an async generator that yields chunks of the rewrite result.
 */
export async function* streamingRewriteText(text: string, options: RewriterOptions, context?: string, signal?: AbortSignal) {
  await createRewriterInstance(options);

  const stream = cachedRewriter[JSON.stringify(options)].rewriteStreaming(text, { context, signal });
  for await (const chunk of stream) {
    yield chunk;
  }
}
