import { themeLoader } from '../utils/themeLoader.ts';
import { generateColors } from '../utils/colorUtils.ts';
import { Theme } from './Theme.ts';

import {
  createNvimTheme,
  createBase24Json,
  createStylixTheme,
  createThemeJson,
} from '../utils/exportUtils.ts';
import type {
  ThemeKey,
  FlavorKey,
  Base24Colors,
  ThemeParams,
  AccentColorKey,
  BaseTheme,
} from '../types/index.ts';

export class ThemeManager {
  public activeTheme: ThemeKey = 'midnight';
  public activeFlavor: FlavorKey = 'balanced';
  public selectedColorKey: AccentColorKey | null = null;

  private currentParams!: ThemeParams;
  private baseThemeParams!: ThemeParams;
  private flavorParams: any;

  constructor() {
    this.activeTheme = 'midnight';
    this.activeFlavor = 'balanced';
    this.selectedColorKey = null;

    // Let the Theme class handle everything - it knows how to load and combine data correctly
    const theme = new Theme('midnight');
    this.currentParams = theme.getDefaultParams('balanced');
    this.baseThemeParams = { ...this.currentParams };

    // We might not even need flavorParams if Theme class handles it
    this.flavorParams = {}; // Or remove this entirely
  }
  private loadThemeAndFlavor(themeKey: ThemeKey, flavorKey: FlavorKey) {
    const theme = themeLoader.getTheme(themeKey);

    const flavor =
      themeLoader.getThemeFlavor(themeKey, flavorKey) || themeLoader.getFlavor(flavorKey);

    const oldAccentHue = this.currentParams?.accentHue || 0;
    const newAccentHue = flavor.accentHue;

    this.baseThemeParams = {
      bgHue: theme.bgHue,
      bgSat: theme.bgSat,
      bgLight: theme.bgLight,
      accentHue: flavor.accentHue,
      accentSat: flavor.accentSat,
      accentLight: flavor.accentLight,
      commentLight: flavor.commentLight,
      colorAdjustments: {},
    };

    this.flavorParams = { ...flavor };

    this.initializeThemeColorAdjustments(themeKey);

    if (this.currentParams?.colorAdjustments && oldAccentHue !== newAccentHue) {
      const preservedAdjustments = { ...this.currentParams.colorAdjustments };

      Object.keys(preservedAdjustments).forEach((colorKey) => {
        const adjustment = preservedAdjustments[colorKey as AccentColorKey];
        if (adjustment) {
          this.baseThemeParams.colorAdjustments![colorKey as AccentColorKey] = { ...adjustment };
        }
      });
    } else if (this.currentParams?.colorAdjustments) {
      this.baseThemeParams.colorAdjustments = { ...this.currentParams.colorAdjustments };
    }

    this.currentParams = { ...this.baseThemeParams };
  }

  private initializeThemeColorAdjustments(themeKey: ThemeKey) {
    const colorKeys: AccentColorKey[] = [
      'base08',
      'base09',
      'base0A',
      'base0B',
      'base0C',
      'base0D',
      'base0E',
      'base0F',
    ];

    const standardOffsets = [0, 30, 60, 150, 180, 210, 270, 330];

    colorKeys.forEach((colorKey, index) => {
      const themeOffset = this.getThemeOffsetForKey(themeKey, colorKey);
      const standardOffset = standardOffsets[index];
      const themeIntendedAdjustment = themeOffset - standardOffset;

      if (themeIntendedAdjustment !== 0) {
        if (!this.baseThemeParams.colorAdjustments) {
          this.baseThemeParams.colorAdjustments = {};
        }
        this.baseThemeParams.colorAdjustments[colorKey] = {
          hueOffset: themeIntendedAdjustment,
        };
      }
    });
  }

  private getThemeOffsetForKey(themeKey: ThemeKey, colorKey: AccentColorKey): number {
    const themeDefinition = themeLoader.getThemeDefinition(themeKey);

    if (themeDefinition?.accentOffsets) {
      const offsets = themeDefinition.accentOffsets;
      const offsetMap = {
        base08: offsets.red?.hue ?? 0,
        base09: offsets.orange?.hue ?? 0,
        base0A: offsets.yellow?.hue ?? 0,
        base0B: offsets.green?.hue ?? 0,
        base0C: offsets.cyan?.hue ?? 0,
        base0D: offsets.blue?.hue ?? 0,
        base0E: offsets.purple?.hue ?? 0,
        base0F: offsets.pink?.hue ?? 0,
      };

      return offsetMap[colorKey] ?? 0;
    }

    return 0;
  }

