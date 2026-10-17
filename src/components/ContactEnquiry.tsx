'use client';
import { useSearchParams } from 'next/navigation';
import { artworkBySlug } from '../artworks';
import { EnquiryForm } from './EnquiryForm';

export function ContactEnquiry({ emailEnabled }: { emailEnabled: boolean }) {
  const query = useSearchParams();
  const work = artworkBySlug(query.get('artwork') ?? '');
  const interest = work ? query.get('kind') === 'print' ? 'Signed print' : 'Original artwork' : 'General enquiry';
  return <EnquiryForm key={`${work?.slug ?? 'general'}-${interest}`} artworkId={work?.slug} interest={interest} emailEnabled={emailEnabled} />;
}
