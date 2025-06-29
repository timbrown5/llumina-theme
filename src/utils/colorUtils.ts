import chroma from 'chroma-js';
import type { ThemeParams, Base24Colors } from '../types/index.ts';

export const okhslToRgb = (h: number, s: number, l: number): string => {
  return chroma.hsl(h, s / 100, l / 100).hex();
};

export const createGradientBg = (colors: string[]): string =>
  `linear-gradient(90deg, ${colors.join(', ')})`;

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
  chroma.hsl(hue, 0, 0.5).hex(),
  chroma.hsl(hue, 1.0, 0.5).hex(),
];

export const generateLightnessGradient = (hue: number, saturation: number): string[] => [
  chroma.hsl(hue, saturation / 100, 0).hex(),
  chroma.hsl(hue, saturation / 100, 0.5).hex(),
  chroma.hsl(hue, saturation / 100, 1).hex(),
];

export const generateColors = (params: ThemeParams): Base24Colors => {
  const isLight = params.bgLight > 50;

  try {
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

    // Comments use complementary hue for better contrast
    const commentHue = (params.bgHue + (isLight ? 180 : 0)) % 360;
    const base03 = chroma.hsl(commentHue, 0.15, params.commentLight / 100).hex();

    const fgBase = isLight ? 0.15 : 0.9;
    const base04 = chroma.hsl(params.bgHue, 0.2, isLight ? 0.45 : 0.65).hex();
    const base05 = chroma.hsl(params.bgHue, 0.15, fgBase).hex();
    const base06 = chroma.hsl(params.bgHue, 0.12, fgBase + (isLight ? -0.05 : 0.03)).hex();
    const base07 = chroma.hsl(params.bgHue, 0.1, fgBase + (isLight ? -0.1 : 0.06)).hex();

    // Accent colors distributed around color wheel - handle negative hues properly
    const accentHues = [0, 30, 60, 120, 165, 210, 270, 330].map((offset) => {
      let hue = params.accentHue + offset;
      while (hue < 0) hue += 360;
      while (hue >= 360) hue -= 360;
      return hue;
    });

    const accentSat = params.accentSat / 100;
    const accentLight = params.accentLight / 100;
    const mutedSat = Math.max(0.05, accentSat - 0.25);
    const mutedLight = Math.min(0.95, accentLight + 0.1);

    // Perceptual adjustments for OKHSL brightness issues with safe bounds
    // OKHSL aims for perceptual uniformity but still has issues with certain hues
    // appearing brighter/duller than others at the same technical lightness value
    const getAdjustedLightness = (hue: number, baseLightness: number) => {
      const normalizedHue = hue % 360;
      let adjustedLight = baseLightness;

      // Apply adjustments based on problematic hue ranges
      if (normalizedHue >= 90 && normalizedHue <= 150) {
        // Green range - reduce brightness significantly (human eyes very sensitive to green)
        adjustedLight = baseLightness * 0.85;
      } else if (normalizedHue >= 45 && normalizedHue <= 75) {
        // Yellow range - reduce brightness moderately (yellow appears harsh at same lightness)
        adjustedLight = baseLightness * 0.9;
      } else if (normalizedHue >= 165 && normalizedHue <= 195) {
        // Cyan range - reduce brightness slightly (cyan can appear overly vibrant)
        adjustedLight = baseLightness * 0.95;
      } else if (normalizedHue >= 15 && normalizedHue <= 45) {
        // Orange range - boost slightly as it tends to be dull (compensate for perceived dimness)
        adjustedLight = baseLightness * 1.05;
      }

      // Ensure result stays within valid bounds (0.05 to 0.95)
      return Math.max(0.05, Math.min(0.95, adjustedLight));
    };

    const accents = accentHues.map((hue) => {
      const adjustedLight = getAdjustedLightness(hue, accentLight);
      return chroma.hsl(hue, accentSat, adjustedLight).hex();
    });

    const muted = accentHues.map((hue) => {
      const adjustedLight = getAdjustedLightness(hue, mutedLight);
      return chroma.hsl(hue, mutedSat, adjustedLight).hex();
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
  } catch (error) {
    console.error('Color generation error:', error);
    // Return a safe fallback theme
    return {
      base00: '#ffffff',
      base01: '#f0f0f0',
      base02: '#e0e0e0',
      base03: '#999999',
      base04: '#666666',
      base05: '#333333',
      base06: '#222222',
      base07: '#111111',
      base08: '#ff0000',
      base09: '#ff8800',
      base0A: '#ffff00',
      base0B: '#00ff00',
      base0C: '#00ffff',
      base0D: '#0088ff',
      base0E: '#8800ff',
      base0F: '#ff00ff',
      base10: '#ff8888',
      base11: '#ffaa88',
      base12: '#ffff88',
      base13: '#88ff88',
      base14: '#88ffff',
      base15: '#88aaff',
      base16: '#aa88ff',
      base17: '#ff88ff',
    };
  }
};
