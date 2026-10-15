import { expect, test, type Page } from '@playwright/test';
import {studio,images} from '../lib/content';

async function finishIntro(page: Page) {
  await expect(page.locator('.brand-preloader')).toHaveCount(0);
  await expect(page.locator('.route-curtain')).toHaveCount(0);
  await expect(page.locator('main')).not.toHaveAttribute('inert');
  expect(await page.evaluate(() => document.documentElement.style.overflow)).not.toBe('hidden');
}

async function jump(page: Page, top: number) {
  await page.evaluate(y => window.scrollTo({ top: y, behavior: 'instant' }), top);
  await page.waitForTimeout(100); // Let the scroll-linked Motion values settle.
}

async function scene(page: Page) {
  return page.evaluate(() => {
    const layer = document.querySelector('.hero-image-parallax')!;
    return {
      y: new DOMMatrixReadOnly(getComputedStyle(layer).transform).m42,
      opacity: Number(getComputedStyle(document.querySelector('.hero-scene')!).opacity),
    };
  });
}

test('brand descends, stays centered, exits left to right, and replays on refresh', async ({ page }) => {
  await page.addInitScript(() => {
    type Sample = { opacity: number[]; y: number[]; centerX: number; centerY: number; width: number; coverY: number };
    const samples: Sample[] = [];
    (window as Window & { introSamples?: Sample[] }).introSamples = samples;
    let seen = false;
    function sample() {
      const word = document.querySelector<HTMLElement>('.preloader-word');
      const cover = document.querySelector('.brand-preloader');
      if (word && cover) {
        seen = true;
        const rect = word.getBoundingClientRect();
        const letters = [...word.children];
        samples.push({
          opacity: letters.map(x => Number(getComputedStyle(x).opacity)),
          y: letters.map(x => new DOMMatrixReadOnly(getComputedStyle(x).transform).m42),
          centerX: rect.left + rect.width / 2, centerY: rect.top + rect.height / 2,
          width: word.offsetWidth, coverY: cover.getBoundingClientRect().top,
        });
      }
      if (!seen || cover) requestAnimationFrame(sample);
    }
    requestAnimationFrame(sample);
  });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const overlay = page.locator('.brand-preloader');
  await expect(overlay).toBeAttached();
  await expect(page.locator('main')).toHaveAttribute('inert', '');
  await finishIntro(page);
  const samples = await page.evaluate(() => (window as Window & {
    introSamples?: { opacity: number[]; y: number[]; centerX: number; centerY: number; width: number; coverY: number }[]
  }).introSamples!);
  expect(samples.some(x => x.opacity[0] > .5 && x.opacity[x.opacity.length - 1] < .5)).toBe(true);
  expect(samples.some(x => x.y[0] < -5 && x.y[0] > -50)).toBe(true);
  expect(samples.some(x => x.opacity.every(opacity => opacity > .99))).toBe(true);
  expect(samples.some(x => x.opacity[0] < .1 && x.opacity[x.opacity.length - 1] > .3)).toBe(true);
  const stationary = samples.filter(x => Math.abs(x.coverY) < 1);
  for (const sample of stationary) {
    expect(sample.centerX).toBeCloseTo(720, 0);
    expect(sample.centerY).toBeCloseTo(500 + sample.coverY, 0);
    expect(sample.width).toBe(stationary[0].width);
  }
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(overlay).toBeAttached();
  await finishIntro(page);
});

