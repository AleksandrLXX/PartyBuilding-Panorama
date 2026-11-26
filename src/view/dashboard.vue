<script setup>
import { computed, onMounted, ref } from 'vue'
import { getData } from '@/utils/getData'

const metrics = ref([])
const trend = ref([])
const locations = ref([])
const loading = ref(true)
const error = ref('')
const totalActivities = computed(() => trend.value.reduce((sum, item) => sum + Number(item.activity_count || 0), 0))
const maxActivity = computed(() => Math.max(1, ...trend.value.map((item) => Number(item.activity_count || 0))))

onMounted(async () => {
  try {
    const [metricRows, trendRows, locationRows] = await Promise.all([
      getData('home_metrics'),
      getData('home_activity_trend'),
      getData('home_locations'),
    ])
    metrics.value = metricRows
    trend.value = trendRows
    locations.value = locationRows
  } catch (loadError) {
    error.value = loadError.message || '首页数据加载失败'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="view-page home-page">
    <div class="page-heading">
      <div>
        <p class="eyebrow">PARTY BUILDING · DATA OVERVIEW</p>
        <h1>党建全景总览</h1>
        <p class="page-subtitle">以数据汇聚组织力量，以党建引领科研创新</p>
      </div>
      <div class="data-stamp"><span class="stamp-pulse"></span> {{ loading ? '正在同步数据' : '数据已更新' }} <b>·</b> 统计总览</div>
    </div>

    <div v-if="error" class="data-error">{{ error }}。请确认 CSV 文件已同步，或检查接口配置。</div>

    <section class="home-kpis" aria-label="核心指标">
      <article v-for="(item, index) in metrics" :key="item.id" :class="['kpi-card', `kpi-${index + 1}`]">
        <div class="kpi-icon">{{ ['✦', '◎', '▤', '♟'][index] || '✦' }}</div>
        <div class="kpi-copy">
          <span>{{ item.label }}</span>
          <strong>{{ Number(item.value || 0).toLocaleString('zh-CN') }}<small>{{ item.unit }}</small></strong>
        </div>
        <span class="kpi-caption">{{ item.caption }}</span>
      </article>
    </section>

    <div class="home-grid">
      <section class="glass-panel home-left">
        <div class="panel-heading">
          <div><span class="section-index">01</span><h2>组织生活活力</h2></div>
          <span class="panel-chip">近 6 个月 · 示例趋势</span>
        </div>
        <div class="activity-summary">
          <div><strong>{{ totalActivities }}</strong><span>场组织生活</span></div>
          <div class="summary-divider"></div>
          <div><strong>{{ trend.length ? Math.round(trend.reduce((sum, item) => sum + Number(item.attendance_rate || 0), 0) / trend.length) : 0 }}<small>%</small></strong><span>平均参与率</span></div>
        </div>
        <div class="trend-chart" role="img" aria-label="每月组织生活场次趋势">
          <div v-for="item in trend" :key="item.month" class="trend-column">
            <span class="trend-value">{{ item.activity_count }}</span>
            <div class="trend-bar-track"><i :style="{ height: `${Math.max(8, Number(item.activity_count) / maxActivity * 100)}%` }"></i></div>
            <span class="trend-month">{{ item.month.slice(5) }}月</span>
            <span class="trend-attendance">参与 {{ item.attendance_rate }}%</span>
          </div>
        </div>
        <div class="panel-footnote"><span class="legend-dot gold"></span> 组织生活开展场次 <span class="legend-line"></span> 参与率数据</div>
        <div class="quote-card">
          <span class="quote-mark">“</span>
          <p>把支部建在科研一线<br />让党旗在攻坚阵地高高飘扬</p>
          <span class="quote-source">党建引领 · 科研报国</span>
        </div>
      </section>

      <section class="glass-panel home-map-panel">
        <div class="panel-heading map-heading">
          <div><span class="section-index">02</span><h2>组织力量 · 武汉</h2></div>
          <span class="map-live"><i></i> 点位示意</span>
        </div>
        <div class="map-scene">
          <div class="map-orbit orbit-a"></div><div class="map-orbit orbit-b"></div>
          <svg class="wuhan-map" viewBox="0 0 640 520" role="img" aria-label="武汉片区组织力量分布示意图">
            <defs>
              <linearGradient id="landGlow" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stop-color="#ffdc8a" stop-opacity=".2" />
                <stop offset="1" stop-color="#ff5a3d" stop-opacity=".04" />
              </linearGradient>
              <filter id="softGlow"><feGaussianBlur stdDeviation="5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            </defs>
            <path class="map-water" d="M0 271 C94 214 133 292 211 251 S344 260 400 213 S526 233 640 174 L640 269 C550 313 522 277 445 327 S303 285 232 343 S107 300 0 357Z" />
            <path class="map-outline" d="M112 103 173 79 218 96 255 83 288 112 344 105 371 141 413 136 441 169 494 168 523 204 504 238 523 264 488 291 479 333 444 347 434 386 391 396 365 433 322 425 295 453 259 429 218 442 199 407 160 402 146 365 114 347 123 310 96 284 113 254 91 225 112 197 96 163Z" />
            <path class="map-boundary" d="M145 141 204 157 236 126 271 170 321 146 345 196 389 170 416 216 474 206 M124 230 179 221 209 260 258 238 288 282 333 256 361 302 421 274 489 291 M147 352 199 320 241 346 277 310 324 343 375 318 432 350" />
            <path class="river-line" d="M280 69 C246 137 303 177 280 235 C256 292 315 326 296 386 C282 423 309 451 324 470" />
            <g class="map-center"><circle cx="322" cy="261" r="44"/><circle cx="322" cy="261" r="27"/><circle cx="322" cy="261" r="9"/><text x="322" y="267">武汉</text></g>
            <g v-for="point in locations" :key="point.location" class="map-point" :transform="`translate(${Number(point.x) * 6.4}, ${Number(point.y) * 5.2})`">
              <circle r="15" class="point-halo"/><circle r="6" class="point-core"/><text y="-21">{{ point.location }}</text>
            </g>
            <g class="map-link-lines">
              <path v-for="(point, index) in locations" :key="`line-${point.location}`" :d="`M322 261 Q${260 + index * 36} ${120 + index * 35} ${Number(point.x) * 6.4} ${Number(point.y) * 5.2}`" />
            </g>
          </svg>
          <div class="map-caption"><b>WUHAN</b><span>党建组织分布 · 示意图</span></div>
          <div class="map-coordinates">30°35′ N&nbsp;&nbsp; 114°18′ E</div>
        </div>
        <div class="location-strip">
          <div v-for="location in locations" :key="location.location" class="location-item">
            <span class="location-pin">⌖</span><span>{{ location.location }}</span><strong>{{ Number(location.member_count).toLocaleString('zh-CN') }}<small>人</small></strong>
          </div>
        </div>
      </section>

      <section class="home-right">
        <article class="glass-panel location-panel">
          <div class="panel-heading">
            <div><span class="section-index">03</span><h2>片区组织分布</h2></div>
            <span class="panel-chip">单位 / 党员</span>
          </div>
          <div class="location-list">
            <div v-for="(location, index) in locations" :key="location.location" class="location-row">
              <span class="location-rank">0{{ index + 1 }}</span>
              <div class="location-info"><div><b>{{ location.location }}</b><span>{{ location.unit_count }} 家单位</span></div><i><em :style="{ width: `${Math.min(100, Number(location.member_count) / Math.max(1, ...locations.map((item) => Number(item.member_count))) * 100)}%` }"></em></i></div>
              <strong>{{ Number(location.member_count).toLocaleString('zh-CN') }}<small>人</small></strong>
            </div>
          </div>
          <div class="location-total"><span>覆盖片区</span><strong>{{ locations.length }}<small> 个</small></strong><span class="total-divider"></span><span>点位人数合计</span><strong>{{ locations.reduce((sum, item) => sum + Number(item.member_count || 0), 0).toLocaleString('zh-CN') }}<small> 人</small></strong></div>
        </article>

        <article class="glass-panel home-message-panel">
          <div class="panel-heading">
            <div><span class="section-index">04</span><h2>党建工作动态</h2></div>
            <span class="live-label">滚动更新</span>
          </div>
          <div class="message-list">
            <div class="message-item"><span class="message-date">01</span><div><b>组织生活提质增效</b><p>持续推动主题党日与科研攻关深度融合</p></div><span class="message-arrow">↗</span></div>
            <div class="message-item"><span class="message-date">02</span><div><b>基层组织强基固本</b><p>夯实支部建设基础，提升组织凝聚力</p></div><span class="message-arrow">↗</span></div>
            <div class="message-item"><span class="message-date">03</span><div><b>先锋力量示范引领</b><p>以党员先锋岗带动科研团队协同奋进</p></div><span class="message-arrow">↗</span></div>
          </div>
        </article>
      </section>
    </div>
    <div class="page-disclaimer">首页片区坐标及组织生活趋势为页面演示数据；正式发布请以经审核的业务数据替换。</div>
  </div>
</template>
