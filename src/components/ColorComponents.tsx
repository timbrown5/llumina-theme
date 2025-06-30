import type { Base24Colors, ColorGroup } from '../types/index.ts';

interface ColorListProps {
  title: string;
  colors: Base24Colors;
  colorData: ColorGroup[];
}

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
