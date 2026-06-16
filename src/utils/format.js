export function formatNow() {
  const now = new Date()
  return now.toLocaleString('zh-CN', { hour12: false })
}
