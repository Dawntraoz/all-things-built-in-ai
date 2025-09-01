<script setup lang="ts">
import { summarizerApi } from "@built-in-ai/summarizer-api";
</script>

<template>
  <h1>You did it!</h1>
  <p>{{ summarizerApi.name }} (v{{ summarizerApi.version }})</p>
  <p>
    Visit
    <a href="https://vuejs.org/" target="_blank" rel="noopener">vuejs.org</a> to
    read the documentation
  </p>
</template>

<style scoped></style>
