#!/usr/bin/env node
// auto-update.mjs — unattended refresh for OMO Skill Atlas.
// 1) regenerate data.json from the INSTALLED omo (build-data.mjs)
// 2) compare to the LIVE deployed data.json (version + skill set)
// 3) only if changed: commit data.json + `vercel deploy --prod`
// 4) print ONE machine-readable JSON status line (the cron routine notifies only on change)
//
// status: nochange | deployed | drift-deployed | error
//   drift-deployed = omo's skill SET changed -> site redeployed but a NEW skill needs a hand-curated card
//
// Usage: node auto-update.mjs [--no-deploy]
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

const DIR = import.meta.dirname;
const DEPLOY = !process.argv.includes("--no-deploy");
const SCOPE = process.env.VERCEL_SCOPE || "richardowen7212-9804s-projects";
const LIVE_URL = "https://omo-atlas.vercel.app/data.json";
const out = (o) => console.log(JSON.stringify(o));
const sh = (cmd) => execSync(cmd, { cwd: DIR, encoding: "utf8" });

// 1) regenerate data.json (build-data.mjs exits 2 on drift; that is informational, not fatal)
try { sh("node build-data.mjs"); } catch (e) {
  if (e.status !== 2) { out({ status: "error", phase: "build", error: String(e.message).slice(0, 200) }); process.exit(1); }
}

let local;
try { local = JSON.parse(readFileSync(`${DIR}/data.json`, "utf8")); }
catch (e) { out({ status: "error", phase: "read", error: String(e.message).slice(0, 160) }); process.exit(1); }

// drift = source (data.json) skill set vs hand-authored cards in index.html
let cardIds = new Set();
try {
  const html = readFileSync(`${DIR}/index.html`, "utf8");
  const m = html.match(/const DB = (\{[\s\S]*?\});\s*\n\s*const AX/);
  if (m) cardIds = new Set(JSON.parse(m[1]).skills.map((s) => s.id));
} catch {}
const srcIds = new Set(local.skills.map((s) => s.id));
const needsCard = [...srcIds].filter((x) => !cardIds.has(x)); // in omo, no card yet

// 2) compare to LIVE deployed data.json
let live = null;
try {
  const r = await fetch(`${LIVE_URL}?cb=${Date.now()}`, { cache: "no-store" });
  if (r.ok) live = await r.json();
} catch {}
if (!live) { out({ status: "error", phase: "fetch-live", note: "could not read deployed data.json; skipping deploy to avoid blind push" }); process.exit(1); }

const liveIds = new Set((live.skills || []).map((s) => s.id));
const added = [...srcIds].filter((x) => !liveIds.has(x));
const removed = [...liveIds].filter((x) => !srcIds.has(x));
const verChanged = live.omoVersion !== local.omoVersion;
const setChanged = added.length > 0 || removed.length > 0;

if (!verChanged && !setChanged) { out({ status: "nochange", version: local.omoVersion }); process.exit(0); }

// 3) changed -> commit + deploy
if (DEPLOY) {
  try {
    sh(`git add data.json index.html`);
    sh(`git -c user.name="omo-atlas-bot" -c user.email="team@madstamp.co.kr" commit -q -m "chore(auto): omo ${live.omoVersion} -> ${local.omoVersion} (skills ${live.counts?.skills}->${local.counts.skills})" || true`);
  } catch {}
  try { sh(`vercel deploy --prod --yes --scope ${SCOPE}`); }
  catch (e) { out({ status: "error", phase: "deploy", old: live.omoVersion, new: local.omoVersion, error: String(e.message).slice(0, 200) }); process.exit(1); }
}

out({
  status: needsCard.length ? "drift-deployed" : "deployed",
  old: live.omoVersion,
  new: local.omoVersion,
  added,
  removed,
  needsCard,        // new omo skills lacking a hand-curated board card
  url: "https://omo-atlas.vercel.app",
});
