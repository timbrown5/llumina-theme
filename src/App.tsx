/**
 * Main application shell that orchestrates all UI components.
 *
 * Serves as the root component that brings together all theme functionality
 * into a cohesive user interface. This component manages the overall layout,
 * responsive behavior, and coordination between theme logic and UI components
 * while providing the main user interaction flows for theme creation.
 *
 * Primary responsibilities:
 * - Responsive layout with collapsible panels for optimal screen usage
 * - State coordination between theme logic and UI components
 * - Top-level theme and flavor switching interface
 * - Export panel integration with clipboard functionality
 * - Tab navigation for different preview modes
 */

import React from 'react';
import { themeLoader } from './utils/themeLoader.js';
import { useThemeLogic } from './hooks/useThemeLogic.js';
import Button from './components/Button.js';
import Slider from './components/Slider.js';
import ColorPaletteEditor from './components/ColorPaletteEditor.js';
import SyntaxPreview from './components/SyntaxHighlighter.js';
import UIPreview from './components/UIPreview.js';
import type { ThemeKey, FlavorKey, TabKey, Base24Colors, ThemeParams } from './types/index.js';

const TABS = [
  { id: 'ui-preview', label: 'UI Preview' },
  { id: 'javascript', label: 'JavaScript' },
  { id: 'python', label: 'Python' },
  { id: 'cpp', label: 'C++' },
  { id: 'terminal', label: 'Terminal' },
] as const;

const generateHueGradient = () => {
  const colors = [];
  for (let i = 0; i <= 12; i++) {
    const hue = (360 * i) / 12;
    colors.push(`hsl(${hue}, 70%, 50%)`);
  }
  return colors;
};

const generateSaturationGradient = (hue: number) => [
  `hsl(${hue}, 0%, 50%)`,
  `hsl(${hue}, 100%, 50%)`,
];

const generateLightnessGradient = (hue: number, sat: number) => [
  `hsl(${hue}, ${sat}%, 0%)`,
  `hsl(${hue}, ${sat}%, 50%)`,
  `hsl(${hue}, ${sat}%, 100%)`,
];

type ValidSliderKey =
  | 'bgHue'
  | 'bgSat'
  | 'bgLight'
  | 'accentHue'
  | 'accentSat'
  | 'accentLight'
  | 'commentLight';

interface SliderConfig {
  label: string;
  key: ValidSliderKey;
  min: number;
  max: number;
  type: 'hue' | 'saturation' | 'lightness';
}

const SLIDER_CONFIGS: Record<string, SliderConfig[]> = {
  main: [
    { label: 'Background Hue', key: 'bgHue', min: 0, max: 360, type: 'hue' },
    { label: 'Background Saturation', key: 'bgSat', min: 0, max: 100, type: 'saturation' },
    { label: 'Background Lightness', key: 'bgLight', min: 0, max: 100, type: 'lightness' },
  ],
  accent: [
    { label: 'Accent Hue', key: 'accentHue', min: 0, max: 360, type: 'hue' },
    { label: 'Accent Saturation', key: 'accentSat', min: 0, max: 100, type: 'saturation' },
    { label: 'Accent Lightness', key: 'accentLight', min: 0, max: 100, type: 'lightness' },
  ],
  comment: [
    { label: 'Comment Lightness', key: 'commentLight', min: 0, max: 100, type: 'lightness' },
  ],
};

const SLIDER_GENERATORS: Record<
  ValidSliderKey,
  {
    gradient: (params: any) => string[];
    preview?: (value: number, params: any) => { color?: string; label?: string };
  }
> = {
  bgHue: { gradient: () => generateHueGradient() },
  bgSat: { gradient: (params) => generateSaturationGradient(params.bgHue || 0) },
  bgLight: {
    gradient: (params) => generateLightnessGradient(params.bgHue || 0, params.bgSat || 50),
  },
  accentHue: { gradient: () => generateHueGradient() },
  accentSat: { gradient: (params) => generateSaturationGradient(params.accentHue || 0) },
  accentLight: {
    gradient: (params) => generateLightnessGradient(params.accentHue || 0, params.accentSat || 70),
  },
  commentLight: {
    gradient: (params) => generateLightnessGradient((params.bgHue || 0) + 180, 15),
  },
};

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
          🎯 Loading Available Themes...
        </h3>
        <div className="text-center" style={{ color: pageColors.base04 }}>
          Discovering themes from theme directory...
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
          title="Choose a base theme as your starting point for customization"
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
            {availableThemes.length} themes available for customization
          </div>
        </div>
      </div>
    </div>
  );
};

