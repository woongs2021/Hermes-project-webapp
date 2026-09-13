const { chromium } = require('/opt/data/tmp/playwright-qa/node_modules/playwright');

(async () => {
  const base = 'http://127.0.0.1:4173/Hermes-project-webapp/';
  const manifestRes = await fetch(`${base}data/chris-archive.json`);
  const manifest = await manifestRes.json();
  const firstTen = manifest.items.slice(0, 10);
  const assetStatuses = await Promise.all(firstTen.map(async (item) => {
    const res = await fetch(`${base}${item.imageSrc}`);
    return { id: item.id, status: res.status, contentType: res.headers.get('content-type') };
  }));
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push(err.message));
  await page.goto(`${base}#chrisArchive`, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: /Chris Archive/ }).click();
  await page.waitForSelector('.chris-archive-tile img');
  const tileCount = await page.locator('.chris-archive-tile').count();
  const firstImageLoaded = await page.locator('.chris-archive-tile img').first().evaluate(img => img.complete && img.naturalWidth > 0 && img.naturalHeight > 0);
  await page.locator('.chris-archive-tile').first().click();
  await page.waitForSelector('.chris-archive-modal[role="dialog"]');
  const dialogTitle = await page.locator('#chris-archive-modal-title').textContent();
  const closeText = await page.locator('.chris-archive-modal-close').textContent();
  const modalImageLoaded = await page.locator('.chris-archive-modal-media img').evaluate(img => img.complete && img.naturalWidth > 0 && img.naturalHeight > 0);
  await page.locator('.chris-archive-modal-close').click();
  await page.waitForSelector('.chris-archive-modal', { state: 'detached' });
  const modalClosed = await page.locator('.chris-archive-modal').count() === 0;
  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
  await mobile.goto(`${base}#chrisArchive`, { waitUntil: 'networkidle' });
  await mobile.getByRole('button', { name: /Chris Archive/ }).click();
  await mobile.waitForSelector('.chris-archive-tile');
  const mobileColumns = await mobile.locator('.chris-archive-grid').evaluate(el => getComputedStyle(el).gridTemplateColumns);
  await browser.close();
  const result = { manifestItems: manifest.items.length, tileCount, firstImageLoaded, modalImageLoaded, dialogTitle, closeText, modalClosed, mobileColumns, assetStatuses, errors };
  console.log(JSON.stringify(result, null, 2));
  if (tileCount !== manifest.items.length || !firstImageLoaded || !modalImageLoaded || !dialogTitle || !closeText?.includes('×') || !modalClosed || errors.length || assetStatuses.some(a => a.status !== 200)) process.exit(1);
})();
