import React from 'react';
import { themeLoader } from '../utils/themeLoader.ts';
import type { ThemeKey, Base24Colors } from '../types/index.ts';

interface ThemeDropdownProps {
  activeTheme: ThemeKey;
  onSelect: (theme: ThemeKey) => void;
  pageColors: Base24Colors;
}

const ThemeDropdown: React.FC<ThemeDropdownProps> = ({ activeTheme, onSelect, pageColors }) => {
  const [availableThemes, setAvailableThemes] = React.useState<ThemeKey[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const loadThemes = async () => {
      await themeLoader.waitForLoad();
      const themes = themeLoader.getAllThemeKeys();
      setAvailableThemes(themes);
      setIsLoading(false);
    };

    loadThemes();
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onSelect(event.target.value as ThemeKey);
  };

  const getThemeDisplayName = (themeKey: ThemeKey): string => {
    const themeInfo = themeLoader.getThemeInfo(themeKey);
    return themeInfo ? themeInfo.name : themeKey;
  };

  const getThemeDescription = (themeKey: ThemeKey): string => {
    const themeInfo = themeLoader.getThemeInfo(themeKey);
    return themeInfo ? themeInfo.tagline : '';
  };

  if (isLoading) {
    return (
      <div className="mb-6">
        <h3 style={{ color: pageColors.base0E }} className="text-center text-lg font-semibold mb-4">
          🎯 Loading Themes...
        </h3>
        <div className="text-center" style={{ color: pageColors.base04 }}>
          Discovering themes from directory...
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <h3 style={{ color: pageColors.base0E }} className="text-center text-lg font-semibold mb-4">
        🎯 Select Base Theme to Customize
      </h3>

      <div className="max-w-md mx-auto">
        <select
          value={activeTheme}
          onChange={handleChange}
          style={{
            background: pageColors.base01,
            border: `2px solid ${pageColors.base02}`,
            color: pageColors.base05,
          }}
          className="w-full px-4 py-3 rounded-lg text-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {availableThemes.map((themeKey) => (
            <option
              key={themeKey}
              value={themeKey}
              style={{
                background: pageColors.base01,
                color: pageColors.base05,
              }}
            >
              {getThemeDisplayName(themeKey)}
            </option>
          ))}
        </select>

        <div className="mt-2 text-center">
          <div style={{ color: pageColors.base04 }} className="text-sm">
            {getThemeDescription(activeTheme)}
          </div>
          <div style={{ color: pageColors.base03 }} className="text-xs mt-1">
            {availableThemes.length} themes available
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeDropdown;
