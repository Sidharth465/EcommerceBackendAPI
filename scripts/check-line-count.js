#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
// const { execSync } = require('child_process'); // Not used currently

const MAX_LINES = 500;
const EXTENSIONS = ['.ts', '.js'];
const EXCLUDE_DIRS = ['node_modules', 'dist', 'build', 'logs', '.git'];
const EXCLUDE_FILES = ['*.test.ts', '*.spec.ts', '*.d.ts'];

/**
 * Recursively find all files with specified extensions
 */
function findFiles(dir, extensions, excludeDirs = [], excludeFiles = []) {
  const files = [];

  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);

    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        // Skip excluded directories
        if (!excludeDirs.includes(item)) {
          traverse(fullPath);
        }
      } else if (stat.isFile()) {
        // Check if file has allowed extension
        const ext = path.extname(item);
        if (extensions.includes(ext)) {
          // Check if file should be excluded
          const shouldExclude = excludeFiles.some((pattern) => {
            const regex = new RegExp(pattern.replace('*', '.*'));
            return regex.test(item);
          });

          if (!shouldExclude) {
            files.push(fullPath);
          }
        }
      }
    }
  }

  traverse(dir);
  return files;
}

/**
 * Count lines in a file
 */
function countLines(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return content.split('\n').length;
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
    return 0;
  }
}

/**
 * Main function
 */
function main() {
  console.log('🔍 Checking file line counts...\n');

  const srcDir = path.join(process.cwd(), 'src');

  if (!fs.existsSync(srcDir)) {
    console.error('❌ src directory not found');
    process.exit(1);
  }

  const files = findFiles(srcDir, EXTENSIONS, EXCLUDE_DIRS, EXCLUDE_FILES);

  if (files.length === 0) {
    console.log('ℹ️ No files found to check');
    return;
  }

  let hasViolations = false;
  const violations = [];
  const summary = {
    total: files.length,
    passed: 0,
    failed: 0,
    maxLines: 0,
    avgLines: 0,
    totalLines: 0,
  };

  console.log(`📊 Checking ${files.length} files (max ${MAX_LINES} lines per file)\n`);

  for (const file of files) {
    const lineCount = countLines(file);
    const relativePath = path.relative(process.cwd(), file);

    summary.totalLines += lineCount;
    summary.maxLines = Math.max(summary.maxLines, lineCount);

    if (lineCount > MAX_LINES) {
      hasViolations = true;
      summary.failed++;
      violations.push({ file: relativePath, lines: lineCount });
      console.log(`❌ ${relativePath}: ${lineCount} lines (exceeds ${MAX_LINES})`);
    } else {
      summary.passed++;
      console.log(`✅ ${relativePath}: ${lineCount} lines`);
    }
  }

  summary.avgLines = Math.round(summary.totalLines / summary.total);

  console.log('\n' + '='.repeat(60));
  console.log('📈 SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total files checked: ${summary.total}`);
  console.log(`Files passed: ${summary.passed}`);
  console.log(`Files failed: ${summary.failed}`);
  console.log(`Average lines per file: ${summary.avgLines}`);
  console.log(`Largest file: ${summary.maxLines} lines`);
  console.log(`Total lines of code: ${summary.totalLines}`);

  if (hasViolations) {
    console.log('\n❌ LINE COUNT VIOLATIONS FOUND:');
    console.log('='.repeat(60));

    violations.forEach(({ file, lines }) => {
      const excess = lines - MAX_LINES;
      console.log(`${file}: ${lines} lines (+${excess} over limit)`);
    });

    console.log('\n💡 SUGGESTIONS:');
    console.log('- Break large files into smaller modules');
    console.log('- Extract utility functions to separate files');
    console.log('- Consider splitting complex classes/services');
    console.log('- Move constants to dedicated config files');

    process.exit(1);
  } else {
    console.log('\n✅ All files are within the line count limit!');
    process.exit(0);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { findFiles, countLines, MAX_LINES };
