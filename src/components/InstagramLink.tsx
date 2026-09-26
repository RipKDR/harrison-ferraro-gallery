'use client';
import type { ReactNode } from 'react';
import { trackEvent } from '../lib/analytics';
import { INSTAGRAM_URL } from '../lib/site';

export function InstagramLink({ children, className, placement }: { children: ReactNode; className?: string; placement: 'home' | 'footer' | 'about' | 'enquiry' }) {
  return <a className={className} href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer me" onClick={() => trackEvent('instagram_click', { placement })}>{children}</a>;
}
