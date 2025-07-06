import { generateColors } from '../utils/colorUtils.ts';
import type { ThemeKey, FlavorKey, ThemeParams, Base24Colors, BaseTheme } from '../types/index.ts';

import midnightTheme from '../themes/midnight.json';
import twilightTheme from '../themes/twilight.json';
import dawnTheme from '../themes/dawn.json';
import noonTheme from '../themes/noon.json';

export interface ThemeFlavorData {
  accentHue: number;
  accentSat: number;
  accentLight: number;
  commentLight: number;
}

export interface AccentOffsetDefinition {
  hue: number;
  saturation?: number;
  lightness?: number;
}

export interface ThemeDefinition {
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
  flavors: Record<FlavorKey, ThemeFlavorData>;
}

export class Theme {
  private definition: ThemeDefinition;

  constructor(private key: ThemeKey) {
    this.definition = this.loadThemeData(key);
  }

  private loadThemeData(key: ThemeKey): ThemeDefinition {
    try {
      const themeModule = this.getThemeModule(key);
      return themeModule;
    } catch (error) {
      console.error(`Failed to load theme ${key}:`, error);
      return this.getFallbackTheme(key);
    }
  }

  private getThemeModule(key: ThemeKey): ThemeDefinition {
    switch (key) {
      case 'midnight':
        return midnightTheme as ThemeDefinition;
      case 'twilight':
        return twilightTheme as ThemeDefinition;
      case 'dawn':
        return dawnTheme as ThemeDefinition;
      case 'noon':
        return noonTheme as ThemeDefinition;
      default:
        throw new Error(`Unknown theme: ${key}`);
    }
  }

  private getFallbackTheme(key: ThemeKey): ThemeDefinition {
    return {
      name: `Lumina ${key.charAt(0).toUpperCase() + key.slice(1)}`,
      tagline: 'Fallback theme',
      inspirations: 'Default values',
      bgHue: 270,
      bgSat: 25,
      bgLight: 6,
      accentOffsets: {
        red: { hue: 0 },
        orange: { hue: 30 },
        yellow: { hue: 60 },
        green: { hue: 150 },
        cyan: { hue: 180 },
        blue: { hue: 210 },
        purple: { hue: 270 },
        pink: { hue: 330 },
      },
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
    };
  }

  getName(): string {
    return this.definition.name;
  }

  getTagline(): string {
    return this.definition.tagline;
  }

  getInspirations(): string {
    return this.definition.inspirations;
  }

  getKey(): ThemeKey {
    return this.key;
  }

  getInfo(): { name: string; tagline: string; inspirations: string } {
    return {
      name: this.definition.name,
      tagline: this.definition.tagline,
      inspirations: this.definition.inspirations,
    };
  }

  getBaseParams(): Pick<ThemeParams, 'bgHue' | 'bgSat' | 'bgLight'> {
    return {
      bgHue: this.definition.bgHue,
      bgSat: this.definition.bgSat,
      bgLight: this.definition.bgLight,
    };
  }

  getFlavorParams(
    flavorKey: FlavorKey
  ): Pick<ThemeParams, 'accentHue' | 'accentSat' | 'accentLight' | 'commentLight'> {
    const flavorData = this.definition.flavors[flavorKey];
    return {
      accentHue: flavorData.accentHue,
      accentSat: flavorData.accentSat,
      accentLight: flavorData.accentLight,
      commentLight: flavorData.commentLight,
    };
  }

  getDefaultParams(flavorKey: FlavorKey): ThemeParams {
    return {
      ...this.getBaseParams(),
      ...this.getFlavorParams(flavorKey),
      colorAdjustments: {},
    };
  }

  generateColors(params: ThemeParams): Base24Colors {
    return generateColors(params, this.key);
  }

  isLightTheme(): boolean {
    return this.definition.bgLight > 50;
  }

  getAvailableFlavors(): FlavorKey[] {
    return Object.keys(this.definition.flavors) as FlavorKey[];
  }

  toThemeDefinition(customParams?: Partial<ThemeParams>): ThemeDefinition {
    const bgParams = customParams
      ? {
          bgHue: customParams.bgHue ?? this.definition.bgHue,
          bgSat: customParams.bgSat ?? this.definition.bgSat,
          bgLight: customParams.bgLight ?? this.definition.bgLight,
        }
      : {
          bgHue: this.definition.bgHue,
          bgSat: this.definition.bgSat,
          bgLight: this.definition.bgLight,
        };

    return {
      name: this.definition.name,
      tagline: this.definition.tagline,
      inspirations: this.definition.inspirations,
      ...bgParams,
      accentOffsets: { ...this.definition.accentOffsets },
      flavors: { ...this.definition.flavors },
    };
  }

  toBaseTheme(): BaseTheme {
    return {
      name: this.definition.name,
      tagline: this.definition.tagline,
      inspirations: this.definition.inspirations,
      bgHue: this.definition.bgHue,
      bgSat: this.definition.bgSat,
      bgLight: this.definition.bgLight,
    };
  }
}
