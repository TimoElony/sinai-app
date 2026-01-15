#!/bin/bash

# Database Backup Script for R2
# Creates a compressed PostgreSQL dump and uploads to Cloudflare R2

# Load environment variables
if [ ! -f .env.local ]; then
    echo "Error: .env.local file not found"
    exit 1
fi

# Source environment variables
export $(cat .env.local | grep ^DB_ | xargs)

# Verify required variables
if [ -z "$DB_HOST" ] || [ -z "$DB_USER" ] || [ -z "$DB_PASSWORD" ] || [ -z "$DB_NAME" ]; then
    echo "Error: Missing database credentials in .env.local"
    exit 1
fi

# Create backups directory if it doesn't exist
mkdir -p backups

# Generate backup filename with timestamp
TIMESTAMP=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_FILE="backups/sinai-db-backup-${TIMESTAMP}.sql.gz"

echo "Creating database backup: $BACKUP_FILE"

# Create compressed database dump
PGPASSWORD=$DB_PASSWORD pg_dump \
    -h "$DB_HOST" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    -v | gzip > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Database backup created successfully"
    
    # Upload to R2 using rclone
    echo "Uploading to R2..."
    rclone copy "$BACKUP_FILE" "r2:sinai-backups/database/" --progress
    
    if [ $? -eq 0 ]; then
        echo "✅ Backup uploaded to R2"
        
        # Keep only last 12 backups locally
        echo "Cleaning up old local backups..."
        ls -t backups/sinai-db-backup-*.sql.gz | tail -n +13 | xargs -r rm
        
        echo "✅ Backup complete!"
    else
        echo "❌ Error uploading to R2"
        exit 1
    fi
else
    echo "❌ Error creating database backup"
    exit 1
fi
