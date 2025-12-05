# GitHub Actions Badges

Add these badges to your README.md to show workflow status:

## CI Status

```markdown
[![CI](https://github.com/Wick-Lim/flexium.js/actions/workflows/ci.yml/badge.svg)](https://github.com/Wick-Lim/flexium.js/actions/workflows/ci.yml)
```

Preview:
[![CI](https://github.com/Wick-Lim/flexium.js/actions/workflows/ci.yml/badge.svg)](https://github.com/Wick-Lim/flexium.js/actions/workflows/ci.yml)

## Release Status

```markdown
[![Release](https://github.com/Wick-Lim/flexium.js/actions/workflows/release.yml/badge.svg)](https://github.com/Wick-Lim/flexium.js/actions/workflows/release.yml)
```

Preview:
[![Release](https://github.com/Wick-Lim/flexium.js/actions/workflows/release.yml/badge.svg)](https://github.com/Wick-Lim/flexium.js/actions/workflows/release.yml)

## NPM Version Badges

### flexium
```markdown
[![npm version](https://badge.fury.io/js/flexium.svg)](https://www.npmjs.com/package/flexium)
[![npm downloads](https://img.shields.io/npm/dm/flexium.svg)](https://www.npmjs.com/package/flexium)
```

Preview:
[![npm version](https://badge.fury.io/js/flexium.svg)](https://www.npmjs.com/package/flexium)
[![npm downloads](https://img.shields.io/npm/dm/flexium.svg)](https://www.npmjs.com/package/flexium)

### create-flexium
```markdown
[![npm version](https://badge.fury.io/js/create-flexium.svg)](https://www.npmjs.com/package/create-flexium)
```

Preview:
[![npm version](https://badge.fury.io/js/create-flexium.svg)](https://www.npmjs.com/package/create-flexium)

### eslint-plugin-flexium
```markdown
[![npm version](https://badge.fury.io/js/eslint-plugin-flexium.svg)](https://www.npmjs.com/package/eslint-plugin-flexium)
```

Preview:
[![npm version](https://badge.fury.io/js/eslint-plugin-flexium.svg)](https://www.npmjs.com/package/eslint-plugin-flexium)

### vite-plugin-flexium
```markdown
[![npm version](https://badge.fury.io/js/vite-plugin-flexium.svg)](https://www.npmjs.com/package/vite-plugin-flexium)
```

Preview:
[![npm version](https://badge.fury.io/js/vite-plugin-flexium.svg)](https://www.npmjs.com/package/vite-plugin-flexium)

## Combined Badge Row

For a clean README header:

```markdown
[![CI](https://github.com/Wick-Lim/flexium.js/actions/workflows/ci.yml/badge.svg)](https://github.com/Wick-Lim/flexium.js/actions/workflows/ci.yml)
[![Release](https://github.com/Wick-Lim/flexium.js/actions/workflows/release.yml/badge.svg)](https://github.com/Wick-Lim/flexium.js/actions/workflows/release.yml)
[![npm version](https://badge.fury.io/js/flexium.svg)](https://www.npmjs.com/package/flexium)
[![npm downloads](https://img.shields.io/npm/dm/flexium.svg)](https://www.npmjs.com/package/flexium)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
```

Preview:
[![CI](https://github.com/Wick-Lim/flexium.js/actions/workflows/ci.yml/badge.svg)](https://github.com/Wick-Lim/flexium.js/actions/workflows/ci.yml)
[![Release](https://github.com/Wick-Lim/flexium.js/actions/workflows/release.yml/badge.svg)](https://github.com/Wick-Lim/flexium.js/actions/workflows/release.yml)
[![npm version](https://badge.fury.io/js/flexium.svg)](https://www.npmjs.com/package/flexium)
[![npm downloads](https://img.shields.io/npm/dm/flexium.svg)](https://www.npmjs.com/package/flexium)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Additional Badges

### Code Quality
```markdown
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
```

### Bundle Size (using bundlephobia)
```markdown
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/flexium)](https://bundlephobia.com/package/flexium)
```

## Custom Badge Colors

GitHub Actions badges automatically show:
- 🟢 Green: Workflow passing
- 🔴 Red: Workflow failing
- 🟡 Yellow: Workflow running
- ⚪ Gray: No runs / disabled

## Badge Links

All badges link to:
- CI/Release badges → GitHub Actions workflow runs
- NPM badges → Package page on npmjs.com
- License badge → License file

## Usage Example in README

```markdown
# Flexium.js

[![CI](https://github.com/Wick-Lim/flexium.js/actions/workflows/ci.yml/badge.svg)](https://github.com/Wick-Lim/flexium.js/actions/workflows/ci.yml)
[![npm version](https://badge.fury.io/js/flexium.svg)](https://www.npmjs.com/package/flexium)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A lightweight, signals-based UI framework...

## Installation

\`\`\`bash
npm install flexium
# or
npx create-flexium my-app
\`\`\`
```

## Tips

- Place badges at the top of README for visibility
- Keep badge row to 4-5 badges for clean look
- Use relevant badges only (CI, version, license)
- Badges auto-update when workflows run
- No manual updates needed!
