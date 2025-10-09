#!/bin/bash

###############################################################################
# Restore Script for FamilyMedia Project (Bash Version)
# 
# This script restores backups without requiring Node.js
###############################################################################

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/backups"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

###############################################################################
# Functions
###############################################################################

print_success() {
  echo -e "${GREEN}$1${NC}"
}

print_info() {
  echo -e "${BLUE}$1${NC}"
}

print_warning() {
  echo -e "${YELLOW}$1${NC}"
}

print_error() {
  echo -e "${RED}$1${NC}"
}

list_backups() {
  print_info "\n📋 Available Backups:\n"
  
  if [ ! -d "$BACKUP_DIR" ]; then
    echo "No backups directory found."
    echo ""
    return 1
  fi
  
  cd "$BACKUP_DIR" || exit 1
  
  local backups=()
  local count=0
  
  for backup in $(ls -t backup_*.tar.gz 2>/dev/null); do
    if [ -f "$backup" ]; then
      ((count++))
      backups+=("$backup")
      
      local size_bytes=$(stat -f%z "$backup" 2>/dev/null || stat -c%s "$backup" 2>/dev/null)
      local size_mb=$(echo "scale=2; $size_bytes / 1024 / 1024" | bc)
      local date_modified=$(stat -f "%Sm" -t "%Y-%m-%d %H:%M:%S" "$backup" 2>/dev/null || stat -c "%y" "$backup" 2>/dev/null | cut -d'.' -f1)
      
      echo "${count}. $backup"
      echo "   Size: ${size_mb} MB"
      echo "   Date: $date_modified"
      echo ""
    fi
  done
  
  if [ $count -eq 0 ]; then
    echo "No backups found."
    echo ""
    return 1
  fi
  
  # Return the backups array
  echo "${backups[@]}"
}

restore_backup() {
  local backup_file="$1"
  local dry_run="${2:-false}"
  
  if [ ! -f "${BACKUP_DIR}/${backup_file}" ]; then
    print_error "❌ Backup not found: $backup_file"
    return 1
  fi
  
  print_info "\n🔄 Restoring backup: $backup_file"
  
  local size_bytes=$(stat -f%z "${BACKUP_DIR}/${backup_file}" 2>/dev/null || stat -c%s "${BACKUP_DIR}/${backup_file}" 2>/dev/null)
  local size_mb=$(echo "scale=2; $size_bytes / 1024 / 1024" | bc)
  local date_modified=$(stat -f "%Sm" -t "%Y-%m-%d %H:%M:%S" "${BACKUP_DIR}/${backup_file}" 2>/dev/null || stat -c "%y" "${BACKUP_DIR}/${backup_file}" 2>/dev/null | cut -d'.' -f1)
  
  print_info "   Created: $date_modified"
  print_info "   Size: ${size_mb} MB"
  
  if [ "$dry_run" = "true" ]; then
    print_warning "\n⚠  DRY RUN MODE - No files will be modified\n"
  fi
  
  # Create temporary extraction directory
  local temp_dir="${BACKUP_DIR}/temp_restore_$$"
  mkdir -p "$temp_dir"
  
  # Extract backup
  print_info "\n📦 Extracting backup..."
  tar -xzf "${BACKUP_DIR}/${backup_file}" -C "$temp_dir" 2>/dev/null
  
  if [ $? -ne 0 ]; then
    print_error "❌ Failed to extract backup"
    rm -rf "$temp_dir"
    return 1
  fi
  
  print_success "✓ Backup extracted successfully"
  
  # Find the backup directory (should be only one)
  local backup_dir=$(find "$temp_dir" -maxdepth 1 -type d -name "backup_*" | head -1)
  
  if [ -z "$backup_dir" ]; then
    print_error "❌ Could not find backup data in archive"
    rm -rf "$temp_dir"
    return 1
  fi
  
  # Read metadata if available
  if [ -f "${backup_dir}/backup-metadata.json" ]; then
    print_info "\n📊 Backup Information:"
    if command -v jq &> /dev/null; then
      echo "   Timestamp: $(jq -r '.timestamp' "${backup_dir}/backup-metadata.json")"
      echo "   Directories: $(jq -r '.directories' "${backup_dir}/backup-metadata.json")"
      echo "   Files: $(jq -r '.files' "${backup_dir}/backup-metadata.json")"
    else
      cat "${backup_dir}/backup-metadata.json"
    fi
  fi
  
  if [ "$dry_run" = "true" ]; then
    print_info "\n📁 Files that would be restored:"
    find "$backup_dir" -mindepth 1 -maxdepth 1 ! -name "backup-metadata.json" | while read item; do
      echo "   $(basename "$item")"
    done
    echo ""
  else
    print_info "\n📂 Restoring to: $PROJECT_ROOT"
    
    local restored_count=0
    
    # Restore directories and files
    find "$backup_dir" -mindepth 1 -maxdepth 1 ! -name "backup-metadata.json" | while read item; do
      local basename=$(basename "$item")
      local dest_path="${PROJECT_ROOT}/${basename}"
      
      if [ -d "$item" ]; then
        print_info "   📁 Restoring directory: $basename"
        rm -rf "$dest_path"
        cp -R "$item" "$dest_path"
      elif [ -f "$item" ]; then
        print_info "   📄 Restoring file: $basename"
        cp "$item" "$dest_path"
      fi
      
      ((restored_count++))
    done
    
    print_success "\n✅ Restore completed successfully!"
    echo ""
  fi
  
  # Cleanup
  rm -rf "$temp_dir"
}

