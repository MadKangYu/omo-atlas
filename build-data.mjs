#!/usr/bin/env node
// build-data.mjs — single source of truth generator for OMO Skill Atlas.
// Scans the INSTALLED omo plugin and emits data.json (version, skills, components, hooks, mcp).
// Also drift-checks: every source skill must have a card in index.html, and vice-versa.
// Re-run whenever omo updates; commit data.json; redeploy. No more hand-pinned snapshots.

import { readFileSync, readdirSync, writeFileSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

const OMO_ROOT = join(homedir(), ".codex/plugins/cache/sisyphuslabs/omo");

function pickVersionDir(root) {
  if (!existsSync(root)) throw new Error(`omo not installed at ${root}`);
  const vers = readdirSync(root).filter(d => /^\d+\.\d+\.\d+/.test(d) && statSync(join(root, d)).isDirectory());
  if (!vers.length) throw new Error("no semver version dir under omo");
  vers.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  return vers[vers.length - 1]; // highest installed
}

function parseFrontmatter(md) {
  const m = md.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return {};
  const body = m[1];
  const out = {};
  const name = body.match(/^name:\s*(.+)$/m);
  if (name) out.name = name[1].trim().replace(/^["']|["']$/g, "");
  // description may be quoted, possibly multi-line; grab first line value
  const desc = body.match(/^description:\s*(.+)$/m);
  if (desc) out.description = desc[1].trim().replace(/^["']|["']$/g, "");
  const sd = body.match(/short-description:\s*(.+)$/m);
  if (sd) out.shortDescription = sd[1].trim().replace(/^["']|["']$/g, "");
  return out;
}

const version = pickVersionDir(OMO_ROOT);
const VDIR = join(OMO_ROOT, version);

// --- skills ---
const skillsDir = join(VDIR, "skills");
const skills = readdirSync(skillsDir)
  .filter(d => existsSync(join(skillsDir, d, "SKILL.md")))
  .sort()
  .map(id => {
    const fm = parseFrontmatter(readFileSync(join(skillsDir, id, "SKILL.md"), "utf8"));
    return { id, name: fm.name || id, description: fm.description || "", short: fm.shortDescription || "" };
  });

// --- components ---
const compDir = join(VDIR, "components");
const components = existsSync(compDir)
  ? readdirSync(compDir).filter(d => statSync(join(compDir, d)).isDirectory()).sort()
  : [];

// --- hooks (from plugin manifest) ---
let hooks = { total: 0, byLifecycle: {} };
const pluginJson = join(VDIR, ".codex-plugin/plugin.json");
if (existsSync(pluginJson)) {
  const pj = JSON.parse(readFileSync(pluginJson, "utf8"));
  const list = Array.isArray(pj.hooks) ? pj.hooks : [];
  hooks.total = list.length;
  for (const h of list) {
    const base = h.split("/").pop().replace(/\.json$/, "");
    let life = "other";
    if (base.startsWith("session-start")) life = "SessionStart";
    else if (base.startsWith("user-prompt-submit")) life = "UserPromptSubmit";
    else if (base.startsWith("pre-tool-use")) life = "PreToolUse";
    else if (base.startsWith("post-tool-use")) life = "PostToolUse";
    else if (base.startsWith("post-compact")) life = "PostCompact";
    else if (base.startsWith("subagent-stop")) life = "SubagentStop";
    else if (base.startsWith("stop")) life = "Stop";
    (hooks.byLifecycle[life] ||= []).push(base);
  }
}

// --- plugin mcp ---
let mcp = [];
const mcpJson = join(VDIR, ".mcp.json");
if (existsSync(mcpJson)) mcp = Object.keys(JSON.parse(readFileSync(mcpJson, "utf8")).mcpServers || {});

// --- plugin meta ---
let meta = {};
if (existsSync(pluginJson)) {
  const pj = JSON.parse(readFileSync(pluginJson, "utf8"));
  meta = { name: pj.name, version: pj.version, license: pj.license, repository: pj.repository };
}

const data = {
  generatedAt: new Date().toISOString(),
  omoVersion: version,
  plugin: meta,
  counts: { skills: skills.length, components: components.length, hooks: hooks.total, mcp: mcp.length },
  skills,
  components,
  hooks,
  mcp,
};

writeFileSync(join(import.meta.dirname, "data.json"), JSON.stringify(data, null, 2));
console.log(`[build-data] omo v${version} -> ${skills.length} skills, ${components.length} comp, ${hooks.total} hooks, ${mcp.length} mcp`);

// --- sync index.html hardcoded meta (title/meta/schema/footer) to live data values ---
// prevents stale skill counts / omo versions whenever omo updates; idempotent + context-anchored
let html = readFileSync(join(import.meta.dirname, "index.html"), "utf8");
{
  const N = skills.length, V = version;
  const before = html;
  html = html.replace(/(OMO Skill Atlas · )\d+( 스킬)/g, `$1${N}$2`);
  html = html.replace(/(\d+)개 Codex 스킬/g, `${N}개 Codex 스킬`);
  html = html.replace(/플러그인의 (\d+)개 스킬/g, `플러그인의 ${N}개 스킬`);
  html = html.replace(/(\d+)개 스킬 위를/g, `${N}개 스킬 위를`);
  html = html.replace(/LazyCodex (\d+) skills/g, `LazyCodex ${N} skills`);
  html = html.replace(/(\d+)개 SKILL\.md/g, `${N}개 SKILL.md`);
  html = html.replace(/LazyCodex · \d+ skills · v\d+\.\d+\.\d+/g, `LazyCodex · ${N} skills · v${V}`);
  html = html.replace(/omo <small>v\d+\.\d+\.\d+<\/small>/g, `omo <small>v${V}</small>`);
  html = html.replace(/<code>omo<\/code> v<b>\d+\.\d+\.\d+<\/b>/g, `<code>omo</code> v<b>${V}</b>`);
  html = html.replace(/install <code>lazycodex-ai<\/code> v\d+\.\d+\.\d+/g, `install <code>lazycodex-ai</code> v${V}`);
  html = html.replace(/omo\/\d+\.\d+\.\d+\/skills\//g, `omo/${V}/skills/`);
  if (html !== before) { writeFileSync(join(import.meta.dirname, "index.html"), html); console.log(`[sync] index.html meta synced to ${N} skills / v${V}`); }
}

// --- DRIFT CHECK vs index.html hand-authored cards ---
const dbMatch = html.match(/const DB = (\{[\s\S]*?\});\s*\n\s*const AX/);
if (dbMatch) {
  const siteIds = new Set(JSON.parse(dbMatch[1]).skills.map(s => s.id));
  const srcIds = new Set(skills.map(s => s.id));
  const missing = [...srcIds].filter(x => !siteIds.has(x)); // in omo, not on site
  const extra = [...siteIds].filter(x => !srcIds.has(x));   // on site, not in omo
  if (missing.length || extra.length) {
    console.error(`[drift] FAIL — missing(${missing.length}): ${missing.join(", ")} | extra(${extra.length}): ${extra.join(", ")}`);
    process.exitCode = 2;
  } else {
    console.log(`[drift] PASS — site's ${siteIds.size} cards exactly match omo v${version} skill set`);
  }
} else {
  console.warn("[drift] could not locate DB in index.html");
}
