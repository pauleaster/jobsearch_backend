#!/bin/bash

# Prompt the user for the base filename
echo -n "Enter base filename for backup (without timestamp): "
read base_filename

# Get the current timestamp
timestamp=$(date "+%Y%m%d_%H%M%S")

# Construct the full filename
backup_filename="../sql_backups/${timestamp}_${base_filename}.sql"

# Confirm with the user
echo "The backup will be saved to: $backup_filename"
echo -n "Do you want to continue? (yes/no): "
read answer

# Check the user's answer
if [ "$answer" == "yes" ]; then
    pg_dump -U jobsearch -d jobsearch_db -f "$backup_filename"
    echo "Backup completed!"
else
    echo "Backup aborted by user."
fi
