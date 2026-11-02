/**
 * Utility to strip and clean HTML tags and entities from product descriptions.
 * Handles <p>, <br>, <div>, <span>, HTML entities, and formatting.
 */
export function cleanDescription(raw?: string): string {
  if (!raw) return '';
  let text = String(raw);

  // Unescape HTML entities first in case tags were encoded
  text = text
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&amp;/gi, '&');

  // Replace block tags with paragraph / line breaks
  text = text
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<p[^>]*>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<div[^>]*>/gi, '')
    .replace(/<\/li>/gi, '\n')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<[^>]*>?/gm, '') // Strip all remaining tags (e.g. <span>, <strong>, <b>, <i>, <a>)
    .replace(/&nbsp;/gi, ' ')
    .replace(/&[a-zA-Z0-9#]+;/g, ' ') // Strip other unknown html entities safely
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return text;
}
