/**
 * Type definitions for theme configuration and customization.
 *
 * ## Key Types
 * - ThemeParams: All adjustable theme parameters
 * - ColorAdjustment: Individual color fine-tuning data
 * - ThemeDefinition: Complete theme file structure
 */

/**
 * Available base theme identifiers in the Lumina system.
 */
export type ThemeKey = 'midnight' | 'twilight' | 'dawn' | 'noon';

/**
 * Available flavor intensity variants for each theme.
 */
export type FlavorKey = 'muted' | 'balanced' | 'bold';

/**
 * Core theme metadata and background color parameters.
 */
export interface BaseTheme {
  name: string;
  tagline: string;
  inspirations: string;
  bgHue: number;
  bgSat: number;
  bgLight: number;
}

/**
 * Individual color fine-tuning adjustment data.
 */
export interface ColorAdjustment {
  hueOffset: number;
}

/**
 * Complete set of adjustable theme parameters.
 * Includes all slider values and individual color adjustments.
 */
export interface ThemeParams {
  bgHue: number;
  bgSat: number;
  bgLight: number;
  accentHue: number;
  accentSat: number;
  accentLight: number;
  commentLight: number;
  redOffset?: number;
  orangeOffset?: number;
  yellowOffset?: number;
  greenOffset?: number;
  cyanOffset?: number;
  blueOffset?: number;
  purpleOffset?: number;
  pinkOffset?: number;
  accentOffsets?: {
    base08?: ColorAdjustment;
    base09?: ColorAdjustment;
    base0A?: ColorAdjustment;
    base0B?: ColorAdjustment;
    base0C?: ColorAdjustment;
    base0D?: ColorAdjustment;
    base0E?: ColorAdjustment;
    base0F?: ColorAdjustment;
  };
}

/**
 * Flavor-specific color intensity and contrast settings.
 */
export interface FlavorData {
  accentHue: number;
  accentSat: number;
  accentLight: number;
  commentLight: number;
}

/**
 * Theme-specific color offset definition for accent colors.
 */
export interface AccentOffsetDefinition {
  hue: number;
  saturation?: number;
  lightness?: number;
}

/**
 * Complete theme definition file structure for theme installation.
 */
export interface ThemeDefinition {
  name: string;
  tagline: string;
  inspirations: string;
  bgHue: number;
  bgSat: number;
  bgLight: number;
  accentOffsets: {
    red: AccentOffsetDefinition;
    orange: AccentOffsetDefinition;
    yellow: AccentOffsetDefinition;
    green: AccentOffsetDefinition;
    cyan: AccentOffsetDefinition;
    blue: AccentOffsetDefinition;
    purple: AccentOffsetDefinition;
    pink: AccentOffsetDefinition;
  };
  flavors: Record<FlavorKey, FlavorData>;
}

export interface UserThemeCustomizations {
  [flavorKey: string]: Partial<FlavorData>;
}
