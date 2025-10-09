#!/usr/bin/env node

/**
 * Restore System for FamilyMedia Project
 * 
 * This script restores backups created by the backup system.
 * It can list available backups and restore a specific backup.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

// Configuration
const PROJECT_ROOT = path.join(__dirname, '..');
const BACKUP_DIR = path.join(__dirname, 'backups');

/**
 * Get all available backups
 */
function getAvailableBackups() {
  if (!fs.existsSync(BACKUP_DIR)) {
    return [];
  }

  const backups = fs.readdirSync(BACKUP_DIR)
    .filter(file => file.startsWith('backup_') && file.endsWith('.tar.gz'))
    .map(file => {
      const filePath = path.join(BACKUP_DIR, file);
      const stats = fs.statSync(filePath);
      return {
        name: file,
        path: filePath,
        size: (stats.size / (1024 * 1024)).toFixed(2) + ' MB',
        created: stats.mtime,
        timestamp: file.replace('backup_', '').replace('.tar.gz', '')
      };
    })
    .sort((a, b) => b.created - a.created);

  return backups;
}

/**
 * List all available backups
 */
function listBackups() {
  console.log('\n📋 Available Backups:\n');
  const backups = getAvailableBackups();

  if (backups.length === 0) {
    console.log('No backups found.\n');
    return null;
  }

  backups.forEach((backup, index) => {
    console.log(`${index + 1}. ${backup.name}`);
    console.log(`   Size: ${backup.size}`);
    console.log(`   Date: ${backup.created.toLocaleString()}\n`);
  });

  return backups;
}

/**
 * Extract backup archive
 */
function extractBackup(backupPath, extractTo) {
  console.log(`\n📦 Extracting backup...`);
  
  try {
    // Create extraction directory if it doesn't exist
    if (!fs.existsSync(extractTo)) {
      fs.mkdirSync(extractTo, { recursive: true });
    }

    // Extract the archive
    execSync(`tar -xzf "${backupPath}" -C "${extractTo}"`);
    
    console.log('✓ Backup extracted successfully');
    return true;
  } catch (error) {
    console.error('❌ Error extracting backup:', error.message);
    return false;
  }
}

/**
 * Copy directory recursively
 */
function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    console.warn(`⚠ Source does not exist: ${src}`);
    return;
  }

  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * Restore backup to project
 */
function restoreBackup(backupName, options = {}) {
  const { dryRun = false, targetDir = null } = options;
  
  const backups = getAvailableBackups();
  const backup = backups.find(b => b.name === backupName || b.timestamp === backupName);

  if (!backup) {
    console.error(`❌ Backup not found: ${backupName}`);
    process.exit(1);
  }

  console.log(`\n🔄 Restoring backup: ${backup.name}`);
  console.log(`   Created: ${backup.created.toLocaleString()}`);
  console.log(`   Size: ${backup.size}`);

  if (dryRun) {
    console.log('\n⚠ DRY RUN MODE - No files will be modified\n');
  }

  // Create temporary extraction directory
  const tempDir = path.join(BACKUP_DIR, 'temp_restore');
  const extractDir = path.join(tempDir, backup.name.replace('.tar.gz', ''));

  try {
    // Extract backup
    if (!extractBackup(backup.path, tempDir)) {
      throw new Error('Failed to extract backup');
    }

    // Read metadata if available
    const metadataPath = path.join(extractDir, 'backup-metadata.json');
    let metadata = null;
    
    if (fs.existsSync(metadataPath)) {
      metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
      console.log('\n📊 Backup Information:');
      console.log(`   Timestamp: ${metadata.timestamp}`);
      console.log(`   Directories: ${metadata.directories}`);
      console.log(`   Files: ${metadata.files}`);
    }

    if (dryRun) {
      console.log('\n📁 Files that would be restored:');
      const listFiles = (dir, prefix = '') => {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.name === 'backup-metadata.json') continue;
          console.log(`   ${prefix}${entry.name}${entry.isDirectory() ? '/' : ''}`);
          if (entry.isDirectory()) {
            listFiles(path.join(dir, entry.name), prefix + '  ');
          }
        }
      };
      listFiles(extractDir);
    } else {
      // Perform actual restore
      const restoreTarget = targetDir || PROJECT_ROOT;
      console.log(`\n📂 Restoring to: ${restoreTarget}`);
      
      const entries = fs.readdirSync(extractDir);
      let restoredCount = 0;

      for (const entry of entries) {
        if (entry === 'backup-metadata.json') continue;

        const srcPath = path.join(extractDir, entry);
        const destPath = path.join(restoreTarget, entry);
        const stats = fs.statSync(srcPath);

        if (stats.isDirectory()) {
          console.log(`   📁 Restoring directory: ${entry}`);
          copyDir(srcPath, destPath);
        } else {
          console.log(`   📄 Restoring file: ${entry}`);
          fs.copyFileSync(srcPath, destPath);
        }
        restoredCount++;
      }

      console.log(`\n✅ Restore completed successfully!`);
      console.log(`   ${restoredCount} items restored`);
    }

  } catch (error) {
    console.error(`\n❌ Error during restore:`, error.message);
    process.exit(1);
  } finally {
    // Cleanup temporary directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  }
}

/**
 * Interactive restore selection
 */
function interactiveRestore() {
  const backups = listBackups();
  
  if (!backups || backups.length === 0) {
    return;
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('Enter the number of the backup to restore (or "q" to quit): ', (answer) => {
    if (answer.toLowerCase() === 'q') {
      console.log('Restore cancelled.');
      rl.close();
      return;
    }

    const index = parseInt(answer) - 1;
    
    if (isNaN(index) || index < 0 || index >= backups.length) {
      console.log('❌ Invalid selection.');
      rl.close();
      return;
    }

    const selectedBackup = backups[index];
    
    rl.question('\n⚠ This will overwrite existing files. Continue? (yes/no): ', (confirm) => {
      if (confirm.toLowerCase() === 'yes') {
        rl.close();
        restoreBackup(selectedBackup.name);
      } else {
        console.log('Restore cancelled.');
        rl.close();
      }
    });
  });
}

// Command line interface
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes('--list')) {
    listBackups();
  } else if (args.includes('--help')) {
    console.log(`
Restore System for FamilyMedia Project

Usage:
  node restore.js [options] [backup-name]

Options:
  --list              List all available backups
  --dry-run          Show what would be restored without making changes
  --target-dir DIR   Restore to a specific directory instead of project root
  --interactive      Interactive backup selection (default if no backup specified)
  --help             Show this help message

Examples:
  node restore.js --list
  node restore.js --interactive
  node restore.js backup_2024-10-07_14-30-00
  node restore.js --dry-run backup_2024-10-07_14-30-00
  node restore.js --target-dir ./test-restore backup_2024-10-07_14-30-00
    `);
  } else if (args.includes('--interactive') || args.length === 0) {
    interactiveRestore();
  } else {
    const dryRun = args.includes('--dry-run');
    const targetDirIndex = args.indexOf('--target-dir');
    const targetDir = targetDirIndex !== -1 ? args[targetDirIndex + 1] : null;
    const backupName = args.find(arg => !arg.startsWith('--') && arg !== targetDir);

    if (backupName) {
      restoreBackup(backupName, { dryRun, targetDir });
    } else {
      console.log('❌ Please specify a backup name or use --interactive mode.');
      console.log('Run with --help for usage information.');
    }
  }
}

module.exports = { restoreBackup, getAvailableBackups, listBackups };
