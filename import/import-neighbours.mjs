// Moves the neighbours from the old Supabase project (paused, then exported)
// into the new one: for each of them a user (to sign in with an e-mail
// code), their profile, their avatar and the photo it was drawn from.
//
//   node import/import-neighbours.mjs            dry run: reads the backups, prints the plan
//   SUPABASE_URL=https://<ref>.supabase.co SUPABASE_SECRET_KEY=<secret> \
//     node import/import-neighbours.mjs --write
//
// It reads the two files the old project's dashboard exported, from
// ~/Downloads unless --dump / --storage say otherwise:
//   neighbor-database-backup.gz   the database (a pg_dumpall, gzipped)
//   neighbor-storage-object.zip   the storage buckets
// Nothing is extracted to disk: the dump is read in memory and each picture
// is read out of the zip with `unzip -p`.
//
// The new project must have supabase/migrations/20261010000000_neighbours.sql
// applied first. Running it again is safe: users are found by e-mail, files
// are overwritten and profiles merged, so nothing is duplicated. The
// newsletter choice is left alone (null until the neighbour answers in the
// app). No e-mail is sent to anyone.
//
// The backups and this script's output hold the neighbours' e-mail
// addresses: keep them out of the repository.

import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { extname, join } from 'node:path'
import { gunzipSync } from 'node:zlib'

const args = process.argv.slice(2)
const option = (name, fallback) => {
  const i = args.indexOf(name)
  return i >= 0 ? args[i + 1] : fallback
}
const WRITE = args.includes('--write')
const DUMP = option('--dump', join(homedir(), 'Downloads', 'neighbor-database-backup.gz'))
const STORAGE = option('--storage', join(homedir(), 'Downloads', 'neighbor-storage-object.zip'))
const OLD_REF = 'wtifsgubcdnvwxwfqxuh'

const TYPES = { '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.heic': 'image/heic' }

// The rows of one table from the dump's COPY block. Values are tab
// separated, \N is null, and text escapes \t, \n and \\.
function readTable(sql, name) {
  const lines = sql.split('\n')
  const start = lines.findIndex((l) => l.startsWith(`COPY ${name} (`))
  if (start < 0) throw new Error(`${name} isn't in the dump`)
  const cols = lines[start].slice(lines[start].indexOf('(') + 1, lines[start].indexOf(')')).split(', ')
  const unescape = (v) => (v === '\\N' ? null : v.replace(/\\(t|n|\\)/g, (_, c) => ({ t: '\t', n: '\n', '\\': '\\' })[c]))
  const rows = []
  for (const line of lines.slice(start + 1)) {
    if (line === '\\.') break
    const values = line.split('\t').map(unescape)
    rows.push(Object.fromEntries(cols.map((c, i) => [c, values[i]])))
  }
  return rows
}

// An old public address (object or image-render URL) as the file's path in
// the zip: <old ref>/<bucket>/<path>.
function zipPath(url) {
  const match = url?.match(/\/public\/([^?]+)/)
  return match ? `${OLD_REF}/${decodeURIComponent(match[1])}` : null
}

const members = readTable(gunzipSync(readFileSync(DUMP)).toString('utf8'), 'public.community_members')
const inZip = new Set(execFileSync('unzip', ['-Z1', STORAGE], { maxBuffer: 64 << 20 }).toString().split('\n'))

// What Supabase Auth accepts, roughly: a neighbour with anything else can't
// sign in with a code, so they are left out and listed.
const usable = (email) => /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(email.trim())
const skipped = members.filter((m) => !usable(m.email))

const plan = members.filter((m) => usable(m.email)).map((m) => {
  const avatar = zipPath(m.image_url)
  const photo = zipPath(m.original_image_url)
  return {
    member: m,
    avatar: avatar && inZip.has(avatar) ? avatar : null,
    photo: photo && inZip.has(photo) ? photo : null,
    missing: [avatar && !inZip.has(avatar) && 'avatar', photo && !inZip.has(photo) && 'photo'].filter(Boolean),
  }
})

