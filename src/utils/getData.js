import { settings } from '@/config/settings'

const DEFAULT_CSV_DIR = 'data'

function getDataSource(dataset, requestedSource) {
  if (requestedSource && requestedSource !== 'auto') return requestedSource
  if (settings.dataSource !== 'default') return settings.dataSource

  try {
    const configuredSource = localStorage.getItem(`data_source_${dataset}`)
    if (configuredSource === 'api' || configuredSource === 'csv') return configuredSource

    const legacyApiFlag = localStorage.getItem(`is_api_${dataset}`)
    if (legacyApiFlag && ['1', 'true', 'yes', 'api'].includes(legacyApiFlag.toLowerCase())) return 'api'
  } catch {
    // Storage can be unavailable in private browsing or embedded contexts.
  }

  return import.meta.env.VITE_DATA_SOURCE === 'api' ? 'api' : 'csv'
}

function parseCSV(text, delimiter = ',') {
  const content = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text
  const rows = []
  let row = []
  let value = ''
  let quoted = false

  for (let index = 0; index < content.length; index += 1) {
    const character = content[index]
    if (character === '"') {
      if (quoted && content[index + 1] === '"') {
        value += '"'
        index += 1
      } else {
        quoted = !quoted
      }
    } else if (character === delimiter && !quoted) {
      row.push(value)
      value = ''
    } else if (character === '\n' && !quoted) {
      row.push(value.replace(/\r$/, ''))
      if (row.some((cell) => cell.trim() !== '')) rows.push(row)
      row = []
      value = ''
    } else {
      value += character
    }
  }

  if (value !== '' || row.length > 0) {
    row.push(value.replace(/\r$/, ''))
    if (row.some((cell) => cell.trim() !== '')) rows.push(row)
  }

  if (rows.length < 2) return []
  const headers = rows[0].map((header, index) => header.trim() || `col${index}`)
  return rows.slice(1).map((cells) => Object.fromEntries(
    headers.map((header, index) => [header, (cells[index] ?? '').trim()]),
  ))
}

function buildUrl(path, base) {
  try {
    return new URL(path, base || window.location.origin).toString()
  } catch {
    return `${String(base || '').replace(/\/$/, '')}/${String(path).replace(/^\//, '')}`
  }
}

async function fetchApi(dataset, apiPath) {
  const baseUrl = settings.apiBaseUrl || import.meta.env.VITE_API_BASE_URL || ''
  const endpoint = apiPath || `/api/dashboard/${encodeURIComponent(dataset)}`
  const response = await fetch(buildUrl(endpoint, baseUrl), {
    credentials: 'same-origin',
    headers: { Accept: 'application/json' },
  })
  if (!response.ok) throw new Error(`API 请求失败：${response.status} ${response.statusText}`)
  const payload = await response.json()
  return Array.isArray(payload) ? payload : (payload.data ?? payload.items ?? payload)
}

async function fetchCsv(dataset, csvPath) {
  const base = import.meta.env.BASE_URL || '/'
  const assetPath = csvPath || `${DEFAULT_CSV_DIR}/${encodeURIComponent(dataset)}.csv`
  const response = await fetch(buildUrl(assetPath, new URL(base, window.location.origin)), {
    credentials: 'same-origin',
    headers: { Accept: 'text/csv' },
  })
  if (!response.ok) throw new Error(`CSV 加载失败：${response.status} ${response.statusText} (${assetPath})`)

  const bytes = await response.arrayBuffer()
  const utf8 = new TextDecoder('utf-8').decode(bytes)
  const replacementCount = (utf8.match(/\uFFFD/g) || []).length
  if (replacementCount > 0) {
    try {
      const gb18030 = new TextDecoder('gb18030').decode(bytes)
      if ((gb18030.match(/\uFFFD/g) || []).length < replacementCount) return parseCSV(gb18030)
    } catch {
      // Older browsers may not support GB18030 labels; keep the UTF-8 decode.
    }
  }
  return parseCSV(utf8)
}

/**
 * Load a dashboard dataset from CSV or JSON API.
 * source: 'csv' | 'api' | 'auto'; auto checks global settings, per-dataset
 * overrides, then VITE_DATA_SOURCE, in that order.
 */
export async function getData(dataset, options = {}) {
  const { source = 'auto', apiPath, csvPath } = options
  const resolvedSource = getDataSource(dataset, source)
  if (resolvedSource === 'api') return fetchApi(dataset, apiPath)
  return fetchCsv(dataset, csvPath)
}

export default getData
