/**
 * Central state manager for theme data, user customizations, and persistence.
 * Handles theme/flavor switching while preserving user work across sessions.
 */

import { themeLoader } from '../utils/themeLoader.ts';
import { generateColors, getThemeOffset, getUserAdjustment } from '../utils/colorUtils.ts';
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

interface PersistedState {
  activeTheme: ThemeKey;
  activeFlavor: FlavorKey;
  currentParams: ThemeParams;
  version: string;
}

const STATE_VERSION = '1.0';

export class ThemeManager {
  public activeTheme: ThemeKey = 'midnight';
  public activeFlavor: FlavorKey = 'balanced';
  public selectedColorKey: AccentColorKey | null = null;

  private currentParams!: ThemeParams;
  private baseThemeParams!: ThemeParams;
  private flavorParams: any;

  /**
   * Initializes with either restored state or defaults.
   */
  constructor() {
    console.log('ThemeManager: Constructor called');

    if (this.restoreFromStorage()) {
      console.log('ThemeManager: Restored from storage');
      return;
    }

    console.log('ThemeManager: Using defaults');
    this.activeTheme = 'midnight';
    this.activeFlavor = 'balanced';
    this.selectedColorKey = null;

    const theme = new Theme('midnight');
    this.currentParams = theme.getDefaultParams('balanced');
    this.baseThemeParams = { ...this.currentParams };
    this.flavorParams = {};

    this.saveToStorage();
  }

  /**
   * Persists current theme state for session continuity.
   */
  private saveToStorage() {
    try {
      const state: PersistedState = {
        activeTheme: this.activeTheme,
        activeFlavor: this.activeFlavor,
        currentParams: this.currentParams,
        version: STATE_VERSION,
      };

      if (typeof window !== 'undefined') {
        (window as any).__luminaThemeState = state;
      }

      console.log('ThemeManager: State saved', state);
    } catch (error) {
      console.warn('ThemeManager: Failed to save state:', error);
    }
  }

  /**
   * Attempts to restore theme state from previous session.
   * @returns True if state was successfully restored
   */
  private restoreFromStorage(): boolean {
    try {
      if (typeof window === 'undefined') return false;

      const state = (window as any).__luminaThemeState as PersistedState;
      if (!state || state.version !== STATE_VERSION) {
        console.log('ThemeManager: No valid state found or version mismatch');
        return false;
      }

      if (!this.isValidState(state)) {
        console.warn('ThemeManager: Invalid state, using defaults');
        return false;
      }

      this.activeTheme = state.activeTheme;
      this.activeFlavor = state.activeFlavor;
      this.currentParams = { ...state.currentParams };
      this.baseThemeParams = { ...state.currentParams };
      this.selectedColorKey = null;

      const flavor =
        themeLoader.getThemeFlavor(this.activeTheme, this.activeFlavor) ||
        themeLoader.getFlavor(this.activeFlavor);
      this.flavorParams = { ...flavor };

      console.log('ThemeManager: Successfully restored state');
      return true;
    } catch (error) {
      console.warn('ThemeManager: Failed to restore state:', error);
      return false;
    }
  }

  /**
   * Validates persisted state structure and content.
   * @param state - The state object to validate
   * @returns True if state is valid and safe to use
   */
  private isValidState(state: PersistedState): boolean {
    if (!state.activeTheme || !state.activeFlavor || !state.currentParams) {
      return false;
    }

    const validThemes = themeLoader.getAllThemeKeys();
    const validFlavors = themeLoader.getAllFlavorKeys();

    if (!validThemes.includes(state.activeTheme) || !validFlavors.includes(state.activeFlavor)) {
      return false;
    }

    const required = [
      'bgHue',
      'bgSat',
      'bgLight',
      'accentHue',
      'accentSat',
      'accentLight',
      'commentLight',
    ];
    return required.every(
      (field) => typeof state.currentParams[field as keyof ThemeParams] === 'number'
    );
  }

