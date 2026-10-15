'use client';

import {
  createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef,
  useState, type ComponentProps, type CSSProperties, type ReactNode,
} from 'react';
import NextLink from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAnimate } from 'motion/react';
import { motionSettings } from '@/lib/motion';

type Transition = {
  href: string;
  origin: string;
  target: string;
  phase: 'covering' | 'waiting' | 'revealing';
};
const NavigationContext = createContext<((href: string) => boolean) | null>(null);
const normalize = (path: string) => path.replace(/\/+$/, '') || '/';

/** Keeps native Next Link semantics, including modifier-clicks and no-JS fallback. */
export function TransitionLink({ onNavigate, ...props }: ComponentProps<typeof NextLink>) {
  const navigate = useContext(NavigationContext);
  return <NextLink {...props} onNavigate={event => {
    let prevented = false;
    onNavigate?.({ preventDefault() { prevented = true; event.preventDefault(); } });
    if (!prevented && typeof props.href === 'string' && navigate?.(props.href)) event.preventDefault();
  }} />;
}

export function RouteTransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [transition, setTransition] = useState<Transition | null>(null);
  const current = useRef<Transition | null>(null);
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const active = transition !== null;

  const update = useCallback((next: Transition | null) => {
    current.current = next;
    setTransition(next);
  }, []);
  const finish = useCallback(() => {
    const completed = current.current?.phase === 'revealing';
    update(null);
    if (completed) requestAnimationFrame(() => {
      if (current.current) return;
      const main = document.querySelector<HTMLElement>('main');
      if (!main) return;
      const previous = main.getAttribute('tabindex');
      main.setAttribute('tabindex', '-1');
      main.focus({ preventScroll: true });
      if (previous === null) main.removeAttribute('tabindex');
      else main.setAttribute('tabindex', previous);
    });
  }, [update]);

  const navigate = useCallback((href: string) => {
    const destination = new URL(href, window.location.href);
    if (destination.origin !== window.location.origin
      || normalize(destination.pathname) === normalize(window.location.pathname)
      || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
    if (current.current) return true;
    const localHref = destination.pathname + destination.search + destination.hash;
    router.prefetch(destination.pathname + destination.search);
    update({ href: localHref, origin: normalize(window.location.pathname), target: normalize(destination.pathname), phase: 'covering' });
    return true;
  }, [router, update]);

  // Reapply to newly mounted route content, restoring each element's exact prior state.
  useLayoutEffect(() => {
    if (!active) return;
    const body = document.body;
    const root = document.documentElement;
    const previousOverflow = body.style.overflow;
    const previousRootOverflow = root.style.overflow;
    const previousPadding = body.style.paddingRight;
    const scrollbar = window.innerWidth - root.clientWidth;
    if (scrollbar > 0) body.style.paddingRight = `${parseFloat(getComputedStyle(body).paddingRight) + scrollbar}px`;
    body.style.overflow = 'hidden';
    root.style.overflow = 'hidden';
    const background = [...document.querySelectorAll<HTMLElement>('header, main, footer, .skip')];
    const inert = background.map(element => element.inert);
    background.forEach(element => { element.inert = true; });
    return () => {
      body.style.overflow = previousOverflow;
      root.style.overflow = previousRootOverflow;
      body.style.paddingRight = previousPadding;
      background.forEach((element, i) => { element.inert = inert[i]; });
    };
  }, [active, pathname]);

  useEffect(() => {
    if (!active) return;
    const release = () => {
      const pending = current.current;
      if (pending?.phase === 'covering') router.push(pending.href);
      finish();
    };
    const timeout = window.setTimeout(release, motionSettings.curtain.failSafeMs);
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onPreference = () => { if (media.matches) release(); };
    // History remains native, and cancels any unfinished link transition.
    window.addEventListener('popstate', finish);
    media.addEventListener('change', onPreference);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('popstate', finish);
      media.removeEventListener('change', onPreference);
    };
  }, [active, finish, router]);

  const phase = transition?.phase;
  useEffect(() => {
    if (!phase || phase === 'waiting' || !scope.current) return;
    let disposed = false;
    const settings = motionSettings.curtain;
    try {
      const animation = animate(scope.current,
        { y: phase === 'covering' ? ['100%', '0%'] : ['0%', '-100%'] },
        { duration: phase === 'covering' ? settings.coverDuration : settings.revealDuration, ease: [...settings.ease] });
      Promise.resolve(animation).then(() => {
        if (disposed || !current.current) return;
        if (phase === 'covering') {
          const pending = current.current;
          update({ ...pending, phase: 'waiting' });
          router.push(pending.href);
        } else finish();
      }).catch(() => {
        if (disposed) return;
        if (current.current?.phase === 'covering') router.push(current.current.href);
        finish();
      });
      return () => { disposed = true; animation.stop(); };
    } catch {
      if (current.current?.phase === 'covering') router.push(current.current.href);
      finish();
    }
  }, [phase, animate, scope, router, update, finish]);

  useEffect(() => {
    if (phase !== 'waiting' || !current.current) return;
    const pending = current.current;
    const path = normalize(pathname);
    if (path !== pending.target && path === pending.origin) return;
    let cancelled = false;
    let frame = 0;
    const reveal = () => {
      clearTimeout(timeout);
      if (cancelled) return;
      frame = requestAnimationFrame(() => {
        if (!cancelled && current.current?.phase === 'waiting') update({ ...current.current, phase: 'revealing' });
      });
    };
    // Give the destination hero a brief decode window, never an unbounded load gate.
    const timeout = window.setTimeout(reveal, motionSettings.curtain.imageGraceMs);
    const image = document.querySelector<HTMLImageElement>('main .hero img, main .project-cover img');
    if (image && !image.complete) image.decode().catch(() => {}).then(reveal);
    else reveal();
    return () => { cancelled = true; clearTimeout(timeout); cancelAnimationFrame(frame); };
  }, [pathname, phase, update]);

  return <NavigationContext.Provider value={navigate}>
    {children}
    {active && <div ref={scope} className="route-curtain" data-phase={phase} aria-hidden="true"
      style={{ '--curtain-deadline': `${motionSettings.curtain.failSafeMs}ms` } as CSSProperties} />}
  </NavigationContext.Provider>;
}
