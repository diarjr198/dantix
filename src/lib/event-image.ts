function escapeXml(value: string) {
  return value.replace(
    /[&<>'"]/g,
    (char) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&apos;',
        '"': '&quot;',
      })[char] ?? char,
  );
}

export function generatedEventImage(title: string) {
  const text = escapeXml((title.trim() || 'Event TipTip').slice(0, 60));
  const hue =
    [...text].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 360;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="hsl(${hue} 75% 42%)"/><stop offset="1" stop-color="hsl(${(hue + 55) % 360} 78% 58%)"/></linearGradient></defs><rect width="1200" height="675" fill="url(#g)"/><circle cx="1030" cy="100" r="240" fill="white" opacity=".12"/><circle cx="120" cy="650" r="310" fill="black" opacity=".1"/><text x="80" y="105" fill="white" font-family="Arial,sans-serif" font-size="34" font-weight="700">TipTip Event</text><foreignObject x="80" y="210" width="1040" height="300"><div xmlns="http://www.w3.org/1999/xhtml" style="color:white;font:900 72px/1.15 Arial,sans-serif;display:flex;align-items:center;height:100%;">${text}</div></foreignObject></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function resolveEventImage(title: string, value?: string) {
  const image = value?.trim();
  if (!image) return generatedEventImage(title);
  if (/^\/uploads\/events\/[a-f0-9-]+\.(jpg|png|webp)$/i.test(image))
    return image;
  const url = new URL(image);
  if (url.protocol !== 'https:' || url.username || url.password)
    throw new Error('INVALID_IMAGE_URL');
  const hostname = url.hostname.toLowerCase();
  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '::1' ||
    hostname.endsWith('.local')
  )
    throw new Error('INVALID_IMAGE_URL');
  return url.toString();
}
