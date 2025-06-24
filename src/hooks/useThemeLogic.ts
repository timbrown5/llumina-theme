import { useState, useEffect } from 'react';
import { THEMES, FLAVORS } from '../constants/index.ts';
import { generateColors } from '../utils/colorUtils.ts';
import { createNvimTheme, createBase24Json, createThemeParams } from '../utils/exportUtils.ts';
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
  const [params, setParams] = useState<ThemeParams>(() => {
    const flavorData = FLAVORS.twilight.normal;
    const [accentHue, accentSat, accentLight, commentLight] = flavorData;
    return { ...THEMES.twilight, accentHue, accentSat, accentLight, commentLight };
  });
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<TabKey>('colors');
  const [uiTheme, setUiTheme] = useState<ThemeKey>('twilight');
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
      const flavorData = FLAVORS[activeTheme]?.[flavor] || FLAVORS[activeTheme].normal;
      const [accentHue, accentSat, accentLight, commentLight] = flavorData;
      const newParams = { ...THEMES[activeTheme], accentHue, accentSat, accentLight, commentLight };
      setParams(newParams);
    }
  }, [activeTheme, flavor, storedSettings]);

  const colors = generateColors(params);
  const pageColors = generateColors({
    ...THEMES[uiTheme],
    accentSat: 85,
    accentLight: 70,
    commentLight: 60,
  });

  const updateParam = (key: keyof ThemeParams, value: number) => {
    const newParams = { ...params, [key]: value };
    setParams(newParams);

    const settingsKey = getSettingsKey(activeTheme, flavor);
    const newStoredSettings = { ...storedSettings, [settingsKey]: newParams };
    setStoredSettings(newStoredSettings);
    saveSettings(newStoredSettings);
  };

  const applyFlavor = (baseParams: ThemeParams, flavorType: FlavorKey): ThemeParams => {
    const flavorData = FLAVORS[activeTheme]?.[flavorType] || FLAVORS[activeTheme].normal;
    const [accentHue, accentSat, accentLight, commentLight] = flavorData;
    return { ...baseParams, accentHue, accentSat, accentLight, commentLight };
  };

  const switchTheme = (themeKey: ThemeKey) => {
    setActiveTheme(themeKey);
  };

  const switchFlavor = (newFlavor: FlavorKey) => {
    setFlavor(newFlavor);
  };

  const resetToFlavor = () => {
    const newParams = applyFlavor({ ...THEMES[activeTheme] }, flavor);
    setParams(newParams);

    const settingsKey = getSettingsKey(activeTheme, flavor);
    const newStoredSettings = { ...storedSettings, [settingsKey]: newParams };
    setStoredSettings(newStoredSettings);
    saveSettings(newStoredSettings);
  };

  const resetToTheme = () => {
    const newParams = { ...THEMES[activeTheme] };
    setParams(newParams);
    setFlavor('normal');

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
    copyToClipboard(createNvimTheme(colors, THEMES[activeTheme].name, flavor));
  const exportTheme = () => copyToClipboard(createBase24Json(colors, THEMES[activeTheme].name));
  const copyThemeParams = () =>
    copyToClipboard(createThemeParams(activeTheme, flavor, params, colors));

  return {
    activeTheme,
    params,
    copied,
    activeTab,
    flavor,
    uiTheme,
    colors,
    pageColors,
    updateParam,
    switchTheme,
    switchFlavor,
    resetToFlavor,
    resetToTheme,
    setActiveTab,
    setUiTheme,
    exportNvimTheme,
    exportTheme,
    copyThemeParams,
  };
};
