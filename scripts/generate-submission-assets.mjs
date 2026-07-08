import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import sharp from "sharp";

const root = resolve(new URL("..", import.meta.url).pathname);
const outDir = join(root, "base-submission");
const W = 1284;
const H = 2778;

const c = {
  bg: "#fff8ec",
  paper: "#fffdf7",
  ink: "#15233b",
  orange: "#ff8c42",
  blue: "#5f74f8",
  yellow: "#ffd45d",
  lilac: "#eef1ff",
};

function esc(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function wrap(text, maxChars) {
  const words = text.split(" ");
  const lines = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function frame(content) {
  return `
  <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${W}" height="${H}" fill="${c.bg}"/>
    <circle cx="180" cy="180" r="120" fill="${c.yellow}" fill-opacity="0.55"/>
    <circle cx="1130" cy="220" r="150" fill="${c.lilac}"/>
    <circle cx="1080" cy="2460" r="180" fill="${c.orange}" fill-opacity="0.16"/>
    ${content}
  </svg>`;
}

function heading(title, subtitle) {
  return `
    <text x="76" y="128" font-family="Courier New, monospace" font-size="31" font-weight="900" letter-spacing="7" fill="${c.orange}">TRADE A SKILL</text>
    <text x="76" y="240" font-family="Arial, sans-serif" font-size="82" font-weight="900" fill="${c.ink}">${esc(title)}</text>
    <text x="80" y="308" font-family="Arial, sans-serif" font-size="34" font-weight="800" fill="${c.blue}">${esc(subtitle)}</text>
  `;
}

function chip(x, y, label, fill, ink = c.ink) {
  return `
    <rect x="${x}" y="${y}" width="${label.length * 18 + 90}" height="70" rx="35" fill="${fill}"/>
    <text x="${x + 30}" y="${y + 44}" font-family="Arial, sans-serif" font-size="28" font-weight="900" fill="${ink}">${esc(label)}</text>
  `;
}

function stickerCard(x, y, offer, want, format, time, note) {
  const lines = wrap(note, 33).slice(0, 5);
  return `
    <rect x="${x}" y="${y}" width="1080" height="1140" rx="34" fill="${c.paper}" stroke="rgba(21,35,59,0.16)" stroke-width="6"/>
    <rect x="${x + 54}" y="${y + 52}" width="252" height="252" rx="48" fill="${c.orange}" transform="rotate(-8 ${x + 180} ${y + 178})"/>
    <rect x="${x + 802}" y="${y + 92}" width="190" height="190" rx="48" fill="${c.lilac}" transform="rotate(9 ${x + 897} ${y + 187})"/>
    <text x="${x + 76}" y="${y + 118}" font-family="Courier New, monospace" font-size="24" font-weight="900" letter-spacing="6" fill="${c.orange}">SKILL SWAP CARD</text>
    <text x="${x + 76}" y="${y + 220}" font-family="Arial, sans-serif" font-size="33" font-weight="900" fill="${c.ink}">I can offer</text>
    <text x="${x + 76}" y="${y + 310}" font-family="Arial, sans-serif" font-size="62" font-weight="900" fill="${c.ink}">${esc(offer)}</text>
    <text x="${x + 76}" y="${y + 430}" font-family="Arial, sans-serif" font-size="33" font-weight="900" fill="${c.ink}">I want</text>
    <text x="${x + 76}" y="${y + 520}" font-family="Arial, sans-serif" font-size="62" font-weight="900" fill="${c.ink}">${esc(want)}</text>
    ${chip(x + 74, y + 602, format, c.ink, c.paper)}
    ${chip(x + 320, y + 602, time, c.yellow)}
    <rect x="${x + 70}" y="${y + 720}" width="940" height="280" rx="24" fill="${c.paper}" stroke="rgba(21,35,59,0.16)" stroke-width="4"/>
    <text x="${x + 102}" y="${y + 782}" font-family="Courier New, monospace" font-size="22" font-weight="900" fill="${c.blue}">NOTE</text>
    ${lines.map((line, i) => `<text x="${x + 102}" y="${y + 850 + i * 38}" font-family="Arial, sans-serif" font-size="30" font-weight="820" fill="${c.ink}">${esc(line)}</text>`).join("")}
  `;
}

function feature(x, y, title, body, fill) {
  return `
    <rect x="${x}" y="${y}" width="540" height="220" rx="28" fill="${fill}" stroke="rgba(21,35,59,0.14)" stroke-width="5"/>
    <text x="${x + 34}" y="${y + 78}" font-family="Arial, sans-serif" font-size="39" font-weight="900" fill="${c.ink}">${esc(title)}</text>
    ${wrap(body, 31).slice(0, 3).map((line, i) => `<text x="${x + 34}" y="${y + 132 + i * 34}" font-family="Arial, sans-serif" font-size="27" font-weight="800" fill="${c.blue}">${esc(line)}</text>`).join("")}
  `;
}

function screenshot1() {
  return frame(`
    ${heading("Swap one skill.", "Post offer, wanted skill, format, time window, wallet, and timestamp on Base.")}
    ${stickerCard(102, 430, "Figma landing polish", "Short product copy", "30 min swap", "this week", "I can tighten layout and hierarchy. Looking for punchier copy for one ship-ready page.")}
    ${feature(82, 1740, "Offer one thing", "Keep the trade compact and real.", c.paper)}
    ${feature(662, 1740, "Base record", "Wallet and timestamp stay public by ID.", c.lilac)}
  `);
}

function screenshot2() {
  return frame(`
    ${heading("Load any card.", "Open a public skill exchange card by ID.")}
    ${feature(82, 390, "Card ID", "Reload a posted skill swap in one field.", c.yellow)}
    ${feature(662, 390, "Format", "Call, async trade, or short review.", c.paper)}
    ${stickerCard(102, 740, "Prompt workflow review", "Framer motion help", "async trade", "48 hours", "I will review your prompts and output structure. Need a clean motion pass for a product screen.")}
  `);
}

function screenshot3() {
  return frame(`
    ${heading("Trade without noise.", "Use one clean card instead of a long thread.")}
    ${stickerCard(102, 430, "Base app feedback", "Logo cleanup", "one call", "weekend", "I can test flows and trim friction. Need a small icon cleanup before I submit the app.")}
    ${feature(82, 1740, "Useful asks", "Name the exact help you need.", c.paper)}
    ${feature(662, 1740, "Lightweight", "A tiny exchange card on Base.", c.lilac)}
  `);
}

function iconSvg() {
  return `
  <svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
    <rect width="1024" height="1024" fill="${c.bg}"/>
    <rect x="128" y="128" width="768" height="768" rx="84" fill="${c.paper}" stroke="rgba(21,35,59,0.15)" stroke-width="30"/>
    <rect x="204" y="242" width="274" height="210" rx="52" fill="${c.orange}" transform="rotate(-10 341 347)"/>
    <rect x="540" y="212" width="260" height="190" rx="50" fill="${c.lilac}" transform="rotate(8 670 307)"/>
    <rect x="216" y="538" width="590" height="164" rx="82" fill="${c.ink}"/>
    <text x="296" y="640" font-family="Arial, sans-serif" font-size="108" font-weight="900" fill="${c.paper}">↔</text>
  </svg>`;
}

function thumbnailSvg() {
  return `
  <svg width="1910" height="1000" viewBox="0 0 1910 1000" xmlns="http://www.w3.org/2000/svg">
    <rect width="1910" height="1000" fill="${c.bg}"/>
    <text x="94" y="150" font-family="Arial, sans-serif" font-size="116" font-weight="900" fill="${c.ink}">Trade A Skill</text>
    <text x="102" y="252" font-family="Arial, sans-serif" font-size="43" font-weight="800" fill="${c.blue}">Post tiny skill exchange cards on Base.</text>
    ${feature(96, 390, "Offer", "One useful skill you can give.", c.paper)}
    ${feature(96, 660, "Want", "One focused ask back.", c.lilac)}
    ${stickerCard(770, 90, "Figma landing polish", "Short product copy", "30 min swap", "this week", "I can tighten layout and hierarchy. Looking for punchier copy for one ship-ready page.")}
  </svg>`;
}

async function writePng(name, svg, width = W, height = H) {
  const file = join(outDir, name);
  await sharp(Buffer.from(svg)).resize(width, height).png({ compressionLevel: 9 }).toFile(file);
  return file;
}

async function writeJpg(name, svg, width, height) {
  const file = join(outDir, name);
  await sharp(Buffer.from(svg)).resize(width, height).jpeg({ quality: 88, mozjpeg: true }).toFile(file);
  return file;
}

await mkdir(outDir, { recursive: true });

const files = [
  await writeJpg("app-icon.jpg", iconSvg(), 1024, 1024),
  await writeJpg("app-thumbnail.jpg", thumbnailSvg(), 1910, 1000),
  await writePng("screenshot-1.png", screenshot1()),
  await writePng("screenshot-2.png", screenshot2()),
  await writePng("screenshot-3.png", screenshot3()),
];

await writeFile(join(outDir, "asset-manifest.json"), JSON.stringify({ generatedAt: new Date().toISOString(), files }, null, 2), "utf8");
await writeFile(
  join(outDir, "submission-copy.md"),
  [
    "# Trade A Skill",
    "",
    "App Name: Trade A Skill",
    "Tagline: Swap one skill",
    "Description: Post a compact skill exchange card with offer, wanted skill, format, time window, note, wallet, and timestamp on Base.",
    "",
    "Domain: https://trade-a-skill.vercel.app",
    "",
    "Assets:",
    "- app-icon.jpg",
    "- app-thumbnail.jpg",
    "- screenshot-1.png",
    "- screenshot-2.png",
    "- screenshot-3.png",
  ].join("\n"),
  "utf8",
);

for (const file of files) console.log(file);
