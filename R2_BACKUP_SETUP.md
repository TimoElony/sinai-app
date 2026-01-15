# R2 Bucket Setup & Database Backup Configuration

This guide walks you through setting up your Cloudflare R2 bucket for automated database backups.

## Step 1: Create R2 API Token

1. Log into [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Go to your account home → **Settings** or directly to **R2**
3. Click **R2** in the left sidebar
4. Look for **API Tokens** section (may be under R2 Settings)
5. Click **Create API Token**
6. Fill in the form:
   - **Token Name**: `GitHub Database Backup`
   - **Permissions**: 
     - Select **Object Read & Write** (for reading and writing files)
     - Select **Bucket List Read** (for listing backups)
   - **Bucket Scope**: Select your bucket `sinai-backups`
   - **TTL**: No expiration (or set as preferred)
7. Click **Create API Token**
8. You'll see the credentials appear. **Copy and save these immediately:**
   - **Access Key ID**
   - **Secret Access Key**

**Find Your Account ID:**
- In the R2 overview page, look for **Account ID** (format: `abc123xyz...`)
- It's usually displayed in the top section of R2

## Step 2: Add GitHub Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** for each of these:

| Secret Name | Value | Source |
|---|---|---|
| `R2_ACCOUNT_ID` | Your Cloudflare Account ID | From Cloudflare R2 page |
| `R2_ACCESS_KEY_ID` | API Token Access Key ID | From API Token creation |
| `R2_SECRET_ACCESS_KEY` | API Token Secret Access Key | From API Token creation |
| `DB_HOST` | PostgreSQL host | From `.env.local` |
| `DB_USER` | PostgreSQL user | From `.env.local` |
| `DB_PASSWORD` | PostgreSQL password | From `.env.local` |
| `DB_NAME` | PostgreSQL database name | From `.env.local` |

**Get database credentials:**
```bash
cat .env.local | grep ^DB_
```

Example output:
```
DB_HOST=aws-0-eu-central-1.pooler.supabase.com
DB_USER=postgres.vwpzcvemysspydbtlcxo
DB_PASSWORD=your_password_here
DB_NAME=postgres
```

## Step 3: Configure rclone Locally (Optional)

To test backups locally before the scheduled runs:

```bash
# Install rclone
brew install rclone  # macOS
# or
sudo apt-get install rclone  # Linux

# Configure rclone
rclone config

# Follow the prompts:
# - Name: r2
# - Storage type: s3 (option 4)
# - Provider: Cloudflare (option 12)
# - Access Key ID: [paste from API token]
# - Secret Access Key: [paste from API token]
# - Endpoint: https://[YOUR_ACCOUNT_ID].r2.cloudflarestorage.com
# - ACL: private
# - Keep other defaults
```

## Step 4: Test the Backup

### Local Test
```bash
# Make the script executable
chmod +x scripts/backup-to-r2.sh

# Run the backup
bash scripts/backup-to-r2.sh

# Check backups
ls -lh backups/
rclone lsf r2:sinai-backups/database/
```

### GitHub Actions Test
1. Go to your repository on GitHub
2. Click **Actions** tab
3. Select **Monthly Database Backup to R2** workflow
4. Click **Run workflow** dropdown
5. Click **Run workflow** button
6. Watch the execution

Monitor the logs to ensure:
- ✅ PostgreSQL dump created successfully
- ✅ File uploaded to R2
- ✅ Old backups cleaned up

## Scheduled Backups

Once set up, the workflow runs automatically:
- **When**: 1st of every month at 2 AM UTC
- **What**: Creates a gzip-compressed PostgreSQL dump
- **Where**: Uploads to `r2:sinai-backups/database/`
- **Retention**: Keeps last 12 backups

## Restore from Backup

### List Available Backups
```bash
rclone lsf r2:sinai-backups/database/
```

### Download a Backup
```bash
rclone copy "r2:sinai-backups/database/sinai-db-backup-2026-01-15_14-30-45.sql.gz" .
```

### Restore to Database
```bash
# Decompress
gunzip sinai-db-backup-2026-01-15_14-30-45.sql.gz

# Restore
PGPASSWORD=$DB_PASSWORD psql \
  -h $DB_HOST \
  -U $DB_USER \
  -d $DB_NAME \
  < sinai-db-backup-2026-01-15_14-30-45.sql
```

## Troubleshooting

### "Error: Missing database credentials in .env.local"
- Verify `.env.local` exists in project root
- Check it contains: `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`

### "rclone: command not found" (Local test)
```bash
brew install rclone  # macOS
sudo apt-get install rclone  # Linux
```

### "pg_dump: command not found" (Local test)
```bash
brew install postgresql  # macOS
sudo apt-get install postgresql-client  # Linux
```

### GitHub Actions Workflow Fails
- Verify all 7 secrets are added to GitHub
- Check workflow logs for specific error messages
- Test locally first: `bash scripts/backup-to-r2.sh`

### "FATAL: password authentication failed"
- Verify `DB_PASSWORD` in `.env.local` and GitHub secret match exactly
- Test connection: `PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "SELECT version()"`

## Storage & Costs

**R2 Pricing:**
- Storage: $0.015/GB/month
- Requests: $0.36 per million

**Example (50 MB database, 12 monthly backups):**
- Total storage: 600 MB (0.6 GB)
- Monthly cost: 0.6 × $0.015 = $0.009
- **Total: ~$0.18/month**

## References

- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)
- [rclone R2 Setup](https://rclone.org/s3/#cloudflare-r2)
- [PostgreSQL pg_dump](https://www.postgresql.org/docs/current/app-pgdump.html)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions)
