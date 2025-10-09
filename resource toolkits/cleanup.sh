#!/bin/bash

###############################################################################
# Cleanup Script for FamilyMedia Project Backups (Bash Version)
# 
# This script manages backup retention without requiring Node.js
###############################################################################

# Configuration
BACKUP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/backups"

# Default retention policies
MAX_AGE_DAYS=30
MAX_COUNT=10
MIN_COUNT=3

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

get_age_in_days() {
  local file="$1"
  local file_time=$(stat -f %m "$file" 2>/dev/null || stat -c %Y "$file" 2>/dev/null)
  local current_time=$(date +%s)
  local age_seconds=$((current_time - file_time))
  local age_days=$((age_seconds / 86400))
  echo "$age_days"
}

show_statistics() {
  print_info "\n📊 Backup Statistics:\n"
  
  if [ ! -d "$BACKUP_DIR" ]; then
    echo "No backups directory found."
    echo ""
    return
  fi
  
  cd "$BACKUP_DIR" || exit 1
  
  local backups=(backup_*.tar.gz)
  local count=0
  local total_size=0
  local oldest=""
  local oldest_age=0
  local newest=""
  local newest_age=999999
  
  for backup in "${backups[@]}"; do
    if [ -f "$backup" ]; then
      ((count++))
      
      local size=$(stat -f%z "$backup" 2>/dev/null || stat -c%s "$backup" 2>/dev/null)
      total_size=$((total_size + size))
      
      local age=$(get_age_in_days "$backup")
      
      if [ -z "$oldest" ] || [ $age -gt $oldest_age ]; then
        oldest="$backup"
        oldest_age=$age
      fi
      
      if [ -z "$newest" ] || [ $age -lt $newest_age ]; then
        newest="$backup"
        newest_age=$age
      fi
    fi
  done
  
  if [ $count -eq 0 ]; then
    echo "No backups found."
    echo ""
    return
  fi
  
  local total_mb=$(echo "scale=2; $total_size / 1024 / 1024" | bc)
  local total_gb=$(echo "scale=2; $total_mb / 1024" | bc)
  
  if (( $(echo "$total_gb > 1" | bc -l) )); then
    local size_formatted="${total_gb} GB"
  else
    local size_formatted="${total_mb} MB"
  fi
  
  echo "   Total backups: $count"
  echo "   Total size: $size_formatted"
  
  if [ -n "$oldest" ]; then
    local oldest_date=$(stat -f "%Sm" -t "%Y-%m-%d %H:%M:%S" "$oldest" 2>/dev/null || stat -c "%y" "$oldest" 2>/dev/null | cut -d'.' -f1)
    echo "   Oldest backup: $oldest"
    echo "     - Date: $oldest_date"
    echo "     - Age: $oldest_age days"
  fi
  
  if [ -n "$newest" ]; then
    local newest_date=$(stat -f "%Sm" -t "%Y-%m-%d %H:%M:%S" "$newest" 2>/dev/null || stat -c "%y" "$newest" 2>/dev/null | cut -d'.' -f1)
    echo "   Newest backup: $newest"
    echo "     - Date: $newest_date"
    echo "     - Age: $newest_age days"
  fi
  
  echo ""
}

list_backups() {
  print_info "\n📋 All Backups:\n"
  
  if [ ! -d "$BACKUP_DIR" ]; then
    echo "No backups directory found."
    echo ""
    return 1
  fi
  
  cd "$BACKUP_DIR" || exit 1
  
  local count=0
  for backup in $(ls -t backup_*.tar.gz 2>/dev/null); do
    if [ -f "$backup" ]; then
      ((count++))
      
      local size_bytes=$(stat -f%z "$backup" 2>/dev/null || stat -c%s "$backup" 2>/dev/null)
      local size_mb=$(echo "scale=2; $size_bytes / 1024 / 1024" | bc)
      local date_modified=$(stat -f "%Sm" -t "%Y-%m-%d %H:%M:%S" "$backup" 2>/dev/null || stat -c "%y" "$backup" 2>/dev/null | cut -d'.' -f1)
      local age=$(get_age_in_days "$backup")
      
      echo "${count}. $backup"
      echo "   Size: ${size_mb} MB"
      echo "   Date: $date_modified"
      echo "   Age: $age days"
      echo ""
    fi
  done
  
  if [ $count -eq 0 ]; then
    echo "No backups found."
    echo ""
    return 1
  fi
}

