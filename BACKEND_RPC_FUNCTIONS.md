# Backend RPC Functions for EnvVault CLI

This document contains the Supabase RPC (PostgreSQL) functions that need to be implemented for the EnvVault CLI to work with team features.

## Required RPC Functions

### 1. list_team_members

**Purpose**: Retrieve all team members for a project

**SQL Function**:
```sql
CREATE OR REPLACE FUNCTION list_team_members(p_project_id TEXT)
RETURNS TABLE (
    id TEXT,
    email TEXT,
    role TEXT,
    created_at TIMESTAMPTZ,
    user_id TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Verify the user has access to this project
    IF NOT EXISTS (
        SELECT 1 FROM project_members pm
        WHERE pm.project_id = p_project_id
        AND pm.user_id = auth.uid()
    ) THEN
        RAISE EXCEPTION 'Access denied to project';
    END IF;

    -- Return all team members for the project
    RETURN QUERY
    SELECT
        pm.id::TEXT,
        u.email::TEXT,
        pm.role::TEXT,
        pm.created_at,
        pm.user_id::TEXT
    FROM project_members pm
    JOIN auth.users u ON u.id = pm.user_id
    WHERE pm.project_id = p_project_id
    ORDER BY pm.created_at ASC;
END;
$$;
```

**Usage Example**:
```typescript
const { data, error } = await supabase.rpc('list_team_members', {
  p_project_id: 'project-uuid'
});
```

**Expected Response**:
```json
[
  {
    "id": "member-uuid",
    "email": "user@example.com",
    "role": "developer",
    "created_at": "2024-01-15T10:30:00Z",
    "user_id": "user-uuid"
  }
]
```

---

### 2. get_user_by_email

**Purpose**: Look up a user's ID by their email address (for team member removal)

**SQL Function**:
```sql
CREATE OR REPLACE FUNCTION get_user_by_email(p_email TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Look up user by email
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = p_email
    LIMIT 1;

    -- Return NULL if not found
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User with email % not found', p_email;
    END IF;

    RETURN v_user_id::TEXT;
END;
$$;
```

**Usage Example**:
```typescript
const { data, error } = await supabase.rpc('get_user_by_email', {
  p_email: 'user@example.com'
});
// Returns: "user-uuid"
```

---

### 3. invite_team_member (ALREADY EXISTS - verify implementation)

**Purpose**: Invite a user to join a project team

**Expected Signature**:
```sql
CREATE OR REPLACE FUNCTION invite_team_member(
    p_project_id TEXT,
    p_email TEXT,
    p_role TEXT
)
RETURNS TEXT  -- Returns the member ID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_member_id UUID;
BEGIN
    -- Verify caller is project admin
    IF NOT EXISTS (
        SELECT 1 FROM project_members pm
        WHERE pm.project_id = p_project_id
        AND pm.user_id = auth.uid()
        AND pm.role = 'admin'
    ) THEN
        RAISE EXCEPTION 'Only project admins can invite members';
    END IF;

    -- Get user ID from email
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = p_email;

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User with email % not found', p_email;
    END IF;

    -- Check if already a member
    IF EXISTS (
        SELECT 1 FROM project_members
        WHERE project_id = p_project_id
        AND user_id = v_user_id
    ) THEN
        RAISE EXCEPTION 'User is already a team member';
    END IF;

    -- Validate role
    IF p_role NOT IN ('viewer', 'developer', 'admin') THEN
        RAISE EXCEPTION 'Invalid role. Must be viewer, developer, or admin';
    END IF;

    -- Insert team member
    INSERT INTO project_members (id, project_id, user_id, role)
    VALUES (gen_random_uuid(), p_project_id, v_user_id, p_role)
    RETURNING id INTO v_member_id;

    RETURN v_member_id::TEXT;
END;
$$;
```

---

### 4. remove_team_member (ALREADY EXISTS - verify implementation)

**Purpose**: Remove a user from a project team

