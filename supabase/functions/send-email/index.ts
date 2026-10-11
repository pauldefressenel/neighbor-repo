// @ts-nocheck: written as plain JavaScript, like letter.js, so that Deno's
// type checks don't stop a deploy over missing annotations.
// Supabase Auth's Send Email Hook: every e-mail Auth would send (the
// sign-in code above all) comes here instead of going out through SMTP and
// the dashboard's templates, so the letter can carry the day's date
// (letter.js). It is sent through Brevo's API from admin@theneighborr.com,
// the sender authenticated in Brevo (DKIM, DMARC in GoDaddy's DNS).
//
// Secrets (Edge Functions > Secrets, or `supabase secrets set`):
//   SEND_EMAIL_HOOK_SECRET  from Authentication > Auth Hooks, "v1,whsec_..."
//   BREVO_API_KEY           Brevo > SMTP & API > API keys (not the SMTP key)
// Deployed without JWT checks (Auth calls it with a signed webhook instead):
//   npx supabase functions deploy send-email --project-ref btwgwcmxercrdrncqerp --no-verify-jwt --use-api
import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0'
import { letter } from './letter.js'

const SENDER = { name: 'The Neighbor', email: 'admin@theneighborr.com' }

// Which letter each of Auth's e-mails gets. `signup` is a new address,
// `magiclink` a known one signing in with a code. The notifications carry
// no code and aren't turned on, so they are let through unsent.
const KINDS = {
  signup: 'signup',
  invite: 'signup',
  magiclink: 'back',
  email: 'back',
  recovery: 'code',
  reauthentication: 'code',
  email_change: 'code',
}

const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json({ error: { http_code: 405, message: 'POST only' } }, 405)

  const payload = await req.text()
  let user, email_data
  try {
    const secret = Deno.env.get('SEND_EMAIL_HOOK_SECRET').replace('v1,whsec_', '')
    ;({ user, email_data } = new Webhook(secret).verify(payload, Object.fromEntries(req.headers)))
  } catch (error) {
    return json({ error: { http_code: 401, message: `Invalid signature: ${error.message}` } }, 401)
  }

  const action = email_data.email_action_type
  const kind = KINDS[action]
  if (!kind) return json({})

  // With "Secure email change" on, Auth asks for two e-mails at once; the
  // fields are crossed (see Supabase's docs): `token` goes to the current
  // address, `token_new` to the new one.
  const sends =
    action === 'email_change'
      ? [
          { to: user.email, code: email_data.token },
          { to: user.new_email ?? email_data.new_email, code: email_data.token_new },
        ].filter((s) => s.to && s.code)
      : [{ to: user.email, code: email_data.token }]

  const lang = user.user_metadata?.lang
  try {
    for (const { to, code } of sends) {
      const { subject, html, text } = letter({ kind, lang, code })
      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: { 'api-key': Deno.env.get('BREVO_API_KEY'), 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({ sender: SENDER, to: [{ email: to }], subject, htmlContent: html, textContent: text }),
      })
      if (!res.ok) throw new Error(`Brevo ${res.status}: ${await res.text()}`)
    }
  } catch (error) {
    // Auth then tells the app the e-mail couldn't be sent.
    return json({ error: { http_code: 500, message: error.message } }, 500)
  }
  return json({})
})
