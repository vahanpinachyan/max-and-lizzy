"use client";

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "max-and-lizzy-wishlist";
const EMPTY_SLUGS: string[] = [];

// Module-level shared store so every ProductCard instance (a product can
// appear in multiple sections on the same page) stays in sync — a plain
// per-component useState would let two cards for the same product show
// different heart states until the page reloads. useSyncExternalStore (not
// a hand-rolled useState+useEffect subscription) is what safely lets many
// components read/write this store without React "updated a component
// before it mounted" tearing warnings.
let slugs: string[] = EMPTY_SLUGS;
let drawerOpen = false;
let hydrated = false;
const listeners = new Set<() => void>();

function readFromStorage() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) slugs = JSON.parse(raw);
  } catch {
    // ignore corrupt local storage
  }
  hydrated = true;
}

function notify() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSlugsSnapshot() {
  // This value doesn't exist during SSR, so it can only be read on the
  // client — lazily hydrate on first read rather than in an effect.
  if (!hydrated) readFromStorage();
  return slugs;
}

function getServerSlugsSnapshot() {
  return EMPTY_SLUGS;
}

function getDrawerSnapshot() {
  return drawerOpen;
}

function getServerDrawerSnapshot() {
  return false;
}

export function useWishlist() {
  const slugs = useSyncExternalStore(subscribe, getSlugsSnapshot, getServerSlugsSnapshot);
  const isDrawerOpen = useSyncExternalStore(subscribe, getDrawerSnapshot, getServerDrawerSnapshot);

  const toggle = useCallback((slug: string) => {
    const adding = !slugs.includes(slug);
    const nextSlugs = adding ? [...slugs, slug] : slugs.filter((s) => s !== slug);
    setSlugs(nextSlugs);
    // Surface the drawer when a toy is added, the same way the cart does —
    // but not on removal, so clearing items doesn't reopen it.
    if (adding) drawerOpen = true;
    notify();
  }, [slugs]);

  const isWishlisted = useCallback((slug: string) => slugs.includes(slug), [slugs]);
  const openDrawer = useCallback(() => {
    drawerOpen = true;
    notify();
  }, []);
  const closeDrawer = useCallback(() => {
    drawerOpen = false;
    notify();
  }, []);

  return { slugs, toggle, isWishlisted, isDrawerOpen, openDrawer, closeDrawer };
}

function setSlugs(next: string[]) {
  slugs = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs));
  } catch {
    // ignore write failures (e.g. private browsing storage limits)
  }
}
