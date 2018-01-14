const BigInteger = require('bn').BigInteger;
const fs = require('fs');
const args = require('minimist')(process.argv.slice(2));
const Tx = require('ethereumjs-tx');
const Web3 = require('web3');
const Eth = require('web3-eth');
const Accounts = require('web3-eth-accounts');
const Utils = require('web3-utils');

const Timestamp = require('../src/timestamp');
const timestamp2 = new Timestamp();
const EthClient = require('../src/eth-client');

const provider = 'https://api.myetherapi.com/eth';

let accounts = new Accounts(provider);
let web3 = new Web3(provider);
let eth = new Eth(provider);
let ethClient = new EthClient(provider);

if (!args.from) {
    args.from = process.env.ether_private_key;
}

if (!args.to) {
    args.to = process.env.ether_private_key_2;
}

if (!(args.from && args.from.length > 0)) {
    console.log('from is required');
    return;
}

if (!(args.to && args.to.length > 0)) {
    console.log('to is required');
    return;
}

const privateKeyFrom = new Buffer(args.from, 'hex');
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

if (args.password !== args['repeat-password']) {
    console.log('password and repeat-password don\'t match');
    return;
}

if (!(args.amount === 'ALL' || args.amount > 0)) {
    console.log(`amount is required and must be greater than 0`);
    return;
}

let encryptedWallet = wallet.encrypt(args.password);
let encryptedWalletFilename = `encrypted-wallet-${timestamp2.getTimestamp()}.json`;
console.log('encrypted wallet with to and from accounts saved to ' + encryptedWalletFilename);
fs.writeFileSync(encryptedWalletFilename, JSON.stringify(encryptedWallet));

let gasPriceOut;
let gasLimitOut;
let data = Utils.toHex((args['data-path'] && args['data-path'].length > 0)
    ? '/*' + timestamp2.getTimestamp() + '*/' + '\r\n' + fs.readFileSync(args['data-path'], 'utf8').toString()
    : timestamp2.getTimestamp());
let amountOut;
web3.eth.getBlockNumber()
    .then(latestBlockNumber => web3.eth.getBlock(latestBlockNumber))
    .then((latestBlock) => gasLimitOut = latestBlock.gasLimit)
    .then(() => args.amount === 'ALL'
        ? ethClient.promiseToGetBalance(from.address)
            .then((balance) => parseInt(balance.result, 16)) // from hex
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
        console.log(`amount to send (minus transaction fees): ${tx.value} wei`);
        if (tx.gas > gasLimitOut) {
            tx.gas = gasLimitOut;
            console.log('gas limit reached ' + gasLimitOut);
        }
        console.log('gas ' + tx.gas.toString());
        console.log(`gas price ${Utils.fromWei(gasPriceOut)} ether`);
        let bigGasPrice = new BigInteger(gasPriceOut);
        let bigGas = new BigInteger(tx.gas.toString());
        let gasTxFees = bigGas.multiply(bigGasPrice);
        console.log(`transaction fees ${Utils.fromWei(gasTxFees.toString(), 'ether')} ether`);
        tx.value = tx.value - gasTxFees;
        tx.value -= 1000; //  Calculation was correct (confirmed by remaining balance), but protocol doesn't allow this to be a perfect zero balance in one transaction.
        if (tx.value < 1) {
            return Promise.reject('Can\'t send negative amount ' + tx.value);
        }
        console.log(`Sending ${Utils.fromWei(tx.value.toString(), 'ether')} ether with ${tx.gas} gas from ${from.address}/${from.privateKey} to ${to.address}/${to.privateKey}`);
        let nonce = 0;
        let rawTx = {
            "gasPrice": '0x' + parseInt(gasPriceOut).toString(16),
            "gasLimit": '0x' + parseInt(gasLimitOut).toString(16),
            "from": tx.from,
            "to": tx.to,
            "value": '0x' + tx.value.toString(16),
            "data": tx.data,
            "nonce": '0x' + nonce.toString(16),
            "chainId": 1
        };
        console.log(rawTx);
        let fromRawTx = new Tx(rawTx);
        fromRawTx.sign(privateKeyFrom);
        let serializedTx = '0x' + fromRawTx.serialize().toString('hex');
        console.log('signed transaction ' + serializedTx);
        return web3.eth.sendSignedTransaction(serializedTx);
    })
    .then((receipt) => {
        console.log(receipt);
    })
    .catch((error) => {
        console.log('failed');
        console.log(error);
    });
