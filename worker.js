/* AI Readiness Check: the small server part.
   Static files are served as usual. Only /api/* runs this code.
   What is stored: a random id, the room code, a timestamp, the overall score, five area scores, the tier and the
   optional sector, seniority and workplace-access answers. Never stored: names, emails, IP addresses or answers.
   Rooms (group links) are deleted after 30 days. The "open" room is kept 12 months and only averages are published.
   A scrambled address is used only to count shares per day and is deleted after 3 days.
   If you change any of these rules, change the privacy wording in public/index.html to match. */

const AREAS = ["use", "skill", "data", "resp", "mind"];
const MAX_PER_ROOM = 500;
const KEEP_DAYS = 30;
const MIN_TO_SHOW = 5;
const OPEN_ROOM = "open";
const OPEN_KEEP_DAYS = 365;
const OPEN_MAX = 20000;
const OPEN_MIN_PUBLIC = 10;
const OPEN_PER_IP_DAY = 5;
const LEVELS = ["Emerging leader", "Senior leader", "Executive or board"];
const ACCESS = ["Yes, approved tools", "Limited or restricted", "No, not allowed", "Not sure"];
const SECTORS = ["Health & community services", "Government & public sector", "Education & research", "Finance & professional services", "Technology", "Other private sector", "Own business or consulting", "Other"];

const json = (o, status = 200) =>
  new Response(JSON.stringify(o), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });

const okRoom = (r) => typeof r === "string" && /^[a-z0-9][a-z0-9-]{2,39}$/.test(r);
const isScore = (n) => Number.isFinite(n) && n >= 0 && n <= 100;
const tierOf = (n) => (n >= 86 ? "Pacesetting" : n >= 61 ? "Leading" : n >= 31 ? "Building" : "Starting");
const avg = (a) => a.reduce((x, y) => x + y, 0) / (a.length || 1);

async function submit(request, env) {
  const len = Number(request.headers.get("content-length") || 0);
  if (len > 2000) return json({ error: "too large" }, 413);
  let b;
  try { b = await request.json(); } catch (e) { return json({ error: "bad json" }, 400); }
  const room = String(b.room || "").toLowerCase();
  if (!okRoom(room)) return json({ error: "bad room" }, 400);
  const o = Number(b.overall);
  if (!isScore(o)) return json({ error: "bad score" }, 400);
  const a = b.areas || {};
  const vals = AREAS.map((k) => Number(a[k]));
  if (!vals.every(isScore)) return json({ error: "bad areas" }, 400);

  const isOpen = room === OPEN_ROOM;
  const sector = SECTORS.includes(b.sector) ? b.sector : null;
  const level = LEVELS.includes(b.level) ? b.level : null;
  const access = ACCESS.includes(b.access) ? b.access : null;
  const count = await env.DB.prepare("SELECT COUNT(*) AS n FROM results WHERE room = ?").bind(room).first();
  if (count && count.n >= (isOpen ? OPEN_MAX : MAX_PER_ROOM)) return json({ error: "room full" }, 429);

  const now = Date.now();
  if (isOpen) {
    const day = new Date(now).toISOString().slice(0, 10);
    try {
      const k = "share:" + day + ":" + (await ipKey(request, "ai-check-share"));
      await env.DB.prepare("INSERT INTO ai_usage (k, d, n) VALUES (?,?,1) ON CONFLICT(k) DO UPDATE SET n = n + 1").bind(k, day).run();
      const row = await env.DB.prepare("SELECT n FROM ai_usage WHERE k = ?").bind(k).first();
      if (row && row.n > OPEN_PER_IP_DAY) return json({ error: "limit" }, 429);
      await env.DB.prepare("DELETE FROM ai_usage WHERE d < ?").bind(new Date(now - 3 * 86400000).toISOString().slice(0, 10)).run();
    } catch (e) { return json({ error: "limit check failed" }, 503); }
  }
  await env.DB.prepare(
    "INSERT INTO results (id, room, ts, overall, tier, use_s, skill_s, data_s, resp_s, mind_s, sector, level, access) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)"
  ).bind(crypto.randomUUID(), room, now, Math.round(o), tierOf(Math.round(o)), ...vals.map(Math.round), sector, level, access).run();
  await env.DB.prepare("DELETE FROM results WHERE room != ? AND ts < ?").bind(OPEN_ROOM, now - KEEP_DAYS * 86400000).run();
  await env.DB.prepare("DELETE FROM results WHERE room = ? AND ts < ?").bind(OPEN_ROOM, now - OPEN_KEEP_DAYS * 86400000).run();
  return json({ ok: true });
}

