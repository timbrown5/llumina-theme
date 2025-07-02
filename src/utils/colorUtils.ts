import { convert, OKHSL, sRGB } from '@texel/color';
import type { ThemeParams, Base24Colors } from '../types/index.ts';
import { BASE_HUES, LIGHT_THEME_THRESHOLD } from '../constants/index.ts';

export const okhslToRgb = (h: number, s: number, l: number): string => {
  // Clamp values to prevent gamut overflow
  const clampedS = Math.max(0, Math.min(100, s));
  const clampedL = Math.max(0, Math.min(100, l));

  // Very light touch for yellow/green gamut issues - only at extreme values
  let adjustedS = clampedS;

  const normalizedHue = ((h % 360) + 360) % 360;
  const isYellowish = normalizedHue >= 85 && normalizedHue <= 115;
  const isGreenish = normalizedHue >= 130 && normalizedHue <= 160;

  // Only adjust at very high lightness to prevent complete gamut overflow
  if ((isYellowish || isGreenish) && clampedL > 90 && clampedS > 80) {
    adjustedS = clampedS * 0.9; // Very gentle reduction
  }

  const [r, g, b] = convert([normalizedHue, adjustedS / 100, clampedL / 100], OKHSL, sRGB);
  const toHex = (n: number) =>
    Math.round(Math.max(0, Math.min(255, n * 255)))
      .toString(16)
      .padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

export const createGradientBg = (colors: string[]): string =>
  `linear-gradient(90deg, ${colors.join(', ')})`;

export const generateHueGradient = (steps: number = 25): string[] => {
  return Array.from({ length: steps }, (_, i) => {
    const hue = (360 * i) / (steps - 1);
    return okhslToRgb(hue, 80, 60);
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
    // Show the red color (base color for accents) with the adjustment
    const redHue = 29; // Red in OKHSL space
    const finalHue = (redHue + adjustment + 360) % 360;
    return okhslToRgb(finalHue, 80, 60);
  });
};

export const generateSaturationGradient = (hue: number): string[] => [
  okhslToRgb(hue, 0, 50),
  okhslToRgb(hue, 100, 50),
];

export const generateLightnessGradient = (hue: number, saturation: number): string[] => [
  okhslToRgb(hue, saturation, 0),
  okhslToRgb(hue, saturation, 50),
  okhslToRgb(hue, saturation, 100),
];

export const generateColors = (params: ThemeParams): Base24Colors => {
  const isLight = params.bgLight > LIGHT_THEME_THRESHOLD;

  // Background colors - simple and clean
  const base00 = okhslToRgb(params.bgHue, params.bgSat, params.bgLight);
  const base01 = okhslToRgb(params.bgHue, params.bgSat, params.bgLight + (isLight ? -3 : 3));
  const base02 = okhslToRgb(params.bgHue, params.bgSat + 10, params.bgLight + (isLight ? -6 : 6));

  // Comments - opposite hue, desaturated
  const commentHue = (params.bgHue + 180) % 360;
  const base03 = okhslToRgb(commentHue, 20, params.commentLight);

  // Foreground colors - simple progression
  const fgLight = isLight ? 20 : 80;
  const base04 = okhslToRgb(params.bgHue, 15, fgLight - 10);
  const base05 = okhslToRgb(params.bgHue, 10, fgLight); // Main foreground
  const base06 = okhslToRgb(params.bgHue, 5, fgLight + 10);
  const base07 = okhslToRgb(params.bgHue, 0, fgLight + 20);

  // Accent colors - when accentHue = 0, use the base hues directly
  const accentHues = [
    (BASE_HUES.red + params.accentHue + 360) % 360,
    (BASE_HUES.orange + params.accentHue + 360) % 360,
    (BASE_HUES.yellow + params.accentHue + 360) % 360,
    (BASE_HUES.green + params.accentHue + 360) % 360,
    (BASE_HUES.cyan + params.accentHue + 360) % 360,
    (BASE_HUES.blue + params.accentHue + 360) % 360,
    (BASE_HUES.purple + params.accentHue + 360) % 360,
    (BASE_HUES.pink + params.accentHue + 360) % 360,
  ];

  // Generate accent colors using user parameters directly
  const accents = accentHues.map((hue) => okhslToRgb(hue, params.accentSat, params.accentLight));

  // Muted colors - same hues, reduced saturation, gentle overflow protection
  const muted = accentHues.map((hue) => {
    const mutedSat = params.accentSat * 0.6;
    let mutedLight = params.accentLight + 10;

    // Only prevent extreme overflow - keep colors bright
    if (mutedLight > 95) {
      mutedLight = 95; // Very gentle cap
    }

    return okhslToRgb(hue, mutedSat, mutedLight);
  });

  return {
    base00,
    base01,
    base02,
    base03,
    base04,
    base05,
    base06,
    base07,
    base08: accents[0], // Red
    base09: accents[1], // Orange
    base0A: accents[2], // Yellow
    base0B: accents[3], // Green
    base0C: accents[4], // Cyan
    base0D: accents[5], // Blue
    base0E: accents[6], // Purple
    base0F: accents[7], // Pink
    base10: muted[0], // Muted Red
    base11: muted[1], // Muted Orange
    base12: muted[2], // Muted Yellow
    base13: muted[3], // Muted Green
    base14: muted[4], // Muted Cyan
    base15: muted[5], // Muted Blue
    base16: muted[6], // Muted Purple
    base17: muted[7], // Muted Pink
  };
};
