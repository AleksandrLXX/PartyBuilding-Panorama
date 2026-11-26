<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const title = computed(() => route.path === '/cases' ? '先进案例' : '群团工作')
const englishTitle = computed(() => route.path === '/cases' ? 'ROLE MODEL STORIES' : 'MASS ORGANIZATION')
const descriptions = computed(() => route.path === '/cases'
  ? ['先锋人物', '攻坚团队', '创新实践']
  : ['工会工作', '共青团工作', '妇女工作'])
</script>

<template>
  <div class="view-page coming-page">
    <div class="page-heading">
      <div><p class="eyebrow">{{ englishTitle }}</p><h1>{{ title }}</h1><p class="page-subtitle">展示先进风采 · 汇聚奋进力量</p></div>
      <div class="demo-badge"><span>PREVIEW</span> 栏目建设中</div>
    </div>
    <section class="coming-hero glass-panel">
      <div class="coming-emblem"><span>党</span><i></i><b>✦</b></div>
      <p class="eyebrow">COMING SOON</p>
      <h2>{{ title }}数据内容即将上线</h2>
      <p>栏目已纳入五模块全景轮播，待业务数据、展示方案及接口确认后接入。</p>
      <div class="coming-tags"><span v-for="item in descriptions" :key="item">{{ item }}</span></div>
      <div class="coming-progress"><i></i></div><small>栏目建设进度 · 数据接入准备中</small>
    </section>
  </div>
</template>
