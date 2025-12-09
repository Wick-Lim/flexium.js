#!/usr/bin/env node
/**
 * Deploy Script
 *
 * Bumps version, syncs across all files, builds, and publishes to npm.
 *
 * Usage:
 *   node scripts/deploy.mjs patch   # 0.4.2 -> 0.4.3
 *   node scripts/deploy.mjs minor   # 0.4.2 -> 0.5.0
 *   node scripts/deploy.mjs major   # 0.4.2 -> 1.0.0
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

function run(cmd, options = {}) {
  console.log(`\n$ ${cmd}`);
  try {
    execSync(cmd, { stdio: 'inherit', cwd: ROOT, ...options });
    return true;
  } catch (err) {
    return false;
  }
}

function readJSON(path) {
  return JSON.parse(readFileSync(path, 'utf-8'));
}

function writeJSON(path, data) {
  writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
}

function bumpVersion(current, type) {
  const [major, minor, patch] = current.split('.').map(Number);
  switch (type) {
    case 'major': return `${major + 1}.0.0`;
    case 'minor': return `${major}.${minor + 1}.0`;
    case 'patch': return `${major}.${minor}.${patch + 1}`;
    default: throw new Error(`Unknown version type: ${type}`);
  }
}

async function deploy(type) {
  console.log('\n🚀 Starting deployment...\n');

  // 1. Read current version
  const pkgPath = join(ROOT, 'package.json');
  const pkg = readJSON(pkgPath);
  const currentVersion = pkg.version;
  const newVersion = bumpVersion(currentVersion, type);

  console.log(`📦 Version: ${currentVersion} -> ${newVersion}`);

  // 2. Update root package.json
  pkg.version = newVersion;
  writeJSON(pkgPath, pkg);
  console.log(`✅ Updated package.json`);

  // 3. Sync versions across all files
  console.log('\n📋 Syncing versions...');
  if (!run('npm run version:sync')) {
    console.error('❌ Version sync failed');
    process.exit(1);
  }

  // 4. Build only npm packages (flexium, create-flexium, eslint-plugin-flexium)
  console.log('\n🔨 Building npm packages...');
  if (!run('npm run build:flexium')) {
    console.error('❌ flexium build failed');
    process.exit(1);
  }
  if (!run('npm run build:create-flexium')) {
    console.error('❌ create-flexium build failed');
    process.exit(1);
  }
  if (!run('npm run build:eslint-plugin')) {
    console.error('❌ eslint-plugin-flexium build failed');
    process.exit(1);
  }
  if (!run('npm run build:vite-plugin')) {
    console.error('❌ vite-plugin-flexium build failed');
    process.exit(1);
  }

  // 5. Run tests (unit + e2e)
  console.log('\n🧪 Running unit tests...');
  if (!run('npm run test:unit')) {
    console.error('❌ Unit tests failed');
    process.exit(1);
  }

  console.log('\n🌐 Running E2E tests...');
  if (!run('npm run test:e2e')) {
    console.error('❌ E2E tests failed');
    process.exit(1);
  }

  // 6. Publish to npm
  console.log('\n📤 Publishing to npm...');

  console.log('\n  Publishing flexium...');
  if (!run('npm publish --access public', { cwd: join(ROOT, 'packages/flexium') })) {
    console.error('❌ Failed to publish flexium');
    process.exit(1);
  }

  console.log('\n  Publishing create-flexium...');
  if (!run('npm publish --access public', { cwd: join(ROOT, 'packages/create-flexium') })) {
    console.error('❌ Failed to publish create-flexium');
    process.exit(1);
  }

  console.log('\n  Publishing eslint-plugin-flexium...');
  if (!run('npm publish --access public', { cwd: join(ROOT, 'packages/eslint-plugin-flexium') })) {
    console.error('❌ Failed to publish eslint-plugin-flexium');
    process.exit(1);
  }

  console.log('\n  Publishing vite-plugin-flexium...');
  if (!run('npm publish --access public', { cwd: join(ROOT, 'packages/vite-plugin-flexium') })) {
    console.error('❌ Failed to publish vite-plugin-flexium');
    process.exit(1);
  }

  // 7. Git commit and tag
  console.log('\n📝 Creating git commit and tag...');
  run(`git add -A`);
  run(`git commit -m "release: v${newVersion}"`);
  run(`git tag v${newVersion}`);
  run(`git push && git push --tags`);

  console.log(`\n✨ Successfully deployed v${newVersion}!\n`);
  console.log(`   npm packages:`);
  console.log(`   - https://www.npmjs.com/package/flexium`);
  console.log(`   - https://www.npmjs.com/package/create-flexium`);
  console.log(`   - https://www.npmjs.com/package/eslint-plugin-flexium`);
  console.log(`   - https://www.npmjs.com/package/vite-plugin-flexium`);
  console.log(`   GitHub: https://github.com/Wick-Lim/flexium.js/releases/tag/v${newVersion}\n`);
}

// Get version type from CLI args
const type = process.argv[2];

if (!['patch', 'minor', 'major'].includes(type)) {
  console.error('\n❌ Usage: node scripts/deploy.mjs <patch|minor|major>\n');
  console.log('Examples:');
  console.log('  npm run deploy:patch   # 0.4.2 -> 0.4.3');
  console.log('  npm run deploy:minor   # 0.4.2 -> 0.5.0');
  console.log('  npm run deploy:major   # 0.4.2 -> 1.0.0\n');
  process.exit(1);
}

deploy(type);
