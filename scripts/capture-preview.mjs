import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, basename } from 'node:path';
import { createHash } from 'node:crypto';

// Read-only requests for assets selected from the browser's Network panel.
// Does not evaluate downloaded JavaScript or send account credentials.
const manifestPath = process.argv[2] || 'preview-assets.json';
const outputDir = resolve(process.argv[3] || 'captured-preview');
try {
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  if (!Array.isArray(manifest.assets) || !manifest.assets.length) {
    throw new Error('Manifest must contain a non-empty assets array.');
  }
  const names = new Set();
  const results = [];
  for (const asset of manifest.assets) {
    const url = new URL(asset.url);
    if (url.protocol !== 'https:' || url.username || url.password) {
      throw new Error('Use public HTTPS URLs without embedded credentials.');
    }
    if (typeof asset.file !== 'string' || !asset.file ||
        basename(asset.file) !== asset.file || !/\.(js|css)$/.test(asset.file) ||
        names.has(asset.file)) {
      throw new Error('Each asset needs a unique .js or .css filename, without directories.');
    }
    names.add(asset.file);
    const response = await fetch(url, {
      credentials: 'omit', signal: AbortSignal.timeout(30000),
    });
    if (!response.ok) {
      throw new Error(`${response.status} for ${url}. Re-select the current asset URL in DevTools; chunk names change after deployment.`);
    }
    const type = response.headers.get('content-type') || '';
    if (!/(javascript|ecmascript|text\/css)/i.test(type)) {
      throw new Error(`Unexpected content type ${type} for ${url}; refusing to save a login/error page as code.`);
    }
    const bytes = Buffer.from(await response.arrayBuffer());
    results.push({ asset, bytes, type, finalUrl: response.url });
  }
  // Finish downloading and validating every asset before writing output.
  await mkdir(outputDir, { recursive: true });
  const receipt = { capturedAt: new Date().toISOString(), preview: manifest.preview, assets: [] };
  for (const { asset, bytes, type, finalUrl } of results) {
    await writeFile(resolve(outputDir, asset.file), bytes);
    receipt.assets.push({ ...asset, finalUrl, contentType: type, bytes: bytes.length,
      sha256: createHash('sha256').update(bytes).digest('hex') });
    console.log(`Saved ${asset.file} (${bytes.length} bytes)`);
  }
  await writeFile(resolve(outputDir, 'receipt.json'), JSON.stringify(receipt, null, 2) + '\n');
  console.log(`Output: ${outputDir}`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
