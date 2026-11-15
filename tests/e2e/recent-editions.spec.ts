import { test, expect, type Page, type APIRequestContext } from '@playwright/test';

/*
 * E2E Test Suite: Recent Stories and Edition Browsing (R1-R5)
 * Tiers 1-4 comprehensive opaque-box test suite.
 * Strict style rule: Zero em dashes (U+2014) in this file.
 */

async function ready(page: Page, path = './ko/') {
  await page.goto(path);
  await page.waitForFunction(() => document.documentElement.dataset.ready === '1');
}

const hash = (page: Page) => page.evaluate(() => location.hash);
const hashIs = (page: Page, h: string) => expect.poll(() => hash(page)).toBe(h);

async function recentCountFromApi(request: APIRequestContext, since = '2026-10-27'): Promise<number> {
  const t = (await (await request.get('timeline.json')).json()) as {
    scenes: { added: string; items: unknown[] }[];
  };
  return t.scenes.filter(s => s.added >= since).reduce((n, s) => n + 1 + s.items.length, 0);
}

// ---------------------------------------------------------------------------
// Tier 1: Feature Coverage
// ---------------------------------------------------------------------------

test.describe('Tier 1: Feature Coverage', () => {
  test('TC-T1-01: floating note displays first-time copy for first-time visitors', async ({ page }) => {
    // Korean locale
    await ready(page, './ko/');
    const sinceKo = page.locator('.since');
    await expect(sinceKo).toBeVisible();
    await expect(sinceKo).toContainText(/최근 업데이트 · 새 상자 \d+개/);
    await expect(sinceKo.locator('.since-show')).toHaveText('보기');
    await expect(sinceKo.locator('.since-x')).toBeVisible();

    // English locale
    await ready(page, './');
    const sinceEn = page.locator('.since');
    await expect(sinceEn).toBeVisible();
    await expect(sinceEn).toContainText(/Recent updates · \d+ new boxes/);
    await expect(sinceEn.locator('.since-show')).toHaveText('Show');
    await expect(sinceEn.locator('.since-x')).toBeVisible();
  });

  test('TC-T1-02: floating note displays returning copy for returning visitors', async ({ page, request }) => {
    await page.addInitScript(() => {
      if (!sessionStorage.getItem('seeded')) {
        localStorage.setItem('atl:seen', '2026-10-27');
        sessionStorage.setItem('seeded', '1');
      }
    });

    // Korean locale
    await ready(page, './ko/');
    const sinceKo = page.locator('.since');
    await expect(sinceKo).toBeVisible();
    await expect(sinceKo).toContainText(/지난 방문 이후 새 상자 \d+개/);

    // English locale
    await ready(page, './');
    const sinceEn = page.locator('.since');
    await expect(sinceEn).toBeVisible();
    await expect(sinceEn).toContainText(/new (boxes )?since your last visit/);
  });

  test('TC-T1-03: clicking .since-show activates Recent pick filter and dismisses note', async ({ page }) => {
    await ready(page, './ko/');
    const since = page.locator('.since');
    await expect(since).toBeVisible();

    await since.locator('.since-show').click();

    await expect(page.locator('.wall.pick')).toHaveCount(1);
    const onBoxes = page.locator('.wall .box.on');
    expect(await onBoxes.count()).toBeGreaterThan(0);
    await expect(since).toBeHidden();

    // PickBar is displayed
    const pickbar = page.locator('#pickbar');
    await expect(pickbar).toBeVisible();
    const pbK = page.locator('#pickbar .pb-k');
    await expect(pbK).toHaveText(/최근|새 상자/);
  });

  test('TC-T1-04: cover lede inline link triggers recent updates navigation', async ({ page }) => {
    await ready(page, './ko/');
    const lede = page.locator('.cover .lede');
    await expect(lede).toBeVisible();

    // Locates inline link inside lede text
    const inlineLink = page.locator('.cover .lede a');
    await expect(inlineLink).toBeVisible();
    await expect(inlineLink).toHaveText(/최근 업데이트|최근/);

    await inlineLink.click();

    // Activates Recent pick in PickBar
    await expect(page.locator('.wall.pick')).toHaveCount(1);
    await expect(page.locator('#pickbar')).toBeVisible();
    expect(await page.locator('.wall .box.on').count()).toBeGreaterThan(0);
  });

  test('TC-T1-05: PickBar Recent filter displays key label, box count, and shortcut chips', async ({ page }) => {
    await ready(page, './ko/');
    await page.locator('.since .since-show').click();

    const pickbar = page.locator('#pickbar');
    await expect(pickbar).toBeVisible();

    const pbK = page.locator('#pickbar .pb-k');
    await expect(pbK).toHaveText(/최근|새 상자/);

    const pbN = page.locator('#pickbar .pb-n');
    await expect(pbN).toBeVisible();
    expect((await pbN.textContent())?.trim().length).toBeGreaterThan(0);

    const pbBody = page.locator('#pickbar .pb-body');
    await expect(pbBody).toBeVisible();

    // Scene shortcut chips exist within .pb-body
    const chips = page.locator('#pickbar .pb-body a, #pickbar .pb-body button, #pickbar .pb-body .pb-chip');
    expect(await chips.count()).toBeGreaterThan(0);
  });

  test('TC-T1-06: PickBar edition navigation displays spaced labels and summary text', async ({ page }) => {
    await ready(page, './ko/');
    await page.locator('.since .since-show').click();

    // Step backward from Recent into Edition 6
    const prevBtn = page.locator('#pickbar .pb-prev');
    await expect(prevBtn).toBeEnabled();
    await prevBtn.click();

    const name = page.locator('#pickbar .pb-name');
    await expect(name).toContainText(/제 6판/);
    // Strict spacing assertion: never unspaced 제6판
    expect(await name.textContent()).not.toMatch(/제\d+판/);

    // Summary text from content/editions.yaml for Edition 6
    const body = page.locator('#pickbar .pb-body');
    await expect(body).toContainText(/장면 9개를 더했다/);

    // Chips for Edition 6 scenes exist
    const chips = page.locator('#pickbar .pb-body a, #pickbar .pb-body button, #pickbar .pb-body .pb-chip');
    expect(await chips.count()).toBeGreaterThan(0);
  });

  test('TC-T1-07: detail view sequential reading traverses active scenes with ArrowLeft / ArrowRight', async ({ page }) => {
    await ready(page, './ko/');
    await page.locator('.since .since-show').click();

    // Open first scene in active set
    const firstScene = page.locator('.wall .box.scene.on').first();
    const firstAddr = await firstScene.getAttribute('data-addr');
    const sceneCount = await page.locator('.wall .box.scene.on').count();
    await firstScene.click();

    const dlg = page.locator('#detail');
    await expect(dlg).toHaveAttribute('open', '');
    await expect(page.locator('#detail .pos')).toHaveText(`${sceneCount} / ${sceneCount}`);
    const initialTitle = await page.locator('#detail-title').textContent();

    // ArrowLeft steps to next scene in timeline sequence
    await page.keyboard.press('ArrowLeft');
    await expect(page.locator('#detail .pos')).toHaveText(`${sceneCount - 1} / ${sceneCount}`);
    const nextTitle = await page.locator('#detail-title').textContent();
    expect(nextTitle).not.toBe(initialTitle);

    // ArrowRight steps back to previous scene
    await page.keyboard.press('ArrowRight');
    expect(await page.locator('#detail-title').textContent()).toBe(initialTitle);
    await hashIs(page, '#' + firstAddr);
  });

  test('TC-T1-08: detail view header displays date badges for added and updated scenes', async ({ page }) => {
    // Recently added scene
    await ready(page, './ko/#2026-11-nvidia-ceo');
    const dlg = page.locator('#detail');
    await expect(dlg).toHaveAttribute('open', '');
    const metaAdded = page.locator('#detail .dbody p.meta');
    await expect(metaAdded).toContainText(/ · 추가 \d{4}\.\d{2}\.\d{2}/);

    // Recently updated scene (ChatGPT has added: 2026-10-05 and updated: 2026-11-02)
    await page.locator('#detail .x').click();
    await page.locator('a.box[href="#2022-11-chatgpt"]').click();
    await expect(dlg).toHaveAttribute('open', '');
    const metaUpdated = page.locator('#detail .dbody p.meta');
    await expect(metaUpdated).toContainText(/ · 보강 \d{4}\.\d{2}\.\d{2}/);
  });
});

