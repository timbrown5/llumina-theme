import { THEMES, COLOR_GROUPS, TABS, FLAVORS, SLIDER_CONFIGS } from './constants/index.ts';
import { useThemeLogic } from './hooks/useThemeLogic.ts';
import Button from './components/Button.tsx';
import Slider from './components/Slider.tsx';
import { ColorList, ColorPalette } from './components/ColorComponents.tsx';
import SyntaxPreview from './components/SyntaxHighlighter.tsx';
import type { ThemeKey, FlavorKey, TabKey, Base24Colors } from './types/index.ts';

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
        WebkitTextFillColor: 'transparent'
      }}
    >
      ✨ Lumina Theme Generator
    </h1>
    <p style={{ color: pageColors.base04 }} className="mb-4">
      Create beautiful Base24 themes for Neovim and terminals
    </p>
    
    <div className="flex items-center justify-center gap-3 mb-4">
      <span style={{ color: pageColors.base04 }} className="text-sm">UI Theme:</span>
      <select
        value={uiTheme}
        onChange={(e) => setUiTheme(e.target.value as ThemeKey)}
        style={{
          background: pageColors.base01,
          border: `1px solid ${pageColors.base02}`,
          color: pageColors.base05
        }}
        className="px-3 py-1 rounded text-sm cursor-pointer outline-none"
      >
        {Object.entries(THEMES).map(([key, theme]) => (
          <option key={key} value={key} style={{ background: pageColors.base01, color: pageColors.base05 }}>
            {theme.name}
          </option>
        ))}
      </select>
    </div>
  </div>
);

interface ThemeSelectorProps {
  activeTheme: ThemeKey;
  switchTheme: (themeKey: ThemeKey) => void;
  pageColors: Base24Colors;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ activeTheme, switchTheme, pageColors }) => (
  <div className="flex gap-3 justify-center mb-5 flex-wrap">
    {Object.entries(THEMES).map(([key, theme]) => (
      <Button
        key={key}
        onClick={() => switchTheme(key as ThemeKey)}
        variant="primary"
        active={activeTheme === key}
        colors={pageColors}
        className="text-sm"
      >
        {theme.name}
      </Button>
    ))}
  </div>
);

interface ThemeInfoProps {
  activeTheme: ThemeKey;
  pageColors: Base24Colors;
}

const ThemeInfo: React.FC<ThemeInfoProps> = ({ activeTheme, pageColors }) => (
  <div style={{ color: pageColors.base05 }} className="text-center mb-5 text-sm">
    <div className="mb-2">{THEMES[activeTheme].tagline}</div>
    <div style={{ color: pageColors.base04 }} className="text-xs italic">
      Inspirations: {THEMES[activeTheme].inspirations}
    </div>
  </div>
);

interface FlavorSelectorProps {
  activeTheme: ThemeKey;
  flavor: FlavorKey;
  switchFlavor: (flavor: FlavorKey) => void;
  pageColors: Base24Colors;
}

const FlavorSelector: React.FC<FlavorSelectorProps> = ({ activeTheme, flavor, switchFlavor, pageColors }) => (
  <div className="flex gap-3 justify-center mb-8 flex-wrap">
    <span style={{ color: pageColors.base04 }} className="text-sm self-center">Flavor:</span>
    {Object.keys(FLAVORS[activeTheme]).map(flavorOption => (
      <Button
        key={flavorOption}
        onClick={() => switchFlavor(flavorOption as FlavorKey)}
        variant="secondary"
        active={flavor === flavorOption}
        colors={pageColors}
        className="text-xs capitalize"
      >
        {flavorOption === 'high-contrast' ? 'High Contrast' : flavorOption}
      </Button>
    ))}
  </div>
);

