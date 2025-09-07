<script setup lang="ts">
import { ref, useTemplateRef } from "vue";
import { onClickOutside } from "@vueuse/core";
import {
  FileText,
  Languages,
  FlaskConical,
  PencilLine,
  BadgeCheck,
  RefreshCcw,
  Expand,
  Minimize2,
} from "lucide-vue-next";

import SummarizerDemo from "./components/SummarizerDemo.vue";
import TranslatorDemo from "./components/TranslatorDemo.vue";

const builtInAiApis = {
  summarizer: {
    name: "Summarizer API",
    description: "Summarize any text into a concise summary.",
    icon: FileText,
    component: SummarizerDemo,
  },
  translator: {
    name: "Language Detector & Translator API",
    description:
      "Translate text between different languages, by detecting the language first.",
    icon: Languages,
    component: TranslatorDemo,
  },
  prompt: {
    name: "Prompt API",
    description: "Generate text based on a given prompt.",
    icon: FlaskConical,
    component: null,
  },
  writer: {
    name: "Writer API",
    description: "Generate long-form content based on a given topic.",
    icon: PencilLine,
    component: null,
  },
  rewriter: {
    name: "Rewriter API",
    description: "Rewrite text to improve clarity, style, or tone.",
    icon: RefreshCcw,
    component: null,
  },
  proofreader: {
    name: "Proofreader API",
    description: "Check text for grammar, spelling, and punctuation errors.",
    icon: BadgeCheck,
    component: null,
  },
};

const isDemoOpen = ref(false);
const selectedDemo = ref<string | null>(null);

function openDemo(key: string) {
  isDemoOpen.value = true;
  selectedDemo.value = key;
}

const modal = useTemplateRef<HTMLElement>("modal");
onClickOutside(modal, (event) => (isDemoOpen.value = false));
</script>

<template>
  <main class="app-container">
    <header>
      <h1 class="font-bold text-6xl text-slate-950">All things built-in AI</h1>
    </header>
    <div class="app-grid">
      <div v-for="(api, key) in builtInAiApis" :key="key" class="app-card">
        <component
          :is="api.icon"
          color="#076EFF"
          size="32"
          class="absolute top-3 left-3"
        />
        <div
          class="w-full h-40 bg-white rounded-lg flex flex-col items-end justify-end p-3"
        >
          <button @click="openDemo(key)" class="cursor-pointer">
            <Expand color="#076EFF" />
          </button>
        </div>
        <h2 class="uppercase text-xl font-semibold">
          {{ api.name }}
        </h2>
      </div>
    </div>
    <div v-if="isDemoOpen" class="app-modal">
      <div ref="modal" class="app-modal-inner">
        <button @click="isDemoOpen = false" class="cursor-pointer">
          <Minimize2 color="#076EFF" />
        </button>
        <component
          :is="builtInAiApis[selectedDemo]?.component"
          class="w-full h-full"
        />
      </div>
    </div>
    <footer class="mt-auto">
      © {{ new Date().getFullYear() }} All things Built-in AI – Developed and
      designed by Alba Silvente (@dawntraoz)
    </footer>
  </main>
</template>

<style>
@reference "./assets/css/tailwind.css";

.app-container {
  @apply min-h-screen flex flex-col items-center gap-8 p-16 bg-slate-50;
}

.app-grid {
  @apply grid md:grid-cols-3 md:grid-rows-2 gap-4 p-12 bg-white rounded-lg border border-slate-100;
}

.app-card {
  @apply relative flex flex-col items-center text-center gap-4 bg-slate-50 p-6 rounded-lg border border-slate-100;
}

.app-modal {
  @apply fixed inset-0 p-4 bg-slate-950/50 flex flex-col items-center justify-center;
}

.app-modal-inner {
  @apply w-full max-w-5xl flex flex-col items-end p-12 bg-white rounded-lg border border-slate-100;
}

/** Form styles */
textarea {
  @apply block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500;
}

select {
  @apply text-sm bg-gray-50 border border-gray-300 text-gray-900 rounded-lg outline-0 focus:border-blue-600 p-2;
}
</style>
