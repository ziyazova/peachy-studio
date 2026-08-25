/**
 * Feature flags. Flip values here, nowhere else.
 *
 * When a flag is disabled for launch (e.g. local checkout until Polar one-time
 * is built), the code paths it gates stay in the tree — they're just not
 * rendered. See docs/SUBSCRIPTION-LAUNCH-PLAN.md §10.2 / D12 for the reasoning.
 */

export const FEATURES = {
  /**
   * Local "Add to Cart" → /checkout path for one-time template purchases.
   *
   * OFF for launch: checkout has no payment processor wired. Templates are
   * sold via Etsy redirect only (see `template.etsyUrl`).
   *
   * Flip to true once path A from the launch plan ships:
   * Polar one-time products + purchases table + download-delivery Edge Function.
   * At that point we restore cart/checkout and render BOTH buttons on every
   * template (Path D — buyer picks Peachy or Etsy).
   */
  ENABLE_LOCAL_CHECKOUT: false,

  /**
   * Placeholder duplication of a template's cover image into 3 carousel
   * slides, so the carousel UX reads as a carousel before real photos exist.
   *
   * OFF while templates still ship a single cover: three identical slides
   * made the chevrons and the "3 photos" counter look broken to a visitor.
   * With this off the gallery returns one slide and every control hides
   * itself through the existing `gallery.length > 1` guards — nothing is
   * removed from the tree.
   *
   * Flip back to true (or simply populate `template.images`, which takes
   * precedence and skips this path entirely) once real gallery shots land.
   */
  DUPLICATE_SINGLE_IMAGE_SLIDES: false,

  /**
   * Polar-hosted "Buy Now · $X" checkout on template pages.
   *
   * OFF while every template is fulfilled through Etsy. This button is
   * gated by `etsyId` (parsed from `template.etsyUrl`), NOT by
   * ENABLE_LOCAL_CHECKOUT — that flag only governs the local cart — so
   * filling in etsyUrl had the side effect of showing a second, Polar
   * checkout next to "Buy on Etsy". One product, two prices, two
   * fulfilment paths.
   *
   * Flip to true once Polar one-time products are live and their prices
   * are the source of truth.
   */
  ENABLE_POLAR_CHECKOUT: false,
} as const;
