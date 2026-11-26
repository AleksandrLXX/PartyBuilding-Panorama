<script setup>
import { computed, onMounted, ref } from 'vue'
import { getData } from '@/utils/getData'

const summary = ref(null)
const units = ref([])
const ages = ref([])
const positions = ref([])
const branches = ref([])
const loading = ref(true)
const error = ref('')
const number = (value) => Number(value || 0).toLocaleString('zh-CN')
const max = (rows, key) => Math.max(1, ...rows.map((row) => Number(row[key]) || 0))
const ageTotal = computed(() => ages.value.reduce((sum, item) => sum + Number(item.member_count || 0), 0))
const branchTypes = computed(() => branches.value.filter((item) => !item.branch_type.includes('合计')))
const branchTotal = computed(() => branchTypes.value.reduce((sum, item) => sum + Number(item.branch_count || 0), 0))
const positionTotal = computed(() => positions.value.reduce((sum, item) => sum + Number(item.member_count || 0), 0))
const positionRatio = computed(() => positions.value.reduce((sum, item) => sum + Number(item.ratio || 0), 0))
const positionStyle = computed(() => {
  const colors = ['#ffe19b', '#ffb850', '#f57740', '#d03a2d']
  let start = 0
  const total = positionRatio.value || 100
  const slices = positions.value.map((item, index) => {
    const end = start + Number(item.ratio || 0) / total * 100
    const slice = `${colors[index % colors.length]} ${start}% ${end}%`
    start = end
    return slice
  })
  return { background: `conic-gradient(${slices.join(', ') || '#70232a 0 100%'})` }
})

// Decorative diagram positions only: the source workbook does not contain coordinates.
const diagramPoints = [[24, 27], [42, 17], [66, 23], [77, 41], [67, 59], [77, 75], [49, 78], [29, 68], [19, 47]]
const diagramUnits = computed(() => units.value.map((unit, index) => {
  // Keep the nine original demo positions; place additional units on an inner
  // orbit until real coordinates are supplied rather than hiding them.
  const angle = 2 * Math.PI * index / Math.max(units.value.length, 1)
  const [x, y] = diagramPoints[index] || [50 + 25 * Math.cos(angle), 50 + 25 * Math.sin(angle)]
  return { ...unit, x, y }
}))

