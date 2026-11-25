/** Only known internal destinations are accepted after authentication. */
export function safeDestination(value: string | null): string {
  if (!value || /[\\\s\x00-\x1f\x7f%]/.test(value)) return '/dashboard';
  if (value === '/auth/reset-password') return value;
  if (!/^\/dashboard(?:\/[^?#]*)?(?:\?[^#]*)?(?:#.*)?$/.test(value)) return '/dashboard';
  const url = new URL(value, 'https://payscale.invalid');
  return url.origin === 'https://payscale.invalid' && (url.pathname === '/dashboard' || url.pathname.startsWith('/dashboard/')) ? value : '/dashboard';
}
