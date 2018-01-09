const fs = require('fs');
const moment = require('moment');
const args = require('minimist')(process.argv.slice(2));

const Accounts = require('web3-eth-accounts');
const Utils = require('web3-utils');
const Web3Factory = require('../src/web3-factory');
const provider = 'https://api.myetherapi.com/eth';
let accounts = new Accounts(provider);
let web3Factory = new Web3Factory(provider);
web3 = web3Factory.createWeb3Eth();

if (!(args.from && args.from.length > 0)) {
    console.log('from is required');
    return;
}

if (!(args.to && args.to.length > 0)) {
    console.log('to is required');
    return;
}

if (!args.from.startsWith('0x')) {
    args.from = '0x' + args.from;
}
if (!args.to.startsWith('0x')) {
    args.to = '0x' + args.to;
}

let wallet = web3.eth.accounts.wallet.create();
wallet.add(args.from);
wallet.add(args.to);

let from = wallet[0];
let to = wallet[1];

if (!args.password) {
    console.log('password is required in order to save an encrypted wallet of the accounts involved in the transaction to disk');
    return;
}

if (!(args.amount === 'ALL' || args.amount > 0)) {
    console.log(`amount is required and must be greater than 0`);
    return;
}

let timestamp = moment().utc().format('YYYY-MM-DD-T-HH-mm-ss-SSS') + 'Z';
let encryptedWallet = wallet.encrypt(args.password);
let encryptedWalletFilename = `encrypted-wallet-${timestamp}.json`;
console.log('encrypted wallet with to and from accounts saved to ' + encryptedWalletFilename);
fs.writeFileSync(encryptedWalletFilename, JSON.stringify(encryptedWallet));

let txTransfer = {};
let gasPriceOut;
let gasLimitOut;
web3.eth.getBlockNumber()
    .then(latestBlockNumber => web3.eth.getBlock(latestBlockNumber))
    .then((latestBlock) => gasLimitOut = latestBlock.gasLimit)
    .then(() => args.amount === 'ALL'
        ? web3.eth.getBalance(from.address)
        : Promise.resolve(parseInt(args.amount)))
    .then((amount) => {
        txTransfer.from = from.address;
        txTransfer.to = to.address;
        txTransfer.value = amount;
        let rawData = (args['data-path'] && args['data-path'].length > 0)
            ? '/*' + moment().utc().toISOString() + '*/' + '\r\n' + fs.readFileSync(args['data-path'], 'utf8').toString()
            : moment().utc().toISOString();
        console.log(rawData);
        txTransfer.data = Utils.toHex(rawData);
    })
    .then(() => web3.eth.getGasPrice())
    .then((gasPrice) => gasPriceOut = gasPrice)
    .then(() => web3.eth.estimateGas(txTransfer))
    .then((gasEstimate) => {
        txTransfer.gas = gasEstimate;
        if (txTransfer.gas > gasLimitOut) {
            txTransfer.gas = gasLimitOut;
            console.log('gas limit reached ' + gasLimitOut);
        }
        console.log('gas ' + txTransfer.gas);
        console.log(`gas price ${Utils.fromWei(gasPriceOut)} ether`);
        let gasTxFees = txTransfer.gas * gasPriceOut;
        console.log(`tx fees ${Utils.fromWei(gasTxFees.toString(), 'ether')} ether`);
        txTransfer.value = txTransfer.value - gasTxFees;
        console.log(`Sending ${Utils.fromWei(txTransfer.value.toString(), 'ether')} ether with ${txTransfer.gas} gas from ${from.address}/${from.privateKey} to ${to.address}/${to.privateKey}`);
        return web3.eth.sendTransaction(txTransfer);
    })
    .then((receipt) => {
        console.log(receipt);
    })
    .catch((error) => console.log(error));