// ---------------------------------------------------------------------------
// Tier 2: Boundary and Corner Cases
// ---------------------------------------------------------------------------

test.describe('Tier 2: Boundary and Corner Cases', () => {
  test('TC-T2-01: session dismiss persists in sessionStorage across page reloads', async ({ page }) => {
    await ready(page, './ko/');
    const since = page.locator('.since');
    await expect(since).toBeVisible();

    // Click dismiss button ×
    await since.locator('.since-x').click();
    await expect(since).toBeHidden();
    await expect(page.locator('.wall.pick')).toHaveCount(0);

    // Reload within same tab session
    await page.reload();
    await page.waitForFunction(() => document.documentElement.dataset.ready === '1');

    // Floating note remains suppressed
    await expect(page.locator('.since')).toBeHidden();
  });

  test('TC-T2-02: navigation boundary buttons are disabled at Edition 1 and Recent', async ({ page }) => {
    await ready(page, './ko/');
    await page.locator('.since .since-show').click();

    // At Recent (newest): forward/newer button must be disabled
    const nextBtn = page.locator('#pickbar .pb-next');
    await expect(nextBtn).toBeDisabled();

    // Step backwards all the way to Edition 1
    const prevBtn = page.locator('#pickbar .pb-prev');
    while (await prevBtn.isEnabled()) {
      await prevBtn.click();
    }

    // At Edition 1 (oldest): backward/older button must be disabled
    await expect(prevBtn).toBeDisabled();
    const name = page.locator('#pickbar .pb-name');
    await expect(name).toContainText(/제 1판|Edition 1/);
    expect(await name.textContent()).not.toMatch(/제\d+판/);

    // Summary matches Edition 1
    const body = page.locator('#pickbar .pb-body');
    await expect(body).toContainText(/첫 판|First edition/);
  });

  test('TC-T2-03: detail view boundary buttons disabled at earliest and newest active scene', async ({ page }) => {
    await ready(page, './ko/');
    await page.locator('.since .since-show').click();

    // Open newest scene (first in DOM order)
    const newestBox = page.locator('.wall .box.scene.on').first();
    await newestBox.click();

    const detailNext = page.locator('#detail .next');
    const detailPrev = page.locator('#detail .prev');

    // At newest scene, next (forward in time) is disabled
    await expect(detailNext).toBeDisabled();
    await expect(detailPrev).toBeEnabled();

    // Navigate to the earliest scene in the active bundle
    while (await detailPrev.isEnabled()) {
      await detailPrev.click();
    }

    // At earliest scene, prev (backward in time) is disabled
    await expect(detailPrev).toBeDisabled();
    await expect(detailNext).toBeEnabled();
  });

  test('TC-T2-04: cover height bounding box is strictly 200px across viewports', async ({ page }) => {
    const viewports = [
      { width: 1280, height: 860, name: 'desktop' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 390, height: 640, name: 'iphone-14' },
      { width: 375, height: 640, name: 'iphone-se' },
      { width: 360, height: 640, name: 'android' },
      { width: 320, height: 640, name: 'narrow' },
    ];

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await ready(page, './ko/');

      const cover = page.locator('.cover');
      await expect(cover).toBeVisible();
      const box = await cover.boundingBox();
      expect(box, `Cover bounding box should exist at ${vp.name}`).not.toBeNull();
      expect(box!.height, `Cover height at ${vp.name} (${vp.width}px)`).toBe(200);
    }
  });

  test('TC-T2-05: mobile top bar elements fit within viewport at 320px, 360px, 375px', async ({ page }) => {
    for (const width of [320, 360, 375]) {
      await page.setViewportSize({ width, height: 640 });
      await ready(page, './ko/');

      for (const sel of ['header.top a.gh svg', 'header.top nav.lang', 'header.top a.report', 'header.top .tp-btn']) {
        const box = await page.locator(sel).boundingBox();
        if (box) {
          expect(box.x + box.width, `${sel} fit at ${width}px`).toBeLessThanOrEqual(width);
        }
      }
    }
  });

  test('TC-T2-06: site title .name does not clip at phone widths 360px-390px', async ({ page }) => {
    for (const width of [360, 375, 381, 390]) {
      await page.setViewportSize({ width, height: 640 });
      await ready(page, './ko/');

      const name = page.locator('header.top .name');
      const fits = await name.evaluate(e => e.scrollWidth <= e.clientWidth);
      expect(fits, `Site title overflow check at ${width}px`).toBe(true);
    }
  });

  test('TC-T2-07: storage exception resilience when localStorage and sessionStorage throw', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', m => {
      if (m.type() === 'error') errors.push(m.text());
    });
    page.on('pageerror', e => errors.push(e.message));

    await page.addInitScript(() => {
      Storage.prototype.getItem = () => {
        throw new Error('blocked');
      };
      Storage.prototype.setItem = () => {
        throw new Error('blocked');
      };
    });

    await ready(page, './ko/');
    await expect(page.locator('.wall')).toBeVisible();
    await expect(page.locator('.since')).toBeHidden();
    expect(errors).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Tier 3: Cross-Feature Interactions
