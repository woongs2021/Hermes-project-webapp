import assert from 'node:assert/strict'
import { mkdir, readdir, stat } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import { chromium } from 'playwright'

const port = 47831
const basePath = '/Hermes-project-webapp/'
const reportUrl = `http://127.0.0.1:${port}${basePath}?pdfReport=designer-ai-exposure`
const outputDirectory = new URL('../dist/downloads/', import.meta.url)
const outputPath = new URL('personal-ax-designer-ai-exposure.pdf', outputDirectory)

async function availableChromiumExecutable() {
  // CI uses Playwright's matching browser installed by the workflow. This
  // fallback makes the script runnable in a pre-provisioned local cache too.
  const browserCache = process.env.PLAYWRIGHT_BROWSERS_PATH
  if (!browserCache || browserCache === '0') return undefined
  const candidates = (await readdir(browserCache, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory() && entry.name.startsWith('chromium-'))
    .sort((a, b) => b.name.localeCompare(a.name))
  for (const candidate of candidates) {
    const chromeRoot = `${browserCache}/${candidate.name}`
    const roots = await readdir(chromeRoot, { withFileTypes: true })
    const chromeDirectory = roots.find((entry) => entry.isDirectory() && entry.name.startsWith('chrome-linux'))
    if (chromeDirectory) return `${chromeRoot}/${chromeDirectory.name}/chrome`
  }
  return undefined
}

function startPreview() {
  const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1', '--port', String(port), '--strictPort'], {
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  let output = ''
  server.stdout.on('data', (chunk) => { output += chunk })
  server.stderr.on('data', (chunk) => { output += chunk })
  return { server, output: () => output }
}

async function waitForPreview(server) {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (server.exitCode !== null) throw new Error(`Vite preview exited early: ${server.exitCode}`)
    try {
      const response = await fetch(reportUrl)
      if (response.ok) return
    } catch {
      // The preview process is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  throw new Error('Timed out waiting for Vite preview')
}

const { server, output } = startPreview()
let browser
try {
  await waitForPreview(server)
  await mkdir(outputDirectory, { recursive: true })

  browser = await chromium.launch({ headless: true, executablePath: await availableChromiumExecutable() })
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 })
  await page.goto(reportUrl, { waitUntil: 'networkidle' })
  await page.locator('#personal-ax-report-print').waitFor()
  await page.evaluate(async () => { await document.fonts.ready })

  const reportState = await page.locator('#personal-ax-report-print').evaluate((article) => ({
    title: article.querySelector('h3')?.textContent?.trim(),
    closedDetails: Array.from(article.querySelectorAll('details')).filter((details) => !details.open).length,
    controlsVisible: Boolean(document.querySelector('.personal-ax-report-controls')) && getComputedStyle(document.querySelector('.personal-ax-report-controls')).display !== 'none',
  }))
  assert.equal(reportState.title, '디자이너 AI 노출도와 고용 위험을 해외·한국 사례로 비교하기')
  assert.equal(reportState.closedDetails, 0, 'all deep-reading sections must be expanded before PDF generation')
  assert.equal(reportState.controlsVisible, false, 'dashboard controls must not be printed into the static report PDF')

  await page.emulateMedia({ media: 'print' })
  const pdf = await page.pdf({
    path: outputPath.pathname,
    format: 'A4',
    printBackground: true,
    displayHeaderFooter: false,
    margin: { top: '12mm', right: '12mm', bottom: '14mm', left: '12mm' },
  })
  const pageCount = (pdf.toString('latin1').match(/\/Type\s*\/Page\b/g) ?? []).length
  const file = await stat(outputPath)
  assert.ok(file.size > 100_000, 'generated report PDF is unexpectedly small')
  assert.ok(pageCount > 1, 'generated report PDF must span multiple pages')
  console.log(`Generated ${outputPath.pathname} (${file.size} bytes, ${pageCount} A4 pages; report header: ${reportState.title})`)
} finally {
  await browser?.close()
  if (server.exitCode === null) {
    const serverExited = new Promise((resolve) => server.once('exit', resolve))
    server.kill('SIGTERM')
    await serverExited
  }
  if (server.exitCode && server.exitCode !== 0) console.error(output())
}
