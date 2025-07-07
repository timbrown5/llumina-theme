/**
 * React hook providing component interface to ThemeManager with singleton pattern.
 * Ensures ThemeManager persists across re-renders and handles UI updates.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { ThemeManager } from '../classes/ThemeManager.ts';
import type { ThemeKey, FlavorKey, TabKey, AccentColorKey, Base24Colors } from '../types/index.ts';

export interface ThemeLogic {
  activeTheme: ThemeKey;
  activeFlavor: FlavorKey;
  activeTab: TabKey;
  selectedColorKey: AccentColorKey | null;
  colors: Base24Colors;
  pageColors: Base24Colors;
  copied: boolean;

  switchTheme: (themeKey: ThemeKey) => void;
  switchFlavor: (flavor: FlavorKey) => void;
  setActiveTab: (tab: TabKey) => void;
  setSelectedColor: (colorKey: AccentColorKey | null) => void;

  updateParam: (key: string, value: number) => void;

  updateColorAdjustment: (colorKey: AccentColorKey, hueOffset: number) => void;
  resetColorAdjustment: (colorKey: AccentColorKey) => void;
  resetColorToDefault: (colorKey: AccentColorKey) => void;

  resetToFlavor: () => void;
  resetToTheme: () => void;

  exportNvimTheme: () => void;
  exportTheme: () => void;
  exportStylixTheme: () => void;
  exportThemeDefinition: () => void;
  copyThemeParams: () => void;

  getThemeInfo: () => { name: string; tagline: string; inspirations: string };
  getCurrentParams: () => any;
  getThemeOffset: (colorKey: AccentColorKey) => number;
  getAllThemeKeys: () => ThemeKey[];
  getAllFlavorKeys: () => FlavorKey[];
}

/**
 * Global singleton to prevent recreation across component re-renders.
 */
let globalThemeManager: ThemeManager | null = null;

/**
 * Gets or creates the global ThemeManager instance.
 * @returns ThemeManager singleton instance
 */
const getThemeManager = (): ThemeManager => {
  if (!globalThemeManager) {
    console.log('useThemeLogic: Creating new ThemeManager instance');
    globalThemeManager = new ThemeManager();
  } else {
    console.log('useThemeLogic: Reusing existing ThemeManager instance');
  }
  return globalThemeManager;
};

/**
 * Main theme hook providing React interface to ThemeManager.
 * @returns ThemeLogic interface with all theme operations
 */
