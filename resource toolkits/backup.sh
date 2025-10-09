#!/bin/bash

###############################################################################
# Backup Script for FamilyMedia Project (Bash Version)
# 
# This script creates timestamped backups without requiring Node.js
###############################################################################

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/backups"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_NAME="backup_${TIMESTAMP}"
ARCHIVE_NAME="${BACKUP_NAME}.tar.gz"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Directories to include
INCLUDE_DIRS=(
  "SEO Hubs:"
  "Newsletter:"
  "Inbound Leads:"
  "Media Kit:"
  "Global:"
)

# Files to exclude
EXCLUDE_PATTERNS=(
  "*/node_modules/*"
  "*.DS_Store"
  "*.log"
  "*/backups/*"
  "*/.git/*"
  "*/coverage/*"
  "*/dist/*"
  "*/build/*"
  "*/.cursor/*"
)

###############################################################################
# Functions
###############################################################################

print_header() {
  echo -e "\n${BLUE}🔄 Starting backup process...${NC}\n"
}

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

ensure_backup_dir() {
  if [ ! -d "$BACKUP_DIR" ]; then
    mkdir -p "$BACKUP_DIR"
    print_success "✓ Created backup directory: $BACKUP_DIR"
  fi
}

create_exclude_file() {
  local exclude_file="/tmp/backup_exclude_$$"
  rm -f "$exclude_file"
  
  for pattern in "${EXCLUDE_PATTERNS[@]}"; do
    echo "$pattern" >> "$exclude_file"
  done
  
  echo "$exclude_file"
}

create_backup() {
  print_header
  ensure_backup_dir
  
  cd "$PROJECT_ROOT" || exit 1
  
  # Create temporary directory for backup
  local temp_dir="${BACKUP_DIR}/${BACKUP_NAME}"
  mkdir -p "$temp_dir"
  
  # Copy directories
  local dir_count=0
  for dir in "${INCLUDE_DIRS[@]}"; do
    if [ -d "$dir" ]; then
      print_info "📁 Backing up: $dir"
      cp -R "$dir" "$temp_dir/" 2>/dev/null
      ((dir_count++))
    else
      print_warning "⚠  Directory not found: $dir"
    fi
  done
  
  # Copy markdown and JSON files from root
  local file_count=0
  for file in *.md *.json; do
    if [ -f "$file" ]; then
      cp "$file" "$temp_dir/" 2>/dev/null
      ((file_count++))
    fi
  done
  
  # Remove excluded patterns from temp directory
  if [ -d "$temp_dir" ]; then
    find "$temp_dir" -name ".DS_Store" -delete 2>/dev/null
    find "$temp_dir" -type d -name "node_modules" -exec rm -rf {} + 2>/dev/null
    find "$temp_dir" -type d -name ".git" -exec rm -rf {} + 2>/dev/null
    find "$temp_dir" -name "*.log" -delete 2>/dev/null
  fi
  
  # Create metadata file
  cat > "$temp_dir/backup-metadata.json" << EOF
{
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")",
  "backupName": "$BACKUP_NAME",
  "directories": $dir_count,
  "files": $file_count,
  "projectRoot": "$PROJECT_ROOT",
  "createdWith": "bash-script"
}
EOF
  
  # Create compressed archive
  print_info "\n📦 Creating compressed archive..."
  
  cd "$BACKUP_DIR" || exit 1
  tar -czf "$ARCHIVE_NAME" "$BACKUP_NAME" 2>/dev/null
  
  if [ $? -eq 0 ]; then
    # Remove temporary directory
    rm -rf "$BACKUP_NAME"
    
    # Get archive size
    local size_bytes=$(stat -f%z "$ARCHIVE_NAME" 2>/dev/null || stat -c%s "$ARCHIVE_NAME" 2>/dev/null)
    local size_mb=$(echo "scale=2; $size_bytes / 1024 / 1024" | bc)
    
    print_success "\n✅ Backup completed successfully!"
    print_info "   Archive: $ARCHIVE_NAME"
    print_info "   Size: ${size_mb} MB"
    print_info "   Location: ${BACKUP_DIR}/${ARCHIVE_NAME}"
    print_info "   Directories backed up: $dir_count"
    print_info "   Root files backed up: $file_count"
    echo ""
  else
    print_error "\n❌ Error creating archive"
    rm -rf "$BACKUP_NAME"
    exit 1
  fi
}

list_backups() {
  print_info "\n📋 Available Backups:\n"
  
  if [ ! -d "$BACKUP_DIR" ]; then
    echo "No backups directory found."
    echo ""
    return
  fi
  
  cd "$BACKUP_DIR" || exit 1
  
  local count=0
  for backup in backup_*.tar.gz; do
    if [ -f "$backup" ]; then
      ((count++))
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
  fi
}

show_help() {
  cat << EOF

Backup Script for FamilyMedia Project

Usage:
  ./backup.sh [command]

Commands:
  create       Create a new backup (default)
  list         List all available backups
  help         Show this help message

Examples:
  ./backup.sh
  ./backup.sh create
  ./backup.sh list

EOF
}

###############################################################################
# Main
###############################################################################

case "${1:-create}" in
  create)
    create_backup
    ;;
  list)
    list_backups
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
