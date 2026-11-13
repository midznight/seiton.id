import PostalMime from "postal-mime";

const MESSAGE_TTL_SECONDS = 3600;
const MESSAGE_TTL_MS = MESSAGE_TTL_SECONDS * 1000;
const MAX_MESSAGES_PER_MAILBOX = 5;
const MAX_EMAIL_BYTES = 1024 * 1024;
const SESSION_TTL_SECONDS = 1800;
const SESSION_COOKIE = "__Host-otp_session";
const EMAIL_RE = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/i;
const HEX_64_RE = /^[a-f0-9]{64}$/i;

function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store, private",
      "Pragma": "no-cache",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "Referrer-Policy": "no-referrer",
      "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
      "Vary": "Origin",
      ...extraHeaders
    }
  });
}

function secureHtml(html) {
  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store, private",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "Referrer-Policy": "no-referrer",
      "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
      "Content-Security-Policy": "default-src 'none'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'; object-src 'none'"
    }
  });
}

function constantTimeEqual(a, b) {
  const left = new TextEncoder().encode(String(a));
  const right = new TextEncoder().encode(String(b));
  if (left.length !== right.length) return false;
  let diff = 0;
  for (let i = 0; i < left.length; i += 1) diff |= left[i] ^ right[i];
  return diff === 0;
}

function base64Url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function randomToken() {
  return base64Url(crypto.getRandomValues(new Uint8Array(32)));
}

export async function sha256(value) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(String(value)));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function normalizeAddress(value, allowedDomains = ["seiton.biz.id"]) {
  const email = String(value ?? "").trim().toLowerCase();
  if (email.length > 254 || !EMAIL_RE.test(email)) throw new Error("Format alamat email tidak valid.");
  const at = email.lastIndexOf("@");
  const domain = email.slice(at + 1);
  const allowed = allowedDomains.map((item) => String(item).trim().toLowerCase()).filter(Boolean);
  if (!allowed.includes(domain)) throw new Error("Domain email belum terverifikasi untuk portal ini.");
  return email;
}

