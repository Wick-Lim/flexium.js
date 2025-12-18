#!/usr/bin/env node
/**
 * Version Sync Script
 *
 * Syncs version numbers across all package files and documentation.
 * Source of truth: root package.json
 *
 * Usage:
 *   node scripts/sync-versions.mjs           # Sync to current version
 *   node scripts/sync-versions.mjs 0.5.0     # Set specific version
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// Source of truth: root package.json
const MAIN_PKG = join(ROOT, 'package.json');

// Files to sync (relative to ROOT)
const FILES_TO_SYNC = [
  // Package files
  { path: 'packages/flexium/package.json', type: 'json', field: 'version' },
  { path: 'packages/flexium-canvas/package.json', type: 'json', field: 'version' },
  { path: 'packages/create-flexium/package.json', type: 'json', field: 'version' },
  { path: 'packages/eslint-plugin-flexium/package.json', type: 'json', field: 'version' },
  { path: 'packages/vite-plugin-flexium/package.json', type: 'json', field: 'version' },
  { path: 'apps/docs/package.json', type: 'json', field: 'version' },

  // flexium-canvas peerDependency sync
  { path: 'packages/flexium-canvas/package.json', type: 'json', field: 'peerDependencies.flexium', prefix: '>=' },

  // Source files
  { path: 'packages/flexium/src/index.ts', type: 'regex', pattern: /VERSION = '[^']+'/g, replace: (v) => `VERSION = '${v}'` },

  // Config files
  { path: 'apps/docs/.vitepress/config.ts', type: 'regex', pattern: /text: 'v[^']+'/g, replace: (v) => `text: 'v${v}'` },

  // Template files
  { path: 'packages/create-flexium/templates/vite-starter/package.json', type: 'json', field: 'dependencies.flexium', prefix: '^' },

  // App dependency updates
  { path: 'apps/hackernews/package.json', type: 'json', field: 'dependencies.flexium', prefix: '^' },
];

function readJSON(path) {
  return JSON.parse(readFileSync(path, 'utf-8'));
}

function writeJSON(path, data) {
  writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
}

function setNestedValue(obj, path, value) {
  const keys = path.split('.');
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!current[keys[i]]) current[keys[i]] = {};
    current = current[keys[i]];
  }
  current[keys[keys.length - 1]] = value;
}

function getNestedValue(obj, path) {
  return path.split('.').reduce((o, k) => o?.[k], obj);
}

function syncVersion(targetVersion) {
  const mainPkg = readJSON(MAIN_PKG);
  const version = targetVersion || mainPkg.version;

  console.log(`\n📦 Syncing version: ${version}\n`);

  // Update root package if version specified
  if (targetVersion && mainPkg.version !== targetVersion) {
    mainPkg.version = targetVersion;
    writeJSON(MAIN_PKG, mainPkg);
    console.log(`✅ package.json (root) -> ${version}`);
  }

  // Sync other files
  for (const file of FILES_TO_SYNC) {
    const fullPath = join(ROOT, file.path);

    try {
      if (file.type === 'json') {
        const json = readJSON(fullPath);
        const currentValue = getNestedValue(json, file.field);
        const newValue = file.prefix ? `${file.prefix}${version}` : version;

        if (currentValue !== newValue) {
          setNestedValue(json, file.field, newValue);
          writeJSON(fullPath, json);
          console.log(`✅ ${file.path} (${file.field}) -> ${newValue}`);
        } else {
          console.log(`⏭️  ${file.path} (already ${newValue})`);
        }
      } else if (file.type === 'regex') {
        let content = readFileSync(fullPath, 'utf-8');
        const newContent = content.replace(file.pattern, file.replace(version));

        if (content !== newContent) {
          writeFileSync(fullPath, newContent);
          console.log(`✅ ${file.path} -> ${version}`);
        } else {
          console.log(`⏭️  ${file.path} (already ${version})`);
        }
      }
    } catch (err) {
      console.log(`⚠️  ${file.path} - ${err.message}`);
    }
  }

  console.log(`\n✨ Version sync complete: ${version}\n`);
}

// Get version from CLI args
const version = process.argv[2];
syncVersion(version);
