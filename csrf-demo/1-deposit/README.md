

# CSRF & NoSQL Demo — 1-deposit

**Purpose:** a compact, hands-on demo that shows a Cross‑Site Request Forgery (CSRF) vulnerability, how an attacker can exploit it, and how the issue can be mitigated. This folder contains a vulnerable demo and a patched server so you can show both the exploit and the fix during a live presentation.

---

## 📁 Files in this folder

- `index.html` — Victim-facing bank UI (realistic look). Includes a *Developer Panel* to show logs during demos.  
- `attacker.html` — Polished fake prize page used to trigger the CSRF attack. Includes a Developer Panel to show the attack attempt and result.  
- `server.js` — **Vulnerable** backend. Accepts `/deposit` without CSRF protection (used to demonstrate the exploit).  
- `server_patched.js` — **Patched** backend. Implements CSRF defenses (SameSite cookie + CSRF token + origin checks).  
- `package.json` / `package-lock.json` — Node dependencies.  
- `giftcard.jpg` — Local image used by `attacker.html`.  
- `README.md` — (this file) contains setup and demo steps.

---

## 🛠️ Requirements

- Node.js (v16+) and npm  
- Python 3 (to serve static files simply)  
- Ports used in this demo:
  - Backend: `3001`
  - Frontend static server: `8001`

---

## ⚙️ Setup (one-time)

1. Clone the repo (if not already):
   ```bash
   git clone https://github.com/JoJo-LLC/ISEC3004-CSRF-NOSQL-Assessment.git
   cd ISEC3004-CSRF-NOSQL-Assessment/csrf-demo/1-deposit
   ```

2. Install Node dependencies:
   ```bash
   npm install
   ```

---

## ▶️ How to run (Vulnerable demo)

Open two terminals.

**Terminal A — start the vulnerable server**
```bash
cd csrf-demo/1-deposit
node server.js
# Expect: "CSRF Deposit Demo running at http://localhost:3001"
```

**Terminal B — serve the front-end**
```bash
cd csrf-demo/1-deposit
python3 -m http.server 8001
# Frontend pages available at http://localhost:8001/
```

**Demo flow (vulnerable):**
1. Open `http://localhost:8001/index.html` (victim UI). Click **Refresh Balance** and note the starting balance.  
2. Open `http://localhost:8001/attacker.html` (attacker page). It will auto-submit a hidden form and/or use `fetch()` to call `/deposit`.  
3. Return to `index.html` and click **Refresh Balance** again (or visit `http://localhost:3001/balance`). You should see the victim's balance decreased and the attacker's balance increased — proof the CSRF succeeded.

---

## ▶️ How to run (Patched demo)

Stop the vulnerable server (Ctrl+C in Terminal A), then start the patched server:

```bash
node server_patched.js
# Expect: "🔐 CSRF-Protected Server running at http://localhost:3001"
```

**Important:** Use an Incognito window or clear cookies (visit `http://localhost:3001/reset-cookie`) so there’s no stale session cookie.

**Demo flow (patched):**
1. Open `http://localhost:8001/index.html` — the Developer Panel should log `🔐 CSRF token received.`  
2. Open `http://localhost:8001/attacker.html` — the attacker will attempt the request, but the patched server will block it (HTTP 403). The attacker page's log will show a clear message like:  
   `❌ CSRF attack blocked (HTTP 403) — the server rejected this request due to missing/invalid CSRF token.`  
3. Return to `index.html` and click **Refresh Balance** — balances remain unchanged.

---

## 🔎 Demo checklist (quick copy/paste)

**Before the demo**
```bash
# in project folder
npm install
```

**Vulnerable demo**
```bash
# terminal 1
node server.js

# terminal 2
python3 -m http.server 8001
# browser: http://localhost:8001/index.html
# attacker: http://localhost:8001/attacker.html
```

**Patched demo**
```bash
# stop server.js (Ctrl+C)
node server_patched.js
# (optional) reset session
# browser: visit http://localhost:3001/reset-cookie
# use incognito or clear cookies
# pages: http://localhost:8001/index.html and http://localhost:8001/attacker.html
```

---

## 🔐 What the patch demonstrates

The patched server uses multiple layers:
- `SameSite=Strict` cookie attributes (prevents cookies being sent cross-site)  
- CSRF token (`csurf`) validated on sensitive POSTs  
- Origin header check to reject requests from unknown origins

This demonstrates defense in depth: even if one layer is misconfigured, others still provide protection.

---

## 📚 Talking points for the presentation

- What is CSRF? — a forged request that leverages the victim's authenticated session.  
- Why it works — browsers send cookies automatically for the target origin. If the server trusts any POST with a valid session cookie, an attacker can forge actions.  
- How we fixed it — add a token and SameSite cookies, and validate origin.  
- Real-world mitigations — use CSRF tokens, `SameSite` cookies, require user interaction or re‑authentication for sensitive actions.

---

## 🧰 Troubleshooting

- If `index.html` shows `$—` for balance:
  - Ensure you started the backend on port `3001`.
  - Make sure the static server is running on port `8001` and you opened `index.html` via `http://localhost:8001/index.html` (not file://).
  - Confirm `fetch()` calls in the page include `credentials: 'include'`.
  - For patched server, clear cookies (`/reset-cookie`) or use incognito to avoid stale cookies.

- If `attacker.html` shows a 403:
  - That is the patched server blocking the CSRF — that's expected during the protected demo.
  - If you intended to demo the vulnerable flow, stop the patched server and run `server.js` instead.

---

## ♻️ Resetting balances (for repeated demos)

Use the demo helper endpoint:
```bash
curl -X POST http://localhost:3001/addFunds \
  -H "Content-Type: application/json" \
  -d '{"to":"victim","amount":1000}'
```

This adds funds to any account and is intended for demo resets only.

---

## ⚠️ Notes & Caveats

- This codebase is for **educational** demonstration only. Do not run it exposed to the public internet.  
- Enabling CORS for `index.html` in the vulnerable server is a convenience for UI demos; it does not mitigate CSRF. Keep separation between attacker and victim origins when possible.

---