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

const normalizeHue = (hue: number): number => ((hue % 360) + 360) % 360;

const createAccentHues = (baseHue: number): number[] => {
  const base = normalizeHue(baseHue);

  return [
    normalizeHue(base), // red
    normalizeHue(base + 30), // orange
    normalizeHue(base + 60), // yelow
    normalizeHue(base + 150), // green
    normalizeHue(base + 180), // teal/cyan
    normalizeHue(base + 210), // blue
    normalizeHue(base + 300), // purple
    normalizeHue(base + 330), // brown?
  ];
};

export const generateColors = (params: ThemeParams): Base24Colors => {
  const isLight = params.bgLight > 50;
  const [bgLightDecimal, bgSatDecimal, accentSatDecimal, accentLightDecimal, commentLightDecimal] =
    [params.bgLight, params.bgSat, params.accentSat, params.accentLight, params.commentLight].map(
      (v) => v / 100
    );

  const bgBase = bgLightDecimal;
  const bgStep = isLight ? -0.05 : 0.08;
  const selectionStep = isLight ? -0.15 : 0.2;

  const fgBase = isLight ? 0.15 : 0.9;
  const fgStep = isLight ? -0.05 : 0.03;

  const accentHues = createAccentHues(params.accentHue);

  const commentHue = normalizeHue(params.bgHue + (isLight ? 180 : 0));
  const commentSat = isLight ? 0.25 : 0.15;

  // Calculate muted colors by applying systematic rule to accent colors
  // Muted = Accent colors with -25% saturation, +10% lightness (or whatever offset you prefer)
  const mutedSatDecimal = Math.max(0.05, accentSatDecimal - 0.25); // -25% saturation from accent
  const mutedLightDecimal = Math.min(0.95, accentLightDecimal + 0.1); // +10% lighter than accent

  const colorMap: Record<keyof Base24Colors, [number, number, number]> = {
    base00: [params.bgHue, bgSatDecimal, bgBase],
    base01: [params.bgHue, bgSatDecimal * 1.2, bgBase + bgStep],
    base02: [params.bgHue, bgSatDecimal * 1.5, bgBase + selectionStep],
    base03: [commentHue, commentSat, commentLightDecimal],
    base04: [params.bgHue, 0.2, isLight ? 0.45 : 0.65],
    base05: [params.bgHue, 0.15, fgBase],
    base06: [params.bgHue, 0.12, fgBase + fgStep],
    base07: [params.bgHue, 0.1, fgBase + fgStep * 2],
    base08: [accentHues[0], accentSatDecimal, accentLightDecimal],
    base09: [accentHues[1], accentSatDecimal, accentLightDecimal],
    base0A: [accentHues[2], accentSatDecimal, accentLightDecimal],
    base0B: [accentHues[3], accentSatDecimal, accentLightDecimal],
    base0C: [accentHues[4], accentSatDecimal, accentLightDecimal],
    base0D: [accentHues[5], accentSatDecimal, accentLightDecimal],
    base0E: [accentHues[6], accentSatDecimal, accentLightDecimal],
    base0F: [accentHues[7], accentSatDecimal, accentLightDecimal],
    base10: [accentHues[0], mutedSatDecimal, mutedLightDecimal],
    base11: [accentHues[1], mutedSatDecimal, mutedLightDecimal],
    base12: [accentHues[2], mutedSatDecimal, mutedLightDecimal],
    base13: [accentHues[3], mutedSatDecimal, mutedLightDecimal],
    base14: [accentHues[4], mutedSatDecimal, mutedLightDecimal],
    base15: [accentHues[5], mutedSatDecimal, mutedLightDecimal],
    base16: [accentHues[6], mutedSatDecimal, mutedLightDecimal],
    base17: [accentHues[7], mutedSatDecimal, mutedLightDecimal],
  };

  const result: Base24Colors = {} as Base24Colors;

  (Object.keys(colorMap) as Array<keyof Base24Colors>).forEach((key) => {
    const [h, s, l] = colorMap[key];
    result[key] = okhslToRgb(h, s, l);
  });

  return result;
};
