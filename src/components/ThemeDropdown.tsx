/**
 * Theme selection dropdown with dynamic theme loading and metadata display.
 *
 * Provides the primary interface for users to select base themes for
 * customization. The component handles asynchronous theme discovery and
 * presents theme information in an accessible, informative format that
 * helps users make informed choices about their starting point.
 *
 * Selection features:
 * - Dynamic theme discovery from the theme loader system
 * - Theme metadata display including names and descriptions
 * - Loading state management during theme discovery
 * - Accessible dropdown interface with proper ARIA support
 * - Theme count indicator for user awareness
 */

import React from 'react';
import { themeLoader } from '../utils/themeLoader.ts';
import type { ThemeKey, Base24Colors } from '../types/index.ts';

interface ThemeDropdownProps {
  activeTheme: ThemeKey;
  onSelect: (theme: ThemeKey) => void;
  pageColors: Base24Colors;
}

/**
 * Dropdown component for theme selection with async theme loading.
 *
 * Dynamically loads available themes from the theme loader and displays
 * them with descriptive information. Handles loading states gracefully.
 *
 * @param props - Theme dropdown configuration
 * @param props.activeTheme - Currently selected theme key
 * @param props.onSelect - Callback when theme selection changes
 * @param props.pageColors - Base24 colors for component styling
 * @returns Theme selection dropdown with metadata
 */
const ThemeDropdown: React.FC<ThemeDropdownProps> = ({ activeTheme, onSelect, pageColors }) => {
  const [availableThemes, setAvailableThemes] = React.useState<ThemeKey[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    /**
     * Asynchronously loads available themes from the theme loader.
     */
    const loadThemes = async () => {
      await themeLoader.waitForLoad();
      const themes = themeLoader.getAllThemeKeys();
      setAvailableThemes(themes);
      setIsLoading(false);
    };

    loadThemes();
  }, []);

  /**
   * Handles theme selection changes from the dropdown.
   *
   * @param event - Select change event
   */
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onSelect(event.target.value as ThemeKey);
  };

  /**
   * Gets the display name for a theme from its metadata.
   *
   * @param themeKey - Theme identifier
   * @returns Human-readable theme name
   */
  const getThemeDisplayName = (themeKey: ThemeKey): string => {
    const themeInfo = themeLoader.getThemeInfo(themeKey);
    return themeInfo ? themeInfo.name : themeKey;
  };

  /**
   * Gets the tagline/description for a theme from its metadata.
   *
   * @param themeKey - Theme identifier
   * @returns Theme description string
   */
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
