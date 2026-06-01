<script setup>
import { onMounted } from 'vue'
import { useAppStore } from './stores/app'

const appStore = useAppStore()

onMounted(() => {
  appStore.fetchSettings()
})
</script>

<template>
  <router-view />
</template>