  switchTheme(themeKey: ThemeKey) {
    console.log(`ThemeManager: Switching to theme ${themeKey}`);
    this.activeTheme = themeKey;
    this.loadThemeAndFlavor(themeKey, this.activeFlavor);
  }

  switchFlavor(flavorKey: FlavorKey) {
    console.log(`ThemeManager: Switching to flavor ${flavorKey}`);
    this.activeFlavor = flavorKey;
    this.loadThemeAndFlavor(this.activeTheme, flavorKey);
  }

  updateBackgroundHue(value: number) {
    this.currentParams.bgHue = value;
  }

  updateBackgroundSat(value: number) {
    this.currentParams.bgSat = value;
  }

  updateBackgroundLight(value: number) {
    this.currentParams.bgLight = value;
  }

  updateAccentHue(value: number) {
    const oldAccentHue = this.currentParams.accentHue;
    const hueChange = value - oldAccentHue;

    this.currentParams.accentHue = value;

    if (this.currentParams.colorAdjustments) {
      Object.keys(this.currentParams.colorAdjustments).forEach((colorKey) => {
        const adjustment = this.currentParams.colorAdjustments![colorKey as AccentColorKey];
        if (adjustment) {
          const currentAbsoluteHue = oldAccentHue + adjustment.hueOffset;
          let newAbsoluteHue = currentAbsoluteHue + hueChange;

          while (newAbsoluteHue < 0) newAbsoluteHue += 360;
          while (newAbsoluteHue >= 360) newAbsoluteHue -= 360;

          let newOffset = newAbsoluteHue - value;

          while (newOffset > 180) newOffset -= 360;
          while (newOffset <= -180) newOffset += 360;

          adjustment.hueOffset = newOffset;
        }
      });
    }
  }

  updateAccentSat(value: number) {
    this.currentParams.accentSat = value;
  }

  updateAccentLight(value: number) {
    this.currentParams.accentLight = value;
  }

  updateCommentLight(value: number) {
    this.currentParams.commentLight = value;
  }

  setSelectedColor(colorKey: AccentColorKey | null) {
    this.selectedColorKey = colorKey;
  }

  getColorAdjustment(colorKey: AccentColorKey): number {
    return this.currentParams.colorAdjustments?.[colorKey]?.hueOffset ?? 0;
  }

  getThemeOffset(colorKey: AccentColorKey): number {
    // This should return the theme's offset from standard Base16 position
    // The theme JSON contains raw offsets, so we return them directly
    const themeDefinition = themeLoader.getThemeDefinition(this.activeTheme);

    if (themeDefinition?.accentOffsets) {
      const offsets = themeDefinition.accentOffsets;
      const offsetMap = {
        base08: offsets.red?.hue ?? 0,
        base09: offsets.orange?.hue ?? 0,
        base0A: offsets.yellow?.hue ?? 0,
        base0B: offsets.green?.hue ?? 0,
        base0C: offsets.cyan?.hue ?? 0,
        base0D: offsets.blue?.hue ?? 0,
        base0E: offsets.purple?.hue ?? 0,
        base0F: offsets.pink?.hue ?? 0,
      };

      return offsetMap[colorKey] ?? 0;
    }

    return 0;
  }

  updateColorAdjustment(colorKey: AccentColorKey, hueOffset: number) {
    if (!this.currentParams.colorAdjustments) {
      this.currentParams.colorAdjustments = {};
    }
    const clampedOffset = Math.max(-180, Math.min(180, hueOffset));
    this.currentParams.colorAdjustments[colorKey] = { hueOffset: clampedOffset };
  }

  resetColorAdjustment(colorKey: AccentColorKey) {
    if (this.currentParams.colorAdjustments?.[colorKey]) {
      delete this.currentParams.colorAdjustments[colorKey];
    }
  }

  resetColorToDefault(colorKey: AccentColorKey) {
    this.resetColorAdjustment(colorKey);
  }

  resetToTheme() {
    console.log('RESET: Resetting to theme default');

    // Just reload the theme with balanced flavor and no customizations
    this.activeFlavor = 'balanced';
    this.selectedColorKey = null;

    // Get the default values from JSON
    const theme = themeLoader.getTheme(this.activeTheme);
    const flavor =
      themeLoader.getThemeFlavor(this.activeTheme, 'balanced') || themeLoader.getFlavor('balanced');

    // Set to exactly what's in the JSON files - no calculations, no adjustments
    this.currentParams = {
      bgHue: theme.bgHue,
      bgSat: theme.bgSat,
      bgLight: theme.bgLight,
      accentHue: flavor.accentHue,
      accentSat: flavor.accentSat,
      accentLight: flavor.accentLight,
      commentLight: flavor.commentLight,
      colorAdjustments: {}, // No user customizations
    };

    this.baseThemeParams = { ...this.currentParams };
    this.flavorParams = { ...flavor };

    console.log('RESET: After - currentParams:', JSON.stringify(this.currentParams, null, 2));
  }

