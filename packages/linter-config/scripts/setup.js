#!/usr/bin/env node

/**
 * Setup script for OWOX Data Marts linter configuration
 *
 * This script automatically configures Husky git hooks for the monorepo
 * and sets up the necessary files for pre-commit and commit-msg validation.
 */

import { execSync } from 'child_process';
import { chmodSync, existsSync, mkdirSync, writeFileSync } from 'fs';
import { platform } from 'os';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get the monorepo root (should be 3 levels up from this script)
const repoRoot = join(__dirname, '../../..');

// Cross-platform detection
const isWindows = platform() === 'win32';

console.log('🚀 Setting up OWOX Data Marts linter configuration...');
console.log(`📱 Platform: ${platform()}`);

/**
 * Cross-platform function to make file executable
 * @param {string} filePath - Path to the file
 */
function makeExecutable(filePath) {
  try {
    if (isWindows) {
      // On Windows, files are executable by default for .bat/.cmd
      // Git hooks don't need chmod on Windows
      console.log(`ℹ️  Windows detected: skipping chmod for ${filePath}`);
    } else {
      // Unix-like systems (macOS, Linux)
      chmodSync(filePath, 0o755);
      console.log(`✅ Made ${filePath} executable`);
    }
  } catch (error) {
    console.log(`⚠️  Could not make ${filePath} executable: ${error.message}`);
  }
}

/**
 * Generate cross-platform hook content
 * @param {string} command - Command to run in the hook
 * @returns {string} Hook content
 */
function generateHookContent(command) {
  if (isWindows) {
    // Windows batch script style
    return `@echo off
:: Husky hook for Windows
cd /d "%~dp0"
call husky.cmd
${command}
`;
  } else {
    // Unix shell script style
    return `#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# ${command.split('\n')[0].replace('# ', '')}
${command}
`;
  }
}

/**
 * Ensure Husky is properly initialized
 */
function setupHusky() {
  console.log('📦 Initializing Husky...');

  try {
    // Initialize husky (this creates .husky directory if needed)
    execSync('npx husky init', { cwd: repoRoot, stdio: 'inherit' });
    console.log('✅ Husky initialized');
  } catch (error) {
    console.log('ℹ️  Husky already initialized or failed to initialize');
    console.log(`   Error: ${error.message}`);
  }
}

/**
 * Create pre-commit hook
 */
function createPreCommitHook() {
  console.log('🪝 Creating pre-commit hook...');

  const huskyDir = join(repoRoot, '.husky');
  if (!existsSync(huskyDir)) {
    mkdirSync(huskyDir, { recursive: true });
  }

  const command = 'npm run lint-staged';
  const hookContent = generateHookContent(command);
  const hookPath = join(huskyDir, 'pre-commit');

  writeFileSync(hookPath, hookContent);
  makeExecutable(hookPath);

  console.log('✅ Pre-commit hook created');
}

/**
 * Main setup function
 */
function main() {
  try {
    setupHusky();
    createPreCommitHook();

    console.log('');
    console.log('🎉 Setup complete!');
    console.log('');
    console.log('📋 LINTING WORKFLOW:');
    console.log('  • ESLint runs in validation mode (no auto-fix)');
    console.log('  • Commits are blocked if ESLint finds errors');
    console.log('  • Prettier runs only after successful ESLint validation');
    console.log('  • Developers have full control over code quality fixes');
    console.log('');
    console.log('Next steps:');
    console.log('1. Ensure you have the required dependencies installed at the root level');
    console.log('2. Add the following scripts to your root package.json:');
    console.log('   "lint-staged": "lint-staged"');
    console.log('   "lint": "eslint ."');
    console.log('   "lint:fix": "eslint . --fix"');
    console.log('   "format": "prettier --write ."');
    console.log('3. Create lint-staged.config.js file in the root');
    console.log('');
    console.log('💡 Quick commands after blocked commit:');
    console.log('   npm run lint        # Check ESLint errors');
    console.log('   npm run lint:fix    # Auto-fix simple issues');
    console.log('   npm run format      # Format with Prettier');
    console.log('');
    console.log('Pre-commit hook is now active! 🚀');
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

main();
