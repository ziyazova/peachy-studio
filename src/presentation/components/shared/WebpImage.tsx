import type { ImgHTMLAttributes } from 'react';

/**
 * A plain <img> that prefers the WebP twin of a /public PNG.
 *
 * Every .png under /public has a .webp sibling generated at q85; the
 * screenshots that make up the product shots drop 87–95% in that format
 * (1.3MB -> 0.17MB) with no visible difference at display size. Browsers
 * that cannot decode WebP get the PNG through the normal <img src>, so a
 * missing or stale .webp degrades to exactly the previous behaviour.
 *
 * <picture> carries display: contents, keeping it invisible to layout —
 * the <img> stays the element parent rules and descendant selectors match.
 *
 * Use for standalone images. Inside <TemplateMockupCard>, reach for
 * <TemplateMockupImage>, which already does this and adds the card's
 * sizing and hover-zoom behaviour.
 */
export const WebpImage = ({ src, ...rest }: ImgHTMLAttributes<HTMLImageElement>) => {
  const webp =
    typeof src === 'string' && src.endsWith('.png')
      ? src.replace(/\.png$/, '.webp')
      : null;

  return (
    <picture style={{ display: 'contents' }}>
      {webp && <source srcSet={webp} type="image/webp" />}
      <img src={src} {...rest} />
    </picture>
  );
};
