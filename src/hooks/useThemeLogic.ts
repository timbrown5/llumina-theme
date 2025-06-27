import { useState, useEffect } from 'react';
import { getBaseTheme, getThemeParams, RAW_THEME_DATA } from '../constants/index.ts';
import { generateColors } from '../utils/colorUtils.ts';
import {
  createNvimTheme,
  createBase24Json,
  createThemeParams,
  createStylixTheme,
} from '../utils/exportUtils.ts';
import type { ThemeKey, FlavorKey, TabKey, ThemeParams, ThemeLogic } from '../types/index.ts';

const STORAGE_KEY = 'lumina-theme-settings';

interface StoredSettings {
  [key: string]: ThemeParams;
}

const saveSettings = (settings: StoredSettings) => {
  try {
    const serialized = JSON.stringify(settings);
    sessionStorage.setItem(STORAGE_KEY, serialized);
  } catch (error) {
    console.warn('Failed to save theme settings:', error);
  }
};

const loadSettings = (): StoredSettings => {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.warn('Failed to load theme settings:', error);
    return {};
  }
};

const getSettingsKey = (theme: ThemeKey, flavor: FlavorKey) => `${theme}-${flavor}`;

export const useThemeLogic = (): ThemeLogic => {
  const [activeTheme, setActiveTheme] = useState<ThemeKey>('twilight');
  const [flavor, setFlavor] = useState<FlavorKey>('normal');
  const [params, setParams] = useState<ThemeParams>(() => getThemeParams('twilight', 'normal'));
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<TabKey>('colors');
  const [storedSettings, setStoredSettings] = useState<StoredSettings>({});

  useEffect(() => {
    setStoredSettings(loadSettings());
  }, []);

  useEffect(() => {
    const settingsKey = getSettingsKey(activeTheme, flavor);
    const stored = storedSettings[settingsKey];

    if (stored) {
      setParams(stored);
    } else {
      const newParams = getThemeParams(activeTheme, flavor);
      setParams(newParams);
    }
  }, [activeTheme, flavor, storedSettings]);

  const colors = generateColors(params);
  const pageColors = colors;

  const updateParam = (key: keyof ThemeParams, value: number) => {
    const newParams = { ...params, [key]: value };
    setParams(newParams);

    const settingsKey = getSettingsKey(activeTheme, flavor);
    const newStoredSettings = { ...storedSettings, [settingsKey]: newParams };
    setStoredSettings(newStoredSettings);
    saveSettings(newStoredSettings);
  };

  const switchTheme = (themeKey: ThemeKey) => {
    setActiveTheme(themeKey);
  };

  const switchFlavor = (newFlavor: FlavorKey) => {
    setFlavor(newFlavor);
  };

  const resetToFlavor = () => {
    const newParams = getThemeParams(activeTheme, flavor);
    setParams(newParams);

    const settingsKey = getSettingsKey(activeTheme, flavor);
    const newStoredSettings = { ...storedSettings, [settingsKey]: newParams };
    setStoredSettings(newStoredSettings);
    saveSettings(newStoredSettings);
  };

  const resetToTheme = () => {
    const newParams = getThemeParams(activeTheme, 'normal');
    setParams(newParams);
    setFlavor('normal');

    // Clear all stored settings for this theme
    const newStoredSettings = { ...storedSettings };
    Object.keys(newStoredSettings).forEach((key) => {
      if (key.startsWith(activeTheme)) {
        delete newStoredSettings[key];
      }
    });
    setStoredSettings(newStoredSettings);
    saveSettings(newStoredSettings);
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const exportNvimTheme = () =>
    copyToClipboard(createNvimTheme(colors, getBaseTheme(activeTheme).name, flavor));
  const exportTheme = () =>
    copyToClipboard(createBase24Json(colors, getBaseTheme(activeTheme).name));
  const exportStylixTheme = () =>
    copyToClipboard(createStylixTheme(colors, getBaseTheme(activeTheme).name, flavor));
  const copyThemeParams = () =>
    copyToClipboard(createThemeParams(activeTheme, flavor, params, colors));

  return {
    activeTheme,
    params,
    copied,
    activeTab,
    flavor,
    colors,
    pageColors,
    updateParam,
    switchTheme,
    switchFlavor,
    resetToFlavor,
    resetToTheme,
    setActiveTab,
    exportNvimTheme,
    exportTheme,
    exportStylixTheme,
    copyThemeParams,
  };
};
