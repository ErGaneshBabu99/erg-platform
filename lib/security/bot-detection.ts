/**
 * Bot detection helper for counter endpoints and crawler management.
 * Identifies known search crawlers, social share bots, and automated scrapers
 * so analytics and counters are not artificially inflated.
 */
const BOT_REGEX =
  /googlebot|bingbot|yandex|baiduspider|duckduckbot|slurp|facebookexternalhit|twitterbot|rogerbot|linkedinbot|embedly|quora link preview|showyoubot|outbrain|pinterest|slackbot|vkShare|W3C_Validator|whatsapp|crawler|spider|bot|ahrefs|semrush|dotbot/i;

export function isBot(userAgent?: string | null): boolean {
  if (!userAgent) return false;
  return BOT_REGEX.test(userAgent);
}