**Expected Signature**:
```sql
CREATE OR REPLACE FUNCTION remove_team_member(
    p_project_id TEXT,
    p_user_id TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Verify caller is project admin
    IF NOT EXISTS (
        SELECT 1 FROM project_members pm
        WHERE pm.project_id = p_project_id
        AND pm.user_id = auth.uid()
        AND pm.role = 'admin'
    ) THEN
        RAISE EXCEPTION 'Only project admins can remove members';
    END IF;

    -- Prevent removing yourself
    IF p_user_id::UUID = auth.uid() THEN
        RAISE EXCEPTION 'Cannot remove yourself from the project';
    END IF;

    -- Prevent removing the last admin
    IF (
        SELECT role FROM project_members
        WHERE project_id = p_project_id AND user_id = p_user_id::UUID
    ) = 'admin' THEN
        IF (
            SELECT COUNT(*) FROM project_members
            WHERE project_id = p_project_id AND role = 'admin'
        ) <= 1 THEN
            RAISE EXCEPTION 'Cannot remove the last admin';
        END IF;
    END IF;

    -- Remove the member
    DELETE FROM project_members
    WHERE project_id = p_project_id
    AND user_id = p_user_id::UUID;

    RETURN TRUE;
END;
$$;
```

---

## Database Schema Requirements

For these functions to work, you need the following tables:

### project_members table

```sql
CREATE TABLE project_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('viewer', 'developer', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(project_id, user_id)
);

-- Indexes
CREATE INDEX idx_project_members_project ON project_members(project_id);
CREATE INDEX idx_project_members_user ON project_members(user_id);
```

### Ensure projects table exists

```sql
-- The projects table should already exist from your existing schema
-- Just verify it has the necessary columns:
-- id, name, description, owner_id, created_at, updated_at, etc.
```

---

## Row Level Security (RLS) Policies

Enable RLS and create policies for the project_members table:

```sql
-- Enable RLS
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view members of projects they belong to
CREATE POLICY "Users can view team members of their projects"
ON project_members
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM project_members pm
        WHERE pm.project_id = project_members.project_id
        AND pm.user_id = auth.uid()
    )
);

-- Policy: Only admins can insert team members (handled by RPC function)
CREATE POLICY "Only RPC can insert team members"
ON project_members
FOR INSERT
WITH CHECK (false);  -- Only allow through RPC functions

-- Policy: Only admins can delete team members (handled by RPC function)
CREATE POLICY "Only RPC can delete team members"
ON project_members
FOR DELETE
USING (false);  -- Only allow through RPC functions
```

---

## Testing the Functions

### Test list_team_members

```sql
-- Test as a project member
SELECT * FROM list_team_members('your-project-id');
```

Expected output:
```
id                  | email              | role      | created_at          | user_id
--------------------+--------------------+-----------+---------------------+----------
abc-123...          | user@example.com   | admin     | 2024-01-15 10:30:00 | user-123...
def-456...          | dev@example.com    | developer | 2024-01-16 14:20:00 | user-456...
```

### Test get_user_by_email

```sql
SELECT get_user_by_email('user@example.com');
```

Expected output:
```
get_user_by_email
------------------
user-uuid-here
```

### Test invite_team_member

```typescript
const { data, error } = await supabase.rpc('invite_team_member', {
  p_project_id: 'project-uuid',
  p_email: 'newuser@example.com',
  p_role: 'developer'
});
```

### Test remove_team_member

```typescript
const { data, error } = await supabase.rpc('remove_team_member', {
  p_project_id: 'project-uuid',
  p_user_id: 'user-uuid-to-remove'
});
```

---

## Deployment Steps

1. **Create the project_members table** (if it doesn't exist)
2. **Enable RLS on project_members**
3. **Create the RLS policies**
4. **Create the RPC functions** in order:
   - `get_user_by_email`
   - `list_team_members`
   - `invite_team_member` (or verify existing)
   - `remove_team_member` (or verify existing)
5. **Test each function** with the test queries above
6. **Grant execute permissions** to authenticated users:

```sql
GRANT EXECUTE ON FUNCTION list_team_members(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_by_email(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION invite_team_member(TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION remove_team_member(TEXT, TEXT) TO authenticated;
```

---

## Security Considerations

1. **SECURITY DEFINER** - All functions run with the permissions of the function owner, not the caller
2. **Permission checks** - Each function verifies the caller has appropriate access
3. **Role validation** - Only valid roles (viewer, developer, admin) are allowed
4. **Self-protection** - Cannot remove yourself or the last admin
5. **RLS policies** - Enforce access control at the row level
6. **Input validation** - Email and UUID formats are validated

---

## Error Handling

The functions will raise exceptions for:
- Access denied (not a project member)
- User not found (invalid email)
- Already a member (duplicate invitation)
- Invalid role (not viewer/developer/admin)
- Cannot remove last admin
- Cannot remove yourself

These exceptions are caught by the CLI and displayed as user-friendly error messages.
