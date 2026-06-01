<script setup>
import { useAppStore } from '../stores/app'

const appStore = useAppStore()
</script>

<template>
  <footer class="footer">
    <div class="footer-content">
      <div class="footer-brand">
        <h3>{{ appStore.settings.company_name || '公司名称' }}</h3>
        <p>{{ appStore.settings.company_slogan || '专注数字化转型，为企业创造可持续的技术价值' }}</p>
      </div>
      <div class="footer-links">
        <h4>服务</h4>
        <ul>
          <li><a href="#">软件开发</a></li>
          <li><a href="#">云原生</a></li>
          <li><a href="#">AI 智能</a></li>
          <li><a href="#">数据工程</a></li>
        </ul>
      </div>
      <div class="footer-links">
        <h4>公司</h4>
        <ul>
          <li><a href="#">关于我们</a></li>
          <li><a href="#">团队</a></li>
          <li><a href="#">新闻</a></li>
          <li><a href="#">招贤纳士</a></li>
        </ul>
      </div>
      <div class="footer-links">
        <h4>支持</h4>
        <ul>
          <li><a href="#">文档</a></li>
          <li><a href="#">帮助中心</a></li>
          <li><a href="#">联系</a></li>
          <li><a href="#">隐私政策</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <p>{{ appStore.settings.footer_text || '© 2026 公司名称. All rights reserved.' }}</p>
      <p>Made with ♥</p>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  border-top: 1px solid var(--border);
  padding: 60px 40px;
  background: var(--bg-secondary);
}

.footer-content {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 60px;
}

.footer-brand h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 12px;
}

.footer-brand p {
  color: var(--text-muted);
  font-size: 14px;
  line-height: 1.7;
}

.footer-links h4 {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 20px;
  color: var(--text-secondary);
}

.footer-links ul {
  list-style: none;
}

.footer-links li {
  margin-bottom: 12px;
}

.footer-links a {
  color: var(--text-muted);
  text-decoration: none;
  font-size: 14px;
  transition: all var(--transition);
}

.footer-links a:hover {
  color: var(--accent);
  padding-left: 4px;
}

.footer-bottom {
  max-width: 1400px;
  margin: 40px auto 0;
  padding-top: 24px;
  border-top: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--text-muted);
  font-size: 13px;
}
</style>
