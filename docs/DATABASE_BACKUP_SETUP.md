# Database Backup Setup Guide

This document outlines how to configure automated backups for the EnvVault Supabase database.

## Supabase Backup Configuration

Supabase provides automated backups on all paid plans (Pro and above). Here's how to ensure backups are properly configured:

### 1. Upgrade to Supabase Pro Plan (if needed)

Free tier does not include automated backups. You must upgrade to Pro ($25/month) to enable backups.

**To upgrade:**
1. Go to https://app.supabase.com
2. Select your project (`gplahqjmrchogofyvzms`)
3. Click "Upgrade to Pro" in the top banner
4. Follow the payment flow

### 2. Verify Backup Settings

Once on Pro plan, backups are automatically enabled with the following defaults:

**Automatic Backups:**
- **Frequency**: Daily backups at 2:00 AM UTC
- **Retention**: 7 daily backups (rolling)
- **Point-in-Time Recovery (PITR)**: Available for the last 7 days

**To verify backup settings:**
1. Go to https://app.supabase.com/project/gplahqjmrchogofyvzms/settings/backups
2. Confirm "Automated backups" is enabled
3. Check the backup schedule and retention policy

### 3. Enable Point-in-Time Recovery (PITR)

PITR allows you to restore your database to any point in time within the retention period.

**To enable PITR:**
1. Navigate to Settings > Database > Backups
2. Toggle "Point-in-Time Recovery" to ON
3. Confirm the retention period (7 days default)

**Note**: PITR is included in Pro plan but may incur additional storage costs for long retention periods.

### 4. Configure Backup Retention (Optional)

You can extend backup retention beyond 7 days:

**To configure retention:**
1. Go to Settings > Database > Backups
2. Click "Configure retention"
3. Select retention period:
   - 7 days (default)
   - 14 days
   - 30 days
   - Custom
4. Save changes

**Cost**: Extended retention may increase your monthly bill based on storage usage.

## Manual Backup (One-Time)

For critical operations (major migrations, production launch), create a manual backup:

**Via Supabase Dashboard:**
1. Go to Settings > Database > Backups
2. Click "Create backup"
3. Name the backup (e.g., "pre-launch-2025-11-16")
4. Wait for backup to complete (usually 2-5 minutes)

**Via CLI:**
```bash
# Using Supabase CLI
supabase db dump --db-url "$SUPABASE_DB_URL" > backup-$(date +%Y%m%d).sql

# Using pg_dump directly
pg_dump "$SUPABASE_DB_URL" > backup-$(date +%Y%m%d).sql
```

## Restore from Backup

### Restore from Automated Backup

**Via Supabase Dashboard:**
1. Go to Settings > Database > Backups
2. Find the backup you want to restore
3. Click "Restore" next to the backup
4. **WARNING**: This will overwrite your current database
5. Confirm the restore operation

**Via Point-in-Time Recovery:**
1. Go to Settings > Database > Backups
2. Click "Point-in-Time Recovery"
3. Select the date and time to restore to
4. Review the preview
5. Confirm the restore

### Restore from Manual Backup (SQL file)

```bash
# Using psql
psql "$SUPABASE_DB_URL" < backup-20251116.sql

# Using Supabase CLI
supabase db push --db-url "$SUPABASE_DB_URL" --file backup-20251116.sql
```

## Backup Verification

To ensure backups are working correctly, perform a monthly verification:

### 1. Check Backup Status

**Via Dashboard:**
1. Go to Settings > Database > Backups
2. Verify recent backups appear in the list
3. Check backup size (should be consistent)
4. Look for any error messages

**Via API:**
```bash
# Get backup status via Supabase Management API
curl -X GET \
  "https://api.supabase.com/v1/projects/gplahqjmrchogofyvzms/backups" \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN"
```

### 2. Test Restore (Quarterly)

**Best practice**: Perform a test restore quarterly to verify backups are valid.

