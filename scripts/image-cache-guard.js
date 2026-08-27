#!/usr/bin/env node
/**
 * Invalidate cached image variants whose source photo has changed.
 *
 * The Netlify build cache persists _site/images between deploys so
 * @11ty/eleventy-img can skip regeneration (~3s warm vs ~280s cold). But our
 * filenameFormat is `<name>-<width>.<format>` rather than content-hashed, to
 * keep image URLs stable. That means replacing a photo under the same filename
 * would leave the old variants in place and silently serve stale images.
 *
 * This hashes every original and drops the variants for any that changed.
 */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const SRC = "src/images";
const OUT = "_site/images";
const MANIFEST = path.join(OUT, ".sources.json");

if (!fs.existsSync(OUT)) process.exit(0);          // cold build, nothing cached

const isVariant = (f) => /-\d+\.(jpeg|webp|avif)$/.test(f);
const originals = fs.readdirSync(SRC).filter((f) => !isVariant(f) && /\.(jpe?g|png)$/i.test(f));

const current = {};
for (const f of originals) {
    const buf = fs.readFileSync(path.join(SRC, f));
    current[f] = crypto.createHash("sha256").update(buf).digest("hex").slice(0, 16);
}

let previous = {};
try { previous = JSON.parse(fs.readFileSync(MANIFEST, "utf8")); } catch {}

let dropped = 0;
for (const [file, hash] of Object.entries(current)) {
    if (previous[file] && previous[file] === hash) continue;
    const base = path.basename(file, path.extname(file));
    for (const v of fs.readdirSync(OUT)) {
        if (v.startsWith(`${base}-`) && isVariant(v)) {
            fs.unlinkSync(path.join(OUT, v));
            dropped++;
        }
    }
}

// variants whose original is gone entirely
for (const v of fs.readdirSync(OUT)) {
    if (!isVariant(v)) continue;
    const base = v.replace(/-\d+\.(jpeg|webp|avif)$/, "");
    if (!originals.some((f) => path.basename(f, path.extname(f)) === base)) {
        fs.unlinkSync(path.join(OUT, v));
        dropped++;
    }
}

fs.writeFileSync(MANIFEST, JSON.stringify(current, null, 1));
console.log(
    dropped
        ? `image cache: ${dropped} stale variant(s) dropped, will regenerate`
        : `image cache: all ${originals.length} sources unchanged`
);
