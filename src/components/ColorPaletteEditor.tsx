/**
 * Interactive color palette with individual color adjustment capabilities.
 *
 * Provides a comprehensive interface for fine-tuning individual accent colors within
 * a Base24 scheme. This component bridges the gap between global theme adjustments
 * and precise color control, allowing users to perfect their color relationships
 * while maintaining the overall theme harmony.
 *
 * Features provided:
 * - Complete Base24 color structure display with visual organization
 * - Click-to-edit functionality for individual accent colors
 * - Visual hue adjustment sliders with real-time preview
 * - Reset options for individual colors and theme defaults
 * - Keyboard shortcuts for precise adjustments
 */

import React, { useState, useEffect } from 'react';
import type { Base24Colors, AccentColorKey, ThemeParams } from '../types/index.js';
import { Base24 } from '../classes/Base24.js';

const generateOffsetGradient = (baseHue: number): string => {
  const colors = [];
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
  getThemeOffset: (colorKey: AccentColorKey) => number;
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
  getThemeOffset,
  onColorSelect,
  onColorAdjust,
  onResetToDefault,
}) => {
  const [inputValue, setInputValue] = useState<string>('');
  const [isInputFocused, setIsInputFocused] = useState<boolean>(false);

  const currentOffset = getCurrentOffset(selectedColorKey);
  const standardOffset = Base24.getStandardOffset(selectedColorKey);
  const themeOffset = getThemeOffset(selectedColorKey);
  const standardHue = (params.accentHue + standardOffset + 360) % 360;
  const currentHue = getCalculatedHue(selectedColorKey);
  const themeIntendedHue = (params.accentHue + standardOffset + themeOffset + 360) % 360;

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const newValue = Math.min(180, currentOffset + 1);
      onColorAdjust(selectedColorKey, newValue);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const newValue = Math.max(-179, currentOffset - 1);
      onColorAdjust(selectedColorKey, newValue);
    }
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
          <div
            className="w-4 h-4 rounded"
            style={{ backgroundColor: colors[selectedColorKey] }}
            title={`Current ${colorName.toLowerCase()} color`}
          />
          <span className="font-medium" style={{ color: colors.base05 }}>
            {colorName} Hue Adjustment
          </span>
        </div>
        <button
          onClick={() => onColorSelect(null)}
          className="text-xs opacity-70 hover:opacity-100"
          style={{ color: colors.base04 }}
          title="Close color adjustment panel"
        >
          ✕ Close
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm" style={{ color: colors.base04 }}>
            Hue Offset from Standard Base16
          </span>
          <div className="flex items-center gap-1">
            <input
              type="number"
              min="-179"
              max="180"
              step="1"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsInputFocused(true)}
              onBlur={handleInputBlur}
              className="bg-black bg-opacity-10 border border-white border-opacity-20 text-white px-2 py-1 rounded text-xs w-16 text-right outline-none"
              style={{
                background: colors.base01,
                border: `1px solid ${colors.base02}`,
                color: colors.base05,
              }}
              title="Enter precise hue offset value (-179 to 180 degrees)"
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
            step="1"
            value={currentOffset}
            onChange={handleRangeChange}
            className="w-full h-4 rounded cursor-pointer outline-none appearance-none"
            style={{
              background: generateOffsetGradient(standardHue),
              WebkitAppearance: 'none',
            }}
            title="Drag to adjust hue offset. 0 = standard Base16 spacing"
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
            Standard {colorName.toLowerCase()}: {Math.round(standardHue)}°
            <span className="opacity-70" title="Base accent hue plus standard Base16 offset">
              {' '}
              (accent hue + {standardOffset}°)
            </span>
          </div>
          <div>
            Current {colorName.toLowerCase()}: {Math.round(currentHue)}°
            <span className="opacity-70" title="Standard color plus your custom adjustment">
              {' '}
              (standard + {currentOffset > 0 ? '+' : ''}
              {currentOffset}°)
            </span>
          </div>
          {themeOffset !== 0 && (
            <div>
              Theme's intended: {Math.round(themeIntendedHue)}°
              <span className="opacity-70" title="Theme designer's intended color for this slot">
                {' '}
                (standard + {themeOffset > 0 ? '+' : ''}
                {themeOffset}°)
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded border border-white border-opacity-30"
            style={{
              backgroundColor: `hsl(${currentHue}, 70%, 60%)`,
            }}
            title="Preview of current hue at standard saturation and lightness"
          />
          <span className="text-xs" style={{ color: colors.base04 }}>
            Preview: {Math.round(currentHue)}° at 70% saturation
          </span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onColorAdjust(selectedColorKey, 0)}
            className="flex-1 px-2 py-1 text-xs rounded border"
            style={{
              background: colors.base01,
              border: `1px solid ${colors.base02}`,
              color: colors.base05,
            }}
            title="Reset to standard Base16 color spacing (no adjustment)"
          >
            Reset to Standard (0°)
          </button>
          {themeOffset !== 0 && (
            <button
              onClick={() => onColorAdjust(selectedColorKey, themeOffset)}
              className="flex-1 px-2 py-1 text-xs rounded border"
              style={{
                background: colors.base01,
                border: `1px solid ${colors.base02}`,
                color: colors.base05,
              }}
              title="Reset to theme designer's intended color"
            >
              Reset to Theme ({themeOffset > 0 ? '+' : ''}
              {themeOffset}°)
            </button>
          )}
        </div>

        <div className="text-xs opacity-70 text-center" style={{ color: colors.base03 }}>
          Use ← → arrow keys for fine-tuning • Press Escape to close
          <br />
          Slider at 0 = Standard Base16 color spacing • Adjustments are preserved when accent hue
          rotates
        </div>
      </div>
    </div>
  );
};

