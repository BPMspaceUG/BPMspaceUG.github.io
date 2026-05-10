# Security Runbook — bpmspace.com (owner-operated)

This file is the **owner-operated** part of the hardening work tracked in issue #3. Nothing in
here is executed automatically by the repo or by CI — each item is done by the domain owner /
repo owner and signed off. The repo-side hardening (CSP `<meta>`, no inline JS/CSS, local
inline-SVG icons, native `<details>` legal sections, interim privacy notice, image dimensions /
lazy-loading) shipped in PRs #4 and #5.

**Current setup (observed):** `www.bpmspace.com` is served by GitHub Pages **behind a Cloudflare
proxy** (responses show `server: cloudflare`, `cf-ray`, `cf-cache-status`; Cloudflare's Email
Address Obfuscation is on). The apex `bpmspace.com` does **not** currently resolve — only `www`
exists in DNS. Dependabot alerts are already enabled on the GitHub repo.

Each item below: **Why → Steps → Verify → Sign-off**.

---

## 1. Cloudflare response headers (highest impact — Cloudflare is already in front)

**Why.** Because the site is already proxied through Cloudflare, the response headers that a
`<meta>` tag *cannot* set are achievable today via Cloudflare — without changing hosting. These
close the gaps the repo-side `<meta>` CSP can't: clickjacking enforcement (`frame-ancestors` /
`X-Frame-Options`), MIME-sniffing (`X-Content-Type-Options`), forced HTTPS with preload (`HSTS`),
cross-origin isolation, and a CSP that browsers enforce as a *header* (with a `report-to`).

**Steps (Cloudflare dashboard → the `bpmspace.com` zone):**

1. **HSTS** — *SSL/TLS → Edge Certificates → HTTP Strict Transport Security (HSTS)*: enable;
   set `max-age` to at least `31536000` (1 year); enable **Include subdomains** and **Preload**.
   Only enable Preload once you are certain every current and future subdomain will be HTTPS-only.
2. **`X-Content-Type-Options: nosniff`** — *Rules → Transform Rules → Modify Response Header* (or
   the managed *Security → Settings* header toggles if available on the plan): add response header
   `X-Content-Type-Options` = `nosniff` for all requests.
3. **`X-Frame-Options: DENY`** *and/or* a CSP header — add response header `X-Frame-Options` =
   `DENY` (covers older browsers) and a `Content-Security-Policy` response header. The simplest
   safe value is the same policy the page already carries in `<meta>` plus `frame-ancestors`
   (which only enforces from a header):
   `default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; font-src 'self'; connect-src 'none'; form-action 'none'; frame-ancestors 'none'; base-uri 'self'; object-src 'none'; upgrade-insecure-requests`
   — **but first** open the site with DevTools, confirm zero CSP violations (Cloudflare's
   `email-decode.min.js` is served same-origin from `/cdn-cgi/` so `script-src 'self'` already
   covers it; if you ever turn on Rocket Loader, add `data-cfasync="false"` to `assets/js/main.js`'s
   `<script>` tag or it will be blocked). Consider deploying first as
   `Content-Security-Policy-Report-Only` with a `report-to`/`report-uri` for a week, then promote.
4. **`Referrer-Policy`** — `strict-origin-when-cross-origin` (the `<meta>` already sets this; a
   header makes it apply to subresources too — harmless to add).
5. **`Permissions-Policy`** — optional; the site uses no powerful features, so a restrictive
   `camera=(), microphone=(), geolocation=(), payment=()` is safe but not required.
