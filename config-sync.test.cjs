const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
let playwright;
try { playwright = require('playwright'); }
catch (error) {
  if (error.code !== 'MODULE_NOT_FOUND') throw error;
  playwright = require(path.join(os.homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
}
const { chromium } = playwright;

(async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'linkman-sync-test-'));
  fs.copyFileSync(path.join(__dirname, 'server.js'), path.join(directory, 'server.js'));
  fs.copyFileSync(path.join(__dirname, 'index.html'), path.join(directory, 'index.html'));
  const initial = { schemaVersion: 8, areas: [{ id: 'default', name: 'Test' }, { id: 'second', name: 'Zweite Area' }], activeAreaId: 'default', links: [], widgets: [], settings: {}, categories: [], groupAreas: {}, groupOrder: [], containerOrder: [] };
  const configPath = path.join(directory, 'LinkData.json');
  fs.writeFileSync(configPath, JSON.stringify(initial));
  const { server } = require(path.join(directory, 'server.js'));
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const url = 'http://127.0.0.1:' + server.address().port;
  let browser;
  try {
    const read = async () => (await fetch(url + '/api/config')).json();
    const post = (data, revision, origin = 'null') => fetch(url + '/api/config', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: origin }, body: JSON.stringify({ data, revision }) });
    const base = await read();
    const changed = { ...initial, settings: { menuItemFontSize: 17 }, areas: [{ id: 'default', name: 'Prüfung' }, initial.areas[1]] };
    const saved = await post(changed, base.revision);
    assert.equal(saved.status, 200);
    const savedRevision = (await saved.json()).revision;
    assert.deepEqual(JSON.parse(fs.readFileSync(configPath, 'utf8')), changed);
    assert.equal(fs.readdirSync(path.join(directory, 'LinkMan-Backups')).length, 1);
    const duplicate = await post(changed, base.revision);
    assert.equal(duplicate.status, 200);
    const conflicting = { ...changed, settings: { menuItemFontSize: 20 } };
    const conflict = await post(conflicting, base.revision);
    assert.equal(conflict.status, 409);
    const conflictFile = (await conflict.json()).conflictFile;
    assert.deepEqual(JSON.parse(fs.readFileSync(path.join(directory, conflictFile), 'utf8')), conflicting);
    assert.deepEqual((await read()).data, changed);
    assert.equal((await post(conflicting, savedRevision, 'https://example.com')).status, 403);
    assert.equal((await post({}, savedRevision)).status, 400);

    browser = await chromium.launch({ headless: true, channel: 'msedge' });
    const page = await browser.newPage();
    const errors = [];
    await page.addInitScript(data => {
      if (!localStorage.getItem('test-seeded')) {
        localStorage.setItem('linkman_cache_v2', JSON.stringify(data));
        localStorage.setItem('test-seeded', 'yes');
      }
    }, initial);
    page.on('pageerror', error => errors.push(error.message));
    let offline = false;
    await page.route('**/*', route => route.request().url().startsWith('http://127.0.0.1:') ? route.continue() : route.abort());
    await page.route('http://127.0.0.1:8765/api/config', async route => {
      if (offline) return route.abort();
      const response = await route.fetch({ url: url + '/api/config', headers: { ...route.request().headers(), origin: 'null' } });
      await route.fulfill({ response });
    });
    await page.route('http://127.0.0.1:8765/api/system-info', route => route.fulfill({ json: { bootTimeMs: Date.now() - 3600000, sessionStartMs: Date.now() - 3600000 } }));
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => configSync.connected);
    assert.equal(await page.evaluate(() => state.settings.menuItemFontSize), 17);
    const recovered = await page.evaluate(() => configSync.recoveryFile);
    assert.ok(recovered);
    assert.deepEqual(JSON.parse(fs.readFileSync(path.join(directory, recovered), 'utf8')), initial);
    await page.locator('[data-area-id="second"]').click();
    assert.equal(await page.evaluate(() => localStorage.getItem(ACTIVE_AREA_STORAGE_KEY)), 'second');
    assert.equal(await page.evaluate(() => uiState.hasUnsavedChanges), false);
    await page.reload();
    await page.waitForFunction(() => configSync.connected);
    assert.equal(await page.evaluate(() => state.activeAreaId), 'second');
    await page.getByRole('button', { name: 'Einstellungen', exact: true }).click();
    for (const width of [1280, 375]) {
      await page.setViewportSize({ width, height: 800 });
      for (const name of ['Anzeige', 'Daten', 'Dienst']) {
        await page.getByRole('tab', { name, exact: true }).click();
        assert.equal(await page.locator('.settings-content:visible').count(), 1);
        const bounds = await page.locator('#functionsModal .modal-dialog').boundingBox();
        assert.ok(bounds.x >= 0 && bounds.x + bounds.width <= width);
        assert.ok(bounds.y + bounds.height <= 800);
        const overflows = await page.locator('.settings-content:visible').evaluate(panel => panel.scrollWidth > panel.clientWidth);
        assert.equal(overflows, false);
        await page.locator('#functionsModal .modal-dialog').screenshot({ path: path.join(process.env.LINKMAN_TEST_ARTIFACTS || directory, 'settings-' + name + '-' + width + '.png') });
      }
    }
    await page.getByRole('tab', { name: 'Anzeige', exact: true }).click();
    await page.getByRole('tab', { name: 'Anzeige', exact: true }).press('ArrowRight');
    assert.equal(await page.getByRole('tab', { name: 'Daten', exact: true }).getAttribute('aria-selected'), 'true');
    await page.getByRole('button', { name: 'Einstellungen schließen', exact: true }).click();
    await page.evaluate(() => { state.settings.menuItemFontSize = 18; save(); });
    await page.waitForFunction(() => !uiState.hasUnsavedChanges);
    assert.equal((await read()).data.settings.menuItemFontSize, 18);
    await page.reload();
    await page.waitForFunction(() => configSync.connected);
    assert.equal(await page.evaluate(() => state.settings.menuItemFontSize), 18);

    offline = true;
    await page.evaluate(async () => { state.settings.menuItemFontSize = 19; save(); await persistConfig(); });
    assert.equal(await page.evaluate(() => readPendingConfig().data.settings.menuItemFontSize), 19);
    await page.reload();
    await page.waitForFunction(() => state.settings.menuItemFontSize === 19);
    assert.equal(await page.evaluate(() => uiState.hasUnsavedChanges), true);
    offline = false;
    await page.evaluate(() => persistConfig());
    await page.waitForFunction(() => !uiState.hasUnsavedChanges);
    assert.equal((await read()).data.settings.menuItemFontSize, 19);

    const remote = await read();
    await post({ ...remote.data, settings: { ...remote.data.settings, menuItemFontSize: 21 } }, remote.revision);
    await page.evaluate(() => refreshConfig());
    assert.equal(await page.evaluate(() => state.settings.menuItemFontSize), 21);
    assert.equal(await page.evaluate(() => state.activeAreaId), 'second');
    const secondBase = await read();
    await post({ ...secondBase.data, settings: { ...secondBase.data.settings, menuItemFontSize: 22 } }, secondBase.revision);
    await page.evaluate(async () => { state.settings.menuItemFontSize = 23; save(); await persistConfig(); });
    assert.ok(await page.evaluate(() => configSync.conflictFile));
    assert.equal((await read()).data.settings.menuItemFontSize, 22);
    assert.equal(await page.evaluate(() => readPendingConfig().data.settings.menuItemFontSize), 23);
    await page.reload();
    await page.waitForFunction(() => configSync.conflictFile);
    assert.equal(await page.evaluate(() => state.settings.menuItemFontSize), 23);
    await page.evaluate(() => {
      const data = snapshotState();
      data.areas = data.areas.filter(area => area.id !== 'second');
      applyParsedData(data);
      renderLinks();
    });
    assert.equal(await page.evaluate(() => state.activeAreaId), 'default');
    assert.equal(await page.evaluate(() => localStorage.getItem(ACTIVE_AREA_STORAGE_KEY)), 'default');
    assert.deepEqual(errors, []);
    console.log('PASS: config sync and recovery; selected area reload, external update and deleted-area fallback; settings tabs, keyboard navigation and desktop/mobile layout; no JavaScript errors.');
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
    fs.rmSync(directory, { recursive: true, force: true });
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
