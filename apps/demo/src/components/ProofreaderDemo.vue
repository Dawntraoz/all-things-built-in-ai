<script setup lang="ts">
import { ref } from "vue";
import { proofreadText } from "@built-in-ai/proofreader-api";
import type {
  ProofreaderOptions,
  ProofreadResult,
} from "@built-in-ai/proofreader-api";

const input = ref("helo wrld. i am a develoepr.");
const output = ref<ProofreadResult>();
const errorMessage = ref();
const isLoading = ref(false);

/**
 * Options for the Proofreader API
 */
const includeCorrectionTypes = ref(false);
const includeCorrectionExplanations = ref(false);
const expectedInputLanguagues = ref("en");
const correctionExplanationLanguage = ref("en");

async function handleProofreadText() {
  if (!input.value) return;

  isLoading.value = true;
  errorMessage.value = undefined;
  output.value = undefined;

  const options: ProofreaderOptions = {
    includeCorrectionTypes: includeCorrectionTypes.value,
    includeCorrectionExplanations: includeCorrectionExplanations.value,
    expectedInputLanguagues: expectedInputLanguagues.value
      ? [expectedInputLanguagues.value]
      : [],
    correctionExplanationLanguage: correctionExplanationLanguage.value,
  };

  try {
    output.value = await proofreadText(input.value ?? "", options);
  } catch (error) {
    errorMessage.value = "Error during proofreading: " + error;
    console.error("Error during proofreading:", error);
  } finally {
    isLoading.value = false;
  }
}
</script>
<template>
  <section class="flex flex-col items-center gap-6">
    <h2 class="text-3xl font-bold text-center">Proofreader API demo</h2>
    <form class="w-full flex gap-6">
      <fieldset class="flex flex-col gap-4 flex-1">
        <p
          v-if="errorMessage"
          class="text-red-500 text-sm bg-red-50 rounded-md p-2"
        >
          {{ errorMessage }}
        </p>
        <div class="flex flex-col gap-3">
          <label for="text-to-proofread" class="text-lg text-slate-950">
            Text to proofread
          </label>
          <textarea
            id="text-to-proofread"
            rows="4"
            placeholder="Enter text with some mistakes..."
            v-model="input"
          ></textarea>
        </div>
        <button
          @click.prevent="handleProofreadText"
          :disabled="isLoading"
          class="w-fit bg-blue-600 text-white font-medium rounded-full px-6 py-1 disabled:bg-slate-200"
        >
          {{ isLoading ? "Proofreading..." : "Proofread" }}
        </button>
        <div
          v-if="output"
          class="flex flex-col gap-2 py-4 border-t border-slate-100"
        >
          <h3 class="text-lg text-slate-950">Corrected text</h3>
          <p class="text-slate-500">{{ output.corrected }}</p>
          <div v-if="output.corrections && output.corrections.length > 0">
            <h4 class="text-md text-slate-950 mt-2">Corrections:</h4>
            <ul class="list-disc list-inside text-slate-500">
              <li
                v-for="(correction, index) in output.corrections"
                :key="index"
              >
                "{{
                  input.substring(correction.startIndex, correction.endIndex)
                }}" → "{{ correction.correction }}"
                <span v-if="correction.type"> ({{ correction.type }})</span>
                <em v-if="correction.explanation">
                  - {{ correction.explanation }}</em
                >
              </li>
            </ul>
          </div>
        </div>
        <div v-else class="flex flex-col gap-2 py-4 border-t border-slate-100">
          <h3 class="text-lg text-slate-950">Corrected text</h3>
          <p class="text-slate-400">
            Here's where your corrected text will appear...
          </p>
        </div>
      </fieldset>
      <fieldset
        class="w-72 bg-white border border-slate-200 rounded-lg p-4 flex flex-col gap-4"
      >
        <legend class="px-2">Options</legend>
        <div class="flex flex-col gap-2">
          <label for="proofreader-expected-lang">Expected language</label>
          <input
            id="proofreader-expected-lang"
            type="text"
            v-model="expectedInputLanguagues"
          />
        </div>
        <div class="flex flex-col gap-2">
          <label for="proofreader-explanation-lang"
            >Correction explanation language</label
          >
          <input
            id="proofreader-explanation-lang"
            type="text"
            v-model="correctionExplanationLanguage"
          />
        </div>
        <div class="py-2 flex flex-col gap-2">
          <label
            for="include-correction-types"
            class="flex items-center justify-between cursor-pointer"
          >
            <span class="text-slate-950">Include correction types</span>
            <input
              id="include-correction-types"
              type="checkbox"
              v-model="includeCorrectionTypes"
              class="sr-only peer"
            />
            <div
              class="relative w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"
            ></div>
          </label>
          <label
            for="include-correction-explanations"
            class="flex items-center justify-between cursor-pointer"
          >
            <span class="text-slate-950">Include correction explanations</span>
            <input
              id="include-correction-explanations"
              type="checkbox"
              v-model="includeCorrectionExplanations"
              class="sr-only peer"
            />
            <div
              class="relative w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"
            ></div>
          </label>
        </div>
      </fieldset>
    </form>
  </section>
</template>
