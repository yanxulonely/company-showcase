<script setup>
defineProps({
  type: {
    type: String,
    default: 'case',
    validator: (v) => ['case', 'capability', 'review'].includes(v),
  },
})
</script>

<template>
  <div class="skeleton-card" :class="`skeleton-${type}`">
    <template v-if="type === 'case'">
      <div class="skeleton-image"></div>
      <div class="skeleton-body">
        <div class="skeleton-line skeleton-line-title"></div>
        <div class="skeleton-line skeleton-line-subtitle"></div>
        <div class="skeleton-line skeleton-line-text"></div>
        <div class="skeleton-line skeleton-line-text short"></div>
      </div>
    </template>

    <template v-else-if="type === 'capability'">
      <div class="skeleton-icon"></div>
      <div class="skeleton-body">
        <div class="skeleton-line skeleton-line-title"></div>
        <div class="skeleton-line skeleton-line-subtitle"></div>
        <div class="skeleton-line skeleton-line-text"></div>
        <div class="skeleton-line skeleton-line-text"></div>
        <div class="skeleton-line skeleton-line-text short"></div>
      </div>
    </template>

    <template v-else-if="type === 'review'">
      <div class="skeleton-stars"></div>
      <div class="skeleton-body">
        <div class="skeleton-line skeleton-line-text"></div>
        <div class="skeleton-line skeleton-line-text"></div>
        <div class="skeleton-line skeleton-line-text"></div>
        <div class="skeleton-line skeleton-line-text short"></div>
      </div>
      <div class="skeleton-author">
        <div class="skeleton-avatar"></div>
        <div class="skeleton-author-info">
          <div class="skeleton-line skeleton-line-name"></div>
          <div class="skeleton-line skeleton-line-company"></div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.skeleton-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 16px;
  overflow: hidden;
  padding: 0;
}

.skeleton-review {
  padding: 32px;
}

/* Shimmer animation */
@keyframes shimmer {
  0% {
    background-position: -400px 0;
  }
  100% {
    background-position: 400px 0;
  }
}

.skeleton-line,
.skeleton-image,
.skeleton-icon,
.skeleton-avatar,
.skeleton-stars {
  background: linear-gradient(
    90deg,
    var(--border) 25%,
    var(--bg-card-hover) 37%,
    var(--border) 63%
  );
  background-size: 800px 100%;
  animation: shimmer 1.8s ease-in-out infinite;
  border-radius: var(--radius-md);
}

/* Case skeleton */
.skeleton-case .skeleton-image {
  height: 220px;
  border-radius: 0;
}

.skeleton-body {
  padding: 24px;
}

.skeleton-review .skeleton-body {
  padding: 0;
}

.skeleton-line {
  height: 14px;
  margin-bottom: 12px;
}

.skeleton-line-title {
  height: 20px;
  width: 70%;
  margin-bottom: 16px;
}

.skeleton-line-subtitle {
  width: 50%;
}

.skeleton-line-text.short {
  width: 40%;
}

.skeleton-line:last-child {
  margin-bottom: 0;
}

/* Capability skeleton */
.skeleton-capability {
  padding: 40px 32px;
}

.skeleton-capability .skeleton-body {
  padding: 0;
}

.skeleton-capability .skeleton-icon {
  width: 60px;
  height: 60px;
  border-radius: 14px;
  margin-bottom: 24px;
}

/* Review skeleton */
.skeleton-review .skeleton-stars {
  width: 100px;
  height: 14px;
  margin-bottom: 16px;
}

.skeleton-author {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 24px;
}

.skeleton-avatar {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  flex-shrink: 0;
}

.skeleton-author-info {
  flex: 1;
}

.skeleton-line-name {
  width: 80px;
  height: 14px;
  margin-bottom: 8px;
}

.skeleton-line-company {
  width: 120px;
  height: 12px;
  margin-bottom: 0;
}
</style>
