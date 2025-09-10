<script setup lang="ts">
import { ref } from "vue";
import { StopCircle } from "lucide-vue-next";
import { promptText, streamingPromptText } from "@built-in-ai/prompt-api";
import type { PromptInput } from "@built-in-ai/prompt-api";

const errorMessage = ref();
const isLoading = ref(false);

const promptInput = ref(
  "How can I dress appropietly for the kind of audience shown in the picture below:"
);
const promptImage = ref();
const systemPrompt = ref(
  "You are a friendly, helpful assistant specialized in clothing choices."
);
const isStreaming = ref(false);
// const isStructured = ref(false);

const isOpenHistory = ref(false);

const chatHistory = ref<{ role: string; content: string }[]>([]);
const output = ref();
const abortController = ref();

async function runPrompt() {
  isLoading.value = true;
  errorMessage.value = undefined;
  output.value = undefined;
  abortController.value = new AbortController();

  try {
    const promptSessionOptions = {
      initialPrompts: [{ role: "system", content: systemPrompt.value }],
    };
    const multimodalPromptInput: PromptInput[] = [
      {
        role: "user",
        content: [
          {
            type: "text",
            value: promptInput.value,
          },
        ],
      },
    ];

    if (promptImage.value) {
      multimodalPromptInput[0].content.push({
        type: "image",
        value: promptImage.value,
      });
    }

    if (!isStreaming.value) {
      output.value = await promptText(
        multimodalPromptInput,
        promptSessionOptions,
        abortController.value.signal
      );
    } else if (isStreaming.value) {
      let result = "";
      for await (const chunk of streamingPromptText(
        multimodalPromptInput,
        promptSessionOptions,
        abortController.value.signal
      )) {
        result += String(chunk);
        output.value = result;
      }
    }

    chatHistory.value.push({ role: "user", content: promptInput.value });
    chatHistory.value.push({
      role: "assistant",
      content: output.value ?? "",
    });
  } catch (error) {
    errorMessage.value = "Error during prompt: " + error;
    console.error("Error during prompt:", error);
  } finally {
    isLoading.value = false;
    abortController.value = undefined;
  }
}

function handlePromptImage(event: Event) {
  const files = (event.target as HTMLInputElement).files;
  if (files && files.length > 0) {
    promptImage.value = files[0];
  } else {
    promptImage.value = undefined;
  }
}

function abortPrompting() {
  if (abortController.value) {
    abortController.value.abort();
  }
}
</script>

<template>
  <section class="flex flex-col items-center gap-6">
    <h2 class="text-3xl font-bold text-center">Prompt API demo</h2>
    <form class="w-full flex gap-6" @submit.prevent="runPrompt">
      <fieldset class="flex flex-col gap-4 flex-1">
        <p
          v-if="errorMessage"
          class="text-red-500 text-sm bg-red-50 rounded-md p-2"
        >
          {{ errorMessage }}
        </p>
        <div class="flex flex-col gap-3">
          <label for="prompt-input" class="text-lg text-slate-950">
            Prompt input
          </label>
          <textarea
            id="prompt-input"
            rows="3"
            placeholder="Enter prompt or messages (string or JSON array)"
            v-model="promptInput"
          ></textarea>
        </div>
        <div class="flex flex-col gap-2">
          <label for="prompt-image" class="text-lg text-slate-950 pb-1">
            Add an image (optional)
          </label>
          <input
            id="prompt-image"
            type="file"
            accept="image/*"
            class="text-slate-950 border border-slate-300 rounded-lg file:cursor-pointer bg-slate-50 focus:outline-none file:bg-slate-950 file:text-slate-50 file:p-2"
            aria-describedby="prompt-image-helper"
            @change="handlePromptImage"
          />
          <p id="prompt-image-helper" class="text-slate-500">
            Upload an image to include it in the prompt input.
          </p>
        </div>
        <div class="flex flex-col gap-3">
          <label for="system-prompt" class="text-lg text-slate-950">
            System prompt
          </label>
          <textarea id="system-prompt" rows="2" v-model="systemPrompt" />
        </div>
        <div class="flex items-center gap-4">
          <button
            @click="runPrompt"
            :disabled="isLoading"
            class="w-fit bg-blue-600 text-white font-medium rounded-full px-6 py-1 disabled:bg-slate-200"
          >
            {{ isLoading ? "Running..." : "Run Prompt" }}
          </button>
          <button v-if="isLoading" @click="abortPrompting">
            <StopCircle color="#076EFF" :size="32" stroke-width="1.5" />
          </button>
        </div>
        <div v-if="chatHistory.length" class="w-full max-w-2xl mt-4">
          <h3
            class="text-lg text-slate-950"
            @click="isOpenHistory = !isOpenHistory"
          >
            Chat / Session History
          </h3>
          <div v-if="isOpenHistory" class="flex flex-col gap-2">
            <div v-for="(m, i) in chatHistory" :key="i">
              <em>{{ m.role }}:</em> {{ m.content }}
            </div>
          </div>
        </div>
        <div class="flex flex-col gap-2 py-4 border-t border-slate-100">
          <h3 class="text-lg text-slate-950">Generated output</h3>
          <p v-if="output" class="text-slate-500 whitespace-pre-line">
            {{ output }}
          </p>
          <p v-else class="text-slate-400">
            Here's where your output will appear...
          </p>
        </div>
      </fieldset>
      <fieldset
        class="w-56 bg-white border border-slate-200 rounded-lg p-4 flex flex-col gap-2"
      >
        <legend class="px-2">Options</legend>
        <label
          for="streaming-prompt"
          class="flex items-center justify-between cursor-pointer"
        >
          <input
            id="streaming-prompt"
            type="checkbox"
            v-model="isStreaming"
            class="sr-only peer"
          />
          <div
            class="relative w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"
          ></div>
          <span class="ms-3 text-slate-950">streaming</span>
        </label>
        <!-- <label
          for="structured-prompt"
          class="flex items-center justify-between cursor-pointer"
        >
          <input
            id="structured-prompt"
            type="checkbox"
            v-model="isStructured"
            class="sr-only peer"
          />
          <div
            class="flex-1 relative w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"
          ></div>
          <span class="ms-3 text-slate-950 truncate"
            >structured (JSON Schema)</span
          >
        </label> -->
      </fieldset>
    </form>
  </section>
</template>
