#!/usr/bin/env node
/**
 * LDAP Connection Test Script (Node.js)
 * Demonstrates how to connect, authenticate, and search an LDAP directory.
 * 
 * Requirements:
 *     npm install ldapjs
 * 
 * Usage:
 *     node test_connection.js
 */

const ldap = require('ldapjs');

// LDAP Configuration
const config = {
    url: 'ldap://localhost:389',
    baseDN: 'dc=example,dc=com',
    adminDN: 'cn=admin,dc=example,dc=com',
    adminPassword: 'admin123'
};

/**
 * Create an LDAP client
 */
function createClient() {
    return ldap.createClient({
        url: config.url,
        timeout: 5000,
        connectTimeout: 10000
    });
}

/**
 * Bind (authenticate) to LDAP
 */
function bind(client, dn, password) {
    return new Promise((resolve, reject) => {
        client.bind(dn, password, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

/**
 * Search LDAP directory
 */
function search(client, baseDN, options) {
    return new Promise((resolve, reject) => {
        const entries = [];

        client.search(baseDN, options, (err, res) => {
            if (err) {
                reject(err);
                return;
            }

            res.on('searchEntry', (entry) => {
                entries.push(entry.object);
            });

            res.on('error', (err) => {
                reject(err);
            });

            res.on('end', () => {
                resolve(entries);
            });
        });
    });
}

/**
 * Test 1: Admin Connection
 */
async function testAdminConnection() {
    console.log('='.repeat(60));
    console.log('TEST 1: Admin Connection');
    console.log('='.repeat(60));

    const client = createClient();

    try {
        await bind(client, config.adminDN, config.adminPassword);
        console.log('✅ Successfully connected as admin');
        console.log(`   Server: ${config.url}`);
        console.log(`   User: ${config.adminDN}`);
        client.unbind();
        return true;
    } catch (err) {
        console.log(`❌ Failed to connect: ${err.message}`);
        client.destroy();
        return false;
    }
}

/**
 * Test 2: User Authentication
 */
async function testUserAuthentication(username, password) {
    console.log('\n' + '='.repeat(60));
    console.log(`TEST 2: User Authentication - ${username}`);
    console.log('='.repeat(60));

    const client = createClient();
    const userDN = `cn=${username},ou=users,${config.baseDN}`;

    try {
        await bind(client, userDN, password);
        console.log(`✅ Authentication successful for ${username}`);
        client.unbind();
        return true;
    } catch (err) {
        console.log(`❌ Authentication failed: ${err.message}`);
        client.destroy();
        return false;
    }
}

/**
 * Test 3: Search All Users
 */
async function searchAllUsers() {
    console.log('\n' + '='.repeat(60));
    console.log('TEST 3: Search All Users');
    console.log('='.repeat(60));

    const client = createClient();

    try {
        await bind(client, config.adminDN, config.adminPassword);

        const searchOptions = {
            filter: '(objectClass=inetOrgPerson)',
            scope: 'sub',
            attributes: ['cn', 'mail', 'uid', 'displayName', 'title']
        };

        const users = await search(client, `ou=users,${config.baseDN}`, searchOptions);

        console.log(`✅ Found ${users.length} users:\n`);

        users.forEach((user) => {
            console.log(`   👤 ${user.displayName || user.cn}`);
            console.log(`      DN: ${user.dn}`);
            console.log(`      Email: ${user.mail}`);
            console.log(`      UID: ${user.uid}`);
            if (user.title) {
                console.log(`      Title: ${user.title}`);
            }
            console.log();
        });

        client.unbind();
        return true;
    } catch (err) {
        console.log(`❌ Search failed: ${err.message}`);
        client.destroy();
        return false;
    }
}

/**
 * Test 4: Custom Filter Search
 */
async function searchByFilter(filter) {
    console.log('\n' + '='.repeat(60));
    console.log('TEST 4: Custom Filter Search');
    console.log(`Filter: ${filter}`);
    console.log('='.repeat(60));

    const client = createClient();

    try {
        await bind(client, config.adminDN, config.adminPassword);

        const searchOptions = {
            filter: filter,
            scope: 'sub',
            attributes: ['cn', 'mail', 'objectClass']
        };

        const entries = await search(client, config.baseDN, searchOptions);

        console.log(`✅ Found ${entries.length} entries:\n`);

        entries.forEach((entry) => {
            console.log(`   📁 ${entry.dn}`);
        });

        client.unbind();
        return true;
    } catch (err) {
        console.log(`❌ Search failed: ${err.message}`);
        client.destroy();
        return false;
    }
}

/**
 * Test 5: List Groups
 */
async function listGroups() {
    console.log('\n' + '='.repeat(60));
    console.log('TEST 5: List Groups');
    console.log('='.repeat(60));

    const client = createClient();

    try {
        await bind(client, config.adminDN, config.adminPassword);

        const searchOptions = {
            filter: '(objectClass=groupOfNames)',
            scope: 'sub',
            attributes: ['cn', 'description', 'member']
        };

        const groups = await search(client, `ou=groups,${config.baseDN}`, searchOptions);

        console.log(`✅ Found ${groups.length} groups:\n`);

        groups.forEach((group) => {
            console.log(`   👥 ${group.cn}`);
            console.log(`      Description: ${group.description}`);
            const members = Array.isArray(group.member) ? group.member : [group.member];
            console.log(`      Members: ${members.length}`);
            console.log();
        });

        client.unbind();
        return true;
    } catch (err) {
        console.log(`❌ Failed to list groups: ${err.message}`);
        client.destroy();
        return false;
    }
}

/**
 * Main function to run all tests
 */
async function main() {
    console.log('\n🔐 LDAP Connection Test Suite (Node.js)');
    console.log('='.repeat(60));
    console.log(`Server: ${config.url}`);
    console.log(`Base DN: ${config.baseDN}`);
    console.log('='.repeat(60));

    await testAdminConnection();
    await testUserAuthentication('john.doe', 'password123');
    await searchAllUsers();
    await searchByFilter('(uid=jane*)');
    await listGroups();

    console.log('\n' + '='.repeat(60));
    console.log('🏁 All tests completed!');
    console.log('='.repeat(60));
}

main().catch(console.error);
