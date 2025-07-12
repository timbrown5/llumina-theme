/**
 * Central state manager for theme data, user customizations, and persistence.
 *
 * Acts as the core orchestrator for all theme-related state in the application.
 * This class manages the complex interactions between base themes, flavor variants,
 * and user customizations while ensuring data persistence within browser sessions.
 * It serves as the single source of truth for theme state and provides a clean API
 * for theme manipulation.
 *
 * Key responsibilities:
 * - Theme and flavor switching with customization preservation
 * - Individual color adjustment tracking and management
 * - State persistence within browser tab using sessionStorage
 * - Export functionality for multiple output formats
 * - Graceful fallback handling for missing themes
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

interface UserThemeCustomizations {
  bgHue?: number;
  bgSat?: number;
  bgLight?: number;
  accentOffsets?: {
    red?: { hue: number };
    orange?: { hue: number };
    yellow?: { hue: number };
    green?: { hue: number };
    cyan?: { hue: number };
    blue?: { hue: number };
    purple?: { hue: number };
    pink?: { hue: number };
  };
  flavors?: {
    [flavorKey in FlavorKey]?: {
      accentHue?: number;
      accentSat?: number;
      accentLight?: number;
      commentLight?: number;
    };
  };
}

interface PersistedState {
  activeTheme: ThemeKey;
  activeFlavor: FlavorKey;
  themeCustomizations: Record<ThemeKey, UserThemeCustomizations>;
  version: string;
}

const STATE_VERSION = '3.0';
const STORAGE_KEY = 'lumina_theme_state';

export class ThemeManager {
  public activeTheme: ThemeKey = 'midnight';
  public activeFlavor: FlavorKey = 'balanced';
  public selectedColorKey: AccentColorKey | null = null;

  private themeCustomizations: Record<ThemeKey, Record<FlavorKey, ThemeParams>>;

  /**
   * Initializes with either restored state or defaults.
   */
  constructor() {
    console.log('ThemeManager: Constructor called');

    if (this.restoreFromStorage()) {
      console.log('ThemeManager: Restored from storage');
    } else {
      console.log('ThemeManager: Using defaults');
      this.initializeDefaults();
    }
  }

  /**
   * Initializes default state (empty customizations).
   */
  private initializeDefaults() {
    this.activeTheme = 'midnight';
    this.activeFlavor = 'balanced';
    this.selectedColorKey = null;
    this.themeCustomizations = {
      midnight: {},
      twilight: {},
      dawn: {},
      noon: {},
    } as Record<ThemeKey, Record<FlavorKey, ThemeParams>>;
    this.saveToStorage();
  }

  /**
   * Gets current theme definition from JSON.
   */
  private getCurrentThemeDefinition() {
    return themeLoader.getThemeDefinition(this.activeTheme);
  }

  /**
   * Gets current flavor definition from theme JSON.
   */
  private getCurrentFlavorDefinition() {
    const themeDefinition = this.getCurrentThemeDefinition();
    return themeDefinition?.flavors[this.activeFlavor];
  }

  /**
   * Gets user customizations for current theme.
   */
  private getCurrentThemeCustomizations(): UserThemeCustomizations {
    return this.themeCustomizations[this.activeTheme] || {};
  }

  /**
   * Gets user customizations for current flavor.
   */
  private getCurrentFlavorCustomizations() {
    const themeCustomizations = this.getCurrentThemeCustomizations();
    return themeCustomizations.flavors?.[this.activeFlavor] || {};
  }

  /**
   * Merges JSON defaults with user customizations to get final parameters.
   */
  private getCurrentThemeParams(): ThemeParams {
    const themeDefinition = this.getCurrentThemeDefinition();
    const flavorDefinition = this.getCurrentFlavorDefinition();
    const themeCustomizations = this.getCurrentThemeCustomizations();
    const flavorCustomizations = this.getCurrentFlavorCustomizations();

    if (!themeDefinition || !flavorDefinition) {
      throw new Error(
        `Theme or flavor definition not found for ${this.activeTheme}/${this.activeFlavor}`
      );
    }

    // Merge theme-level parameters
    const bgHue = themeCustomizations.bgHue ?? themeDefinition.bgHue;
    const bgSat = themeCustomizations.bgSat ?? themeDefinition.bgSat;
    const bgLight = themeCustomizations.bgLight ?? themeDefinition.bgLight;

    // Merge flavor-level parameters
    const accentHue = flavorCustomizations.accentHue ?? flavorDefinition.accentHue;
    const accentSat = flavorCustomizations.accentSat ?? flavorDefinition.accentSat;
    const accentLight = flavorCustomizations.accentLight ?? flavorDefinition.accentLight;
    const commentLight = flavorCustomizations.commentLight ?? flavorDefinition.commentLight;

    // Merge accent offsets
    const accentOffsets: any = {};
    const defaultOffsets = themeDefinition.accentOffsets;
    const userOffsets = themeCustomizations.accentOffsets;

    const colorMap: Record<string, AccentColorKey> = {
      red: 'base08',
      orange: 'base09',
      yellow: 'base0A',
      green: 'base0B',
      cyan: 'base0C',
      blue: 'base0D',
      purple: 'base0E',
      pink: 'base0F',
    };

    Object.entries(colorMap).forEach(([colorName, colorKey]) => {
      const defaultHue = defaultOffsets[colorName as keyof typeof defaultOffsets]?.hue || 0;
      const userHue = userOffsets?.[colorName as keyof typeof userOffsets]?.hue ?? defaultHue;

      if (userHue !== defaultHue) {
        accentOffsets[colorKey] = { hueOffset: userHue - defaultHue };
      }
    });

    return {
      bgHue,
      bgSat,
      bgLight,
      accentHue,
      accentSat,
      accentLight,
      commentLight,
      accentOffsets: Object.keys(accentOffsets).length > 0 ? accentOffsets : undefined,
    };
  }

  /**
   * Updates theme-level customizations.
   */
  private setThemeCustomization(
    key: keyof Pick<UserThemeCustomizations, 'bgHue' | 'bgSat' | 'bgLight'>,
    value: number
  ) {
    if (!this.themeCustomizations[this.activeTheme]) {
      this.themeCustomizations[this.activeTheme] = {};
    }
    this.themeCustomizations[this.activeTheme][key] = value;
    this.saveToStorage();
  }

  /**
   * Updates flavor-level customizations.
   */
  private setFlavorCustomization(
    key: keyof NonNullable<UserThemeCustomizations['flavors']>[FlavorKey],
    value: number
  ) {
    if (!this.themeCustomizations[this.activeTheme]) {
      this.themeCustomizations[this.activeTheme] = {};
    }
    if (!this.themeCustomizations[this.activeTheme].flavors) {
      this.themeCustomizations[this.activeTheme].flavors = {};
    }
    if (!this.themeCustomizations[this.activeTheme].flavors![this.activeFlavor]) {
      this.themeCustomizations[this.activeTheme].flavors![this.activeFlavor] = {};
    }
    this.themeCustomizations[this.activeTheme].flavors![this.activeFlavor]![key] = value;
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
        themeCustomizations: this.themeCustomizations,
        version: STATE_VERSION,
      };

      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      console.log('ThemeManager: State saved to sessionStorage');
    } catch (error) {
      console.warn('ThemeManager: Failed to save state to sessionStorage:', error);
    }
  }

  /**
   * Attempts to restore theme state from session storage.
   */
  private restoreFromStorage(): boolean {
    try {
      const storedData = sessionStorage.getItem(STORAGE_KEY);
      if (!storedData) {
        console.log('ThemeManager: No stored state found');
        return false;
      }

      const state = JSON.parse(storedData) as PersistedState;

      if (!this.isValidState(state)) {
        console.warn('ThemeManager: Invalid or outdated state, using defaults');
        sessionStorage.removeItem(STORAGE_KEY);
        return false;
      }

      this.activeTheme = state.activeTheme;
      this.activeFlavor = state.activeFlavor;
      this.themeCustomizations = state.themeCustomizations;
      this.selectedColorKey = null;

      console.log('ThemeManager: Successfully restored state from sessionStorage');
      return true;
    } catch (error) {
      console.warn('ThemeManager: Failed to restore state from sessionStorage:', error);
      sessionStorage.removeItem(STORAGE_KEY);
      return false;
    }
  }

  /**
   * Validates persisted state structure and content.
   */
  private isValidState(state: PersistedState): boolean {
    if (!state.version || state.version !== STATE_VERSION) {
      console.warn(
        `ThemeManager: Version mismatch. Expected ${STATE_VERSION}, got ${state.version}`
      );
      return false;
    }

    if (!state.activeTheme || !state.activeFlavor || !state.themeCustomizations) {
      console.warn('ThemeManager: Missing required state properties');
      return false;
    }

    const validThemes = themeLoader.getAllThemeKeys();
    const validFlavors = themeLoader.getAllFlavorKeys();

    if (!validThemes.includes(state.activeTheme) || !validFlavors.includes(state.activeFlavor)) {
      console.warn('ThemeManager: Invalid theme or flavor in stored state');
      return false;
    }

    return true;
  }

  /**
   * Switches to a new theme while preserving user customizations.
   */
  switchTheme(themeKey: ThemeKey) {
    console.log(`ThemeManager: Switching to theme ${themeKey}`);
    this.activeTheme = themeKey;
    this.saveToStorage();
  }

  /**
   * Switches flavor while preserving all user customizations.
   */
  switchFlavor(flavorKey: FlavorKey) {
    console.log(`ThemeManager: Switching to flavor ${flavorKey}`);
    this.activeFlavor = flavorKey;
    this.saveToStorage();
  }

  /**
   * Updates background hue parameter (theme-level).
   */
  updateBackgroundHue(value: number) {
    this.setThemeCustomization('bgHue', value);
  }

  /**
   * Updates background saturation parameter (theme-level).
   */
  updateBackgroundSat(value: number) {
    this.setThemeCustomization('bgSat', value);
  }

  /**
   * Updates background lightness parameter (theme-level).
   */
  updateBackgroundLight(value: number) {
    this.setThemeCustomization('bgLight', value);
  }

  /**
   * Updates main accent hue and rotates individual color adjustments proportionally.
   */
  updateAccentHue(value: number) {
    const currentParams = this.getCurrentThemeParams();
    const oldAccentHue = currentParams.accentHue;
    const hueChange = value - oldAccentHue;

    this.setFlavorCustomization('accentHue', value);

    // Rotate existing accent offsets
    if (currentParams.accentOffsets) {
      const themeCustomizations = this.getCurrentThemeCustomizations();
      if (!themeCustomizations.accentOffsets) {
        this.themeCustomizations[this.activeTheme].accentOffsets = {};
      }

      const colorMap: Record<
        AccentColorKey,
        keyof NonNullable<UserThemeCustomizations['accentOffsets']>
      > = {
        base08: 'red',
        base09: 'orange',
        base0A: 'yellow',
        base0B: 'green',
        base0C: 'cyan',
        base0D: 'blue',
        base0E: 'purple',
        base0F: 'pink',
      };

      Object.entries(currentParams.accentOffsets).forEach(([colorKey, adjustment]) => {
        if (adjustment) {
          const colorName = colorMap[colorKey as AccentColorKey];
          const currentAbsoluteHue = oldAccentHue + adjustment.hueOffset;
          let newAbsoluteHue = currentAbsoluteHue + hueChange;

          while (newAbsoluteHue < 0) newAbsoluteHue += 360;
          while (newAbsoluteHue >= 360) newAbsoluteHue -= 360;

          let newOffset = newAbsoluteHue - value;
          while (newOffset > 180) newOffset -= 360;
          while (newOffset <= -180) newOffset += 360;

          const themeDefinition = this.getCurrentThemeDefinition();
          const defaultOffset = themeDefinition?.accentOffsets[colorName]?.hue || 0;
          const finalOffset = defaultOffset + newOffset;

          this.themeCustomizations[this.activeTheme].accentOffsets![colorName] = {
            hue: finalOffset,
          };
        }
      });

      this.saveToStorage();
    }
  }

  /**
   * Updates accent saturation parameter (flavor-level).
   */
  updateAccentSat(value: number) {
    this.setFlavorCustomization('accentSat', value);
  }

  /**
   * Updates accent lightness parameter (flavor-level).
   */
  updateAccentLight(value: number) {
    this.setFlavorCustomization('accentLight', value);
  }

  /**
   * Updates comment lightness parameter (flavor-level).
   */
  updateCommentLight(value: number) {
    this.setFlavorCustomization('commentLight', value);
  }

  /**
   * Sets the currently selected color for editing.
   */
  setSelectedColor(colorKey: AccentColorKey | null) {
    this.selectedColorKey = colorKey;
  }

  /**
   * Gets the current user adjustment for a specific accent color.
   */
  getColorAdjustment(colorKey: AccentColorKey): number {
    return getUserAdjustment(this.getCurrentThemeParams(), colorKey);
  }

  /**
   * Gets the theme-specific offset for an accent color.
   */
  getThemeOffset(colorKey: AccentColorKey): number {
    return getThemeOffset(this.activeTheme, colorKey);
  }

  /**
   * Updates the user's hue adjustment for a specific accent color.
   */
  updateColorAdjustment(colorKey: AccentColorKey, hueOffset: number) {
    const colorMap: Record<
      AccentColorKey,
      keyof NonNullable<UserThemeCustomizations['accentOffsets']>
    > = {
      base08: 'red',
      base09: 'orange',
      base0A: 'yellow',
      base0B: 'green',
      base0C: 'cyan',
      base0D: 'blue',
      base0E: 'purple',
      base0F: 'pink',
    };

    const colorName = colorMap[colorKey];
    const themeDefinition = this.getCurrentThemeDefinition();
    const defaultOffset = themeDefinition?.accentOffsets[colorName]?.hue || 0;
    const clampedOffset = Math.max(-180, Math.min(180, hueOffset));
    const finalOffset = defaultOffset + clampedOffset;

    if (!this.themeCustomizations[this.activeTheme]) {
      this.themeCustomizations[this.activeTheme] = {};
    }
    if (!this.themeCustomizations[this.activeTheme].accentOffsets) {
      this.themeCustomizations[this.activeTheme].accentOffsets = {};
    }

    this.themeCustomizations[this.activeTheme].accentOffsets![colorName] = { hue: finalOffset };
    this.saveToStorage();
  }

  /**
   * Removes user adjustment for a specific accent color.
   */
  resetColorAdjustment(colorKey: AccentColorKey) {
    const colorMap: Record<
      AccentColorKey,
      keyof NonNullable<UserThemeCustomizations['accentOffsets']>
    > = {
      base08: 'red',
      base09: 'orange',
      base0A: 'yellow',
      base0B: 'green',
      base0C: 'cyan',
      base0D: 'blue',
      base0E: 'purple',
      base0F: 'pink',
    };

    const colorName = colorMap[colorKey];
    const themeCustomizations = this.getCurrentThemeCustomizations();

    if (themeCustomizations.accentOffsets?.[colorName]) {
      delete this.themeCustomizations[this.activeTheme].accentOffsets![colorName];

      // Clean up empty accentOffsets object
      if (Object.keys(this.themeCustomizations[this.activeTheme].accentOffsets!).length === 0) {
        delete this.themeCustomizations[this.activeTheme].accentOffsets;
      }

      this.saveToStorage();
    }
  }

  /**
   * Resets color to default (alias for resetColorAdjustment).
   */
  resetColorToDefault(colorKey: AccentColorKey) {
    this.resetColorAdjustment(colorKey);
  }

  /**
   * Resets current theme/flavor combination to its default values.
   */
  resetFlavor() {
    console.log(`RESET: Resetting ${this.activeTheme} ${this.activeFlavor} to defaults`);

    this.selectedColorKey = null;

    // Remove flavor-specific customizations
    if (this.themeCustomizations[this.activeTheme]?.flavors?.[this.activeFlavor]) {
      delete this.themeCustomizations[this.activeTheme].flavors![this.activeFlavor];

      // Clean up empty flavors object
      if (Object.keys(this.themeCustomizations[this.activeTheme].flavors!).length === 0) {
        delete this.themeCustomizations[this.activeTheme].flavors;
      }
    }

    this.saveToStorage();
  }

  /**
   * Resets entire active theme (all flavors) to default values.
   */
  resetTheme() {
    console.log(`RESET: Resetting entire ${this.activeTheme} theme to defaults`);

    this.selectedColorKey = null;

    // Remove all customizations for this theme
    delete this.themeCustomizations[this.activeTheme];

    this.saveToStorage();
  }

  /**
   * Clears stored state for debugging or fresh start.
   */
  clearStoredState() {
    console.log('ThemeManager: Clearing stored state');
    sessionStorage.removeItem(STORAGE_KEY);
  }

  /**
   * Generates complete Base24 color scheme from current parameters.
   */
  getCurrentColors(): Base24Colors {
    const params = this.getCurrentThemeParams();
    return generateColors(params, this.activeTheme);
  }

  /**
   * Returns copy of current theme parameters.
   */
  getCurrentParams(): ThemeParams {
    return { ...this.getCurrentThemeParams() };
  }

  /**
   * Gets theme metadata (name, tagline, inspirations).
   */
  getThemeInfo(): BaseTheme {
    return themeLoader.getTheme(this.activeTheme);
  }

  /**
   * Gets all available theme keys.
   */
  getAllThemeKeys(): ThemeKey[] {
    return themeLoader.getAllThemeKeys();
  }

  /**
   * Gets all available flavor keys.
   */
  getAllFlavorKeys(): FlavorKey[] {
    return themeLoader.getAllFlavorKeys();
  }

  /**
   * Gets formatted reset button labels.
   */
  getResetLabels() {
    const themeInfo = this.getThemeInfo();
    return {
      flavor: `Reset ${themeInfo.name} ${this.activeFlavor.charAt(0).toUpperCase() + this.activeFlavor.slice(1)} Flavor`,
      theme: `Reset Theme to Default`,
    };
  }

  /**
   * Exports theme as Neovim Lua file.
   */
  exportNeovim(): string {
    const themeInfo = this.getThemeInfo();
    const params = this.getCurrentThemeParams();
    return exportNeovimTheme(params, this.activeTheme, themeInfo.name, this.activeFlavor);
  }

  /**
   * Exports theme as Base24 JSON.
   */
  exportBase24(): string {
    const themeInfo = this.getThemeInfo();
    const params = this.getCurrentThemeParams();
    return exportBase24Theme(params, this.activeTheme, themeInfo.name);
  }

  /**
   * Exports theme as Stylix configuration.
   */
  exportStylix(): string {
    const themeInfo = this.getThemeInfo();
    const params = this.getCurrentThemeParams();
    return exportStylixTheme(params, this.activeTheme, themeInfo.name, this.activeFlavor);
  }

  /**
   * Exports theme definition for installation.
   */
  exportThemeDefinition(): string {
    const themeInfo = this.getThemeInfo();
    const params = this.getCurrentThemeParams();
    return exportThemeDefinition(
      params,
      this.activeTheme,
      `Lumina ${themeInfo.name}`,
      themeInfo.tagline,
      themeInfo.inspirations,
      this.activeFlavor
    );
  }

  /**
   * Exports current theme parameters as JSON.
   */
  exportThemeJson(): string {
    const themeInfo = this.getThemeInfo();
    const params = this.getCurrentThemeParams();
    const flavor =
      themeLoader.getThemeFlavor(this.activeTheme, this.activeFlavor) ||
      themeLoader.getFlavor(this.activeFlavor);
    return exportThemeParams(params, this.activeTheme, this.activeFlavor, themeInfo, flavor);
  }
}
