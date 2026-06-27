#!/usr/bin/env node
// CI consistency gate: committed data.json skill set must equal index.html board cards.
import { readFileSync } from "node:fs";
const data = JSON.parse(readFileSync("data.json", "utf8"));
const html = readFileSync("index.html", "utf8");
const m = html.match(/const DB = (\{[\s\S]*?\});\s*\n\s*const AX/);
if (!m) { console.error("FAIL: DB not found in index.html"); process.exit(1); }
const cards = new Set(JSON.parse(m[1]).skills.map(s => s.id));
const src = new Set(data.skills.map(s => s.id));
const missing = [...src].filter(x => !cards.has(x));
const extra = [...cards].filter(x => !src.has(x));
if (missing.length || extra.length) {
  console.error(`FAIL: data.json <-> index.html drift. missing(${missing.length}): ${missing} | extra(${extra.length}): ${extra}`);
  process.exit(1);
}
console.log(`OK: ${cards.size} skills consistent (data.json <-> index.html), omo v${data.omoVersion}`);
