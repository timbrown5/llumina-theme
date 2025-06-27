import chroma from 'chroma-js';
import type { ThemeParams, Base24Colors } from '../types/index.ts';

// Simple wrapper for chroma with our preferred format
export const okhslToRgb = (h: number, s: number, l: number): string => {
  return chroma.hsl(h, s / 100, l / 100).hex();
};

export const createGradientBg = (colors: string[]): string =>
  `linear-gradient(90deg, ${colors.join(', ')})`;

// Slider helper functions - much simpler with chroma
export const generateHueGradient = (steps: number = 25): string[] => {
  return Array.from({ length: steps }, (_, i) => {
    const hue = (360 * i) / (steps - 1);
    return chroma.hsl(hue, 0.8, 0.6).hex();
  });
};

export const generateAccentHueGradient = (
  baseHue: number,
  minAdjustment: number,
  maxAdjustment: number,
  steps: number = 25
): string[] => {
  return Array.from({ length: steps }, (_, i) => {
    const adjustment = minAdjustment + ((maxAdjustment - minAdjustment) * i) / (steps - 1);
    const finalHue = (baseHue + adjustment + 360) % 360;
    return chroma.hsl(finalHue, 0.8, 0.6).hex();
  });
};

export const generateSaturationGradient = (hue: number): string[] => [
  chroma.hsl(hue, 0, 0.5).hex(), // Gray (0% saturation)
  chroma.hsl(hue, 1.0, 0.5).hex(), // Full saturation
];

export const generateLightnessGradient = (hue: number, saturation: number): string[] => [
  chroma.hsl(hue, saturation / 100, 0).hex(), // Black
  chroma.hsl(hue, saturation / 100, 0.5).hex(), // Mid
  chroma.hsl(hue, saturation / 100, 1).hex(), // White
];

// Simplified color generation using chroma's built-in color space handling
export const generateColors = (params: ThemeParams): Base24Colors => {
  const isLight = params.bgLight > 50;

  // Background colors
  const bgBase = chroma.hsl(params.bgHue, params.bgSat / 100, params.bgLight / 100);
  const base00 = bgBase.hex();
  const base01 = bgBase
    .brighten(isLight ? -0.3 : 0.4)
    .saturate(0.2)
    .hex();
  const base02 = bgBase
    .brighten(isLight ? -0.8 : 1.0)
    .saturate(0.5)
    .hex();

  // Comments - use complementary hue for better contrast
  const commentHue = (params.bgHue + (isLight ? 180 : 0)) % 360;
  const base03 = chroma.hsl(commentHue, 0.15, params.commentLight / 100).hex();

  // Foreground colors
  const fgBase = isLight ? 0.15 : 0.9;
  const base04 = chroma.hsl(params.bgHue, 0.2, isLight ? 0.45 : 0.65).hex();
  const base05 = chroma.hsl(params.bgHue, 0.15, fgBase).hex();
  const base06 = chroma.hsl(params.bgHue, 0.12, fgBase + (isLight ? -0.05 : 0.03)).hex();
  const base07 = chroma.hsl(params.bgHue, 0.1, fgBase + (isLight ? -0.1 : 0.06)).hex();

  // Accent colors - distributed around color wheel
  const accentHues = [0, 30, 60, 120, 165, 210, 270, 330].map(
    (offset) => (params.accentHue + offset + 360) % 360
  );

  const accentSat = params.accentSat / 100;
  const accentLight = params.accentLight / 100;
  const mutedSat = Math.max(0.05, accentSat - 0.25);
  const mutedLight = Math.min(0.95, accentLight + 0.1);

  // Generate accent and muted colors
  const accents = accentHues.map((hue) => chroma.hsl(hue, accentSat, accentLight).hex());
  const muted = accentHues.map((hue) => chroma.hsl(hue, mutedSat, mutedLight).hex());

  return {
    base00,
    base01,
    base02,
    base03,
    base04,
    base05,
    base06,
    base07,
    base08: accents[0],
    base09: accents[1],
    base0A: accents[2],
    base0B: accents[3],
    base0C: accents[4],
    base0D: accents[5],
    base0E: accents[6],
    base0F: accents[7],
    base10: muted[0],
    base11: muted[1],
    base12: muted[2],
    base13: muted[3],
    base14: muted[4],
    base15: muted[5],
    base16: muted[6],
    base17: muted[7],
  };
};
