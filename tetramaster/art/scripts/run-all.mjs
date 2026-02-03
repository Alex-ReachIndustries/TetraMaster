/**
 * Run full TetraMaster art pipeline: generate prompts then generate images.
 * Usage: from repo root, node tetramaster/art/scripts/run-all.mjs
 */
import { spawn } from 'node:child_process'
import path from 'node:path'

const ROOT = path.resolve(process.cwd())
const scriptDir = path.join(ROOT, 'tetramaster', 'art', 'scripts')

function run(script) {
  return new Promise((resolve, reject) => {
    const child = spawn('node', [script], {
      cwd: ROOT,
      stdio: 'inherit',
      shell: true,
    })
    child.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`Exit ${code}`))))
  })
}

async function main() {
  console.log('Step 1: Generate prompts...')
  await run(path.join(scriptDir, 'generate-prompts.mjs'))
  console.log('Step 2: Generate images...')
  await run(path.join(scriptDir, 'generate-images.mjs'))
  console.log('Pipeline complete.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
