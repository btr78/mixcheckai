// Generates the static mixer guide pages under public/mixers/.
// Run with `node scripts/gen-mixer-pages.mjs` after editing MIXERS below, then commit
// the output. They are plain files in public/, so they ship with the normal build and
// need no router change and no serverless function.
//
// Deliberately contains no Pro cheat-sheet material — that lives server-side in
// lib/cheatsheet-data.js behind /api/check-pro and must stay there.

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "public", "mixers");
const SITE = "https://mixcheckai.com";

const MIXERS = [
  { slug: "allen-heath-qu-24", brand: "Allen & Heath", name: "QU-24", type: "digital", send: "Mix 7+8" },
  { slug: "allen-heath-qu-16", brand: "Allen & Heath", name: "QU-16", type: "digital", send: "Mix 3+4" },
  { slug: "allen-heath-qu-32", brand: "Allen & Heath", name: "QU-32", type: "digital", send: "Mix 7+8" },
  { slug: "allen-heath-sq-5", brand: "Allen & Heath", name: "SQ-5", type: "digital", send: "Mix 1-2" },
  { slug: "allen-heath-sq-6", brand: "Allen & Heath", name: "SQ-6", type: "digital", send: "Mix 1-2" },
  { slug: "allen-heath-zed-10", brand: "Allen & Heath", name: "ZED-10", type: "analog", send: "Alt Out" },
  { slug: "behringer-x32", brand: "Behringer", name: "X32", type: "digital", send: "Bus 15-16" },
  { slug: "behringer-x32-compact", brand: "Behringer", name: "X32 Compact", type: "digital", send: "Bus 15-16" },
  { slug: "behringer-xr18", brand: "Behringer", name: "XR18", type: "digital", send: "Bus 5-6" },
  { slug: "behringer-xenyx", brand: "Behringer", name: "Xenyx", type: "analog", send: "Main Out" },
  { slug: "yamaha-tf1", brand: "Yamaha", name: "TF1", type: "digital", send: "Omni Out" },
  { slug: "yamaha-tf3-tf5", brand: "Yamaha", name: "TF3/TF5", type: "digital", send: "Omni Out" },
  { slug: "yamaha-ql1-ql5", brand: "Yamaha", name: "QL1/QL5", type: "digital", send: "Omni Out" },
  { slug: "yamaha-mg-series", brand: "Yamaha", name: "MG Series", type: "analog", send: "2TR Out" },
  { slug: "midas-m32", brand: "Midas", name: "M32", type: "digital", send: "Bus 15-16" },
  { slug: "presonus-studiolive", brand: "PreSonus", name: "StudioLive", type: "digital", send: "Aux Out" },
  { slug: "soundcraft-efx", brand: "Soundcraft", name: "EFX", type: "analog", send: "2TR Out" },
  { slug: "mackie-profx", brand: "Mackie", name: "ProFX", type: "analog", send: "Alt Out" },
];

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const CSS = `
*{box-sizing:border-box}
body{margin:0;background:#07090f;color:#e8eaf0;font:16px/1.7 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;-webkit-text-size-adjust:100%}
a{color:#00e5a0}
.wrap{max-width:720px;margin:0 auto;padding:0 20px}
header{border-bottom:1px solid #1a1f2e;padding:18px 0}
header .wrap{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
.logo{font-weight:800;color:#fff;text-decoration:none;font-size:17px}
.logo span{color:#00e5a0}
.cta{background:#00e5a0;color:#07090f;font-weight:700;text-decoration:none;padding:9px 16px;border-radius:9px;font-size:14px;white-space:nowrap}
h1{font-size:clamp(26px,5vw,38px);line-height:1.2;letter-spacing:-1px;color:#fff;margin:40px 0 10px}
h2{font-size:21px;color:#fff;margin:38px 0 10px;letter-spacing:-.3px}
.kicker{font:700 11px/1 ui-monospace,monospace;letter-spacing:3px;color:#4a7cff;text-transform:uppercase;margin-top:40px}
.lede{color:#9ca3af;font-size:17px}
.card{background:#0d1017;border:1px solid #1a1f2e;border-radius:14px;padding:18px 20px;margin:18px 0}
.card dt{font:700 11px/1 ui-monospace,monospace;letter-spacing:2px;color:#6b7280;text-transform:uppercase}
.card dd{margin:6px 0 0;font-size:19px;font-weight:700;color:#00e5a0}
table{width:100%;border-collapse:collapse;margin:16px 0;font-size:15px}
th,td{text-align:left;padding:10px 12px;border-bottom:1px solid #1a1f2e}
th{color:#6b7280;font:700 11px/1 ui-monospace,monospace;letter-spacing:1.5px;text-transform:uppercase}
td:first-child{color:#fff;font-weight:600;white-space:nowrap}
ul{padding-left:20px}li{margin:9px 0;color:#c7cbd4}
.q{font-weight:700;color:#fff;margin-top:20px}
.panel{background:#0d1017;border:1px solid #00e5a0;border-radius:16px;padding:26px 22px;margin:44px 0;text-align:center}
.panel h2{margin:0 0 8px}
.panel p{color:#9ca3af;margin:0 0 18px;font-size:15px}
.others{display:flex;flex-wrap:wrap;gap:8px;margin:14px 0 0;padding:0;list-style:none}
.others li{margin:0}
.others a{display:inline-block;background:#0d1017;border:1px solid #1a1f2e;border-radius:8px;padding:7px 12px;font-size:13px;text-decoration:none;color:#c7cbd4}
footer{border-top:1px solid #1a1f2e;margin-top:56px;padding:26px 0 44px;color:#4a5568;font-size:13px}
@media(max-width:480px){.wrap{padding:0 16px}td,th{padding:9px 8px}td:first-child{white-space:normal}}
`.trim();

