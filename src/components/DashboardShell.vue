<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { formatNow } from '@/utils/format'
import { saveSettings, settings } from '@/config/settings'

const router = useRouter()
const route = useRoute()
const pages = [
  { path: '/dashboard', label: '首页', number: '01' },
  { path: '/organization', label: '组织建设', number: '02' },
  { path: '/work', label: '党建工作', number: '03' },
  { path: '/cases', label: '先进案例', number: '04' },
  { path: '/group', label: '群团工作', number: '05' },
]
const currentIndex = computed(() => pages.findIndex((page) => page.path === route.path))
const isSettingsPage = computed(() => route.path === '/settings')
const currentTime = ref(formatNow())
const carouselError = ref('')
let clockTimer
let carouselTimer

function moveTo(index) {
  const next = pages[(index + pages.length) % pages.length]
  if (next && next.path !== route.path) router.push(next.path)
}

function startCarousel() {
  clearInterval(carouselTimer)
  if (!settings.carouselEnabled || isSettingsPage.value || currentIndex.value < 0) return
  carouselTimer = setInterval(() => moveTo(currentIndex.value + 1), settings.carouselSeconds * 1000)
}

function toggleCarousel() {
  try {
    saveSettings({ ...settings, carouselEnabled: !settings.carouselEnabled })
    carouselError.value = ''
  } catch (error) {
    carouselError.value = error.message
  }
}

watch([() => route.path, () => settings.carouselEnabled, () => settings.carouselSeconds], startCarousel)

onMounted(() => {
  clockTimer = setInterval(() => { currentTime.value = formatNow() }, 1000)
  startCarousel()
})

onBeforeUnmount(() => {
  clearInterval(clockTimer)
  clearInterval(carouselTimer)
})
</script>

<template>
  <div class="dashboard-shell">
    <header class="shell-header">
      <div class="shell-brand">
        <div class="brand-mark"><span>党</span></div>
        <div>
          <div class="brand-name">武汉研究所</div>
          <div class="brand-caption">PARTY BUILDING · PANORAMA</div>
        </div>
      </div>

      <div class="shell-title">
        <p>党建数据分析平台</p>
        <span>凝心铸魂强根基 · 实干担当促发展</span>
      </div>

      <div class="shell-clock">
        <span class="live-dot"></span>
        <span>数据驾驶舱</span>
        <strong>{{ currentTime }}</strong>
        <router-link class="settings-link" :class="{ active: isSettingsPage }" to="/settings" aria-label="打开系统设置">⚙ <span>设置</span></router-link>
      </div>

      <nav class="shell-nav" aria-label="主导航">
        <button
          v-for="(page, index) in pages"
          :key="page.path"
          type="button"
          :class="['nav-item', { active: currentIndex === index }]"
          @click="moveTo(index)"
        >
          <span class="nav-number">{{ page.number }}</span>
          <span>{{ page.label }}</span>
        </button>
      </nav>
    </header>

    <main class="shell-content">
      <router-view />
    </main>

    <footer class="shell-footer">
      <div class="footer-signature"><span class="footer-star">✦</span> 党建引领聚合力 · 科研报国勇争先</div>
      <div class="carousel-controls" aria-label="页面轮播控制">
        <span class="carousel-label">全景轮播</span>
        <button
          v-for="(page, index) in pages"
          :key="page.path"
          type="button"
          :aria-label="`切换至${page.label}`"
          :class="['carousel-dot', { active: currentIndex === index }]"
          @click="moveTo(index)"
        ></button>
        <button v-if="!isSettingsPage" class="play-toggle" type="button" @click="toggleCarousel">
          {{ settings.carouselEnabled ? '暂停轮播' : '继续轮播' }}
        </button>
        <span class="carousel-interval">{{ isSettingsPage ? '设置页暂停轮播' : settings.carouselEnabled ? `${settings.carouselSeconds} 秒自动切换` : '自动轮播已关闭' }}</span>
        <span v-if="carouselError" class="carousel-error" role="alert">{{ carouselError }}</span>
      </div>
      <div class="footer-status"><i></i> 系统运行正常</div>
    </footer>
  </div>
</template>