**Steps:**
1. Create a separate test project in Supabase
2. Restore a recent backup to the test project
3. Verify data integrity
4. Run smoke tests on test project
5. Delete test project when done

## Backup Monitoring & Alerts

Set up monitoring to ensure backups are running successfully:

### 1. Enable Backup Notifications

**Via Supabase:**
1. Go to Settings > Notifications
2. Enable "Backup failed" notifications
3. Add email address for alerts

### 2. Monitor Backup Size

Track backup size over time to detect anomalies:

**Expected size growth:**
- Initial backup: ~10-50 MB (depending on data)
- Monthly growth: ~5-10% (with normal usage)

**Alert conditions:**
- Backup size suddenly drops by >50% (data loss?)
- Backup size grows by >200% (data corruption?)
- Backup fails 3 times in a row

## Disaster Recovery Plan

### Recovery Time Objective (RTO)

**Target**: 1 hour

- Detection: 5 minutes
- Incident response: 10 minutes
- Restore execution: 30 minutes
- Verification: 15 minutes

### Recovery Point Objective (RPO)

**Target**: 1 hour (with PITR)

- Automated backups: 24 hours (daily)
- Point-in-Time Recovery: 1 hour (continuous)
- Manual backups: As needed

### Disaster Scenarios

#### Scenario 1: Accidental Data Deletion

**Response:**
1. Immediately pause application (prevent further changes)
2. Identify the time before deletion
3. Use PITR to restore to that point
4. Verify data recovery
5. Resume application

**Estimated downtime**: 15-30 minutes

#### Scenario 2: Database Corruption

**Response:**
1. Identify the time of corruption
2. Restore from most recent valid backup
3. If corruption is recent, use PITR
4. Verify database integrity
5. Resume application

**Estimated downtime**: 30-60 minutes

#### Scenario 3: Complete Database Loss

**Response:**
1. Create new Supabase project
2. Restore from most recent automated backup
3. Update application connection strings
4. Run smoke tests
5. Resume application

**Estimated downtime**: 1-2 hours

#### Scenario 4: Supabase Outage

**Response:**
1. Monitor Supabase status page
2. Wait for Supabase to restore service
3. Verify data integrity after restoration
4. No action needed (Supabase handles it)

**Estimated downtime**: Depends on Supabase SLA (typically <1 hour)

## Backup Costs

**Supabase Pro Plan** ($25/month):
- 7 days of automated backups: Included
- 7 days of PITR: Included
- Extended retention (30 days): +$5-10/month
- Manual backups (stored in project): Included in storage quota

**Storage Costs**:
- First 8 GB: Included
- Additional storage: $0.125/GB/month

**Estimated monthly cost** (for EnvVault):
- Supabase Pro: $25
- Backups (7 days): $0 (included)
- PITR: $0 (included)
- **Total**: $25/month

## Checklist

### Initial Setup (One-Time)
- [ ] Upgrade to Supabase Pro plan
- [ ] Verify automated backups are enabled
- [ ] Enable Point-in-Time Recovery
- [ ] Configure backup retention (7 days minimum)
- [ ] Enable backup failure notifications
- [ ] Create initial manual backup

### Monthly Tasks
- [ ] Verify recent backups exist
- [ ] Check backup sizes for anomalies
- [ ] Review backup notification emails
- [ ] Update backup documentation if needed

### Quarterly Tasks
- [ ] Perform test restore in separate project
- [ ] Verify restored data integrity
- [ ] Update disaster recovery plan
- [ ] Review and adjust retention period

### Before Major Changes
- [ ] Create manual backup
- [ ] Document the change
- [ ] Verify backup completed successfully
- [ ] Proceed with change

## Support & Resources

- **Supabase Backup Docs**: https://supabase.com/docs/guides/database/backups
- **Supabase Support**: https://supabase.com/dashboard/support
- **Status Page**: https://status.supabase.com
- **Emergency Contact**: support@supabase.com

---

**Document Version**: 1.0
**Last Updated**: 2025-11-16
**Next Review**: 2025-12-16
