import type { ThemeParams, Base24Colors } from '../types/index.ts';

export const hslToRgb = (h: number, s: number, l: number): string => {
  const hNorm = h / 360;
  const sNorm = s / 100;
  const lNorm = l / 100;

  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
  const x = c * (1 - Math.abs(((hNorm * 6) % 2) - 1));
  const m = lNorm - c / 2;

  let r = 0,
    g = 0,
    b = 0;

  if (hNorm >= 0 && hNorm < 1 / 6) {
    r = c;
    g = x;
    b = 0;
  } else if (hNorm >= 1 / 6 && hNorm < 2 / 6) {
    r = x;
    g = c;
    b = 0;
  } else if (hNorm >= 2 / 6 && hNorm < 3 / 6) {
    r = 0;
    g = c;
    b = x;
  } else if (hNorm >= 3 / 6 && hNorm < 4 / 6) {
    r = 0;
    g = x;
    b = c;
  } else if (hNorm >= 4 / 6 && hNorm < 5 / 6) {
    r = x;
    g = 0;
    b = c;
  } else {
    r = c;
    g = 0;
    b = x;
  }

  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);

  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

// Perceptual lightness correction based on human vision sensitivity
const getPerceptualLightnessCorrection = (hue: number, saturation: number): number => {
  // Convert hue to radians for trig functions
  const radians = (hue * Math.PI) / 180;

  // Approximate how bright different hues appear to human eye
  // Based on CIE luminance weights but simplified for HSL
  const perceptualBrightness =
    0.3 * Math.max(0, Math.cos(radians)) + // Red component peak at 0°
    0.59 * Math.max(0, Math.cos(radians - (Math.PI * 2) / 3)) + // Green component peak at 120°
    0.11 * Math.max(0, Math.cos(radians - (Math.PI * 4) / 3)); // Blue component peak at 240°

  // Higher saturation means more correction needed
  const saturationFactor = Math.pow(saturation / 100, 0.8); // Slightly non-linear

  // Calculate correction: positive = needs darkening, negative = needs brightening
  // Scale by saturation - highly saturated colors need more correction
  const correction = (perceptualBrightness - 0.33) * 12 * saturationFactor;

  return correction;
};

// Calculate muted lightness from accent lightness using a perceptual curve
const getMutedLightness = (accentLightness: number): number => {
  const minDifference = 5; // Difference for bright themes (90%+ lightness)
  const maxDifference = 15; // Difference for dark themes (0-10% lightness)
  const maxMutedLightness = 90; // Cap to prevent muted colors becoming white

  // Simple quadratic curve: more aggressive reduction at higher lightness
  const t = accentLightness / 100; // Normalize to 0-1
  const difference = maxDifference - (maxDifference - minDifference) * t * t;

  return Math.min(maxMutedLightness, accentLightness + difference);
};

// Apply perceptual adjustments for specific hues
const getAdjustedSaturation = (
  hue: number,
  baseSaturation: number,
  baseLightness: number
): number => {
  // Normalize hue to 0-360
  const normalizedHue = ((hue % 360) + 360) % 360;

  // Yellow (50-70°) - reduce saturation as it looks too bright
  if (normalizedHue >= 50 && normalizedHue <= 70) {
    return Math.max(10, baseSaturation * 0.75);
  }

  // Cyan (170-190°) - reduce saturation as it's too electric
  if (normalizedHue >= 170 && normalizedHue <= 190) {
    return Math.max(15, baseSaturation * 0.8);
  }

  // Green (100-140°) - reduce saturation as it can look too electric in HSL
  if (normalizedHue >= 100 && normalizedHue <= 140) {
    return Math.max(15, baseSaturation * 0.85);
  }

  // Orange (20-40°) - slight reduction to balance with red
  if (normalizedHue >= 20 && normalizedHue <= 40) {
    return Math.max(10, baseSaturation * 0.9);
  }

  return baseSaturation;
};