find_backups_to_delete() {
  local max_age="$1"
  local max_count="$2"
  local min_count="$3"
  
  if [ ! -d "$BACKUP_DIR" ]; then
    return
  fi
  
  cd "$BACKUP_DIR" || exit 1
  
  # Get all backups sorted by date (newest first)
  local backups=($(ls -t backup_*.tar.gz 2>/dev/null))
  local total_count=${#backups[@]}
  
  if [ $total_count -eq 0 ]; then
    return
  fi
  
  local to_delete=()
  local reasons=()
  
  # Keep minimum number of backups
  local start_index=$min_count
  
  for (( i=$start_index; i<$total_count; i++ )); do
    local backup="${backups[$i]}"
    local age=$(get_age_in_days "$backup")
    
    # Delete if too old
    if [ $age -gt $max_age ]; then
      to_delete+=("$backup")
      reasons+=("Older than $max_age days")
    fi
  done
  
  # Delete excess backups beyond max_count
  if [ $total_count -gt $max_count ]; then
    for (( i=$max_count; i<$total_count; i++ )); do
      local backup="${backups[$i]}"
      
      # Check if not already in delete list
      local found=0
      for del in "${to_delete[@]}"; do
        if [ "$del" = "$backup" ]; then
          found=1
          break
        fi
      done
      
      if [ $found -eq 0 ]; then
        to_delete+=("$backup")
        reasons+=("Exceeds maximum count of $max_count")
      fi
    done
  fi
  
  # Output results
  for i in "${!to_delete[@]}"; do
    echo "${to_delete[$i]}|${reasons[$i]}"
  done
}

delete_backups() {
  local dry_run="$1"
  shift
  local backups=("$@")
  
  if [ ${#backups[@]} -eq 0 ]; then
    print_success "✓ No backups to delete.\n"
    return
  fi
  
  if [ "$dry_run" = "true" ]; then
    print_info "\n🔍 DRY RUN - Backups that would be deleted:\n"
  else
    print_info "\n🗑️  Deleting backups:\n"
  fi
  
  local total_size=0
  local count=0
  
  for item in "${backups[@]}"; do
    IFS='|' read -r backup reason <<< "$item"
    
    if [ -f "${BACKUP_DIR}/${backup}" ]; then
      ((count++))
      
      local size_bytes=$(stat -f%z "${BACKUP_DIR}/${backup}" 2>/dev/null || stat -c%s "${BACKUP_DIR}/${backup}" 2>/dev/null)
      local size_mb=$(echo "scale=2; $size_bytes / 1024 / 1024" | bc)
      local age=$(get_age_in_days "${BACKUP_DIR}/${backup}")
      
      echo "${count}. $backup"
      echo "   Reason: $reason"
      echo "   Size: ${size_mb} MB"
      echo "   Age: $age days"
      echo ""
      
      total_size=$((total_size + size_bytes))
    fi
  done
  
  local total_mb=$(echo "scale=2; $total_size / 1024 / 1024" | bc)
  echo "Total space to free: ${total_mb} MB"
  echo ""
  
  if [ "$dry_run" != "true" ]; then
    local deleted_count=0
    for item in "${backups[@]}"; do
      IFS='|' read -r backup reason <<< "$item"
      
      if [ -f "${BACKUP_DIR}/${backup}" ]; then
        rm -f "${BACKUP_DIR}/${backup}"
        if [ $? -eq 0 ]; then
          ((deleted_count++))
        else
          print_error "❌ Failed to delete $backup"
        fi
      fi
    done
    
    print_success "✅ Successfully deleted ${deleted_count} backup(s)\n"
  else
    print_info "💡 Run without --dry-run to actually delete these backups.\n"
  fi
}

apply_policy() {
  local max_age="$1"
  local max_count="$2"
  local min_count="$3"
  local dry_run="$4"
  
  print_info "\n🔧 Applying cleanup policy:\n"
  echo "   Maximum age: $max_age days"
  echo "   Maximum count: $max_count"
  echo "   Minimum to keep: $min_count"
  echo ""
  
  # Find backups to delete
  local to_delete=($(find_backups_to_delete "$max_age" "$max_count" "$min_count"))
  
  delete_backups "$dry_run" "${to_delete[@]}"
}

interactive_cleanup() {
  list_backups
  
  if [ $? -ne 0 ]; then
    return
  fi
  
  echo -n "Enter backup numbers to delete (comma-separated) or 'all' or 'q' to quit: "
  read answer
  
  if [ "$answer" = "q" ] || [ "$answer" = "Q" ]; then
    echo "Cleanup cancelled."
    return
  fi
  
  cd "$BACKUP_DIR" || exit 1
  local all_backups=($(ls -t backup_*.tar.gz 2>/dev/null))
  local to_delete=()
  
  if [ "$answer" = "all" ] || [ "$answer" = "ALL" ]; then
    to_delete=("${all_backups[@]}")
  else
    IFS=',' read -ra indices <<< "$answer"
    for index in "${indices[@]}"; do
      index=$(echo "$index" | xargs)  # trim whitespace
      
      if [[ "$index" =~ ^[0-9]+$ ]]; then
        local arr_index=$((index - 1))
        if [ $arr_index -ge 0 ] && [ $arr_index -lt ${#all_backups[@]} ]; then
          to_delete+=("${all_backups[$arr_index]}|Manual selection")
        fi
      fi
    done
  fi
  
  if [ ${#to_delete[@]} -eq 0 ]; then
    echo "No valid selections made."
    return
  fi
  
  echo ""
  print_warning "⚠  Delete ${#to_delete[@]} backup(s)? This cannot be undone. (yes/no): "
  read confirm
  
  if [ "$confirm" = "yes" ]; then
    for backup in "${to_delete[@]}"; do
      IFS='|' read -r file reason <<< "$backup"
      
      if [ -f "$file" ]; then
        rm -f "$file"
        if [ $? -eq 0 ]; then
          print_success "✓ Deleted: $file"
        else
          print_error "❌ Failed to delete $file"
        fi
      fi
    done
    echo ""
    print_success "✅ Cleanup completed.\n"
  else
    echo "Cleanup cancelled."
  fi
}

show_help() {
  cat << EOF

Backup Cleanup Script for FamilyMedia Project

Usage:
  ./cleanup.sh [command] [options]

Commands:
  interactive     Interactive cleanup mode (default)
  policy          Apply retention policy
  stats           Show backup statistics
  list            List all backups
  help            Show this help message

Options (for policy command):
  --max-age N     Maximum age in days (default: 30)
  --max-count N   Maximum number of backups (default: 10)
  --min-count N   Minimum backups to keep (default: 3)
  --dry-run       Preview deletions without deleting

Examples:
  ./cleanup.sh
  ./cleanup.sh interactive
  ./cleanup.sh stats
  ./cleanup.sh policy --dry-run
  ./cleanup.sh policy --max-age 14 --max-count 5
  ./cleanup.sh list

EOF
}

###############################################################################
# Main
###############################################################################

# Parse arguments
MAX_AGE=$MAX_AGE_DAYS
MAX_CNT=$MAX_COUNT
MIN_CNT=$MIN_COUNT
DRY_RUN="false"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --max-age)
      MAX_AGE="$2"
      shift 2
      ;;
    --max-count)
      MAX_CNT="$2"
      shift 2
      ;;
    --min-count)
      MIN_CNT="$2"
      shift 2
      ;;
    --dry-run)
      DRY_RUN="true"
      shift
      ;;
    *)
      break
      ;;
  esac
done

case "${1:-interactive}" in
  interactive)
    interactive_cleanup
    ;;
  policy)
    apply_policy "$MAX_AGE" "$MAX_CNT" "$MIN_CNT" "$DRY_RUN"
    ;;
  stats)
    show_statistics
    ;;
  list)
    list_backups > /dev/null
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
