/**
 * Prefix a /public path with the site's base path. Needed when the site is
 * served from a sub-folder (GitHub Pages: /dramebazz-portfolio); empty
 * everywhere else.
 */
export const asset = (path: string): string =>
  `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${path}`;
