/**
 * Reusable button component with theme-aware styling and multiple variants.
 *
 * A foundational UI component that provides consistent button styling across
 * the application. The component automatically adapts to the current theme
 * colors and supports multiple visual styles to convey different interaction
 * types and states throughout the interface.
 *
 * Styling features:
 * - Theme-aware color adaptation using Base24 colors
 * - Multiple visual variants (primary, secondary, gradient styles)
 * - Active/selected state indication
 * - Smooth transitions and hover effects
 * - Flexible content support (text, icons, mixed content)
 */

import React from 'react';
import type { Base24Colors } from '../types/index.js';

interface ButtonProps {
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'gradient' | 'gradientWarm' | 'gradientRed';
  active?: boolean;
  children: React.ReactNode;
  colors: Base24Colors;
  className?: string;
  title?: string;
}

/**
 * Theme-aware button component with multiple visual variants.
 *
 * @param props - Button configuration and styling props
 * @param props.onClick - Click handler function
 * @param props.variant - Visual style variant (default: 'primary')
 * @param props.active - Whether button is in active/selected state
 * @param props.children - Button content (text, icons, etc.)
 * @param props.colors - Base24 color scheme for theming
 * @param props.className - Additional CSS classes
 * @param props.title - Tooltip text
 * @returns Styled button element
 */
const Button: React.FC<ButtonProps> = ({
  onClick,
  variant = 'primary',
  active = false,
  children,
  colors,
  className = '',
  title,
}) => {
  const variants: Record<string, string> = {
    primary: active ? colors.base0D : colors.base01,
    secondary: active ? colors.base0A : colors.base01,
    gradient: `linear-gradient(135deg, ${colors.base0E}, ${colors.base0D})`,
    gradientWarm: `linear-gradient(135deg, ${colors.base0A}, ${colors.base0B})`,
    gradientRed: `linear-gradient(135deg, ${colors.base08}, ${colors.base0F})`,
  };

  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        background: variants[variant],
        border: `1px solid ${active ? (variant === 'primary' ? colors.base0D : colors.base0A) : colors.base02}`,
        color: variant.includes('gradient') || active ? colors.base00 : colors.base05,
      }}
      className={`px-4 py-2 rounded cursor-pointer font-medium transition-all duration-200 ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