function shell({ title, description, canonical, body, jsonld }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="article">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:site_name" content="MixCheck AI">
<meta name="theme-color" content="#00e5a0">
<link rel="icon" href="/favicon.ico">
<style>${CSS}</style>
${jsonld ? `<script type="application/ld+json">${JSON.stringify(jsonld)}</script>` : ""}
</head>
<body>
<header><div class="wrap">
  <a class="logo" href="/">MixCheck <span>AI</span></a>
  <a class="cta" href="/#analyze">Analyze your mix free</a>
</div></header>
<main class="wrap">
${body}
</main>
<footer><div class="wrap">
  <p>MixCheck AI — loudness and mix analysis for church and studio livestreams.<br>
  Questions: <a href="mailto:hello@mixcheckai.com">hello@mixcheckai.com</a></p>
</div></footer>
</body>
</html>
`;
}

function mixerPage(m, all) {
  const full = `${m.brand} ${m.name}`;
  const title = `${full} livestream audio settings for church streams | MixCheck AI`;
  const description = `How to set up a ${full} for church livestream audio: which output to send to the stream, the loudness target to aim for, and the faults that most often make a stream sound thin or quiet.`;
  const canonical = `${SITE}/mixers/${m.slug}/`;

  const sendAdvice = m.type === "digital"
    ? `The ${full} is a digital desk, so you have spare buses. Build the stream mix on its own bus — <strong>${m.send}</strong> is the usual choice — and leave your main L/R for the room.`
    : `The ${full} is an analog desk, so you do not have a spare mix bus to spend. <strong>${m.send}</strong> is the output most churches use to feed the stream.`;

  const faqs = [
    [`Which output should I send to the stream on a ${full}?`,
     `Most churches use ${m.send}. The important part is that it is a separate feed from the main mix going to the room, so you can balance it for headphones and phone speakers without changing what the congregation hears.`],
    [`Why does our ${m.name} stream sound quieter than other videos?`,
     `Almost always because the stream is sitting well below -16 LUFS. Platforms normalise loudness, so a quiet stream stays quiet next to everything else in the viewer's feed. Measure the recording before changing anything — guessing at the master fader usually overshoots.`],
    [`Why does the stream sound thin when the room sounds full?`,
     `The room gives you drums, bass and congregational singing acoustically, so they never pass through the desk at full level. A viewer hears only what you send. Instruments that need no reinforcement live almost always need more level in the stream mix.`],
  ];

  const body = `
<div class="kicker">${esc(m.brand)} · ${m.type === "digital" ? "Digital" : "Analog"} console</div>
<h1>${esc(full)}: livestream audio settings</h1>
<p class="lede">A practical starting point for getting a watchable stream out of a ${esc(full)} — written for volunteers, not engineers.</p>

<div class="card"><dl>
  <dt>Usual stream output</dt><dd>${esc(m.send)}</dd>
</dl></div>

<h2>Send the stream its own mix</h2>
<p>${sendAdvice}</p>
<p>This is the single change that fixes the most streams. A mix balanced for a room is not a mix that works in headphones, because the room is already supplying what the desk is not.</p>

<h2>Numbers worth aiming at</h2>
<table>
  <tr><th>What</th><th>Target</th><th>Why</th></tr>
  <tr><td>Loudness</td><td>-16 LUFS</td><td>Roughly where streaming platforms normalise. Below about -20 LUFS viewers reach for the volume.</td></tr>
  <tr><td>True peak</td><td>-6 to -3 dBFS</td><td>Leaves headroom so the loud moment of the last song does not distort.</td></tr>
  <tr><td>Dynamic range</td><td>8-14 dB</td><td>Controlled but still alive. Under about 4 dB the mix sounds flat and tiring.</td></tr>
</table>

<h2>The faults that come up most</h2>
<ul>
  <li><strong>Streaming the FOH mix.</strong> Covered above, and worth the effort to separate.</li>
  <li><strong>No high-pass filter.</strong> Rumble, handling noise and air conditioning build up across open channels. High-pass everything except kick and bass.</li>
  <li><strong>No limiter on the stream output.</strong> One loud moment clips the whole broadcast.</li>
  <li><strong>Riding gain during the service.</strong> Set gain structure at soundcheck; use faders during.</li>
  <li><strong>Never checking in mono.</strong> Most viewers watch on a phone speaker, which is mono. Anything that disappears in mono is a problem your congregation will hear and you will not.</li>
</ul>

<h2>Common questions</h2>
${faqs.map(([q, a]) => `<p class="q">${esc(q)}</p><p>${a}</p>`).join("\n")}

<div class="panel">
  <h2>Stop guessing at it</h2>
  <p>Upload a recording of your stream and get the actual numbers — loudness, peak, dynamics, stereo width — plus what to change. Free, no account needed, and the file never leaves your browser.</p>
  <a class="cta" href="/#analyze">Analyze your ${esc(m.name)} mix</a>
</div>

<h2>Other mixers</h2>
<ul class="others">
${all.filter((x) => x.slug !== m.slug).map((x) => `  <li><a href="/mixers/${x.slug}/">${esc(x.brand)} ${esc(x.name)}</a></li>`).join("\n")}
</ul>
`;

  const jsonld = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(([q, a]) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a.replace(/<[^>]+>/g, "") },
    })),
  };

  return shell({ title, description, canonical, body, jsonld });
}

