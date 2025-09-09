<script setup lang="ts">
import { ref } from "vue";
import {
  SUMMARIZER_TYPES,
  SUMMARIZER_FORMATS,
  SUMMARIZER_LENGTHS,
  SUMMARIZER_DEFAULT_OPTIONS,
  summarizeText,
  streamingSummarizeText,
} from "@built-in-ai/summarizer-api";
import type {
  SummarizerOptionType,
  SummarizerOptionFormat,
  SummarizerOptionLength,
} from "@built-in-ai/summarizer-api";

const text = ref(
  `These documents collectively outline Chrome's built-in AI capabilities, specifically focusing on various client-side Web APIs powered by Gemini Nano. They detail the Prompt API for general language model interactions, including multimodal input (images, audio), and the Writing Assistance APIs (Writer, Rewriter, Summarizer, Proofreader) for content creation and refinement. Additionally, the Translation APIs (Translator, Language Detector) enable multilingual experiences directly within the browser. The sources emphasise best practices for developers, covering aspects such as session management, efficient rendering of streamed responses, caching AI models, and debugging techniques, while also addressing security concerns and promoting a hybrid AI approach with server-side fallbacks like Firebase AI Logic.`
);
const summary = ref();
const errorMessage = ref();
const isLoading = ref(false);

/**
 * Options for the Summarizer API
 */
const sharedContext = ref(
  "Explain clearly and concisely to a general audience."
);
const type = ref<SummarizerOptionType>(SUMMARIZER_DEFAULT_OPTIONS.type);
const length = ref<SummarizerOptionLength>(SUMMARIZER_DEFAULT_OPTIONS.length);
const format = ref<SummarizerOptionFormat>(SUMMARIZER_DEFAULT_OPTIONS.format);
const expectedInputLanguages = ref(
  SUMMARIZER_DEFAULT_OPTIONS.expectedInputLanguages.join(", ")
);
const outputLanguage = ref(SUMMARIZER_DEFAULT_OPTIONS.outputLanguage);
const isStreaming = ref(false);

async function summarize() {
  if (!text.value) return;

  isLoading.value = true;
  errorMessage.value = undefined;
  summary.value = undefined;

  try {
    const summarizerOptions = {
      sharedContext: sharedContext.value,
      type: type.value,
      length: length.value,
      format: format.value,
      expectedInputLanguages: expectedInputLanguages.value
        ? expectedInputLanguages.value.split(",").map((lang) => lang.trim())
        : [],
      outputLanguage: outputLanguage.value,
    };
    if (!isStreaming.value) {
      summary.value = await summarizeText(text.value ?? "", summarizerOptions);
    } else {
      let result = "";
      for await (const chunk of streamingSummarizeText(
        text.value ?? "",
        summarizerOptions
      )) {
        result += String(chunk);
        summary.value = result; // Update the summary as we receive chunks
      }
    }
  } catch (error) {
    errorMessage.value = "Error during summarization: " + error;
    console.error("Error during summarization:", error);
  } finally {
    isLoading.value = false;
  }
}
</script>
<template>
  <section class="flex flex-col items-center gap-6">
    <h2 class="text-3xl font-bold text-center">Summarizer API demo</h2>
    <form class="w-full flex gap-6">
      <fieldset class="flex flex-col gap-4 flex-1">
        <div class="flex flex-col gap-3">
          <label for="text-to-summarize" class="text-lg text-slate-950">
            Text to summarize
          </label>
          <textarea
            id="text-to-summarize"
            rows="6"
            placeholder="Write your thoughts here..."
            v-model="text"
          ></textarea>
        </div>
        <div class="flex flex-col gap-3">
          <label for="context" class="text-lg text-slate-950">
            Shared context
          </label>
          <textarea id="context" rows="2" v-model="sharedContext" />
        </div>
        <button
          @click="summarize"
          :disabled="isLoading"
          class="w-fit bg-blue-600 text-white font-medium rounded-full px-6 py-1 disabled:bg-slate-200"
        >
          {{ isLoading ? "Summarizing..." : "Summarize" }}
        </button>
        <div class="flex flex-col gap-2 py-4 border-t border-slate-100">
          <h3 class="text-lg text-slate-950">Generated summary</h3>
          <p v-if="summary" class="text-slate-500">{{ summary }}</p>
          <p v-else-if="isLoading" class="text-blue-500">Summarizing...</p>
          <p v-else-if="errorMessage" class="text-red-500">
            An error occurred during summarization: {{ errorMessage }}
          </p>
          <p v-else class="text-slate-400">
            Here's where your summary will appear...
          </p>
        </div>
      </fieldset>
      <fieldset
        class="w-56 bg-white border border-slate-200 rounded-lg p-4 flex flex-col gap-2"
      >
        <legend class="px-2">Options</legend>
        <div class="flex flex-col gap-2">
          <label for="summarizer-type">Type</label>
          <select id="summarizer-type" v-model="type">
            <option v-for="type in SUMMARIZER_TYPES" :key="type" :value="type">
              {{ type }}
            </option>
          </select>
        </div>
        <div class="flex flex-col gap-2">
          <label for="summarizer-length">Length</label>
          <select id="summarizer-length" v-model="length">
            <option
              v-for="length in SUMMARIZER_LENGTHS"
              :key="length"
              :value="length"
            >
              {{ length }}
            </option>
          </select>
        </div>
        <div class="flex flex-col gap-2">
          <label for="summarizer-format">Format</label>
          <select id="summarizer-format" v-model="format">
            <option
              v-for="format in SUMMARIZER_FORMATS"
              :key="format"
              :value="format"
            >
              {{ format }}
            </option>
          </select>
        </div>
        <div class="flex flex-col gap-2">
          <label for="summarizer-expected-languages">Expected languages</label>
          <input
            id="summarizer-expected-languages"
            type="text"
            v-model="expectedInputLanguages"
          />
        </div>
        <div class="flex flex-col gap-2">
          <label for="summarizer-output-language">Output language</label>
          <input
            id="summarizer-output-language"
            type="text"
            v-model="outputLanguage"
          />
        </div>
        <div class="py-2">
          <label
            for="streaming-summarize"
            class="flex items-center justify-between cursor-pointer"
          >
            <input
              id="streaming-summarize"
              type="checkbox"
              v-model="isStreaming"
              class="sr-only peer"
            />
            <div
              class="relative w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"
            ></div>
            <span class="ms-3 text-slate-950">streaming</span>
          </label>
        </div>
      </fieldset>
    </form>
  </section>
</template>