  /**
   * Loads theme and flavor data, preserving user customizations.
   * @param themeKey - The theme to load
   * @param flavorKey - The flavor variation to load
   */
  private loadThemeAndFlavor(themeKey: ThemeKey, flavorKey: FlavorKey) {
    const theme = themeLoader.getTheme(themeKey);
    const flavor =
      themeLoader.getThemeFlavor(themeKey, flavorKey) || themeLoader.getFlavor(flavorKey);

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

    if (this.currentParams?.colorAdjustments) {
      this.baseThemeParams.colorAdjustments = { ...this.currentParams.colorAdjustments };
    }

    this.currentParams = { ...this.baseThemeParams };
    this.saveToStorage();
  }

  /**
   * Switches to a new theme while preserving user customizations.
   * @param themeKey - The theme to switch to
   */
  switchTheme(themeKey: ThemeKey) {
    console.log(`ThemeManager: Switching to theme ${themeKey}`);
    this.activeTheme = themeKey;
    this.loadThemeAndFlavor(themeKey, this.activeFlavor);
  }

  /**
   * Switches flavor while preserving all user customizations.
   * Only updates saturation/lightness from flavor, keeps hue adjustments.
   * @param flavorKey - The flavor to switch to (muted/balanced/bold)
   */
  switchFlavor(flavorKey: FlavorKey) {
    console.log(`ThemeManager: Switching to flavor ${flavorKey} (preserving customizations)`);

    const userCustomizations = {
      bgHue: this.currentParams.bgHue,
      bgSat: this.currentParams.bgSat,
      bgLight: this.currentParams.bgLight,
      accentHue: this.currentParams.accentHue,
      colorAdjustments: this.currentParams.colorAdjustments
        ? { ...this.currentParams.colorAdjustments }
        : {},
    };

    console.log('ThemeManager: Preserving customizations:', userCustomizations);

    this.activeFlavor = flavorKey;

    const flavor =
      themeLoader.getThemeFlavor(this.activeTheme, flavorKey) || themeLoader.getFlavor(flavorKey);
    this.flavorParams = { ...flavor };

    this.currentParams = {
      ...this.currentParams,
      accentSat: flavor.accentSat,
      accentLight: flavor.accentLight,
      commentLight: flavor.commentLight,
      bgHue: userCustomizations.bgHue,
      bgSat: userCustomizations.bgSat,
      bgLight: userCustomizations.bgLight,
      accentHue: userCustomizations.accentHue,
      colorAdjustments: userCustomizations.colorAdjustments,
    };

    this.baseThemeParams = { ...this.currentParams };

    console.log('ThemeManager: After flavor switch:', this.currentParams);
    this.saveToStorage();
  }

  /**
   * Updates background hue parameter.
   * @param value - New background hue (0-360)
   */
  updateBackgroundHue(value: number) {
    this.currentParams.bgHue = value;
    this.saveToStorage();
  }

  /**
   * Updates background saturation parameter.
   * @param value - New background saturation (0-100)
   */
  updateBackgroundSat(value: number) {
    this.currentParams.bgSat = value;
    this.saveToStorage();
  }

  /**
   * Updates background lightness parameter.
   * @param value - New background lightness (0-100)
   */
  updateBackgroundLight(value: number) {
    this.currentParams.bgLight = value;
    this.saveToStorage();
  }

  /**
   * Updates main accent hue and rotates individual color adjustments proportionally.
   * Maintains relative color relationships when shifting the entire palette.
   * @param value - New accent hue value (0-360)
   */
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

