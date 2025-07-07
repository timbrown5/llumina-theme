/**
 * Type definitions for Base24 color specification.
 * Provides complete 24-color scheme interface with type-safe accent color references
 * and standard scheme metadata structure for editor and terminal theming.
 */

export interface Base24Colors {
  base00: string;
  base01: string;
  base02: string;
  base03: string;
  base04: string;
  base05: string;
  base06: string;
  base07: string;
  base08: string;
  base09: string;
  base0A: string;
  base0B: string;
  base0C: string;
  base0D: string;
  base0E: string;
  base0F: string;
  base10: string;
  base11: string;
  base12: string;
  base13: string;
  base14: string;
  base15: string;
  base16: string;
  base17: string;
}

/**
 * Type-safe references to the 8 primary accent colors in Base24.
 * Used for individual color adjustments and theme customization.
 */
export type AccentColorKey =
  | 'base08'
  | 'base09'
  | 'base0A'
  | 'base0B'
  | 'base0C'
  | 'base0D'
  | 'base0E'
  | 'base0F';

/**
 * References to base UI colors (background, foreground, selection).
 */
export type BaseColorKey =
  | 'base00'
  | 'base01'
  | 'base02'
  | 'base03'
  | 'base04'
  | 'base05'
  | 'base06'
  | 'base07';

/**
 * References to muted accent color variations.
 */
export type MutedColorKey =
  | 'base10'
  | 'base11'
  | 'base12'
  | 'base13'
  | 'base14'
  | 'base15'
  | 'base16'
  | 'base17';

/**
 * Union type covering all 24 color keys in the Base24 specification.
 */
export type Base24ColorKey = BaseColorKey | AccentColorKey | MutedColorKey;

/**
 * Standard Base24 scheme metadata structure for export and compatibility.
 */
export interface Base24Scheme {
  name: string;
  scheme: 'base24';
  author: string;
  colors: Base24Colors;
}
