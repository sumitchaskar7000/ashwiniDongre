import { expect, test, type Page } from '@playwright/test';

async function settled(page: Page) {
  await expect(page.locator('.route-curtain')).toHaveCount(0);
  await expect(page.locator('main')).not.toHaveAttribute('inert');
  expect(await page.evaluate(() => document.body.style.overflow)).not.toBe('hidden');
  expect(await page.evaluate(() => document.documentElement.style.overflow)).not.toBe('hidden');
}
async function select(page: Page, name: string) {
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await page.getByRole('dialog').getByRole('link', { name }).click();
}

test('curtain covers the old page before routing and fully leaves the new page', async ({ page }) => {
  await page.goto('/about/');
  await expect(page.locator('.route-curtain')).toHaveCount(0);
  await page.evaluate(() => {
    type Frame = { phase: string | undefined; path: string; top: number };
    const frames: Frame[] = [];
    (window as Window & { curtainFrames?: Frame[] }).curtainFrames = frames;
    let seen = false;
    function sample() {
      const curtain = document.querySelector<HTMLElement>('.route-curtain');
      if (curtain) {
        seen = true;
        frames.push({ phase: curtain.dataset.phase, path: location.pathname, top: curtain.getBoundingClientRect().top });
      }
      if (!seen || curtain) requestAnimationFrame(sample);
    }
    requestAnimationFrame(sample);
  });
  await select(page, 'Gallery');
  expect(await page.locator('.nav-panel').count()).toBe(0);
  await expect(page).toHaveURL('/works/');
  await settled(page);
  const frames = await page.evaluate(() => (window as Window & {
    curtainFrames?: { phase: string; path: string; top: number }[]
  }).curtainFrames!);
  expect(frames.some(frame => frame.phase === 'covering' && frame.path === '/about/' && frame.top > 0)).toBe(true);
  expect(frames.some(frame => frame.path === '/works/' && Math.abs(frame.top) < 2)).toBe(true);
  expect(frames.some(frame => frame.phase === 'revealing' && frame.path === '/works/' && frame.top < -100)).toBe(true);
  await expect(page.locator('.brand-preloader')).toHaveCount(0);
});

test('same-page anchors remain native while cross-page anchors use one curtain', async ({ page }) => {
  await page.goto('/about/');
  await page.getByRole('link', { name: 'Meet the studio', exact: false }).click();
  await expect(page).toHaveURL('/about/#mission');
  await expect(page.locator('.route-curtain')).toHaveCount(0);
  await select(page, 'Contact');
  await expect(page.locator('.route-curtain')).toBeAttached();
  await expect(page).toHaveURL('/#contact');
  await settled(page);
  await expect.poll(() => page.locator('#contact').evaluate(x => Math.abs(x.getBoundingClientRect().top))).toBeLessThan(100);
  await expect(page.locator('.brand-preloader')).toHaveCount(0);
});

test('reduced motion bypasses the curtain and can interrupt an active sweep', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/about/');
  await select(page, 'Gallery');
  await expect(page).toHaveURL('/works/');
  await settled(page);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await select(page, 'About');
  await expect(page.locator('.route-curtain')).toBeAttached();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page).toHaveURL('/about/');
  await settled(page);
});

test('a stalled navigation releases the curtain after its recovery deadline', async ({ page }) => {
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  await page.route(/\/works\/?(?:\?.*)?$/, async route => {
    await gate;
    await route.continue();
  });
  await page.goto('/about/');
  const start = Date.now();
  try {
    await select(page, 'Gallery');
    await expect(page.locator('.route-curtain')).toHaveAttribute('data-phase', 'waiting');
    await settled(page);
    expect(Date.now() - start).toBeGreaterThanOrEqual(4500);
  } finally { release(); }
  await expect(page).toHaveURL('/works/');
  await settled(page);
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
});

test('browser back cancels a pending curtain without pushing the abandoned page', async ({ page }) => {
  await page.goto('/works/');
  await select(page, 'About');
  await expect(page).toHaveURL('/about/');
  await settled(page);
  await select(page, 'Gallery');
  await expect(page.locator('.route-curtain')).toBeAttached();
  await page.goBack();
  await expect(page).toHaveURL('/works/');
  await settled(page);
  await page.waitForTimeout(600);
  await expect(page).toHaveURL('/works/');
});
