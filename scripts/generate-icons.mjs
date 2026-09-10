import sharp from 'sharp'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const dir = path.dirname(fileURLToPath(import.meta.url))
const svg = readFileSync(path.join(dir, '../public/icons/app-icon-source.svg'))

const targets = [
  { file: '../public/icons/icon-192.png', size: 192 },
  { file: '../public/icons/icon-512.png', size: 512 },
  { file: '../public/icons/maskable-512.png', size: 512, padded: true },
  { file: '../public/apple-touch-icon.png', size: 180 },
]

for (const t of targets) {
  const size = t.size
  let pipeline = sharp(svg, { density: 384 }).resize(size, size)
  if (t.padded) {
    const inner = Math.round(size * 0.7)
    pipeline = sharp(svg, { density: 384 })
      .resize(inner, inner)
      .extend({
        top: Math.round((size - inner) / 2),
        bottom: Math.round((size - inner) / 2),
        left: Math.round((size - inner) / 2),
        right: Math.round((size - inner) / 2),
        background: '#1a56db',
      })
  }
  await pipeline.png().toFile(path.join(dir, t.file))
  console.log('wrote', t.file)
}
