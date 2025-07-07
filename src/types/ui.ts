/**
 * Type definitions for UI components and interactions.
 *
 * ## Key Types
 * - TabKey: Available preview tab identifiers
 * - SliderConfig: Slider component configuration
 * - ColorGroup: Color metadata for UI display
 */

/**
 * Available preview tab identifiers for code and UI previews.
 */
export type TabKey = 'colors' | 'ui-preview' | 'javascript' | 'python' | 'cpp' | 'terminal';

/**
 * Slider component type classifications for gradient generation.
 */
export type SliderType = 'hue' | 'saturation' | 'lightness';

/**
 * Color metadata for UI display and organization.
 */
export interface ColorGroup {
  key: string;
  name: string;
}

/**
 * Tab navigation configuration for preview sections.
 */
export interface Tab {
  id: string;
  label: string;
}

/**
 * Slider component configuration and constraints.
 */
export interface SliderConfig {
  label: string;
  key: string;
  min: number;
  max: number;
  type: 'hue' | 'saturation' | 'lightness';
}

/**
 * Slider gradient and preview generation interface.
 */
export interface SliderGenerator {
  gradient: (params: any) => string[];
  preview?: (value: number, params: any) => { color?: string; label?: string };
}

/**
 * Flavor description metadata for user interface display.
 */
export interface FlavorDescription {
  key: string;
  name: string;
  description: string;
}
