/**
 * UI component configuration constants and metadata.
 * Centralized definitions for tabs, sliders, flavor descriptions,
 * and other UI element configurations used throughout the application.
 */

import type { Tab, SliderConfig, FlavorDescription } from '../types/ui.js';
import type { FlavorKey } from '../types/theme.js';

/**
 * Available preview tabs for theme visualization.
 * Defines the different code language and UI preview options.
 */
export const TABS: Tab[] = [
  { id: 'ui-preview', label: 'UI Preview' },
  { id: 'javascript', label: 'JavaScript' },
  { id: 'python', label: 'Python' },
  { id: 'cpp', label: 'C++' },
  { id: 'terminal', label: 'Terminal' },
];

/**
 * Slider configuration groups for theme parameter adjustment.
 * Organizes sliders by functional category (main, accent, comment).
 */
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

/**
 * Flavor descriptions providing user-facing information about theme variants.
 * Maps flavor keys to descriptive metadata for UI display.
 */
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

/**
 * Array of all available flavor keys for iteration and validation.
 */
export const FLAVOR_KEYS: FlavorKey[] = Object.keys(FLAVOR_DESCRIPTIONS) as FlavorKey[];
