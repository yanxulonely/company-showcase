<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useScrollAnimation } from '../composables/useScrollAnimation'
import { useAppStore } from '../stores/app'
import PageLoader from '../components/PageLoader.vue'
import CursorGlow from '../components/CursorGlow.vue'
import FloatingShapes from '../components/FloatingShapes.vue'
import Navbar from '../components/Navbar.vue'
import BackToTop from '../components/BackToTop.vue'
import Footer from '../components/Footer.vue'
import HeroSection from '../components/sections/HeroSection.vue'
import StatsSection from '../components/sections/StatsSection.vue'
import CasesSection from '../components/sections/CasesSection.vue'
import ActivitiesSection from '../components/sections/ActivitiesSection.vue'
import DesignersSection from '../components/sections/DesignersSection.vue'
import CapabilitiesSection from '../components/sections/CapabilitiesSection.vue'
import ReviewsSection from '../components/sections/ReviewsSection.vue'
import StandardsSection from '../components/sections/StandardsSection.vue'
import ContactSection from '../components/sections/ContactSection.vue'

useScrollAnimation()

const appStore = useAppStore()
const route = useRoute()
const preferredDesigner = ref(null)
const preferredActivity = ref(null)

function onBookDesigner(designer) {
  preferredDesigner.value = designer
  preferredActivity.value = null
  scrollToContact()
}

function clearPreferredDesigner() {
  preferredDesigner.value = null
}

function clearPreferredActivity() {
  preferredActivity.value = null
}

function scrollToContact() {
  setTimeout(() => {
    const el = document.querySelector('#contact')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, 100)
}

function applyRouteQuery() {
  if (route.query.activity) {
    preferredActivity.value = { title: route.query.activity }
    preferredDesigner.value = null
    scrollToContact()
  }
}

onMounted(() => {
  applyRouteQuery()
})

watch(() => route.query.activity, () => {
  applyRouteQuery()
})
</script>

<template>
  <PageLoader />
  <CursorGlow class="hide-mobile" />
  <FloatingShapes class="hide-mobile" />
  <Navbar />
  <main>
    <HeroSection v-if="appStore.isModuleVisible('hero')" />
    <StatsSection v-if="appStore.isModuleVisible('stats')" />
    <CasesSection v-if="appStore.isModuleVisible('cases')" />
    <ActivitiesSection v-if="appStore.isModuleVisible('activities')" />
    <DesignersSection
      v-if="appStore.isModuleVisible('designers')"
      @book="onBookDesigner"
    />
    <CapabilitiesSection v-if="appStore.isModuleVisible('capabilities')" />
    <ReviewsSection v-if="appStore.isModuleVisible('reviews')" />
    <StandardsSection v-if="appStore.isModuleVisible('standards')" />
    <ContactSection
      v-if="appStore.isModuleVisible('contact')"
      :preferred-designer="preferredDesigner"
      :preferred-activity="preferredActivity"
      @clear-designer="clearPreferredDesigner"
      @clear-activity="clearPreferredActivity"
    />
  </main>
  <Footer />
  <BackToTop />
</template>

<style scoped>
@media (max-width: 768px) {
  :deep(.hide-mobile) {
    display: none !important;
  }
}
</style>
