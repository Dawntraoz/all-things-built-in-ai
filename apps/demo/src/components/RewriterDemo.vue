<script setup lang="ts">
import { ref } from "vue";
import { StopCircle } from "lucide-vue-next";
import {
  REWRITER_TONES,
  REWRITER_FORMATS,
  REWRITER_LENGTHS,
  REWRITER_DEFAULT_OPTIONS,
  rewriteText,
  streamingRewriteText,
} from "@built-in-ai/rewriter-api";
import type {
  RewriterOptionTone,
  RewriterOptionFormat,
  RewriterOptionLength,
} from "@built-in-ai/rewriter-api";

const input = ref("You are a romantic novelist that rewrites for teenagers.");
const inputContext = ref("");
const output = ref();
const abortController = ref();
const errorMessage = ref();
const isLoading = ref(false);

/**
 * Options for the Rewriter API
 */
const sharedContext = ref("");
const tone = ref<RewriterOptionTone>(REWRITER_DEFAULT_OPTIONS.tone);
const length = ref<RewriterOptionLength>(REWRITER_DEFAULT_OPTIONS.length);
const format = ref<RewriterOptionFormat>(REWRITER_DEFAULT_OPTIONS.format);
const isStreaming = ref(false);

async function handleRewriteText() {
  if (!input.value) return;

  isLoading.value = true;
  errorMessage.value = undefined;
  output.value = undefined;
  abortController.value = new AbortController();

  try {
    const rewriterOptions = {
      sharedContext: sharedContext.value,
      tone: tone.value,
      length: length.value,
      format: format.value,
    };

    if (!isStreaming.value) {
      output.value = await rewriteText(
        input.value ?? "",
        rewriterOptions,
        inputContext.value,
        abortController.value.signal
      );
    } else {
      let result = "";
      for await (const chunk of streamingRewriteText(
        input.value ?? "",
        rewriterOptions,
        inputContext.value,
        abortController.value.signal
      )) {
        result += String(chunk);
        output.value = result; // Update the output as we receive chunks
      }
    }
  } catch (error) {
    errorMessage.value = "Error during rewriting: " + error;
    console.error("Error during rewriting:", error);
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
    <h2 class="text-3xl font-bold text-center">Rewriter API demo</h2>
    <form class="w-full flex gap-6">
      <fieldset class="flex flex-col gap-4 flex-1">
        <div class="flex flex-col gap-3">
          <label for="topic-to-rewrite" class="text-lg text-slate-950">
            Topic to rewrite about
          </label>
          <textarea
            id="topic-to-rewrite"
            rows="2"
            placeholder="Write here the text you want to rewrite..."
            v-model="input"
          ></textarea>
        </div>
        <div class="flex flex-col gap-3">
          <label for="rewriter-context" class="text-lg text-slate-950">
            Context
          </label>
          <textarea id="rewriter-context" rows="1" v-model="inputContext" />
        </div>
        <div class="flex items-center gap-4">
          <button
            @click="handleRewriteText"
            :disabled="isLoading"
            class="w-fit bg-blue-600 text-white font-medium rounded-full px-6 py-1 disabled:bg-slate-200"
          >
            {{ isLoading ? "Rewriting..." : "Rewrite" }}
          </button>
          <button v-if="isLoading" @click="abortWriting">
            <StopCircle color="#076EFF" :size="32" stroke-width="1.5" />
          </button>
        </div>
        <div class="flex flex-col gap-2 py-4 border-t border-slate-100">
          <h3 class="text-lg text-slate-950">Rewritten text</h3>
          <p v-if="output" class="text-slate-500">{{ output }}</p>
          <p v-else-if="isLoading" class="text-blue-500">Rewriting...</p>
          <p v-else-if="errorMessage" class="text-red-500">
            An error occurred during rewriting: {{ errorMessage }}
          </p>
          <p v-else class="text-slate-400">
            Here's where your rewritten text will appear...
          </p>
        </div>
      </fieldset>
      <fieldset
        class="w-56 bg-white border border-slate-200 rounded-lg p-4 flex flex-col gap-2"
      >
        <legend class="px-2">Options</legend>
        <div class="flex flex-col gap-2">
          <label for="rewriter-shared-context">Shared context</label>
          <textarea
            id="rewriter-shared-context"
            rows="3"
            v-model="sharedContext"
          />
        </div>
        <div class="flex flex-col gap-2">
          <label for="rewriter-tone">Tone</label>
          <select id="rewriter-tone" v-model="tone">
            <option v-for="tone in REWRITER_TONES" :key="tone" :value="tone">
              {{ tone }}
            </option>
          </select>
        </div>
        <div class="flex flex-col gap-2">
          <label for="rewriter-length">Length</label>
          <select id="rewriter-length" v-model="length">
            <option
              v-for="length in REWRITER_LENGTHS"
              :key="length"
              :value="length"
            >
              {{ length }}
            </option>
          </select>
        </div>
        <div class="flex flex-col gap-2">
          <label for="rewriter-format">Format</label>
          <select id="rewriter-format" v-model="format">
            <option
              v-for="format in REWRITER_FORMATS"
              :key="format"
              :value="format"
            >
              {{ format }}
            </option>
          </select>
        </div>
        <div class="py-2">
          <label
            for="streaming-rewriter"
            class="flex items-center justify-between cursor-pointer"
          >
            <input
              id="streaming-rewriter"
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
