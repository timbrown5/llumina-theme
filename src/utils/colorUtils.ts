import { convert, OKHSL, sRGB } from '@texel/color';
import type { ThemeParams, Base24Colors } from '../types/index.ts';

export const okhslToRgb = (h: number, s: number, l: number): string => {
  const [r, g, b] = convert([h, s / 100, l / 100], OKHSL, sRGB);
  const toHex = (n: number) =>
    Math.round(n * 255)
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
    const finalHue = (baseHue + adjustment + 360) % 360;
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
  const isLight = params.bgLight > 50;

  // Background colors
  const base00 = okhslToRgb(params.bgHue, params.bgSat, params.bgLight);
  const base01 = okhslToRgb(
    params.bgHue,
    Math.min(100, params.bgSat * 1.2),
    Math.max(0, Math.min(100, params.bgLight + (isLight ? -4 : 4)))
  );
  const base02 = okhslToRgb(
    params.bgHue,
    Math.min(100, params.bgSat * 1.5),
    Math.max(0, Math.min(100, params.bgLight + (isLight ? -8 : 8)))
  );

  // Comments
  const commentHue = (params.bgHue + (isLight ? 180 : 0)) % 360;
  const base03 = okhslToRgb(commentHue, 15, params.commentLight);

  // Foreground colors
  const fgLight = isLight ? 15 : 85;
  const base04 = okhslToRgb(params.bgHue, 20, Math.max(0, Math.min(100, fgLight + 15)));
  const base05 = okhslToRgb(params.bgHue, 15, fgLight);
  const base06 = okhslToRgb(params.bgHue, 12, Math.max(0, Math.min(100, fgLight - 5)));
  const base07 = okhslToRgb(params.bgHue, 10, Math.max(0, Math.min(100, fgLight - 10)));

  // Accent colors - evenly distributed
  const accentHues = [0, 30, 60, 120, 165, 210, 270, 330].map((offset) => {
    let hue = params.accentHue + offset;
    while (hue < 0) hue += 360;
    while (hue >= 360) hue -= 360;
    return hue;
  });

  const accents = accentHues.map((hue) => {
    return okhslToRgb(hue, params.accentSat, params.accentLight);
  });

  // Muted colors
  const mutedSat = Math.max(10, params.accentSat * 0.6);
  const mutedLight = Math.min(90, params.accentLight + 10);

  const muted = accentHues.map((hue) => {
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