export function sanitizeText(value, maxLength = 1600) {
  return String(value ?? "")
    .replace(/\u0000/g, "")
    .replace(/[\u0001-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+/g, " ")
    .trim()
    .slice(0, maxLength);
}

export function extractOtpCodes(value) {
  const matches = String(value ?? "").match(/\b\d{4,8}\b/g) || [];
  return [...new Set(matches)].slice(0, 5);
}

function allowedDomains(env) {
  return String(env.OTP_ALLOWED_DOMAINS || "seiton.biz.id")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

function mailboxIdFor(email) {
  return sha256(email);
}

function cookieValue(request) {
  for (const part of String(request.headers.get("Cookie") || "").split(";")) {
    const item = part.trim();
    const separator = item.indexOf("=");
    if (separator > 0 && item.slice(0, separator) === SESSION_COOKIE) {
      return item.slice(separator + 1);
    }
  }
  return "";
}

function sessionCookie(value, maxAge = SESSION_TTL_SECONDS) {
  return SESSION_COOKIE + "=" + value + "; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=" + maxAge;
}

function sameOrigin(request) {
  const origin = request.headers.get("Origin");
  if (!origin) return false;
  try {
    const parsed = new URL(origin);
    const requestUrl = new URL(request.url);
    return parsed.origin === requestUrl.origin;
  } catch {
    return false;
  }
}

function mailboxStub(env, mailboxId) {
  if (!HEX_64_RE.test(mailboxId)) throw new Error("ID mailbox tidak valid.");
  return env.MAILBOX_INDEX.get(env.MAILBOX_INDEX.idFromName(mailboxId));
}

async function doJson(stub, path, payload, method = "POST") {
  const response = await stub.fetch("https://mailbox-index.internal" + path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: payload === undefined ? undefined : JSON.stringify(payload)
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || "Operasi mailbox gagal.");
  return result;
}

function html() {
  return `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<meta name="referrer" content="no-referrer">
<meta name="theme-color" content="#0F172A">
<title>Portal OTP Privat — Seiton.id</title>
<style>
:root{color-scheme:light;--ink:#152238;--muted:#65738a;--line:#e4e9f0;--panel:#fff;--bg:#f3f5f8;--accent:#10b981}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.55 system-ui,-apple-system,"Segoe UI",sans-serif}
main{width:min(760px,calc(100% - 32px));margin:40px auto}
header{margin-bottom:22px}header p{color:var(--muted);margin:4px 0}h1{font-size:clamp(25px,5vw,34px);line-height:1.15;margin:0}
.brand{font-size:12px;letter-spacing:.14em;font-weight:800;color:#0f766e}
.notice{padding:15px;border:1px solid var(--line);border-radius:14px;background:#fff;color:var(--muted)}
.notice strong{color:var(--ink)}.messages{display:grid;gap:12px;margin-top:16px}
.message{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:17px;box-shadow:0 5px 18px #15223808}
.message-top{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap}
.subject{font-weight:750;font-size:16px}.meta{color:var(--muted);font-size:12px}
.codes{display:flex;gap:8px;flex-wrap:wrap;margin:13px 0}
.code{font:700 22px/1.2 ui-monospace,monospace;letter-spacing:.1em;background:#ecfdf5;color:#047857;border:1px solid #a7f3d0;border-radius:9px;padding:9px 12px}
button{border:0;border-radius:8px;padding:8px 11px;background:#17263c;color:#fff;font-weight:650;cursor:pointer}
button:focus-visible{outline:3px solid #6ee7b7;outline-offset:2px}
.preview{white-space:pre-wrap;overflow-wrap:anywhere;color:#536176;font-size:13px;max-height:160px;overflow:auto}
.actions{display:flex;gap:10px;align-items:center;justify-content:space-between;margin-top:14px}
footer{margin-top:28px;color:#738096;font-size:12px}
.hidden{display:none!important}
@media(max-width:520px){main{margin:24px auto}.message{padding:14px}.actions{align-items:flex-start;flex-direction:column}}
</style>
</head>
<body>
<main>
<header><div class="brand">SEITON.ID · PRIVATE MAILBOX</div><h1>Portal Kode OTP</h1><p>Inbox privat untuk alamat email yang telah didaftarkan pemiliknya.</p></header>
<section id="status" class="notice" role="status" aria-live="polite">Memeriksa tautan akses…</section>
<section id="content" class="hidden">
<div class="notice"><strong id="mailbox-label">Mailbox privat</strong><p>Email hanya terlihat oleh pemegang tautan akses khusus. Lima pesan terakhir disimpan maksimal satu jam.</p></div>
<div class="actions"><span id="updated" class="meta"></span><div><button id="refresh" type="button">Muat ulang</button> <button id="logout" type="button">Keluar</button></div></div>
<div id="messages" class="messages"></div>
</section>
<footer>Jangan bagikan tautan akses. Keluar dari portal setelah selesai. Email yang kedaluwarsa akan dihapus otomatis.</footer>
</main>
<script>
(async()=>{
 const status=document.getElementById("status"),content=document.getElementById("content"),messages=document.getElementById("messages");
 const token=(location.hash||"").slice(1);
 const setStatus=(message)=>{status.textContent=message;status.classList.remove("hidden");};
 const api=async(path,options={})=>{const response=await fetch(path,{credentials:"same-origin",cache:"no-store",...options});const data=await response.json().catch(()=>({}));if(!response.ok)throw new Error(data.error||"Permintaan gagal.");return data;};
 const copy=async(value,button)=>{try{await navigator.clipboard.writeText(value);const old=button.textContent;button.textContent="Tersalin";setTimeout(()=>button.textContent=old,1200);}catch{button.textContent="Salin tidak tersedia";}};
 function render(items){
  messages.replaceChildren();
  if(!items.length){const empty=document.createElement("div");empty.className="notice";empty.textContent="Belum ada email untuk mailbox ini. Halaman akan diperbarui saat dimuat ulang.";messages.append(empty);return;}
  for(const item of items){
   const card=document.createElement("article");card.className="message";
   const top=document.createElement("div");top.className="message-top";
   const subject=document.createElement("div");subject.className="subject";subject.textContent=item.subject||"(Tanpa subjek)";
   const time=document.createElement("div");time.className="meta";time.textContent=new Date(item.receivedAt).toLocaleString("id-ID");
   top.append(subject,time);card.append(top);
   const from=document.createElement("div");from.className="meta";from.textContent="Dari: "+(item.from||"Pengirim tidak diketahui");card.append(from);
   if(Array.isArray(item.otpCandidates)&&item.otpCandidates.length){
    const codes=document.createElement("div");codes.className="codes";
    for(const code of item.otpCandidates){const wrap=document.createElement("div");const label=document.createElement("span");label.className="code";label.textContent=code;const button=document.createElement("button");button.type="button";button.textContent="Salin kode";button.addEventListener("click",()=>copy(code,button));wrap.append(label,button);codes.append(wrap);}
    card.append(codes);
   }
   const preview=document.createElement("p");preview.className="preview";preview.textContent=item.textPreview||"Isi teks tidak tersedia.";card.append(preview);
   const copyButton=document.createElement("button");copyButton.type="button";copyButton.textContent="Salin isi pesan";copyButton.addEventListener("click",()=>copy(item.textPreview||"",copyButton));card.append(copyButton);
   messages.append(card);
  }
 }
 async function refresh(){
  const result=await api("/api/messages");
  document.getElementById("updated").textContent="Diperbarui "+new Date().toLocaleTimeString("id-ID");
  render(result.messages||[]);
 }
 try{
  if(token){
   history.replaceState(null,"",location.pathname+location.search);
   const split=token.indexOf(".");
   if(split<1)throw new Error("Tautan akses tidak valid. Minta pemilik mailbox menerbitkan tautan baru.");
   const mailboxId=token.slice(0,split),accessToken=token.slice(split+1);
   await api("/api/session",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({mailboxId,accessToken})});
  }
  await refresh();
  status.classList.add("hidden");content.classList.remove("hidden");
  document.getElementById("refresh").addEventListener("click",()=>refresh().catch(e=>setStatus(e.message)));
  document.getElementById("logout").addEventListener("click",async()=>{try{await api("/api/logout",{method:"POST"});}finally{location.reload();}});
  window.setInterval(()=>refresh().catch(e=>setStatus(e.message)),5000);
 }catch(error){setStatus(error.message||"Tautan akses tidak valid atau sudah dicabut.");}
})();
</script>
</body></html>`;
}

async function internalRequest(request, env, url) {
  const authorization = request.headers.get("Authorization") || "";
  if (!env.OTP_INTERNAL_SECRET || !constantTimeEqual(authorization, "Bearer " + env.OTP_INTERNAL_SECRET)) {
    return json({ ok: false, error: "Unauthorized." }, 401);
  }
  if (request.method === "GET" && url.pathname === "/internal/mailboxes") {
    const list = await env.MUSE_KV.list({ prefix: "otp:mailbox:", limit: 1000 });
    const items = [];
    for (const key of list.keys) {
      const value = await env.MUSE_KV.get(key.name, "json");
      if (value) items.push({ email: value.email, ownerLabel: value.ownerLabel, active: value.active, createdAt: value.createdAt });
    }
    return json({ ok: true, mailboxes: items });
  }
  if (request.method === "POST" && url.pathname === "/internal/mailboxes") {
    let body;
    try { body = await request.json(); } catch { return json({ ok: false, error: "JSON tidak valid." }, 400); }
    let email;
    try { email = normalizeAddress(body.email, allowedDomains(env)); } catch (error) { return json({ ok: false, error: error.message }, 400); }
    const mailboxId = await mailboxIdFor(email);
    const stub = mailboxStub(env, mailboxId);
    const existing = await doJson(stub, "/status", undefined, "GET");
    if (existing.active) return json({ ok: false, error: "Mailbox sudah terdaftar. Gunakan rotasi akses jika tautan perlu diganti." }, 409);
    const accessToken = randomToken();
    const tokenHash = await sha256(accessToken);
    const ownerLabel = sanitizeText(body.ownerLabel || "", 80);
    await doJson(stub, "/provision", { email, tokenHash, ownerLabel, createdAt: new Date().toISOString() });
    await env.MUSE_KV.put("otp:mailbox:" + mailboxId, JSON.stringify({
      mailboxId, email, ownerLabel, active: true, createdAt: new Date().toISOString()
    }));
    const portal = String(env.OTP_PORTAL_URL || "https://otp.seiton.biz.id").replace(/\/$/, "");
    return json({ ok: true, mailboxId, email, ownerLabel, accessUrl: portal + "/#" + mailboxId + "." + accessToken });
  }
  if (request.method === "POST" && url.pathname === "/internal/mailboxes/revoke") {
    let body;
    try { body = await request.json(); } catch { return json({ ok: false, error: "JSON tidak valid." }, 400); }
    let email;
    try { email = normalizeAddress(body.email, allowedDomains(env)); } catch (error) { return json({ ok: false, error: error.message }, 400); }
    const mailboxId = await mailboxIdFor(email);
    await doJson(mailboxStub(env, mailboxId), "/revoke", {});
    await env.MUSE_KV.put("otp:mailbox:" + mailboxId, JSON.stringify({
      mailboxId, email, active: false, revokedAt: new Date().toISOString()
    }));
    return json({ ok: true, revoked: true });
  }
  if (request.method === "POST" && url.pathname === "/internal/mailboxes/rotate") {
    let body;
    try { body = await request.json(); } catch { return json({ ok: false, error: "JSON tidak valid." }, 400); }
    let email;
    try { email = normalizeAddress(body.email, allowedDomains(env)); } catch (error) { return json({ ok: false, error: error.message }, 400); }
    const mailboxId = await mailboxIdFor(email);
    const accessToken = randomToken();
    const tokenHash = await sha256(accessToken);
    await doJson(mailboxStub(env, mailboxId), "/rotate", { tokenHash });
    const portal = String(env.OTP_PORTAL_URL || "https://otp.seiton.biz.id").replace(/\/$/, "");
    return json({ ok: true, mailboxId, email, accessUrl: portal + "/#" + mailboxId + "." + accessToken });
  }
  return json({ ok: false, error: "Not found." }, 404);
}

export class MailboxIndex {
  constructor(state, env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request) {
    const url = new URL(request.url);
    if (request.method === "GET" && url.pathname === "/status") {
      const mailbox = await this.state.storage.get("mailbox");
      return json({ active: mailbox?.active === true });
    }
    if (request.method === "POST" && url.pathname === "/provision") {
      const body = await request.json();
      const previous = await this.state.storage.get("mailbox");
      if (previous?.active === true) return json({ ok: false, error: "Mailbox sudah aktif." }, 409);
      await this.state.storage.put("mailbox", {
        email: body.email,
        ownerLabel: body.ownerLabel,
        tokenHash: body.tokenHash,
        active: true,
        createdAt: body.createdAt
      });
      return json({ ok: true });
    }
    if (request.method === "POST" && url.pathname === "/rotate") {
      const body = await request.json();
      const mailbox = await this.state.storage.get("mailbox");
      if (!mailbox?.active) return json({ ok: false, error: "Mailbox tidak aktif." }, 404);
      mailbox.tokenHash = body.tokenHash;
      await this.state.storage.put("mailbox", mailbox);
      await this.clearSessions();
      return json({ ok: true });
    }
    if (request.method === "POST" && url.pathname === "/revoke") {
      const mailbox = await this.state.storage.get("mailbox");
      if (mailbox) {
        mailbox.active = false;
        mailbox.tokenHash = "";
        mailbox.revokedAt = new Date().toISOString();
        await this.state.storage.put("mailbox", mailbox);
      }
      await this.clearMessages();
      await this.clearSessions();
      return json({ ok: true });
    }
    if (request.method === "POST" && url.pathname === "/session") {
      const body = await request.json();
      const mailbox = await this.state.storage.get("mailbox");
      if (!mailbox?.active || !constantTimeEqual(mailbox.tokenHash || "", body.tokenHash || "")) {
        return json({ ok: false, error: "Tautan akses tidak valid atau sudah dicabut." }, 401);
      }
      if (!HEX_64_RE.test(String(body.sessionHash || "")) || !Number.isFinite(Number(body.expiresAt)) || Number(body.expiresAt) <= Date.now()) {
        return json({ ok: false, error: "Sesi tidak valid." }, 400);
      }
      await this.state.storage.put("session:" + body.sessionHash, { expiresAt: Number(body.expiresAt) });
      await this.scheduleCleanup();
      return json({ ok: true, ownerLabel: mailbox.ownerLabel || "", email: mailbox.email });
    }
    if (request.method === "POST" && url.pathname === "/logout") {
      const body = await request.json();
      await this.state.storage.delete("session:" + body.sessionHash);
      return json({ ok: true });
    }
    if (request.method === "POST" && url.pathname === "/append") {
      const body = await request.json();
      const mailbox = await this.state.storage.get("mailbox");
      if (!mailbox?.active) return json({ ok: false, error: "Mailbox tidak aktif." }, 550);
      return await this.appendMessage(body);
    }
    if (request.method === "GET" && url.pathname === "/messages") {
      const sessionHash = url.searchParams.get("sessionHash") || "";
      const session = HEX_64_RE.test(sessionHash) ? await this.state.storage.get("session:" + sessionHash) : null;
      const mailbox = await this.state.storage.get("mailbox");
      if (!mailbox?.active || !session || session.expiresAt < Date.now()) {
        if (sessionHash) await this.state.storage.delete("session:" + sessionHash);
        return json({ ok: false, error: "Sesi tidak valid atau sudah kedaluwarsa." }, 401);
      }
      const items = await this.readMessages();
      return json({ ok: true, email: mailbox.email, ownerLabel: mailbox.ownerLabel || "", messages: items });
    }
    return json({ ok: false, error: "Not found." }, 404);
  }

  async appendMessage(body) {
    const now = Date.now();
    let items = (await this.state.storage.get("messages")) || [];
    const valid = items.filter((item) => item.expiresAt > now);
    for (const old of items.filter((item) => item.expiresAt <= now)) {
      await this.env.OTP_KV.delete(old.key);
    }
    if (!HEX_64_RE.test(String(body.id || "")) || !body.record || body.record.id !== body.id) {
      return json({ ok: false, error: "Pesan tidak valid." }, 400);
    }
    const key = "mail:" + body.mailboxId + ":" + body.id;
    if (!valid.some((item) => item.id === body.id)) {
      await this.env.OTP_KV.put(key, JSON.stringify(body.record), { expirationTtl: MESSAGE_TTL_SECONDS });
      valid.push({ id: body.id, key, receivedAt: body.record.receivedAt, expiresAt: now + MESSAGE_TTL_MS });
    }
    valid.sort((a, b) => Date.parse(a.receivedAt) - Date.parse(b.receivedAt));
    const dropped = valid.slice(0, Math.max(0, valid.length - MAX_MESSAGES_PER_MAILBOX));
    for (const item of dropped) await this.env.OTP_KV.delete(item.key);
    const retained = valid.slice(-MAX_MESSAGES_PER_MAILBOX);
    await this.state.storage.put("messages", retained);
    if (retained.length) await this.state.storage.setAlarm(Math.min(...retained.map((item) => item.expiresAt)));
    else await this.state.storage.deleteAlarm();
    return json({ ok: true, stored: true });
  }

  async readMessages() {
    const now = Date.now();
    const items = (await this.state.storage.get("messages")) || [];
    const valid = items.filter((item) => item.expiresAt > now);
    const expired = items.filter((item) => item.expiresAt <= now);
    for (const item of expired) await this.env.OTP_KV.delete(item.key);
    if (valid.length !== items.length) await this.state.storage.put("messages", valid);
    const records = [];
    for (const item of [...valid].sort((a, b) => Date.parse(b.receivedAt) - Date.parse(a.receivedAt))) {
      const value = await this.env.OTP_KV.get(item.key, "json");
      if (value) records.push(value);
    }
    return records;
  }

  async clearMessages() {
    const items = (await this.state.storage.get("messages")) || [];
    for (const item of items) await this.env.OTP_KV.delete(item.key);
    await this.state.storage.delete("messages");
    await this.state.storage.deleteAlarm();
  }

  async scheduleCleanup() {
    const deadlines = [];
    const messages = (await this.state.storage.get("messages")) || [];
    deadlines.push(...messages.map((item) => item.expiresAt));
    const sessions = await this.state.storage.list({ prefix: "session:" });
    deadlines.push(...[...sessions.values()].map((item) => item.expiresAt));
    if (deadlines.length) await this.state.storage.setAlarm(Math.min(...deadlines));
    else await this.state.storage.deleteAlarm();
  }

  async clearSessions() {
    const entries = await this.state.storage.list({ prefix: "session:" });
    await this.state.storage.delete([...entries.keys()]);
  }

  async alarm() {
    await this.readMessages();
    const sessions = await this.state.storage.list({ prefix: "session:" });
    const now = Date.now();
    const expired = [...sessions].filter(([, value]) => value.expiresAt <= now).map(([key]) => key);
    if (expired.length) await this.state.storage.delete(expired);
    await this.scheduleCleanup();
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    try {
      if (url.pathname === "/health" && request.method === "GET") {
        return json({ ok: true, service: "seiton-otp-portal", status: "ready" });
      }
      if (url.pathname === "/" && request.method === "GET") return secureHtml(html());
      if (url.pathname.startsWith("/internal/")) return await internalRequest(request, env, url);
      if (url.pathname === "/api/session" && request.method === "POST") {
        if (!sameOrigin(request)) return json({ ok: false, error: "Origin tidak diizinkan." }, 403);
        let body;
        try { body = await request.json(); } catch { return json({ ok: false, error: "JSON tidak valid." }, 400); }
        if (!HEX_64_RE.test(String(body.mailboxId || "")) || String(body.accessToken || "").length < 32) {
          return json({ ok: false, error: "Tautan akses tidak valid." }, 400);
        }
        const sessionToken = randomToken();
        const sessionHash = await sha256(sessionToken);
        const expiresAt = Date.now() + SESSION_TTL_SECONDS * 1000;
        const result = await doJson(mailboxStub(env, body.mailboxId), "/session", {
          tokenHash: await sha256(body.accessToken),
          sessionHash,
          expiresAt
        });
        const cookie = body.mailboxId + "." + sessionToken;
        return json({ ok: true, ownerLabel: result.ownerLabel, email: result.email }, 200, {
          "Set-Cookie": sessionCookie(cookie)
        });
      }
      if (url.pathname === "/api/messages" && request.method === "GET") {
        const cookie = cookieValue(request);
        const separator = cookie.indexOf(".");
        if (separator < 1) return json({ ok: false, error: "Silakan buka tautan akses privat." }, 401);
        const mailboxId = cookie.slice(0, separator);
        const sessionToken = cookie.slice(separator + 1);
        if (!HEX_64_RE.test(mailboxId) || sessionToken.length < 32) return json({ ok: false, error: "Sesi tidak valid." }, 401);
        return await mailboxStub(env, mailboxId).fetch("https://mailbox-index.internal/messages?sessionHash=" + await sha256(sessionToken));
      }
      if (url.pathname === "/api/logout" && request.method === "POST") {
        if (!sameOrigin(request)) return json({ ok: false, error: "Origin tidak diizinkan." }, 403);
        const cookie = cookieValue(request);
        const separator = cookie.indexOf(".");
        if (separator > 0) {
          const mailboxId = cookie.slice(0, separator);
          const sessionToken = cookie.slice(separator + 1);
          if (HEX_64_RE.test(mailboxId) && sessionToken.length >= 32) {
            await doJson(mailboxStub(env, mailboxId), "/logout", { sessionHash: await sha256(sessionToken) });
          }
        }
        return json({ ok: true }, 200, { "Set-Cookie": sessionCookie("", 0) });
      }
      return json({ ok: false, error: "Not found." }, 404);
    } catch (error) {
      console.error(JSON.stringify({ event: "otp_portal_error", message: sanitizeText(error?.message || "Unknown error", 180) }));
      return json({ ok: false, error: "Permintaan belum dapat diproses." }, 500);
    }
  },

  async email(message, env) {
    const recipient = String(message.to || "").trim().toLowerCase();
    let email;
    try {
      email = normalizeAddress(recipient, allowedDomains(env));
    } catch {
      message.setReject("Recipient domain is not enabled for this portal.");
      return;
    }
    if (Number(message.rawSize || 0) > MAX_EMAIL_BYTES) {
      message.setReject("Message exceeds the mailbox portal size limit.");
      return;
    }
    const mailboxId = await mailboxIdFor(email);
    const stub = mailboxStub(env, mailboxId);
    const status = await doJson(stub, "/status", undefined, "GET");
    if (!status.active) {
      message.setReject("This mailbox has not been provisioned.");
      return;
    }
    try {
      const parsed = await PostalMime.parse(message.raw, {
        maxNestingDepth: 12,
        maxPartCount: 80,
        maxHeadersSize: 65536
      });
      const plain = sanitizeText(parsed.text || "", 1600);
      const fallback = sanitizeText(String(parsed.html || "").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<[^>]+>/g, " "), 1600);
      const textPreview = plain || fallback;
      const messageId = sanitizeText(parsed.messageId || "", 220);
      const stableId = await sha256(messageId || [recipient, parsed.subject || "", parsed.date || "", crypto.randomUUID()].join("|"));
      const receivedAt = new Date().toISOString();
      const record = {
        id: stableId,
        from: sanitizeText(message.from || parsed.from?.address || "", 180),
        subject: sanitizeText(parsed.subject || "(Tanpa subjek)", 180),
        receivedAt,
        textPreview,
        otpCandidates: extractOtpCodes([parsed.subject || "", textPreview].join("\n"))
      };
      const response = await doJson(stub, "/append", { mailboxId, id: stableId, record });
      if (!response.stored) message.setReject("Message could not be stored.");
    } catch (error) {
      console.error(JSON.stringify({ event: "otp_email_parse_failed", recipientHash: mailboxId, code: sanitizeText(error?.code || error?.message || "parse_error", 80) }));
      message.setReject("Message could not be processed.");
    }
  }
};
