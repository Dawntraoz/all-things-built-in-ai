<script setup lang="ts">
import { ref } from "vue";
import { StopCircle } from "lucide-vue-next";
import {
  WRITER_TONES,
  WRITER_FORMATS,
  WRITER_LENGTHS,
  WRITER_DEFAULT_OPTIONS,
  writeText,
  streamingWriteText,
} from "@built-in-ai/writer-api";
import type {
  WriterOptionTone,
  WriterOptionFormat,
  WriterOptionLength,
} from "@built-in-ai/writer-api";

const input = ref("A RomCom synopsis.");
const inputContext = ref("Set in a utopian future.");
const output = ref();
const abortController = ref();
const errorMessage = ref();
const isLoading = ref(false);

/**
 * Options for the Writer API
 */
const sharedContext = ref(
  "I'm a storyteller specializing in heartfelt romances, crafted specifically for young hearts."
);
const tone = ref<WriterOptionTone>(WRITER_DEFAULT_OPTIONS.tone);
const length = ref<WriterOptionLength>(WRITER_DEFAULT_OPTIONS.length);
const format = ref<WriterOptionFormat>(WRITER_DEFAULT_OPTIONS.format);
const isStreaming = ref(false);

async function handleWriteText() {
  if (!input.value) return;

  isLoading.value = true;
  errorMessage.value = undefined;
  output.value = undefined;
  abortController.value = new AbortController();

  try {
    const writerOptions = {
      sharedContext: sharedContext.value,
      tone: tone.value,
      length: length.value,
      format: format.value,
    };

    if (!isStreaming.value) {
      output.value = await writeText(
        input.value ?? "",
        writerOptions,
        inputContext.value,
        abortController.value.signal
      );
    } else {
      let result = "";
      for await (const chunk of streamingWriteText(
        input.value ?? "",
        writerOptions,
        inputContext.value,
        abortController.value.signal
      )) {
        result += String(chunk);
        output.value = result; // Update the output as we receive chunks
      }
    }
  } catch (error) {
    errorMessage.value = "Error during writing: " + error;
    console.error("Error during writing:", error);
  } finally {
    isLoading.value = false;
    abortController.value = undefined;
  }
}

function abortWriting() {
  if (abortController.value) {
    abortController.value.abort();
  }
}
</script>
<template>
  <section class="flex flex-col items-center gap-6">
    <h2 class="text-3xl font-bold text-center">Writer API demo</h2>
    <form class="w-full flex gap-6">
      <fieldset class="flex flex-col gap-4 flex-1">
        <div class="flex flex-col gap-3">
          <label for="topic-to-write" class="text-lg text-slate-950">
            Topic to write about
          </label>
          <textarea
            id="topic-to-write"
            rows="2"
            placeholder="What do you want to write about?"
            v-model="input"
          ></textarea>
        </div>
        <div class="flex flex-col gap-3">
          <label for="writer-context" class="text-lg text-slate-950">
            Context
          </label>
          <textarea id="writer-context" rows="1" v-model="inputContext" />
        </div>
        <div class="flex items-center gap-4">
          <button
            @click="handleWriteText"
            :disabled="isLoading"
            class="w-fit bg-blue-600 text-white font-medium rounded-full px-6 py-1 disabled:bg-slate-200"
          >
            {{ isLoading ? "Writing..." : "Write" }}
          </button>
          <button v-if="isLoading" @click="abortWriting">
            <StopCircle color="#076EFF" :size="32" stroke-width="1.5" />
          </button>
        </div>
        <div class="flex flex-col gap-2 py-4 border-t border-slate-100">
          <h3 class="text-lg text-slate-950">Generated text</h3>
          <p v-if="output" class="text-slate-500">{{ output }}</p>
          <p v-else-if="isLoading" class="text-blue-500">Writing...</p>
          <p v-else-if="errorMessage" class="text-red-500">
            An error occurred during writing: {{ errorMessage }}
          </p>
          <p v-else class="text-slate-400">
            Here's where your generated text will appear...
          </p>
        </div>
      </fieldset>
      <fieldset
        class="w-56 bg-white border border-slate-200 rounded-lg p-4 flex flex-col gap-2"
      >
        <legend class="px-2">Options</legend>
        <div class="flex flex-col gap-2">
          <label for="writer-shared-context">Shared context</label>
          <textarea
            id="writer-shared-context"
            rows="3"
            v-model="sharedContext"
          />
        </div>
        <div class="flex flex-col gap-2">
          <label for="writer-tone">Tone</label>
          <select id="writer-tone" v-model="tone">
            <option v-for="tone in WRITER_TONES" :key="tone" :value="tone">
              {{ tone }}
            </option>
          </select>
        </div>
        <div class="flex flex-col gap-2">
          <label for="writer-length">Length</label>
          <select id="writer-length" v-model="length">
            <option
              v-for="length in WRITER_LENGTHS"
              :key="length"
              :value="length"
            >
              {{ length }}
            </option>
          </select>
        </div>
        <div class="flex flex-col gap-2">
          <label for="writer-format">Format</label>
          <select id="writer-format" v-model="format">
            <option
              v-for="format in WRITER_FORMATS"
              :key="format"
              :value="format"
            >
              {{ format }}
            </option>
          </select>
        </div>
        <div class="py-2">
          <label
            for="streaming-writer"
            class="flex items-center justify-between cursor-pointer"
          >
            <input
              id="streaming-writer"
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