function indexPage(all) {
  const byBrand = {};
  for (const m of all) (byBrand[m.brand] ||= []).push(m);
  const body = `
<h1>Livestream audio settings, by mixer</h1>
<p class="lede">Which output to send to the stream, what to aim for, and the faults that most often make a church stream sound thin or quiet.</p>
${Object.entries(byBrand).map(([brand, ms]) => `
<h2>${esc(brand)}</h2>
<ul class="others">
${ms.map((m) => `  <li><a href="/mixers/${m.slug}/">${esc(m.name)} · ${esc(m.send)}</a></li>`).join("\n")}
</ul>`).join("\n")}
<div class="panel">
  <h2>Not sure where to start?</h2>
  <p>Upload a recording and get the real numbers before you change a single setting.</p>
  <a class="cta" href="/#analyze">Analyze your mix free</a>
</div>
`;
  return shell({
    title: "Church livestream audio settings by mixer | MixCheck AI",
    description: "Per-mixer guides for church livestream audio — the output to feed the stream, loudness targets, and the faults that make a stream sound thin or quiet.",
    canonical: `${SITE}/mixers/`,
    body,
  });
}

const written = [];
await mkdir(OUT, { recursive: true });
await writeFile(join(OUT, "index.html"), indexPage(MIXERS));
written.push("/mixers/");
for (const m of MIXERS) {
  await mkdir(join(OUT, m.slug), { recursive: true });
  await writeFile(join(OUT, m.slug, "index.html"), mixerPage(m, MIXERS));
  written.push(`/mixers/${m.slug}/`);
}

const today = new Date().toISOString().slice(0, 10);
console.log(written.map((p) => `  <url>\n    <loc>${SITE}${p}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>`).join("\n"));
console.error(`\nwrote ${written.length} pages to public/mixers/`);