test('internal navigation, ordinary updates, and browser history never replay the intro', async ({ page }) => {
  await page.goto('/about/');
  await expect(page.locator('.brand-preloader')).toHaveCount(0);
  await page.getByRole('banner').getByRole('link', { name: studio.name+' home', exact: true }).click();
  await expect(page).toHaveURL('/');
  await expect(page.locator('.hero-intro')).toBeVisible();
  await expect(page.locator('.brand-preloader')).toHaveCount(0);
  await page.getByRole('button', { name: 'Turnkey Projects' }).click();
  await expect(page.getByRole('button', { name: 'Turnkey Projects' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.brand-preloader')).toHaveCount(0);
  await page.goBack();
  await expect(page).toHaveURL('/about/');
  await page.goForward();
  await expect(page).toHaveURL('/');
  await finishIntro(page);
});

for (const width of [1440, 390]) {
  test(`navigation removes its menu immediately and releases the destination at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/about/');
    for (const [name, destination] of [
      ['Gallery', '/works/'], ['About', '/about/'],
      ['Services', '/#service'], ['Contact', '/#contact'], ['Home', '/'],
    ]) {
      await page.getByRole('button', { name: 'Open navigation' }).click();
      const dialog = page.getByRole('dialog', { name: 'Site navigation' });
      await expect(dialog).toHaveCSS('box-shadow', 'none');
      await dialog.getByRole('link', { name, exact: false }).click();
      // Deliberately immediate: an exit animation must not cover the next page.
      expect(await page.locator('.nav-panel').count()).toBe(0);
      await expect(page).toHaveURL(destination);
      await expect(page.locator('.route-curtain')).toHaveCount(0);
      expect(await page.locator('main, footer').evaluateAll(elements => elements.every(x => !x.hasAttribute('inert')))).toBe(true);
      expect(await page.evaluate(() => document.body.style.overflow)).not.toBe('hidden');
      await expect(page.locator('.brand-preloader')).toHaveCount(0);
    }
    await page.getByRole('button', { name: 'Open navigation' }).click();
    await page.keyboard.press('Escape');
    expect(await page.locator('.nav-panel').count()).toBe(0);
    await expect(page.getByRole('button', { name: 'Open navigation' })).toBeFocused();
  });
}

test('slow hero loading cannot trap the page under the cover', async ({ page }) => {
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  await page.route('**'+images.hero, async route => {
    await gate;
    await route.continue();
  });
  try {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await finishIntro(page);
    expect(await page.locator('.hero-image-parallax img').evaluate(x => (x as HTMLImageElement).complete)).toBe(false);
    await page.getByRole('button', { name: 'Open navigation' }).click();
    await expect(page.getByRole('dialog', { name: 'Site navigation' })).toBeVisible();
    await page.keyboard.press('Escape');
  } finally { release(); }
  await expect.poll(() => page.locator('.hero-image-parallax img').evaluate(x => (x as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
});

test('fail-safe unlocks the page even if all browser animations are stalled', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('main')).toHaveAttribute('inert', '');
  await page.evaluate(() => document.getAnimations().forEach(animation => animation.pause()));
  await finishIntro(page);
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
});

test('reduced motion skips the cover, scrolling effects, ticker, and counters', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await finishIntro(page);
  await jump(page, 500);
  expect(await scene(page)).toEqual({ y: 0, opacity: 1 });
  expect(await page.locator('.image-strip-track').evaluate(x => getComputedStyle(x).animationName)).toBe('none');
  await page.goto('/about/');
  await expect(page.locator('.metric strong')).toHaveText(['2019', 'Pune', 'Full home']);
  expect(await page.locator('.mission h2 span').first().evaluate(x => getComputedStyle(x).color)).toBe('rgb(23, 23, 23)');
});

test('changing reduced-motion preference during the intro releases it immediately', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('main')).toHaveAttribute('inert', '');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await finishIntro(page);
  await expect(page.locator('.hero-intro')).toBeVisible();
});

test('hero parallax and departure fade reverse when scrolling upward', async ({ page }) => {
  await page.goto('/');
  await finishIntro(page);
  await jump(page, 0);
  const start = await scene(page);
  await jump(page, 250);
  const early = await scene(page);
  await jump(page, 500);
  const middle = await scene(page);
  await jump(page, 750);
  const late = await scene(page);
  expect(early.y).toBeGreaterThan(start.y);
  expect(middle.y).toBeGreaterThan(early.y);
  expect(late.y).toBeGreaterThan(middle.y);
  expect(early.opacity).toBeGreaterThan(middle.opacity);
  expect(middle.opacity).toBeGreaterThan(late.opacity);
  await jump(page, 250);
  const reverse = await scene(page);
  expect(reverse.y).toBeCloseTo(early.y, 0);
  expect(reverse.opacity).toBeCloseTo(early.opacity, 1);
  await jump(page, 0);
  expect((await scene(page)).opacity).toBe(1);
});

test('portfolio title enters, holds at 72px, and releases before services', async ({ page }) => {
  await page.goto('/');
  await finishIntro(page);
  const bounds = await page.locator('.project-stage').evaluate(x => ({ top: x.getBoundingClientRect().top + scrollY, height: x.clientHeight }));
  await jump(page, bounds.top - 300);
  expect((await page.locator('.project-backdrop').boundingBox())!.y).toBeGreaterThan(72);
  for (const offset of [100, 350]) {
    await jump(page, bounds.top + offset);
    expect((await page.locator('.project-backdrop').boundingBox())!.y).toBeCloseTo(72, 0);
  }
  await jump(page, bounds.top + bounds.height - 200);
  expect((await page.locator('.project-backdrop').boundingBox())!.y).toBeLessThan(72);
  expect(await page.locator('.project-backdrop').evaluate(x => x.getBoundingClientRect().bottom))
    .toBeLessThanOrEqual(await page.locator('.project-stage').evaluate(x => x.getBoundingClientRect().bottom) + 1);
  await page.locator('#service').scrollIntoViewIfNeeded();
  expect(await page.locator('.project-backdrop').evaluate(x => x.getBoundingClientRect().bottom)).toBeLessThanOrEqual(0);
});

test('ticker moves while stationary and its repeated group meets the loop seam', async ({ page }) => {
  await page.goto('/');
  await finishIntro(page);
  await page.locator('.image-strip').scrollIntoViewIfNeeded();
  await expect(page.locator('.image-strip')).toHaveAttribute('data-running', 'true');
  const first = await page.locator('.image-strip-track').evaluate(x => getComputedStyle(x).transform);
  await page.waitForTimeout(150);
  expect(await page.locator('.image-strip-track').evaluate(x => getComputedStyle(x).transform)).not.toBe(first);
  await expect(page.locator('.image-strip-group').nth(1)).toHaveAttribute('aria-hidden', 'true');
  const seam = await page.locator('.image-strip-track').evaluate(async track => {
    const animation = track.getAnimations()[0];
    animation.pause();
    const duration = Number(animation.effect!.getTiming().duration);
    animation.currentTime = 0;
    await new Promise(requestAnimationFrame);
    const first = track.children[0].getBoundingClientRect().left;
    animation.currentTime = duration - 1;
    await new Promise(requestAnimationFrame);
    return Math.abs(track.children[1].getBoundingClientRect().left - first);
  });
  expect(seam).toBeLessThan(1);
});

test('mobile intro fits, resizing avoids overflow, and anchor navigation still works', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const word = await page.locator('.preloader-word').boundingBox();
  expect(word!.x).toBeGreaterThanOrEqual(0);
  expect(word!.x + word!.width).toBeLessThanOrEqual(360);
  await finishIntro(page);
  for (const width of [360, 390, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await page.goto('/about/');
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await page.getByRole('dialog').getByRole('link', { name: 'Contact' }).click();
  await expect(page).toHaveURL('/#contact');
  await finishIntro(page);
  await expect.poll(() => page.locator('#contact').evaluate(x => Math.abs(x.getBoundingClientRect().top))).toBeLessThan(100);
});

test('mission reveal reverses and metrics finish once without changing layout', async ({ page }) => {
  await page.goto('/about/');
  const mission = page.locator('.mission h2');
  const top = await mission.evaluate(x => x.getBoundingClientRect().top + scrollY);
  await jump(page, 0);
  const initial = await mission.locator('span').first().evaluate(x => getComputedStyle(x).color);
  await jump(page, top);
  expect(await mission.locator('span').first().evaluate(x => getComputedStyle(x).color)).not.toBe(initial);
  await jump(page, 0);
  expect(await mission.locator('span').first().evaluate(x => getComputedStyle(x).color)).toBe(initial);
  await expect(mission).toHaveAttribute('aria-label', /We create functional and aesthetically pleasing spaces/);
  await page.locator('.metrics').scrollIntoViewIfNeeded();
  await expect(page.locator('.metric strong')).toHaveText(['2019', 'Pune', 'Full home']);
  await jump(page, 0);
  await page.locator('.metrics').scrollIntoViewIfNeeded();
  await expect(page.locator('.metric strong')).toHaveText(['2019', 'Pune', 'Full home']);
});

test('late hydration cannot restart the cover after the CSS recovery deadline', async ({ page }) => {
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  await page.route(/\/_next\/.*\.js(?:\?.*)?$/, async route => {
    await gate;
    await route.continue();
  });
  try {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.brand-preloader')).toBeHidden();
    await expect(page.locator('.hero-intro .hero-entrance').first()).toHaveCSS('opacity', '1');
    expect(await page.evaluate(() => document.documentElement.style.overflow)).not.toBe('hidden');
  } finally { release(); }
  await finishIntro(page);
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
});

test('no JavaScript leaves the hero and project content immediately readable', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  try {
    await page.goto('/');
    await expect(page.locator('.brand-preloader')).toBeHidden();
    await expect(page.locator('.hero-intro .hero-entrance').first()).toHaveCSS('opacity', '1');
    await expect(page.getByRole('heading', { name: studio.name, exact: true })).toBeVisible();
    expect(await page.locator('.staggered > div').first().evaluate(x => getComputedStyle(x).opacity)).toBe('1');
    await page.goto('/about/');
    await expect(page.locator('.metric strong')).toHaveText(['2019', 'Pune', 'Full home']);
  } finally { await context.close(); }
});
