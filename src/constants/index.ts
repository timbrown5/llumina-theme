import type { Theme, ColorGroup, Tab, SliderConfig, ThemeKey, FlavorKey } from '../types/index.ts';

export const THEMES: Record<ThemeKey, Theme> = {
  midnight: {
    name: 'Lumina Midnight',
    tagline: 'Deep darkness with electric neon accents',
    inspirations: 'City lights, dark nights, energy, excitement, neon signs, nightlife',
    bgHue: 270,
    bgSat: 25,
    bgLight: 6,
    accentHue: 0,
    accentSat: 90,
    accentLight: 70,
    commentLight: 45,
  },
  twilight: {
    name: 'Lumina Twilight',
    tagline: 'The deep blue of the last light of the day',
    inspirations: 'Fading light, peaceful evenings, blue hour, tranquility, rest',
    bgHue: 242,
    bgSat: 40,
    bgLight: 16,
    accentHue: 0,
    accentSat: 85,
    accentLight: 68,
    commentLight: 55,
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
  },
  noon: {
    name: 'Lumina Noon',
    tagline: 'Golden sunshine and natural warmth',
    inspirations: 'Warm days, good times, beach afternoons, lazy picnics, contentment, comfort',
    bgHue: 45,
    bgSat: 20,
    bgLight: 95,
    accentHue: 0,
    accentSat: 65,
    accentLight: 40,
    commentLight: 50,
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
    { key: 'base0F', name: 'Brown' },
  ],
  muted: [
    { key: 'base10', name: 'Muted Red' },
    { key: 'base11', name: 'Muted Orange' },
    { key: 'base12', name: 'Muted Yellow' },
    { key: 'base13', name: 'Muted Green' },
    { key: 'base14', name: 'Muted Cyan' },
    { key: 'base15', name: 'Muted Blue' },
    { key: 'base16', name: 'Muted Purple' },
    { key: 'base17', name: 'Muted Brown' },
  ],
};

export const TABS: Tab[] = [
  { id: 'colors', label: 'Colors' },
  { id: 'javascript', label: 'JavaScript' },
  { id: 'python', label: 'Python' },
  { id: 'cpp', label: 'C++' },
  { id: 'terminal', label: 'Terminal' },
];

export const FLAVORS: Record<ThemeKey, Record<FlavorKey, [number, number, number, number]>> = {
  midnight: {
    pastel: [300, 85, 80, 55],
    normal: [300, 90, 70, 45],
    'high-contrast': [300, 95, 60, 35],
  },
  twilight: {
    pastel: [220, 80, 78, 65],
    normal: [220, 85, 68, 55],
    'high-contrast': [220, 90, 58, 45],
  },
  dawn: {
    pastel: [15, 75, 75, 70],
    normal: [15, 80, 65, 60],
    'high-contrast': [15, 85, 55, 50],
  },
  noon: {
    pastel: [35, 60, 50, 60],
    normal: [35, 65, 40, 50],
    'high-contrast': [35, 70, 30, 40],
  },
};

export const SLIDER_CONFIGS: Record<string, SliderConfig[]> = {
  main: [
    { label: 'Background Hue', key: 'bgHue', min: 0, max: 360, type: 'hue' },
    { label: 'Background Saturation', key: 'bgSat', min: 0, max: 100, type: 'saturation' },
    { label: 'Background Lightness', key: 'bgLight', min: 0, max: 100, type: 'lightness' },
  ],
  accent: [
    { label: 'Accent Hue Shift', key: 'accentHue', min: 0, max: 360, type: 'hue' },
    { label: 'Accent Saturation', key: 'accentSat', min: 0, max: 100, type: 'saturation' },
    { label: 'Accent Lightness', key: 'accentLight', min: 0, max: 100, type: 'lightness' },
  ],
  comment: [
    { label: 'Comment Lightness', key: 'commentLight', min: 0, max: 100, type: 'lightness' },
  ],
};
