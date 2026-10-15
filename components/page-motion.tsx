'use client';

import {
  createContext, useCallback, useContext, useEffect, useLayoutEffect,
  useRef, useState, type CSSProperties, type ReactNode,
} from 'react';
import { usePathname } from 'next/navigation';
import {
  motion, stagger, useAnimate, useInView, useReducedMotion,
} from 'motion/react';
import { studio } from '@/lib/content';
import { motionSettings } from '@/lib/motion';

type IntroPhase = 'pending' | 'playing' | 'complete';
const IntroContext = createContext<IntroPhase>('complete');

/** Lives in the root layout: client navigation never creates another intro. */
export function IntroProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [phase, setPhase] = useState<IntroPhase>(() => pathname === '/' ? 'pending' : 'complete');
  const active = phase !== 'complete' && pathname === '/';
  const finish = useCallback(() => setPhase('complete'), []);

  useLayoutEffect(() => {
    if (!active) return;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    // If scripts arrived after the CSS fallback, don't cover/lock the page again.
    if (preference.matches || performance.now() >= motionSettings.preloader.failSafeMs) {
      finish();
      return;
    }

    const root = document.documentElement;
    const body = document.body;
    const previousOverflow = root.style.overflow;
    const previousBodyOverflow = body.style.overflow;
    const previousPadding = body.style.paddingRight;
    const scrollbar = window.innerWidth - root.clientWidth;
    // Reserve the scrollbar width to keep the existing layout still during the intro.
    if (scrollbar > 0) body.style.paddingRight = `${parseFloat(getComputedStyle(body).paddingRight) + scrollbar}px`;
    root.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    const background = [...document.querySelectorAll<HTMLElement>('header, main, footer, .skip')];
    const previousInert = background.map(element => element.inert);
    background.forEach(element => { element.inert = true; });
    setPhase('playing');

    // Independent of Motion's promises and asset loading; always unlock the page.
    const timeout = window.setTimeout(finish, Math.max(0, motionSettings.preloader.failSafeMs - performance.now()));
    const onPreference = () => { if (preference.matches) finish(); };
    const onPageShow = (event: PageTransitionEvent) => { if (event.persisted) finish(); };
    preference.addEventListener('change', onPreference);
    window.addEventListener('pageshow', onPageShow);
    return () => {
      clearTimeout(timeout);
      root.style.overflow = previousOverflow;
      body.style.overflow = previousBodyOverflow;
      body.style.paddingRight = previousPadding;
      background.forEach((element, i) => { element.inert = previousInert[i]; });
      preference.removeEventListener('change', onPreference);
      window.removeEventListener('pageshow', onPageShow);
    };
  }, [active, finish]);

  useEffect(() => { if (pathname !== '/') finish(); }, [pathname, finish]);

  return (
    <IntroContext.Provider value={active ? phase : 'complete'}>
      {children}
      {active && <BrandPreloader brand={studio.preloaderName} playing={phase === 'playing'} onComplete={finish} />}
      <noscript><style>{'.brand-preloader{display:none!important}[data-intro-entrance]{opacity:1!important;transform:none!important}'}</style></noscript>
    </IntroContext.Provider>
  );
}