// ---------------------------------------------------------------------------

test.describe('Tier 3: Cross-Feature Interactions', () => {
  test('TC-T3-01: opening scene from PickBar chip and traversing with keyboard ArrowLeft / ArrowRight', async ({ page }) => {
    await ready(page, './ko/');
    await page.locator('.since .since-show').click();

    const firstChip = page.locator('#pickbar .pb-body a, #pickbar .pb-body button, #pickbar .pb-body .pb-chip').first();
    await expect(firstChip).toBeVisible();
    const chipText = (await firstChip.textContent())?.trim();

    await firstChip.click();

    const dlg = page.locator('#detail');
    await expect(dlg).toHaveAttribute('open', '');
    const title = await page.locator('#detail-title').textContent();
    expect(title).toBeDefined();

    // Step with keyboard ArrowLeft
    await page.keyboard.press('ArrowLeft');
    const steppedTitle = await page.locator('#detail-title').textContent();
    expect(steppedTitle).not.toBe(title);

    // Step back with keyboard ArrowRight
    await page.keyboard.press('ArrowRight');
    expect(await page.locator('#detail-title').textContent()).toBe(title);
  });

  test('TC-T3-02: dismissing floating note then accessing Recent filter via search menu .tp-new', async ({ page }) => {
    await ready(page, './ko/');
    const since = page.locator('.since');
    await expect(since).toBeVisible();

    // Dismiss note
    await since.locator('.since-x').click();
    await expect(since).toBeHidden();

    // Open search menu
    const tpBtn = page.locator('.top .tp-btn');
    await tpBtn.click();
    await expect(tpBtn).toHaveAttribute('aria-expanded', 'true');

    // Recent/new button in search menu is visible and clickable
    const tpNew = page.locator('.tp-new button');
    await expect(tpNew).toBeVisible();
    await expect(tpNew).toContainText(/새 상자|최근 업데이트/);

    await tpNew.click();

    // Activates PickBar with recent/new filter and closes search menu
    await expect(tpBtn).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('.wall.pick')).toHaveCount(1);
    await expect(page.locator('#pickbar')).toBeVisible();
    expect(await page.locator('.wall .box.on').count()).toBeGreaterThan(0);
  });

  test('TC-T3-03: switching editions updates highlighted boxes and detail view traversal set', async ({ page }) => {
    await ready(page, './ko/');
    await page.locator('.since .since-show').click();

    // Navigate to Edition 5 (20 scenes added)
    const prevBtn = page.locator('#pickbar .pb-prev');
    await prevBtn.click(); // to Edition 6
    await prevBtn.click(); // to Edition 5

    const name = page.locator('#pickbar .pb-name');
    await expect(name).toContainText(/제 5판/);
    expect(await name.textContent()).not.toMatch(/제\d+판/);

    const onBoxes5 = await page.locator('.wall .box.on').count();
    expect(onBoxes5).toBeGreaterThan(0);

    // Open scene chip in Edition 5
    const chip = page.locator('#pickbar .pb-body a, #pickbar .pb-body button, #pickbar .pb-body .pb-chip').first();
    await chip.click();

    const dlg = page.locator('#detail');
    await expect(dlg).toHaveAttribute('open', '');

    // Close detail view with Escape
    await page.keyboard.press('Escape');
    await expect(dlg).not.toHaveAttribute('open', '');

    // PickBar and Edition 5 state remain active
    await expect(page.locator('#pickbar')).toBeVisible();
    await expect(name).toContainText(/제 5판/);
  });

  test('TC-T3-04: closing PickBar via .pb-x restores hover light and wall state', async ({ page }) => {
    await ready(page, './ko/');
    await page.locator('.since .since-show').click();

    const pickbar = page.locator('#pickbar');
    await expect(pickbar).toBeVisible();
    await expect(page.locator('.wall.pick')).toHaveCount(1);

    // Clear pick via .pb-x
    await page.locator('#pickbar .pb-x').click();

    await expect(page.locator('.wall.pick')).toHaveCount(0);
    await expect(pickbar).toBeHidden();

    // Hover lighting restored on scene box
    const box = page.locator('.wall a.box.item').first();
    await box.hover();
    await expect(page.locator('.wall.focus')).toHaveCount(1);
  });

  test('TC-T3-05: Escape key closes detail view while preserving active edition filter', async ({ page }) => {
    await ready(page, './ko/');
    await page.locator('.since .since-show').click();

    // Step to Edition 6
    await page.locator('#pickbar .pb-prev').click();
    await expect(page.locator('#pickbar .pb-name')).toContainText(/제 6판/);

    const firstBox = page.locator('.wall .box.scene.on').first();
    await firstBox.click();

    const dlg = page.locator('#detail');
    await expect(dlg).toHaveAttribute('open', '');

    // Press Escape
    await page.keyboard.press('Escape');
    await expect(dlg).not.toHaveAttribute('open', '');
    await hashIs(page, '');

    // Filter remains active
    await expect(page.locator('#pickbar')).toBeVisible();
    await expect(page.locator('#pickbar .pb-name')).toContainText(/제 6판/);
    await expect(page.locator('.wall.pick')).toHaveCount(1);
  });
});

