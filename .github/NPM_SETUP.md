# NPM Publishing Setup - Quick Start Guide

## One-Time Setup

### Step 1: Create NPM Automation Token

1. Visit [npmjs.com](https://www.npmjs.com/) and log in
2. Click your profile → **Access Tokens**
3. Click **Generate New Token** → **Automation**
4. Copy the token (starts with `npm_...`)

### Step 2: Add Token to GitHub

1. Go to [GitHub Repository Settings](https://github.com/Wick-Lim/flexium.js/settings/secrets/actions)
2. Click **New repository secret**
3. Name: `NPM_TOKEN`
4. Value: Paste the token from Step 1
5. Click **Add secret**

### Step 3: Verify Setup

```bash
# Check if you have publish access
npm owner ls flexium
npm owner ls create-flexium
npm owner ls eslint-plugin-flexium
npm owner ls vite-plugin-flexium
```

## That's It!

The workflows are now fully configured. Next time you release:

```bash
npm run deploy:patch
```

The automation will:
- Build all packages
- Run all tests
- Publish to npm (using the NPM_TOKEN)
- Create a GitHub release with changelog

---

## Troubleshooting

### Can't see NPM_TOKEN secret?
- Secrets are hidden after creation (this is normal)
- To update: delete and create a new one

### Getting 403 errors?
- Verify you're a package maintainer: `npm owner ls <package-name>`
- Check token permissions in npm settings
- Ensure token hasn't expired

### Need to test without publishing?
- Create a pull request
- The CI workflow runs `npm pack --dry-run` to validate packages

---

## Security Notes

- Never commit the NPM token to git
- Use "Automation" token type (not "Publish" or "Read-only")
- Token is only accessible to GitHub Actions
- Token permissions: publish packages only
- Provenance enabled for supply chain security

---

## Additional Info

See [.github/workflows/README.md](.github/workflows/README.md) for complete documentation.
