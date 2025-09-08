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
      let result = "";
      for await (const chunk of streamingTranslateText(inputText.value, {
        sourceLanguage: detectedLanguage.value,
        targetLanguage: targetLanguage.value,
      })) {
        result += String(chunk);
        translatedText.value = result;
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
  <section class="flex flex-col items-center gap-6">
    <h2 class="text-3xl font-bold text-center">
      Language Detector & Translator API demo
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
          <label for="text-to-translate" class="text-lg text-slate-950">
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
          {{ isLoading ? "Translating..." : "Translate text" }}
        </button>

        <div class="flex items-center gap-2 pt-4 border-t border-slate-200">
          <h3 class="text-lg text-slate-950">Detected Language</h3>
          <p v-if="detectedLanguage" class="text-slate-500">
            {{ detectedLanguage }}
          </p>
          <p v-else class="text-slate-400">
            Here's where your detected language will appear...
          </p>
        </div>

        <div>
          <h3 class="text-lg text-slate-950">Translated Text</h3>
          <p v-if="translatedText" class="text-slate-500">
            {{ translatedText }}
          </p>
          <p v-else class="text-slate-400">
            Here's where your translated text will appear...
          </p>
        </div>
      </fieldset>

      <fieldset
        class="w-56 bg-white border border-slate-200 rounded-lg p-4 flex flex-col gap-2"
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

        <div class="py-2">
          <label
            for="streaming-translate"
            class="flex items-center justify-between cursor-pointer"
          >
            <input
              id="streaming-translate"
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
