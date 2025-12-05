# Flexium Accessibility (a11y) Demo

A comprehensive demonstration of web accessibility patterns using Flexium, showcasing WCAG 2.1 AA compliance and best practices for building inclusive web applications.

## Features Demonstrated

### 1. ARIA Attributes & Semantic HTML
- Proper use of ARIA roles (`role="dialog"`, `role="alert"`, `role="tabpanel"`, etc.)
- ARIA properties (`aria-label`, `aria-labelledby`, `aria-describedby`)
- ARIA states (`aria-invalid`, `aria-required`, `aria-expanded`, `aria-selected`)
- ARIA live regions for dynamic content announcements
- Semantic HTML5 elements (`<main>`, `<section>`, `<header>`, etc.)

### 2. Keyboard Navigation
- **Tab Navigation**: Navigate through all interactive elements
- **Enter/Space**: Activate buttons and form controls
- **Escape**: Close modal dialogs
- **Shift+Tab**: Navigate backwards
- Focus indicators on all interactive elements
- Logical tab order throughout the application

### 3. Focus Management
- Skip link to main content (press Tab on page load)
- Focus trap in modal dialogs
- Automatic focus restoration when closing modals
- Clear, visible focus indicators with 3px outline
- Focus moves to first error field on form validation failure

### 4. Form Accessibility
- Proper label associations using `htmlFor` and `id`
- Required field indicators (visual and programmatic)
- Inline validation with error messages
- Error announcements via `role="alert"`
- Helper text for all form fields
- `aria-describedby` linking fields to their descriptions
- `aria-invalid` for fields with errors
- Disabled submit button when form is invalid

### 5. Screen Reader Support
- Live region announcements for:
  - Form submission success/failure
  - Task additions, completions, and deletions
  - Modal open/close events
  - Notification messages
- Descriptive labels for all interactive elements
- Proper heading hierarchy (h1 > h2 > h3)
- Alternative text for all meaningful content

### 6. Color Contrast (WCAG AA)
All color combinations meet WCAG 2.1 AA standards:
- **Normal text**: Minimum contrast ratio of 4.5:1
- **Large text**: Minimum contrast ratio of 3:1
- **Interactive elements**: Clear visual distinction
- High contrast mode support via CSS media query

### 7. Modal Dialogs
- Proper `role="dialog"` and `aria-modal="true"`
- Focus trap within modal (Tab cycles through modal elements only)
- Escape key to close
- Focus restoration to trigger element
- Click outside to close (with proper event handling)
- Accessible title and description using `aria-labelledby` and `aria-describedby`

### 8. Dynamic Content & Notifications
- Toast notifications with auto-dismiss
- Live region announcements
- Visual and programmatic status updates
- Non-intrusive notification positioning

### 9. Responsive & Reduced Motion
- Mobile-responsive design
- Support for `prefers-reduced-motion` media query
- No animations for users who prefer reduced motion
- Touch-friendly interactive elements

## WCAG 2.1 AA Compliance Checklist

### Perceivable
- [x] 1.1.1 Non-text Content (Level A)
- [x] 1.3.1 Info and Relationships (Level A)
- [x] 1.3.2 Meaningful Sequence (Level A)
- [x] 1.3.3 Sensory Characteristics (Level A)
- [x] 1.4.1 Use of Color (Level A)
- [x] 1.4.3 Contrast (Minimum) (Level AA) - 4.5:1 ratio
- [x] 1.4.4 Resize Text (Level AA)
- [x] 1.4.10 Reflow (Level AA)
- [x] 1.4.11 Non-text Contrast (Level AA)
- [x] 1.4.12 Text Spacing (Level AA)
- [x] 1.4.13 Content on Hover or Focus (Level AA)

### Operable
- [x] 2.1.1 Keyboard (Level A)
- [x] 2.1.2 No Keyboard Trap (Level A)
- [x] 2.1.4 Character Key Shortcuts (Level A)
- [x] 2.4.1 Bypass Blocks (Level A) - Skip link
- [x] 2.4.2 Page Titled (Level A)
- [x] 2.4.3 Focus Order (Level A)
- [x] 2.4.4 Link Purpose (In Context) (Level A)
- [x] 2.4.5 Multiple Ways (Level AA)
- [x] 2.4.6 Headings and Labels (Level AA)
- [x] 2.4.7 Focus Visible (Level AA)
- [x] 2.5.3 Label in Name (Level A)

### Understandable
- [x] 3.1.1 Language of Page (Level A)
- [x] 3.2.1 On Focus (Level A)
- [x] 3.2.2 On Input (Level A)
- [x] 3.2.3 Consistent Navigation (Level AA)
- [x] 3.2.4 Consistent Identification (Level AA)
- [x] 3.3.1 Error Identification (Level A)
- [x] 3.3.2 Labels or Instructions (Level A)
- [x] 3.3.3 Error Suggestion (Level AA)
- [x] 3.3.4 Error Prevention (Legal, Financial, Data) (Level AA)

