export const CALENDLY_BOOKING_URL =
  process.env.NEXT_PUBLIC_CALENDLY_BOOKING_URL || 'https://calendly.com/topgrogue/30min';

export function getCalendlyBookingUrl() {
  const rawUrl = CALENDLY_BOOKING_URL.trim();
  if (!rawUrl || rawUrl.includes('YOUR_CALENDLY_BOOKING_URL')) return null;

  const normalizedUrl = rawUrl.startsWith('http://') || rawUrl.startsWith('https://')
    ? rawUrl
    : `https://${rawUrl}`;

  try {
    const url = new URL(normalizedUrl);
    return url.protocol === 'https:' && url.hostname === 'calendly.com' ? url.toString() : null;
  } catch {
    return null;
  }
}