interactive_restore() {
  # Get list of backups
  local backups_output=$(list_backups)
  
  if [ $? -ne 0 ]; then
    return 1
  fi
  
  # Convert to array
  local backups=($backups_output)
  
  if [ ${#backups[@]} -eq 0 ]; then
    return 1
  fi
  
  # Ask user to select
  echo -n "Enter the number of the backup to restore (or 'q' to quit): "
  read selection
  
  if [ "$selection" = "q" ] || [ "$selection" = "Q" ]; then
    echo "Restore cancelled."
    return 0
  fi
  
  # Validate selection
  if ! [[ "$selection" =~ ^[0-9]+$ ]]; then
    print_error "❌ Invalid selection."
    return 1
  fi
  
  if [ "$selection" -lt 1 ] || [ "$selection" -gt ${#backups[@]} ]; then
    print_error "❌ Invalid selection."
    return 1
  fi
  
  local selected_backup="${backups[$((selection-1))]}"
  
  # Confirm
  echo ""
  print_warning "⚠  This will overwrite existing files. Continue? (yes/no): "
  read confirm
  
  if [ "$confirm" != "yes" ]; then
    echo "Restore cancelled."
    return 0
  fi
  
  # Perform restore
  restore_backup "$selected_backup" false
}

show_help() {
  cat << EOF

Restore Script for FamilyMedia Project

Usage:
  ./restore.sh [command] [backup-name]

Commands:
  interactive     Interactive backup selection (default)
  list           List all available backups
  restore FILE   Restore a specific backup
  dry-run FILE   Preview what would be restored
  help           Show this help message

Examples:
  ./restore.sh
  ./restore.sh interactive
  ./restore.sh list
  ./restore.sh restore backup_2024-10-07_14-30-00.tar.gz
  ./restore.sh dry-run backup_2024-10-07_14-30-00.tar.gz

EOF
}

###############################################################################
# Main
###############################################################################

case "${1:-interactive}" in
  interactive)
    interactive_restore
    ;;
  list)
    list_backups > /dev/null
    ;;
  restore)
    if [ -z "$2" ]; then
      print_error "❌ Please specify a backup file"
      show_help
      exit 1
    fi
    restore_backup "$2" false
    ;;
  dry-run)
    if [ -z "$2" ]; then
      print_error "❌ Please specify a backup file"
      show_help
      exit 1
    fi
    restore_backup "$2" true
    ;;
  help|--help|-h)
    show_help
    ;;
  *)
    print_error "Unknown command: $1"
    show_help
    exit 1
    ;;
esac
