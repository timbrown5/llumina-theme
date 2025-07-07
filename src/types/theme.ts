/**
 * Type definitions for theme configuration and customization.
 *
 * ## Key Types
 * - ThemeParams: All adjustable theme parameters
 * - ColorAdjustment: Individual color fine-tuning data
 * - ThemeDefinition: Complete theme file structure
 */

import type { AccentColorKey } from './base24.ts';

export type ThemeKey = 'midnight' | 'twilight' | 'dawn' | 'noon';
export type FlavorKey = 'muted' | 'balanced' | 'bold';

export interface BaseTheme {
  name: string;
  tagline: string;
  inspirations: string;
  bgHue: number;
  bgSat: number;
  bgLight: number;
}

export interface ColorAdjustment {
  hueOffset: number;
}

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
  colorAdjustments?: {
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

export interface FlavorData {
  accentHue: number;
  accentSat: number;
  accentLight: number;
  commentLight: number;
}

export interface AccentOffsetDefinition {
  hue: number;
  saturation?: number;
  lightness?: number;
}

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
