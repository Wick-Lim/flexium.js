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
import { execSync, spawn } from 'child_process';

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

function runParallel(commands, options = {}) {
  console.log(`\n$ Running in parallel: ${commands.join(' & ')}`);
  return new Promise((resolve) => {
    const results = [];
    let completed = 0;

    commands.forEach((cmd, index) => {
      const [command, ...args] = cmd.split(' ');
      const proc = spawn(command, args, {
        stdio: 'inherit',
        cwd: options.cwd || ROOT,
        shell: true,
      });

      proc.on('close', (code) => {
        results[index] = code === 0;
        completed++;
        if (completed === commands.length) {
          resolve(results.every(Boolean));
        }
      });
    });
  });
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

  // 4. Build npm packages in parallel (flexium must build first, then flexium-canvas)
  console.log('\n🔨 Building npm packages...');

  // First build flexium (required by flexism, flexium-canvas, flexium-ui)
  if (!run('npm run build:flexium')) {
    console.error('❌ flexium build failed');
    process.exit(1);
  }

  // Then build flexism (required by create-flexism template)
  if (!run('npm run build:flexism')) {
    console.error('❌ flexism build failed');
    process.exit(1);
  }

  // Then build the rest in parallel
  const buildSuccess = await runParallel([
    'npm run build:flexium-canvas',
    'npm run build:flexium-ui',
    'npm run build:create-flexium',
    'npm run build:create-flexism',
    'npm run build:eslint-plugin',
    'npm run build:vite-plugin',
  ]);
  if (!buildSuccess) {
    console.error('❌ Package builds failed');
    process.exit(1);
  }

  // 5. Run tests in parallel (unit + e2e)
  console.log('\n🧪 Running tests in parallel...');
  const testSuccess = await runParallel([
    'npm run test:unit',
    'npm run test:e2e:quick',
  ]);
  if (!testSuccess) {
    console.error('❌ Tests failed');
    process.exit(1);
  }

  // 6. Publish to npm (flexium first, then flexium-canvas, then others in parallel)
  console.log('\n📤 Publishing to npm...');

  console.log('\n  Publishing flexium...');
  if (!run('npm publish --access public', { cwd: join(ROOT, 'packages/flexium') })) {
    console.error('❌ Failed to publish flexium');
    process.exit(1);
  }

  console.log('\n  Publishing flexism...');
  if (!run('npm publish --access public', { cwd: join(ROOT, 'packages/flexism') })) {
    console.error('❌ Failed to publish flexism');
    process.exit(1);
  }

  console.log('\n  Publishing flexium-canvas...');
  if (!run('npm publish --access public', { cwd: join(ROOT, 'packages/flexium-canvas') })) {
    console.error('❌ Failed to publish flexium-canvas');
    process.exit(1);
  }

  console.log('\n  Publishing flexium-ui...');
  if (!run('npm publish --access public', { cwd: join(ROOT, 'packages/flexium-ui') })) {
    console.error('❌ Failed to publish flexium-ui');
    process.exit(1);
  }

  console.log('\n  Publishing create-flexium...');
  if (!run('npm publish --access public', { cwd: join(ROOT, 'packages/create-flexium') })) {
    console.error('❌ Failed to publish create-flexium');
    process.exit(1);
  }

  console.log('\n  Publishing create-flexism...');
  if (!run('npm publish --access public', { cwd: join(ROOT, 'packages/create-flexism') })) {
    console.error('❌ Failed to publish create-flexism');
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

  // 6.5. Update lockfile
  console.log('\n🔒 Updating lockfile...');
  run('pnpm i');

  // 7. Git commit and tag
  console.log('\n📝 Creating git commit and tag...');
  run(`git add -A`);
  run(`git commit -m "release: v${newVersion}"`);
  run(`git tag v${newVersion}`);
  run(`git push && git push --tags`);

  console.log(`\n✨ Successfully deployed v${newVersion}!\n`);
  console.log(`   npm packages:`);
  console.log(`   - https://www.npmjs.com/package/flexium`);
  console.log(`   - https://www.npmjs.com/package/flexism`);
  console.log(`   - https://www.npmjs.com/package/flexium-canvas`);
  console.log(`   - https://www.npmjs.com/package/flexium-ui`);
  console.log(`   - https://www.npmjs.com/package/create-flexium`);
  console.log(`   - https://www.npmjs.com/package/create-flexism`);
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