onMounted(async () => {
  try {
    const [summaryRows, unitRows, ageRows, positionRows, branchRows] = await Promise.all([
      getData('work_summary'), getData('work_units'), getData('work_age_distribution'),
      getData('work_position_distribution'), getData('work_branch_distribution'),
    ])
    summary.value = summaryRows[0] || null
    units.value = unitRows
    ages.value = ageRows
    positions.value = positionRows
    branches.value = branchRows
  } catch (loadError) {
    error.value = loadError.message || '党建工作数据加载失败'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="work-screen">
    <div v-if="error" class="work-error" role="alert">{{ error }}。请确认 CSV 文件已同步，或检查接口配置。</div>
    <div class="work-layout">
      <div class="work-side work-side-left">
        <section class="work-panel">
          <div class="work-panel-title"><span>★</span><h2>基层党委</h2><small>成立时间 · 两委委员人数</small></div>
          <div class="committee-head"><span>单位名称</span><span>成立时间</span><span>党委委员</span><span>纪委委员</span></div>
          <div class="committee-list">
            <div v-for="(unit, index) in units" :key="unit.unit_name" class="committee-row">
              <span><i>{{ String(index + 1).padStart(2, '0') }}</i>{{ unit.unit_name }}</span>
              <span>{{ unit.established_on || '—' }}</span><strong>{{ unit.committee_member_count }}</strong><strong>{{ unit.discipline_member_count }}</strong>
            </div>
          </div>
        </section>
        <section class="work-panel">
          <div class="work-panel-title"><span>★</span><h2>党总支</h2><small>系统单位党总支分布</small></div>
          <div class="work-bars compact-bars">
            <div v-for="unit in units" :key="unit.unit_name" class="work-bar-row">
              <span>{{ unit.unit_name }}</span><div class="work-bar-track"><i :style="{ width: `${Number(unit.party_general_branch_count) / max(units, 'party_general_branch_count') * 100}%` }"></i></div><b>{{ unit.party_general_branch_count }}<small> 个</small></b>
            </div>
          </div>
          <div class="work-panel-note">汇总 {{ number(summary?.party_general_branch_count) }} 个 <span>·</span> 按原表单位明细展示</div>
        </section>
        <section class="work-panel">
          <div class="work-panel-title"><span>★</span><h2>党支部</h2><small>职工 · 学生 · 离退休</small></div>
          <div class="branch-type-grid">
            <div v-for="(item, index) in branchTypes" :key="item.branch_type" class="branch-type-card">
              <div class="branch-symbol">{{ ['✦', '◎', '❖'][index] || '✦' }}</div>
              <strong>{{ number(item.branch_count) }}<small> 个</small></strong><span>{{ item.branch_type }}</span>
            </div>
          </div>
          <div class="work-alert">分类合计 {{ branchTotal }} 个，汇总行 {{ number(summary?.party_branch_count) }} 个，口径待核对。</div>
        </section>
      </div>

      <section class="work-center">
        <div class="work-center-title"><span></span><h1>党建工作全景</h1><span></span></div>
        <div class="work-center-kpis">
          <div v-for="item in [
            { label: '党委', value: summary?.party_committee_count, icon: '✦' },
            { label: '党总支', value: summary?.party_general_branch_count, icon: '◎' },
            { label: '党支部', value: summary?.party_branch_count, icon: '▤' },
            { label: '党员', value: summary?.party_member_count, icon: '♟' },
          ]" :key="item.label" class="work-center-kpi">
            <span class="center-kpi-icon">{{ item.icon }}</span><div><span>{{ item.label }}</span><strong>{{ number(item.value) }}</strong></div>
          </div>
        </div>
        <div class="work-map" aria-label="单位分布示意图，点位不代表实际地理位置">
          <div class="work-map-orbit orbit-one"></div><div class="work-map-orbit orbit-two"></div>
          <svg class="work-map-shape" viewBox="0 0 640 520" aria-hidden="true">
            <defs><linearGradient id="workLand" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffcf70" stop-opacity=".35"/><stop offset="1" stop-color="#d24528" stop-opacity=".08"/></linearGradient></defs>
            <path class="work-map-water" d="M0 271 C94 214 133 292 211 251 S344 260 400 213 S526 233 640 174 L640 269 C550 313 522 277 445 327 S303 285 232 343 S107 300 0 357Z" />
            <path class="work-map-outline" d="M112 103 173 79 218 96 255 83 288 112 344 105 371 141 413 136 441 169 494 168 523 204 504 238 523 264 488 291 479 333 444 347 434 386 391 396 365 433 322 425 295 453 259 429 218 442 199 407 160 402 146 365 114 347 123 310 96 284 113 254 91 225 112 197 96 163Z" />
            <path class="work-map-boundary" d="M145 141 204 157 236 126 271 170 321 146 345 196 389 170 416 216 474 206 M124 230 179 221 209 260 258 238 288 282 333 256 361 302 421 274 489 291 M147 352 199 320 241 346 277 310 324 343 375 318 432 350" />
          </svg>
          <div class="work-map-core"><i>★</i><b>武汉</b><span>党建组织分布</span></div>
          <div v-for="unit in diagramUnits" :key="unit.unit_name" class="work-map-point" :style="{ left: `${unit.x}%`, top: `${unit.y}%` }"><i></i><span>{{ unit.unit_name }}</span></div>
          <div class="work-map-label">单位点位示意 · 非实际地理位置</div>
        </div>
        <div class="work-map-base"><span></span><i></i><span></span></div>
        <div class="work-groups">
          <div v-for="item in [{ name: '统战组织', icon: '✥' }, { name: '工会', icon: '❖' }, { name: '团委', icon: '✦' }, { name: '妇工委', icon: '◎' }]" :key="item.name" class="work-group">
            <div>{{ item.icon }}</div><b>{{ item.name }}</b><span>数据待接入</span>
          </div>
        </div>
      </section>

      <div class="work-side work-side-right">
        <section class="work-panel">
          <div class="work-panel-title"><span>★</span><h2>党员情况</h2><small>各单位党员分布</small></div>
          <div class="work-bars compact-bars">
            <div v-for="unit in units" :key="unit.unit_name" class="work-bar-row">
              <span>{{ unit.unit_name }}</span><div class="work-bar-track"><i :style="{ width: `${Number(unit.party_member_count) / max(units, 'party_member_count') * 100}%` }"></i></div><b>{{ number(unit.party_member_count) }}<small> 人</small></b>
            </div>
          </div>
          <div class="work-panel-note">明细 {{ units.length }} 家 <span>·</span> 汇总 {{ number(summary?.unit_count) }} 家，单位明细待补充</div>
        </section>
        <section class="work-panel">
          <div class="work-panel-title"><span>★</span><h2>党员年龄结构</h2><small>源表分年龄段统计</small></div>
          <div class="work-bars age-bars">
            <div v-for="item in ages" :key="item.age_group" class="work-bar-row">
              <span>{{ item.age_group }}</span><div class="work-bar-track"><i :style="{ width: `${Number(item.member_count) / max(ages, 'member_count') * 100}%` }"></i></div><b>{{ number(item.member_count) }}<small> 人</small></b>
            </div>
          </div>
          <div class="work-alert">年龄区块合计 {{ number(ageTotal) }} 人，与汇总党员数 {{ number(summary?.party_member_count) }} 人的统计范围待核对。</div>
        </section>
        <section class="work-panel">
          <div class="work-panel-title"><span>★</span><h2>在职党员结构</h2><small>科研 · 管理 · 支撑 · 博士后</small></div>
          <div class="work-position-body">
            <div class="work-position-ring" :style="positionStyle"><div><strong>{{ number(positionTotal) }}</strong><span>人 · 分类合计</span></div></div>
            <div class="work-position-list"><div v-for="(item, index) in positions" :key="item.position"><i :class="`position-tone-${index}`"></i><span>{{ item.position }}</span><b>{{ number(item.member_count) }}<small> 人</small></b><strong>{{ Number(item.ratio).toFixed(1) }}%</strong></div></div>
          </div>
          <div class="work-alert">原表比例合计 {{ positionRatio.toFixed(1) }}%，圆环按比例归一化展示，原值待核对。</div>
        </section>
      </div>
    </div>
    <div class="work-screen-footnote">{{ loading ? '正在同步数据…' : `统计周期：${summary?.period || '待确认'} · 数据源：党建工作填报表；疑点请以业务核对结果为准` }}</div>
  </div>
</template>