    this.saveToStorage();
  }

  /**
   * Updates accent saturation parameter.
   * @param value - New accent saturation (0-100)
   */
  updateAccentSat(value: number) {
    this.currentParams.accentSat = value;
    this.saveToStorage();
  }

  /**
   * Updates accent lightness parameter.
   * @param value - New accent lightness (0-100)
   */
  updateAccentLight(value: number) {
    this.currentParams.accentLight = value;
    this.saveToStorage();
  }

  /**
   * Updates comment lightness parameter.
   * @param value - New comment lightness (0-100)
   */
  updateCommentLight(value: number) {
    this.currentParams.commentLight = value;
    this.saveToStorage();
  }

  /**
   * Sets the currently selected color for editing.
   * @param colorKey - The accent color to select, or null to deselect
   */
  setSelectedColor(colorKey: AccentColorKey | null) {
    this.selectedColorKey = colorKey;
  }

  /**
   * Gets the current user adjustment for a specific accent color.
   * @param colorKey - The accent color to query
   * @returns The hue offset in degrees
   */
  getColorAdjustment(colorKey: AccentColorKey): number {
    return getUserAdjustment(this.currentParams, colorKey);
  }

  /**
   * Gets the theme-specific offset for an accent color.
   * @param colorKey - The accent color to query
   * @returns The theme's hue offset for this color
   */
  getThemeOffset(colorKey: AccentColorKey): number {
    return getThemeOffset(this.activeTheme, colorKey);
  }

  /**
   * Updates the user's hue adjustment for a specific accent color.
   * @param colorKey - The accent color to adjust
   * @param hueOffset - The hue adjustment in degrees (-180 to +180)
   */
  updateColorAdjustment(colorKey: AccentColorKey, hueOffset: number) {
    if (!this.currentParams.colorAdjustments) {
      this.currentParams.colorAdjustments = {};
    }
    const clampedOffset = Math.max(-180, Math.min(180, hueOffset));
    this.currentParams.colorAdjustments[colorKey] = { hueOffset: clampedOffset };
    this.saveToStorage();
  }

  /**
   * Removes user adjustment for a specific accent color.
   * @param colorKey - The accent color to reset
   */
  resetColorAdjustment(colorKey: AccentColorKey) {
    if (this.currentParams.colorAdjustments?.[colorKey]) {
      delete this.currentParams.colorAdjustments[colorKey];
      this.saveToStorage();
    }
  }

  /**
   * Resets color to default (alias for resetColorAdjustment).
   * @param colorKey - The accent color to reset
   */
  resetColorToDefault(colorKey: AccentColorKey) {
    this.resetColorAdjustment(colorKey);
  }

  /**
   * Resets everything to theme defaults with balanced flavor.
   */
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
    this.saveToStorage();
    console.log('RESET: After - currentParams:', JSON.stringify(this.currentParams, null, 2));
  }

  /**
   * Resets to current flavor defaults while keeping theme selection.
   */
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
    this.saveToStorage();
    console.log('RESET: After - currentParams:', JSON.stringify(this.currentParams, null, 2));
  }

  /**
   * Clears stored state for debugging or fresh start.
   */
  clearStoredState() {
    console.log('ThemeManager: Clearing stored state');
    if (typeof window !== 'undefined') {
      delete (window as any).__luminaThemeState;
    }
  }

  /**
   * Generates complete Base24 color scheme from current parameters.
   * @returns Complete 24-color Base24 scheme ready for use
   */
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

  /**
   * Returns copy of current theme parameters.
   * @returns Current theme parameters
   */
  getCurrentParams(): ThemeParams {
    return { ...this.currentParams };
  }

  /**
   * Gets theme metadata (name, tagline, inspirations).
   * @returns Theme information object
   */
  getThemeInfo(): BaseTheme {
    return themeLoader.getTheme(this.activeTheme);
  }

  /**
   * Gets all available theme keys.
   * @returns Array of theme identifiers
   */
  getAllThemeKeys(): ThemeKey[] {
    return themeLoader.getAllThemeKeys();
  }

  /**
   * Gets all available flavor keys.
   * @returns Array of flavor identifiers
   */
  getAllFlavorKeys(): FlavorKey[] {
    return themeLoader.getAllFlavorKeys();
  }

  /**
   * Exports theme as Neovim Lua file.
   * @returns Neovim theme string
   */
  exportNeovim(): string {
    const themeInfo = this.getThemeInfo();
    return exportNeovimTheme(
      this.currentParams,
      this.activeTheme,
      themeInfo.name,
      this.activeFlavor
    );
  }

  /**
   * Exports theme as Base24 JSON.
   * @returns Base24 JSON string
   */
  exportBase24(): string {
    const themeInfo = this.getThemeInfo();
    return exportBase24Theme(this.currentParams, this.activeTheme, themeInfo.name);
  }

  /**
   * Exports theme as Stylix configuration.
   * @returns Stylix theme string
   */
  exportStylix(): string {
    const themeInfo = this.getThemeInfo();
    return exportStylixTheme(
      this.currentParams,
      this.activeTheme,
      themeInfo.name,
      this.activeFlavor
    );
  }

  /**
   * Exports theme definition for installation.
   * @returns Theme definition JSON string
   */
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

  /**
   * Exports current theme parameters as JSON.
   * @returns Theme parameters JSON string
   */
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
