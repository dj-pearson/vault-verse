# EnvVault CLI Release Checklist

This checklist outlines what needs to be done before releasing the updated CLI to production.

## ✅ Completed Work

### Critical Fixes
- [x] Team management API functions (ListTeamMembers, GetUserByEmail)
- [x] Team list command shows real data
- [x] Team remove command fully functional
- [x] Project context parsing verified working

### High Priority Features
- [x] Backup & Restore commands
- [x] Audit log viewer
- [x] Configuration management
- [x] Secret history & versioning

### Critical Integrations
- [x] Audit logging in set/unset commands
- [x] History tracking in set command
- [x] Audit logging in env create/delete
- [x] Audit logging in init command
- [x] File import audit & history

---

## 🔴 Required Before Release

### 1. Backend Implementation (CRITICAL)

**Must implement these Supabase RPC functions:**

File: `BACKEND_RPC_FUNCTIONS.md` contains complete SQL code

- [ ] `list_team_members(p_project_id TEXT)` - Fetch team member list
- [ ] `get_user_by_email(p_email TEXT)` - Look up user ID by email
- [ ] Verify `invite_team_member` exists and works
- [ ] Verify `remove_team_member` exists and works

**Database Schema:**
- [ ] Ensure `project_members` table exists
- [ ] Apply RLS policies on `project_members`
- [ ] Grant execute permissions on RPC functions

**Testing:**
- [ ] Test each RPC function with sample data
- [ ] Verify permissions and access control
- [ ] Test error cases (user not found, access denied, etc.)

### 2. CLI Build & Testing

- [ ] Build CLI for all platforms (macOS, Linux, Windows, ARM)
  ```bash
  cd cli && make build-all
  ```
- [ ] Test new commands locally:
  - [ ] `envault backup --output test.enc`
  - [ ] `envault restore --input test.enc`
  - [ ] `envault audit`
  - [ ] `envault config show`
  - [ ] `envault history API_KEY` (after setting/updating a key)
- [ ] Test team commands (requires backend):
  - [ ] `envault team list`
  - [ ] `envault team invite user@example.com`
  - [ ] `envault team remove user@example.com`
- [ ] Verify audit logs are being created:
  ```bash
  envault set TEST_KEY=value
  envault audit  # Should show "secret_created"
  ```
- [ ] Verify history is being tracked:
  ```bash
  envault set API_KEY=value1
  envault set API_KEY=value2
  envault history API_KEY  # Should show v1 and v2
  ```

### 3. Documentation Updates

- [ ] Update `docs/CLI_REFERENCE.md` with new commands:
  - [ ] backup command
  - [ ] restore command
  - [ ] audit command
  - [ ] config command
  - [ ] history command
- [ ] Update main README.md with new features
- [ ] Add CHANGELOG entry for this release
- [ ] Update website documentation (if applicable)

### 4. Version Bump

- [ ] Update version in `cli/main.go` (e.g., "1.1.0")
- [ ] Update version in `cli/dist/npm/package.json`
- [ ] Update version in `cli/dist/homebrew/envault.rb`
- [ ] Tag the release in git:
  ```bash
  git tag -a v1.1.0 -m "Add backup, audit, config, and history features"
  git push origin v1.1.0
  ```

### 5. Distribution

- [ ] Build release binaries:
  ```bash
  cd cli && make build-all
  ```
- [ ] Create GitHub release with binaries
- [ ] Publish to npm:
  ```bash
  cd cli/dist/npm && npm publish
  ```
- [ ] Update Homebrew formula
- [ ] Test installation from each distribution channel

---

## 🟡 Recommended (Not Critical)

### Additional Testing
- [ ] Test on clean system without existing envault data
- [ ] Test migration from previous version
- [ ] Test with large projects (100+ secrets)
- [ ] Test backup/restore with multiple environments
- [ ] Stress test audit logs (1000+ operations)

### Security Review
- [ ] Code review of security-sensitive functions
- [ ] Verify encryption is working correctly in history
- [ ] Verify audit logs don't leak secret values
- [ ] Test permission checks in team commands
- [ ] Review error messages for information disclosure