interface FlavorSelectorProps {
  activeFlavor: FlavorKey;
  onSelect: (flavor: FlavorKey) => void;
  pageColors: Base24Colors;
}

const FlavorSelector: React.FC<FlavorSelectorProps> = ({ activeFlavor, onSelect, pageColors }) => {
  const flavorDescriptions: Record<FlavorKey, string> = {
    muted: 'Gentle, softer colors for relaxed environments',
    balanced: 'Harmonious colors for everyday use',
    bold: 'High contrast colors for maximum readability',
  };

  const getAllFlavorKeys = (): FlavorKey[] => ['muted', 'balanced', 'bold'];

  return (
    <div className="mb-6">
      <h3 style={{ color: pageColors.base0E }} className="text-center text-lg font-semibold mb-4">
        🎭 Choose Flavor Intensity
      </h3>

      <div className="flex justify-center gap-3 mb-4">
        {getAllFlavorKeys().map((flavor) => (
          <Button
            key={flavor}
            onClick={() => onSelect(flavor)}
            variant="primary"
            active={activeFlavor === flavor}
            colors={pageColors}
            className="px-4 py-2 text-sm font-medium capitalize"
          >
            {flavor}
          </Button>
        ))}
      </div>

      <div className="text-center">
        <div style={{ color: pageColors.base04 }} className="text-sm max-w-md mx-auto">
          {flavorDescriptions[activeFlavor]}
        </div>
      </div>
    </div>
  );
};

interface HeaderProps {
  pageColors: Base24Colors;
}

const Header: React.FC<HeaderProps> = ({ pageColors }) => (
  <div className="text-center mb-8">
    <h1 className="text-4xl font-bold mb-3">
      <span style={{ color: pageColors.base05 }}>✨ </span>
      <span
        className="gradient-text"
        style={
          {
            '--gradient': `linear-gradient(90deg, ${pageColors.base08}, ${pageColors.base09}, ${pageColors.base0A}, ${pageColors.base0B}, ${pageColors.base0C}, ${pageColors.base0D}, ${pageColors.base0E})`,
            color: pageColors.base05,
          } as React.CSSProperties
        }
      >
        Lumina Theme Generator
      </span>
    </h1>
    <p style={{ color: pageColors.base04 }} className="mb-6">
      Create beautiful Base24 themes for Neovim and terminals with real-time preview
    </p>
    <style>{`
      .gradient-text {
        background: var(--gradient);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        display: inline-block;
      }

      @supports not (-webkit-background-clip: text) {
        .gradient-text {
          -webkit-text-fill-color: initial;
        }
      }
    `}</style>
  </div>
);

interface CustomizePanelProps {
  params: ThemeParams;
  updateParam: (key: keyof ThemeParams, value: number) => void;
  resetFlavor: () => void;
  resetTheme: () => void;
  flavor: FlavorKey;
  pageColors: Base24Colors;
  onExpandChange: (expanded: boolean) => void;
  themeLogic: any;
}

