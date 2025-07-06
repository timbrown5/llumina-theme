import type { ThemeParams } from './theme.ts';

export type TabKey = 'colors' | 'ui-preview' | 'javascript' | 'python' | 'cpp' | 'terminal';
export type SliderType = 'hue' | 'saturation' | 'lightness';

export interface ColorGroup {
  key: string;
  name: string;
}

export interface Tab {
  id: string;
  label: string;
}

export interface SliderConfig {
  label: string;
  key: string;
  min: number;
  max: number;
  type: 'hue' | 'saturation' | 'lightness';
}

export interface SliderGenerator {
  gradient: (params: any) => string[];
  preview?: (value: number, params: any) => { color?: string; label?: string };
}

export interface FlavorDescription {
  key: string;
  name: string;
  description: string;
}
