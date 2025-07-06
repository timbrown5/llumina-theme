import { useState, useEffect, useCallback } from 'react';
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

export const useThemeLogic = (): ThemeLogic => {
  const [themeManager] = useState(() => new ThemeManager());
  const [, forceUpdate] = useState({});
  const [activeTab, setActiveTab] = useState<TabKey>('ui-preview');
  const [copied, setCopied] = useState<boolean>(false);

  const triggerUpdate = useCallback(() => {
    forceUpdate({});
  }, []);

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

  const updateParam = useCallback(
    (key: string, value: number) => {
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

  const switchTheme = useCallback(
    (themeKey: ThemeKey) => {
      themeManager.switchTheme(themeKey);
      triggerUpdate();
    },
    [themeManager, triggerUpdate]
  );

  const switchFlavor = useCallback(
    (flavor: FlavorKey) => {
      themeManager.switchFlavor(flavor);
      triggerUpdate();
    },
    [themeManager, triggerUpdate]
  );

  const setSelectedColor = useCallback(
    (colorKey: AccentColorKey | null) => {
      themeManager.setSelectedColor(colorKey);
      triggerUpdate();
    },
    [themeManager, triggerUpdate]
  );

  const updateColorAdjustment = useCallback(
    (colorKey: AccentColorKey, hueOffset: number) => {
      themeManager.updateColorAdjustment(colorKey, hueOffset);
      triggerUpdate();
    },
    [themeManager, triggerUpdate]
  );

  const resetColorAdjustment = useCallback(
    (colorKey: AccentColorKey) => {
      themeManager.resetColorAdjustment(colorKey);
      triggerUpdate();
    },
    [themeManager, triggerUpdate]
  );

  const resetColorToDefault = useCallback(
    (colorKey: AccentColorKey) => {
      themeManager.resetColorToDefault(colorKey);
      triggerUpdate();
    },
    [themeManager, triggerUpdate]
  );

  const resetToFlavor = useCallback(() => {
    themeManager.resetToFlavor();
    triggerUpdate();
  }, [themeManager, triggerUpdate]);

  const resetToTheme = useCallback(() => {
    themeManager.resetToTheme();
    triggerUpdate();
  }, [themeManager, triggerUpdate]);

  const copyToClipboard = useCallback((content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, []);

  const exportNvimTheme = useCallback(() => {
    copyToClipboard(themeManager.exportNeovim());
  }, [themeManager, copyToClipboard]);

  const exportTheme = useCallback(() => {
    copyToClipboard(themeManager.exportBase24());
  }, [themeManager, copyToClipboard]);

  const exportStylixTheme = useCallback(() => {
    copyToClipboard(themeManager.exportStylix());
  }, [themeManager, copyToClipboard]);

  const exportThemeDefinition = useCallback(() => {
    copyToClipboard(themeManager.exportThemeDefinition());
  }, [themeManager, copyToClipboard]);

  const copyThemeParams = useCallback(() => {
    copyToClipboard(themeManager.exportThemeJson());
  }, [themeManager, copyToClipboard]);

  const getThemeInfo = useCallback(() => {
    return themeManager.getThemeInfo();
  }, [themeManager]);

  const getCurrentParams = useCallback(() => {
    return themeManager.getCurrentParams();
  }, [themeManager]);

  const getThemeOffset = useCallback(
    (colorKey: AccentColorKey) => {
      return themeManager.getThemeOffset(colorKey);
    },
    [themeManager]
  );

  const getAllThemeKeys = useCallback(() => {
    return themeManager.getAllThemeKeys();
  }, [themeManager]);

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