const getAdjustedLightness = (hue: number, baseLightness: number, saturation: number): number => {
  const normalizedHue = ((hue % 360) + 360) % 360;

  // Start with perceptual correction
  let adjustment = getPerceptualLightnessCorrection(hue, saturation);

  // Add manual corrections for specific problem hues
  // Yellow (50-70°) - additional darkening beyond perceptual correction
  if (normalizedHue >= 50 && normalizedHue <= 70) {
    // Smoothly scale additional reduction from 1 point at 40% to 4 points at 80%
    const minReduction = 1;
    const maxReduction = 4;
    const minLightness = 40;
    const maxLightness = 80;

    const factor = Math.max(
      0,
      Math.min(1, (baseLightness - minLightness) / (maxLightness - minLightness))
    );
    const additionalReduction = minReduction + (maxReduction - minReduction) * factor;
    adjustment -= additionalReduction;
  }

  // Purple/Violet (260-290°) - make slightly lighter for readability
  if (normalizedHue >= 260 && normalizedHue <= 290) {
    adjustment += 3;
  }

  // Blue (200-250°) - slight lightness boost for better contrast
  if (normalizedHue >= 200 && normalizedHue <= 250) {
    adjustment += 2;
  }

  return Math.max(5, Math.min(95, baseLightness + adjustment));
};

// Enhanced HSL conversion with perceptual adjustments
export const adjustedHslToRgb = (h: number, s: number, l: number): string => {
  const adjustedS = getAdjustedSaturation(h, s, l);
  const adjustedL = getAdjustedLightness(h, l, adjustedS);
  return hslToRgb(h, adjustedS, adjustedL);
};

export const createGradientBg = (colors: string[]): string =>
  `linear-gradient(90deg, ${colors.join(', ')})`;

export const generateHueGradient = (steps: number = 25): string[] => {
  return Array.from({ length: steps }, (_, i) => {
    const hue = (360 * i) / (steps - 1);
    return hslToRgb(hue, 80, 60); // Use basic HSL for gradients
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
    return hslToRgb(finalHue, 80, 60); // Use basic HSL for gradients
  });
};

export const generateSaturationGradient = (hue: number): string[] => [
  hslToRgb(hue, 0, 50),
  hslToRgb(hue, 100, 50),
];

export const generateLightnessGradient = (hue: number, saturation: number): string[] => [
  hslToRgb(hue, saturation, 0),
  hslToRgb(hue, saturation, 50),
  hslToRgb(hue, saturation, 100),
];

export const generateColors = (params: ThemeParams): Base24Colors => {
  const isLight = params.bgLight > 50;

  // Background colors (use basic HSL)
  const base00 = hslToRgb(params.bgHue, params.bgSat, params.bgLight);
  const base01 = hslToRgb(
    params.bgHue,
    Math.min(100, params.bgSat * 1.2),
    Math.max(0, Math.min(100, params.bgLight + (isLight ? -4 : 4)))
  );
  const base02 = hslToRgb(
    params.bgHue,
    Math.min(100, params.bgSat * 1.5),
    Math.max(0, Math.min(100, params.bgLight + (isLight ? -8 : 8)))
  );

  // Comments
  const commentHue = (params.bgHue + (isLight ? 180 : 0)) % 360;
  const base03 = hslToRgb(commentHue, 15, params.commentLight);

  // Foreground colors
  const fgLight = isLight ? 15 : 85;
  const base04 = hslToRgb(params.bgHue, 20, Math.max(0, Math.min(100, fgLight + 15)));
  const base05 = hslToRgb(params.bgHue, 15, fgLight);
  const base06 = hslToRgb(params.bgHue, 12, Math.max(0, Math.min(100, fgLight - 5)));
  const base07 = hslToRgb(params.bgHue, 10, Math.max(0, Math.min(100, fgLight - 10)));

  // Standard HSL hue positions
  const accentHueOffsets = [0, 30, 60, 120, 180, 210, 270, 330];

  const accentHues = accentHueOffsets.map((offset) => {
    let hue = params.accentHue + offset;
    while (hue < 0) hue += 360;
    while (hue >= 360) hue -= 360;
    return hue;
  });

  // Generate accent colors with perceptual adjustments
  const accents = accentHues.map((hue) => {
    return adjustedHslToRgb(hue, params.accentSat, params.accentLight);
  });

  // Muted colors with perceptually consistent contrast from accents
  const mutedSat = Math.max(20, params.accentSat * 0.75);
  const mutedLight = getMutedLightness(params.accentLight);

  const muted = accentHues.map((hue) => {
    return adjustedHslToRgb(hue, mutedSat, mutedLight);
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
    base08: accents[0], // Red (0°)
    base09: accents[1], // Orange (30°) - reduced saturation
    base0A: accents[2], // Yellow (60°) - reduced saturation & lightness
    base0B: accents[3], // Green (120°) - slight saturation boost
    base0C: accents[4], // Cyan (180°) - reduced saturation
    base0D: accents[5], // Blue (210°) - slight lightness boost
    base0E: accents[6], // Purple (270°) - slight lightness boost
    base0F: accents[7], // Pink (330°)
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
