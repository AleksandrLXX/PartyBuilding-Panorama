import { cp, mkdir, readdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const sourceDir = path.join(projectRoot, 'data', 'raw')
const publicDir = path.join(projectRoot, 'public', 'data')

await mkdir(publicDir, { recursive: true })
const files = (await readdir(sourceDir)).filter((file) => file.toLowerCase().endsWith('.csv'))

for (const file of files) {
  await cp(path.join(sourceDir, file), path.join(publicDir, file))
}

console.log(`Published ${files.length} CSV file(s) from data/raw to public/data.`)
