import { checkAvailability } from '@built-in-ai/utils';

// Based on its WIP specification: https://github.com/webmachinelearning/proofreader-api
export type ProofreaderOptions = Partial<{
  includeCorrectionTypes: boolean; // whether to include the type of each correction (e.g., spelling, grammar, etc.)
  includeCorrectionExplanations: boolean; // whether to include a brief explanation for each correction
  expectedInputLanguagues: string[]; // list of expected input languages
  correctionExplanationLanguage: string; // language for correction explanations
}>;

const cachedProofreader: Record<string, typeof Proofreader> = {};
async function createProofreaderInstance(options: ProofreaderOptions) {
  const status = await checkAvailability('Proofreader');
  if (!status.available) {
    throw new Error(status.message);
  }

  const modelKey = JSON.stringify(options)
  if (!cachedProofreader[modelKey]) {
    cachedProofreader[modelKey] = await Proofreader.create({
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
 * Proofreads a text input using the Proofreader API (Batch mode).
 */
export type CorrectionType = 'spelling' | 'punctuation' | 'capitalization' | 'preposition' | 'missing-words' | 'grammar';
export type ProofreadCorrection = {
  startIndex: number;
  endIndex: number;
  correction: string;
  type?: CorrectionType; // exists if proofreader.includeCorrectionTypes === true
  explanation?: string; // exists if proofreader.includeCorrectionExplanations === true
}
export type ProofreadResult = {
  corrected: string;
  corrections: ProofreadCorrection[];
}

/**
 * Proofreads a text input using the Proofreader API (Batch mode).
 * @param text The text to proofread.
 * @param options The options to customize the proofreader behavior.
 * @returns The proofread result.
 */
export async function proofreadText(text: string, options: ProofreaderOptions): Promise<ProofreadResult> {
  await createProofreaderInstance(options);

  return await cachedProofreader[JSON.stringify(options)].proofread(text);
}
