<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { DEFAULT_SETTINGS, resetSettings, saveSettings, settings } from '@/config/settings'

const router = useRouter()
const form = reactive({ ...settings })
const message = ref('')
const error = ref('')
const defaultSource = import.meta.env.VITE_DATA_SOURCE === 'api' ? '后端 API' : '本地 CSV'
const defaultApi = import.meta.env.VITE_API_BASE_URL || '同源地址'
const sourceLabel = computed(() => ({ default: '跟随环境配置', csv: '本地 CSV', api: '后端 API' })[settings.dataSource])

function submit() {
  error.value = ''
  message.value = ''
  try {
    Object.assign(form, saveSettings(form))
    message.value = '设置已保存，返回大屏后生效。'
  } catch (saveError) {
    error.value = saveError.message
  }
}

function reset() {
  error.value = ''
  message.value = ''
  try {
    Object.assign(form, resetSettings())
    message.value = '已恢复默认设置。'
  } catch (resetError) {
    error.value = resetError.message
  }
}
</script>

<template>
  <div class="settings-page">
    <div class="settings-heading">
      <div>
        <p class="eyebrow">CONTROL CENTER · SYSTEM SETTINGS</p>
        <h1>系统设置</h1>
        <p>管理大屏轮播与数据接入方式</p>
      </div>
      <button class="settings-back" type="button" @click="router.push('/dashboard')">← 返回大屏</button>
    </div>

    <form class="settings-layout" @submit.prevent="submit">
      <div class="settings-form">
        <section class="settings-card">
          <div class="settings-card-title"><span class="settings-icon">◷</span><div><h2>页面轮播</h2><p>控制五个业务页面的自动切换</p></div><span class="settings-card-index">01</span></div>
          <div class="settings-row">
            <div class="settings-field-copy"><label for="carousel-enabled">自动轮播</label><p>开启后按指定间隔切换；停留设置页时自动暂停。</p></div>
            <label class="settings-switch"><input id="carousel-enabled" v-model="form.carouselEnabled" type="checkbox"><span></span></label>
          </div>
          <div class="settings-row">
            <div class="settings-field-copy"><label for="carousel-seconds">切换间隔</label><p>可设置 5–3600 秒，返回大屏后重新计时。</p></div>
            <div class="settings-number"><input id="carousel-seconds" v-model.number="form.carouselSeconds" type="number" min="5" max="3600" step="1" required><span>秒</span></div>
          </div>
        </section>

        <section class="settings-card">
          <div class="settings-card-title"><span class="settings-icon">⌁</span><div><h2>数据获取方式</h2><p>配置各页面的数据来源和接口地址</p></div><span class="settings-card-index">02</span></div>
          <fieldset class="source-options">
            <legend>数据来源</legend>
            <label :class="['source-option', { selected: form.dataSource === 'default' }]"><input v-model="form.dataSource" type="radio" value="default"><span><b>跟随环境配置</b><small>当前默认：{{ defaultSource }}；保留单数据集覆盖</small></span></label>
            <label :class="['source-option', { selected: form.dataSource === 'csv' }]"><input v-model="form.dataSource" type="radio" value="csv"><span><b>本地 CSV</b><small>使用发布到 public/data 的数据文件</small></span></label>
            <label :class="['source-option', { selected: form.dataSource === 'api' }]"><input v-model="form.dataSource" type="radio" value="api"><span><b>后端 API</b><small>从后端接口读取数据，不自动回退</small></span></label>
          </fieldset>
          <div class="settings-api-field">
            <label for="api-origin">API 服务地址 <span>可选</span></label>
            <input id="api-origin" v-model.trim="form.apiBaseUrl" type="text" inputmode="url" placeholder="例如：https://api.example.com" autocomplete="url" spellcheck="false">
            <p>仅填写 HTTP(S) 域名及端口；留空使用环境配置（{{ defaultApi }}）。接口路径固定为 /api/dashboard/数据集名，请勿填写账号或密钥。</p>
          </div>
        </section>

        <div class="settings-actions">
          <button type="submit" class="settings-save">保存设置 <span>→</span></button>
          <button type="button" class="settings-reset" @click="reset">恢复默认</button>
          <span v-if="error" class="settings-feedback error" role="alert">{{ error }}</span>
          <span v-else-if="message" class="settings-feedback" role="status">{{ message }}</span>
        </div>
      </div>
      <aside class="settings-aside">
        <div class="settings-aside-heading"><span>✦</span><div><small>CURRENT CONFIGURATION</small><h2>当前生效配置</h2></div></div>
        <div class="settings-status-row"><span>自动轮播</span><strong>{{ settings.carouselEnabled ? '已开启' : '已关闭' }}</strong></div>
        <div class="settings-status-row"><span>切换间隔</span><strong>{{ settings.carouselSeconds }} 秒</strong></div>
        <div class="settings-status-row"><span>数据来源</span><strong>{{ sourceLabel }}</strong></div>
        <div class="settings-status-row api-status"><span>API 服务</span><strong>{{ settings.apiBaseUrl || defaultApi }}</strong></div>
        <div class="settings-info"><span>i</span><p>设置保存在当前浏览器，不会影响其他设备。设置页不会参与自动轮播；返回业务页面后重新开始计时。</p></div>
        <div class="settings-info"><span>i</span><p>选择本地或 API 时会覆盖旧的单数据集配置；选择“跟随环境配置”可继续使用原有单数据集配置。</p></div>
        <div class="settings-info"><span>!</span><p>默认值：{{ DEFAULT_SETTINGS.carouselSeconds }} 秒、自动轮播开启、数据源跟随环境。请勿在浏览器中保存认证密钥。</p></div>
      </aside>
    </form>
  </div>
