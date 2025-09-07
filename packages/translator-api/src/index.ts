export type TranslatorOptions = {
  sourceLanguage: string;
  targetLanguage: string;
};
export type TranslatorResult = string;

export const SUPPORTED_LANGUAGES = ["en", "es", "fr", "de", "zh", "ja"];

/**
 * Checks availability of the Language Detector API and model.
 */
export async function checkTranslatorAvailability(options: TranslatorOptions): Promise<{ available: boolean; message: string }> {
  const { sourceLanguage, targetLanguage } = options;

  if (!("Translator" in self)) {
    return { available: false, message: 'Translator API is not available in this environment.' };
  }

  const availability = await Translator.availability({ sourceLanguage, targetLanguage });
  if (availability === 'unavailable' || !availability) {
    return { available: false, message: 'Translator model is unavailable.' };
  }

  if (availability === 'downloading') {
    return { available: false, message: 'Translator model is downloading.' };
  }

  if (availability === 'downloadable') {
    return { available: true, message: 'Translator model started downloading, please wait.' };
  }

  return { available: true, message: 'Translator model is ready to use.' };
}

const cachedTranslator: Record<string, any> = {};
async function createTranslatorInstance(options: TranslatorOptions) {
  const status = await checkTranslatorAvailability(options);
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
 * Returns a ReadableStream of the translation result.
 */
export async function streamingTranslateText(
  text: string,
  options: TranslatorOptions
): Promise<ReadableStream<TranslatorResult>> {
  await createTranslatorInstance(options);

  return await cachedTranslator[JSON.stringify(options)].translateStreaming(text);
}