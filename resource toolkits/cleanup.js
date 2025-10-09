#!/usr/bin/env node

/**
 * Cleanup System for FamilyMedia Project Backups
 * 
 * This script manages backup retention by:
 * - Removing backups older than a specified number of days
 * - Keeping only a specified number of most recent backups
 * - Providing options for manual deletion
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Configuration
const BACKUP_DIR = path.join(__dirname, 'backups');

// Default retention policies
const DEFAULT_POLICIES = {
  maxAge: 30,        // Keep backups for 30 days
  maxCount: 10,      // Keep at most 10 backups
  minCount: 3        // Always keep at least 3 most recent backups
};

/**
 * Get all available backups with details
 */
function getBackups() {
  if (!fs.existsSync(BACKUP_DIR)) {
    return [];
  }

  const backups = fs.readdirSync(BACKUP_DIR)
    .filter(file => file.startsWith('backup_') && file.endsWith('.tar.gz'))
    .map(file => {
      const filePath = path.join(BACKUP_DIR, file);
      const stats = fs.statSync(filePath);
      const ageInDays = Math.floor((Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        name: file,
        path: filePath,
        size: stats.size,
        sizeFormatted: (stats.size / (1024 * 1024)).toFixed(2) + ' MB',
        created: stats.mtime,
        ageInDays: ageInDays
      };
    })
    .sort((a, b) => b.created - a.created);

  return backups;
}

/**
 * Calculate total size of all backups
 */
function getTotalBackupSize(backups) {
  const totalBytes = backups.reduce((sum, backup) => sum + backup.size, 0);
  const totalMB = totalBytes / (1024 * 1024);
  const totalGB = totalMB / 1024;
  
  return {
    bytes: totalBytes,
    mb: totalMB,
    gb: totalGB,
    formatted: totalGB > 1 ? `${totalGB.toFixed(2)} GB` : `${totalMB.toFixed(2)} MB`
  };
}

/**
 * Display backup statistics
 */
function showStatistics() {
  const backups = getBackups();
  
  if (backups.length === 0) {
    console.log('\n📊 No backups found.\n');
    return;
  }

  const totalSize = getTotalBackupSize(backups);
  const oldestBackup = backups[backups.length - 1];
  const newestBackup = backups[0];

  console.log('\n📊 Backup Statistics:\n');
  console.log(`   Total backups: ${backups.length}`);
  console.log(`   Total size: ${totalSize.formatted}`);
  console.log(`   Oldest backup: ${oldestBackup.name}`);
  console.log(`     - Date: ${oldestBackup.created.toLocaleString()}`);
  console.log(`     - Age: ${oldestBackup.ageInDays} days`);
  console.log(`   Newest backup: ${newestBackup.name}`);
  console.log(`     - Date: ${newestBackup.created.toLocaleString()}`);
  console.log(`     - Age: ${newestBackup.ageInDays} days\n`);
}

/**
 * Find backups to delete based on policy
 */
function findBackupsToDelete(policies = DEFAULT_POLICIES) {
  const backups = getBackups();
  const toDelete = [];

  // Sort by date (newest first)
  const sortedBackups = [...backups].sort((a, b) => b.created - a.created);

  // Always keep minimum number of backups
  const backupsToEvaluate = sortedBackups.slice(policies.minCount);

  for (const backup of backupsToEvaluate) {
    // Delete if too old
    if (backup.ageInDays > policies.maxAge) {
      toDelete.push({
        ...backup,
        reason: `Older than ${policies.maxAge} days`
      });
    }
  }

  // Delete excess backups beyond maxCount
  if (sortedBackups.length > policies.maxCount) {
    const excessBackups = sortedBackups.slice(policies.maxCount);
    for (const backup of excessBackups) {
      if (!toDelete.find(b => b.name === backup.name)) {
        toDelete.push({
          ...backup,
          reason: `Exceeds maximum count of ${policies.maxCount}`
        });
      }
    }
  }

  return toDelete;
}

/**
 * Delete specified backups
 */
function deleteBackups(backups, dryRun = false) {
  if (backups.length === 0) {
    console.log('✓ No backups to delete.\n');
    return;
  }

  console.log(`\n${dryRun ? '🔍 DRY RUN - ' : '🗑️  '}Backups to delete:\n`);
  
  let totalSize = 0;
  backups.forEach((backup, index) => {
    console.log(`${index + 1}. ${backup.name}`);
    console.log(`   Reason: ${backup.reason}`);
    console.log(`   Size: ${backup.sizeFormatted}`);
    console.log(`   Age: ${backup.ageInDays} days\n`);
    totalSize += backup.size;
  });

  const sizeToFree = (totalSize / (1024 * 1024)).toFixed(2);
  console.log(`Total space to free: ${sizeToFree} MB\n`);

  if (!dryRun) {
    let deletedCount = 0;
    for (const backup of backups) {
      try {
        fs.unlinkSync(backup.path);
        deletedCount++;
      } catch (error) {
        console.error(`❌ Failed to delete ${backup.name}: ${error.message}`);
      }
    }
    console.log(`✅ Successfully deleted ${deletedCount} backup(s)\n`);
  } else {
    console.log('💡 Run without --dry-run to actually delete these backups.\n');
  }
}

/**
 * Interactive cleanup
 */
function interactiveCleanup() {
  const backups = getBackups();
  
  if (backups.length === 0) {
    console.log('\n📋 No backups found.\n');
    return;
  }

  console.log('\n📋 All Backups:\n');
  backups.forEach((backup, index) => {
    console.log(`${index + 1}. ${backup.name}`);
    console.log(`   Size: ${backup.sizeFormatted}`);
    console.log(`   Date: ${backup.created.toLocaleString()}`);
    console.log(`   Age: ${backup.ageInDays} days\n`);
  });

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('Enter backup numbers to delete (comma-separated) or "all" or "q" to quit: ', (answer) => {
    if (answer.toLowerCase() === 'q') {
      console.log('Cleanup cancelled.');
      rl.close();
      return;
    }

    let toDelete = [];

    if (answer.toLowerCase() === 'all') {
      toDelete = backups;
    } else {
      const indices = answer.split(',').map(s => parseInt(s.trim()) - 1);
      toDelete = indices
        .filter(i => !isNaN(i) && i >= 0 && i < backups.length)
        .map(i => backups[i]);
    }

    if (toDelete.length === 0) {
      console.log('No valid selections made.');
      rl.close();
      return;
    }

    rl.question(`\n⚠ Delete ${toDelete.length} backup(s)? This cannot be undone. (yes/no): `, (confirm) => {
      if (confirm.toLowerCase() === 'yes') {
        toDelete.forEach(backup => {
          try {
            fs.unlinkSync(backup.path);
            console.log(`✓ Deleted: ${backup.name}`);
          } catch (error) {
            console.error(`❌ Failed to delete ${backup.name}: ${error.message}`);
          }
        });
        console.log('\n✅ Cleanup completed.\n');
      } else {
        console.log('Cleanup cancelled.');
      }
      rl.close();
    });
  });
}

/**
 * Apply cleanup policy
 */
function applyPolicy(policies = DEFAULT_POLICIES, dryRun = false) {
  console.log('\n🔧 Applying cleanup policy:\n');
  console.log(`   Maximum age: ${policies.maxAge} days`);
  console.log(`   Maximum count: ${policies.maxCount}`);
  console.log(`   Minimum to keep: ${policies.minCount}\n`);

  const toDelete = findBackupsToDelete(policies);
  deleteBackups(toDelete, dryRun);
}

/**
 * List all backups
 */
function listBackups() {
  const backups = getBackups();
  
  if (backups.length === 0) {
    console.log('\n📋 No backups found.\n');
    return;
  }

  console.log('\n📋 All Backups:\n');
  backups.forEach((backup, index) => {
    console.log(`${index + 1}. ${backup.name}`);
    console.log(`   Size: ${backup.sizeFormatted}`);
    console.log(`   Date: ${backup.created.toLocaleString()}`);
    console.log(`   Age: ${backup.ageInDays} days\n`);
  });
}

// Command line interface
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes('--help')) {
    console.log(`
Backup Cleanup System for FamilyMedia Project

Usage:
  node cleanup.js [options]

Options:
  --list                List all backups
  --stats               Show backup statistics
  --policy              Apply default retention policy
  --dry-run            Show what would be deleted without deleting
  --max-age DAYS       Set maximum age in days (default: 30)
  --max-count N        Set maximum number of backups (default: 10)
  --min-count N        Set minimum backups to keep (default: 3)
  --interactive        Interactive cleanup mode (default)
  --help               Show this help message

Examples:
  node cleanup.js --list
  node cleanup.js --stats
  node cleanup.js --policy --dry-run
  node cleanup.js --policy --max-age 14 --max-count 5
  node cleanup.js --interactive
    `);
  } else if (args.includes('--stats')) {
    showStatistics();
  } else if (args.includes('--list')) {
    listBackups();
  } else if (args.includes('--policy')) {
    const policies = { ...DEFAULT_POLICIES };
    
    const maxAgeIndex = args.indexOf('--max-age');
    if (maxAgeIndex !== -1) {
      policies.maxAge = parseInt(args[maxAgeIndex + 1]) || DEFAULT_POLICIES.maxAge;
    }

    const maxCountIndex = args.indexOf('--max-count');
    if (maxCountIndex !== -1) {
      policies.maxCount = parseInt(args[maxCountIndex + 1]) || DEFAULT_POLICIES.maxCount;
    }

    const minCountIndex = args.indexOf('--min-count');
    if (minCountIndex !== -1) {
      policies.minCount = parseInt(args[minCountIndex + 1]) || DEFAULT_POLICIES.minCount;
    }

    const dryRun = args.includes('--dry-run');
    applyPolicy(policies, dryRun);
  } else {
    interactiveCleanup();
  }
}

module.exports = { 
  getBackups, 
  findBackupsToDelete, 
  deleteBackups, 
  showStatistics,
  applyPolicy
};
