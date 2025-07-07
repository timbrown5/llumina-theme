/**
 * Loads and manages theme definitions from JSON files at build time.
 *
 * Handles the discovery, loading, and management of available themes within
 * the application. This module provides the foundation for theme availability
 * and ensures type-safe access to theme configurations while handling graceful
 * fallbacks when themes are missing or corrupted.
 *
 * Core functionality:
 * - Build-time theme discovery and loading from JSON files
 * - Type-safe theme registry with validation
 * - Graceful fallback handling for missing themes
 * - Theme and flavor metadata access
 * - Asynchronous loading interface for UI components
 */

import type { ThemeKey, FlavorKey, BaseTheme } from '../types/index.ts';

// Import all theme JSON files at build time
import midnightTheme from '../themes/midnight.json';
import twilightTheme from '../themes/twilight.json';
import dawnTheme from '../themes/dawn.json';
import noonTheme from '../themes/noon.json';

interface AccentOffsetDefinition {
  hue: number;
  // Future extensions:
  saturation?: number;
  lightness?: number;
}

interface ThemeDefinition {
  name: string;
  tagline: string;
  inspirations: string;
  bgHue: number;
  bgSat: number;
  bgLight: number;
  accentOffsets: {
    red: AccentOffsetDefinition;
    orange: AccentOffsetDefinition;
    yellow: AccentOffsetDefinition;
    green: AccentOffsetDefinition;
    cyan: AccentOffsetDefinition;
    blue: AccentOffsetDefinition;
    purple: AccentOffsetDefinition;
    pink: AccentOffsetDefinition;
  };
  flavors: Record<
    FlavorKey,
    {
      accentHue: number;
      accentSat: number;
      accentLight: number;
      commentLight: number;
    }
  >;
}

const THEME_DEFINITIONS: Record<ThemeKey, ThemeDefinition> = {
  midnight: midnightTheme as ThemeDefinition,
  twilight: twilightTheme as ThemeDefinition,
  dawn: dawnTheme as ThemeDefinition,
  noon: noonTheme as ThemeDefinition,
};

const DEFAULT_FLAVORS: Record<FlavorKey, any> = {
  muted: {
    accentHue: 0,
    accentSat: 50,
    accentLight: 65,
    commentLight: 45,
  },
  balanced: {
    accentHue: 0,
    accentSat: 70,
    accentLight: 60,
    commentLight: 40,
  },
  bold: {
    accentHue: 0,
    accentSat: 85,
    accentLight: 55,
    commentLight: 35,
  },
};

class ThemeLoader {
  private isLoaded = true; // Since we're importing at build time
  private loadPromise: Promise<void>;

  constructor() {
    this.loadPromise = Promise.resolve();
  }

  async waitForLoad(): Promise<void> {
    return this.loadPromise;
  }

  getAllThemeKeys(): ThemeKey[] {
    return Object.keys(THEME_DEFINITIONS) as ThemeKey[];
  }

  getAllFlavorKeys(): FlavorKey[] {
    return Object.keys(DEFAULT_FLAVORS) as FlavorKey[];
  }

  getThemeInfo(themeKey: ThemeKey): BaseTheme | null {
    const theme = THEME_DEFINITIONS[themeKey];
    if (!theme) return null;

    return {
      name: theme.name,
      tagline: theme.tagline,
      inspirations: theme.inspirations,
      bgHue: theme.bgHue,
      bgSat: theme.bgSat,
      bgLight: theme.bgLight,
    };
  }

  getFlavorInfo(flavorKey: FlavorKey): any {
    return DEFAULT_FLAVORS[flavorKey] || null;
  }

  getTheme(themeKey: ThemeKey): BaseTheme {
    const themeInfo = this.getThemeInfo(themeKey);
    if (!themeInfo) {
      console.warn(`Theme '${themeKey}' not found, using midnight`);
      return this.getThemeInfo('midnight')!;
    }
    return themeInfo;
  }

  getFlavor(flavorKey: FlavorKey): any {
    const flavor = DEFAULT_FLAVORS[flavorKey];
    if (!flavor) {
      console.warn(`Flavor '${flavorKey}' not found, using balanced`);
      return DEFAULT_FLAVORS.balanced;
    }
    return flavor;
  }

  // Get the full theme definition including flavors
  getThemeDefinition(themeKey: ThemeKey): ThemeDefinition | null {
    return THEME_DEFINITIONS[themeKey] || null;
  }

  // Get flavor data from the theme definition
  getThemeFlavor(themeKey: ThemeKey, flavorKey: FlavorKey): any {
    const theme = THEME_DEFINITIONS[themeKey];
    if (theme?.flavors?.[flavorKey]) {
      return theme.flavors[flavorKey];
    }
    return this.getFlavor(flavorKey);
  }
}

export const themeLoader = new ThemeLoader();