const count = (test) => plan.filter(test).length
console.log(`${members.length} neighbours in the backup`)
console.log(`  ${count((p) => p.avatar)} with an avatar, ${count((p) => !p.member.image_url)} without one`)
console.log(`  ${count((p) => p.photo)} with their original photo`)
for (const m of skipped) console.log(`  ${m.firstname}: left out, the e-mail address isn't one a code can be sent to`)
for (const p of plan.filter((p) => p.missing.length)) {
  console.log(`  ${p.member.firstname}: ${p.missing.join(' and ')} named in the database but not in the zip`)
}

if (!WRITE) {
  console.log('\nDry run: nothing was written. Add --write (with SUPABASE_URL and SUPABASE_SECRET_KEY) to import.')
  process.exit(0)
}

const URL_ = process.env.SUPABASE_URL?.replace(/\/+(rest\/v1\/?)?$/, '')
const KEY = process.env.SUPABASE_SECRET_KEY
if (!URL_ || !KEY) {
  console.error('\nSet SUPABASE_URL and SUPABASE_SECRET_KEY to write.')
  process.exit(1)
}
// The new secret keys (sb_secret_…) go in the apikey header only; the
// legacy service_role key (a JWT) also as the bearer token.
const auth = KEY.startsWith('sb_') ? { apikey: KEY } : { apikey: KEY, Authorization: `Bearer ${KEY}` }

async function call(path, { method = 'GET', headers = {}, body } = {}) {
  const res = await fetch(`${URL_}${path}`, { method, headers: { ...auth, ...headers }, body })
  const text = await res.text()
  if (!res.ok) throw new Error(`${method} ${path}: ${res.status} ${text}`)
  return text ? JSON.parse(text) : null
}
const json = (value) => ({ headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(value) })

// Fails early, with a clear message, if the migration hasn't been applied.
await call('/rest/v1/profiles?select=id&limit=1').catch((err) => {
  const reason = / 401 /.test(err.message)
    ? 'The key was refused: SUPABASE_SECRET_KEY must be the project\'s secret key (sb_secret_…, under Project Settings → API Keys).'
    : "The profiles table isn't reachable: apply the migration first."
  console.error(`\n${reason}\n${err.message}`)
  process.exit(1)
})

// The users already there, by e-mail, so a second run finds them.
const users = new Map()
for (let page = 1; ; page++) {
  const { users: batch } = await call(`/auth/v1/admin/users?page=${page}&per_page=1000`)
  for (const u of batch) users.set(u.email.toLowerCase(), u.id)
  if (batch.length < 1000) break
}

async function upload(bucket, path, entry) {
  const file = execFileSync('unzip', ['-p', STORAGE, entry], { maxBuffer: 256 << 20 })
  await call(`/storage/v1/object/${bucket}/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': TYPES[extname(entry).toLowerCase()] ?? 'application/octet-stream', 'x-upsert': 'true' },
    body: file,
  })
  return path
}

let done = 0
for (const { member: m, avatar, photo } of plan) {
  const email = m.email.trim().toLowerCase()
  let id = users.get(email)
  if (!id) {
    // Confirmed, with no password: they sign in with a code. Creating a
    // user this way sends no e-mail.
    const user = await call('/auth/v1/admin/users', { method: 'POST', ...json({ email, email_confirm: true, user_metadata: { imported_from: OLD_REF } }) })
    id = user.id
    users.set(email, id)
  }
  const profile = {
    id,
    first_name: m.firstname.trim(),
    last_name: m.lastname?.trim() || null,
    location: m.location,
    activity: m.activity,
    created_at: m.created_at,
  }
  if (avatar) profile.avatar_path = await upload('avatars', `${id}${extname(avatar).toLowerCase()}`, avatar)
  if (photo) profile.photo_path = await upload('photos', `${id}/original${extname(photo).toLowerCase()}`, photo)
  await call('/rest/v1/profiles?on_conflict=id', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify(profile),
  })
  done++
  process.stdout.write(`\r  ${done} / ${plan.length} imported`)
}
console.log(skipped.length ? `\nDone. Left out: ${skipped.map((m) => m.firstname).join(', ')}.` : '\nDone.')
