# ✨ Lumina Theme Generator

Create beautiful Base24 themes for Neovim and terminals with real-time preview and customization.

## Features

- 🎨 **4 Preset Themes**: Midnight, Twilight, Dawn, and Noon
- 🎯 **3 Flavor Variants**: Pastel, Normal, and High-Contrast
- ⚡ **Real-time Preview**: See changes instantly across multiple languages
- 🔧 **Full Customization**: Adjust hue, saturation, and lightness
- 📱 **Responsive Design**: Works on desktop and mobile
- 📋 **Multiple Export Formats**: Neovim Lua, Base24 JSON, and raw parameters
- 🌈 **Syntax Highlighting**: JavaScript, Python, C++, and Terminal examples

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
│   ├── Slider.jsx              # Color adjustment slider
│   └── SyntaxPreview.jsx       # Syntax highlighting preview
├── constants/
│   └── index.js                # All configuration constants
├── hooks/
│   └── useThemeLogic.js        # Main theme state management
├── utils/
│   ├── colorUtils.js           # Color conversion functions
│   └── exportUtils.js          # Theme export functions
├── App.jsx                     # Main application component
├── main.jsx                    # React entry point
└── index.css                   # Global styles
```

## Usage

1. **Select a Base Theme**: Choose from Midnight, Twilight, Dawn, or Noon
2. **Pick a Flavor**: Select Pastel, Normal, or High-Contrast
3. **Customize Colors**: Use the sliders to adjust hue, saturation, and lightness
4. **Preview**: Switch between Colors, JavaScript, Python, C++, and Terminal tabs
5. **Export**: Copy your theme as Neovim Lua, Base24 JSON, or raw parameters

## Base24 Color Specification

This generator follows the [Base24 specification](https://github.com/tinted-theming/base24), which extends Base16 with 8 additional colors for full terminal support:

- **base00-base07**: Background and foreground variations
- **base08-base0F**: Standard Base16 accent colors
- **base10-base17**: Additional muted accent colors

## Export Formats

### Neovim Theme

Complete Lua theme file ready for `~/.config/nvim/lua/colors/`

### Base24 JSON

Standard Base24 format compatible with most theme builders

### Parameters

Raw slider values and generated colors for debugging

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
- Color conversion based on OKHSL color space
