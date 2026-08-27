/**
 * Restaurant-wide currency setting. Single-restaurant MVP: one currency for
 * the whole menu, not per-dish. Change this one value to switch currencies.
 */
export const RESTAURANT_CURRENCY = 'UAH';
export const RESTAURANT_LOCALE = 'uk-UA';

/**
 * All money amounts in the system (Dish.basicPrice, Order.totalPrice, etc.)
 * are stored as integers in minor units (e.g. kopiykas) to avoid floating
 * point rounding errors. This converts a minor-unit amount into a
 * human-readable, currency-formatted string for display.
 */
export function formatMoney(minorUnits: number): string {
  return new Intl.NumberFormat(RESTAURANT_LOCALE, {
    style: 'currency',
    currency: RESTAURANT_CURRENCY,
  }).format(minorUnits / 100);
}
