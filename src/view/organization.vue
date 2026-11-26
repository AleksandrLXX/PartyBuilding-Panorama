<script setup>
import { computed, onMounted, ref } from 'vue'
import { getData } from '@/utils/getData'

const metrics = ref([])
const units = ref([])
const structure = ref([])
const activeDimension = ref('年龄')
const loading = ref(true)
const error = ref('')
const distribution = computed(() => structure.value.filter((item) => item.dimension === activeDimension.value))
const maxMemberCount = computed(() => Math.max(1, ...units.value.map((item) => Number(item.member_count || 0))))
const sortedUnits = computed(() => [...units.value].sort((a, b) => Number(b.member_count) - Number(a.member_count)))
const totalMembers = computed(() => units.value.reduce((sum, item) => sum + Number(item.member_count || 0), 0))
const ringStyle = computed(() => {
  let start = 0
  const colors = ['#ffd77b', '#ffad43', '#ff794a', '#d84432', '#b91d26', '#8e111c']
  const segments = distribution.value.map((item, index) => {
    const end = start + Number(item.ratio || 0)
    const segment = `${colors[index % colors.length]} ${start}% ${end}%`
    start = end
    return segment
  })
  return { background: `conic-gradient(${segments.join(', ') || '#65202a 0 100%'})` }
})

onMounted(async () => {
  try {
    const [metricRows, unitRows, structureRows] = await Promise.all([
      getData('org_metrics'),
      getData('org_units'),
      getData('org_member_structure'),
    ])
    metrics.value = metricRows
    units.value = unitRows
    structure.value = structureRows
  } catch (loadError) {
    error.value = loadError.message || '组织建设数据加载失败'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="view-page organization-page">
    <div class="page-heading">
      <div>
        <p class="eyebrow">PARTY ORGANIZATION · FOUNDATION</p>
        <h1>组织建设</h1>
        <p class="page-subtitle">织密基层组织体系 · 激活高质量发展红色引擎</p>
      </div>
      <div class="demo-badge"><span>DEMO</span> 演示样例 · 待实际数据替换</div>
    </div>
    <div v-if="error" class="data-error">{{ error }}。请确认 CSV 文件已同步，或检查接口配置。</div>

    <section class="org-kpis">
      <article v-for="(item, index) in metrics" :key="item.id" :class="['org-kpi', `org-kpi-${index + 1}`]">
        <div class="org-kpi-icon">{{ ['▦', '✥', '♟', '◉'][index] || '✦' }}</div>
        <div><span>{{ item.label }}</span><strong>{{ Number(item.value).toLocaleString('zh-CN') }}<small>{{ item.unit }}</small></strong><em>{{ item.caption }}</em></div>
        <span class="org-kpi-glow"></span>
      </article>
    </section>

    <div class="org-grid">
      <section class="glass-panel org-structure-panel">
        <div class="panel-heading">
          <div><span class="section-index">01</span><h2>组织体系架构</h2></div>
          <span class="panel-chip">纵向贯通 · 横向协同</span>
        </div>
        <div class="org-tree">
          <div class="tree-root"><span class="tree-icon">党</span><div><b>研究所党委</b><small>政治核心 · 统筹引领</small></div><strong>1<small> 个</small></strong></div>
          <div class="tree-stem"></div>
          <div class="tree-branches">
            <div v-for="(unit, index) in units.slice(0, 4)" :key="unit.unit_name" class="tree-branch">
              <span class="tree-connector"></span>
              <div class="tree-unit"><i>{{ String(index + 1).padStart(2, '0') }}</i><b>{{ unit.unit_name }}</b><span>{{ unit.party_branch_count }} 个支部</span></div>
            </div>
          </div>
          <div class="tree-caption"><span></span> 党委统领 <b>→</b> 基层党组织 <b>→</b> 党员先锋队</div>
        </div>
        <div class="org-strength">
          <div><span class="strength-icon">✧</span><b>组织覆盖到位</b><small>应建尽建、规范运行</small></div>
          <div><span class="strength-icon">⌘</span><b>支部建在一线</b><small>融入科研与服务场景</small></div>
          <div><span class="strength-icon">✦</span><b>先锋作用突出</b><small>凝聚党员骨干力量</small></div>
        </div>
      </section>

      <section class="glass-panel org-analysis-panel">
        <div class="panel-heading">
          <div><span class="section-index">02</span><h2>党员队伍结构</h2></div>
          <div class="segmented-tabs">
            <button :class="{ selected: activeDimension === '年龄' }" @click="activeDimension = '年龄'">年龄结构</button>
            <button :class="{ selected: activeDimension === '岗位' }" @click="activeDimension = '岗位'">岗位结构</button>
          </div>
        </div>
        <div class="structure-overview">
          <div class="donut-wrap">
            <div class="donut-ring" :style="ringStyle"><div class="donut-hole"><strong>{{ activeDimension === '年龄' ? '年龄' : '岗位' }}</strong><span>结构占比</span></div></div>
            <div class="donut-orbit"></div>
          </div>
          <div class="structure-legend">
            <div v-for="(item, index) in distribution" :key="item.item" class="structure-legend-row">
              <span :class="['legend-square', `tone-${index % 6}`]"></span><span>{{ item.item }}</span><b>{{ item.ratio }}<small>%</small></b>
              <div class="structure-mini-track"><i :style="{ width: `${item.ratio}%` }"></i></div>
            </div>
          </div>
        </div>
        <div class="structure-note"><span>i</span><p>{{ activeDimension }}维度样例覆盖 {{ distribution.reduce((sum, item) => sum + Number(item.count), 0).toLocaleString('zh-CN') }} 人；比例按演示数据计算。</p></div>
        <div class="org-summary-cards">
          <div><span>基层组织覆盖</span><b>多层级</b><small>党委 · 党支部 · 党小组</small></div>
          <div><span>建强战斗堡垒</span><b>全链条</b><small>组织设置 · 党员教育 · 作用发挥</small></div>
        </div>
      </section>

      <section class="glass-panel org-roster-panel">
        <div class="panel-heading">
          <div><span class="section-index">03</span><h2>基层单位画像</h2></div>
          <span class="panel-chip">{{ units.length }} 个样例单位</span>
        </div>
        <div class="roster-total"><div><strong>{{ totalMembers.toLocaleString('zh-CN') }}</strong><span>党员样例总数</span></div><div class="roster-total-mark">组织有形<br />覆盖有效</div></div>
        <div class="roster-list">
          <div v-for="(unit, index) in sortedUnits" :key="unit.unit_name" class="roster-row">
            <span class="roster-index">{{ String(index + 1).padStart(2, '0') }}</span>
            <div class="roster-row-main"><div><b>{{ unit.unit_name }}</b><span>{{ unit.unit_type }}</span></div><i><em :style="{ width: `${Number(unit.member_count) / maxMemberCount * 100}%` }"></em></i></div>
            <strong>{{ Number(unit.member_count).toLocaleString('zh-CN') }}<small>人</small></strong>
          </div>
        </div>
        <div class="roster-foot"><span>结构清晰</span><i></i><span>运行规范</span><i></i><span>活力充沛</span></div>
      </section>
    </div>
    <div class="page-disclaimer">{{ loading ? '正在同步数据…' : '当前单位、队伍及指标均为 UI 演示样例，不代表研究所实际统计结果。' }}</div>
  </div>
</template>
