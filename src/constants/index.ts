import type {
  ColorGroup,
  Tab,
  SliderConfig,
  ThemeKey,
  FlavorKey,
  ThemeParams,
} from '../types/index.ts';
import {
  generateHueGradient,
  generateAccentHueGradient,
  generateSaturationGradient,
  generateLightnessGradient,
  okhslToRgb,
} from '../utils/colorUtils.ts';

export const RAW_THEME_DATA = {
  midnight: {
    name: 'Lumina Midnight',
    tagline: 'Deep darkness with electric neon accents',
    inspirations: 'City lights, dark nights, energy, excitement, neon signs, nightlife',
    bgHue: 270,
    bgSat: 25,
    bgLight: 6,
    flavors: {
      muted: {
        accentHue: 0,
        accentSat: 85,
        accentLight: 75,
        commentLight: 55,
      },
      balanced: {
        accentHue: 0,
        accentSat: 95,
        accentLight: 60,
        commentLight: 55,
      },
      bold: {
        accentHue: 0,
        accentSat: 100,
        accentLight: 50,
        commentLight: 60,
      },
    },
  },
  twilight: {
    name: 'Lumina Twilight',
    tagline: 'The deep blue of the last light of the day',
    inspirations: 'Fading light, peaceful evenings, blue hour, tranquility, rest',
    bgHue: 242,
    bgSat: 40,
    bgLight: 12,
    flavors: {
      muted: {
        accentHue: 0,
        accentSat: 85,
        accentLight: 75,
        commentLight: 55,
      },
      balanced: {
        accentHue: 0,
        accentSat: 95,
        accentLight: 60,
        commentLight: 55,
      },
      bold: {
        accentHue: 0,
        accentSat: 100,
        accentLight: 50,
        commentLight: 60,
      },
    },
  },
  dawn: {
    name: 'Lumina Dawn',
    tagline: 'The warm pink and gold of sunrise',
    inspirations: 'Sunrise, new beginnings, opportunity, hope, fresh starts, awakening',
    bgHue: 345,
    bgSat: 45,
    bgLight: 15,
    flavors: {
      muted: {
        accentHue: 15,
        accentSat: 85,
        accentLight: 75,
        commentLight: 55,
      },
      balanced: {
        accentHue: 15,
        accentSat: 95,
        accentLight: 60,
        commentLight: 55,
      },
      bold: {
        accentHue: 15,
        accentSat: 100,
        accentLight: 50,
        commentLight: 60,
      },
    },
  },
  noon: {
    name: 'Lumina Noon',
    tagline: 'Golden sunshine and natural warmth',
    inspirations: 'Golden hour, warm days, contentment, beach afternoons, lazy picnics, comfort',
    bgHue: 50,
    bgSat: 100,
    bgLight: 98,
    flavors: {
      muted: {
        accentHue: -15,
        accentSat: 80,
        accentLight: 55,
        commentLight: 50,
      },
      balanced: {
        accentHue: -15,
        accentSat: 90,
        accentLight: 45,
        commentLight: 40,
      },
      bold: {
        accentHue: -35,
        accentSat: 100,
        accentLight: 35,
        commentLight: 30,
      },
    },
  },
} as const;

interface BaseTheme {
  name: string;
  tagline: string;
  inspirations: string;
  bgHue: number;
  bgSat: number;
  bgLight: number;
}

interface FlavorData {
  accentHue: number;
  accentSat: number;
  accentLight: number;
  commentLight: number;
}

export const getBaseTheme = (key: ThemeKey): BaseTheme => {
  const data = RAW_THEME_DATA[key];
  return {
    name: data.name,
    tagline: data.tagline,
    inspirations: data.inspirations,
    bgHue: data.bgHue,
    bgSat: data.bgSat,
    bgLight: data.bgLight,
  };
};

export const getFlavorData = (theme: ThemeKey, flavor: FlavorKey): FlavorData => {
  return RAW_THEME_DATA[theme].flavors[flavor];
};

