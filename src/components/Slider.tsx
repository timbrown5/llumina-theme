import { useState, useEffect } from 'react';
import { okhslToRgb, createGradientBg } from '../utils/colorUtils.ts';
import type { SliderType } from '../types/index.ts';

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  type: SliderType;
  currentHue?: number;
  currentSat?: number;
}

const Slider: React.FC<SliderProps> = ({
  label,
  value,
  min,
  max,
  onChange,
  type,
  currentHue,
  currentSat,
}) => {
  const [inputValue, setInputValue] = useState<string>(value.toString());
  const [isInputFocused, setIsInputFocused] = useState<boolean>(false);

  useEffect(() => {
    if (!isInputFocused) setInputValue(value.toString());
  }, [value, isInputFocused]);

  const getSliderBackground = (): string => {
    if (type === 'hue') {
      const hueStops = Array.from({ length: 13 }, (_, i) =>
        okhslToRgb(min + ((max - min) * i) / 12, 0.8, 0.6),
      );
      return createGradientBg(hueStops);
    }
    if (type === 'saturation') {
      return createGradientBg([
        '#808080',
        okhslToRgb(currentHue || 240, 1.0, 0.5),
      ]);
    }
    if (type === 'lightness') {
      const midColor = okhslToRgb(
        currentHue || 240,
        (currentSat || 50) / 100,
        0.5,
      );
      return createGradientBg(['#000000', midColor, '#ffffff']);
    }
    return '#4a5568';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newInputValue = e.target.value;
    setInputValue(newInputValue);
    const newValue = parseInt(newInputValue);
    if (!isNaN(newValue) && newValue >= min && newValue <= max) {
      onChange(newValue);
    }
  };

  const handleInputBlur = () => {
    setIsInputFocused(false);
    const newValue = parseInt(inputValue);
    if (!isNaN(newValue) && newValue >= min && newValue <= max) {
      onChange(newValue);
    } else {
      setInputValue(value.toString());
    }
  };

  const handleRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseInt(e.target.value));
  };

  return (
    <div className="my-3">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm">{label}</span>
        <div className="flex items-center gap-1">
          <input
            type="number"
            min={min}
            max={max}
            value={inputValue}
            onChange={handleInputChange}
            onFocus={() => setIsInputFocused(true)}
            onBlur={handleInputBlur}
            className="bg-black bg-opacity-10 border border-white border-opacity-20 text-white px-2 py-1 rounded text-xs w-16 text-right outline-none"
          />
          <span className="text-xs opacity-70 min-w-4">
            {type === 'hue' ? '°' : '%'}
          </span>
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={handleRangeChange}
        style={{ background: getSliderBackground() }}
        className="w-full h-2 rounded cursor-pointer outline-none"
      />
    </div>
  );
};

export default Slider;
