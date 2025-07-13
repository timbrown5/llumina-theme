/**
 * Color display components for showing organized Base24 color groups.
 *
 * Provides specialized components for visualizing color schemes in different
 * formats to help users understand color relationships and organization.
 * These components serve as the foundation for color presentation throughout
 * the theme editor interface.
 *
 * Display components:
 * - ColorList for vertical color lists with names and swatches
 * - ColorPalette for compact horizontal color grids
 * - Automatic color organization by Base24 specification
 * - Interactive color swatches with metadata tooltips
 * - Responsive layout adaptation for different screen sizes
 */

import React from 'react';
import type { Base24Colors, ColorGroup } from '../types/index.js';

interface ColorListProps {
  title: string;
  colors: Base24Colors;
  colorData: ColorGroup[];
}

/**
 * Displays a vertical list of colors with names and color swatches.
 *
 * @param props - Color list configuration
 * @param props.title - Section title for the color group
 * @param props.colors - Complete Base24 color scheme
 * @param props.colorData - Metadata for colors to display
 * @returns Formatted color list with swatches and labels
 */
export const ColorList: React.FC<ColorListProps> = ({ title, colors, colorData }) => (
  <div>
    <h5 style={{ color: colors.base04 }} className="text-sm text-center mb-2">
      {title}
    </h5>
    {colorData.map(({ key, name }) => (
      <div key={key} className="flex items-center gap-2 mb-1">
        <div
          style={{ backgroundColor: colors[key as keyof Base24Colors] }}
          className="w-4 h-4 rounded border border-white border-opacity-20"
        />
        <span className="text-sm">{name}</span>
      </div>
    ))}
  </div>
);

interface ColorPaletteProps {
  colors: Base24Colors;
  colorKeys: string[];
}

/**
 * Displays colors in a compact horizontal palette format.
 *
 * @param props - Palette configuration
 * @param props.colors - Complete Base24 color scheme
 * @param props.colorKeys - Array of color keys to display
 * @returns Grid of color swatches with Base24 identifiers
 */
export const ColorPalette: React.FC<ColorPaletteProps> = ({ colors, colorKeys }) => (
  <div className="flex gap-1 mb-1">
    {colorKeys.map((colorKey) => (
      <div
        key={colorKey}
        style={{
          backgroundColor: colors[colorKey as keyof Base24Colors],
          textShadow: '0 0 2px rgba(0,0,0,0.8)',
        }}
        className="w-10 h-10 rounded border border-white border-opacity-20 cursor-pointer flex items-center justify-center text-sm font-bold text-white"
      >
        {colorKey.slice(-2)}
      </div>
    ))}
  </div>
);
