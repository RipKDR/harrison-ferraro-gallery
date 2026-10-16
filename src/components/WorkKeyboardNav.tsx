'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** ← / → move between work pages, unless the visitor is typing. */
export function WorkKeyboardNav({ previous, next }: { previous: string; next: string }) {
  const router = useRouter();
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      const target = event.target as HTMLElement;
      if (target.closest('input, textarea, select, [contenteditable]')) return;
      router.push(event.key === 'ArrowLeft' ? previous : next);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [router, previous, next]);
  return null;
}
