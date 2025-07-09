/**
 * Central state manager for theme data, user customizations, and persistence.
 *
 * Acts as the core orchestrator for all theme-related state in the application.
 * This class manages the complex interactions between base themes, flavor variants,
 * and user customizations while ensuring data persistence across sessions. It serves
 * as the single source of truth for theme state and provides a clean API for
 * theme manipulation.
 *
 * Key responsibilities:
 * - Theme and flavor switching with customization preservation
 * - Individual color adjustment tracking and management
 * - State persistence across browser sessions
 * - Force refresh detection and state clearing
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

interface PersistedState {
  activeTheme: ThemeKey;
  activeFlavor: FlavorKey;
  themeCustomizations: Record<ThemeKey, Record<FlavorKey, ThemeParams>>;
  version: string;
  sessionId: string; // Add session tracking
}

const STATE_VERSION = '2.0';
const STORAGE_KEY = 'lumina_theme_state';
const SESSION_KEY = 'lumina_session_id';

export class ThemeManager {
  public activeTheme: ThemeKey = 'midnight';
  public activeFlavor: FlavorKey = 'balanced';
  public selectedColorKey: AccentColorKey | null = null;

  // Store customizations per theme per flavor
  private themeCustomizations: Record<ThemeKey, Record<FlavorKey, ThemeParams>> = {};
  private currentSessionId: string;

  /**
   * Initializes with either restored state or defaults.
   */
  constructor() {
    console.log('ThemeManager: Constructor called');

    // Generate session ID and check for force refresh
    this.currentSessionId = this.generateSessionId();

    if (this.isForceRefresh()) {
      console.log('ThemeManager: Force refresh detected, clearing state');
      this.clearStoredState();
      this.initializeDefaults();
    } else if (this.restoreFromStorage()) {
      console.log('ThemeManager: Restored from storage');
    } else {
      console.log('ThemeManager: Using defaults');
      this.initializeDefaults();
    }

    // Store current session ID
    this.storeSessionId();
  }

  /**
   * Generates a unique session identifier.
   * @returns Random session ID string
   */
  private generateSessionId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Stores the current session ID for force refresh detection.
   */
  private storeSessionId() {
    try {
      sessionStorage.setItem(SESSION_KEY, this.currentSessionId);
    } catch (error) {
      console.warn('ThemeManager: Failed to store session ID:', error);
    }
  }

  /**
   * Detects if this is a force refresh by checking session storage.
   * Force refresh clears sessionStorage but preserves localStorage.
   * @returns True if this appears to be a force refresh
   */
  private isForceRefresh(): boolean {
    try {
      // Check if we have localStorage data but no sessionStorage
      const hasLocalStorage = localStorage.getItem(STORAGE_KEY) !== null;
      const hasSessionStorage = sessionStorage.getItem(SESSION_KEY) !== null;

      // Force refresh scenario: localStorage exists but sessionStorage is cleared
      const isForceRefresh = hasLocalStorage && !hasSessionStorage;

      if (isForceRefresh) {
        console.log(
          'ThemeManager: Force refresh detected - localStorage exists but sessionStorage cleared'
        );
      }

      return isForceRefresh;
    } catch (error) {
      console.warn('ThemeManager: Error checking for force refresh:', error);
      return false;
    }
  }

  /**
   * Initializes default state for all themes and flavors.
   */
  private initializeDefaults() {
    this.activeTheme = 'midnight';
    this.activeFlavor = 'balanced';
    this.selectedColorKey = null;
    this.themeCustomizations = {};

    // Initialize all theme/flavor combinations with defaults
    const themes = themeLoader.getAllThemeKeys();
    const flavors = themeLoader.getAllFlavorKeys();

    themes.forEach((themeKey) => {
      this.themeCustomizations[themeKey] = {};
      flavors.forEach((flavorKey) => {
        const theme = new Theme(themeKey);
        this.themeCustomizations[themeKey][flavorKey] = theme.getDefaultParams(flavorKey);
      });
    });

    this.saveToStorage();
  }

  /**
   * Gets current parameters for active theme/flavor combination.
   */
  private getCurrentThemeParams(): ThemeParams {
    return this.themeCustomizations[this.activeTheme][this.activeFlavor];
  }

  /**
   * Updates current parameters for active theme/flavor combination.
   */
  private setCurrentThemeParams(params: ThemeParams) {
    this.themeCustomizations[this.activeTheme][this.activeFlavor] = { ...params };
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
        sessionId: this.currentSessionId,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      console.log('ThemeManager: State saved to localStorage');
    } catch (error) {
      console.warn('ThemeManager: Failed to save state to localStorage:', error);
    }
  }

  /**
   * Attempts to restore theme state from previous session.
   * @returns True if state was successfully restored
   */
  private restoreFromStorage(): boolean {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      if (!storedData) {
        console.log('ThemeManager: No stored state found');
        return false;
      }

      const state = JSON.parse(storedData) as PersistedState;

      if (!this.isValidState(state)) {
        console.warn('ThemeManager: Invalid or outdated state, using defaults');
        localStorage.removeItem(STORAGE_KEY);
        return false;
      }

      this.activeTheme = state.activeTheme;
      this.activeFlavor = state.activeFlavor;
      this.themeCustomizations = state.themeCustomizations;
      this.selectedColorKey = null;

      console.log('ThemeManager: Successfully restored state from localStorage');
      return true;
    } catch (error) {
      console.warn('ThemeManager: Failed to restore state from localStorage:', error);
      localStorage.removeItem(STORAGE_KEY);
      return false;
    }
  }

  /**
   * Validates persisted state structure and content.
   * @param state - The state object to validate
   * @returns True if state is valid and safe to use
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

    // Validate that customizations exist for current theme/flavor
    if (!state.themeCustomizations[state.activeTheme]?.[state.activeFlavor]) {
      console.warn('ThemeManager: Missing customizations for active theme/flavor');
      return false;
    }

    return true;
  }

  /**
   * Switches to a new theme while preserving user customizations.
   * @param themeKey - The theme to switch to
   */
  switchTheme(themeKey: ThemeKey) {
    console.log(`ThemeManager: Switching to theme ${themeKey}`);

    // Initialize theme customizations if they don't exist
    if (!this.themeCustomizations[themeKey]) {
      this.themeCustomizations[themeKey] = {};
      const flavors = themeLoader.getAllFlavorKeys();
      flavors.forEach((flavorKey) => {
        const theme = new Theme(themeKey);
        this.themeCustomizations[themeKey][flavorKey] = theme.getDefaultParams(flavorKey);
      });
    }

    this.activeTheme = themeKey;

    // Initialize current flavor if it doesn't exist for this theme
    if (!this.themeCustomizations[themeKey][this.activeFlavor]) {
      const theme = new Theme(themeKey);
      this.themeCustomizations[themeKey][this.activeFlavor] = theme.getDefaultParams(
        this.activeFlavor
      );
    }

    this.saveToStorage();
  }

  /**
   * Switches flavor while preserving all user customizations.
   * @param flavorKey - The flavor to switch to (muted/balanced/bold)
   */
  switchFlavor(flavorKey: FlavorKey) {
    console.log(`ThemeManager: Switching to flavor ${flavorKey}`);

    // Initialize flavor customizations if they don't exist
    if (!this.themeCustomizations[this.activeTheme][flavorKey]) {
      const theme = new Theme(this.activeTheme);
      this.themeCustomizations[this.activeTheme][flavorKey] = theme.getDefaultParams(flavorKey);
    }

    this.activeFlavor = flavorKey;
    this.saveToStorage();
  }

  /**
   * Updates background hue parameter.
   * @param value - New background hue (0-360)
   */
  updateBackgroundHue(value: number) {
    const params = this.getCurrentThemeParams();
    params.bgHue = value;
    this.setCurrentThemeParams(params);
  }

  /**
   * Updates background saturation parameter.
   * @param value - New background saturation (0-100)
   */
  updateBackgroundSat(value: number) {
    const params = this.getCurrentThemeParams();
    params.bgSat = value;
    this.setCurrentThemeParams(params);
  }

  /**
   * Updates background lightness parameter.
   * @param value - New background lightness (0-100)
   */
  updateBackgroundLight(value: number) {
    const params = this.getCurrentThemeParams();
    params.bgLight = value;
    this.setCurrentThemeParams(params);
  }

  /**
   * Updates main accent hue and rotates individual color adjustments proportionally.
   * @param value - New accent hue value (0-360)
   */
  updateAccentHue(value: number) {
    const params = this.getCurrentThemeParams();
    const oldAccentHue = params.accentHue;
    const hueChange = value - oldAccentHue;

    params.accentHue = value;

    if (params.colorAdjustments) {
      Object.keys(params.colorAdjustments).forEach((colorKey) => {
        const adjustment = params.colorAdjustments![colorKey as AccentColorKey];
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

    this.setCurrentThemeParams(params);
  }

  /**
   * Updates accent saturation parameter.
   * @param value - New accent saturation (0-100)
   */
  updateAccentSat(value: number) {
    const params = this.getCurrentThemeParams();
    params.accentSat = value;
    this.setCurrentThemeParams(params);
  }

  /**
   * Updates accent lightness parameter.
   * @param value - New accent lightness (0-100)
   */
  updateAccentLight(value: number) {
    const params = this.getCurrentThemeParams();
    params.accentLight = value;
    this.setCurrentThemeParams(params);
  }

  /**
   * Updates comment lightness parameter.
   * @param value - New comment lightness (0-100)
   */
  updateCommentLight(value: number) {
    const params = this.getCurrentThemeParams();
    params.commentLight = value;
    this.setCurrentThemeParams(params);
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
    return getUserAdjustment(this.getCurrentThemeParams(), colorKey);
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
    const params = this.getCurrentThemeParams();
    if (!params.colorAdjustments) {
      params.colorAdjustments = {};
    }
    const clampedOffset = Math.max(-180, Math.min(180, hueOffset));
    params.colorAdjustments[colorKey] = { hueOffset: clampedOffset };
    this.setCurrentThemeParams(params);
  }

  /**
   * Removes user adjustment for a specific accent color.
   * @param colorKey - The accent color to reset
   */
  resetColorAdjustment(colorKey: AccentColorKey) {
    const params = this.getCurrentThemeParams();
    if (params.colorAdjustments?.[colorKey]) {
      delete params.colorAdjustments[colorKey];
      this.setCurrentThemeParams(params);
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
   * Resets current theme/flavor combination to its default values.
   */
  resetFlavor() {
    console.log(`RESET: Resetting ${this.activeTheme} ${this.activeFlavor} to defaults`);

    this.selectedColorKey = null;
    const theme = new Theme(this.activeTheme);
    const defaultParams = theme.getDefaultParams(this.activeFlavor);

    this.themeCustomizations[this.activeTheme][this.activeFlavor] = { ...defaultParams };
    this.saveToStorage();
  }

  /**
   * Resets entire active theme (all flavors) to default values.
   */
  resetTheme() {
    console.log(`RESET: Resetting entire ${this.activeTheme} theme to defaults`);

    this.selectedColorKey = null;
    const theme = new Theme(this.activeTheme);
    const flavors = themeLoader.getAllFlavorKeys();

    // Reset all flavors for this theme
    this.themeCustomizations[this.activeTheme] = {};
    flavors.forEach((flavorKey) => {
      this.themeCustomizations[this.activeTheme][flavorKey] = theme.getDefaultParams(flavorKey);
    });

    this.saveToStorage();
  }

  /**
   * Clears stored state for debugging or fresh start.
   */
  clearStoredState() {
    console.log('ThemeManager: Clearing stored state');
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(SESSION_KEY);
  }

  /**
   * Generates complete Base24 color scheme from current parameters.
   * @returns Complete 24-color Base24 scheme ready for use
   */
  getCurrentColors(): Base24Colors {
    const params = this.getCurrentThemeParams();
    return generateColors(params, this.activeTheme);
  }

  /**
   * Returns copy of current theme parameters.
   * @returns Current theme parameters
   */
  getCurrentParams(): ThemeParams {
    return { ...this.getCurrentThemeParams() };
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
   * Gets formatted reset button labels.
   * @returns Object with flavor and theme reset button labels
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
   * @returns Neovim theme string
   */
  exportNeovim(): string {
    const themeInfo = this.getThemeInfo();
    const params = this.getCurrentThemeParams();
    return exportNeovimTheme(params, this.activeTheme, themeInfo.name, this.activeFlavor);
  }

  /**
   * Exports theme as Base24 JSON.
   * @returns Base24 JSON string
   */
  exportBase24(): string {
    const themeInfo = this.getThemeInfo();
    const params = this.getCurrentThemeParams();
    return exportBase24Theme(params, this.activeTheme, themeInfo.name);
  }

  /**
   * Exports theme as Stylix configuration.
   * @returns Stylix theme string
   */
  exportStylix(): string {
    const themeInfo = this.getThemeInfo();
    const params = this.getCurrentThemeParams();
    return exportStylixTheme(params, this.activeTheme, themeInfo.name, this.activeFlavor);
  }

  /**
   * Exports theme definition for installation.
   * @returns Theme definition JSON string
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
   * @returns Theme parameters JSON string
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
