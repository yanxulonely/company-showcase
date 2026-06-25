<script setup>
import { ref } from 'vue'
import { useScrollAnimation } from '../composables/useScrollAnimation'
import PageLoader from '../components/PageLoader.vue'
import CursorGlow from '../components/CursorGlow.vue'
import FloatingShapes from '../components/FloatingShapes.vue'
import Navbar from '../components/Navbar.vue'
import BackToTop from '../components/BackToTop.vue'
import Footer from '../components/Footer.vue'
import HeroSection from '../components/sections/HeroSection.vue'
import StatsSection from '../components/sections/StatsSection.vue'
import CasesSection from '../components/sections/CasesSection.vue'
import DesignersSection from '../components/sections/DesignersSection.vue'
import CapabilitiesSection from '../components/sections/CapabilitiesSection.vue'
import ReviewsSection from '../components/sections/ReviewsSection.vue'
import StandardsSection from '../components/sections/StandardsSection.vue'
import ContactSection from '../components/sections/ContactSection.vue'

useScrollAnimation()

const preferredDesigner = ref(null)

function onBookDesigner(designer) {
  preferredDesigner.value = designer
}

function clearPreferredDesigner() {
  preferredDesigner.value = null
}
</script>

<template>
  <PageLoader />
  <CursorGlow class="hide-mobile" />
  <FloatingShapes class="hide-mobile" />
  <Navbar />
  <main>
    <HeroSection />
    <StatsSection />
    <CasesSection />
    <DesignersSection @book="onBookDesigner" />
    <CapabilitiesSection />
    <ReviewsSection />
    <StandardsSection />
    <ContactSection
      :preferred-designer="preferredDesigner"
      @clear-designer="clearPreferredDesigner"
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
