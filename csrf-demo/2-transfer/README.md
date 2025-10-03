# CSRF Vulnerability Transfer Function:

## Setup:

### Prerequisites:
- Node.js installed
- Python 3 

### Required Packages

1. npm install express express-session

## Testing Vulnerable Server

### Start Servers
1. node server_vulnerable.js
2. node attack.js

### Testing Attack

1. Go to http://localhost:3002/ and login with the following details:
Username : target
Password : password123

2. Visit http://localhost:3002/balance and note account balances 

3. Without closing the previous tab where you will now be signed in visit http://localhost:3003/
this will succesfully trigger the attack and result in a unauthorised transfer to take place.

4. To check that the attack was succesful visit http://localhost:3002/balance to view account balances

## Testing Secure Server

### Start Servers
Ensure previous nodes have been closed 

1. node server_mitigated.js
2. node attack.js

### Testing Attack
1. Go to http://localhost:3002/ and login in with the following details:
Username : target
Password : password123

2. Visit http://localhost:3002/balance and note account balances 

3. Without closing the previous tab where you will now be signed in visit http://localhost:3003/
this will not trigger the attack and wont result in an transaction.

4. To check that the attack failed visit http://localhost:3002/balance to view account balances