const CustomizePanel: React.FC<CustomizePanelProps> = ({
  params,
  updateParam,
  resetFlavor,
  resetTheme,
  flavor,
  pageColors,
  onExpandChange,
  themeLogic,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(true);

  const handleExpandChange = (expanded: boolean) => {
    setIsExpanded(expanded);
    onExpandChange(expanded);
  };

  // Get better reset button labels from ThemeManager
  const resetLabels = themeLogic.getResetLabels
    ? themeLogic.getResetLabels()
    : {
        flavor: `Reset to ${flavor.charAt(0).toUpperCase() + flavor.slice(1)} Flavor`,
        theme: 'Reset Theme to Default',
      };

  const getSliderProps = (configKey: ValidSliderKey) => {
    const generator = SLIDER_GENERATORS[configKey];
    if (!generator) {
      console.warn(`No generator found for ${configKey}`);
      return {
        gradientColors: ['#000', '#fff'],
        previewColor: undefined,
        previewLabel: undefined,
      };
    }

    const gradient = generator.gradient(params);
    const preview = generator.preview
      ? generator.preview(params[configKey], params)
      : { color: undefined, label: undefined };

    return {
      gradientColors: gradient,
      previewColor: preview.color,
      previewLabel: preview.label,
    };
  };

  return (
    <div
      style={{
        background: pageColors.base01,
        border: `1px solid ${pageColors.base02}`,
      }}
      className="rounded-xl p-5"
    >
      <button
        onClick={() => handleExpandChange(!isExpanded)}
        className="w-full flex items-center justify-between mb-5 text-left"
        style={{ color: pageColors.base0E }}
        title={isExpanded ? 'Collapse customization panel' : 'Expand customization panel'}
      >
        <h3 className="text-lg font-semibold">🎨 Customize Colors</h3>
        <span className="text-xl">{isExpanded ? '▼' : '▶'}</span>
      </button>

      {isExpanded && (
        <>
          <div className="mb-5">
            <h4 style={{ color: pageColors.base05 }} className="mb-3 text-sm font-medium">
              Background & UI Colors
            </h4>
            <div style={{ color: pageColors.base04 }} className="text-xs mb-3">
              Adjust the overall appearance of backgrounds, panels, and user interface elements
            </div>
            {SLIDER_CONFIGS.main.map((config) => {
              const sliderProps = getSliderProps(config.key);
              return (
                <Slider
                  key={config.key}
                  label={config.label}
                  value={params[config.key]}
                  min={config.min}
                  max={config.max}
                  type={config.type}
                  gradientColors={sliderProps.gradientColors}
                  previewColor={sliderProps.previewColor}
                  previewLabel={sliderProps.previewLabel}
                  colors={pageColors}
                  onChange={(v) => updateParam(config.key, v)}
                />
              );
            })}
          </div>

          <div className="mb-5">
            <h4 style={{ color: pageColors.base05 }} className="mb-3 text-sm font-medium">
              Syntax & Accent Colors
            </h4>
            <div style={{ color: pageColors.base04 }} className="text-xs mb-3">
              Control the colors used for syntax highlighting, keywords, and accent elements
            </div>
            {SLIDER_CONFIGS.accent.map((config) => {
              const sliderProps = getSliderProps(config.key);
              return (
                <Slider
                  key={config.key}
                  label={config.label}
                  value={params[config.key]}
                  min={config.min}
                  max={config.max}
                  type={config.type}
                  gradientColors={sliderProps.gradientColors}
                  previewColor={sliderProps.previewColor}
                  previewLabel={sliderProps.previewLabel}
                  colors={pageColors}
                  onChange={(v) => updateParam(config.key, v)}
                />
              );
            })}
          </div>

          <div className="mb-5">
            <h4 style={{ color: pageColors.base05 }} className="mb-3 text-sm font-medium">
              Comments & Subtle Text
            </h4>
            <div style={{ color: pageColors.base04 }} className="text-xs mb-3">
              Fine-tune the visibility and contrast of comments and secondary text
            </div>
            {SLIDER_CONFIGS.comment.map((config) => {
              const sliderProps = getSliderProps(config.key);
              return (
                <Slider
                  key={config.key}
                  label={config.label}
                  value={params[config.key]}
                  min={config.min}
                  max={config.max}
                  type={config.type}
                  gradientColors={sliderProps.gradientColors}
                  previewColor={sliderProps.previewColor}
                  previewLabel={sliderProps.previewLabel}
                  colors={pageColors}
                  onChange={(v) => updateParam(config.key, v)}
                />
              );
            })}
          </div>

          <div className="mb-5">
            <h4 style={{ color: pageColors.base05 }} className="mb-3 text-sm font-medium">
              Individual Color Adjustments
            </h4>
            <div style={{ color: pageColors.base04 }} className="text-xs mb-3">
              Click any accent color below to fine-tune its hue individually. Use keyboard arrows
              for precise control.
            </div>
            <ColorPaletteEditor
              colors={themeLogic.colors}
              params={themeLogic.getCurrentParams()}
              selectedColorKey={themeLogic.selectedColorKey}
              getThemeOffset={themeLogic.getThemeOffset}
              onColorSelect={themeLogic.setSelectedColor}
              onColorAdjust={themeLogic.updateColorAdjustment}
              onResetToDefault={themeLogic.resetColorToDefault}
            />
          </div>

          <div className="mb-5">
            <h4 style={{ color: pageColors.base05 }} className="mb-3 text-sm font-medium">
              Reset Options
            </h4>
            <div className="flex gap-3">
              <Button
                onClick={resetFlavor}
                variant="secondary"
                colors={pageColors}
                className="flex-1 px-3 py-2 text-sm"
                title="Reset current flavor to its default values, keeping other flavors unchanged"
              >
                🔄 {resetLabels.flavor}
              </Button>
              <Button
                onClick={resetTheme}
                variant="primary"
                colors={pageColors}
                className="flex-1 px-3 py-2 text-sm"
                title="Reset entire theme (all flavors) to default values"
              >
                🏠 {resetLabels.theme}
              </Button>
            </div>
            <div style={{ color: pageColors.base04 }} className="text-xs mt-2 text-center">
              <strong>Reset Flavor:</strong> Reverts current flavor to default settings
              <br />
              <strong>Reset Theme:</strong> Clears all customizations for entire theme (all flavors)
            </div>
          </div>
        </>
      )}
    </div>
  );
};

interface PreviewPanelProps {
  colors: Base24Colors;
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({ colors, activeTab, setActiveTab }) => {
  const renderPreviewContent = () => {
    if (activeTab === 'ui-preview') {
      return <UIPreview colors={colors} />;
    }

    return <SyntaxPreview colors={colors} language={activeTab} />;
  };

  const availableTabs = TABS;

  return (
    <div
      style={{
        background: colors.base00,
        border: `1px solid ${colors.base02}`,
      }}
      className="rounded-xl p-5"
    >
      <h3 style={{ color: colors.base0E }} className="mb-5 text-lg font-semibold">
        👀 Live Theme Preview
      </h3>

      <div className="flex gap-1 mb-4 border-b pb-2" style={{ borderColor: colors.base02 }}>
        {availableTabs.map((tab) => (
          <Button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            variant="primary"
            active={activeTab === tab.id}
            colors={colors}
            className="text-xs"
            title={`Preview theme in ${tab.label} context`}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {renderPreviewContent()}
    </div>
  );
};

interface ExportPanelProps {
  exportNvimTheme: () => void;
  exportTheme: () => void;
  exportStylixTheme: () => void;
  exportThemeDefinition: () => void;
  copyThemeParams: () => void;
  copied: boolean;
  pageColors: Base24Colors;
}

const ExportPanel: React.FC<ExportPanelProps> = ({
  exportNvimTheme,
  exportTheme,
  exportStylixTheme,
  exportThemeDefinition,
  copyThemeParams,
  copied,
  pageColors,
}) => (
  <div
    style={{
      background: pageColors.base01,
      border: `1px solid ${pageColors.base02}`,
    }}
    className="rounded-xl p-5 text-center"
  >
    <h3 style={{ color: pageColors.base0E }} className="mb-4 text-lg font-semibold">
      📦 Export Your Custom Theme
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
      <Button
        onClick={exportNvimTheme}
        variant="gradient"
        colors={pageColors}
        className="px-4 py-3 text-sm font-bold"
        title="Export as complete Neovim Lua theme file with syntax highlighting"
      >
        🎨 Neovim Theme
      </Button>

      <Button
        onClick={exportTheme}
        variant="gradientWarm"
        colors={pageColors}
        className="px-4 py-3 text-sm font-bold"
        title="Export as standard Base24 JSON format for universal editor compatibility"
      >
        📋 Base24 JSON
      </Button>

      <Button
        onClick={exportStylixTheme}
        variant="gradientRed"
        colors={pageColors}
        className="px-4 py-3 text-sm font-bold"
        title="Export as Stylix configuration for NixOS system-wide theming"
      >
        ❄️ Stylix Theme
      </Button>

      <Button
        onClick={copyThemeParams}
        variant="secondary"
        colors={pageColors}
        className="px-4 py-3 text-sm font-bold"
        title="Export current theme parameters as JSON for sharing or backup"
      >
        📄 Theme JSON
      </Button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-1 gap-3 mb-4">
      <Button
        onClick={exportThemeDefinition}
        variant="primary"
        colors={pageColors}
        className="px-4 py-3 text-sm font-bold"
        title="Export as installable theme definition file for theme libraries"
      >
        📁 Theme Definition JSON
      </Button>
    </div>

    {copied && (
      <div
        style={{
          background: pageColors.base0B,
          color: pageColors.base00,
        }}
        className="mb-4 py-2 px-4 rounded inline-block"
      >
        ✅ Theme copied to clipboard successfully!
      </div>
    )}

    <div style={{ color: pageColors.base04 }} className="text-xs leading-relaxed">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-left">
        <div>
          <strong>Neovim:</strong> Complete Lua theme file ready for installation
        </div>
        <div>
          <strong>Base24:</strong> Standard JSON format for most editors
        </div>
        <div>
          <strong>Stylix:</strong> Nix configuration for system-wide theming
        </div>
        <div>
          <strong>Theme JSON:</strong> Current parameters for sharing
        </div>
        <div>
          <strong>Theme Definition:</strong> Installable theme package format
        </div>
      </div>
    </div>
  </div>
);

const App: React.FC = () => {
  const themeLogic = useThemeLogic();
  const [isCustomizePanelExpanded, setIsCustomizePanelExpanded] = React.useState(true);

  React.useEffect(() => {
    if (themeLogic.activeTab === 'colors') {
      themeLogic.setActiveTab('ui-preview');
    }
  }, [themeLogic.activeTab]);

  return (
    <div
      className="min-h-screen p-5 font-sans"
      style={{
        background:
          themeLogic.getCurrentParams().bgLight > 50
            ? `linear-gradient(135deg, ${themeLogic.pageColors.base00}, ${themeLogic.pageColors.base02})`
            : `linear-gradient(135deg, ${themeLogic.pageColors.base00}, ${themeLogic.pageColors.base01})`,
        color: themeLogic.pageColors.base05,
      }}
    >
      <div className="max-w-6xl mx-auto">
        <Header pageColors={themeLogic.pageColors} />

        <ThemeDropdown
          activeTheme={themeLogic.activeTheme}
          onSelect={(theme) => {
            console.log('Switching to theme:', theme);
            themeLogic.switchTheme(theme);
          }}
          pageColors={themeLogic.pageColors}
        />

        <FlavorSelector
          activeFlavor={themeLogic.activeFlavor}
          onSelect={(flavor) => {
            console.log('Switching to flavor:', flavor);
            themeLogic.switchFlavor(flavor);
          }}
          pageColors={themeLogic.pageColors}
        />

        <div
          style={{ color: themeLogic.pageColors.base04 }}
          className="text-center text-xs max-w-lg mx-auto mb-8"
        >
          <strong>Muted:</strong> Gentle, softer colors for relaxed environments •{' '}
          <strong>Balanced:</strong> Harmonious colors for everyday use • <strong>Bold:</strong>{' '}
          High contrast colors for maximum readability
        </div>

        <div className="flex flex-col xl:flex-row gap-8 mb-8">
          <div
            className={`${isCustomizePanelExpanded ? 'xl:w-3/5' : 'xl:w-4/5 xl:max-w-6xl xl:mx-auto'} transition-all duration-300`}
          >
            <PreviewPanel
              colors={themeLogic.colors}
              activeTab={themeLogic.activeTab}
              setActiveTab={themeLogic.setActiveTab}
            />
          </div>

          <div
            className={`${isCustomizePanelExpanded ? 'xl:w-2/5' : 'xl:w-1/5'} transition-all duration-300`}
          >
            <CustomizePanel
              params={themeLogic.getCurrentParams()}
              updateParam={themeLogic.updateParam}
              resetFlavor={themeLogic.resetFlavor}
              resetTheme={themeLogic.resetTheme}
              flavor={themeLogic.activeFlavor}
              pageColors={themeLogic.pageColors}
              onExpandChange={setIsCustomizePanelExpanded}
              themeLogic={themeLogic}
            />
          </div>
        </div>
        <ExportPanel
          exportNvimTheme={themeLogic.exportNvimTheme}
          exportTheme={themeLogic.exportTheme}
          exportStylixTheme={themeLogic.exportStylixTheme}
          exportThemeDefinition={themeLogic.exportThemeDefinition}
          copyThemeParams={themeLogic.copyThemeParams}
          copied={themeLogic.copied}
          pageColors={themeLogic.pageColors}
        />
      </div>
    </div>
  );
};

export default App;
