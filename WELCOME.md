# Welcome to Flexium!

Thank you for your interest in contributing to Flexium! We're excited to have you here.

This guide will help you get started with contributing, whether you're fixing a typo, adding a feature, or improving documentation.

## Table of Contents

- [First Steps](#first-steps)
- [Ways to Contribute](#ways-to-contribute)
- [Where to Start](#where-to-start)
- [Development Setup](#development-setup)
- [Understanding the Codebase](#understanding-the-codebase)
- [Making Your First Contribution](#making-your-first-contribution)
- [Getting Help](#getting-help)
- [Community Guidelines](#community-guidelines)
- [Recognition](#recognition)

---

## First Steps

### 1. Introduce Yourself

Drop by our Discord (coming soon!) or open a GitHub Discussion to say hi! We'd love to know:
- What brings you to Flexium?
- What's your experience level?
- What are you interested in working on?

### 2. Explore the Project

Before diving in, take some time to:
- Read the [README](/README.md) to understand what Flexium is
- Check out the [examples](/examples) to see Flexium in action
- Browse the [documentation](/docs) to learn the API
- Review [PROJECT_STATUS](/PROJECT_STATUS.md) to understand current state

### 3. Set Up Your Environment

Follow the [Development Setup](#development-setup) section below to get Flexium running locally.

---

## Ways to Contribute

You don't need to be a coding expert to contribute! Here are many ways to help:

### Non-Code Contributions

#### Documentation
- Fix typos or unclear explanations
- Write tutorials or guides
- Improve API documentation
- Translate docs to other languages
- Create video tutorials

#### Community
- Answer questions in Discussions
- Help others in Discord
- Share Flexium on social media
- Write blog posts about Flexium
- Give talks at meetups

#### Design
- Improve website design
- Create logos or graphics
- Design example apps
- Create diagrams or illustrations

#### Testing
- Report bugs with detailed reproductions
- Test on different browsers
- Test on mobile devices
- Verify fixes work

### Code Contributions

#### Bug Fixes
- Fix reported issues
- Improve error messages
- Add input validation
- Fix edge cases

#### Features
- Implement items from [ROADMAP](/ROADMAP.md)
- Add new components
- Improve performance
- Add new renderers

#### Testing
- Write unit tests
- Write integration tests
- Add E2E tests
- Improve test coverage

#### Build & Tooling
- Improve build configuration
- Add developer tools
- Create starter templates
- Write ESLint rules

---

## Where to Start

### For Beginners

Start with these friendly tasks:

1. **Fix Documentation Typos**
   - Search for typos in `/docs` or `README.md`
   - Fix and submit a PR
   - Great for learning the PR process!

2. **Improve Examples**
   - Add comments to example code
   - Create a new simple example
   - Improve example styling

3. **Test Flexium**
   - Build a small app
   - Report any issues you find
   - Share what you built!

4. **Answer Questions**
   - Help others in GitHub Discussions
   - Share your learning experience

### For Intermediate Contributors

Ready for more challenge? Try:

1. **Fix Bugs**
   - Browse issues tagged [`good first issue`](https://github.com/flexium/flexium/labels/good%20first%20issue)
   - Pick one that interests you
   - Comment that you'd like to work on it

2. **Write Tests**
   - Add unit tests for untested code
   - Improve test coverage
   - See `/src/core/__tests__` for examples

3. **Create Components**
   - Build a new UI component
   - Add it to `/src/primitives/ui/`
   - Write documentation and examples

4. **Optimize Performance**
   - Profile code with browser DevTools
   - Improve slow operations
   - Write benchmarks

### For Advanced Contributors

Looking for a challenge? Dive into:

1. **Implement Major Features**
   - Check [ROADMAP](/ROADMAP.md) for planned features
   - Propose your approach in an issue first
   - Implement with tests and docs

2. **Build Renderers**
   - Implement Canvas renderer
   - Implement React Native renderer
   - See [RENDERER_ARCHITECTURE](/docs/RENDERER_ARCHITECTURE.md)

3. **Create Developer Tools**
   - Build browser DevTools extension
   - Create debugging utilities
   - Add performance profiling

4. **Lead Architecture Improvements**
   - Propose API improvements
   - Design new features
   - Mentor other contributors

---

## Development Setup

### Prerequisites

- **Node.js**: 18.0.0 or higher
- **npm/yarn/pnpm**: Any package manager
- **Git**: For version control
- **Code Editor**: VS Code recommended

### Getting the Code

1. **Fork the repository**

   Visit [https://github.com/flexium/flexium](https://github.com/flexium/flexium) and click "Fork"

2. **Clone your fork**

   ```bash
   git clone https://github.com/YOUR_USERNAME/flexium.js.git
   cd flexium.js
   ```

3. **Add upstream remote**

   ```bash
   git remote add upstream https://github.com/flexium/flexium.git
   ```

### Install Dependencies

```bash
npm install
```

### Build the Project

```bash
npm run build
```

This creates files in `dist/` directory.

### Run Tests

```bash
# Run all tests
npm test

# Run specific test
npm run test:signal

# Run tests in watch mode
npm run test:vitest
```

### Start Development

```bash
# Watch mode - rebuilds on file changes
npm run dev

# Start playground
cd playground
python3 -m http.server 8000
# Open http://localhost:8000
```

### Verify Everything Works

1. Build completes without errors
2. Tests pass
3. Examples load in browser

If something doesn't work, check [CONTRIBUTING.md](/CONTRIBUTING.md) or ask for help!

---

## Understanding the Codebase

### Project Structure

```
flexium.js/
├── src/
│   ├── core/              # Signal system & renderer interface
│   │   ├── signal.ts      # Reactive primitives (signal, computed, effect)
│   │   ├── renderer.ts    # Platform-agnostic renderer interface
│   │   └── __tests__/     # Unit tests for core
│   ├── renderers/
│   │   └── dom/           # DOM renderer implementation
│   │       ├── h.ts       # JSX factory
│   │       ├── render.ts  # Render to DOM
│   │       └── reactive.ts # Automatic reactive bindings
│   ├── primitives/        # Layout & UX components
│   │   ├── layout/        # Row, Column, Stack, Grid
│   │   ├── motion/        # Animation component
│   │   ├── form/          # Form components
│   │   └── ui/            # Button, Text, etc.
│   ├── index.ts           # Core exports (signal, computed, effect)
│   ├── dom.ts             # DOM renderer exports (h, render)
│   └── primitives.ts      # All primitives exports
├── examples/              # Working examples
├── docs/                  # Documentation
├── dist/                  # Build output (generated)
├── package.json
├── tsconfig.json
└── tsup.config.ts         # Build configuration
```

### Key Files

| File | Purpose | When to Edit |
|------|---------|-------------|
| `/src/core/signal.ts` | Signal system | Adding reactive features |
| `/src/renderers/dom/h.ts` | JSX factory | Improving JSX handling |
| `/src/renderers/dom/render.ts` | DOM rendering | Fixing rendering bugs |
| `/src/primitives/layout/Row.ts` | Layout components | Adding layout features |
| `/docs/API.md` | API documentation | Documenting new APIs |
| `/examples/` | Examples | Creating tutorials |

### Architecture Overview

Flexium has a clean, layered architecture:

1. **Core Layer** (`/src/core`)
   - Signal system (signal, computed, effect)
   - Renderer interface (platform-agnostic)
   - No DOM dependencies

2. **Renderer Layer** (`/src/renderers`)
   - DOM renderer (web browsers)
   - Canvas renderer (planned)
   - React Native renderer (planned)

3. **Primitives Layer** (`/src/primitives`)
   - Layout components (Row, Column, Grid)
   - UX components (Motion, Form)
   - UI components (Button, Text)

See [RENDERER_ARCHITECTURE.md](/docs/RENDERER_ARCHITECTURE.md) for details.

---

## Making Your First Contribution

### Step 1: Pick an Issue

Browse [open issues](https://github.com/flexium/flexium/issues) and find one tagged:
- `good first issue` - Perfect for beginners
- `help wanted` - Need contributors
- `documentation` - Improve docs
- `bug` - Fix a bug

**Tip**: Comment on the issue saying you'd like to work on it!

### Step 2: Create a Branch

```bash
# Make sure you're on main
git checkout main

# Get latest changes
git pull upstream main

# Create feature branch
git checkout -b fix/issue-123-description
# or
git checkout -b feature/new-component
# or
git checkout -b docs/improve-readme
```

### Step 3: Make Your Changes

1. **Edit the code** in your editor
2. **Test your changes** locally
3. **Run tests** to ensure nothing broke
4. **Update documentation** if needed

### Step 4: Commit Your Changes

```bash
# Stage files
git add .

# Commit with descriptive message
git commit -m "Fix: Resolve signal memory leak in effect cleanup

- Added WeakMap cleanup in root disposal
- Added test case for memory leak
- Updated documentation

Closes #123"
```

**Good commit messages**:
- Start with type: `Fix:`, `Feature:`, `Docs:`, `Test:`, etc.
- Be descriptive but concise
- Reference issue numbers with `#123`
- Use present tense: "Add feature" not "Added feature"

### Step 5: Push to Your Fork

```bash
git push origin fix/issue-123-description
```

### Step 6: Create Pull Request

1. Go to your fork on GitHub
2. Click "Pull Request"
3. Fill out the PR template:
   - What does this PR do?
   - How to test?
   - Related issues?
   - Screenshots (if applicable)
4. Submit!

### Step 7: Address Feedback

Reviewers may request changes:
1. Make the requested changes
2. Commit and push
3. PR updates automatically
4. Respond to comments

### Step 8: Celebrate!

Once merged:
- You're now a Flexium contributor!
- Your name goes in CONTRIBUTORS.md
- Share your contribution on social media!

---

## Getting Help

### When You're Stuck

**Don't hesitate to ask for help!** We're here to support you.

#### GitHub Discussions
- Ask questions about contributing
- Propose ideas
- Get feedback on approach

#### Discord (Coming Soon)
- Real-time chat with maintainers
- Quick questions and answers
- Pair programming sessions

#### Issue Comments
- Comment on the issue you're working on
- Tag maintainers with `@username`
- Describe what you've tried

### Resources

- [CONTRIBUTING.md](/CONTRIBUTING.md) - Detailed contribution guidelines
- [PROJECT_STATUS.md](/PROJECT_STATUS.md) - Current project status
- [ROADMAP.md](/ROADMAP.md) - Future plans
- [API Documentation](/docs/API.md) - Complete API reference
- [Architecture Docs](/docs/RENDERER_ARCHITECTURE.md) - How Flexium works

---

## Community Guidelines

We're committed to making Flexium a welcoming, inclusive community. Here's what we expect:

### Be Respectful
- Treat everyone with respect and kindness
- Welcome newcomers warmly
- Assume good intentions
- Be patient with beginners

### Be Constructive
- Provide helpful feedback
- Critique ideas, not people
- Explain *why* when suggesting changes
- Celebrate others' contributions

### Be Professional
- No harassment, discrimination, or trolling
- Keep discussions on-topic
- Use appropriate language
- Respect maintainers' time

### Be Collaborative
- Share knowledge and resources
- Help others when you can
- Ask questions when stuck
- Give credit where due

**Code of Conduct**: Coming soon! For now, follow GitHub's Community Guidelines.

---

## Recognition

We value all contributions, big and small!

### How We Recognize Contributors

1. **CONTRIBUTORS.md**
   - All contributors listed
   - Categorized by contribution type
   - Updated with each release

2. **Release Notes**
   - Contributors thanked in each release
   - PRs linked to GitHub profiles

3. **Social Media**
   - Major contributions highlighted
   - Shared on Twitter, blog, etc.

4. **Badges** (Coming Soon)
   - First PR badge
   - Top contributor badges
   - Specialty badges (docs, tests, etc.)

### Contributor Levels

As you contribute more, you can earn:

1. **Contributor**: Made 1+ PR
2. **Regular Contributor**: 5+ merged PRs
3. **Core Contributor**: 20+ merged PRs
4. **Maintainer**: Trusted with merge rights
5. **Core Team**: Leading the project

**Note**: Quality matters more than quantity!

---

## Quick Tips

### Communication
- Be clear and concise
- Use code examples when discussing bugs
- Include screenshots for UI changes
- Tag relevant people with `@username`

### Code Quality
- Follow existing code style
- Write self-documenting code
- Add comments for complex logic
- Keep functions small and focused

### Testing
- Write tests for new features
- Fix tests you break
- Test edge cases
- Test on multiple browsers

### Documentation
- Update docs with code changes
- Add JSDoc comments to public APIs
- Include examples in docs
- Keep README up-to-date

---

## Next Steps

Ready to contribute? Here's what to do next:

1. ✅ [Set up your development environment](#development-setup)
2. ✅ [Pick a good first issue](https://github.com/flexium/flexium/labels/good%20first%20issue)
3. ✅ [Make your first PR](#making-your-first-contribution)
4. ✅ [Join the community](#getting-help)
5. ✅ [Keep contributing!](#ways-to-contribute)

---

## Final Words

Flexium is built by contributors like you. Whether you're fixing a typo, adding a feature, or helping in discussions, every contribution matters.

We believe in:
- **Quality over quantity** - One well-tested feature beats ten half-done ones
- **Learning by doing** - Don't be afraid to try and make mistakes
- **Community first** - We succeed together

Thank you for being part of the Flexium journey!

**Let's build something amazing together.**

---

**Questions?** Don't hesitate to ask!

- Open a [GitHub Discussion](https://github.com/flexium/flexium/discussions)
- Comment on an [issue](https://github.com/flexium/flexium/issues)
- Join our Discord (coming soon!)

**Happy contributing!**

---

**Last Updated**: November 22, 2025

**Maintained by**: Flexium Core Team

**License**: MIT
