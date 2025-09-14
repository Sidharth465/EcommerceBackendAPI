#!/usr/bin/env node

/**
 * Script to enforce Yarn usage and prevent npm
 * This runs before any install command
 */

// const { execSync } = require('child_process'); // Not used currently
const path = require('path');

function checkPackageManager() {
  // Check if this script is being run by npm
  const userAgent = process.env.npm_config_user_agent;

  if (userAgent && userAgent.startsWith('npm')) {
    console.error('🚫 ERROR: This project uses Yarn as the package manager.');
    console.error('');
    console.error('❌ You ran: npm install');
    console.error('✅ Please use: yarn install');
    console.error('');
    console.error('📋 Available commands:');
    console.error('  yarn install          # Install dependencies');
    console.error('  yarn add <package>    # Add new dependency');
    console.error('  yarn remove <package> # Remove dependency');
    console.error('  yarn dev              # Start development server');
    console.error('');
    console.error('💡 If you need to use npm for a specific reason, please discuss with the team.');
    process.exit(1);
  }

  // Check if yarn.lock exists but package-lock.json also exists
  const fs = require('fs');
  const yarnLockExists = fs.existsSync(path.join(process.cwd(), 'yarn.lock'));
  const npmLockExists = fs.existsSync(path.join(process.cwd(), 'package-lock.json'));

  if (yarnLockExists && npmLockExists) {
    console.error('🚫 ERROR: Both yarn.lock and package-lock.json found!');
    console.error('');
    console.error('This can cause dependency conflicts. Please:');
    console.error('1. Delete package-lock.json');
    console.error('2. Delete node_modules');
    console.error('3. Run: yarn install');
    console.error('');
    process.exit(1);
  }

  // Check if package-lock.json exists but yarn.lock doesn't
  if (!yarnLockExists && npmLockExists) {
    console.error('🚫 ERROR: Found package-lock.json but no yarn.lock!');
    console.error('');
    console.error('This project uses Yarn. Please:');
    console.error('1. Delete package-lock.json');
    console.error('2. Delete node_modules (if exists)');
    console.error('3. Run: yarn install');
    console.error('');
    process.exit(1);
  }

  console.log('✅ Package manager check passed - using Yarn');
}

// Run the check
if (require.main === module) {
  checkPackageManager();
}

module.exports = { checkPackageManager };
