# GitHub Workflows Documentation

This directory contains automated workflows for the Flexium.js project.

## Workflows

### CI Workflow (`ci.yml`)

Runs on every push to `main` and on all pull requests. Performs comprehensive quality checks:

#### Jobs

1. **Lint**: Runs ESLint and Prettier formatting checks
2. **Type Check**: Validates TypeScript types across all packages
3. **Test**: Runs unit tests for the core flexium package
4. **E2E Tests**: Runs end-to-end tests across multiple browsers (Chromium, Firefox, WebKit)
5. **Accessibility Tests**: Runs a11y tests using axe-core
6. **Build**: Builds all packages and uploads artifacts
7. **Publish Dry Run** (PR only): Validates package configurations and tests npm pack

#### Features

- **Concurrency control**: Cancels in-progress runs when new commits are pushed
- **Manual trigger**: Can be run manually via `workflow_dispatch`
- **Artifact upload**: Build artifacts are saved for 7 days
- **Multi-browser testing**: Ensures cross-browser compatibility

---

### Release Workflow (`release.yml`)

Triggered when a version tag (e.g., `v0.4.12`) is pushed to the repository.

#### Jobs

1. **Verify**: Pre-publish verification
   - Validates tag version matches package.json
   - Runs linter, type checker, tests
   - Verifies package contents with `npm pack --dry-run`

2. **Publish**: Publishes to npm
   - Publishes all 4 packages with provenance
   - Uses NPM_TOKEN secret for authentication

3. **Release**: Creates GitHub release
   - Generates changelog from git commits
   - Links to published npm packages

#### Security Features

- **Version validation**: Ensures tag and package.json versions match
- **Pre-publish verification**: All quality checks must pass before publishing
- **Provenance**: Uses `--provenance` flag for supply chain security
- **Token security**: Uses GitHub secrets for npm authentication
- **Minimal permissions**: Each job only has required permissions

#### Published Packages

- `flexium` - Core framework
- `create-flexium` - CLI scaffolding tool
- `eslint-plugin-flexium` - ESLint plugin
- `vite-plugin-flexium` - Vite plugin

---

## Setup Instructions

### NPM Token Configuration

To enable automated npm publishing, you need to configure an NPM access token:

#### 1. Generate NPM Token

1. Log in to [npmjs.com](https://www.npmjs.com/)
2. Go to Account Settings → Access Tokens
3. Click "Generate New Token"
4. Select "Automation" token type (recommended for CI/CD)
5. Copy the generated token

#### 2. Add Token to GitHub Secrets

1. Go to your GitHub repository
2. Navigate to Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Name: `NPM_TOKEN`
5. Value: Paste your npm token
6. Click "Add secret"

#### 3. Verify Package Access

Ensure your npm account has publish access to all packages:

```bash
npm owner ls flexium
npm owner ls create-flexium
npm owner ls eslint-plugin-flexium
npm owner ls vite-plugin-flexium
```

If you don't have access, request it from the package maintainers.

---

## Release Process

### Automated Release (Recommended)

Use the deploy script which handles everything automatically:

```bash
# Patch release (0.4.11 → 0.4.12)
npm run deploy:patch

# Minor release (0.4.11 → 0.5.0)
npm run deploy:minor

# Major release (0.4.11 → 1.0.0)
npm run deploy:major
```

The script will:
1. Bump version in all package.json files
2. Build all packages
3. Run tests
4. Publish to npm
5. Create git commit and tag
6. Push to GitHub (which triggers the release workflow)

### Manual Release

If you prefer manual control:

```bash
# 1. Update version
node scripts/sync-versions.mjs
npm version patch  # or minor/major

# 2. Build and test
npm run build
npm run test:unit

# 3. Create and push tag
git add -A
git commit -m "release: v0.4.12"
git tag v0.4.12
git push && git push --tags
```

The GitHub workflow will automatically publish when the tag is pushed.

---

## Workflow Troubleshooting

### Release Workflow Fails

**Issue**: "Context access might be invalid: NPM_TOKEN"
- **Solution**: Ensure NPM_TOKEN secret is configured in repository settings

**Issue**: "Version mismatch"
- **Solution**: Ensure git tag version matches package.json version
- Run: `npm run version:sync` to sync all versions

**Issue**: "npm publish failed - 403 Forbidden"
- **Solution**: Verify your npm token has publish permissions
- Check token hasn't expired
- Ensure you're a package maintainer

**Issue**: "Package already published"
- **Solution**: This version already exists on npm
- Bump to a new version and try again

### CI Workflow Issues

**Issue**: Tests fail on CI but pass locally
- **Solution**: Ensure dependencies are properly locked in package-lock.json
- Check for environment-specific issues

**Issue**: Build artifacts missing
- **Solution**: Verify build scripts in package.json
- Check dist folders are generated correctly

---

## Best Practices

### Before Releasing

1. ✅ Run all tests locally: `npm run test:unit`
2. ✅ Run E2E tests: `npm run test:e2e`
3. ✅ Build all packages: `npm run build`
4. ✅ Test CLI: `npm run test:cli`
5. ✅ Update CHANGELOG.md (if manually maintained)
6. ✅ Verify package contents: `cd packages/flexium && npm pack --dry-run`

### Version Bumping

- **Patch** (0.4.11 → 0.4.12): Bug fixes, minor changes
- **Minor** (0.4.11 → 0.5.0): New features, backwards compatible
- **Major** (0.4.11 → 1.0.0): Breaking changes

### Rollback a Release

If you need to unpublish or rollback:

```bash
# Unpublish within 72 hours (use cautiously!)
npm unpublish flexium@0.4.12

# Or deprecate the version
npm deprecate flexium@0.4.12 "Buggy release, use 0.4.13 instead"
```

**Note**: Unpublishing is discouraged by npm. It's better to publish a new patch version with fixes.

---

## Monitoring

### Check Workflow Status

- View workflow runs: `https://github.com/Wick-Lim/flexium.js/actions`
- Get email notifications for workflow failures in your GitHub settings

### Verify Published Packages

After release, verify packages are published correctly:

```bash
# Check latest version on npm
npm view flexium version
npm view create-flexium version
npm view eslint-plugin-flexium version
npm view vite-plugin-flexium version

# Test installation
npx create-flexium test-project
```

### Package Links

- [flexium on npm](https://www.npmjs.com/package/flexium)
- [create-flexium on npm](https://www.npmjs.com/package/create-flexium)
- [eslint-plugin-flexium on npm](https://www.npmjs.com/package/eslint-plugin-flexium)
- [vite-plugin-flexium on npm](https://www.npmjs.com/package/vite-plugin-flexium)

---

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [npm Publishing Guide](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- [Semantic Versioning](https://semver.org/)
- [npm Provenance](https://docs.npmjs.com/generating-provenance-statements)
