<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { partyStats, trendData, notices, recentActivities } from '@/data/mock'
import { formatNow } from '@/utils/format'

const now = ref(formatNow())
let timer = null

onMounted(() => {
  timer = setInterval(() => {
    now.value = formatNow()
  }, 1000)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div class="screen">
    <header class="header">
      <div class="header-title">Party Building Dashboard Panorama</div>
      <div class="header-meta">{{ now }}</div>
    </header>

    <main class="main-grid">
      <section class="panel left">
        <h3>Member Overview</h3>
        <ul class="stats">
          <li>Total Members: {{ partyStats.totalMembers }}</li>
          <li>New This Year: {{ partyStats.newMembers }}</li>
          <li>Branches: {{ partyStats.branches }}</li>
          <li>Activities This Month: {{ partyStats.activitiesThisMonth }}</li>
        </ul>
        <h4>Growth Trend</h4>
        <div class="trend">
          <span v-for="(value, index) in trendData" :key="index">{{ value }}</span>
        </div>
      </section>

      <section class="panel center">
        <h3>Core Visualization</h3>
        <div class="map-placeholder">3D/Map Visualization Area</div>
      </section>

      <section class="panel right">
        <h3>Recent Activities</h3>
        <ul class="activity-list">
          <li v-for="item in recentActivities" :key="`${item.name}-${item.time}`">
            <strong>{{ item.name }}</strong>
            <p>{{ item.unit }}</p>
            <span>{{ item.time }}</span>
          </li>
        </ul>
      </section>
    </main>

    <footer class="ticker">
      <span v-for="text in notices" :key="text">{{ text }}</span>
    </footer>
  </div>
</template>