### User Experience
- [ ] Add progress indicators for long operations (backup/restore)
- [ ] Improve error messages with actionable suggestions
- [ ] Add more examples to help text
- [ ] Consider adding `--dry-run` flags

---

## 📋 Quick Start Guide for Testing

### 1. Setup Test Environment

```bash
# Clone and checkout branch
git clone https://github.com/dj-pearson/vault-verse.git
cd vault-verse
git checkout claude/review-cli-management-01Af8Yc3ci4qMiN8B6jqHnoq

# Build CLI (may need network access for dependencies)
cd cli
go build -o envault

# Initialize test project
./envault init test-project
```

### 2. Test New Features

```bash
# Test audit logging
./envault set API_KEY=test123
./envault set DATABASE_URL=postgres://localhost
./envault audit  # Should show 2 create operations

# Test history tracking
./envault set API_KEY=updated456
./envault history API_KEY  # Should show 2 versions

# Test backup & restore
./envault backup --output test-backup.enc
./envault set TEMP_VAR=temporary
./envault restore --input test-backup.enc  # Should replace all secrets

# Test config management
./envault config show
./envault config set default_environment production
./envault config get default_environment
```

### 3. Test Team Features (Requires Backend)

```bash
# Login first
./envault login

# Team operations
./envault team list
./envault team invite teammate@example.com
./envault team remove teammate@example.com
```

---

## 🚦 Go/No-Go Criteria

### ✅ Ready to Release When:
1. All backend RPC functions are implemented and tested
2. CLI builds successfully for all platforms
3. All new commands work as expected
4. Audit logs are being created correctly
5. History tracking is working
6. Team commands function properly
7. Documentation is updated
8. Version is bumped appropriately

### 🛑 Do NOT Release If:
1. Backend RPC functions are not implemented (team features won't work)
2. CLI doesn't build
3. Audit logs are not being created (defeats the purpose of the feature)
4. History tracking is broken (data loss risk)
5. Any security issues are identified
6. Breaking changes are not documented

---

## 📊 What Changed (Summary)

### New Commands (5)
1. `envault backup` - Create encrypted backups
2. `envault restore` - Restore from backups
3. `envault audit` - View change history
4. `envault config` - Manage configuration
5. `envault history` - View secret versions

### Enhanced Commands (2)
1. `envault team list` - Now shows real data from API
2. `envault team remove` - Now fully functional

### Backend Requirements (2 New Functions)
1. `list_team_members(project_id)` - NEW
2. `get_user_by_email(email)` - NEW

### Files Modified
- **New**: 6 command files (backup, restore, audit, config, history)
- **Modified**: 5 files (team, set, unset, env, init)
- **Database**: Added secret_history table, audit log functions
- **Models**: Added TeamMember, SecretHistory

---

## 📞 Support & Issues

If you encounter issues during testing or release:

1. Check the detailed documentation:
   - `CLI_IMPROVEMENTS.md` - Feature documentation
   - `BACKEND_RPC_FUNCTIONS.md` - Backend implementation guide
   - This file - Release process

2. Common issues:
   - **Build fails**: Ensure Go 1.22+ is installed
   - **Team commands fail**: Backend RPC functions not implemented yet
   - **Audit logs empty**: Normal for existing projects (logs only new operations)
   - **History empty**: Normal until secrets are updated

3. Report issues on GitHub with:
   - CLI version (`envault --version`)
   - Command that failed
   - Full error message
   - Steps to reproduce

---

## 🎉 After Release

- [ ] Monitor for user feedback/issues
- [ ] Update website with new features
- [ ] Create blog post or announcement
- [ ] Update social media
- [ ] Monitor analytics for adoption
- [ ] Plan next iteration based on feedback

---

**Created**: 2025-01-18
**Branch**: `claude/review-cli-management-01Af8Yc3ci4qMiN8B6jqHnoq`
**Commits**:
- `eaab0b8` - Add critical fixes and high-priority management features
- `d6f9ab7` - Integrate audit logging and history tracking
