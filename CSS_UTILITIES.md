# CSS Utilities Documentation

## Overview
Enhanced CSS utility classes for the BTC DCA Intel application, implementing mobile-first responsive design with improved themes and comprehensive utility classes.

## New Utility Classes

### Typography Classes
- `.text-h1` - Large heading (responsive: 4xl → 5xl → 6xl)
- `.text-h2` - Medium heading (responsive: 3xl → 4xl → 5xl)
- `.text-h3` - Small heading (2xl)
- `.text-h4` - Extra small heading (xl)
- `.text-subheader` - Subheader text with muted color
- `.text-emphasis` - Emphasized text
- `.text-subtle` - Subtle text (small, muted)
- `.text-caption` - Caption text (extra small, muted)

### Layout & Flexbox Utilities
- `.flex-center` - Flex with center alignment (both axes)
- `.flex-between` - Flex with space-between alignment
- `.flex-start` - Flex with start alignment
- `.flex-end` - Flex with end alignment
- `.flex-col-center` - Flex column with center alignment
- `.flex-col-start` - Flex column with start alignment

### Spacing Utilities (Mobile-First)
**Base spacing:**
- `.space-xs` - 0.5rem gap
- `.space-sm` - 0.75rem gap
- `.space-md` - 1rem gap
- `.space-lg` - 1.5rem gap
- `.space-xl` - 2rem gap

**Responsive variants:**
- `.sm:space-*` - Small screens (640px+)
- `.md:space-*` - Medium screens (768px+)
- `.lg:space-*` - Large screens (1024px+)
- `.xl:space-*` - Extra large screens (1280px+)
- `.2xl:space-*` - 2XL screens (1536px+)

**Padding utilities:**
- `.p-xs` through `.p-xl` with responsive variants
- Progressive enhancement: `.sm:p-*`, `.md:p-*`, `.lg:p-*`, etc.

**Margin utilities:**
- `.m-xs` through `.m-xl` with responsive variants
- Progressive enhancement: `.sm:m-*`, `.md:m-*`, `.lg:m-*`, etc.

### Visibility Utilities (Mobile-First)
- `.hidden-xs` - Hidden on extra small screens, visible on sm+
- `.hidden-sm` - Hidden on small screens and up
- `.hidden-md` - Hidden on medium screens and up
- `.hidden-lg` - Hidden on large screens and up
- `.hidden-xl` - Hidden on extra large screens and up

### Border Radius
- `.rounded-lg` - Large radius (0.75rem)
- `.rounded-xl` - Extra large radius (1rem)

### Shadow Effects
- `.shadow-custom-sm` - Small shadow
- `.shadow-custom-md` - Medium shadow
- `.shadow-custom-lg` - Large shadow
- `.shadow-custom-xl` - Extra large shadow

### Glow Effects
- `.glow-primary` - Primary color glow
- `.glow-success` - Success color glow
- `.glow-destructive` - Destructive color glow

### Financial Price Styling
- `.price-up` - Green color for price increases
- `.price-down` - Red color for price decreases

## Enhanced Theme Variables

### New Color Variables
**Light theme additions:**
- `--tertiary` / `--tertiary-foreground` - Tertiary action colors
- `--success` / `--success-foreground` - Success state colors
- `--warning` / `--warning-foreground` - Warning state colors
- `--info` / `--info-foreground` - Info state colors

**Dark theme:**
- Corresponding dark variants for all new colors
- Improved contrast ratios for better accessibility

### Enhanced Shadows
**Light theme:**
- Realistic shadows using subtle dark colors with proper opacity
- Better depth perception with multi-layer shadows

**Dark theme:**
- Stronger shadows using black with higher opacity
- Appropriate for dark backgrounds

### Additional Variables
- `--radius-lg` (0.75rem) - Large border radius
- `--radius-xl` (1rem) - Extra large border radius

## Mobile-First Design Approach

The utility classes follow a mobile-first design philosophy:

1. **Base styles** apply to all screen sizes (mobile-first)
2. **Progressive enhancement** adds styles for larger screens
3. **Breakpoints:**
   - `sm:` 640px and up (tablets)
   - `md:` 768px and up (small desktops)
   - `lg:` 1024px and up (desktops)
   - `xl:` 1280px and up (large desktops)
   - `2xl:` 1536px and up (very large desktops)

## Usage Examples

### Typography
```html
<h1 class="text-h1">Main Heading</h1>
<h2 class="text-h2">Section Heading</h2>
<p class="text-subheader">Descriptive text</p>
<span class="text-emphasis">Important information</span>
```

### Responsive Spacing
```html
<!-- Mobile: small padding, Tablet: medium, Desktop: large -->
<div class="p-sm sm:p-md lg:p-xl">
  Responsive content
</div>
```

### Layout
```html
<div class="flex-between p-md">
  <span>Left content</span>
  <span>Right content</span>
</div>

<div class="flex-col-center space-lg">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

### Financial Data
```html
<div class="price-up">+$1,234.56 (↑ 5.2%)</div>
<div class="price-down">-$567.89 (↓ 2.1%)</div>
```

### Responsive Visibility
```html
<!-- Hidden on mobile, visible on tablet+ -->
<div class="hidden-xs">
  Advanced features panel
</div>
```

## Accessibility Improvements

- Enhanced color contrast ratios for better readability
- Improved focus states with proper ring colors
- Better shadow definitions for depth perception
- Semantic color naming (success, warning, info, destructive)

## Performance Considerations

- All utilities use CSS custom properties for efficient theme switching
- Mobile-first approach reduces CSS payload for mobile devices
- Utility classes prevent CSS duplication
- Tailwind CSS purging removes unused styles in production