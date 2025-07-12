# Lumina Theme System Design Document

## Core Architecture

**3-Level Parameter System:**

1. **Theme Level** - Base theme definition
2. **Flavor Level** - Calculated parameters
3. **Accent Adjustments** - Individual accent color tweaks

## Parameter Classification

**Theme-Level (from JSON):**

- `bgHue`, `bgSat`, `bgLight` - Background colors
- Theme metadata: `name`, `tagline`, `inspirations`

**Flavor-Level (from JSON):**

- `accentHue`, `accentSat`, `accentLight` - Base accent parameters
- `commentLight` - Comment visibility

**Accent Adjustments:**

- `accentOffsets` - Individual accent color tweaks
- Help with accessibility, readability, or overall appearance

**User Session Data:**

- User can override any parameter: theme-level, flavor-level, or accent adjustments
- Stored in sessionStorage, reset on new tab
- Can be exported to create new theme files

## Data Flow

- User session data is loaded from theme JSON on page load
- User can then modify parameter via UI
- User can export their session data for later use (e.g. to update theme JSON or personal use)

## Export Behavior

- User's `accentOffsets` → exported as `accentOffsets` in theme JSON

---

## Implementation Notes

- Currently only hue adjustments supported for accent colors
- Lightness/saturation kept uniform across accent colors to help colors stay uniform
