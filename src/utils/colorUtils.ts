import type { ThemeParams, Base24Colors } from '../types/index.ts';

export const okhslToRgb = (h: number, s: number, l: number): string => {
  h = h / 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h * 6) % 2) - 1));
  const m = l - c / 2;

  let r: number, g: number, b: number;
  if (h < 1 / 6) {
    r = c;
    g = x;
    b = 0;
  } else if (h < 2 / 6) {
    r = x;
    g = c;
    b = 0;
  } else if (h < 3 / 6) {
    r = 0;
    g = c;
    b = x;
  } else if (h < 4 / 6) {
    r = 0;
    g = x;
    b = c;
  } else if (h < 5 / 6) {
    r = x;
    g = 0;
    b = c;
  } else {
    r = c;
    g = 0;
    b = x;
  }

  return `#${[r, g, b]
    .map((v) =>
      Math.round((v + m) * 255)
        .toString(16)
        .padStart(2, '0')
    )
    .join('')}`;
};

export const createGradientBg = (colors: string[]): string =>
  `linear-gradient(90deg, ${colors.join(', ')})`;

export const generateColors = (params: ThemeParams): Base24Colors => {
  const isLight = params.bgLight > 50;
  const [bgLightDecimal, bgSatDecimal, accentSatDecimal, accentLightDecimal, commentLightDecimal] =
    [params.bgLight, params.bgSat, params.accentSat, params.accentLight, params.commentLight].map(
      (v) => v / 100
    );

  const mutedSatDecimal = accentSatDecimal * 0.5;
  const mutedLightDecimal = isLight ? accentLightDecimal * 0.8 : accentLightDecimal * 1.1;

  const colorMap: Record<string, [number, number, number]> = {
    base00: [params.bgHue, bgSatDecimal, bgLightDecimal],
    base01: [params.bgHue, bgSatDecimal + 0.08, bgLightDecimal + (isLight ? -0.06 : 0.06)],
    base02: [params.bgHue, bgSatDecimal + 0.16, bgLightDecimal + (isLight ? -0.12 : 0.15)],
    base03: [240, 0.3, commentLightDecimal],
    base04: [240, 0.2, isLight ? 0.55 : 0.65],
    base05: [240, 0.15, isLight ? 0.25 : 0.85],
    base06: [240, 0.12, isLight ? 0.18 : 0.9],
    base07: [240, 0.1, isLight ? 0.12 : 0.95],
  };

  // Generate accent colors
  [355, 25, 50, 115, 185, 220, 275, 5].forEach((hue, i) => {
    const key = `base0${(8 + i).toString(16).toUpperCase()}`;
    colorMap[key] = [hue, accentSatDecimal, accentLightDecimal];
    colorMap[`base1${i.toString(16).toUpperCase()}`] = [hue, mutedSatDecimal, mutedLightDecimal];
  });

  return Object.fromEntries(
    Object.entries(colorMap).map(([key, [h, s, l]]) => [key, okhslToRgb(h, s, l)])
  ) as Base24Colors;
};
