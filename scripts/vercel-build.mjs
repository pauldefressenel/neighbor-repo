// Vercel build entry for both projects imported from this repository.
//
// The site and the Studio are separate Vercel projects. The intended setup gives
// the Studio project a Root Directory of `studio/` (then studio/vercel.json
// applies and this script never runs for it). When that setting is missing,
// Vercel builds the repo root for both projects, so this script decides what
// to build from the project's production hostname:
//
//   NEIGHBOR_BUILD=studio|site         explicit override (Vercel env var)
//   production URL contains studio/cms  → Studio
//   anything else                      → site
//
// Both targets write to ./dist, which vercel.json declares as the output.
import { execSync } from 'node:child_process'
import { rmSync } from 'node:fs'

const productionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? ''
const target =
  process.env.NEIGHBOR_BUILD ?? (/studio|cms/i.test(productionUrl) ? 'studio' : 'site')

const run = (cmd, cwd = '.') => {
  console.log(`\n$ ${cmd}${cwd !== '.' ? `   (in ${cwd})` : ''}`)
  execSync(cmd, { cwd, stdio: 'inherit' })
}

console.log(`vercel-build: target=${target} (production URL: ${productionUrl || 'n/a'})`)
rmSync('dist', { recursive: true, force: true })

if (target === 'studio') {
  run('npm ci', 'studio')
  run('npx sanity build ../dist --yes', 'studio')
} else {
  run('npx vite build')
  run('node scripts/sitemap.mjs')
}