export const useThemeLogic = (): ThemeLogic => {
  const themeManagerRef = useRef<ThemeManager | null>(null);

  if (!themeManagerRef.current) {
    themeManagerRef.current = getThemeManager();
  }

  const themeManager = themeManagerRef.current;

  const [, forceUpdate] = useState({});
  const [activeTab, setActiveTab] = useState<TabKey>('ui-preview');
  const [copied, setCopied] = useState<boolean>(false);

  /**
   * Triggers React re-render when theme state changes.
   */
  const triggerUpdate = useCallback(() => {
    console.log('useThemeLogic: Triggering update');
    forceUpdate({});
  }, []);

  /**
   * Handles keyboard shortcuts for color editing.
   */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const selectedColorKey = themeManager.selectedColorKey;
      if (selectedColorKey) {
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          const currentOffset = themeManager.getColorAdjustment(selectedColorKey);
          const newOffset = Math.max(-60, currentOffset - 5);
          themeManager.updateColorAdjustment(selectedColorKey, newOffset);
          triggerUpdate();
        } else if (event.key === 'ArrowRight') {
          event.preventDefault();
          const currentOffset = themeManager.getColorAdjustment(selectedColorKey);
          const newOffset = Math.min(60, currentOffset + 5);
          themeManager.updateColorAdjustment(selectedColorKey, newOffset);
          triggerUpdate();
        } else if (event.key === 'Escape') {
          event.preventDefault();
          themeManager.setSelectedColor(null);
          triggerUpdate();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [themeManager, triggerUpdate]);

  /**
   * Updates theme parameter by key name.
   * @param key - Parameter name (bgHue, accentSat, etc.)
   * @param value - New parameter value
   */
  const updateParam = useCallback(
    (key: string, value: number) => {
      console.log(`useThemeLogic: Updating ${key} to ${value}`);
      switch (key) {
        case 'bgHue':
          themeManager.updateBackgroundHue(value);
          break;
        case 'bgSat':
          themeManager.updateBackgroundSat(value);
          break;
        case 'bgLight':
          themeManager.updateBackgroundLight(value);
          break;
        case 'accentHue':
          themeManager.updateAccentHue(value);
          break;
        case 'accentSat':
          themeManager.updateAccentSat(value);
          break;
        case 'accentLight':
          themeManager.updateAccentLight(value);
          break;
        case 'commentLight':
          themeManager.updateCommentLight(value);
          break;
        default:
          console.warn(`Unknown parameter: ${key}`);
      }
      triggerUpdate();
    },
    [themeManager, triggerUpdate]
  );

  /**
   * Switches to a new theme.
   * @param themeKey - The theme to switch to
   */
  const switchTheme = useCallback(
    (themeKey: ThemeKey) => {
      console.log(`useThemeLogic: Switching theme to ${themeKey}`);
      themeManager.switchTheme(themeKey);
      triggerUpdate();
    },
    [themeManager, triggerUpdate]
  );

  /**
   * Switches to a new flavor while preserving customizations.
   * @param flavor - The flavor to switch to
   */
  const switchFlavor = useCallback(
    (flavor: FlavorKey) => {
      console.log(`useThemeLogic: Switching flavor to ${flavor}`);
      themeManager.switchFlavor(flavor);
      triggerUpdate();
    },
    [themeManager, triggerUpdate]
  );

  /**
   * Sets the currently selected color for editing.
   * @param colorKey - The accent color to select, or null to deselect
   */
  const setSelectedColor = useCallback(
    (colorKey: AccentColorKey | null) => {
      themeManager.setSelectedColor(colorKey);
      triggerUpdate();
    },
    [themeManager, triggerUpdate]
  );

  /**
   * Updates hue adjustment for a specific accent color.
   * @param colorKey - The accent color to adjust
   * @param hueOffset - The hue adjustment in degrees
   */
  const updateColorAdjustment = useCallback(
    (colorKey: AccentColorKey, hueOffset: number) => {
      themeManager.updateColorAdjustment(colorKey, hueOffset);
      triggerUpdate();
    },
    [themeManager, triggerUpdate]
  );

  /**
   * Resets color adjustment for a specific accent color.
   * @param colorKey - The accent color to reset
   */
  const resetColorAdjustment = useCallback(
    (colorKey: AccentColorKey) => {
      themeManager.resetColorAdjustment(colorKey);
      triggerUpdate();
    },
    [themeManager, triggerUpdate]
  );

  /**
   * Resets color to default (alias for resetColorAdjustment).
   * @param colorKey - The accent color to reset
   */
  const resetColorToDefault = useCallback(
    (colorKey: AccentColorKey) => {
      themeManager.resetColorToDefault(colorKey);
      triggerUpdate();
    },
    [themeManager, triggerUpdate]
  );

  /**
   * Resets to current flavor defaults.
   */
  const resetToFlavor = useCallback(() => {
    console.log('useThemeLogic: Reset to flavor');
    themeManager.resetToFlavor();
    triggerUpdate();
  }, [themeManager, triggerUpdate]);

  /**
   * Resets to theme defaults.
   */
  const resetToTheme = useCallback(() => {
    console.log('useThemeLogic: Reset to theme');
    themeManager.resetToTheme();
    triggerUpdate();
  }, [themeManager, triggerUpdate]);

  /**
   * Copies content to clipboard and shows feedback.
   * @param content - The content to copy
   */
  const copyToClipboard = useCallback((content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, []);

  /**
   * Exports Neovim theme to clipboard.
   */
  const exportNvimTheme = useCallback(() => {
    copyToClipboard(themeManager.exportNeovim());
  }, [themeManager, copyToClipboard]);

  /**
   * Exports Base24 theme to clipboard.
   */
  const exportTheme = useCallback(() => {
    copyToClipboard(themeManager.exportBase24());
  }, [themeManager, copyToClipboard]);

  /**
   * Exports Stylix theme to clipboard.
   */
  const exportStylixTheme = useCallback(() => {
    copyToClipboard(themeManager.exportStylix());
  }, [themeManager, copyToClipboard]);

  /**
   * Exports theme definition to clipboard.
   */
  const exportThemeDefinition = useCallback(() => {
    copyToClipboard(themeManager.exportThemeDefinition());
  }, [themeManager, copyToClipboard]);

  /**
   * Exports theme parameters to clipboard.
   */
  const copyThemeParams = useCallback(() => {
    copyToClipboard(themeManager.exportThemeJson());
  }, [themeManager, copyToClipboard]);

  /**
   * Gets current theme metadata.
   * @returns Theme information object
   */
  const getThemeInfo = useCallback(() => {
    return themeManager.getThemeInfo();
  }, [themeManager]);

  /**
   * Gets current theme parameters.
   * @returns Current theme parameters
   */
  const getCurrentParams = useCallback(() => {
    return themeManager.getCurrentParams();
  }, [themeManager]);

  /**
   * Gets theme offset for a specific color.
   * @param colorKey - The accent color to query
   * @returns Theme-specific hue offset
   */
  const getThemeOffset = useCallback(
    (colorKey: AccentColorKey) => {
      return themeManager.getThemeOffset(colorKey);
    },
    [themeManager]
  );

  /**
   * Gets all available theme keys.
   * @returns Array of theme identifiers
   */
  const getAllThemeKeys = useCallback(() => {
    return themeManager.getAllThemeKeys();
  }, [themeManager]);

  /**
   * Gets all available flavor keys.
   * @returns Array of flavor identifiers
   */
  const getAllFlavorKeys = useCallback(() => {
    return themeManager.getAllFlavorKeys();
  }, [themeManager]);

  const colors = themeManager.getCurrentColors();
  const pageColors = colors;

  return {
    activeTheme: themeManager.activeTheme,
    activeFlavor: themeManager.activeFlavor,
    activeTab,
    selectedColorKey: themeManager.selectedColorKey,
    colors,
    pageColors,
    copied,

    switchTheme,
    switchFlavor,
    setActiveTab,
    setSelectedColor,

    updateParam,

    updateColorAdjustment,
    resetColorAdjustment,
    resetColorToDefault,

    resetToFlavor,
    resetToTheme,

    exportNvimTheme,
    exportTheme,
    exportStylixTheme,
    exportThemeDefinition,
    copyThemeParams,

    getThemeInfo,
    getCurrentParams,
    getThemeOffset,
    getAllThemeKeys,
    getAllFlavorKeys,
  };
};