// ---------------------------------------------------------------------------
// Tier 4: Real-World Scenarios
// ---------------------------------------------------------------------------

test.describe('Tier 4: Real-World Application Scenarios', () => {
  test('TC-T4-01: Scenario 1 - First-time visitor discovery workflow', async ({ page }) => {
    // 1. First-time visitor arrives on Korean home page
    await ready(page, './ko/');

    // 2. Discovers floating note with recent updates count
    const since = page.locator('.since');
    await expect(since).toBeVisible();
    await expect(since).toContainText(/최근 업데이트 · 새 상자 \d+개/);

    // 3. Inspects cover lede containing inline recent link
    const inlineLink = page.locator('.cover .lede a');
    await expect(inlineLink).toBeVisible();

    // 4. Clicks Show button on floating note
    await since.locator('.since-show').click();
    await expect(since).toBeHidden();

    // 5. PickBar appears with Recent filter and scene chips
    const pickbar = page.locator('#pickbar');
    await expect(pickbar).toBeVisible();
    const chips = page.locator('#pickbar .pb-body a, #pickbar .pb-body button, #pickbar .pb-body .pb-chip');
    expect(await chips.count()).toBeGreaterThan(0);

    // 6. Clicks first recent scene chip to open detail modal
    await chips.first().click();
    const dlg = page.locator('#detail');
    await expect(dlg).toHaveAttribute('open', '');

    // 7. Verifies date badge in header
    const meta = page.locator('#detail .dbody p.meta');
    await expect(meta).toContainText(/ · (추가|보강) \d{4}\.\d{2}\.\d{2}/);

    // 8. Sequentially reads next recent scene with keyboard ArrowLeft
    const title1 = await page.locator('#detail-title').textContent();
    await page.keyboard.press('ArrowLeft');
    const title2 = await page.locator('#detail-title').textContent();
    expect(title2).not.toBe(title1);

    // 9. Closes modal with Escape
    await page.keyboard.press('Escape');
    await expect(dlg).not.toHaveAttribute('open', '');

    // 10. Closes PickBar with .pb-x to explore full timeline
    await page.locator('#pickbar .pb-x').click();
    await expect(pickbar).toBeHidden();
    await expect(page.locator('.wall.pick')).toHaveCount(0);
  });

  test('TC-T4-02: Scenario 2 - Returning visitor catch-up workflow', async ({ page }) => {
    // 1. Returning visitor arrives with seen date 2026-10-27
    await page.addInitScript(() => {
      localStorage.setItem('atl:seen', '2026-10-27');
    });
    await ready(page, './ko/');

    // 2. Sees floating note indicating boxes added since last visit
    const since = page.locator('.since');
    await expect(since).toBeVisible();
    await expect(since).toContainText(/지난 방문 이후 새 상자 \d+개/);

    // 3. Dismisses note via × to scan the wall freely first
    await since.locator('.since-x').click();
    await expect(since).toBeHidden();

    // 4. Later opens search menu to find recent updates
    const tpBtn = page.locator('.top .tp-btn');
    await tpBtn.click();
    const tpNew = page.locator('.tp-new button');
    await expect(tpNew).toBeVisible();
    await tpNew.click();

    // 5. Recent updates highlighted on wall
    await expect(page.locator('.wall.pick')).toHaveCount(1);
    await expect(page.locator('#pickbar')).toBeVisible();

    // 6. Opens an updated scene and confirms enriched badge
    await page.locator('a.box[href="#2022-11-chatgpt"]').click();
    const dlg = page.locator('#detail');
    await expect(dlg).toHaveAttribute('open', '');
    await expect(page.locator('#detail .dbody p.meta')).toContainText(/ · 보강 \d{4}\.\d{2}\.\d{2}/);

    await page.keyboard.press('Escape');
    await expect(dlg).not.toHaveAttribute('open', '');
  });

  test('TC-T4-03: Scenario 3 - Historical edition explorer workflow', async ({ page }) => {
    // 1. User starts at Recent updates
    await ready(page, './ko/');
    await page.locator('.since .since-show').click();

    const pickbar = page.locator('#pickbar');
    await expect(pickbar).toBeVisible();

    const prevBtn = page.locator('#pickbar .pb-prev');
    const name = page.locator('#pickbar .pb-name');
    const body = page.locator('#pickbar .pb-body');

    // 2. Steps sequentially backwards: Recent -> Edition 6 -> Edition 5 -> Edition 4 -> Edition 3 -> Edition 2 -> Edition 1
    const expectedEditions = [
      { label: '제 6판', summaryText: '장면 9개를 더했다' },
      { label: '제 5판', summaryText: '2023~2026년의 빈 흐름을 메웠다' },
      { label: '제 4판', summaryText: '동반자 챗봇 규칙' },
      { label: '제 3판', summaryText: '연구소 상장 준비' },
      { label: '제 2판', summaryText: 'ChatGPT 광고' },
      { label: '제 1판', summaryText: '첫 판. ChatGPT 공개부터 장면 28개를 찍었다' },
    ];

    for (const ed of expectedEditions) {
      await prevBtn.click();
      await expect(name).toContainText(ed.label);
      expect(await name.textContent()).not.toMatch(/제\d+판/);
      await expect(body).toContainText(ed.summaryText);
    }

    // 3. At Edition 1, prev button is disabled
    await expect(prevBtn).toBeDisabled();

    // 4. Opens an Edition 1 scene chip
    const chip = page.locator('#pickbar .pb-body a, #pickbar .pb-body button, #pickbar .pb-body .pb-chip').first();
    await chip.click();

    const dlg = page.locator('#detail');
    await expect(dlg).toHaveAttribute('open', '');

    // 5. Closes modal and navigates back forward to Recent
    await page.keyboard.press('Escape');
    await expect(dlg).not.toHaveAttribute('open', '');

    const nextBtn = page.locator('#pickbar .pb-next');
    while (await nextBtn.isEnabled()) {
      await nextBtn.click();
    }

    // Back at Recent updates
    await expect(nextBtn).toBeDisabled();
    await expect(page.locator('#pickbar .pb-k')).toHaveText(/최근|새 상자/);
  });
});
