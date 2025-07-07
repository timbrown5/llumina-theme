/**
 * Legacy constants file with theme access and slider generation functions.
 *
 * Maintains backward compatibility while providing utility functions for
 * color generation and theme access. This module bridges older parts of
 * the codebase with the newer theme system architecture, ensuring smooth
 * operation during system transitions.
 *
 * Utilities provided:
 * - Theme and flavor access functions for compatibility
 * - Visual gradient generation for slider components
 * - Color group organization and metadata
 * - Slider configuration definitions
 * - Legacy parameter mapping functions
 */

import type { ColorGroup, Tab, SliderConfig, ThemeKey, FlavorKey } from '../types/index.ts';
import { themeLoader } from '../utils/themeLoader.ts';
import {
  generateHueGradient,
  generateSaturationGradient,
  generateLightnessGradient,
  hslToRgb,
} from '../utils/colorUtils.ts';

// Re-export theme access functions from the loader
export const getAllThemeKeys = () => themeLoader.getAllThemeKeys();
export const getAllFlavorKeys = () => themeLoader.getAllFlavorKeys();

// Legacy compatibility function - now uses themeLoader directly
export const getBaseTheme = (key: ThemeKey) => {
  return themeLoader.getTheme(key);
};

// Slider generators with updated accent hue range (0-360 with wrapping)
interface SliderGenerator {
  gradient: (params: any) => string[];
  preview?: (value: number, params: any) => { color?: string; label?: string };
}

export const SLIDER_GENERATORS: Record<string, SliderGenerator> = {
  bgHue: {
    gradient: () => generateHueGradient(),
    preview: (value) => ({
      color: hslToRgb(value, 80, 60),
      label: `${value}°`,
    }),
  },
  bgSat: {
    gradient: (params) => generateSaturationGradient(params.bgHue || 0),
  },
  bgLight: {
    gradient: (params) => generateLightnessGradient(params.bgHue || 0, params.bgSat || 50),
  },
  accentHue: {
    gradient: () => generateHueGradient(), // Full 0-360 gradient
    preview: (value) => ({
      color: hslToRgb(value, 80, 60),
      label: `${value}°`,
    }),
  },
  accentSat: {
    gradient: (params) => {
      const accentHue = params.accentHue || 0;
      return generateSaturationGradient(accentHue);
    },
  },
  accentLight: {
    gradient: (params) => {
      const accentHue = params.accentHue || 0;
      return generateLightnessGradient(accentHue, params.accentSat || 70);
    },
  },
  commentLight: {
    gradient: (params) => {
      const isLight = (params.bgLight || 50) > 50;
      const commentHue = ((params.bgHue || 0) + (isLight ? 180 : 0) + 360) % 360;
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
    { key: 'base04', name: 'Secondary Text' },
    { key: 'base05', name: 'Main Text' },
    { key: 'base06', name: 'Light Surface' },
    { key: 'base07', name: 'Light Accent' },
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
    { label: 'Accent Hue', key: 'accentHue', min: 0, max: 360, type: 'hue' },
    { label: 'Accent Saturation', key: 'accentSat', min: 0, max: 100, type: 'saturation' },
    { label: 'Accent Lightness', key: 'accentLight', min: 0, max: 100, type: 'lightness' },
  ],
  comment: [
    { label: 'Comment Lightness', key: 'commentLight', min: 0, max: 100, type: 'lightness' },
  ],
};
