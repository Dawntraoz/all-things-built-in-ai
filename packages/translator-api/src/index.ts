import { checkAvailability } from '@built-in-ai/utils';

export type TranslatorOptions = {
  sourceLanguage: string;
  targetLanguage: string;
};
export type TranslatorResult = string;

export const SUPPORTED_LANGUAGES = ["en", "es", "fr", "de", "zh", "ja"];

const cachedTranslator: Record<string, typeof Translator> = {};
async function createTranslatorInstance(options: TranslatorOptions) {
  const status = await checkAvailability('Translator', options);
  if (!status.available) {
    throw new Error(status.message);
  }

  const modelKey = JSON.stringify(options);
  if (!cachedTranslator[modelKey]) {
    cachedTranslator[modelKey] = await Translator.create({
      ...options,
      monitor(m: EventTarget) {
        m.addEventListener('downloadprogress', (event) => {
          const progressEvent = event as ProgressEvent;
          console.log(`Download progress Translator model: ${progressEvent.loaded * 100}%`);
        });
      }
    });
  }
}

/**
 * Translates the provided text using the Translator API (Batch mode).
 */
export async function translateText(text: string, options: TranslatorOptions): Promise<TranslatorResult> {
  await createTranslatorInstance(options);

  return await cachedTranslator[JSON.stringify(options)].translate(text);
}

/**
 * Translates the provided text using the Translator API (Streaming mode).
 * Returns an async generator that yields chunks of the translation result.
 */
export async function* streamingTranslateText(
  text: string,
  options: TranslatorOptions
) {
  await createTranslatorInstance(options);

  const stream = cachedTranslator[JSON.stringify(options)].translateStreaming(text);
  for await (const chunk of stream) {
    yield chunk;
  }
}