export function BrandPreloader({
  brand, playing, onComplete,
}: { brand: string; playing: boolean; onComplete: () => void }) {
  const [scope, animate] = useAnimate<HTMLDivElement>();
  useEffect(() => {
    if (!playing) return;
    const settings = motionSettings.preloader;
    const characters = Array.from(brand);
    // Keep the reference's total rhythm when the new studio name is longer.
    const entranceStagger = Math.min(settings.characterStagger, settings.entranceSpread / Math.max(1, characters.length - 1));
    const exitStagger = Math.min(settings.exitStagger, settings.exitSpread / Math.max(1, characters.length - 1));
    const entranceEnd = Math.max(settings.scaleDuration,
      settings.characterStart + (characters.length - 1) * entranceStagger + settings.characterDuration);
    const exitStart = entranceEnd + settings.hold;
    const coverStart = exitStart + (characters.length - 1) * exitStagger + settings.exitDuration;
    let disposed = false;
    try {
      const animation = animate([
        ['.preloader-word', { scale: [settings.scaleFrom, 1] },
          { at: 0, duration: settings.scaleDuration, ease: [...settings.scaleEase] }],
        ['.preloader-character', { opacity: [0, 1], y: [settings.characterFromY, 0] },
          { at: settings.characterStart, duration: settings.characterDuration, delay: stagger(entranceStagger), ease: [...motionSettings.reveal.ease] }],
        ['.preloader-character', { opacity: 0, y: 18 },
          { at: exitStart, duration: settings.exitDuration, delay: stagger(exitStagger), ease: 'easeIn' }],
        ['.preloader-caption', { opacity: 0 }, { at: exitStart, duration: settings.exitDuration }],
        [scope.current, { y: '-100%' },
          { at: coverStart, duration: settings.coverDuration, ease: [...settings.coverEase] }],
      ]);
      Promise.resolve(animation).then(() => { if (!disposed) onComplete(); }).catch(() => { if (!disposed) onComplete(); });
      return () => { disposed = true; animation.stop(); };
    } catch {
      onComplete();
    }
  }, [animate, brand, onComplete, playing, scope]);

  return (
    <div ref={scope} className="brand-preloader" aria-hidden="true" inert
      style={{
        '--intro-fail-safe': `${motionSettings.preloader.failSafeMs}ms`,
        '--brand-scale': motionSettings.preloader.scaleFrom,
        '--brand-character-y': `${motionSettings.preloader.characterFromY}px`,
        '--brand-letter-count': Array.from(brand).length,
      } as CSSProperties}>
      <div className="preloader-caption">Interiors by</div>
      <div className="preloader-word">
        {Array.from(brand).map((character, index) => (
          <span className="preloader-character" key={index}>{character}</span>
        ))}
      </div>
    </div>
  );
}

/** Positioning stays on the parent; only this nested layer owns entrance motion. */
export function HeroEntrance({
  children, kind, className = '', enabled = true,
}: { children: ReactNode; kind: 'image' | 'intro' | 'heading'; className?: string; enabled?: boolean }) {
  const phase = useContext(IntroContext);
  const reduced = useReducedMotion();
  const playing = enabled && phase === 'playing' && !reduced;
  const pending = enabled && phase === 'pending' && !reduced;
  const from = kind === 'image'
    ? { scale: motionSettings.hero.scaleFrom, opacity: 1, y: 0 }
    : { scale: 1, opacity: 0, y: kind === 'intro' ? motionSettings.hero.textFromY : -motionSettings.hero.textFromY };

  return (
    <motion.div
      className={`hero-entrance ${className}`}
      style={{ '--intro-fail-safe': `${motionSettings.preloader.failSafeMs}ms` } as CSSProperties}
      data-intro-entrance={playing || pending ? kind : undefined}
      initial={false}
      animate={playing ? {
        scale: [from.scale, 1], opacity: [from.opacity, 1], y: [from.y, 0],
      } : pending ? from : { scale: 1, opacity: 1, y: 0 }}
      transition={playing ? { ...motionSettings.hero.spring, delay: motionSettings.hero.delay } : { duration: 0 }}
    >{children}</motion.div>
  );
}

/** Static server output remains readable. Only unseen content is armed after hydration. */
export function ViewportReveal({ children, className = '', delay = 0 }: {
  children: ReactNode; className?: string; delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const inView = useInView(ref, { once: true, amount: 0.1 });
  const [armed, setArmed] = useState(false);
  useLayoutEffect(() => {
    if (reduced || !ref.current) return;
    const bounds = ref.current.getBoundingClientRect();
    // Leave content restored above the viewport alone (anchors / browser back).
    if (bounds.top >= window.innerHeight) setArmed(true);
  }, [reduced]);
  const hidden = armed && !inView && !reduced;
  return <motion.div ref={ref} className={className} initial={false}
    animate={{ opacity: hidden ? 0 : 1, y: hidden ? motionSettings.reveal.distance : 0 }}
    transition={{ duration: reduced ? 0 : motionSettings.reveal.duration, delay: hidden ? 0 : delay, ease: [...motionSettings.reveal.ease] }}
  >{children}</motion.div>;
}
