export type LanguageDetectorResult = {
  detectedLanguage: string;
  confidence: number;
}[];

/**
 * Checks availability of the Language Detector API and model.
 */
export async function checkLanguageDetectorAvailability(): Promise<{ available: boolean; message: string }> {
  if (!("LanguageDetector" in self)) {
    return { available: false, message: 'Language Detector API is not available in this environment.' };
  }

  const availability = await LanguageDetector.availability();
  if (availability === 'unavailable' || !availability) {
    return { available: false, message: 'Language Detector model is unavailable.' };
  }

  if (availability === 'downloading') {
    return { available: false, message: 'Language Detector model is downloading.' };
  }

  if (availability === 'downloadable') {
    return { available: true, message: 'Language Detector model started downloading, please wait.' };
  }

  return { available: true, message: 'Language Detector model is ready to use.' };
}

let cachedLanguageDetector: any = null;
async function createLanguageDetectorInstance() {
  const status = await checkLanguageDetectorAvailability();
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