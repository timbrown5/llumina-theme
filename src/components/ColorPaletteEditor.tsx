import React, { useState, useEffect } from 'react';
import type { Base24Colors, AccentColorKey, ThemeParams } from '../types/index.ts';

const generateOffsetGradient = (baseHue: number): string => {
  const colors = [];
  // Create gradient from -179 to +180 relative to base hue
  for (let i = 0; i <= 24; i++) {
    const offset = -179 + (359 * i) / 24;
    let hue = baseHue + offset;
    while (hue < 0) hue += 360;
    while (hue >= 360) hue -= 360;
    colors.push(`hsl(${hue}, 80%, 60%)`);
  }
  return `linear-gradient(90deg, ${colors.join(', ')})`;
};

interface ColorAdjustmentPanelProps {
  selectedColorKey: AccentColorKey;
  colors: Base24Colors;
  params: ThemeParams;
  accentColors: { key: AccentColorKey; name: string }[];
  getCurrentOffset: (colorKey: AccentColorKey) => number;
  getCalculatedHue: (colorKey: AccentColorKey) => number;
  onColorSelect: (colorKey: AccentColorKey | null) => void;
  onColorAdjust: (colorKey: AccentColorKey, offset: number) => void;
  onResetToDefault: (colorKey: AccentColorKey) => void;
}

const ColorAdjustmentPanel: React.FC<ColorAdjustmentPanelProps> = ({
  selectedColorKey,
  colors,
  params,
  accentColors,
  getCurrentOffset,
  getCalculatedHue,
  onColorSelect,
  onColorAdjust,
  onResetToDefault,
}) => {
  const [inputValue, setInputValue] = useState<string>('');
  const [isInputFocused, setIsInputFocused] = useState<boolean>(false);

  const currentOffset = getCurrentOffset(selectedColorKey);
  const calculatedHue = getCalculatedHue(selectedColorKey);

  useEffect(() => {
    if (!isInputFocused) {
      setInputValue(currentOffset.toString());
    }
  }, [currentOffset, isInputFocused]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newInputValue = e.target.value;
    setInputValue(newInputValue);
    const newValue = parseInt(newInputValue);
    if (!isNaN(newValue) && newValue >= -179 && newValue <= 180) {
      onColorAdjust(selectedColorKey, newValue);
    }
  };

  const handleInputBlur = () => {
    setIsInputFocused(false);
    let newValue = parseInt(inputValue);
    if (isNaN(newValue)) {
      newValue = currentOffset;
    } else {
      newValue = Math.max(-179, Math.min(180, newValue));
    }
    onColorAdjust(selectedColorKey, newValue);
    setInputValue(newValue.toString());
  };

  const handleRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value);
    onColorAdjust(selectedColorKey, newValue);
  };

  const colorName = accentColors.find((c) => c.key === selectedColorKey)?.name || '';

  return (
    <div
      className="p-4 rounded-lg border"
      style={{
        background: colors.base00,
        border: `1px solid ${colors[selectedColorKey]}`,
        boxShadow: `0 0 0 1px ${colors[selectedColorKey]}20`,
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: colors[selectedColorKey] }} />
          <span className="font-medium" style={{ color: colors.base05 }}>
            {colorName} Hue Offset
          </span>
        </div>
        <button
          onClick={() => onColorSelect(null)}
          className="text-xs opacity-70 hover:opacity-100"
          style={{ color: colors.base04 }}
        >
          ✕ Close
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm" style={{ color: colors.base04 }}>
            Offset from Default
          </span>
          <div className="flex items-center gap-1">
            <input
              type="number"
              min="-179"
              max="180"
              value={inputValue}
              onChange={handleInputChange}
              onFocus={() => setIsInputFocused(true)}
              onBlur={handleInputBlur}
              className="bg-black bg-opacity-10 border border-white border-opacity-20 text-white px-2 py-1 rounded text-xs w-16 text-right outline-none"
              style={{
                background: colors.base01,
                border: `1px solid ${colors.base02}`,
                color: colors.base05,
              }}
            />
            <span className="text-xs opacity-70 min-w-4" style={{ color: colors.base04 }}>
              °
            </span>
          </div>
        </div>

        <div className="relative">
          <input
            type="range"
            min="-179"
            max="180"
            value={currentOffset}
            onChange={handleRangeChange}
            className="w-full h-4 rounded cursor-pointer outline-none appearance-none"
            style={{
              background: generateOffsetGradient(calculatedHue),
              WebkitAppearance: 'none',
            }}
          />
          <style>{`
            input[type="range"]::-webkit-slider-thumb {
              appearance: none;
              width: 20px;
              height: 20px;
              border-radius: 50%;
              background: #ffffff;
              border: 2px solid #333333;
              cursor: pointer;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            }

            input[type="range"]::-moz-range-thumb {
              width: 20px;
              height: 20px;
              border-radius: 50%;
              background: #ffffff;
              border: 2px solid #333333;
              cursor: pointer;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            }
          `}</style>
        </div>

        <div className="space-y-1 text-xs" style={{ color: colors.base04 }}>
          <div>
            Default {colorName.toLowerCase()}: {calculatedHue}°
          </div>
          <div>
            Current {colorName.toLowerCase()}: {(calculatedHue + currentOffset + 360) % 360}°
          </div>
          <div>
            Offset: {currentOffset > 0 ? '+' : ''}
            {currentOffset}°
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded border border-white border-opacity-30"
            style={{
              backgroundColor: `hsl(${(calculatedHue + currentOffset + 360) % 360}, 70%, 60%)`,
            }}
          />
          <span className="text-xs" style={{ color: colors.base04 }}>
            Preview: {(calculatedHue + currentOffset + 360) % 360}°
          </span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onResetToDefault(selectedColorKey)}
            className="flex-1 px-2 py-1 text-xs rounded border"
            style={{
              background: colors.base01,
              border: `1px solid ${colors.base02}`,
              color: colors.base05,
            }}
          >
            Reset to Default
          </button>
        </div>

        <div className="text-xs opacity-70 text-center" style={{ color: colors.base03 }}>
          Use ← → arrow keys to fine-tune • ESC to close
        </div>
      </div>
    </div>
  );
};

