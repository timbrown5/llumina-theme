import { useState } from 'react';
import { THEMES, FLAVORS } from '../constants/index.ts';
import { generateColors } from '../utils/colorUtils.ts';
import { createNvimTheme, createBase24Json, createThemeParams } from '../utils/exportUtils.ts';
import type { ThemeKey, FlavorKey, TabKey, ThemeParams, ThemeLogic } from '../types/index.ts';

export const useThemeLogic = (): ThemeLogic => {
  const [activeTheme, setActiveTheme] = useState<ThemeKey>('twilight');
  const [params, setParams] = useState<ThemeParams>(THEMES.twilight);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<TabKey>('colors');
  const [flavor, setFlavor] = useState<FlavorKey>('normal');
  const [uiTheme, setUiTheme] = useState<ThemeKey>('twilight');

  const colors = generateColors(params);
  const pageColors = generateColors({
    ...THEMES[uiTheme],
    accentSat: 90,
    accentLight: 70,
    commentLight: 65,
  });

  const updateParam = (key: keyof ThemeParams, value: number) =>
    setParams((prev) => ({ ...prev, [key]: value }));

  const applyFlavor = (baseParams: ThemeParams, flavorType: FlavorKey): ThemeParams => {
    const [accentSat, accentLight, commentLight] =
      FLAVORS[activeTheme]?.[flavorType] || FLAVORS[activeTheme].normal;
    return { ...baseParams, accentSat, accentLight, commentLight };
  };

  const switchTheme = (themeKey: ThemeKey) => {
    setActiveTheme(themeKey);
    setParams(applyFlavor({ ...THEMES[themeKey] }, flavor));
  };

  const switchFlavor = (newFlavor: FlavorKey) => {
    setFlavor(newFlavor);
    setParams(applyFlavor({ ...THEMES[activeTheme] }, newFlavor));
  };

  const resetToFlavor = () => setParams(applyFlavor({ ...THEMES[activeTheme] }, flavor));
  const resetToTheme = () => {
    setParams({ ...THEMES[activeTheme] });
    setFlavor('normal');
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
    // State
    activeTheme,
    params,
    copied,
    activeTab,
    flavor,
    uiTheme,
    colors,
    pageColors,
    // Actions
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
