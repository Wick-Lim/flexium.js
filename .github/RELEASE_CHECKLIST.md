# Release Checklist

Use this checklist when preparing a new release of Flexium.js

## Pre-Release Checklist

### Code Quality
- [ ] All tests passing locally (`npm run test:unit`)
- [ ] E2E tests passing (`npm run test:e2e`)
- [ ] No linting errors (`npm run lint`)
- [ ] No type errors (`npm run typecheck`)
- [ ] Code formatted (`npm run format`)

### Build Verification
- [ ] All packages build successfully (`npm run build`)
- [ ] Check bundle sizes are reasonable
- [ ] Verify dist files are generated correctly
- [ ] Test CLI tool (`npm run test:cli`)

### Package Validation
- [ ] Run dry-run for all packages:
  ```bash
  cd packages/flexium && npm pack --dry-run
  cd ../create-flexium && npm pack --dry-run
  cd ../eslint-plugin-flexium && npm pack --dry-run
  cd ../vite-plugin-flexium && npm pack --dry-run
  ```
- [ ] Verify package.json metadata is correct
- [ ] Check that all necessary files are included

### Documentation
- [ ] Update CHANGELOG.md (if maintained manually)
- [ ] Update README.md if needed
- [ ] Update docs for any breaking changes
- [ ] Verify examples still work

### Version Management
- [ ] Decide version bump type (patch/minor/major)
- [ ] Ensure all package versions are in sync
- [ ] Update any hardcoded version references

## Release Process

### Option 1: Automated (Recommended)

1. [ ] Run the deploy script:
   ```bash
   # For patch release (0.4.11 → 0.4.12)
   npm run deploy:patch

   # For minor release (0.4.11 → 0.5.0)
   npm run deploy:minor

   # For major release (0.4.11 → 1.0.0)
   npm run deploy:major
   ```

2. [ ] Script will automatically:
   - Bump versions
   - Sync all package.json files
   - Build all packages
   - Run tests
   - Publish to npm
   - Create git commit and tag
   - Push to GitHub

3. [ ] Monitor GitHub Actions workflow
   - Visit: https://github.com/Wick-Lim/flexium.js/actions
   - Verify all jobs complete successfully

### Option 2: Manual

1. [ ] Bump version:
   ```bash
   npm version patch  # or minor/major
   node scripts/sync-versions.mjs
   ```

2. [ ] Build and test:
   ```bash
   npm run build
   npm run test:unit
   ```

3. [ ] Create git commit and tag:
   ```bash
   git add -A
   git commit -m "release: v0.4.12"
   git tag v0.4.12
   ```

4. [ ] Push to GitHub:
   ```bash
   git push && git push --tags
   ```

5. [ ] GitHub Actions will automatically:
   - Run verification checks
   - Publish to npm (using NPM_TOKEN)
   - Create GitHub release

## Post-Release Checklist

### Verification
- [ ] Check GitHub Actions workflow completed successfully
- [ ] Verify packages on npm:
  ```bash
  npm view flexium version
  npm view create-flexium version
  npm view eslint-plugin-flexium version
  npm view vite-plugin-flexium version
  ```
- [ ] Visit package pages on npmjs.com:
  - https://www.npmjs.com/package/flexium
  - https://www.npmjs.com/package/create-flexium
  - https://www.npmjs.com/package/eslint-plugin-flexium
  - https://www.npmjs.com/package/vite-plugin-flexium

### Testing
- [ ] Test installation in a clean directory:
  ```bash
  mkdir test-install && cd test-install
  npx create-flexium@latest my-test-app
  cd my-test-app
  npm install
  npm run dev
  ```
- [ ] Verify all features work as expected
- [ ] Check that examples/demos work with new version

### Communication
- [ ] Announce release on relevant channels
- [ ] Update documentation site if needed
- [ ] Respond to any issues from users

### GitHub Release
- [ ] Review auto-generated release notes
- [ ] Add any additional context or highlights
- [ ] Mark as pre-release if applicable
- [ ] Verify npm package links in release notes

## Rollback Procedure

If something goes wrong:

### Option 1: Deprecate (Recommended)
```bash
npm deprecate flexium@0.4.12 "Buggy release, use 0.4.13 instead"
# Repeat for all affected packages
```

### Option 2: Unpublish (Within 72 hours only)
```bash
npm unpublish flexium@0.4.12
# Only use if absolutely necessary!
```

### Option 3: Publish Hotfix
```bash
# Fix the issue
npm run deploy:patch  # Creates 0.4.13
```

## Troubleshooting

### NPM Publish Fails
- [ ] Check NPM_TOKEN is configured in GitHub secrets
- [ ] Verify you have publish permissions
- [ ] Check if version already exists on npm
- [ ] Verify package.json is valid

### Version Mismatch Error
- [ ] Run `npm run version:sync`
- [ ] Ensure git tag matches package.json version
- [ ] Delete and recreate tag if needed

### Tests Fail in CI
- [ ] Run tests locally
- [ ] Check for environment-specific issues
- [ ] Review CI logs for details
- [ ] Fix issues and push again

### Build Fails
- [ ] Clean and rebuild: `npm run clean && npm run build`
- [ ] Check for missing dependencies
- [ ] Verify Node.js version (>=18.0.0)

## Quick Commands Reference

```bash
# Version commands
npm run version:sync          # Sync versions across all packages

# Build commands
npm run build                 # Build all packages
npm run build:flexium         # Build only flexium
npm run build:create-flexium  # Build only create-flexium

# Test commands
npm run test:unit             # Run unit tests
npm run test:e2e              # Run E2E tests
npm run test:cli              # Test CLI

# Deploy commands
npm run deploy:patch          # Patch release
npm run deploy:minor          # Minor release
npm run deploy:major          # Major release

# Verification
npm run lint                  # Run linter
npm run typecheck             # Type check
npm run format -- --check     # Check formatting
```

## Notes

- Always test thoroughly before releasing
- Use semantic versioning (semver.org)
- Keep CHANGELOG.md updated
- Communicate breaking changes clearly
- Monitor for issues after release
- Be prepared to hotfix if needed

## First Time Setup

If this is your first release, ensure:
- [ ] NPM_TOKEN is configured (see `.github/NPM_SETUP.md`)
- [ ] You have npm publish permissions for all packages
- [ ] GitHub Actions is enabled
- [ ] You've tested the workflow with a dry run