### Robust
- [x] 4.1.1 Parsing (Level A)
- [x] 4.1.2 Name, Role, Value (Level A)
- [x] 4.1.3 Status Messages (Level AA)

## Testing the Example

### 1. Keyboard Navigation Testing
1. Open the demo in your browser
2. Press `Tab` - the skip link should appear
3. Press `Tab` again to navigate through all interactive elements
4. Verify focus indicators are visible on all elements
5. Try `Enter` and `Space` to activate buttons
6. Open a modal and press `Escape` to close it
7. Verify Tab is trapped within the modal when open

### 2. Screen Reader Testing

#### With NVDA (Windows)
```bash
# Download NVDA: https://www.nvaccess.org/download/
# Start NVDA and navigate the demo
# Press Insert+Down Arrow to enter browse mode
# Use Tab to navigate through interactive elements
```

#### With JAWS (Windows)
```bash
# JAWS is commercial software
# Use similar navigation patterns to NVDA
```

#### With VoiceOver (macOS)
```bash
# Enable VoiceOver: Cmd+F5
# Navigate with VO+Right Arrow
# Interact with elements using VO+Space
```

#### With Narrator (Windows)
```bash
# Enable Narrator: Win+Ctrl+Enter
# Navigate with Tab and arrow keys
```

### 3. Color Contrast Testing
Use browser extensions or online tools:
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Lighthouse Accessibility Audit](https://developers.google.com/web/tools/lighthouse)
- Browser DevTools (Chrome/Edge: Inspect > Accessibility)

### 4. Automated Testing
```bash
# Using axe-core DevTools extension
# 1. Install axe DevTools browser extension
# 2. Open the demo
# 3. Open DevTools > axe DevTools tab
# 4. Click "Scan ALL of my page"

# Using pa11y (command line)
npm install -g pa11y
pa11y http://localhost:3000
```

## Running the Example

### Development Mode
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

### Production Build
```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Key Accessibility Patterns

### Skip Link Pattern
```html
<a href="#main-content" class="skip-link">Skip to main content</a>
```
- Hidden by default
- Visible on focus
- Allows keyboard users to bypass navigation

### Form Validation Pattern
```tsx
<input
  id="email"
  type="email"
  aria-required="true"
  aria-invalid={hasError ? "true" : "false"}
  aria-describedby="email-error email-helper"
/>
<span id="email-helper">Helper text</span>
<span id="email-error" role="alert">Error message</span>
```

### Modal Dialog Pattern
```tsx
<div role="dialog" aria-modal="true" aria-labelledby="dialog-title">
  <h2 id="dialog-title">Dialog Title</h2>
  {/* Focus trap implemented */}
  {/* Escape key closes dialog */}
</div>
```

### Live Region Pattern
```tsx
<div aria-live="polite" aria-atomic="true">
  {/* Dynamic content announcements */}
</div>
```

## Resources

### WCAG Guidelines
- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [WCAG 2.1 Understanding Docs](https://www.w3.org/WAI/WCAG21/Understanding/)

### ARIA Specifications
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [ARIA Specification](https://www.w3.org/TR/wai-aria-1.2/)

### Testing Tools
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE Browser Extension](https://wave.webaim.org/extension/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [pa11y](https://pa11y.org/)
- [axe-core](https://github.com/dequelabs/axe-core)

### Screen Readers
- [NVDA](https://www.nvaccess.org/) (Free, Windows)
- [JAWS](https://www.freedomscientific.com/products/software/jaws/) (Commercial, Windows)
- [VoiceOver](https://www.apple.com/accessibility/voiceover/) (Built-in, macOS/iOS)
- [TalkBack](https://support.google.com/accessibility/android/answer/6283677) (Built-in, Android)
- [Narrator](https://support.microsoft.com/en-us/windows/complete-guide-to-narrator-e4397a0d-ef4f-b386-d8ae-c172f109bdb1) (Built-in, Windows)

### Learning Resources
- [WebAIM](https://webaim.org/)
- [A11y Project](https://www.a11yproject.com/)
- [Inclusive Components](https://inclusive-components.design/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

## Common Accessibility Pitfalls to Avoid

1. **Don't remove focus outlines** - They're essential for keyboard users
2. **Don't use placeholders as labels** - They disappear when typing
3. **Don't rely solely on color** - Use text, icons, or patterns too
4. **Don't create keyboard traps** - Except in modals, and provide escape
5. **Don't hide content with `display: none`** that should be announced
6. **Don't use `<div>` or `<span>` for buttons** - Use `<button>`
7. **Don't forget to test with real users** - Including those with disabilities
8. **Don't use `tabindex` > 0** - It breaks natural tab order
9. **Don't create hover-only interactions** - Keyboard users can't hover
10. **Don't disable zoom** - Many users need to zoom to read

## Browser Support

This example works in all modern browsers with full accessibility support:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+

## License

This example is part of the Flexium project and follows the same license.

## Contributing

Found an accessibility issue? Please report it! Accessibility is an ongoing process, and we welcome feedback and contributions to make this example even better.

## Credits

Built with Flexium - A lightweight, reactive framework for building accessible web applications.
