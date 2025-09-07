<script setup lang="ts">
import { ref } from "vue";
import { detectLanguage } from "@built-in-ai/language-detector-api";
import type { LanguageDetectorResult } from "@built-in-ai/language-detector-api";
import {
  SUPPORTED_LANGUAGES,
  translateText,
  streamingTranslateText,
} from "@built-in-ai/translator-api";

const inputText = ref("Bonjour tout le monde");
const errorMessage = ref<string | undefined>();
const isLoading = ref(false);
const detectedLanguage = ref<string | undefined>();
const translatedText = ref<string | undefined>();

const targetLanguage = ref("en");
const isStreaming = ref(false);

async function handleTranslateLanguage() {
  isLoading.value = true;
  errorMessage.value = undefined;
  detectedLanguage.value = undefined;
  translatedText.value = undefined;

  try {
    const detectionResult: LanguageDetectorResult = await detectLanguage(
      inputText.value
    );
    detectedLanguage.value = detectionResult[0].detectedLanguage;

    if (!isStreaming.value) {
      translatedText.value = await translateText(inputText.value, {
        sourceLanguage: detectedLanguage.value,
        targetLanguage: targetLanguage.value,
      });
    } else {
      const stream = await streamingTranslateText(inputText.value, {
        sourceLanguage: detectedLanguage.value,
        targetLanguage: targetLanguage.value,
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
          translatedText.value = result;
        }
      }
    }
  } catch (error) {
    errorMessage.value = "Error detecting or translating language: " + error;
    console.error("Error detecting or translating language:", error);
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <section class="flex flex-col items-center">
    <h2 class="uppercase text-xl font-semibold py-4">
      Built-in AI Language Detector & Translator demo
    </h2>

    <form class="w-full flex gap-6">
      <fieldset class="flex flex-col gap-4 flex-1">
        <p
          v-if="errorMessage"
          class="text-red-500 text-sm bg-red-50 rounded-md p-2"
        >
          {{ errorMessage }}
        </p>
        <div class="flex flex-col gap-3">
          <label
            for="text-to-translate"
            class="block text-lg font-medium text-gray-900"
          >
            Text to translate
          </label>
          <textarea
            id="text-to-translate"
            rows="4"
            placeholder="Type the text to detect language and translate here..."
            v-model="inputText"
          ></textarea>
        </div>

        <button
          @click="handleTranslateLanguage"
          :disabled="isLoading"
          class="w-fit bg-blue-600 text-white font-medium rounded-full px-6 py-1 disabled:bg-slate-200"
        >
          {{ isLoading ? "Translating..." : "Translate Text" }}
        </button>

        <div class="flex items-center gap-2 pt-4 border-t border-slate-200">
          <h3 class="text-lg font-medium text-gray-900">Detected Language</h3>
          <p v-if="detectedLanguage">{{ detectedLanguage }}</p>
        </div>

        <div>
          <h3 class="text-lg font-medium text-gray-900">Translated Text</h3>
          <p v-if="translatedText">{{ translatedText }}</p>
        </div>
      </fieldset>

      <fieldset
        class="w-56 border border-slate-200 rounded-lg p-4 flex flex-col gap-2"
      >
        <legend class="px-2">Options</legend>

        <div class="flex flex-col gap-2">
          <label for="translator-target-language">Target language</label>
          <select id="translator-target-language" v-model="targetLanguage">
            <option
              v-for="language in SUPPORTED_LANGUAGES"
              :key="language"
              :value="language"
            >
              {{ language }}
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
