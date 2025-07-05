import { themeLoader } from '../utils/themeLoader.ts';
import { generateColors } from '../utils/colorUtils.ts';
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
    this.loadThemeAndFlavor('midnight', 'balanced');
  }

  private loadThemeAndFlavor(themeKey: ThemeKey, flavorKey: FlavorKey) {
    const theme = themeLoader.getTheme(themeKey);

    // Try to get flavor from theme definition first, then fall back to default
    const flavor =
      themeLoader.getThemeFlavor(themeKey, flavorKey) || themeLoader.getFlavor(flavorKey);

    // Store old accent hue to calculate proportional movement for existing adjustments
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

    // Preserve existing color adjustments when switching themes/flavors
    if (this.currentParams?.colorAdjustments && oldAccentHue !== newAccentHue) {
      const preservedAdjustments = { ...this.currentParams.colorAdjustments };

      Object.keys(preservedAdjustments).forEach((colorKey) => {
        const adjustment = preservedAdjustments[colorKey as AccentColorKey];
        if (adjustment) {
          // Custom offsets stay the same - they're relative to the calculated color
          this.baseThemeParams.colorAdjustments![colorKey as AccentColorKey] = { ...adjustment };
        }
      });
    } else if (this.currentParams?.colorAdjustments) {
      this.baseThemeParams.colorAdjustments = { ...this.currentParams.colorAdjustments };
    }

    this.currentParams = { ...this.baseThemeParams };
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

    // Move all adjusted colors proportionally with the accent hue change
    if (this.currentParams.colorAdjustments) {
      Object.keys(this.currentParams.colorAdjustments).forEach((colorKey) => {
        const adjustment = this.currentParams.colorAdjustments![colorKey as AccentColorKey];
        if (adjustment) {
          const currentAbsoluteHue = oldAccentHue + adjustment.hueOffset;
          let newAbsoluteHue = currentAbsoluteHue + hueChange;

          while (newAbsoluteHue < 0) newAbsoluteHue += 360;
          while (newAbsoluteHue >= 360) newAbsoluteHue -= 360;

          let newOffset = newAbsoluteHue - value;

          // Normalize to shortest path
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

  resetToFlavor() {
    this.loadThemeAndFlavor(this.activeTheme, this.activeFlavor);
  }

  resetToTheme() {
    this.loadThemeAndFlavor(this.activeTheme, 'balanced');
    this.activeFlavor = 'balanced';
  }

  getCurrentColors(): Base24Colors {
    // Get theme-specific accent offsets
    const themeDefinition = themeLoader.getThemeDefinition(this.activeTheme);
    let accentOffsets: number[] = [0, 30, 60, 150, 180, 210, 270, 330]; // Default Base16 offsets

    if (themeDefinition?.accentOffsets) {
      // Use theme's hue values instead of offset values
      const offsets = themeDefinition.accentOffsets;
      accentOffsets = [
        offsets.red?.hue ?? 0,
        offsets.orange?.hue ?? 30,
        offsets.yellow?.hue ?? 60,
        offsets.green?.hue ?? 150,
        offsets.cyan?.hue ?? 180,
        offsets.blue?.hue ?? 210,
        offsets.purple?.hue ?? 270,
        offsets.pink?.hue ?? 330,
      ];
    }

    return generateColors(this.currentParams, accentOffsets);
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

    // Get theme-specific offsets
    const themeDefinition = themeLoader.getThemeDefinition(this.activeTheme);
    let themeOffset = 0;

    if (themeDefinition?.accentOffsets) {
      const offsets = themeDefinition.accentOffsets;
      const offsetMap = {
        base08: offsets.red?.hue ?? 0,
        base09: offsets.orange?.hue ?? 30,
        base0A: offsets.yellow?.hue ?? 60,
        base0B: offsets.green?.hue ?? 150,
        base0C: offsets.cyan?.hue ?? 180,
        base0D: offsets.blue?.hue ?? 210,
        base0E: offsets.purple?.hue ?? 270,
        base0F: offsets.pink?.hue ?? 330,
      };

      themeOffset = offsetMap[colorKey] ?? 0;
    } else {
      // Fallback to default offsets
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
    return createThemeJson(
      this.currentParams,
      `Lumina ${themeInfo.name}`,
      themeInfo.tagline,
      themeInfo.inspirations,
      this.activeFlavor
    );
  }

  exportRawData(): string {
    return JSON.stringify(
      {
        activeTheme: this.activeTheme,
        activeFlavor: this.activeFlavor,
        params: this.currentParams,
        colors: this.getCurrentColors(),
      },
      null,
      2
    );
  }
}