  resetToFlavor() {
    console.log('RESET: Resetting to flavor default');

    this.selectedColorKey = null;

    // Get the default values from JSON for current theme + current flavor
    const theme = themeLoader.getTheme(this.activeTheme);
    const flavor =
      themeLoader.getThemeFlavor(this.activeTheme, this.activeFlavor) ||
      themeLoader.getFlavor(this.activeFlavor);

    // Set to exactly what's in the JSON files
    this.currentParams = {
      bgHue: theme.bgHue,
      bgSat: theme.bgSat,
      bgLight: theme.bgLight,
      accentHue: flavor.accentHue,
      accentSat: flavor.accentSat,
      accentLight: flavor.accentLight,
      commentLight: flavor.commentLight,
      colorAdjustments: {}, // No user customizations
    };

    this.baseThemeParams = { ...this.currentParams };
    this.flavorParams = { ...flavor };

    console.log('RESET: After - currentParams:', JSON.stringify(this.currentParams, null, 2));
  }
  getCurrentColors(): Base24Colors {
    const offsetsArray = this.getAccentOffsetsArray();
    console.log('COLOR_DEBUG: Theme:', this.activeTheme);
    console.log('COLOR_DEBUG: Flavor:', this.activeFlavor);
    console.log('COLOR_DEBUG: AccentHue:', this.currentParams.accentHue);
    console.log('COLOR_DEBUG: OffsetsArray:', offsetsArray);
    console.log('COLOR_DEBUG: ColorAdjustments:', this.currentParams.colorAdjustments);

    const colors = generateColors(this.currentParams, offsetsArray);

    // Log some specific colors
    console.log('COLOR_DEBUG: Generated base0A (yellow):', colors.base0A);
    console.log('COLOR_DEBUG: Generated base0B (green):', colors.base0B);

    return colors;
  }

  private getAccentOffsetsArray(): number[] {
    const standardOffsets = [0, 30, 60, 150, 180, 210, 270, 330];
    const themeDefinition = themeLoader.getThemeDefinition(this.activeTheme);

    if (themeDefinition?.accentOffsets) {
      const themeOffsets = themeDefinition.accentOffsets;
      return [
        standardOffsets[0] + (themeOffsets.red?.hue ?? 0),
        standardOffsets[1] + (themeOffsets.orange?.hue ?? 0),
        standardOffsets[2] + (themeOffsets.yellow?.hue ?? 0),
        standardOffsets[3] + (themeOffsets.green?.hue ?? 0),
        standardOffsets[4] + (themeOffsets.cyan?.hue ?? 0),
        standardOffsets[5] + (themeOffsets.blue?.hue ?? 0),
        standardOffsets[6] + (themeOffsets.purple?.hue ?? 0),
        standardOffsets[7] + (themeOffsets.pink?.hue ?? 0),
      ];
    }

    return standardOffsets;
  }

  getCurrentParams(): ThemeParams {
    return { ...this.currentParams };
  }

  getThemeInfo(): BaseTheme {
    return themeLoader.getTheme(this.activeTheme);
  }

  getAllThemeKeys(): ThemeKey[] {
    return themeLoader.getAllThemeKeys();
  }

  getAllFlavorKeys(): FlavorKey[] {
    return themeLoader.getAllFlavorKeys();
  }

  private getFinalHueForColor(colorKey: AccentColorKey): number {
    const baseHue = this.currentParams.accentHue || 0;

    const themeDefinition = themeLoader.getThemeDefinition(this.activeTheme);
    let themeOffset = 0;

    if (themeDefinition?.accentOffsets) {
      const offsets = themeDefinition.accentOffsets;
      const offsetMap = {
        base08: offsets.red?.hue ?? 0,
        base09: offsets.orange?.hue ?? 0,
        base0A: offsets.yellow?.hue ?? 0,
        base0B: offsets.green?.hue ?? 0,
        base0C: offsets.cyan?.hue ?? 0,
        base0D: offsets.blue?.hue ?? 0,
        base0E: offsets.purple?.hue ?? 0,
        base0F: offsets.pink?.hue ?? 0,
      };

      themeOffset = offsetMap[colorKey] ?? 0;
    } else {
      const standardOffsets = [0, 30, 60, 150, 180, 210, 270, 330];
      const colorIndex = [
        'base08',
        'base09',
        'base0A',
        'base0B',
        'base0C',
        'base0D',
        'base0E',
        'base0F',
      ].indexOf(colorKey);
      themeOffset = standardOffsets[colorIndex] || 0;
    }

    const customOffset = this.getColorAdjustment(colorKey);
    let finalHue = baseHue + themeOffset + customOffset;

    while (finalHue < 0) finalHue += 360;
    while (finalHue >= 360) finalHue -= 360;

    return Math.round(finalHue);
  }

