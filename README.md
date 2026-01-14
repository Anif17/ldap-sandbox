# LDAP Testing Environment

A complete OpenLDAP setup using Docker for learning and testing LDAP integration.

## Quick Start

```bash
# Start the containers
docker-compose up -d

# Wait for OpenLDAP to initialize (about 30 seconds)
sleep 30

# Verify containers are running
docker ps
```

## Access

| Service | URL | Credentials |
|---------|-----|-------------|
| **LDAP** | `ldap://localhost:389` | `cn=admin,dc=example,dc=com` / `admin123` |
| **LDAPS** | `ldaps://localhost:636` | Same as above |
| **phpLDAPadmin** | http://localhost:8080 | Same as above |

## Directory Structure

```
dc=example,dc=com
├── ou=users           # User accounts
├── ou=groups          # Group definitions  
├── ou=services        # Service accounts
└── ou=departments
    ├── ou=engineering
    ├── ou=hr
    └── ou=finance
```

## Sample Users

| Username | Email | Password | Role |
|----------|-------|----------|------|
| `john.doe` | john.doe@example.com | `password123` | Developer |
| `jane.smith` | jane.smith@example.com | `password123` | Admin |
| `bob.wilson` | bob.wilson@example.com | `password123` | Read-only |
| `alice.hr` | alice.hr@example.com | `password123` | HR Manager |
| `svc.webapp` | svc.webapp@example.com | `service123` | Service Account |

## Command Line Testing

```bash
# Search all users
docker exec openldap ldapsearch -x -H ldap://localhost \
  -b "ou=users,dc=example,dc=com" \
  -D "cn=admin,dc=example,dc=com" \
  -w admin123 "(objectClass=inetOrgPerson)"

# Test user authentication
docker exec openldap ldapwhoami -x -H ldap://localhost \
  -D "cn=john.doe,ou=users,dc=example,dc=com" \
  -w password123

# List all groups
docker exec openldap ldapsearch -x -H ldap://localhost \
  -b "ou=groups,dc=example,dc=com" \
  -D "cn=admin,dc=example,dc=com" \
  -w admin123 "(objectClass=groupOfNames)" cn member
```

## Integration Scripts

### Python
```bash
pip install ldap3
python scripts/test_connection.py
```

### Node.js
```bash
npm install ldapjs
node scripts/test_connection.js
```

## LDAP Concepts

| Term | Description | Example |
|------|-------------|---------|
| **DN** | Distinguished Name (unique ID) | `cn=john.doe,ou=users,dc=example,dc=com` |
| **RDN** | Relative DN (leftmost) | `cn=john.doe` |
| **Base DN** | Root of directory | `dc=example,dc=com` |
| **Bind** | Authentication | Connect with DN + password |
| **Filter** | Search criteria | `(&(objectClass=person)(uid=john*))` |

## Common Filters

```ldap
# All users
(objectClass=inetOrgPerson)

# User by username
(uid=john.doe)

# Users in engineering (by mail domain pattern)
(&(objectClass=inetOrgPerson)(mail=*@example.com))

# All groups
(objectClass=groupOfNames)

# Members of developers group
(&(objectClass=groupOfNames)(cn=developers))
```

## Cleanup

```bash
# Stop containers
docker-compose down

# Remove all data (fresh start)
docker-compose down -v
```

## Troubleshooting

**Container won't start?**
```bash
docker-compose logs openldap
```

**LDIF files not loading?**
```bash
# Check if custom LDIF loaded
docker exec openldap ldapsearch -x -H ldap://localhost \
  -b "dc=example,dc=com" -D "cn=admin,dc=example,dc=com" \
  -w admin123 "(ou=users)"
```

**Reset everything:**
```bash
docker-compose down -v
docker-compose up -d
```
# LDAP-Trial
# LDAP-Trial
# LDAP-Trial
