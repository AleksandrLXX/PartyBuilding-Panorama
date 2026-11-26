import test from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'vite'

// Exercise the real Vite modules with isolated browser storage and fetch.
test('settings persistence, validation and data source precedence', async () => {
  const values = new Map()
  globalThis.localStorage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
  }
  globalThis.window = { location: { origin: 'http://example.test' }, addEventListener() {} }
  const requests = []
  globalThis.fetch = async (url) => {
    requests.push(String(url))
    return {
      ok: true,
      json: async () => [{ label: 'api' }],
      arrayBuffer: async () => new TextEncoder().encode('label\ncsv\n').buffer,
    }
  }
  const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' })
  try {
    const config = await server.ssrLoadModule('/src/config/settings.js')
    const { getData } = await server.ssrLoadModule('/src/utils/getData.js')
    assert.equal(config.settings.carouselSeconds, 30)
    assert.throws(() => config.saveSettings({ ...config.settings, carouselSeconds: 4 }), /5 至 3600/)
    assert.throws(() => config.saveSettings({ ...config.settings, apiBaseUrl: 'https://example.test/path' }), /域名及端口/)
    const saved = config.saveSettings({ carouselEnabled: true, carouselSeconds: 5, dataSource: 'api', apiBaseUrl: 'https://api.example.test/' })
    assert.equal(saved.apiBaseUrl, 'https://api.example.test')
    assert.equal(JSON.parse(values.get(config.SETTINGS_KEY)).carouselSeconds, 5)

    values.set('data_source_home_metrics', 'csv')
    assert.deepEqual(await getData('home_metrics'), [{ label: 'api' }])
    assert.equal(requests.at(-1), 'https://api.example.test/api/dashboard/home_metrics')
    assert.deepEqual(await getData('home_metrics', { source: 'csv' }), [{ label: 'csv' }])
    config.saveSettings({ ...saved, dataSource: 'default' })
    assert.deepEqual(await getData('home_metrics'), [{ label: 'csv' }])
    config.resetSettings()
    assert.equal(values.has(config.SETTINGS_KEY), false)
    assert.equal(config.settings.carouselSeconds, 30)
    assert.equal(config.settings.dataSource, 'default')
    assert.equal(config.settings.carouselEnabled, true)
  } finally {
    await server.close()
    delete globalThis.localStorage
    delete globalThis.window
  }
})
