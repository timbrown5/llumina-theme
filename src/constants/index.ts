import type { Theme, ColorGroup, Tab, SliderConfig, ThemeKey, FlavorKey } from '../types/index.ts';

// Theme data - you can update this object directly or copy/paste from exported JSON
const themeData = {
  midnight: {
    name: 'Lumina Midnight',
    tagline: 'Deep darkness with electric neon accents',
    inspirations: 'City lights, dark nights, energy, excitement, neon signs, nightlife',
    bgHue: 270,
    bgSat: 25,
    bgLight: 6,
    accentHue: 0,
    accentSat: 95,
    accentLight: 50,
    commentLight: 35,
    flavors: {
      pastel: {
        accentHue: 0,
        accentSat: 85,
        accentLight: 80,
        commentLight: 55,
      },
      normal: {
        accentHue: 0,
        accentSat: 90,
        accentLight: 70,
        commentLight: 50,
      },
      'high-contrast': {
        accentHue: 0,
        accentSat: 95,
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
    accentHue: 0,
    accentSat: 85,
    accentLight: 68,
    commentLight: 55,
    flavors: {
      pastel: {
        accentHue: 0,
        accentSat: 85,
        accentLight: 75,
        commentLight: 65,
      },
      normal: {
        accentHue: 0,
        accentSat: 90,
        accentLight: 70,
        commentLight: 55,
      },
      'high-contrast': {
        accentHue: 0,
        accentSat: 95,
        accentLight: 60,
        commentLight: 60,
      },
    },
  },
  dawn: {
    name: 'Lumina Dawn',
    tagline: 'The warm pink and gold of sunrise',
    inspirations: 'Sunrise, new beginnings, opportunity, hope, fresh starts, awakening',
    bgHue: 320,
    bgSat: 35,
    bgLight: 18,
    accentHue: 0,
    accentSat: 80,
    accentLight: 65,
    commentLight: 60,
    flavors: {
      pastel: {
        accentHue: 0,
        accentSat: 75,
        accentLight: 75,
        commentLight: 70,
      },
      normal: {
        accentHue: 0,
        accentSat: 80,
        accentLight: 65,
        commentLight: 60,
      },
      'high-contrast': {
        accentHue: 0,
// Theme data - you can update this object directly or copy/paste from exported JSON
const themeData = {
  "midnight": {
    "name": "Lumina Midnight",
    "tagline": "Deep darkness with electric neon accents",
    "inspirations": "City lights, dark nights, energy, excitement, neon signs, nightlife",
    "bgHue": 270,
    "bgSat": 25,
    "bgLight": 6,
    "accentHue": 0,
    "accentSat": 95,
    "accentLight": 50,
    "commentLight": 35,
    "flavors": {
      "pastel": {
        "accentHue": 0,
        "accentSat": 85,
        "accentLight": 80,
        "commentLight": 55
      },
      "normal": {
        "accentHue": 0,
        "accentSat": 90,
        "accentLight": 70,
        "commentLight": 50
      },
      "high-contrast": {
        "accentHue": 0,
        "accentSat": 95,
        "accentLight": 50,
        "commentLight": 60
      }
    }
  },
  "twilight": {
    "name": "Lumina Twilight",
    "tagline": "The deep blue of the last light of the day",
    "inspirations": "Fading light, peaceful evenings, blue hour, tranquility, rest",
    "bgHue": 242,
    "bgSat": 40,
    "bgLight": 12,
    "accentHue": 0,
    "accentSat": 85,
    "accentLight": 68,
    "commentLight": 55,
    "flavors": {
      "pastel": {
        "accentHue": 0,
        "accentSat": 85,
        "accentLight": 75,
        "commentLight": 65
      },
      "normal": {
        "accentHue": 0,
        "accentSat": 90,
        "accentLight": 70,
        "commentLight": 55
      },
      "high-contrast": {
        "accentHue": 0,
        "accentSat": 95,
        "accentLight": 60,
        "commentLight": 60
      }
    }
  },
  "dawn": {
    "name": "Lumina Dawn",
    "tagline": "The warm pink and gold of sunrise",
    "inspirations": "Sunrise, new beginnings, opportunity, hope, fresh starts, awakening",
    "bgHue": 345,
    "bgSat": 45,
    "bgLight": 18,
    "accentHue": 15,
    "accentSat": 90,
    "accentLight": 65,
    "commentLight": 70,
    "flavors": {
      "pastel": {
        "accentHue": 15,
        "accentSat": 80,
        "accentLight": 80,
        "commentLight": 70
      },
      "normal": {
        "accentHue":15,
        "accentSat": 80,
        "accentLight": 70,
        "commentLight": 70
      },
      "high-contrast": {
        "accentHue": 15,
        "accentSat": 90,
        "accentLight": 65,
        "commentLight": 70
      }
    }
  },
  "noon": {
    "name": "Lumina Noon",
    "tagline": "Golden sunshine and natural warmth",
    "inspirations": "Warm days, good times, beach afternoons, lazy picnics, contentment, comfort",
    "bgHue": 45,
    "bgSat": 25,
    "bgLight": 96,
    "accentHue": 0,
    "accentSat": 90,
    "accentLight": 45,
    "commentLight": 40,
    "flavors": {
      "pastel": {
        "accentHue": 0,
        "accentSat": 60,
        "accentLight": 50,
        "commentLight": 60
      },
      "normal": {
        "accentHue": 0,
        "accentSat": 65,
        "accentLight": 40,
        "commentLight": 50
      },
      "high-contrast": {
        "accentHue": 0,
        "accentSat": 90,
        "accentLight": 45,
        "commentLight": 40
      }
    }
  }
} as const;

// Derive THEMES from JSON data
export const THEMES: Record<ThemeKey, Theme> = Object.entries(themeData).reduce(
  (acc, [key, data]) => {
    acc[key as ThemeKey] = {
      name: data.name,
      tagline: data.tagline,
      inspirations: data.inspirations,
      bgHue: data.bgHue,
      bgSat: data.bgSat,
      bgLight: data.bgLight,
      accentHue: data.accentHue,
      accentSat: data.accentSat,
      accentLight: data.accentLight,
      commentLight: data.commentLight,
    };
    return acc;
  },
  {} as Record<ThemeKey, Theme>
);

// Derive FLAVORS from JSON data
export const FLAVORS: Record<
  ThemeKey,
  Record<FlavorKey, [number, number, number, number]>
> = Object.entries(themeData).reduce(
  (acc, [themeKey, data]) => {
    acc[themeKey as ThemeKey] = Object.entries(data.flavors).reduce(
      (flavorAcc, [flavorKey, flavorData]) => {
        flavorAcc[flavorKey as FlavorKey] = [
          flavorData.accentHue ?? data.accentHue,
          flavorData.accentSat ?? data.accentSat,
          flavorData.accentLight ?? data.accentLight,
          flavorData.commentLight ?? data.commentLight,
        ];
        return flavorAcc;
      },
      {} as Record<FlavorKey, [number, number, number, number]>
    );
    return acc;
  },
  {} as Record<ThemeKey, Record<FlavorKey, [number, number, number, number]>>
);

// Export the raw theme data for other uses
export const RAW_THEME_DATA = themeData;

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

export const SLIDER_CONFIGS: Record<string, SliderConfig[]> = {
  main: [
    { label: 'Background Hue', key: 'bgHue', min: 0, max: 360, type: 'hue' },
    { label: 'Background Saturation', key: 'bgSat', min: 0, max: 100, type: 'saturation' },
    { label: 'Background Lightness', key: 'bgLight', min: 0, max: 100, type: 'lightness' },
  ],
  accent: [
    { label: 'Accent Hue Adjustment', key: 'accentHue', min: -180, max: 180, type: 'hue' },
    { label: 'Accent Saturation', key: 'accentSat', min: 0, max: 100, type: 'saturation' },
    { label: 'Accent Lightness', key: 'accentLight', min: 0, max: 100, type: 'lightness' },
  ],
  comment: [
    { label: 'Comment Lightness', key: 'commentLight', min: 0, max: 100, type: 'lightness' },
  ],
};
