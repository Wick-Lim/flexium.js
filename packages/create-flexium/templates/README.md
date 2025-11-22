# Flexium Starter Templates

Ready-to-use starter templates to help you start building with Flexium immediately.

## Available Templates

### 1. Vite Starter (Recommended)
**Location:** `vite-starter/`
**Best for:** Production applications, TypeScript projects, modern tooling

Modern setup with Vite, TypeScript, and Hot Module Replacement (HMR). Includes all the configuration you need to start building a production-ready Flexium application.

**Features:**
- Vite for lightning-fast builds and HMR
- TypeScript with strict mode
- JSX support with automatic runtime
- ESLint and Prettier configured
- Production build optimization
- Example counter component

**Quick Start:**
```bash
cd templates/vite-starter
npm install
npm run dev
```

### 2. Vanilla Starter
**Location:** `vanilla-starter/`
**Best for:** Learning, prototyping, simple projects

Zero build tools. Just open the HTML file in a browser and start coding. Perfect for learning Flexium or creating simple prototypes.

**Features:**
- Single HTML file
- No build process required
- Works directly in browser
- Uses Flexium from CDN (or local dist)
- Commented examples
- Mobile responsive

**Quick Start:**
```bash
cd templates/vanilla-starter
# Serve with any HTTP server
python3 -m http.server 8000
# Open http://localhost:8000
```

### 3. Todo App Template
**Location:** `todo-app-template/`
**Best for:** Learning all Flexium features, reference implementation

Complete, production-ready todo application demonstrating all Flexium features. Use this as a reference or starting point for your own application.

**Features:**
- Full CRUD operations
- Form validation with reactive errors
- Multiple filters and search
- Local storage persistence
- Computed values and derived state
- Effects for side effects
- Professional UI/UX design
- Mobile responsive
- Comprehensive comments

**Quick Start:**
```bash
cd templates/todo-app-template
# Serve with any HTTP server
python3 -m http.server 8000
# Open http://localhost:8000
```

## Which Template Should I Use?

### Choose Vite Starter if you want:
- Production-ready setup
- TypeScript type safety
- Modern development experience
- Component-based architecture
- Build optimization
- Team collaboration

### Choose Vanilla Starter if you want:
- Learn Flexium basics
- Quick prototyping
- No build complexity
- Browser-only development
- Educational purposes
- Share demos easily

### Choose Todo App Template if you want:
- See all features in action
- Reference implementation
- Copy patterns for your app
- Learn best practices
- Understand state management
- Production-quality example

## How to Use These Templates

### Method 1: Copy the Template
```bash
# Copy the template you want
cp -r templates/vite-starter my-flexium-app
cd my-flexium-app

# Install Flexium
npm install flexium

# Start developing
npm run dev
```

### Method 2: Use as Reference
Browse the templates online or locally to learn patterns and copy code snippets into your existing project.

### Method 3: Modify and Extend
Start with a template and customize it for your specific needs. All templates are designed to be easily modified.

## Template Structure

Each template includes:
- **README.md** - Setup instructions and features
- **Source files** - Commented example code
- **Configuration** - Build and development setup
- **.gitignore** - Common ignore patterns (where applicable)

## Common Setup Steps

### For Vite-based Templates:

```bash
# 1. Navigate to template
cd templates/vite-starter

# 2. Install dependencies
npm install

# 3. Start dev server
npm run dev

# 4. Build for production
npm run build

# 5. Preview production build
npm run preview
```

### For Vanilla Templates:

```bash
# 1. Navigate to template
cd templates/vanilla-starter

# 2. Start HTTP server
python3 -m http.server 8000
# OR
npx serve

# 3. Open browser to http://localhost:8000
```

## Customization Tips

### Styling
All templates use inline CSS in a `<style>` tag for simplicity. For production:
- Extract to separate CSS files
- Use CSS-in-JS solutions
- Add Tailwind CSS or your preferred framework

### State Management
Templates demonstrate local component state. For larger apps:
- Create separate state management files
- Use Flexium signals as global stores
- Implement persistence layers
- Add state debugging

### Routing
Templates are single-page. To add routing:
- Use a lightweight router (e.g., page.js, navigo)
- Implement signal-based route state
- Create route components
- Add navigation components

### API Integration
Templates use mock data. To add real APIs:
- Create service modules for API calls
- Use signals for loading/error states
- Implement data fetching hooks
- Add error handling and retry logic

## Requirements

### For Vite Templates:
- Node.js 18 or higher
- npm, yarn, or pnpm
- Modern browser with ES6+ support

### For Vanilla Templates:
- Modern browser with ES6+ support
- HTTP server (for development)
- No Node.js required

## Troubleshooting

### CORS Errors
**Problem:** Module loading fails with CORS errors
**Solution:** Always use an HTTP server, never open HTML files directly with `file://`

### Module Not Found
**Problem:** Import errors in Vite templates
**Solution:** Run `npm install` to install all dependencies

### TypeScript Errors
**Problem:** Type errors in Vite templates
**Solution:** Ensure `flexium` is installed and TypeScript is configured correctly

### HMR Not Working
**Problem:** Changes don't reflect in Vite dev server
**Solution:** Check console for errors, restart dev server if needed

## Next Steps

After choosing and setting up a template:

1. **Read the template's README** - Each template has specific documentation
2. **Explore the code** - All code is heavily commented
3. **Make it your own** - Customize and extend as needed
4. **Read the docs** - Check `/docs` for comprehensive guides
5. **Join the community** - Share what you build!

## Contributing

Found a bug or have an improvement?
1. Open an issue describing the problem
2. Submit a PR with fixes or enhancements
3. Update template documentation as needed

## License

MIT - Use these templates freely in your projects!

---

**Built with Flexium - Fine-grained reactivity for modern UIs**
