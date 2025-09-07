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
const summary = ref<string | null>(null);
const errorMessage = ref<string | null>(null);
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
const isStreaming = ref(false);

async function summarize() {
  if (!text.value) return;
  isLoading.value = true;
  errorMessage.value = null;
  summary.value = null;
  try {
    if (!isStreaming.value) {
      summary.value = await summarizeText(text.value ?? "", {
        sharedContext: sharedContext.value,
        type: type.value,
        length: length.value,
        format: format.value,
      });
    } else {
      const stream = await streamingSummarizeText(text.value ?? "", {
        sharedContext: sharedContext.value,
        type: type.value,
        length: length.value,
        format: format.value,
      });
      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let result = "";
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          // If value is a string, convert to Uint8Array; otherwise, decode directly
          if (typeof value === "string") {
            const uint8Value = new TextEncoder().encode(value);
            result += decoder.decode(uint8Value);
          } else {
            result += decoder.decode(value);
          }
          summary.value = result; // Update the summary as we receive chunks
        }
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
  <section class="flex flex-col items-center">
    <h2 class="uppercase text-xl font-semibold py-4">
      Built-in AI Summarizer capabilities demo
    </h2>
    <form class="w-full flex gap-6">
      <p v-if="errorMessage">{{ errorMessage }}</p>
      <fieldset class="flex flex-col gap-4 flex-1">
        <div class="flex flex-col gap-3">
          <label
            for="text-to-summarize"
            class="block text-lg font-medium text-gray-900"
          >
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
          <label for="context" class="block text-lg font-medium text-gray-900">
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
        <div class="flex flex-col gap-2 py-4 border-t border-slate-200">
          <h3 class="text-lg font-medium text-gray-900">Generated summary</h3>
          <p v-if="summary">{{ summary }}</p>
        </div>
      </fieldset>
      <fieldset
        class="w-56 border border-slate-200 rounded-lg p-4 flex flex-col gap-2"
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
        <div class="flex items-center gap-2 py-2">
          <input
            type="checkbox"
            id="streaming-summarize"
            class="accent-blue-600 w-4 h-4 bg-slate-50 border-slate-100 rounded-sm focus:ring-2 focus:ring-blue-500"
            v-model="isStreaming"
          />
          <label for="streaming-summarize" class="ms-2 text-gray-900"
            >Streaming</label
          >
        </div>
      </fieldset>
    </form>
  </section>
</template>
