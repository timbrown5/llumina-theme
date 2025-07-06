import { themeLoader } from '../utils/themeLoader.ts';
import {
  generateColors,
  getThemeOffset,
  getFinalHue,
  getCombinedOffsets,
  getUserAdjustment,
  getStandardOffset,
} from '../utils/colorUtils.ts';
import { Theme } from './Theme.ts';

import {
  exportNeovimTheme,
  exportBase24Theme,
  exportStylixTheme,
  exportThemeDefinition,
  exportThemeParams,
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

    const theme = new Theme('midnight');
    this.currentParams = theme.getDefaultParams('balanced');
    this.baseThemeParams = { ...this.currentParams };

    this.flavorParams = {};
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
    // Don't initialize any color adjustments - theme offsets are handled in colorUtils
    // Only user-made adjustments should be stored in colorAdjustments
    // Theme offsets are applied automatically in the color generation process
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
    return getUserAdjustment(this.currentParams, colorKey);
  }

  getThemeOffset(colorKey: AccentColorKey): number {
    return getThemeOffset(this.activeTheme, colorKey);
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

    this.activeFlavor = 'balanced';
    this.selectedColorKey = null;

    const theme = themeLoader.getTheme(this.activeTheme);
    const flavor =
      themeLoader.getThemeFlavor(this.activeTheme, 'balanced') || themeLoader.getFlavor('balanced');

    this.currentParams = {
      bgHue: theme.bgHue,
      bgSat: theme.bgSat,
      bgLight: theme.bgLight,
      accentHue: flavor.accentHue,
      accentSat: flavor.accentSat,
      accentLight: flavor.accentLight,
      commentLight: flavor.commentLight,
      colorAdjustments: {},
    };

    this.baseThemeParams = { ...this.currentParams };
    this.flavorParams = { ...flavor };

    console.log('RESET: After - currentParams:', JSON.stringify(this.currentParams, null, 2));
  }

  resetToFlavor() {
    console.log('RESET: Resetting to flavor default');

    this.selectedColorKey = null;

    const theme = themeLoader.getTheme(this.activeTheme);
    const flavor =
      themeLoader.getThemeFlavor(this.activeTheme, this.activeFlavor) ||
      themeLoader.getFlavor(this.activeFlavor);

    this.currentParams = {
      bgHue: theme.bgHue,
      bgSat: theme.bgSat,
      bgLight: theme.bgLight,
      accentHue: flavor.accentHue,
      accentSat: flavor.accentSat,
      accentLight: flavor.accentLight,
      commentLight: flavor.commentLight,
      colorAdjustments: {},
    };

    this.baseThemeParams = { ...this.currentParams };
    this.flavorParams = { ...flavor };

    console.log('RESET: After - currentParams:', JSON.stringify(this.currentParams, null, 2));
  }

  getCurrentColors(): Base24Colors {
    console.log('COLOR_DEBUG: Theme:', this.activeTheme);
    console.log('COLOR_DEBUG: Flavor:', this.activeFlavor);
    console.log('COLOR_DEBUG: AccentHue:', this.currentParams.accentHue);
    console.log('COLOR_DEBUG: ColorAdjustments:', this.currentParams.colorAdjustments);

    const colors = generateColors(this.currentParams, this.activeTheme);

    console.log('COLOR_DEBUG: Generated base0A (yellow):', colors.base0A);
    console.log('COLOR_DEBUG: Generated base0B (green):', colors.base0B);

    return colors;
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

  exportNeovim(): string {
    const themeInfo = this.getThemeInfo();
    return exportNeovimTheme(
      this.currentParams,
      this.activeTheme,
      themeInfo.name,
      this.activeFlavor
    );
  }

  exportBase24(): string {
    const themeInfo = this.getThemeInfo();
    return exportBase24Theme(this.currentParams, this.activeTheme, themeInfo.name);
  }

  exportStylix(): string {
    const themeInfo = this.getThemeInfo();
    return exportStylixTheme(
      this.currentParams,
      this.activeTheme,
      themeInfo.name,
      this.activeFlavor
    );
  }

  exportThemeDefinition(): string {
    const themeInfo = this.getThemeInfo();
    return exportThemeDefinition(
      this.currentParams,
      this.activeTheme,
      `Lumina ${themeInfo.name}`,
      themeInfo.tagline,
      themeInfo.inspirations,
      this.activeFlavor
    );
  }

  exportThemeJson(): string {
    const themeInfo = this.getThemeInfo();
    return exportThemeParams(
      this.currentParams,
      this.activeTheme,
      this.activeFlavor,
      themeInfo,
      this.flavorParams
    );
  }
}
