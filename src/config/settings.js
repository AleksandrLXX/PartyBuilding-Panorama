import { reactive, readonly } from 'vue'

export const SETTINGS_KEY = 'partybuilding_settings_v1'
export const DEFAULT_SETTINGS = Object.freeze({
  carouselEnabled: true,
  carouselSeconds: 30,
  dataSource: 'default',
  apiBaseUrl: '',
})

export function validateSettings(value) {
  const seconds = Number(value.carouselSeconds)
  if (!Number.isInteger(seconds) || seconds < 5 || seconds > 3600) {
    throw new Error('轮播间隔请输入 5 至 3600 之间的整数秒。')
  }
  if (!['default', 'csv', 'api'].includes(value.dataSource)) {
    throw new Error('请选择有效的数据获取方式。')
  }
  const apiBaseUrl = String(value.apiBaseUrl || '').trim()
  if (apiBaseUrl) {
    let url
    try { url = new URL(apiBaseUrl) } catch { throw new Error('API 地址必须是完整的 HTTP 或 HTTPS 地址。') }
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
      throw new Error('API 地址仅支持 HTTP(S) 域名及端口，请勿填写路径、账号或参数。')
    }
  }
  return {
    carouselEnabled: value.carouselEnabled === true,
    carouselSeconds: seconds,
    dataSource: value.dataSource,
    apiBaseUrl: apiBaseUrl ? new URL(apiBaseUrl).origin : '',
  }
}

function loadSettings() {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY)
    if (!stored) return { ...DEFAULT_SETTINGS }
    return validateSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(stored) })
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

const state = reactive(loadSettings())
export const settings = readonly(state)

export function saveSettings(value) {
  const validated = validateSettings(value)
  // Write before updating the state: a storage failure must not look like a saved setting.
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(validated))
  } catch {
    throw new Error('无法保存设置，请检查浏览器是否允许本地存储。')
  }
  Object.assign(state, validated)
  return { ...validated }
}

export function resetSettings() {
  try {
    localStorage.removeItem(SETTINGS_KEY)
  } catch {
    throw new Error('无法恢复默认设置，请检查浏览器是否允许本地存储。')
  }
  Object.assign(state, DEFAULT_SETTINGS)
  return { ...DEFAULT_SETTINGS }
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === SETTINGS_KEY || event.key === null) Object.assign(state, loadSettings())
  })
}
