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

import PromptDemo from "./components/PromptDemo.vue";
import RewriterDemo from "./components/RewriterDemo.vue";
import SummarizerDemo from "./components/SummarizerDemo.vue";
import TranslatorDemo from "./components/TranslatorDemo.vue";
import WriterDemo from "./components/WriterDemo.vue";
import ProofreaderDemo from "./components/ProofreaderDemo.vue";

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
    component: PromptDemo,
  },
  writer: {
    name: "Writer API",
    description: "Generate long-form content based on a given topic.",
    icon: PencilLine,
    component: WriterDemo,
  },
  rewriter: {
    name: "Rewriter API",
    description: "Rewrite text to improve clarity, style, or tone.",
    icon: RefreshCcw,
    component: RewriterDemo,
  },
  proofreader: {
    name: "Proofreader API",
    description: "Check text for grammar, spelling, and punctuation errors.",
    icon: BadgeCheck,
    component: ProofreaderDemo,
  },
};

const isDemoOpen = ref(false);
const selectedDemo = ref<keyof typeof builtInAiApis>();

function openDemo(key: keyof typeof builtInAiApis) {
  selectedDemo.value = key;
  isDemoOpen.value = true;
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
          :size="32"
          stroke-width="1.5"
          class="absolute top-3 left-3"
        />
        <div
          class="w-full h-40 bg-white rounded-lg flex flex-col items-end justify-end p-3"
        >
          <button @click="openDemo(key)" class="cursor-pointer">
            <Expand color="#076EFF" stroke-width="1.5" />
          </button>
        </div>
        <h2 class="uppercase text-lg font-semibold">
          {{ api.name }}
        </h2>
      </div>
    </div>
    <div v-if="isDemoOpen" class="app-modal">
      <div ref="modal" class="app-modal-inner">
        <button
          @click="isDemoOpen = false"
          class="absolute top-6 right-6 cursor-pointer"
        >
          <Minimize2 color="#076EFF" stroke-width="1.5" />
        </button>
        <component
          v-if="selectedDemo"
          :is="builtInAiApis[selectedDemo]?.component"
          class="w-full h-full bg-slate-50 border border-slate-100 rounded-lg p-12 overflow-y-auto max-h-[70vh]"
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
  @apply min-h-screen flex flex-col items-center gap-8 p-4 md:p-16 bg-slate-50;
}

.app-grid {
  @apply max-w-6xl grid md:grid-cols-3 md:grid-rows-2 gap-4 p-12 bg-white rounded-lg border border-slate-100;
}

.app-card {
  @apply relative flex flex-col items-center text-center gap-4 bg-slate-50 p-6 rounded-lg border border-slate-100;
}

.app-modal {
  @apply fixed inset-0 p-4 bg-slate-950/50 flex flex-col items-center justify-center;
}

.app-modal-inner {
  @apply relative w-full max-w-6xl flex flex-col items-end gap-8 p-16 bg-white rounded-lg border border-slate-100;
}

/** Form styles */
textarea {
  @apply block p-4 w-full text-slate-500 bg-white rounded-lg border-2 border-slate-100 focus:outline-0 focus:ring-blue-500 focus:border-blue-500;
}

select {
  @apply bg-gray-50 border-2 border-slate-100 text-slate-950 rounded-lg focus:outline-0 focus:border-blue-600 p-2;
}
</style>
