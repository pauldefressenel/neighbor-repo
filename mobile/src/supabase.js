// The neighbours' Supabase project (see the root CLAUDE.md and
// supabase/migrations). Articles stay in Sanity (sanity.js); this is only
// for the readers. The key is the project's public one, made to ship inside
// apps: it can read only what the database's rules let anyone read, here
// the `neighbours` view (first name, avatar, country, activity, date) and
// the public avatars. Plain REST for now; supabase-js comes with sign-in.
const URL = 'https://btwgwcmxercrdrncqerp.supabase.co'
const KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0d2d3Y214ZXJjcmRybmNxZXJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE2NDY1NjgsImV4cCI6MjEwNzIyMjU2OH0.zO6bUbvaVXJsnw3_SG5Xui5U8vLJ_IHcNFvy5NAx8RM'

export const avatarUrl = (path) => `${URL}/storage/v1/object/public/avatars/${path}`

export async function getNeighbours() {
  const res = await fetch(`${URL}/rest/v1/neighbours?select=id,first_name,avatar_path,activity,created_at`, {
    headers: { apikey: KEY },
  })
  if (!res.ok) throw new Error(`neighbours: ${res.status}`)
  return res.json()
}
