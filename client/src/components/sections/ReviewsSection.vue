<script setup>
import { ref, onMounted } from 'vue'
import { useReviewsStore } from '../../stores/reviews'
import SkeletonCard from '../SkeletonCard.vue'

const reviewsStore = useReviewsStore()
const loading = ref(true)

const avatarClasses = ['review-avatar-1', 'review-avatar-2', 'review-avatar-3']

onMounted(async () => {
  await reviewsStore.fetchAll()
  loading.value = false
})
</script>

<template>
  <section class="section reviews-section" id="reviews">
    <div class="section-header fade-in-up" style="max-width: 1400px; margin: 0 auto 64px;">
      <div class="section-label">Testimonials</div>
      <h2>客户评价</h2>
    </div>
    <div class="reviews-grid">
      <template v-if="loading">
        <SkeletonCard v-for="n in 6" :key="'sk-' + n" type="review" />
      </template>
      <template v-else>
        <div v-for="(item, i) in reviewsStore.items" :key="item.id" class="review-card fade-in-up" :style="{ transitionDelay: i * 0.1 + 's' }">
          <div class="review-stars">{{ '★'.repeat(item.rating) }}</div>
          <p class="review-text">{{ item.content }}</p>
          <div class="review-author">
            <div class="review-avatar" :class="avatarClasses[item.avatar_bg - 1]">{{ item.name[0] }}</div>
            <div>
              <div class="review-name">{{ item.name }}</div>
              <div class="review-company">{{ item.company }}</div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </section>
</template>

<style scoped>
.section {
  padding: 120px 40px;
}

.reviews-section {
  background: var(--bg-secondary);
}

.section-header {
  margin-bottom: 64px;
}

.section-label {
  font-size: 13px;
  color: var(--accent-light);
  text-transform: uppercase;
  letter-spacing: 2px;
  font-weight: 600;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-label::before {
  content: '';
  width: 24px;
  height: 2px;
  background: linear-gradient(90deg, var(--accent), #8b5cf6);
}

.section-header h2 {
  font-size: 48px;
  font-weight: 700;
  letter-spacing: -1px;
  line-height: 1.2;
}

.reviews-grid {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.review-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 32px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.review-card::before {
  content: '"';
  position: absolute;
  top: 20px;
  right: 24px;
  font-size: 80px;
  font-family: Georgia, serif;
  color: var(--accent);
  opacity: 0.1;
  line-height: 1;
}

.review-card:hover {
  border-color: var(--accent);
  transform: translateY(-4px);
}

.review-stars {
  margin-bottom: 16px;
  color: #fbbf24;
  font-size: 14px;
  letter-spacing: 2px;
}

.review-text {
  font-size: 15px;
  line-height: 1.8;
  color: var(--text-secondary);
  margin-bottom: 24px;
}

.review-author {
  display: flex;
  align-items: center;
  gap: 12px;
}

.review-avatar {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 16px;
  color: white;
  transition: transform var(--transition);
}

.review-card:hover .review-avatar {
  transform: scale(1.1) rotate(5deg);
}

.review-avatar-1 { background: linear-gradient(135deg, #3b82f6, #8b5cf6); }
.review-avatar-2 { background: linear-gradient(135deg, #ec4899, #f43f5e); }
.review-avatar-3 { background: linear-gradient(135deg, #10b981, #06b6d4); }

.review-name {
  font-weight: 600;
  font-size: 15px;
}

.review-company {
  font-size: 13px;
  color: var(--text-muted);
}

@media (max-width: 768px) {
  .section {
    padding: 72px 16px;
  }

  .section-header {
    margin-bottom: 32px;
  }

  .section-header h2 {
    font-size: 28px;
  }

  .reviews-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .review-card {
    padding: 24px 20px;
  }

  .review-card::before {
    font-size: 56px;
    top: 12px;
    right: 16px;
  }
}
</style>