6. **COOP / CORP** — optional for a static brochure site: `Cross-Origin-Opener-Policy: same-origin`,
   `Cross-Origin-Resource-Policy: same-origin`. Test that nothing breaks (Cloudflare's `/cdn-cgi/`
   assets are same-origin, so they're fine).

**Verify:**
```
curl -sI https://www.bpmspace.com | grep -iE 'strict-transport-security|x-content-type-options|x-frame-options|content-security-policy|referrer-policy'
```
Then paste the served CSP into <https://csp-evaluator.withgoogle.com>. Browse the site with
DevTools Console open — zero CSP violations; the obfuscated email link still decodes.

**Sign-off:** repo/domain owner. □

---

## 2. Apex domain (`bpmspace.com`) → `www` redirect

**Why.** `bpmspace.com` doesn't resolve today. Visitors who type it without `www` get nothing, and
HSTS/preload at the apex needs the apex to exist.

**Steps.** In Cloudflare DNS, add a proxied record for `bpmspace.com` (an `A`/`AAAA` to a dummy IP
like `192.0.2.1` with the orange cloud, or a `CNAME` flattening to `www.bpmspace.com`), then a
*Rules → Redirect Rule*: `Host eq "bpmspace.com"` → `301` to `https://www.bpmspace.com$1`
preserving path/query. (Alternatively keep apex unconfigured and accept www-only — but then drop
"apex" from any HSTS-preload submission.)

**Verify:** `curl -sI https://bpmspace.com` returns `301` → `https://www.bpmspace.com/`.

**Sign-off:** domain owner. □

---

## 3. DNSSEC

**Why.** Without DNSSEC, DNS answers for the domain can be spoofed by an on-path attacker.

**Steps.** In Cloudflare → *DNS → Settings → DNSSEC*: enable; copy the DS record Cloudflare shows
and add it at the **registrar** (the company where `bpmspace.com` is registered) in the parent
zone. Wait for propagation.

**Verify:** `dig @1.1.1.1 +dnssec bpmspace.com` shows `RRSIG` records and the `ad` (authenticated
data) flag. <https://dnssec-analyzer.verisignlabs.com/bpmspace.com> is green.

**Warn.** If you ever transfer the domain to another registrar, disable DNSSEC first or
coordinate the DS rollover — a stale DS record makes the domain unresolvable.

**Sign-off:** domain owner. □

---

## 4. CAA records (which CAs may issue TLS certificates — *not* email)

**Why.** A CAA record restricts which Certificate Authorities may issue TLS certs for the domain,
limiting mis-issuance. CAA has nothing to do with email.

**Steps.** First find out which CA actually issues the live cert:
```
echo | openssl s_client -servername www.bpmspace.com -connect www.bpmspace.com:443 2>/dev/null | openssl x509 -noout -issuer
```
With Cloudflare in front, the edge cert is typically issued by Google Trust Services or Let's
Encrypt; the GitHub Pages origin cert is Let's Encrypt. Add CAA records for **every** issuer that
legitimately needs to issue (and for any future ACME automation), e.g.:
```
bpmspace.com.  CAA  0 issue "letsencrypt.org"
bpmspace.com.  CAA  0 issue "pki.goog"
bpmspace.com.  CAA  0 issuewild ";"     # no wildcard certs needed
```
If unsure, it is safer to **not** publish CAA than to publish one that's too narrow.

**Verify:** `dig CAA bpmspace.com`. After ~24h, watch for failed cert renewals (Cloudflare and
GitHub will both renew automatically — a too-narrow CAA breaks that silently).

**Sign-off:** domain owner. □

---

## 5. Email authentication — SPF / DKIM / DMARC

These protect `@bpmspace.com` from being spoofed in mail. **Do them in order; do not skip the
inventory and observation steps** — a too-strict policy drops legitimate mail.

### 5a. SPF
- **Steps.** Inventory **every** system that legitimately sends mail as `@bpmspace.com` (the mail
  provider, any newsletter/CRM/ticketing tool, the office mail server). Publish **one** `TXT` on
  `bpmspace.com`: `v=spf1 include:<provider-include> [include:<other>] ~all`. Start with `~all`
  (softfail) until you're sure the list is complete; switch to `-all` (hardfail) afterwards.
- **Verify.** `dig TXT bpmspace.com` shows exactly one `v=spf1` record; test sending from each
  system and check the receiver's headers show `spf=pass`.

### 5b. DKIM
- **Steps.** Enable DKIM signing in the mail provider's admin console; it gives you a selector and
  a public key — publish it as `TXT` at `<selector>._domainkey.bpmspace.com`. Repeat for any other
  sending system that supports DKIM.
- **Verify.** `dig TXT <selector>._domainkey.bpmspace.com` returns the key; sent mail shows
  `dkim=pass` with `d=bpmspace.com`.

### 5c. DMARC (last — hard gate: monitoring mailbox must exist first)
- **Steps.**
  1. Create and **actually monitor** a mailbox for aggregate reports, e.g. `dmarc@bpmspace.com`
     (or use a DMARC report service).
  2. Publish `_dmarc.bpmspace.com  TXT  "v=DMARC1; p=none; rua=mailto:dmarc@bpmspace.com; fo=1"`.
  3. Read the aggregate reports for **2–4 weeks**. Confirm every legitimate sender passes SPF *or*
     DKIM **with alignment** (the `From:` domain matches). Fix any that don't.
  4. Only then move to `p=quarantine` (optionally with `pct=` ramp), monitor, then `p=reject`.
  5. **Rollback:** drop straight back to `p=none` if legitimate mail starts failing.
- **Verify.** `dig TXT _dmarc.bpmspace.com`; reports arriving in the mailbox; spot-check that
  mail from each real sender shows `dmarc=pass`.
- **Warn.** Never publish `p=reject` (or even `p=quarantine`) before SPF+DKIM alignment is
  confirmed for all senders — you will silently lose mail.

**Sign-off:** domain owner. □

---

## 6. Repo governance (supply-chain)

**Why.** Most supply-chain risk for a project like this lives in repo settings, not in page code.

**Steps (GitHub → repo Settings):**
- **Branch protection on `master`**: require a pull request before merging; require ≥1 approving
  review; block force-pushes; (optionally) require status checks / linear history.
- **Dependabot**: alerts are already enabled — keep them; enable security updates if desired.
- **GitHub Actions**: there are no workflows on `master` today. If/when one is added, pin every
  `uses:` action to a **full commit SHA** (not a tag), and set least-privilege `permissions:`.
- **Optional**: require signed commits; restrict who can push to `master`.

**Verify.** `git push --force origin master` is rejected for non-admins; the branch-protection
settings page reflects the above.

**Sign-off:** repo owner. □

---

## 7. Cloudflare hygiene checks

**Why.** A misconfigured Cloudflare feature can undo the repo-side hardening.

**Steps / checks.**
- **Rocket Loader**: should be **off** (it injects an inline loader script that a `script-src 'self'`
  CSP without `'unsafe-inline'` would block). If you want it on, add `data-cfasync="false"` to the
  `<script src="./assets/js/main.js">` tag in `index.html`.
- **Auto Minify / Mirage / Polish**: harmless for this static site, but if you enable an HTML
  transformer, re-check the CSP afterwards.
- **Email Address Obfuscation**: currently **on** — fine, it auto-obfuscates the `mailto:` in the
  page and serves `email-decode.min.js` same-origin from `/cdn-cgi/`.
- **Always Use HTTPS** / **Automatic HTTPS Rewrites**: enable both (belt-and-braces with the
  page's `upgrade-insecure-requests`).
- **Minimum TLS Version**: set to 1.2 (or 1.3) under *SSL/TLS → Edge Certificates*.
- **SSL/TLS mode**: should be **Full (strict)** so the Cloudflare↔GitHub-Pages leg is verified.

**Verify.** `testssl.sh https://www.bpmspace.com` — no protocol/cipher weaknesses; HSTS present
after item 1; minimum TLS 1.2.

**Sign-off:** repo/domain owner. □

---

## 8. Verification suite (run after the above)

```
# TLS / HSTS
testssl.sh https://www.bpmspace.com
curl -sI https://www.bpmspace.com | grep -iE 'strict-transport-security|x-content-type-options|x-frame-options|content-security-policy|referrer-policy'

# DNS
dig @1.1.1.1 +dnssec bpmspace.com        # RRSIG + 'ad' flag
dig CAA bpmspace.com
dig TXT bpmspace.com                       # one v=spf1 record
dig TXT _dmarc.bpmspace.com                # v=DMARC1
dig <selector>._domainkey.bpmspace.com TXT # DKIM key

# Apex redirect
curl -sI https://bpmspace.com              # 301 -> https://www.bpmspace.com/

# Page-level
#  - open https://www.bpmspace.com with DevTools: zero CSP violations; only same-origin requests
#  - paste the served Content-Security-Policy into https://csp-evaluator.withgoogle.com
#  - Lighthouse: npx lighthouse https://www.bpmspace.com --preset=desktop (x5) and mobile (x5);
#    record Performance / A11y / Best-Practices / SEO + LCP / CLS / TBT medians
```

---

## Known platform notes

- `frame-ancestors` and `X-Content-Type-Options` and the `preload` HSTS flag **cannot** be set
  from the repo (no `<meta>` equivalent) — they require the Cloudflare layer (item 1). The repo's
  `<meta>` CSP keeps `frame-ancestors 'none'` in the policy anyway, so it starts enforcing the
  moment a matching CSP **header** is added at the edge.
- The repo deliberately uses **no client-side storage** (the language toggle is in-memory; it
  resets on reload). Keeping it that way is what lets the site run with **no cookie/consent banner**.
  If anyone later adds `localStorage`/`sessionStorage` (e.g. to remember the language), revisit the
  privacy notice and the §25 TTDSG/TDDDG analysis before doing so.
- The privacy notice currently shipped (`Datenschutzerklärung` `<details>` in the footer) is a
  **minimal interim** version. The full Art. 13 GDPR text (data-protection-officer status,
  controller/processor framing, the exact third-country transfer safeguard quoted from GitHub's
  current DPA) is drafted in issue #3 and should be reviewed by a lawyer before it goes live.
