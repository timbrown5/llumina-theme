import { THEMES, COLOR_GROUPS, TABS, FLAVORS, SLIDER_CONFIGS } from './constants/index.ts';
import { useThemeLogic } from './hooks/useThemeLogic.ts';
import Button from './components/Button.tsx';
import Slider from './components/Slider.tsx';
import { ColorList, ColorPalette } from './components/ColorComponents.tsx';
import SyntaxPreview from './components/SyntaxHighlighter.tsx';
import UIPreview from './components/UIPreview.tsx';
import {
  okhslToRgb,
  generateHueGradient,
  generateAccentHueGradient,
  generateSaturationGradient,
  generateLightnessGradient,
} from './utils/colorUtils.ts';
import type { ThemeKey, FlavorKey, TabKey, Base24Colors, ThemeParams } from './types/index.ts';

interface HeaderProps {
  pageColors: Base24Colors;
  uiTheme: ThemeKey;
  setUiTheme: (theme: ThemeKey) => void;
}

const Header: React.FC<HeaderProps> = ({ pageColors, uiTheme, setUiTheme }) => (
  <div className="text-center mb-8">
    <h1
      className="text-4xl font-bold mb-3"
      style={{
        background: `linear-gradient(135deg, ${pageColors.base0E}, ${pageColors.base08})`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}
    >
      ✨ Lumina Theme Generator
    </h1>
    <p style={{ color: pageColors.base04 }} className="mb-6">
      Create beautiful Base24 themes for Neovim and terminals
    </p>

    {/* Compact UI Theme Selector */}
    <div
      style={{
        background: pageColors.base01,
        border: `1px solid ${pageColors.base02}`,
      }}
      className="rounded-lg p-3 mb-6 max-w-xl mx-auto"
    >
      <div className="flex items-center justify-between gap-3">
        <span style={{ color: pageColors.base04 }} className="text-sm font-medium">
          🎨 UI Theme:
        </span>

        <div className="flex gap-2">
          {Object.entries(THEMES).map(([key, theme]) => (
            <button
              key={key}
              onClick={() => setUiTheme(key as ThemeKey)}
              title={`${theme.name}: ${theme.tagline}`}
              style={{
                background:
                  uiTheme === key
                    ? `linear-gradient(135deg, ${pageColors.base0E}, ${pageColors.base0D})`
                    : pageColors.base02,
                border: `1px solid ${uiTheme === key ? pageColors.base0D : pageColors.base03}`,
                color: uiTheme === key ? pageColors.base00 : pageColors.base05,
              }}
              className="px-3 py-1 rounded text-sm font-medium transition-all duration-200 hover:scale-105"
            >
              {theme.name.replace('Lumina ', '')}
            </button>
          ))}
        </div>
      </div>

      <div style={{ color: pageColors.base04 }} className="text-xs mt-2 text-center italic">
        Currently previewing:{' '}
        <strong style={{ color: pageColors.base05 }}>{THEMES[uiTheme].name}</strong>
      </div>
    </div>
  </div>
);

interface ThemeSelectorProps {
  activeTheme: ThemeKey;
  switchTheme: (themeKey: ThemeKey) => void;
  pageColors: Base24Colors;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ activeTheme, switchTheme, pageColors }) => (
  <div className="mb-6">
    <h3 style={{ color: pageColors.base0E }} className="text-center text-lg font-semibold mb-4">
      🎯 Select Base Theme to Customize
    </h3>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 max-w-4xl mx-auto">
      {Object.entries(THEMES).map(([key, theme]) => (
        <button
          key={key}
          onClick={() => switchTheme(key as ThemeKey)}
          title={`${theme.tagline} - Inspired by: ${theme.inspirations}`}
          style={{
            background: activeTheme === key ? pageColors.base02 : pageColors.base01,
            border: `2px solid ${activeTheme === key ? pageColors.base0D : pageColors.base02}`,
            color: pageColors.base05,
          }}
          className="rounded-lg p-3 cursor-pointer transition-all duration-200 hover:scale-105 text-left"
        >
          <div className="font-bold text-sm mb-1">{theme.name}</div>
          <div style={{ color: pageColors.base04 }} className="text-xs leading-tight">
            {theme.tagline}
          </div>
          {activeTheme === key && (
            <div style={{ color: pageColors.base0D }} className="mt-2 text-xs font-bold">
              ✨ Selected
            </div>
          )}
        </button>
      ))}
    </div>
  </div>
);

