import sharp from 'sharp'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const svgPath = resolve(root, 'public/pwa-icon.svg')
const outDir = resolve(root, 'public')

mkdirSync(outDir, { recursive: true })

const svg = readFileSync(svgPath)

const targets = [
  { size: 192, name: 'pwa-192.png' },
  { size: 512, name: 'pwa-512.png' },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 512, name: 'pwa-maskable-512.png', padding: 0.12 },
]

for (const { size, name, padding = 0 } of targets) {
  const inner = Math.round(size * (1 - padding * 2))
  const buf = await sharp(svg)
    .resize(inner, inner, { fit: 'contain', background: { r: 30, g: 58, b: 138, alpha: 1 } })
    .extend({
      top: Math.round((size - inner) / 2),
      bottom: Math.round((size - inner) / 2),
      left: Math.round((size - inner) / 2),
      right: Math.round((size - inner) / 2),
      background: { r: 30, g: 58, b: 138, alpha: 1 },
    })
    .png()
    .toBuffer()
  writeFileSync(resolve(outDir, name), buf)
  console.log(`✓ ${name} (${size}x${size})`)
}
