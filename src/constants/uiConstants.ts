import type { Tab, SliderConfig, FlavorDescription } from '../types/ui.ts';
import type { FlavorKey } from '../types/theme.ts';

export const TABS: Tab[] = [
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
    { label: 'Accent Hue', key: 'accentHue', min: 0, max: 360, type: 'hue' },
    { label: 'Accent Saturation', key: 'accentSat', min: 0, max: 100, type: 'saturation' },
    { label: 'Accent Lightness', key: 'accentLight', min: 0, max: 100, type: 'lightness' },
  ],
  comment: [
    { label: 'Comment Lightness', key: 'commentLight', min: 0, max: 100, type: 'lightness' },
  ],
};

export const FLAVOR_DESCRIPTIONS: Record<FlavorKey, FlavorDescription> = {
  muted: {
    key: 'muted',
    name: 'Muted',
    description: 'Gentle, softer colors for relaxed environments',
  },
  balanced: {
    key: 'balanced',
    name: 'Balanced',
    description: 'Harmonious colors for everyday use',
  },
  bold: {
    key: 'bold',
    name: 'Bold',
    description: 'High contrast colors for maximum readability',
  },
};

export const FLAVOR_KEYS: FlavorKey[] = Object.keys(FLAVOR_DESCRIPTIONS) as FlavorKey[];