  exportNeovim(): string {
    const colors = this.getCurrentColors();
    const themeInfo = this.getThemeInfo();
    return createNvimTheme(colors, themeInfo.name, this.activeFlavor);
  }

  exportBase24(): string {
    const colors = this.getCurrentColors();
    const themeInfo = this.getThemeInfo();
    return createBase24Json(colors, themeInfo.name);
  }

  exportStylix(): string {
    const colors = this.getCurrentColors();
    const themeInfo = this.getThemeInfo();
    return createStylixTheme(colors, themeInfo.name, this.activeFlavor);
  }

  exportThemeDefinition(): string {
    const themeInfo = this.getThemeInfo();
    return createThemeJson(
      this.currentParams,
      `Lumina ${themeInfo.name}`,
      themeInfo.tagline,
      themeInfo.inspirations,
      this.activeFlavor
    );
  }

  exportThemeJson(): string {
    const themeInfo = this.getThemeInfo();

    // Get all current color adjustments and convert them to theme offset format
    const accentOffsets = {
      red: { hue: this.getFinalOffsetForColor('base08') },
      orange: { hue: this.getFinalOffsetForColor('base09') },
      yellow: { hue: this.getFinalOffsetForColor('base0A') },
      green: { hue: this.getFinalOffsetForColor('base0B') },
      cyan: { hue: this.getFinalOffsetForColor('base0C') },
      blue: { hue: this.getFinalOffsetForColor('base0D') },
      purple: { hue: this.getFinalOffsetForColor('base0E') },
      pink: { hue: this.getFinalOffsetForColor('base0F') },
    };

    // Create flavors object with current params for active flavor
    const flavors = {
      muted:
        this.activeFlavor === 'muted'
          ? {
              accentHue: this.currentParams.accentHue,
              accentSat: this.currentParams.accentSat,
              accentLight: this.currentParams.accentLight,
              commentLight: this.currentParams.commentLight,
            }
          : this.flavorParams.muted || {
              accentHue: 0,
              accentSat: 85,
              accentLight: 75,
              commentLight: 55,
            },
      balanced:
        this.activeFlavor === 'balanced'
          ? {
              accentHue: this.currentParams.accentHue,
              accentSat: this.currentParams.accentSat,
              accentLight: this.currentParams.accentLight,
              commentLight: this.currentParams.commentLight,
            }
          : this.flavorParams.balanced || {
              accentHue: 0,
              accentSat: 95,
              accentLight: 60,
              commentLight: 55,
            },
      bold:
        this.activeFlavor === 'bold'
          ? {
              accentHue: this.currentParams.accentHue,
              accentSat: this.currentParams.accentSat,
              accentLight: this.currentParams.accentLight,
              commentLight: this.currentParams.commentLight,
            }
          : this.flavorParams.bold || {
              accentHue: 0,
              accentSat: 100,
              accentLight: 50,
              commentLight: 60,
            },
    };

    const themeDefinition = {
      name: themeInfo.name,
      tagline: themeInfo.tagline,
      inspirations: themeInfo.inspirations,
      bgHue: this.currentParams.bgHue,
      bgSat: this.currentParams.bgSat,
      bgLight: this.currentParams.bgLight,
      accentOffsets,
      flavors,
    };

    return JSON.stringify(themeDefinition, null, 2);
  }

  private getFinalOffsetForColor(colorKey: AccentColorKey): number {
    const standardOffsets = [0, 30, 60, 150, 180, 210, 270, 330];
    const colorIndex = [
      'base08',
      'base09',
      'base0A',
      'base0B',
      'base0C',
      'base0D',
      'base0E',
      'base0F',
    ].indexOf(colorKey);

    const standardOffset = standardOffsets[colorIndex];
    const themeOffset = this.getThemeOffsetForKey(this.activeTheme, colorKey);
    const userAdjustment = this.currentParams.colorAdjustments?.[colorKey]?.hueOffset ?? 0;

    return themeOffset + userAdjustment;
  }
}