interface CustomizePanelProps {
  params: any;
  updateParam: (key: string, value: number) => void;
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
  pageColors 
}) => (
  <div 
    style={{
      background: pageColors.base01,
      border: `1px solid ${pageColors.base02}`
    }}
    className="rounded-xl p-5"
  >
    <h3 style={{ color: pageColors.base0E }} className="mb-5 text-lg font-semibold">Customize Colors</h3>
    
    {/* Main Colors Section */}
    <div className="mb-5">
      <h4 style={{ color: pageColors.base05 }} className="mb-3 text-sm font-medium">Main Colors</h4>
      {SLIDER_CONFIGS.main.map(config => (
        <Slider
          key={config.key}
          label={config.label}
          value={params[config.key]}
          min={config.min}
          max={config.max}
          type={config.type}
          currentHue={params.bgHue}
          currentSat={params.bgSat}
          onChange={(v) => updateParam(config.key, v)}
        />
      ))}
    </div>
    
    {/* Accent Colors Section */}
    <div className="mb-5">
      <h4 style={{ color: pageColors.base05 }} className="mb-3 text-sm font-medium">Accent Colors</h4>
      {SLIDER_CONFIGS.accent.map(config => (
        <Slider
          key={config.key}
          label={config.label}
          value={params[config.key]}
          min={config.min}
          max={config.max}
          type={config.type}
          onChange={(v) => updateParam(config.key, v)}
        />
      ))}
    </div>
    
    {/* Comments Section */}
    <div className="mb-5">
      <h4 style={{ color: pageColors.base05 }} className="mb-3 text-sm font-medium">Comments</h4>
      {SLIDER_CONFIGS.comment.map(config => (
        <Slider
          key={config.key}
          label={config.label}
          value={params[config.key]}
          min={config.min}
          max={config.max}
          type={config.type}
          onChange={(v) => updateParam(config.key, v)}
        />
      ))}
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

interface PreviewPanelProps {
  colors: Base24Colors;
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({ colors, activeTab, setActiveTab }) => {
  const renderPreviewContent = () => {
    if (activeTab === 'colors') {
      return (
        <div style={{ background: colors.base00, color: colors.base05 }} className="p-4 rounded border border-white border-opacity-10">
          <div className="grid grid-cols-3 gap-3 mb-5">
            {Object.entries(COLOR_GROUPS).map(([groupName, colorData]) => (
              <ColorList key={groupName} title={`${groupName.charAt(0).toUpperCase() + groupName.slice(1)} Colors`} colors={colors} colorData={colorData} />
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
    
    return <SyntaxPreview colors={colors} language={activeTab} />;
  };

  return (
    <div 
      style={{
        background: colors.base00,
        border: `1px solid ${colors.base02}`
      }}
      className="rounded-xl p-5"
    >
      <h3 style={{ color: colors.base0E }} className="mb-5 text-lg font-semibold">Preview</h3>
      
      <div className="flex gap-1 mb-4 border-b pb-2" style={{ borderColor: colors.base02 }}>
        {TABS.map(tab => (
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
  copyThemeParams: () => void;
  copied: boolean;
  pageColors: Base24Colors;
}

const ExportPanel: React.FC<ExportPanelProps> = ({ 
  exportNvimTheme, 
  exportTheme, 
  copyThemeParams, 
  copied, 
  pageColors 
}) => (
  <div 
    style={{
      background: pageColors.base01,
      border: `1px solid ${pageColors.base02}`
    }}
    className="rounded-xl p-5 text-center"
  >
    <h3 style={{ color: pageColors.base0E }} className="mb-4 text-lg font-semibold">Export Your Base24 Theme</h3>
    <div className="flex gap-3 justify-center flex-wrap">
      <Button
        onClick={exportNvimTheme}
        variant="gradient"
        colors={pageColors}
        className="px-6 py-3 text-base font-bold"
      >
        🎨 Copy Neovim Theme
      </Button>
      
      <Button
        onClick={exportTheme}
        variant="gradientWarm"
        colors={pageColors}
        className="px-6 py-3 text-base font-bold"
      >
        📋 Copy Base24 JSON
      </Button>
      
      <Button
        onClick={copyThemeParams}
        variant="gradientRed"
        colors={pageColors}
        className="px-6 py-3 text-base font-bold"
      >
        📊 Copy Parameters
      </Button>
    </div>
    
    {copied && (
      <div 
        style={{
          background: pageColors.base0B,
          color: pageColors.base00
        }}
        className="mt-3 py-2 px-4 rounded inline-block"
      >
        ✅ Copied to clipboard!
      </div>
    )}
    
    <div style={{ color: pageColors.base04 }} className="mt-4 text-xs leading-relaxed">
      <div><strong>Neovim Theme:</strong> Complete Lua theme file ready for ~/.config/nvim/</div>
      <div><strong>Base24 JSON:</strong> Standard Base24 colors for other editors and terminals</div>
      <div><strong>Parameters:</strong> Raw values for debugging and tweaking</div>
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
        color: themeLogic.pageColors.base05
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
        
        <ThemeInfo 
          activeTheme={themeLogic.activeTheme} 
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
          copyThemeParams={themeLogic.copyThemeParams} 
          copied={themeLogic.copied} 
          pageColors={themeLogic.pageColors} 
        />
        
      </div>
    </div>
  );
};

export default App;
