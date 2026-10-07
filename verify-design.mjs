// Design-pass verification: route health, 4-width overflow, console errors,
// and a handful of real UI flows. Run while `npm run dev` is up on :3000.
import { chromium } from 'playwright-core';
import { readFileSync } from 'node:fs';

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const EXE =
  process.env.CHROMIUM_PATH ||
  `${process.env.LOCALAPPDATA}\\ms-playwright\\chromium-1228\\chrome-win64\\chrome.exe`;

const WIDTHS = [390, 768, 1280, 1600];
const ROUTES = [
  '/',
  '/about',
  '/packages',
  '/packages?tab=materials',
  '/gallery',
  '/contact',
  '/inquiry',
  '/book',
  '/my-bookings',
  '/pay',
  '/admin/login',
];

let passed = 0;
let failed = 0;
const failures = [];

function assert(cond, msg) {
  if (cond) {
    passed += 1;
    console.log(`[PASS] ${msg}`);
  } else {
    failed += 1;
    failures.push(msg);
    console.error(`[FAIL] ${msg}`);
  }
}

async function waitForServer(timeoutMs = 180000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`${BASE}/api/packages`);
      if (res.ok) return true;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 1500));
  }
  throw new Error(`Server did not come up at ${BASE}`);
}

// SSR markup lands before React attaches listeners. Wait for the network to
// settle (HMR uses a websocket, so it does not hold networkidle open) plus a
// short beat so clicks land on hydrated handlers.
async function hydrate(page) {
  await page.waitForLoadState('networkidle', { timeout: 25000 }).catch(() => {});
  await page.waitForTimeout(800);
}

