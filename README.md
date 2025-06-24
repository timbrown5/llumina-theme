# ✨ Lumina Theme Generator

Create beautiful Base24 themes for Neovim and terminals with real-time preview and customization.

## Features

- 🎨 **4 Preset Themes**: Midnight, Twilight, Dawn, and Noon
- 🎯 **3 Flavor Variants**: Pastel, Normal, and High-Contrast
- ⚡ **Real-time Preview**: See changes instantly across multiple languages
- 🔧 **Full Customization**: Adjust hue, saturation, and lightness with visual feedback
- 📱 **Responsive Design**: Works on desktop and mobile
- 📋 **Multiple Export Formats**: Neovim Lua, Base24 JSON, and raw parameters
- 🌈 **Syntax Highlighting**: JavaScript, Python, C++, and Terminal examples

## Color Generation System

### Base24 Color Specification

Lumina follows the [Base24 specification](https://github.com/tinted-theming/base24), which extends Base16 with 8 additional colors for full terminal support:

- **base00-base07**: Background and foreground variations
- **base08-base0F**: Standard accent colors (red, orange, yellow, green, cyan, blue, purple, pink)
- **base10-base17**: Muted versions of the accent colors

### How Colors Are Generated

#### 1. Background Colors (base00-base07)

- **base00**: Main background color using theme's `bgHue`, `bgSat`, and `bgLight`
- **base01**: Slightly lighter/darker background for panels and sidebars
- **base02**: Selection background with increased saturation
- **base03**: Comment color with complementary hue and reduced saturation
- **base04-base07**: Foreground variations from dark to light text

#### 2. Accent Colors (base08-base0F)

Starting from the `accentHue` parameter, colors are distributed around the color wheel:

```
Red:    accentHue + 0°    (base08)
Orange: accentHue + 30°   (base09)
Yellow: accentHue + 60°   (base0A)
Green:  accentHue + 150°  (base0B)
Cyan:   accentHue + 180°  (base0C)
Blue:   accentHue + 210°  (base0D)
Purple: accentHue + 270°  (base0E)
Pink:   accentHue + 330°  (base0F)
```

#### 3. Muted Colors (base10-base17)

Muted versions of accent colors with:

- **25% less saturation** than their accent counterparts
- **10% more lightness** for better subtlety

### Theme Parameters

Each theme is defined by these core parameters:

#### Background Parameters

- **bgHue** (-180° to 180°): Base hue for backgrounds and UI elements
- **bgSat** (0-100%): Saturation level of background colors
- **bgLight** (0-100%): Lightness level, determines if theme is dark or light

#### Accent Parameters

- **accentHue** (-180° to 180°): Hue shift for all accent colors
- **accentSat** (0-100%): Saturation level of accent colors
- **accentLight** (0-100%): Lightness level of accent colors

#### Comment Parameters

- **commentLight** (0-100%): Lightness level for comments and subtle text

### Theme Variants

#### Base Themes

1. **Midnight**: Deep purple backgrounds (270°, 25% sat, 6% light)
2. **Twilight**: Blue evening backgrounds (242°, 40% sat, 16% light)
3. **Dawn**: Warm pink backgrounds (320°, 35% sat, 18% light)
4. **Noon**: Light golden backgrounds (45°, 20% sat, 95% light)

#### Flavor Variants

- **Pastel**: Lower saturation, higher lightness for gentle colors
- **Normal**: Balanced saturation and lightness for everyday use
- **High-Contrast**: Higher saturation, lower lightness for maximum readability

### Customization

The visual sliders provide immediate feedback:

- **Hue sliders**: Show full color wheel from red through spectrum back to red
- **Saturation sliders**: Gray to full color based on current hue
- **Lightness sliders**: Dark to light based on current hue and saturation

### Color Space

Lumina uses the **OKHSL color space** for more perceptually uniform color generation, ensuring:

- Consistent perceived brightness across hues
- Smooth gradients and transitions
- Better color harmony and balance

## Quick Start

### Using devenv (Recommended)

```bash
git clone https://github.com/yourusername/lumina-theme-generator.git
cd lumina-theme-generator
devenv shell
npm install
npm run dev
```

### Using Node.js directly

```bash
git clone https://github.com/yourusername/lumina-theme-generator.git
cd lumina-theme-generator
npm install
npm run dev
```

### GitHub Codespaces

1. Click "Use this template" → "Open in a codespace"
2. Wait for the environment to setup
3. Run `npm install && npm run dev`
4. Open the preview when prompted

## Project Structure

```
src/
├── components/
│   ├── Button.jsx              # Reusable button component
│   ├── ColorComponents.jsx     # Color list and palette components
│   ├── Slider.jsx              # Color adjustment slider with visual feedback
│   └── SyntaxPreview.jsx       # Syntax highlighting preview
├── constants/
│   └── index.js                # Theme data and configuration constants
├── hooks/
│   └── useThemeLogic.js        # Main theme state management
├── utils/
│   ├── colorUtils.js           # OKHSL color conversion and generation
│   └── exportUtils.js          # Theme export functions
├── App.jsx                     # Main application component
├── main.jsx                    # React entry point
└── index.css                   # Global styles
```

## Usage

1. **Select a Base Theme**: Choose from Midnight, Twilight, Dawn, or Noon
2. **Pick a Flavor**: Select Pastel, Normal, or High-Contrast
3. **Customize Colors**: Use the visual sliders to adjust hue, saturation, and lightness
4. **Preview**: Switch between Colors, JavaScript, Python, C++, and Terminal tabs
5. **Export**: Copy your theme as Neovim Lua, Base24 JSON, or raw parameters

## Export Formats

### Neovim Theme

Complete Lua theme file ready for `~/.config/nvim/lua/colors/`

### Base24 JSON

Standard Base24 format compatible with most theme builders

### Parameters

Raw slider values and theme data in JSON format that can be copied back into the theme configuration

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## License

MIT

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Credits

- Built with React + Vite
- Uses Base24 color specification
- Inspired by Base16 ecosystem
- Color conversion based on OKHSL color space for perceptual uniformity