/* Public benchmark: averages only, never individual rows, and nothing until enough people have shared. */
async function benchmark(env) {
  const { results: rows } = await env.DB.prepare(
    "SELECT overall, use_s, skill_s, data_s, resp_s, mind_s FROM results WHERE room = ?"
  ).bind(OPEN_ROOM).all();
  const n = rows.length;
  const out = { n, ready: n >= OPEN_MIN_PUBLIC };
  if (out.ready) {
    out.overall = Math.round(avg(rows.map((r) => r.overall)));
    out.areas = Object.fromEntries(AREAS.map((k) => [k, Math.round(avg(rows.map((r) => r[k + "_s"])))]));
  }
  const res = json(out);
  res.headers.set("cache-control", "public, max-age=300");
  return res;
}

async function results(url, request, env) {
  const key = url.searchParams.get("key") || request.headers.get("x-room-key") || "";
  if (!env.ADMIN_KEY || key !== env.ADMIN_KEY) return json({ error: "unauthorised" }, 401);
  const room = (url.searchParams.get("room") || "").toLowerCase();
  if (!okRoom(room)) return json({ error: "bad room" }, 400);
  const { results: rows } = await env.DB.prepare(
    "SELECT ts, overall, use_s, skill_s, data_s, resp_s, mind_s FROM results WHERE room = ? ORDER BY ts"
  ).bind(room).all();
  const n = rows.length;
  if (n < MIN_TO_SHOW) return json({ room, n, ready: false, min: MIN_TO_SHOW });

  const tiers = { Starting: 0, Building: 0, Leading: 0, Pacesetting: 0 };
  rows.forEach((r) => tiers[tierOf(r.overall)]++);
  const areaAvg = {};
  AREAS.forEach((k) => (areaAvg[k] = Math.round(avg(rows.map((r) => r[k + "_s"])))));
  const lowest = Object.fromEntries(AREAS.map((k) => [k, 0]));
  rows.forEach((r) => {
    const m = Math.min(...AREAS.map((k) => r[k + "_s"]));
    AREAS.forEach((k) => { if (r[k + "_s"] === m) lowest[k]++; });
  });
  const hist = Array(10).fill(0);
  rows.forEach((r) => hist[Math.min(9, Math.floor(r.overall / 10))]++);
  return json({
    room, n, ready: true,
    overall: Math.round(avg(rows.map((r) => r.overall))),
    tiers, areaAvg, lowest, hist,
    rows: rows.map((r) => ({ overall: r.overall, use: r.use_s, skill: r.skill_s, data: r.data_s, resp: r.resp_s, mind: r.mind_s })),
    updated: Date.now(),
  });
}

async function ipKey(request, salt = "ptp-ai") {
  const ip = request.headers.get("cf-connecting-ip") || "unknown";
  const data = new TextEncoder().encode(ip + "|" + salt);
  const h = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(h)].slice(0, 12).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function bump(env, k, day, cap) {
  await env.DB.prepare("INSERT INTO ai_usage (k, d, n) VALUES (?,?,1) ON CONFLICT(k) DO UPDATE SET n = n + 1").bind(k, day).run();
  const row = await env.DB.prepare("SELECT n FROM ai_usage WHERE k = ?").bind(k).first();
  return row && row.n <= cap;
}

/* Creates the tables the first time the Worker runs, so a fresh deployment needs no manual database step. */
let schemaReady = false;
async function ensureSchema(env) {
  if (schemaReady) return;
  await env.DB.batch([
    env.DB.prepare("CREATE TABLE IF NOT EXISTS results (id TEXT PRIMARY KEY, room TEXT NOT NULL, ts INTEGER NOT NULL, overall INTEGER NOT NULL, tier TEXT NOT NULL, use_s INTEGER NOT NULL, skill_s INTEGER NOT NULL, data_s INTEGER NOT NULL, resp_s INTEGER NOT NULL, mind_s INTEGER NOT NULL, sector TEXT, level TEXT, access TEXT)"),
    env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_results_room ON results (room, ts)"),
    env.DB.prepare("CREATE TABLE IF NOT EXISTS ai_usage (k TEXT PRIMARY KEY, d TEXT NOT NULL, n INTEGER NOT NULL)"),
  ]);
  schemaReady = true;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith("/api/")) return env.ASSETS.fetch(request);
    try { await ensureSchema(env); } catch (e) { return json({ error: "database not ready" }, 503); }
    if (url.pathname === "/api/ai-check/submit" && request.method === "POST") return submit(request, env);
    if (url.pathname === "/api/ai-check/results" && request.method === "GET") return results(url, request, env);
    if (url.pathname === "/api/ai-check/benchmark" && request.method === "GET") return benchmark(env);
    return json({ error: "not found" }, 404);
  },
};
