import { checkAvailability } from '@built-in-ai/utils';

export type LanguageDetectorResult = {
  detectedLanguage: string;
  confidence: number;
}[];

let cachedLanguageDetector: typeof LanguageDetector;
async function createLanguageDetectorInstance() {
  const status = await checkAvailability('LanguageDetector');
  if (!status.available) {
    throw new Error(status.message);
  }

  if (!cachedLanguageDetector) {
    cachedLanguageDetector = await LanguageDetector.create({
      monitor(m: EventTarget) {
        m.addEventListener('downloadprogress', (event) => {
          const progressEvent = event as ProgressEvent;
          console.log(`Download progress LanguageDetector model: ${progressEvent.loaded * 100}%`);
        });
      }
    });
  }
}

/**
 * Detects the language of the provided text using the Language Detector API.
 */
export async function detectLanguage(text: string): Promise<LanguageDetectorResult> {
  await createLanguageDetectorInstance();

  return await cachedLanguageDetector.detect(text);
}