import test from "node:test";
import assert from "node:assert/strict";
import worker, { extractOtpCodes, normalizeAddress, sanitizeText, sha256, MailboxIndex } from "../src/index.js";

class MemoryStorage {
  constructor() { this.data = new Map(); this.alarm = null; }
  async get(key) { return this.data.get(key); }
  async put(key, value) { this.data.set(key, structuredClone(value)); }
  async delete(key) {
    if (Array.isArray(key)) { let n = 0; for (const item of key) n += this.data.delete(item) ? 1 : 0; return n; }
    return this.data.delete(key);
  }
  async list({ prefix = "" } = {}) { return new Map([...this.data].filter(([key]) => key.startsWith(prefix))); }
  async setAlarm(time) { this.alarm = time; }
  async deleteAlarm() { this.alarm = null; }
}
function makeState() {
  const storage = new MemoryStorage();
  return { storage, id: { toString: () => "mock-mailbox" } };
}
function makeKV() {
  const map = new Map();
  return {
    map,
    async put(key, value, options) { map.set(key, { value, options }); },
    async get(key, type) {
      const item = map.get(key);
      if (!item) return null;
      return type === "json" ? JSON.parse(item.value) : item.value;
    },
    async delete(key) { map.delete(key); }
  };
}

test("normalizeAddress allows only normalized, approved domain addresses", () => {
  assert.equal(normalizeAddress(" QA99@Seiton.biz.id ", ["seiton.biz.id"]), "qa99@seiton.biz.id");
  assert.throws(() => normalizeAddress("qa@example.com", ["seiton.biz.id"]));
  assert.throws(() => normalizeAddress("not-an-email", ["seiton.biz.id"]));
});

test("OTP extraction returns unique 4–8 digit candidates only", () => {
  assert.deepEqual(extractOtpCodes("Kode Verifikasi: 849201. Ref: 123456789. Kode: 849201"), ["849201"]);
  assert.deepEqual(extractOtpCodes("No code here"), []);
});

test("message sanitization removes control characters and enforces a length limit", () => {
  assert.equal(sanitizeText("Hallo\u0000\u0007  dunia", 20), "Hallo dunia");
  assert.equal(sanitizeText("123456", 4), "1234");
});

test("mailbox access token is hashed before storage and sessions are mailbox-bound", async () => {
  const state = makeState();
  const kv = makeKV();
  const env = { OTP_KV: kv };
  const object = new MailboxIndex(state, env);
  const tokenHash = await sha256("a".repeat(48));
  const provision = await object.fetch(new Request("https://do/provision", {
    method: "POST", body: JSON.stringify({ email: "qa99@seiton.biz.id", tokenHash, ownerLabel: "QA", createdAt: new Date().toISOString() })
  }));
  assert.equal(provision.status, 200);
  const invalid = await object.fetch(new Request("https://do/session", {
    method: "POST", body: JSON.stringify({ tokenHash: await sha256("b".repeat(48)), sessionHash: await sha256("s1"), expiresAt: Date.now() + 10000 })
  }));
  assert.equal(invalid.status, 401);
  const valid = await object.fetch(new Request("https://do/session", {
    method: "POST", body: JSON.stringify({ tokenHash, sessionHash: await sha256("s2"), expiresAt: Date.now() + 10000 })
  }));
  assert.equal(valid.status, 200);
  const messages = await object.fetch(new Request("https://do/messages?sessionHash=" + await sha256("s2")));
  assert.equal(messages.status, 200);
});

test("mailbox stores only five most recent messages in OTP_KV with a one-hour TTL", async () => {
  const state = makeState();
  const kv = makeKV();
  const object = new MailboxIndex(state, { OTP_KV: kv });
  const provision = await object.fetch(new Request("https://do/provision", {
    method: "POST", body: JSON.stringify({ email: "qa99@seiton.biz.id", tokenHash: "hash", ownerLabel: "QA", createdAt: new Date().toISOString() })
  }));
  assert.equal(provision.status, 200);
  const mailboxId = "a".repeat(64);
  for (let i = 1; i <= 6; i += 1) {
    const response = await object.fetch(new Request("https://do/append", {
      method: "POST",
      body: JSON.stringify({
        mailboxId, id: "id" + i,
        record: { id: "id" + i, subject: "Code " + i, receivedAt: new Date(Date.now() + i).toISOString(), textPreview: "Kode " + i, otpCandidates: [String(1000 + i)] }
      })
    }));
    assert.equal(response.status, 200);
  }
  assert.equal(kv.map.size, 5);
  for (const value of kv.map.values()) assert.equal(value.options.expirationTtl, 3600);
  const sessionHash = await sha256("session");
  await object.fetch(new Request("https://do/session", {
    method: "POST",
    body: JSON.stringify({ tokenHash: "hash", sessionHash, expiresAt: Date.now() + 10000 })
  }));
  const response = await object.fetch(new Request("https://do/messages?sessionHash=" + sessionHash));
  const data = await response.json();
  assert.deepEqual(data.messages.map((item) => item.subject), ["Code 6", "Code 5", "Code 4", "Code 3", "Code 2"]);
});

test("revoked mailbox cannot receive or expose any further message", async () => {
  const state = makeState();
  const kv = makeKV();
  const object = new MailboxIndex(state, { OTP_KV: kv });
  await object.fetch(new Request("https://do/provision", {
    method: "POST", body: JSON.stringify({ email: "qa99@seiton.biz.id", tokenHash: "hash", createdAt: new Date().toISOString() })
  }));
  await object.fetch(new Request("https://do/revoke", { method: "POST", body: "{}" }));
  const status = await object.fetch(new Request("https://do/status"));
  assert.equal((await status.json()).active, false);
  const append = await object.fetch(new Request("https://do/append", {
    method: "POST", body: JSON.stringify({ mailboxId: "a".repeat(64), id: "x", record: {} })
  }));
  assert.equal(append.status, 550);
});


test("portal home is private, removes token from history, and auto-refreshes every five seconds", async () => {
  const response = await worker.fetch(new Request("https://otp.seiton.biz.id/"), {});
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /name="robots" content="noindex,nofollow"/);
  assert.match(html, /window\.setInterval\(\(\)=>refresh\(\)\.catch\(e=>setStatus\(e\.message\)\),5000\)/);
  assert.match(html, /history\.replaceState\(null,"",location\.pathname\+location\.search\)/);
  assert.match(html, /id="logout"/);
});

test("mailbox revocation deletes retained messages and sessions", async () => {
  const state = makeState();
  const kv = makeKV();
  const object = new MailboxIndex(state, { OTP_KV: kv });
  await object.fetch(new Request("https://do/provision", {
    method: "POST",
    body: JSON.stringify({ email: "qa99@seiton.biz.id", tokenHash: "hash", createdAt: new Date().toISOString() })
  }));
  const mailboxId = "b".repeat(64);
  await object.fetch(new Request("https://do/append", {
    method: "POST",
    body: JSON.stringify({ mailboxId, id: "c".repeat(64), record: { id: "c".repeat(64), subject: "OTP", receivedAt: new Date().toISOString(), textPreview: "123456", otpCandidates: ["123456"] } })
  }));
  const sessionHash = await sha256("private-session");
  await object.fetch(new Request("https://do/session", {
    method: "POST",
    body: JSON.stringify({ tokenHash: "hash", sessionHash, expiresAt: Date.now() + 10000 })
  }));
  await object.fetch(new Request("https://do/revoke", { method: "POST", body: "{}" }));
  assert.equal(kv.map.size, 0);
  const sessions = await state.storage.list({ prefix: "session:" });
  assert.equal(sessions.size, 0);
});