export const getThemeParams = (theme: ThemeKey, flavor: FlavorKey) => {
  try {
    const baseTheme = getBaseTheme(theme);
    const flavorData = getFlavorData(theme, flavor);

    return {
      bgHue: baseTheme.bgHue,
      bgSat: baseTheme.bgSat,
      bgLight: baseTheme.bgLight,
      accentHue: flavorData.accentHue,
      accentSat: flavorData.accentSat,
      accentLight: flavorData.accentLight,
      commentLight: flavorData.commentLight,
    };
  } catch (error) {
    console.error('Error getting theme params:', error, { theme, flavor });
    return {
      bgHue: 200,
      bgSat: 20,
      bgLight: 20,
      accentHue: 0,
      accentSat: 70,
      accentLight: 60,
      commentLight: 40,
    };
  }
};

export const getAllThemeKeys = (): ThemeKey[] => Object.keys(RAW_THEME_DATA) as ThemeKey[];
export const getAllFlavorKeys = (): FlavorKey[] => ['muted', 'balanced', 'bold'];

interface SliderGenerator {
  gradient: (params: ThemeParams) => string[];
  preview?: (value: number, params: ThemeParams) => { color?: string; label?: string };
}

export const SLIDER_GENERATORS: Record<keyof ThemeParams, SliderGenerator> = {
  bgHue: {
    gradient: () => generateHueGradient(),
    preview: (value) => ({
      color: okhslToRgb(value, 80, 60),
      label: `${value}°`,
    }),
  },
  accentHue: {
    gradient: () =>
      generateAccentHueGradient(0, SLIDER_RANGES.ACCENT_HUE_MIN, SLIDER_RANGES.ACCENT_HUE_MAX),
    preview: (value) => {
      // Red is at 29° in OKHSL, show what the adjusted red looks like
      const adjustedHue = (BASE_HUES.red + value + 360) % 360;
      return {
        color: okhslToRgb(adjustedHue, 80, 60),
        label: `Red + ${value > 0 ? '+' : ''}${value}° = ${Math.round(adjustedHue)}°`,
      };
    },
  },
  bgSat: {
    gradient: (params) => generateSaturationGradient(params.bgHue),
  },
  accentSat: {
    gradient: (params) => {
      // Use red as the base for accent saturation gradient
      const adjustedRedHue = (BASE_HUES.red + params.accentHue + 360) % 360;
      return generateSaturationGradient(adjustedRedHue);
    },
  },
  bgLight: {
    gradient: (params) => generateLightnessGradient(params.bgHue, params.bgSat),
  },
  accentLight: {
    gradient: (params) => {
      // Use red as the base for accent lightness gradient
      const adjustedRedHue = (BASE_HUES.red + params.accentHue + 360) % 360;
      return generateLightnessGradient(adjustedRedHue, params.accentSat);
    },
  },
  commentLight: {
    gradient: (params) => {
      const isLight = params.bgLight > LIGHT_THEME_THRESHOLD;
      const commentHue = (params.bgHue + (isLight ? 180 : 0) + 360) % 360;
      return generateLightnessGradient(commentHue, 15);
    },
  },
};