interface ThemeInfoProps {
  activeTheme: ThemeKey;
  pageColors: Base24Colors;
}

const ThemeInfo: React.FC<ThemeInfoProps> = ({ activeTheme, pageColors }) => (
  <div
    style={{
      background: pageColors.base01,
      border: `1px solid ${pageColors.base02}`,
    }}
    className="rounded-xl p-4 mb-6 text-center max-w-2xl mx-auto"
  >
    <div style={{ color: pageColors.base05 }} className="text-lg font-semibold mb-2">
      {THEMES[activeTheme].name}
    </div>
    <div style={{ color: pageColors.base04 }} className="text-sm mb-2">
      {THEMES[activeTheme].tagline}
    </div>
    <div style={{ color: pageColors.base04 }} className="text-xs italic">
      Inspiration: {THEMES[activeTheme].inspirations}
    </div>
  </div>
);

interface FlavorSelectorProps {
  activeTheme: ThemeKey;
  flavor: FlavorKey;
  switchFlavor: (flavor: FlavorKey) => void;
  pageColors: Base24Colors;
}

const FlavorSelector: React.FC<FlavorSelectorProps> = ({
  activeTheme,
  flavor,
  switchFlavor,
  pageColors,
}) => (
  <div className="mb-8">
    <h4 style={{ color: pageColors.base0E }} className="text-center text-lg font-semibold mb-4">
      🎭 Choose Flavor Intensity
    </h4>
    <div className="flex gap-4 justify-center mb-4 flex-wrap">
      {Object.keys(FLAVORS[activeTheme]).map((flavorOption) => (
        <Button
          key={flavorOption}
          onClick={() => switchFlavor(flavorOption as FlavorKey)}
          variant={flavor === flavorOption ? 'gradientWarm' : 'secondary'}
          active={flavor === flavorOption}
          colors={pageColors}
          className="text-sm py-3 px-6 capitalize font-semibold"
        >
          {flavorOption === 'high-contrast' ? 'High Contrast' : flavorOption}
        </Button>
      ))}
    </div>

    <div style={{ color: pageColors.base04 }} className="text-center text-xs max-w-lg mx-auto">
      <strong>Pastel:</strong> Gentle, softer colors • <strong>Normal:</strong> Balanced everyday
      use • <strong>High-Contrast:</strong> Bold, maximum readability
    </div>
  </div>
);

interface CustomizePanelProps {
  params: ThemeParams;
  updateParam: (key: keyof ThemeParams, value: number) => void;
  resetToFlavor: () => void;
  resetToTheme: () => void;
  flavor: FlavorKey;
  pageColors: Base24Colors;
}

