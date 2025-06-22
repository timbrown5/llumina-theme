import type { Theme, ColorGroup, Tab, SliderConfig, ThemeKey, FlavorKey } from '../types/index.ts';

export const THEMES: Record<ThemeKey, Theme> = {
  midnight: {
    name: 'Lumina Midnight',
    tagline: 'Really dark theme with colorful, high contrast accents',
    inspirations: 'City lights, dark nights, energy, excitement, neon signs, nightlife',
    bgHue: 270,
    bgSat: 20,
    bgLight: 8,
    accentSat: 95,
    accentLight: 80,
    commentLight: 65,
  },
  twilight: {
    name: 'Lumina Twilight',
    tagline: 'The deep blue of the last light of the day',
    inspirations: 'Fading light, peaceful evenings, blue hour, tranquility, rest',
    bgHue: 242,
    bgSat: 35,
    bgLight: 17,
    accentSat: 90,
    accentLight: 70,
    commentLight: 65,
  },
  dawn: {
    name: 'Lumina Dawn',
    tagline: 'The warm pink at the start of a new day',
    inspirations: 'Sunrise, new beginnings, opportunity, hope, fresh starts, awakening',
    bgHue: 288,
    bgSat: 39,
    bgLight: 21,
    accentSat: 85,
    accentLight: 60,
    commentLight: 65,
  },
  noon: {
    name: 'Lumina Noon',
    tagline: 'The relaxing golden sunshine on a warm day',
    inspirations: 'Warm days, good times, beach afternoons, lazy picnics, contentment, comfort',
    bgHue: 50,
    bgSat: 40,
    bgLight: 96,
    accentSat: 70,
    accentLight: 45,
    commentLight: 35,
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

export const FLAVORS: Record<ThemeKey, Record<FlavorKey, [number, number, number]>> = {
  midnight: { pastel: [95, 80, 65], normal: [90, 70, 65], 'high-contrast': [85, 60, 65] },
  twilight: { pastel: [95, 80, 65], normal: [90, 70, 65], 'high-contrast': [85, 60, 65] },
  dawn: { pastel: [95, 80, 65], normal: [90, 70, 65], 'high-contrast': [85, 60, 65] },
  noon: { pastel: [65, 50, 35], normal: [70, 45, 35], 'high-contrast': [80, 40, 30] },
};

export const SLIDER_CONFIGS: Record<string, SliderConfig[]> = {
  main: [
    { label: 'Hue', key: 'bgHue', min: 0, max: 360, type: 'hue' },
    { label: 'Saturation', key: 'bgSat', min: 0, max: 100, type: 'saturation' },
    { label: 'Lightness', key: 'bgLight', min: 0, max: 100, type: 'lightness' },
  ],
  accent: [
    { label: 'Saturation', key: 'accentSat', min: 0, max: 100, type: 'saturation' },
    { label: 'Lightness', key: 'accentLight', min: 0, max: 100, type: 'lightness' },
  ],
  comment: [{ label: 'Lightness', key: 'commentLight', min: 0, max: 100, type: 'lightness' }],
};