// The login route only errors for a real admin address with a bad password
// (unknown emails auto-provision as customers), so read it from .env.
function adminEmail() {
  try {
    const env = readFileSync(new URL('./.env', import.meta.url), 'utf8');
    const match = env.match(/^ADMIN_EMAIL\s*=\s*(.+)$/m);
    return (match ? match[1].trim() : '').replace(/^["']|["']$/g, '');
  } catch {
    return '';
  }
}

async function main() {
  console.log('--- DESIGN PASS VERIFICATION ---\n');
  await waitForServer();
  console.log(`server up: ${BASE}\n`);

  const browser = await chromium.launch({ executablePath: EXE });

  // ── 1. Route health ────────────────────────────────────────────
  console.log('1. Route checks');
  const routeCtx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const routePage = await routeCtx.newPage();
  for (const route of ROUTES) {
    let status = 0;
    for (let attempt = 0; attempt < 2 && !(status >= 200 && status < 400); attempt += 1) {
      try {
        const res = await routePage.goto(`${BASE}${route}`, {
          waitUntil: 'domcontentloaded',
          timeout: 45000,
        });
        status = res ? res.status() : 0;
      } catch (err) {
        status = `ERR: ${err.message}`;
      }
    }
    assert(
      typeof status === 'number' && status >= 200 && status < 400,
      `GET ${route} → ${status}`
    );
  }

  // /admin must bounce to the login screen when signed out.
  try {
    await routePage.goto(`${BASE}/admin`, { waitUntil: 'domcontentloaded' });
    await routePage.waitForURL('**/admin/login**', { timeout: 15000 });
    assert(true, '/admin redirects signed-out visitors to /admin/login');
  } catch (err) {
    assert(false, `/admin redirect → ${err.message}`);
  }

  // Global chrome: skip link + navbar + footer present.
  await routePage.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
  assert(
    (await routePage.locator('a.skip-link, .skip-link').count()) > 0,
    'layout renders a skip link'
  );
  assert((await routePage.locator('header').count()) > 0, 'layout renders the navbar');
  assert((await routePage.locator('footer').count()) > 0, 'layout renders the footer');
  await routeCtx.close();

  // ── 2. Four-width overflow + console sweep ─────────────────────
  console.log('\n2. Four-width checks');
  for (const width of WIDTHS) {
    const ctx = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await ctx.newPage();
    const pageErrors = [];
    const consoleErrors = [];
    page.on('pageerror', (e) => pageErrors.push(String(e.message).split('\n')[0]));
    page.on('response', (res) => {
      const url = res.url();
      // 401 from /api/auth/me is the app's normal "logged out" signal.
      const noisyAuth = url.endsWith('/api/auth/me') && res.status() === 401;
      if (res.status() >= 400 && !/favicon/i.test(url) && !noisyAuth) {
        consoleErrors.push(`HTTP ${res.status()} ${url.replace(BASE, '')}`);
      }
    });
    page.on('requestfailed', (req) => {
      // Navigations away can abort in-flight prefetches; that is noise.
      const aborted = req.failure()?.errorText === 'net::ERR_ABORTED';
      if (!/favicon/i.test(req.url()) && !aborted) {
        consoleErrors.push(`requestfailed ${req.url().replace(BASE, '')}`);
      }
    });
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        // Resource-level failures are caught by the response/requestfailed
        // listeners above; here we keep genuine JS console errors.
        if (!/Failed to load resource/i.test(text)) {
          consoleErrors.push(text.split('\n')[0]);
        }
      }
    });

    for (const route of ROUTES) {
      try {
        await page.goto(`${BASE}${route}`, {
          waitUntil: 'domcontentloaded',
          timeout: 45000,
        });
        await page.waitForTimeout(700);
        const overflow = await page.evaluate(() => {
          const doc = document.documentElement;
          return {
            scrollWidth: doc.scrollWidth,
            clientWidth: doc.clientWidth,
            offenders: Array.from(document.querySelectorAll('body *'))
              .filter((el) => el.getBoundingClientRect().right > doc.clientWidth + 2)
              .slice(0, 3)
              .map((el) => `${el.tagName.toLowerCase()}.${String(el.className || '').slice(0, 60)}`),
          };
        });
        const overBy = overflow.scrollWidth - overflow.clientWidth;
        assert(
          overBy <= 2,
          `width ${width} · ${route} — no horizontal overflow${
            overBy > 2 ? ` (over by ${overBy}px: ${overflow.offenders.join(' | ')})` : ''
          }`
        );
      } catch (err) {
        assert(false, `width ${width} · ${route} → ${err.message}`);
      }
    }
    assert(pageErrors.length === 0, `width ${width} · no uncaught page errors${pageErrors.length ? ` (${pageErrors.slice(0, 3).join(' · ')})` : ''}`);
    assert(consoleErrors.length === 0, `width ${width} · no console errors${consoleErrors.length ? ` (${consoleErrors.slice(0, 3).join(' · ')})` : ''}`);
    await ctx.close();
  }

  // ── 3. Functional UI flows ─────────────────────────────────────
  console.log('\n3. Functional checks');
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();

  // Packages: tab switch to materials rent
  await page.goto(`${BASE}/packages`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#tab-btn-materials', { timeout: 20000 });
  await hydrate(page);
  await page.click('#tab-btn-materials');
  let materialsActive = false;
  try {
    await page.waitForFunction(
      () =>
        !!document.querySelector('#tab-btn-materials') &&
        document.querySelector('#tab-btn-materials').className.includes('is-active'),
      null,
      { timeout: 15000 }
    );
    materialsActive = true;
  } catch {
    materialsActive = false;
  }
  assert(materialsActive, 'packages: Materials Rent tab activates on click');
  let urlUpdated = page.url().includes('tab=materials');
  if (!urlUpdated) {
    try {
      await page.waitForFunction(
        () => window.location.search.includes('tab=materials'),
        null,
        { timeout: 8000 }
      );
      urlUpdated = true;
    } catch {
      urlUpdated = false;
    }
  }
  assert(urlUpdated, 'packages: tab switch updates the URL');

  // Gallery: category filter
  await page.goto(`${BASE}/gallery`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('button.tab', { timeout: 20000 });
  await hydrate(page);
  const concertTab = page.locator('button.tab', { hasText: 'Concerts' }).first();
  if ((await concertTab.count()) > 0) {
    await concertTab.click();
    let active = false;
    try {
      await page.waitForFunction(
        () =>
          Array.from(document.querySelectorAll('button.tab')).some(
            (el) =>
              el.textContent?.includes('Concerts') && el.className.includes('is-active')
          ),
        null,
        { timeout: 10000 }
      );
      active = true;
    } catch {
      active = false;
    }
    assert(active, 'gallery: category filter activates');
  } else {
    assert(false, 'gallery: category filter buttons render');
  }

  // Book: live date check
  await page.goto(`${BASE}/book`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#event-date', { timeout: 20000 });
  await hydrate(page);
  const openDate = new Date();
  openDate.setUTCDate(openDate.getUTCDate() + 45);
  const dateStr = openDate.toISOString().slice(0, 10);
  await page.fill('#event-date', dateStr);
  let bookState = '';
  try {
    await page.waitForFunction(
      () => /Date is open|Date unavailable|already reserved/i.test(document.body.innerText),
      null,
      { timeout: 20000 }
    );
  } catch {
    /* fall through to assertion with whatever text we have */
  }
  bookState = await page.evaluate(() => document.body.innerText);
  assert(
    /Date is open|Date unavailable|already reserved/i.test(bookState),
    `book: date check responds for ${dateStr}`
  );

  // Book: step advance
  const proceed = page.locator('button', { hasText: 'Proceed' }).first();
  if ((await proceed.count()) > 0) {
    await proceed.click();
    let step2 = '';
    try {
      await page.waitForFunction(
        () => /Choose the stage rig/i.test(document.body.innerText),
        null,
        { timeout: 10000 }
      );
      step2 = 'ok';
    } catch {
      step2 = await page.evaluate(() => document.body.innerText);
    }
    assert(/Choose the stage rig/i.test(step2) || step2 === 'ok', 'book: advances to step 2 (rig selection)');
  }

  // Contact: underline form submits
  await page.goto(`${BASE}/contact`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#contact-name', { timeout: 20000 });
  await hydrate(page);
  await page.fill('#contact-name', 'Design Verify');
  await page.fill('#contact-phone', '9000000001');
  await page.fill('#contact-email', 'verify@example.com');
  await page.fill('#contact-message', 'Design verification inquiry — safe to ignore.');
  await page.click('button[type="submit"]');
  let contactState = '';
  try {
    await page.waitForFunction(
      () => /Message logged with the production desk/i.test(document.body.innerText),
      null,
      { timeout: 20000 }
    );
  } catch {
    /* asserted below */
  }
  contactState = await page.evaluate(() => document.body.innerText);
  assert(
    /Message logged with the production desk/i.test(contactState),
    'contact: underline form submits and confirms'
  );

  // Inquiry: capability rows toggle
  await page.goto(`${BASE}/inquiry`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('button[aria-pressed]', { timeout: 20000 });
  await hydrate(page);
  const capRow = page.locator('button[aria-pressed]').first();
  if ((await capRow.count()) > 0) {
    const before = await capRow.getAttribute('aria-pressed');
    await capRow.click();
    const after = await capRow.getAttribute('aria-pressed');
    assert(before !== after, 'inquiry: capability row toggles');
  } else {
    assert(false, 'inquiry: capability rows render');
  }

  // my-bookings: lookup reacts
  await page.goto(`${BASE}/my-bookings`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#lookup', { timeout: 20000 });
  await hydrate(page);
  await page.fill('#lookup', '9789012345');
  await page.click('button[type="submit"]');
  let lookupState = '';
  try {
    await page.waitForFunction(
      () => /Found bookings|No records|No matching/i.test(document.body.innerText),
      null,
      { timeout: 20000 }
    );
  } catch {
    /* asserted below */
  }
  lookupState = await page.evaluate(() => document.body.innerText);
  assert(
    /Found bookings|No records|No matching/i.test(lookupState),
    'my-bookings: lookup returns a state'
  );

  // admin/login: wrong credentials surface the alert, no card chrome
  await page.goto(`${BASE}/admin/login`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#admin-email', { timeout: 20000 });
  await hydrate(page);
  const email = adminEmail() || 'admin@eswarisound.com';
  await page.fill('#admin-email', email);
  await page.fill('#admin-password', 'definitely-the-wrong-password');
  await page.click('button[type="submit"]');
  let sawAlert = false;
  try {
    await page.waitForSelector('.alert', { timeout: 20000 });
    sawAlert = true;
  } catch {
    sawAlert = false;
  }
  assert(sawAlert, 'admin/login: bad credentials show an inline alert');
  assert(
    (await page.locator('.glass-card, .rounded-3xl, .rounded-2xl').count()) === 0,
    'admin/login: no card/box chrome on the page'
  );

  await ctx.close();
  await browser.close();

  console.log(`\n--- ${passed} passed, ${failed} failed ---`);
  if (failed > 0) {
    console.log('Failures:');
    for (const f of failures) console.log(`  - ${f}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
