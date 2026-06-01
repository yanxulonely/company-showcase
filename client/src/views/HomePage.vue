<script setup>
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
import CapabilitiesSection from '../components/sections/CapabilitiesSection.vue'
import ReviewsSection from '../components/sections/ReviewsSection.vue'
import StandardsSection from '../components/sections/StandardsSection.vue'
import ContactSection from '../components/sections/ContactSection.vue'

useScrollAnimation()
</script>

<template>
  <PageLoader />
  <CursorGlow />
  <FloatingShapes />
  <Navbar />
  <main>
    <HeroSection />
    <StatsSection />
    <CasesSection />
    <CapabilitiesSection />
    <ReviewsSection />
    <StandardsSection />
    <ContactSection />
  </main>
  <Footer />
  <BackToTop />
</template>
