const BigInteger = require('bn').BigInteger;
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

let gasPriceOut;
let gasLimitOut;
let data = Utils.toHex((args['data-path'] && args['data-path'].length > 0)
    ? '/*' + moment().utc().toISOString() + '*/' + '\r\n' + fs.readFileSync(args['data-path'], 'utf8').toString()
    : moment().utc().toISOString());
let amountOut;
web3.eth.getBlockNumber()
    .then(latestBlockNumber => web3.eth.getBlock(latestBlockNumber))
    .then((latestBlock) => gasLimitOut = latestBlock.gasLimit)
    .then(() => args.amount === 'ALL'
        ? web3.eth.getBalance(from.address)
        : Promise.resolve(parseInt(args.amount)))
    .then((amount) => amountOut = amount)
    .then(() => web3.eth.getGasPrice())
    .then((gasPrice) => gasPriceOut = gasPrice)
    .then(() => web3.eth.estimateGas({
        "from": from.address, "to": to.address,
        "value": amountOut, "data": data
    }))
    .then((gasEstimate) => {
        let tx = {
            "from": from.address, "to": to.address,
            "value": amountOut, "data": data, "gas": gasEstimate
        };
        console.log('max amount to send: ' + tx.value);
        if (tx.gas > gasLimitOut) {
            tx.gas = gasLimitOut;
            console.log('gas limit reached ' + gasLimitOut);
        }
        console.log('gas ' + tx.gas.toString());
        console.log(`gas price ${Utils.fromWei(gasPriceOut)} ether`);
        let bigGasPrice = new BigInteger(gasPriceOut);
        let bigGas = new BigInteger(tx.gas.toString());
        let gasTxFees = bigGas.multiply(bigGasPrice);
        console.log(`tx fees ${Utils.fromWei(gasTxFees.toString(), 'ether')} ether`);
        tx.value = tx.value - gasTxFees;
        tx.value -= 1000; //  Calculation was correct (confirmed by remaining balance), but protocol doesn't allow this to be a perfect zero balance in one transaction.
        console.log(`Sending ${Utils.fromWei(tx.value.toString(), 'ether')} ether with ${tx.gas} gas from ${from.address}/${from.privateKey} to ${to.address}/${to.privateKey}`);
        return web3.eth.sendTransaction(tx);
    })
    .then((receipt) => {
        console.log(receipt);
    })
    .catch((error) => console.log(error));
