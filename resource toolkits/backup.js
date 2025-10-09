#!/usr/bin/env node

/**
 * Backup System for FamilyMedia Project
 * 
 * This script creates timestamped backups of all important project files
 * and directories, excluding node_modules and other non-essential files.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const PROJECT_ROOT = path.join(__dirname, '..');
const BACKUP_DIR = path.join(__dirname, 'backups');
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-').split('T').join('_').substring(0, 19);
const BACKUP_NAME = `backup_${TIMESTAMP}`;
const BACKUP_PATH = path.join(BACKUP_DIR, BACKUP_NAME);

// Files and directories to include in backup
const INCLUDE_PATTERNS = [
  'SEO Hubs:',
  'Newsletter:',
  'Inbound Leads:',
  'Media Kit:',
  'Global:',
  '*.md',
  '*.json',
  '*.html'
];

// Patterns to exclude
const EXCLUDE_PATTERNS = [
  'node_modules/',
  '.DS_Store',
  '*.log',
  'backups/',
  '.git/',
  'coverage/',
  'dist/',
  'build/'
];

/**
 * Ensure backup directory exists
 */
function ensureBackupDir() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    console.log(`✓ Created backup directory: ${BACKUP_DIR}`);
  }
}

/**
 * Create backup directory structure
 */
function createBackupStructure() {
  if (!fs.existsSync(BACKUP_PATH)) {
    fs.mkdirSync(BACKUP_PATH, { recursive: true });
    console.log(`✓ Created backup: ${BACKUP_NAME}`);
  }
}

/**
 * Copy directory recursively with exclusions
 */
function copyDir(src, dest, excludePatterns = []) {
  // Check if source exists
  if (!fs.existsSync(src)) {
    console.warn(`⚠ Source does not exist: ${src}`);
    return;
  }

  // Get the base name of the source
  const baseName = path.basename(src);
  
  // Check if this path should be excluded
  for (const pattern of excludePatterns) {
    if (baseName.includes(pattern.replace('/', '')) || src.includes(pattern)) {
      return;
    }
  }

  // Create destination directory
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  // Read directory contents
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    // Skip excluded patterns
    let shouldExclude = false;
    for (const pattern of excludePatterns) {
      if (entry.name.includes(pattern.replace('/', '')) || 
          entry.name === pattern.replace('/', '') ||
          pattern.startsWith('*') && entry.name.endsWith(pattern.substring(1))) {
        shouldExclude = true;
        break;
      }
    }

    if (shouldExclude) {
      continue;
    }

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath, excludePatterns);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * Copy file if it exists
 */
function copyFile(src, dest) {
  if (fs.existsSync(src)) {
    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    fs.copyFileSync(src, dest);
    return true;
  }
  return false;
}

/**
 * Main backup function
 */
function performBackup() {
  console.log('\n🔄 Starting backup process...\n');
  
  ensureBackupDir();
  createBackupStructure();

  let fileCount = 0;
  let dirCount = 0;

  // Backup all directories
  const dirs = ['SEO Hubs:', 'Newsletter:', 'Inbound Leads:', 'Media Kit:', 'Global:'];
  
  for (const dir of dirs) {
    const srcPath = path.join(PROJECT_ROOT, dir);
    const destPath = path.join(BACKUP_PATH, dir);
    
    if (fs.existsSync(srcPath)) {
      console.log(`📁 Backing up: ${dir}`);
      copyDir(srcPath, destPath, EXCLUDE_PATTERNS);
      dirCount++;
    }
  }

  // Backup markdown files in root
  const rootFiles = fs.readdirSync(PROJECT_ROOT);
  for (const file of rootFiles) {
    if (file.endsWith('.md') || file.endsWith('.json')) {
      const srcPath = path.join(PROJECT_ROOT, file);
      const destPath = path.join(BACKUP_PATH, file);
      
      if (copyFile(srcPath, destPath)) {
        fileCount++;
      }
    }
  }

  // Create backup metadata
  const metadata = {
    timestamp: new Date().toISOString(),
    backupName: BACKUP_NAME,
    directories: dirCount,
    files: fileCount,
    projectRoot: PROJECT_ROOT
  };

  fs.writeFileSync(
    path.join(BACKUP_PATH, 'backup-metadata.json'),
    JSON.stringify(metadata, null, 2)
  );

  // Create archive
  console.log('\n📦 Creating compressed archive...');
  
  try {
    const archiveName = `${BACKUP_NAME}.tar.gz`;
    const archivePath = path.join(BACKUP_DIR, archiveName);
    
    process.chdir(BACKUP_DIR);
    execSync(`tar -czf "${archiveName}" "${BACKUP_NAME}"`);
    
    // Remove uncompressed backup directory
    fs.rmSync(BACKUP_PATH, { recursive: true, force: true });
    
    const stats = fs.statSync(archivePath);
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    
    console.log(`\n✅ Backup completed successfully!`);
    console.log(`   Archive: ${archiveName}`);
    console.log(`   Size: ${sizeMB} MB`);
    console.log(`   Location: ${archivePath}`);
    console.log(`   Directories backed up: ${dirCount}`);
    console.log(`   Root files backed up: ${fileCount}\n`);
    
    return archivePath;
  } catch (error) {
    console.error('❌ Error creating archive:', error.message);
    process.exit(1);
  }
}

/**
 * List all backups
 */
function listBackups() {
  if (!fs.existsSync(BACKUP_DIR)) {
    console.log('No backups directory found.');
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
        created: stats.mtime
      };
    })
    .sort((a, b) => b.created - a.created);

  return backups;
}

// Run backup if called directly
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--list')) {
    console.log('\n📋 Available Backups:\n');
    const backups = listBackups();
    
    if (backups.length === 0) {
      console.log('No backups found.\n');
    } else {
      backups.forEach((backup, index) => {
        console.log(`${index + 1}. ${backup.name}`);
        console.log(`   Size: ${backup.size}`);
        console.log(`   Date: ${backup.created.toLocaleString()}`);
        console.log('');
      });
    }
  } else {
    performBackup();
  }
}

module.exports = { performBackup, listBackups };