</template>

<style scoped>
.settings-page { height: 100%; min-height: 0; overflow: auto; padding: 8px 4px 20px; }
.settings-heading { display: flex; align-items: center; justify-content: space-between; gap: 20px; max-width: 1500px; margin: 0 auto 18px; }
.settings-heading h1 { margin: 6px 0; color: #fff0d2; font-size: 30px; letter-spacing: 3px; }
.settings-heading > div > p:last-child { color: #e0b29c; font-size: 14px; }
.settings-back, .settings-reset { padding: 11px 20px; border: 1px solid rgba(255, 202, 124, .4); border-radius: 4px; color: #ffdbac; background: rgba(99, 14, 17, .45); cursor: pointer; }
.settings-back:hover, .settings-reset:hover { border-color: #ffcc78; background: rgba(199, 73, 33, .3); }
.settings-layout { display: grid; grid-template-columns: minmax(0, 1fr) 370px; gap: 18px; max-width: 1500px; margin: auto; }
.settings-form { display: flex; flex-direction: column; gap: 14px; min-width: 0; }
.settings-card, .settings-aside { padding: 20px 24px; border: 1px solid rgba(255, 199, 113, .32); border-radius: 5px; background: linear-gradient(135deg, rgba(146, 25, 27, .7), rgba(69, 8, 13, .78)); box-shadow: inset 0 1px 0 rgba(255, 220, 159, .1), 0 10px 24px rgba(37, 2, 5, .15); }
.settings-card-title { display: flex; align-items: center; gap: 13px; padding-bottom: 16px; border-bottom: 1px solid rgba(255, 207, 135, .18); }
.settings-icon { display: grid; place-items: center; width: 42px; height: 42px; border: 1px solid rgba(255, 209, 127, .55); border-radius: 50%; color: #ffda84; background: rgba(255, 183, 70, .12); font-size: 24px; }
.settings-card-title h2, .settings-aside-heading h2 { color: #ffe8c5; font-size: 18px; letter-spacing: 1px; }
.settings-card-title p { margin-top: 4px; color: #d3a18a; font-size: 12px; }
.settings-card-index { margin-left: auto; color: rgba(255, 213, 147, .4); font: 14px monospace; }
.settings-row { display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 15px 3px; border-bottom: 1px solid rgba(255, 207, 135, .1); }
.settings-row:last-child { padding-bottom: 0; border-bottom: 0; }
.settings-field-copy label, .settings-api-field label, .source-options legend { color: #ffe4c3; font-size: 14px; font-weight: 600; }
.settings-field-copy p, .settings-api-field p { margin-top: 6px; color: #d2a18c; font-size: 12px; line-height: 1.6; }
.settings-switch { position: relative; flex: 0 0 48px; height: 26px; cursor: pointer; }
.settings-switch input { position: absolute; width: 100%; height: 100%; opacity: 0; cursor: pointer; }
.settings-switch span { display: block; width: 100%; height: 100%; border: 1px solid rgba(255, 215, 150, .3); border-radius: 20px; background: #64181b; transition: .2s; }
.settings-switch span::before { position: absolute; top: 4px; left: 4px; width: 18px; height: 18px; border-radius: 50%; background: #d7ad91; content: ''; transition: .2s; }
.settings-switch input:checked + span { background: #d48229; }
.settings-switch input:checked + span::before { left: 26px; background: #fff0c1; }
.settings-switch input:focus-visible + span { outline: 2px solid #ffe199; outline-offset: 3px; }
.settings-number { display: flex; align-items: center; flex: 0 0 118px; border: 1px solid rgba(255, 208, 131, .35); border-radius: 4px; background: rgba(54, 6, 9, .55); }
.settings-number input { width: 100%; padding: 10px 8px 10px 12px; border: 0; outline: 0; color: #ffedc8; background: transparent; font: 16px monospace; }
.settings-number:focus-within, .settings-api-field input:focus { outline: 2px solid #e8ad60; outline-offset: 1px; }
.settings-number > span { padding-right: 12px; color: #cfa389; font-size: 12px; }
.source-options { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; min-width: 0; padding: 15px 0; border: 0; }
.source-options legend { padding-top: 16px; }
.source-option { display: flex; align-items: flex-start; gap: 9px; min-width: 0; padding: 13px 10px; border: 1px solid rgba(255, 207, 134, .2); border-radius: 4px; background: rgba(77, 10, 14, .35); cursor: pointer; }
.source-option.selected { border-color: #f3ba67; background: rgba(241, 150, 51, .12); }
.source-option input { margin-top: 2px; accent-color: #f4bb66; }
.source-option b, .source-option small { display: block; }
.source-option b { color: #ffe5c4; font-size: 13px; }
.source-option small { margin-top: 5px; color: #cfa08b; font-size: 11px; line-height: 1.5; }
.settings-api-field { padding-top: 3px; }
.settings-api-field label span { margin-left: 4px; color: #c8957d; font-size: 11px; font-weight: 400; }
.settings-api-field input { width: 100%; margin-top: 9px; padding: 11px 13px; border: 1px solid rgba(255, 208, 131, .35); border-radius: 4px; color: #ffedce; background: rgba(54, 6, 9, .55); font: 13px sans-serif; }
.settings-api-field input::placeholder { color: #ae7f6d; }
.settings-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; }
.settings-save { padding: 11px 25px; border: 1px solid #ffd88c; border-radius: 4px; color: #6a1a0e; background: linear-gradient(110deg, #ffe2a0, #efaa4e); font-weight: 700; cursor: pointer; }
.settings-save span { padding-left: 12px; }
.settings-save:hover { filter: brightness(1.08); }
.settings-feedback { color: #ffdb9a; font-size: 12px; }
.settings-feedback.error { color: #ffae91; }
.settings-aside { align-self: start; }
.settings-aside-heading { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
.settings-aside-heading > span { color: #ffcb6e; font-size: 27px; }
.settings-aside-heading small { display: block; margin-bottom: 4px; color: #ce926c; font: 9px monospace; letter-spacing: 1px; }
.settings-status-row { display: flex; align-items: baseline; justify-content: space-between; gap: 15px; padding: 13px 0; border-bottom: 1px solid rgba(255, 207, 135, .12); font-size: 13px; }
.settings-status-row > span { flex-shrink: 0; color: #d2a18a; }
.settings-status-row strong { overflow-wrap: anywhere; color: #ffe0aa; font-size: 13px; text-align: right; }
.settings-info { display: flex; gap: 9px; margin-top: 15px; padding: 12px; border-left: 2px solid #d99a49; background: rgba(255, 186, 78, .06); }
.settings-info > span { color: #ffcb76; font-weight: 700; }
.settings-info p { color: #d9ad93; font-size: 12px; line-height: 1.6; }
@media (max-width: 1100px) { .settings-page { height: auto; min-height: 650px; overflow: visible; } .settings-layout { grid-template-columns: 1fr; } }
@media (max-width: 700px) { .settings-heading h1 { font-size: 23px; } .settings-card, .settings-aside { padding: 16px; } .source-options { grid-template-columns: 1fr; } .settings-heading { align-items: flex-start; } .settings-back { padding: 9px; white-space: nowrap; } }
</style>