interface ColorPaletteEditorProps {
  colors: Base24Colors;
  params: ThemeParams;
  selectedColorKey: AccentColorKey | null;
  getThemeOffset: (colorKey: AccentColorKey) => number;
  onColorSelect: (colorKey: AccentColorKey | null) => void;
  onColorAdjust: (colorKey: AccentColorKey, hueOffset: number) => void;
  onResetToDefault: (colorKey: AccentColorKey) => void;
}

const ColorPaletteEditor: React.FC<ColorPaletteEditorProps> = ({
  colors,
  params,
  selectedColorKey,
  getThemeOffset,
  onColorSelect,
  onColorAdjust,
  onResetToDefault,
}) => {
  const colorSections = Base24.COLOR_SECTIONS;

  const getCurrentOffset = (colorKey: AccentColorKey): number => {
    const themeOffset = getThemeOffset(colorKey);
    const userAdjustment = params.colorAdjustments?.[colorKey]?.hueOffset ?? 0;

    const totalOffset = themeOffset + userAdjustment;

    let sliderValue = totalOffset;
    while (sliderValue > 180) sliderValue -= 360;
    while (sliderValue <= -180) sliderValue += 360;

    return sliderValue;
  };

  const getCalculatedHue = (colorKey: AccentColorKey): number => {
    const baseHue = params.accentHue || 0;
    const standardOffset = Base24.getStandardOffset(colorKey);
    const themeOffset = getThemeOffset(colorKey);
    const userAdjustment = params.colorAdjustments?.[colorKey]?.hueOffset ?? 0;

    let finalHue = baseHue + standardOffset + themeOffset + userAdjustment;
    while (finalHue < 0) finalHue += 360;
    while (finalHue >= 360) finalHue -= 360;

    return finalHue;
  };

  const handleColorClick = (colorKey: AccentColorKey) => {
    if (selectedColorKey === colorKey) {
      onColorSelect(null);
    } else {
      onColorSelect(colorKey);
    }
  };

  const handleColorAdjust = (colorKey: AccentColorKey, sliderValue: number) => {
    const themeOffset = getThemeOffset(colorKey);
    const userAdjustment = sliderValue - themeOffset;

    onColorAdjust(colorKey, userAdjustment);
  };

  const ColorRow: React.FC<{
    title: string;
    colors: { key: string; name: string }[];
    editable?: boolean;
  }> = ({ title, colors: rowColors, editable = false }) => (
    <div className="space-y-2">
      <h5 className="text-xs font-medium" style={{ color: colors.base04 }}>
        {title}{' '}
        {editable && <span className="opacity-70">(Click any color to adjust its hue)</span>}
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
                title={`${name} (${key}) - Click to adjust hue individually. Currently ${Math.round(getCalculatedHue(key as AccentColorKey))}°`}
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
                title={`${name} (${key}) - Automatically generated, not individually editable`}
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
      {colorSections.map((section) => (
        <ColorRow
          key={section.title}
          title={section.title}
          colors={section.colors}
          editable={section.editable}
        />
      ))}

      {selectedColorKey && (
        <ColorAdjustmentPanel
          selectedColorKey={selectedColorKey}
          colors={colors}
          params={params}
          accentColors={Base24.ACCENT_COLORS}
          getCurrentOffset={getCurrentOffset}
          getCalculatedHue={getCalculatedHue}
          getThemeOffset={getThemeOffset}
          onColorSelect={onColorSelect}
          onColorAdjust={handleColorAdjust}
          onResetToDefault={onResetToDefault}
        />
      )}

      {!selectedColorKey && (
        <div className="text-center text-xs opacity-70" style={{ color: colors.base03 }}>
          💡 Click any accent color (middle row) to fine-tune its hue individually. <br />
          Slider at 0 = Standard Base16 color spacing • All adjustments are preserved when the
          accent hue rotates
        </div>
      )}
    </div>
  );
};

export default ColorPaletteEditor;
