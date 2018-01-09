const fs = require('fs');
const args = require('minimist')(process.argv.slice(2));
const Web3 = require('web3');
let web3 = new Web3();

let encryptedWallet = fs.readFileSync(args.path, 'utf8');
let wallet = web3.eth.accounts.wallet.decrypt(JSON.parse(encryptedWallet), args.password);

console.log(wallet);