const CustomizePanel: React.FC<CustomizePanelProps> = ({
  params,
  updateParam,
  resetToFlavor,
  resetToTheme,
  flavor,
  pageColors,
}) => {
  // Calculate comment hue (background hue + 180° for light themes, same for dark)
  const isLight = params.bgLight > 50;
  const commentHue = (params.bgHue + (isLight ? 180 : 0) + 360) % 360;

  // Helper function to generate slider props for different types
  const getSliderProps = (
    configKey: keyof ThemeParams,
    config: (typeof SLIDER_CONFIGS.main)[0]
  ) => {
    const value = params[configKey];

    if (config.type === 'hue') {
      if (configKey === 'bgHue') {
        // Background hue: full color wheel
        return {
          gradientColors: generateHueGradient(),
          previewColor: okhslToRgb(value, 0.8, 0.6),
          previewLabel: `${value}°`,
        };
      } else if (configKey === 'accentHue') {
        // Accent hue adjustment: show adjustment from red
        return {
          gradientColors: generateAccentHueGradient(0, -180, 180),
          previewColor: okhslToRgb((0 + value + 360) % 360, 0.8, 0.6),
          previewLabel: `Red + ${value > 0 ? '+' : ''}${value}° = ${(0 + value + 360) % 360}°`,
        };
      }
    } else if (config.type === 'saturation') {
      if (configKey === 'bgSat') {
        // Background saturation
        return {
          gradientColors: generateSaturationGradient(params.bgHue),
          previewColor: undefined,
          previewLabel: undefined,
        };
      } else if (configKey === 'accentSat') {
        // Accent saturation: use adjusted red hue
        const accentHue = (0 + params.accentHue + 360) % 360;
        return {
          gradientColors: generateSaturationGradient(accentHue),
          previewColor: undefined,
          previewLabel: undefined,
        };
      }
    } else if (config.type === 'lightness') {
      if (configKey === 'bgLight') {
        // Background lightness
        return {
          gradientColors: generateLightnessGradient(params.bgHue, params.bgSat),
          previewColor: undefined,
          previewLabel: undefined,
        };
      } else if (configKey === 'accentLight') {
        // Accent lightness: use adjusted red hue
        const accentHue = (0 + params.accentHue + 360) % 360;
        return {
          gradientColors: generateLightnessGradient(accentHue, params.accentSat),
          previewColor: undefined,
          previewLabel: undefined,
        };
      } else if (configKey === 'commentLight') {
        // Comment lightness: use comment hue
        return {
          gradientColors: generateLightnessGradient(commentHue, 15),
          previewColor: undefined,
          previewLabel: undefined,
        };
      }
    }

    // Fallback
    return {
      gradientColors: ['#808080'],
      previewColor: undefined,
      previewLabel: undefined,
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
      <h3 style={{ color: pageColors.base0E }} className="mb-5 text-lg font-semibold">
        🎨 Customize Colors
      </h3>

      {/* Main Colors Section */}
      <div className="mb-5">
        <h4 style={{ color: pageColors.base05 }} className="mb-3 text-sm font-medium">
          Background & UI Colors
        </h4>
        {SLIDER_CONFIGS.main.map((config) => {
          const sliderProps = getSliderProps(config.key, config);
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
              onChange={(v) => updateParam(config.key, v)}
            />
          );
        })}
      </div>

      {/* Accent Colors Section */}
      <div className="mb-5">
        <h4 style={{ color: pageColors.base05 }} className="mb-3 text-sm font-medium">
          Syntax & Accent Colors
        </h4>
        {SLIDER_CONFIGS.accent.map((config) => {
          const sliderProps = getSliderProps(config.key, config);
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
              onChange={(v) => updateParam(config.key, v)}
            />
          );
        })}
      </div>

      {/* Comments Section */}
      <div className="mb-5">
        <h4 style={{ color: pageColors.base05 }} className="mb-3 text-sm font-medium">
          Comments & Subtle Text
        </h4>
        {SLIDER_CONFIGS.comment.map((config) => {
          const sliderProps = getSliderProps(config.key, config);
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
              onChange={(v) => updateParam(config.key, v)}
            />
          );
        })}
      </div>

      {/* Reset Buttons */}
      <div className="flex gap-2">
        <Button
          onClick={resetToFlavor}
          variant="gradientWarm"
          colors={pageColors}
          className="text-xs font-bold flex-1"
        >
          🔄 Reset to {flavor.charAt(0).toUpperCase() + flavor.slice(1)}
        </Button>

        <Button
          onClick={resetToTheme}
          variant="gradientRed"
          colors={pageColors}
          className="text-xs font-bold flex-1"
        >
          🔄 Reset Theme
        </Button>
      </div>
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
    if (activeTab === 'colors') {
      return (
        <div
          style={{ background: colors.base00, color: colors.base05 }}
          className="p-4 rounded border border-white border-opacity-10"
        >
          <div className="grid grid-cols-3 gap-3 mb-5">
            {Object.entries(COLOR_GROUPS).map(([groupName, colorData]) => (
              <ColorList
                key={groupName}
                title={`${groupName.charAt(0).toUpperCase() + groupName.slice(1)} Colors`}
                colors={colors}
                colorData={colorData}
              />
            ))}
          </div>
          <div className="mt-5">
            <h4 className="text-sm mb-3">Color Palette</h4>
            {Object.values(COLOR_GROUPS).map((group, i) => (
              <ColorPalette key={i} colors={colors} colorKeys={group.map(({ key }) => key)} />
            ))}
          </div>
        </div>
      );
    }

    if (activeTab === 'ui-preview') {
      return <UIPreview colors={colors} />;
    }

    return <SyntaxPreview colors={colors} language={activeTab} />;
  };

  return (
    <div
      style={{
        background: colors.base00,
        border: `1px solid ${colors.base02}`,
      }}
      className="rounded-xl p-5"
    >
      <h3 style={{ color: colors.base0E }} className="mb-5 text-lg font-semibold">
        👀 Theme Preview
      </h3>

      <div className="flex gap-1 mb-4 border-b pb-2" style={{ borderColor: colors.base02 }}>
        {TABS.map((tab) => (
          <Button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            variant="primary"
            active={activeTab === tab.id}
            colors={colors}
            className="text-xs"
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
  copyThemeParams: () => void;
  copied: boolean;
  pageColors: Base24Colors;
}

const ExportPanel: React.FC<ExportPanelProps> = ({
  exportNvimTheme,
  exportTheme,
  exportStylixTheme,
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
      📦 Export Your Base24 Theme
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
      <Button
        onClick={exportNvimTheme}
        variant="gradient"
        colors={pageColors}
        className="px-4 py-3 text-sm font-bold"
      >
        🎨 Neovim Theme
      </Button>

      <Button
        onClick={exportTheme}
        variant="gradientWarm"
        colors={pageColors}
        className="px-4 py-3 text-sm font-bold"
      >
        📋 Base24 JSON
      </Button>

      <Button
        onClick={exportStylixTheme}
        variant="gradientRed"
        colors={pageColors}
        className="px-4 py-3 text-sm font-bold"
      >
        ❄️ Stylix Theme
      </Button>

      <Button
        onClick={copyThemeParams}
        variant="secondary"
        colors={pageColors}
        className="px-4 py-3 text-sm font-bold"
      >
        📊 Parameters
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
        ✅ Copied to clipboard!
      </div>
    )}

    <div style={{ color: pageColors.base04 }} className="text-xs leading-relaxed">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-left">
        <div>
          <strong>Neovim:</strong> Complete Lua theme file
        </div>
        <div>
          <strong>Base24:</strong> Standard JSON for editors
        </div>
        <div>
          <strong>Stylix:</strong> Nix system-wide theming
        </div>
        <div>
          <strong>Parameters:</strong> Raw values for tweaking
        </div>
      </div>
    </div>
  </div>
);

const App: React.FC = () => {
  const themeLogic = useThemeLogic();

  return (
    <div
      className="min-h-screen p-5 font-sans"
      style={{
        background: `linear-gradient(135deg, ${themeLogic.pageColors.base00}, ${themeLogic.pageColors.base01})`,
        color: themeLogic.pageColors.base05,
      }}
    >
      <div className="max-w-6xl mx-auto">
        <Header
          pageColors={themeLogic.pageColors}
          uiTheme={themeLogic.uiTheme}
          setUiTheme={themeLogic.setUiTheme}
        />

        <ThemeSelector
          activeTheme={themeLogic.activeTheme}
          switchTheme={themeLogic.switchTheme}
          pageColors={themeLogic.pageColors}
        />

        <FlavorSelector
          activeTheme={themeLogic.activeTheme}
          flavor={themeLogic.flavor}
          switchFlavor={themeLogic.switchFlavor}
          pageColors={themeLogic.pageColors}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <CustomizePanel
            params={themeLogic.params}
            updateParam={themeLogic.updateParam}
            resetToFlavor={themeLogic.resetToFlavor}
            resetToTheme={themeLogic.resetToTheme}
            flavor={themeLogic.flavor}
            pageColors={themeLogic.pageColors}
          />

          <PreviewPanel
            colors={themeLogic.colors}
            activeTab={themeLogic.activeTab}
            setActiveTab={themeLogic.setActiveTab}
          />
        </div>

        <ExportPanel
          exportNvimTheme={themeLogic.exportNvimTheme}
          exportTheme={themeLogic.exportTheme}
          exportStylixTheme={themeLogic.exportStylixTheme}
          copyThemeParams={themeLogic.copyThemeParams}
          copied={themeLogic.copied}
          pageColors={themeLogic.pageColors}
        />
      </div>
    </div>
  );
};

export default App;
