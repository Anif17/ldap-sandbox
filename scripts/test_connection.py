#!/usr/bin/env python3
"""
LDAP Connection Test Script
Demonstrates how to connect, authenticate, and search an LDAP directory.

Requirements:
    pip install ldap3

Usage:
    python test_connection.py
"""

from ldap3 import Server, Connection, ALL, SUBTREE
import sys


# LDAP Configuration
LDAP_HOST = "localhost"
LDAP_PORT = 389
LDAP_USE_SSL = False
BASE_DN = "dc=example,dc=com"
ADMIN_DN = "cn=admin,dc=example,dc=com"
ADMIN_PASSWORD = "admin123"


def get_connection(user_dn=None, password=None):
    """Create and return an LDAP connection."""
    server = Server(
        f"ldap://{LDAP_HOST}:{LDAP_PORT}",
        get_info=ALL
    )
    
    if user_dn and password:
        conn = Connection(server, user=user_dn, password=password, auto_bind=True)
    else:
        conn = Connection(server, auto_bind=True)  # Anonymous bind
    
    return conn


def test_admin_connection():
    """Test admin authentication."""
    print("=" * 60)
    print("TEST 1: Admin Connection")
    print("=" * 60)
    
    try:
        conn = get_connection(ADMIN_DN, ADMIN_PASSWORD)
        print(f"✅ Successfully connected as admin")
        print(f"   Server: {conn.server.host}")
        print(f"   User: {ADMIN_DN}")
        conn.unbind()
        return True
    except Exception as e:
        print(f"❌ Failed to connect: {e}")
        return False


def test_user_authentication(username, password):
    """Test user authentication."""
    print("\n" + "=" * 60)
    print(f"TEST 2: User Authentication - {username}")
    print("=" * 60)
    
    user_dn = f"cn={username},ou=users,{BASE_DN}"
    
    try:
        conn = get_connection(user_dn, password)
        print(f"✅ Authentication successful for {username}")
        conn.unbind()
        return True
    except Exception as e:
        print(f"❌ Authentication failed: {e}")
        return False


def search_all_users():
    """Search and list all users."""
    print("\n" + "=" * 60)
    print("TEST 3: Search All Users")
    print("=" * 60)
    
    try:
        conn = get_connection(ADMIN_DN, ADMIN_PASSWORD)
        
        # Search for all users
        conn.search(
            search_base=f"ou=users,{BASE_DN}",
            search_filter="(objectClass=inetOrgPerson)",
            search_scope=SUBTREE,
            attributes=['cn', 'mail', 'uid', 'displayName', 'title']
        )
        
        print(f"✅ Found {len(conn.entries)} users:\n")
        
        for entry in conn.entries:
            print(f"   👤 {entry.displayName}")
            print(f"      DN: {entry.entry_dn}")
            print(f"      Email: {entry.mail}")
            print(f"      UID: {entry.uid}")
            if hasattr(entry, 'title') and entry.title:
                print(f"      Title: {entry.title}")
            print()
        
        conn.unbind()
        return True
    except Exception as e:
        print(f"❌ Search failed: {e}")
        return False


def search_by_filter(search_filter):
    """Search with a custom filter."""
    print("\n" + "=" * 60)
    print(f"TEST 4: Custom Filter Search")
    print(f"Filter: {search_filter}")
    print("=" * 60)
    
    try:
        conn = get_connection(ADMIN_DN, ADMIN_PASSWORD)
        
        conn.search(
            search_base=BASE_DN,
            search_filter=search_filter,
            search_scope=SUBTREE,
            attributes=['cn', 'mail', 'objectClass']
        )
        
        print(f"✅ Found {len(conn.entries)} entries:\n")
        
        for entry in conn.entries:
            print(f"   📁 {entry.entry_dn}")
        
        conn.unbind()
        return True
    except Exception as e:
        print(f"❌ Search failed: {e}")
        return False


def list_groups():
    """List all groups and their members."""
    print("\n" + "=" * 60)
    print("TEST 5: List Groups")
    print("=" * 60)
    
    try:
        conn = get_connection(ADMIN_DN, ADMIN_PASSWORD)
        
        conn.search(
            search_base=f"ou=groups,{BASE_DN}",
            search_filter="(objectClass=groupOfNames)",
            search_scope=SUBTREE,
            attributes=['cn', 'description', 'member']
        )
        
        print(f"✅ Found {len(conn.entries)} groups:\n")
        
        for entry in conn.entries:
            print(f"   👥 {entry.cn}")
            print(f"      Description: {entry.description}")
            members = entry.member if hasattr(entry, 'member') else []
            print(f"      Members: {len(members)}")
            print()
        
        conn.unbind()
        return True
    except Exception as e:
        print(f"❌ Failed to list groups: {e}")
        return False


def check_group_membership(username, group_name):
    """Check if a user belongs to a specific group."""
    print("\n" + "=" * 60)
    print(f"TEST 6: Check Group Membership")
    print(f"User: {username}, Group: {group_name}")
    print("=" * 60)
    
    try:
        conn = get_connection(ADMIN_DN, ADMIN_PASSWORD)
        
        user_dn = f"cn={username},ou=users,{BASE_DN}"
        group_dn = f"cn={group_name},ou=groups,{BASE_DN}"
        
        conn.search(
            search_base=group_dn,
            search_filter=f"(member={user_dn})",
            search_scope=SUBTREE
        )
        
        if conn.entries:
            print(f"✅ {username} IS a member of {group_name}")
        else:
            print(f"ℹ️  {username} is NOT a member of {group_name}")
        
        conn.unbind()
        return True
    except Exception as e:
        print(f"❌ Check failed: {e}")
        return False


def main():
    """Run all tests."""
    print("\n🔐 LDAP Connection Test Suite")
    print("=" * 60)
    print(f"Server: ldap://{LDAP_HOST}:{LDAP_PORT}")
    print(f"Base DN: {BASE_DN}")
    print("=" * 60)
    
    # Run tests
    test_admin_connection()
    test_user_authentication("john.doe", "password123")
    search_all_users()
    search_by_filter("(uid=jane*)")
    list_groups()
    check_group_membership("jane.smith", "developers")
    
    print("\n" + "=" * 60)
    print("🏁 All tests completed!")
    print("=" * 60)


if __name__ == "__main__":
    main()