interface ColorPaletteEditorProps {
  colors: Base24Colors;
  params: ThemeParams;
  selectedColorKey: AccentColorKey | null;
  onColorSelect: (colorKey: AccentColorKey | null) => void;
  onColorAdjust: (colorKey: AccentColorKey, hueOffset: number) => void;
  onResetToDefault: (colorKey: AccentColorKey) => void;
}

const ColorPaletteEditor: React.FC<ColorPaletteEditorProps> = ({
  colors,
  params,
  selectedColorKey,
  onColorSelect,
  onColorAdjust,
  onResetToDefault,
}) => {
  const baseColors = [
    { key: 'base00', name: 'Background' },
    { key: 'base01', name: 'Alt Background' },
    { key: 'base02', name: 'Selection' },
    { key: 'base03', name: 'Comments' },
    { key: 'base04', name: 'Secondary Text' },
    { key: 'base05', name: 'Main Text' },
    { key: 'base06', name: 'Light Surface' },
    { key: 'base07', name: 'Light Accent' },
  ];

  const accentColors: { key: AccentColorKey; name: string }[] = [
    { key: 'base08', name: 'Red' },
    { key: 'base09', name: 'Orange' },
    { key: 'base0A', name: 'Yellow' },
    { key: 'base0B', name: 'Green' },
    { key: 'base0C', name: 'Cyan' },
    { key: 'base0D', name: 'Blue' },
    { key: 'base0E', name: 'Purple' },
    { key: 'base0F', name: 'Pink' },
  ];

  const mutedColors = [
    { key: 'base10', name: 'Muted Red' },
    { key: 'base11', name: 'Muted Orange' },
    { key: 'base12', name: 'Muted Yellow' },
    { key: 'base13', name: 'Muted Green' },
    { key: 'base14', name: 'Muted Cyan' },
    { key: 'base15', name: 'Muted Blue' },
    { key: 'base16', name: 'Muted Purple' },
    { key: 'base17', name: 'Muted Pink' },
  ];

  const getCurrentOffset = (colorKey: AccentColorKey): number => {
    return params.colorAdjustments?.[colorKey]?.hueOffset ?? 0;
  };

  const getCalculatedHue = (colorKey: AccentColorKey): number => {
    const baseHue = params.accentHue || 0;
    const standardOffsets = [0, 30, 60, 150, 180, 210, 270, 330];
    const colorIndex = [
      'base08',
      'base09',
      'base0A',
      'base0B',
      'base0C',
      'base0D',
      'base0E',
      'base0F',
    ].indexOf(colorKey);
    const standardOffset = standardOffsets[colorIndex] || 0;

    let calculatedHue = baseHue + standardOffset;
    while (calculatedHue < 0) calculatedHue += 360;
    while (calculatedHue >= 360) calculatedHue -= 360;

    return Math.round(calculatedHue);
  };

  const handleColorClick = (colorKey: AccentColorKey) => {
    if (selectedColorKey === colorKey) {
      onColorSelect(null);
    } else {
      onColorSelect(colorKey);
    }
  };

  const ColorRow: React.FC<{
    title: string;
    colors: { key: string; name: string }[];
    editable?: boolean;
  }> = ({ title, colors: rowColors, editable = false }) => (
    <div className="space-y-2">
      <h5 className="text-xs font-medium" style={{ color: colors.base04 }}>
        {title} {editable && <span className="opacity-70">(Click to edit)</span>}
      </h5>
      <div className="grid grid-cols-8 gap-2">
        {rowColors.map(({ key, name }) => (
          <div key={key} className="text-center">
            {editable ? (
              <button
                onClick={() => handleColorClick(key as AccentColorKey)}
                className={`w-full h-10 rounded-lg border-2 transition-all duration-200 relative cursor-pointer transform hover:scale-105 ${
                  selectedColorKey === key
                    ? 'border-white border-opacity-90 shadow-lg scale-110 ring-2 ring-white ring-opacity-30'
                    : 'border-white border-opacity-40 hover:border-opacity-70 hover:shadow-md'
                }`}
                style={{
                  backgroundColor: colors[key as keyof Base24Colors],
                  boxShadow:
                    selectedColorKey === key
                      ? `0 6px 20px ${colors[key as keyof Base24Colors]}60, 0 0 0 1px rgba(255,255,255,0.3)`
                      : `0 2px 8px ${colors[key as keyof Base24Colors]}30`,
                }}
                title={`${name} (${key}) - Click to adjust hue`}
              >
                <div className="absolute inset-0 rounded-lg border border-white border-opacity-20 pointer-events-none" />

                <div
                  className="absolute top-1 right-1 text-sm font-bold leading-none"
                  style={{
                    color: colors.base00,
                    textShadow: `0 0 3px ${colors[key as keyof Base24Colors]}, 0 1px 2px rgba(0,0,0,0.8)`,
                    filter: 'drop-shadow(0 0 1px rgba(255,255,255,0.8))',
                  }}
                >
                  ⚙
                </div>

                <div
                  className="absolute inset-0 rounded-lg opacity-20 pointer-events-none"
                  style={{
                    background: `linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%, rgba(0,0,0,0.1) 100%)`,
                  }}
                />
              </button>
            ) : (
              <div
                className="w-full h-10 rounded-lg border border-white border-opacity-10 relative"
                style={{ backgroundColor: colors[key as keyof Base24Colors] }}
                title={`${name} (${key}) - Display only`}
              >
                <div
                  className="absolute inset-0 rounded-lg opacity-30 pointer-events-none"
                  style={{
                    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.2)',
                  }}
                />
              </div>
            )}
            <div
              className="text-xs mt-1 font-mono"
              style={{ color: selectedColorKey === key ? colors.base05 : colors.base04 }}
            >
              {key.slice(-2)}
            </div>
            {editable && (
              <div
                className="text-xs opacity-70"
                style={{ color: selectedColorKey === key ? colors.base05 : colors.base03 }}
              >
                {name}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <ColorRow title="Base Colors" colors={baseColors} editable={false} />
      <ColorRow title="Accent Colors (Editable)" colors={accentColors} editable={true} />
      <ColorRow title="Muted Accent Colors" colors={mutedColors} editable={false} />

      {selectedColorKey && (
        <ColorAdjustmentPanel
          selectedColorKey={selectedColorKey}
          colors={colors}
          params={params}
          accentColors={accentColors}
          getCurrentOffset={getCurrentOffset}
          getCalculatedHue={getCalculatedHue}
          onColorSelect={onColorSelect}
          onColorAdjust={onColorAdjust}
          onResetToDefault={onResetToDefault}
        />
      )}

      {!selectedColorKey && (
        <div className="text-center text-xs opacity-70" style={{ color: colors.base03 }}>
          💡 Click any accent color (middle row) to fine-tune its hue. Look for the ⚙ icon and
          enhanced borders!
        </div>
      )}
    </div>
  );
};

export default ColorPaletteEditor;
