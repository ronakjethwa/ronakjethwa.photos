#!/usr/bin/env node
/**
 * Static accessibility + metadata check over the built site.
 *
 * Replaces netlify-plugin-a11y, which called pa11y with no options and so had
 * no configurable timeout. It reliably timed out once the gallery grew past
 * ~40 images per index page.
 *
 * Zero dependencies and no headless browser, so it cannot time out.
 * Usage: node scripts/a11y-check.js [dir]   (default: _site)
 */
const fs = require("fs");
const path = require("path");

const ROOT = process.argv[2] || "_site";
const problems = [];

function walk(dir, out = []) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(p, out);
        else if (entry.name.endsWith(".html")) out.push(p);
    }
    return out;
}

const rules = [
    ["<html> needs a lang attribute", h => /<html[^>]*\blang="[^"]+"/.test(h)],
    ["missing viewport meta", h => /<meta[^>]*name="viewport"/i.test(h)],
    ["missing charset", h => /<meta[^>]*charset/i.test(h)],
    ["missing or empty <title>", h => /<title>[^<]+<\/title>/.test(h)],
    ["missing skip link", h => /class="skip-link"/.test(h)],
    ["missing <main> landmark", h => /<main\b/.test(h)],
    ["needs exactly one <h1>", h => (h.match(/<h1\b/g) || []).length === 1],
];

for (const file of walk(ROOT)) {
    const html = fs.readFileSync(file, "utf8");
    const page = file.replace(ROOT, "") || "/";

    for (const [msg, ok] of rules) {
        if (!ok(html)) problems.push(`${page}: ${msg}`);
    }

    // every image needs meaningful alt text
    for (const img of html.match(/<img\b[^>]*>/gs) || []) {
        if (!/\balt="[^"]+"/.test(img)) {
            problems.push(`${page}: <img> with missing or empty alt`);
        }
    }

    // links must have discernible text (or an aria-label)
    for (const a of html.match(/<a\b[^>]*>.*?<\/a>/gs) || []) {
        const text = a.replace(/<[^>]+>/g, "").trim();
        if (!text && !/aria-label="[^"]+"/.test(a)) {
            problems.push(`${page}: <a> with no discernible text`);
        }
    }

    // duplicate ids break label/anchor association
    const ids = (html.match(/\bid="([^"]+)"/g) || []).map(m => m.slice(4, -1));
    const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
    for (const id of new Set(dupes)) problems.push(`${page}: duplicate id "${id}"`);
}

const pages = walk(ROOT).length;
if (problems.length) {
    console.error(`\na11y check FAILED — ${problems.length} problem(s) across ${pages} pages:\n`);
    for (const p of problems.slice(0, 40)) console.error(`  ${p}`);
    if (problems.length > 40) console.error(`  ...and ${problems.length - 40} more`);
    process.exit(1);
}
console.log(`a11y check passed — ${pages} pages, no problems found.`);