export const COLOR_GROUPS: Record<string, ColorGroup[]> = {
  main: [
    { key: 'base00', name: 'Background' },
    { key: 'base01', name: 'Alt Background' },
    { key: 'base02', name: 'Selection' },
    { key: 'base03', name: 'Comments' },
    { key: 'base04', name: 'Dark Foreground' },
    { key: 'base05', name: 'Foreground' },
    { key: 'base06', name: 'Light Foreground' },
    { key: 'base07', name: 'Light Background' },
  ],
  accent: [
    { key: 'base08', name: 'Red' },
    { key: 'base09', name: 'Orange' },
    { key: 'base0A', name: 'Yellow' },
    { key: 'base0B', name: 'Green' },
    { key: 'base0C', name: 'Cyan' },
    { key: 'base0D', name: 'Blue' },
    { key: 'base0E', name: 'Purple' },
    { key: 'base0F', name: 'Pink' },
  ],
  muted: [
    { key: 'base10', name: 'Muted Red' },
    { key: 'base11', name: 'Muted Orange' },
    { key: 'base12', name: 'Muted Yellow' },
    { key: 'base13', name: 'Muted Green' },
    { key: 'base14', name: 'Muted Cyan' },
    { key: 'base15', name: 'Muted Blue' },
    { key: 'base16', name: 'Muted Purple' },
    { key: 'base17', name: 'Muted Pink' },
  ],
};

export const TABS: Tab[] = [
  { id: 'colors', label: 'Colors' },
  { id: 'ui-preview', label: 'UI Preview' },
  { id: 'javascript', label: 'JavaScript' },
  { id: 'python', label: 'Python' },
  { id: 'cpp', label: 'C++' },
  { id: 'terminal', label: 'Terminal' },
];

// OKHSL base hue values for standard colors
// When accentHue = 0, these should produce the expected color names
export const BASE_HUES = {
  red: 29, // OKHSL red
  orange: 50, // Orange in OKHSL
  yellow: 110, // Brighter yellow (moved from 90°)
  green: 140, // OKHSL green
  cyan: 180, // Cyan in OKHSL
  blue: 220, // OKHSL blue
  purple: 280, // Purple in OKHSL
  pink: 320, // Pink/Magenta in OKHSL
} as const;

// Theme classification threshold
export const LIGHT_THEME_THRESHOLD = 50;

// Slider configuration ranges (shared between sliders and validation)
export const SLIDER_RANGES = {
  HUE_MIN: 0,
  HUE_MAX: 360,
  ACCENT_HUE_MIN: -180,
  ACCENT_HUE_MAX: 180,
  SATURATION_MIN: 0,
  SATURATION_MAX: 100,
  LIGHTNESS_MIN: 0,
  LIGHTNESS_MAX: 100,
} as const;

export const SLIDER_CONFIGS: Record<string, SliderConfig[]> = {
  main: [
    {
      label: 'Background Hue',
      key: 'bgHue',
      min: SLIDER_RANGES.HUE_MIN,
      max: SLIDER_RANGES.HUE_MAX,
      type: 'hue',
    },
    {
      label: 'Background Saturation',
      key: 'bgSat',
      min: SLIDER_RANGES.SATURATION_MIN,
      max: SLIDER_RANGES.SATURATION_MAX,
      type: 'saturation',
    },
    {
      label: 'Background Lightness',
      key: 'bgLight',
      min: SLIDER_RANGES.LIGHTNESS_MIN,
      max: SLIDER_RANGES.LIGHTNESS_MAX,
      type: 'lightness',
    },
  ],
  accent: [
    {
      label: 'Accent Hue Adjustment',
      key: 'accentHue',
      min: SLIDER_RANGES.ACCENT_HUE_MIN,
      max: SLIDER_RANGES.ACCENT_HUE_MAX,
      type: 'hue',
    },
    {
      label: 'Accent Saturation',
      key: 'accentSat',
      min: SLIDER_RANGES.SATURATION_MIN,
      max: SLIDER_RANGES.SATURATION_MAX,
      type: 'saturation',
    },
    {
      label: 'Accent Lightness',
      key: 'accentLight',
      min: SLIDER_RANGES.LIGHTNESS_MIN,
      max: SLIDER_RANGES.LIGHTNESS_MAX,
      type: 'lightness',
    },
  ],
  comment: [
    {
      label: 'Comment Lightness',
      key: 'commentLight',
      min: SLIDER_RANGES.LIGHTNESS_MIN,
      max: SLIDER_RANGES.LIGHTNESS_MAX,
      type: 'lightness',
    },
  ],
};
