// Run against a disposable headless Chromium/Edge tab at /#/settings:
// node --experimental-websocket tests/e2e/settings.cdp.mjs [debug-port]
import assert from 'node:assert/strict'
import { writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const port = process.argv[2] || '9229'
const tabs = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()
const tab = tabs.find((item) => item.type === 'page' && item.url.includes('/#/settings'))
assert.ok(tab, 'Open a disposable browser tab at /#/settings first')
const socket = new WebSocket(tab.webSocketDebuggerUrl)
await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, { once: true })
  socket.addEventListener('error', reject, { once: true })
})
let nextId = 0
const requests = new Map()
socket.addEventListener('message', (event) => {
  const message = JSON.parse(event.data)
  const pending = requests.get(message.id)
  if (!pending) return
  requests.delete(message.id)
  if (message.error) pending.reject(new Error(message.error.message))
  else pending.resolve(message.result)
})
function send(method, params = {}) {
  const id = ++nextId
  return new Promise((resolve, reject) => {
    requests.set(id, { resolve, reject })
    socket.send(JSON.stringify({ id, method, params }))
  })
}
async function evaluate(expression) {
  const result = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text)
  return result.result.value
}

try {
  await send('Runtime.enable')
  await send('Page.enable')
  const screenshot = await send('Page.captureScreenshot', { format: 'png' })
  const screenshotPath = join(tmpdir(), 'party-settings-1080.png')
  await writeFile(screenshotPath, Buffer.from(screenshot.data, 'base64'))
  console.log(`Settings screenshot: ${screenshotPath}`)

  const checks = await evaluate(`(async () => {
    const tick = () => new Promise(resolve => setTimeout(resolve, 50))
    const waitFor = (selector) => new Promise((resolve, reject) => {
      if (document.querySelector(selector)) return resolve()
      const observer = new MutationObserver(() => { if (document.querySelector(selector)) { observer.disconnect(); clearTimeout(timeout); resolve() } })
      const timeout = setTimeout(() => { observer.disconnect(); reject(new Error('Timed out waiting for ' + selector)) }, 10000)
      observer.observe(document.documentElement, { childList: true, subtree: true })
    })
    const setInput = (selector, value) => {
      const input = document.querySelector(selector)
      input.value = value
      input.dispatchEvent(new Event('input', { bubbles: true }))
      input.dispatchEvent(new Event('change', { bubbles: true }))
    }
    const submit = () => document.querySelector('.settings-layout').requestSubmit()
    document.querySelector('.settings-reset').click()
    localStorage.setItem('data_source_home_metrics', 'csv')
    setInput('#carousel-seconds', '5')
    document.querySelector('input[value="api"]').click()
    setInput('#api-origin', 'not-an-origin')
    submit()
    await tick()
    const invalidRejected = document.querySelector('[role="alert"]')?.textContent.includes('HTTP')
    setInput('#api-origin', 'http://127.0.0.1:5555')
    submit()
    await tick()
    const saved = JSON.parse(localStorage.getItem('partybuilding_settings_v1'))
    await new Promise(resolve => setTimeout(resolve, 5200))
    const staysInSettings = location.hash === '#/settings'
    window.__fetches = []
    const originalFetch = window.fetch
    window.fetch = (...args) => {
      window.__fetches.push(String(args[0]))
      if (String(args[0]).startsWith('http://127.0.0.1:5555/')) return Promise.resolve(new Response('[]', { status: 200, headers: { 'Content-Type': 'application/json' } }))
      return originalFetch(...args)
    }
    document.querySelector('.settings-back').click()
    await waitFor('.home-page')
    await tick()
    const apiWins = window.__fetches.some(url => url === 'http://127.0.0.1:5555/api/dashboard/home_metrics')
    await new Promise(resolve => setTimeout(resolve, 5500))
    const rotates = location.hash === '#/organization'
    document.querySelector('.settings-link').click()
    await waitFor('#carousel-seconds')
    await tick()
    const restored = document.querySelector('#carousel-seconds').value === '5' && document.querySelector('input[value="api"]').checked
    document.querySelector('.settings-reset').click()
    await tick()
    const reset = !localStorage.getItem('partybuilding_settings_v1') && document.querySelector('#carousel-seconds').value === '30' && document.querySelector('input[value="default"]').checked
    localStorage.removeItem('data_source_home_metrics')
    window.fetch = originalFetch
    return { invalidRejected, saved, staysInSettings, apiWins, rotates, restored, reset }
  })()`)
  assert.equal(checks.invalidRejected, true, 'invalid API address should be rejected')
  assert.deepEqual(checks.saved, { carouselEnabled: true, carouselSeconds: 5, dataSource: 'api', apiBaseUrl: 'http://127.0.0.1:5555' })
  for (const key of ['staysInSettings', 'apiWins', 'rotates', 'restored', 'reset']) assert.equal(checks[key], true, key)
  console.log('Settings interactions passed:', checks)
} finally {
  socket.close()
}
