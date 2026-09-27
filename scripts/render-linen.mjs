// Render the linen background texture sources (scripts/linen*.svg) to
// bitmaps in static/textures/.
//
// The site background is deliberately bitmaps, not the SVGs: SVG filters
// (feTurbulence weave, blurred satin stitch) are re-executed by the browser
// every time it paints part of the page, which dropped frames during the
// page-load animations. Pre-rendered images are decoded once and tiled.
//
// Two layers, so the files stay small:
// - linen-weave.webp: fine fibre noise, opaque over white (no alpha channel
//   to store losslessly), applied with background-blend-mode: multiply.
// - linen-embroidery.webp: soft white stitching with transparency; mostly
//   empty and smooth, so it compresses well.
// Both at 2x for high-DPI screens. Rendered by Chrome's own SVG renderer, so
// they match what the browser drew from the SVG.
//
// Usage:
//   pnpm render-linen

import { chromium } from '@playwright/test';
import { readFile, writeFile } from 'node:fs/promises';

const SCALE = 2;
const layers = [
	// The weave needs high quality: below ~0.95 WebP smears the fine
	// cross-hatched grain into flat blocks.
	{ source: 'linen-weave.svg', target: 'linen-weave.webp', tile: 320, opaque: true, quality: 0.95 },
	{ source: 'linen.svg', target: 'linen-embroidery.webp', tile: 960, opaque: false, quality: 0.8 }
];

// Prefer an installed Chrome; fall back to Playwright's bundled Chromium.
const browser = await chromium.launch({ channel: 'chrome' }).catch(() => chromium.launch());
const page = await browser.newPage();

for (const layer of layers) {
	const svg = await readFile(new URL(layer.source, import.meta.url), 'utf8');
	const dataUrl = await page.evaluate(
		async ({ svg, size, opaque, quality }) => {
			const img = new Image();
			img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
			await img.decode();
			const canvas = document.createElement('canvas');
			canvas.width = canvas.height = size;
			const ctx = canvas.getContext('2d', { alpha: !opaque });
			if (opaque) {
				ctx.fillStyle = '#fff';
				ctx.fillRect(0, 0, size, size);
			}
			ctx.drawImage(img, 0, 0, size, size);
			return canvas.toDataURL('image/webp', quality);
		},
		{ svg, size: layer.tile * SCALE, opaque: layer.opaque, quality: layer.quality }
	);
	const bytes = Buffer.from(dataUrl.slice(dataUrl.indexOf(',') + 1), 'base64');
	const target = new URL(`../static/textures/${layer.target}`, import.meta.url);
	await writeFile(target, bytes);
	console.log(
		`Wrote static/textures/${layer.target} (${layer.tile * SCALE}px, ${(bytes.length / 1024).toFixed(0)} kB)`
	);
}

await browser.close();
