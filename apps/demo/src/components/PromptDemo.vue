<script setup lang="ts">
import { ref } from "vue";
import { StopCircle } from "lucide-vue-next";
import { promptText, streamingPromptText } from "@built-in-ai/prompt-api";

const errorMessage = ref();
const isLoading = ref(false);

const promptInput = ref("");
const systemPrompt = ref(
  "You are a friendly, helpful assistant specialized in clothing choices."
);
const isStreaming = ref(false);
const isStructured = ref(false);

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

    if (!isStreaming.value && !isStructured.value) {
      output.value = await promptText(
        promptInput.value,
        promptSessionOptions,
        abortController.value.signal
      );
    } else if (isStreaming.value) {
      let result = "";
      for await (const chunk of streamingPromptText(
        promptInput.value,
        promptSessionOptions,
        abortController.value.signal
      )) {
        result += String(chunk);
        output.value = result;
      }
    } else if (isStructured.value) {
      const exampleSchema = {
        type: "object",
        properties: {
          name: { type: "string" },
          age: { type: "number" },
        },
        required: ["name", "age"],
      };
      try {
        const result = await promptText(
          promptInput.value,
          promptSessionOptions,
          abortController.value.signal
        );
        output.value = JSON.stringify(JSON.parse(result), null, 2);
      } catch (err) {
        output.value = "[error] " + (err as Error).message;
      }
    }
    if (!isStructured.value) {
      chatHistory.value.push({ role: "user", content: promptInput.value });
      chatHistory.value.push({
        role: "assistant",
        content: output.value ?? "",
      });
    }
  } catch (error) {
    errorMessage.value = "Error during prompt: " + error;
    console.error("Error during prompt:", error);
  } finally {
    isLoading.value = false;
    abortController.value = undefined;
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
        <label
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
        </label>
      </fieldset>
    </form>
  </section>
</template>
