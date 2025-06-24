import type { Base24Colors } from '../types/index.ts';

interface ButtonProps {
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'gradient' | 'gradientWarm' | 'gradientRed';
  active?: boolean;
  children: React.ReactNode;
  colors: Base24Colors;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  onClick,
  variant = 'primary',
  active = false,
  children,
  colors,
  className = '',
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
